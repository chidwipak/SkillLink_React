const fs = require('fs');
const path = require('path');

const LOG_LEVELS = { ERROR: 0, WARN: 1, INFO: 2, DEBUG: 3 };

const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m'
};

let currentLogLevel = LOG_LEVELS[process.env.LOG_LEVEL] || LOG_LEVELS.INFO;

const LOG_DIR = path.join(process.cwd(), 'logs');
const ACCESS_LOG = path.join(LOG_DIR, 'access.log');
const ERROR_LOG = path.join(LOG_DIR, 'error.log');

const ensureLogDir = () => {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
};

const getTimestamp = () => new Date().toISOString();

const getMethodColor = (method) => {
  const colors = { GET: COLORS.green, POST: COLORS.blue, PUT: COLORS.yellow, PATCH: COLORS.yellow, DELETE: COLORS.red };
  return colors[method] || COLORS.gray;
};

const getStatusColor = (status) => {
  if (status >= 500) return COLORS.red;
  if (status >= 400) return COLORS.yellow;
  if (status >= 300) return COLORS.cyan;
  return COLORS.green;
};

const formatConsoleLog = (entry) => {
  const methodColor = getMethodColor(entry.method);
  const statusColor = getStatusColor(entry.statusCode);
  return `${COLORS.gray}[${entry.timestamp}]${COLORS.reset} ${methodColor}${entry.method}${COLORS.reset} ${entry.url} ${statusColor}${entry.statusCode}${COLORS.reset} ${COLORS.cyan}${entry.duration}ms${COLORS.reset}${entry.userId ? ` (User: ${entry.userId})` : ''}`;
};

const formatFileLog = (entry) => JSON.stringify(entry) + '\n';

const writeToFile = (filePath, content) => {
  try {
    ensureLogDir();
    fs.appendFileSync(filePath, content);
  } catch (error) {
    console.error('Failed to write to log file:', error.message);
  }
};

const generateRequestId = () => `${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 9)}`;

const requestLogger = (options = {}) => {
  const logToConsole = options.console !== false;
  const logToFile = options.file || process.env.NODE_ENV === 'production';
  
  return (req, res, next) => {
    const startTime = Date.now();
    const requestId = generateRequestId();
    
    req.requestId = requestId;
    res.setHeader('X-Request-Id', requestId);
    
    const originalEnd = res.end.bind(res);
    
    res.end = function(...args) {
      const duration = Date.now() - startTime;
      
      const logEntry = {
        requestId,
        timestamp: getTimestamp(),
        method: req.method,
        url: req.originalUrl || req.url,
        statusCode: res.statusCode,
        duration,
        ip: req.ip || req.connection?.remoteAddress,
        userAgent: req.get('User-Agent'),
        userId: req.user?.userId || null,
        contentLength: res.get('Content-Length') || 0
      };
      
      if (logToConsole) console.log(formatConsoleLog(logEntry));
      if (logToFile) writeToFile(ACCESS_LOG, formatFileLog(logEntry));
      
      return originalEnd.apply(this, args);
    };
    
    next();
  };
};

const sanitizeBody = (body) => {
  if (!body) return {};
  const sensitiveFields = ['password', 'token', 'secret', 'creditCard', 'cvv'];
  const sanitized = { ...body };
  sensitiveFields.forEach(field => {
    if (sanitized[field]) sanitized[field] = '[REDACTED]';
  });
  return sanitized;
};

const logError = (err, req) => {
  const errorEntry = {
    timestamp: getTimestamp(),
    requestId: req?.requestId || 'unknown',
    method: req?.method || 'unknown',
    url: req?.originalUrl || req?.url || 'unknown',
    error: { message: err?.message || 'Unknown error', stack: err?.stack, code: err?.code || 'INTERNAL_ERROR' },
    userId: req?.user?.userId || null,
    body: sanitizeBody(req?.body)
  };
  
  console.error(`${COLORS.red}[ERROR]${COLORS.reset}`, err?.message || 'Unknown error');
  writeToFile(ERROR_LOG, formatFileLog(errorEntry));
};

const errorLogger = (options = {}) => {
  if (options instanceof Error) {
    const err = options;
    return (req, res, next) => {
      logError(err, req);
      next(err);
    };
  }
  return (err, req, res, next) => {
    logError(err, req);
    next(err);
  };
};

const debugLogger = (req, res, next) => {
  if (currentLogLevel < LOG_LEVELS.DEBUG) return next();
  console.log(`${COLORS.gray}──────────────────────────────────────${COLORS.reset}`);
  console.log(`${COLORS.cyan}[DEBUG] Request Details${COLORS.reset}`);
  console.log(`  Method: ${req.method}`);
  console.log(`  URL: ${req.originalUrl}`);
  console.log(`  Headers:`, JSON.stringify(req.headers, null, 2));
  console.log(`  Query:`, req.query);
  console.log(`  Body:`, sanitizeBody(req.body));
  console.log(`${COLORS.gray}──────────────────────────────────────${COLORS.reset}`);
  next();
};

const createLogger = (prefix = 'APP') => {
  return {
    error: (message, data = {}) => {
      if (currentLogLevel >= LOG_LEVELS.ERROR) {
        console.error(`${COLORS.red}[${prefix}:ERROR]${COLORS.reset}`, message, data);
        writeToFile(ERROR_LOG, formatFileLog({ level: 'ERROR', prefix, message, data, timestamp: getTimestamp() }));
      }
    },
    warn: (message, data = {}) => {
      if (currentLogLevel >= LOG_LEVELS.WARN) console.warn(`${COLORS.yellow}[${prefix}:WARN]${COLORS.reset}`, message, data);
    },
    info: (message, data = {}) => {
      if (currentLogLevel >= LOG_LEVELS.INFO) console.log(`${COLORS.blue}[${prefix}:INFO]${COLORS.reset}`, message, data);
    },
    debug: (message, data = {}) => {
      if (currentLogLevel >= LOG_LEVELS.DEBUG) console.log(`${COLORS.gray}[${prefix}:DEBUG]${COLORS.reset}`, message, data);
    }
  };
};

const setLogLevel = (level) => {
  if (LOG_LEVELS[level] !== undefined) currentLogLevel = LOG_LEVELS[level];
};

const deliveryLogger = createLogger('DELIVERY');

const logDeliveryStatus = (orderId, status, details = {}) => {
  const entry = { timestamp: getTimestamp(), orderId, status, ...details };
  deliveryLogger.info(`Order ${orderId} status changed to ${status}`, details);
  writeToFile(path.join(LOG_DIR, 'delivery.log'), formatFileLog(entry));
};

const logLocationUpdate = (deliveryPersonId, location) => {
  deliveryLogger.debug(`Location update for ${deliveryPersonId}`, location);
};

module.exports = {
  requestLogger,
  errorLogger,
  debugLogger,
  createLogger,
  setLogLevel,
  deliveryLogger,
  logDeliveryStatus,
  logLocationUpdate,
  generateRequestId,
  LOG_LEVELS
};
