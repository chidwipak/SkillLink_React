class ApiError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR', details = null) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
  
  static badRequest(message, details = null) {
    return new ApiError(message, 400, 'BAD_REQUEST', details);
  }
  
  static unauthorized(message = 'Unauthorized access') {
    return new ApiError(message, 401, 'UNAUTHORIZED');
  }
  
  static forbidden(message = 'Access forbidden') {
    return new ApiError(message, 403, 'FORBIDDEN');
  }
  
  static notFound(resource = 'Resource') {
    return new ApiError(`${resource} not found`, 404, 'NOT_FOUND');
  }
  
  static conflict(message = 'Resource conflict') {
    return new ApiError(message, 409, 'CONFLICT');
  }
  
  static validation(errors) {
    return new ApiError('Validation failed', 422, 'VALIDATION_ERROR', errors);
  }
  
  static tooManyRequests(message = 'Too many requests') {
    return new ApiError(message, 429, 'RATE_LIMITED');
  }
  
  static internal(message = 'Internal server error') {
    return new ApiError(message, 500, 'INTERNAL_ERROR');
  }
  
  static serviceUnavailable(message = 'Service temporarily unavailable') {
    return new ApiError(message, 503, 'SERVICE_UNAVAILABLE');
  }
}

const ERROR_CODES = {
  INVALID_CREDENTIALS: { status: 401, message: 'Invalid credentials' },
  TOKEN_EXPIRED: { status: 401, message: 'Token has expired' },
  TOKEN_INVALID: { status: 401, message: 'Invalid token' },
  INSUFFICIENT_PERMISSIONS: { status: 403, message: 'Insufficient permissions' },
  ROLE_REQUIRED: { status: 403, message: 'Required role not assigned' },
  USER_NOT_FOUND: { status: 404, message: 'User not found' },
  ORDER_NOT_FOUND: { status: 404, message: 'Order not found' },
  DELIVERY_NOT_FOUND: { status: 404, message: 'Delivery not found' },
  SERVICE_NOT_FOUND: { status: 404, message: 'Service not found' },
  PRODUCT_NOT_FOUND: { status: 404, message: 'Product not found' },
  INVALID_INPUT: { status: 400, message: 'Invalid input data' },
  MISSING_REQUIRED_FIELD: { status: 400, message: 'Missing required field' },
  INVALID_ID_FORMAT: { status: 400, message: 'Invalid ID format' },
  ORDER_ALREADY_ASSIGNED: { status: 409, message: 'Order already assigned' },
  DELIVERY_IN_PROGRESS: { status: 409, message: 'Delivery already in progress' },
  CANNOT_CANCEL: { status: 400, message: 'Cannot cancel at this stage' },
  DATABASE_ERROR: { status: 500, message: 'Database operation failed' },
  EXTERNAL_SERVICE_ERROR: { status: 502, message: 'External service error' }
};

const createError = (code, details = null) => {
  const errorDef = ERROR_CODES[code] || ERROR_CODES.INTERNAL_ERROR;
  return new ApiError(errorDef.message, errorDef.status, code, details);
};

const handleMongoError = (error) => {
  if (error.name === 'ValidationError') {
    const errors = Object.values(error.errors).map(e => ({
      field: e.path,
      message: e.message
    }));
    return ApiError.validation(errors);
  }
  
  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern || {})[0];
    return new ApiError(`${field || 'Field'} already exists`, 409, 'DUPLICATE_KEY', { field });
  }
  
  if (error.name === 'CastError') {
    return ApiError.badRequest(`Invalid ${error.path}: ${error.value}`);
  }
  
  return ApiError.internal('Database error occurred');
};

const handleJwtError = (error) => {
  if (error.name === 'TokenExpiredError') {
    return new ApiError('Token has expired', 401, 'TOKEN_EXPIRED');
  }
  if (error.name === 'JsonWebTokenError') {
    return new ApiError('Invalid token', 401, 'TOKEN_INVALID');
  }
  return ApiError.unauthorized('Authentication failed');
};

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'An unexpected error occurred';
  let code = err.code || 'INTERNAL_ERROR';
  let details = err.details || null;
  
  if (err.name === 'ValidationError') {
    const mongoError = handleMongoError(err);
    statusCode = mongoError.statusCode;
    message = mongoError.message;
    code = mongoError.code;
    details = mongoError.details;
  }
  
  if (err.name === 'TokenExpiredError' || err.name === 'JsonWebTokenError') {
    const jwtError = handleJwtError(err);
    statusCode = jwtError.statusCode;
    message = jwtError.message;
    code = jwtError.code;
  }
  
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
    code = 'INVALID_ID';
  }
  
  if (statusCode >= 500 || process.env.NODE_ENV !== 'production') {
    console.error(`[ERROR] ${code}: ${message}`);
    if (err.stack && process.env.NODE_ENV !== 'production') {
      console.error(err.stack);
    }
  }
  
  const response = {
    success: false,
    error: { code, message }
  };
  
  if (details) {
    response.error.details = details;
  }
  
  if (process.env.NODE_ENV === 'development' && err.stack) {
    response.error.stack = err.stack.split('\n');
  }
  
  if (req.requestId) {
    response.error.requestId = req.requestId;
  }
  
  res.status(statusCode).json(response);
};

const notFoundHandler = (req, res, next) => {
  const error = ApiError.notFound(`Route ${req.method} ${req.originalUrl}`);
  next(error);
};

const catchAsync = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

const deliveryErrors = {
  notAssigned: () => new ApiError('No delivery person assigned', 400, 'NOT_ASSIGNED'),
  alreadyDelivered: () => new ApiError('Order already delivered', 400, 'ALREADY_DELIVERED'),
  invalidStatus: (current, expected) => new ApiError(
    `Invalid status transition from ${current} to ${expected}`, 400, 'INVALID_STATUS_TRANSITION'
  ),
  outOfRange: () => new ApiError('Delivery person out of service range', 400, 'OUT_OF_RANGE'),
  deliveryPersonBusy: () => new ApiError('Delivery person is currently busy', 409, 'DELIVERY_PERSON_BUSY')
};

const validateObjectId = (paramName = 'id') => {
  return (req, res, next) => {
    const id = req.params[paramName];
    if (!id || !/^[a-fA-F0-9]{24}$/.test(id)) {
      return next(ApiError.badRequest(`Invalid ${paramName} format`));
    }
    next();
  };
};

module.exports = {
  ApiError,
  createError,
  errorHandler,
  notFoundHandler,
  catchAsync,
  handleMongoError,
  handleJwtError,
  deliveryErrors,
  validateObjectId,
  ERROR_CODES
};
