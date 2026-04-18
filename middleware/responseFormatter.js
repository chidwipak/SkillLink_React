const successResponse = (res, data, message = null, statusCode = 200, meta = null) => {
  const response = {
    success: true,
    timestamp: new Date().toISOString()
  };
  
  if (message) response.message = message;
  if (data !== undefined) response.data = data;
  if (meta) response.meta = meta;
  
  return res.status(statusCode).json(response);
};

const errorResponse = (res, message, statusCode = 400, code = 'ERROR', details = null) => {
  const response = {
    success: false,
    timestamp: new Date().toISOString(),
    error: { code, message }
  };
  
  if (details) response.error.details = details;
  
  return res.status(statusCode).json(response);
};

const paginatedResponse = (res, data, pagination, message = null) => {
  const { page, limit, total } = pagination;
  const totalPages = Math.ceil(total / limit);
  
  return res.status(200).json({
    success: true,
    timestamp: new Date().toISOString(),
    message,
    data,
    meta: {
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    }
  });
};

const createdResponse = (res, data, message = 'Resource created successfully') => {
  return successResponse(res, data, message, 201);
};

const updatedResponse = (res, data, message = 'Resource updated successfully') => {
  return successResponse(res, data, message, 200);
};

const deletedResponse = (res, message = 'Resource deleted successfully') => {
  return successResponse(res, null, message, 200);
};

const noContentResponse = (res) => {
  return res.status(204).send();
};

const responseFormatter = (req, res, next) => {
  res.success = (data, message, statusCode = 200, meta = null) => {
    return successResponse(res, data, message, statusCode, meta);
  };
  
  res.error = (message, statusCode = 400, code = 'ERROR', details = null) => {
    return errorResponse(res, message, statusCode, code, details);
  };
  
  res.paginated = (data, pagination, message = null) => {
    return paginatedResponse(res, data, pagination, message);
  };
  
  res.created = (data, message) => createdResponse(res, data, message);
  res.updated = (data, message) => updatedResponse(res, data, message);
  res.deleted = (message) => deletedResponse(res, message);
  res.noContent = () => noContentResponse(res);
  
  next();
};

const transformResponse = (req, res, next) => {
  const originalJson = res.json.bind(res);
  
  res.json = (body) => {
    if (body && typeof body === 'object' && 'success' in body) {
      return originalJson(body);
    }
    
    const formattedResponse = {
      success: res.statusCode < 400,
      timestamp: new Date().toISOString()
    };
    
    if (res.statusCode < 400) {
      formattedResponse.data = body;
    } else {
      formattedResponse.error = {
        code: 'ERROR',
        message: body.message || body.error || 'An error occurred'
      };
    }
    
    return originalJson(formattedResponse);
  };
  
  next();
};

const addResponseHeaders = (req, res, next) => {
  res.setHeader('X-API-Version', '1.0');
  res.setHeader('X-Request-Id', Date.now().toString(36) + Math.random().toString(36).substr(2));
  res.setHeader('X-Response-Time-Start', Date.now().toString());
  next();
};

const sanitizeResponse = (sensitiveFields = ['password', 'token', '__v', 'refreshToken']) => {
  return (req, res, next) => {
    const originalJson = res.json.bind(res);
    
    res.json = (body) => {
      const sanitize = (obj) => {
        if (Array.isArray(obj)) return obj.map(sanitize);
        
        if (obj && typeof obj === 'object') {
          const sanitized = {};
          for (const key of Object.keys(obj)) {
            if (!sensitiveFields.includes(key)) {
              sanitized[key] = sanitize(obj[key]);
            }
          }
          return sanitized;
        }
        return obj;
      };
      
      return originalJson(sanitize(body));
    };
    
    next();
  };
};

const dashboardResponse = (res, stats, recentItems = [], meta = {}) => {
  return res.status(200).json({
    success: true,
    timestamp: new Date().toISOString(),
    data: {
      statistics: stats,
      recentActivity: recentItems
    },
    meta: {
      ...meta,
      lastUpdated: new Date().toISOString()
    }
  });
};

module.exports = {
  responseFormatter,
  transformResponse,
  successResponse,
  errorResponse,
  paginatedResponse,
  createdResponse,
  updatedResponse,
  deletedResponse,
  noContentResponse,
  addResponseHeaders,
  sanitizeResponse,
  dashboardResponse
};
