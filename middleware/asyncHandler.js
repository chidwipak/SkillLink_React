const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

const asyncHandlerWithError = (fn, errorHandler) => {
  return async (req, res, next) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      if (errorHandler) {
        errorHandler(error, req, res, next);
      } else {
        next(error);
      }
    }
  };
};

const asyncHandlerWithTimeout = (fn, timeout = 30000) => {
  return async (req, res, next) => {
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Request timeout after ${timeout}ms`));
      }, timeout);
    });

    try {
      await Promise.race([fn(req, res, next), timeoutPromise]);
    } catch (error) {
      if (error.message.includes('timeout')) {
        res.status(503).json({
          success: false,
          error: {
            code: 'TIMEOUT',
            message: 'Request timed out. Please try again.'
          }
        });
      } else {
        next(error);
      }
    }
  };
};

const asyncHandlerWithRetry = (fn, options = {}) => {
  const maxRetries = options.maxRetries || 3;
  const delay = options.delay || 1000;
  const backoff = options.backoff || 2;
  
  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
  
  return async (req, res, next) => {
    let lastError;
    let currentDelay = delay;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await fn(req, res, next);
        return;
      } catch (error) {
        lastError = error;
        
        if (error.statusCode && error.statusCode >= 400 && error.statusCode < 500) {
          break;
        }
        
        console.warn(`Attempt ${attempt}/${maxRetries} failed:`, error.message);
        
        if (attempt < maxRetries) {
          await sleep(currentDelay);
          currentDelay *= backoff;
        }
      }
    }
    
    next(lastError);
  };
};

const asyncHandlerWithLog = (fn, operationName = null) => {
  return async (req, res, next) => {
    const name = operationName || `${req.method} ${req.path}`;
    const startTime = Date.now();
    
    try {
      await fn(req, res, next);
      const duration = Date.now() - startTime;
      console.log(`[${name}] completed in ${duration}ms`);
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`[${name}] failed after ${duration}ms:`, error.message);
      next(error);
    }
  };
};

const asyncHandlerWithTransaction = (fn) => {
  return async (req, res, next) => {
    const mongoose = require('mongoose');
    const session = await mongoose.startSession();
    
    try {
      session.startTransaction();
      await fn(req, res, session);
      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      next(error);
    } finally {
      session.endSession();
    }
  };
};

const wrapRouter = (router) => {
  const methods = ['get', 'post', 'put', 'patch', 'delete'];
  
  methods.forEach(method => {
    const original = router[method].bind(router);
    router[method] = (path, ...handlers) => {
      const wrappedHandlers = handlers.map(handler => {
        if (handler.constructor.name === 'AsyncFunction') {
          return asyncHandler(handler);
        }
        return handler;
      });
      return original(path, ...wrappedHandlers);
    };
  });
  
  return router;
};

const batchAsync = async (operations, options = {}) => {
  const continueOnError = options.continueOnError || false;
  const results = [];
  const errors = [];
  
  for (let i = 0; i < operations.length; i++) {
    try {
      const result = await operations[i]();
      results.push({ index: i, success: true, result });
    } catch (error) {
      errors.push({ index: i, error: error.message });
      if (!continueOnError) throw error;
    }
  }
  
  return { results, errors };
};

const parallelAsync = async (operations, options = {}) => {
  const maxConcurrency = options.maxConcurrency || 10;
  const results = [];
  
  for (let i = 0; i < operations.length; i += maxConcurrency) {
    const batch = operations.slice(i, i + maxConcurrency);
    const batchResults = await Promise.allSettled(batch.map(op => op()));
    results.push(...batchResults);
  }
  
  return results.map((result, index) => ({
    index,
    success: result.status === 'fulfilled',
    result: result.status === 'fulfilled' ? result.value : null,
    error: result.status === 'rejected' ? result.reason.message : null
  }));
};

module.exports = {
  asyncHandler,
  asyncHandlerWithError,
  asyncHandlerWithTimeout,
  asyncHandlerWithRetry,
  asyncHandlerWithLog,
  asyncHandlerWithTransaction,
  wrapRouter,
  batchAsync,
  parallelAsync
};
