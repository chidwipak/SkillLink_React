const { cacheGet, cacheSet, cacheDel, getCacheInfo, isConnected } = require("../utils/redisClient");

// In-memory fallback store (used when Redis unavailable and for backward compat)
const cacheStore = new Map();

const cacheStats = {
  hits: 0,
  misses: 0,
  size: 0
};

const generateCacheKey = (req, options = {}) => {
  const parts = ['cache', req.method, req.originalUrl || req.url];
  if (options.perUser && req.user) {
    parts.push(`user:${req.user.userId}`);
  }
  if (options.varyByQuery && req.query) {
    const queryString = JSON.stringify(req.query);
    parts.push(`query:${queryString}`);
  }
  return parts.join(':');
};

const cacheResponse = (options = {}) => {
  const defaultTTL = options.ttl || 5 * 60 * 1000; // ms
  const ttlSeconds = Math.round((options.ttl || defaultTTL) / 1000);
  
  return async (req, res, next) => {
    if (req.method !== 'GET') {
      return next();
    }
    
    if (req.user && !options.cacheAuthenticated) {
      return next();
    }
    
    const cacheKey = generateCacheKey(req, options);
    
    try {
      const cached = await cacheGet(cacheKey);
      
      if (cached) {
        cacheStats.hits++;
        res.setHeader('X-Cache', 'HIT');
        res.setHeader('X-Cache-Backend', isConnected() ? 'redis' : 'memory');
        res.setHeader('X-Cache-Age', Math.round((Date.now() - (cached.timestamp || Date.now())) / 1000));
        return res.status(cached.statusCode || 200).json(cached.body);
      }
    } catch (err) {
      // Cache miss or error, continue
    }
    
    cacheStats.misses++;
    const originalJson = res.json.bind(res);
    
    res.json = (body) => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const cacheData = {
          body,
          statusCode: res.statusCode,
          timestamp: Date.now()
        };
        // Fire and forget - don't block response
        cacheSet(cacheKey, cacheData, ttlSeconds).catch(() => {});
      }
      
      res.setHeader('X-Cache', 'MISS');
      res.setHeader('X-Cache-Backend', isConnected() ? 'redis' : 'memory');
      return originalJson(body);
    };
    
    next();
  };
};

const cacheRoute = (ttl) => {
  return cacheResponse({ ttl, cacheAuthenticated: false });
};

const clearCache = (pattern = null) => {
  if (!pattern) {
    cacheDel('*').catch(() => {});
    cacheStore.clear();
    cacheStats.size = 0;
    return { cleared: 'all' };
  }
  
  cacheDel(`*${pattern}*`).catch(() => {});
  
  let cleared = 0;
  const regex = new RegExp(pattern);
  for (const key of cacheStore.keys()) {
    if (regex.test(key)) {
      cacheStore.delete(key);
      cleared++;
    }
  }
  
  cacheStats.size = cacheStore.size;
  return { cleared };
};

const invalidateCache = (patterns = []) => {
  return (req, res, next) => {
    const originalJson = res.json.bind(res);
    
    res.json = (body) => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        if (patterns.length === 0) {
          const baseUrl = req.baseUrl || '';
          clearCache(baseUrl.replace(/\//g, '\\/'));
        } else {
          patterns.forEach(pattern => clearCache(pattern));
        }
      }
      return originalJson(body);
    };
    
    next();
  };
};

const getCacheStats = async () => {
  const hitRate = cacheStats.hits + cacheStats.misses > 0
    ? ((cacheStats.hits / (cacheStats.hits + cacheStats.misses)) * 100).toFixed(2)
    : 0;
  
  let info = {};
  try {
    info = await getCacheInfo();
  } catch {
    info = { backend: 'in-memory', entries: cacheStore.size };
  }
  
  return {
    ...cacheStats,
    hitRate: `${hitRate}%`,
    backend: info.backend || 'in-memory',
    entries: info.entries || cacheStore.size,
    redisConnected: isConnected(),
    redisMemory: info.memory || null,
  };
};

const etagCache = (req, res, next) => {
  const originalJson = res.json.bind(res);
  
  res.json = (body) => {
    const crypto = require('crypto');
    const content = JSON.stringify(body);
    const etag = crypto.createHash('md5').update(content).digest('hex');
    
    res.setHeader('ETag', `"${etag}"`);
    
    const clientEtag = req.headers['if-none-match'];
    if (clientEtag && clientEtag === `"${etag}"`) {
      return res.status(304).end();
    }
    
    return originalJson(body);
  };
  
  next();
};

const setCacheHeaders = (options = {}) => {
  const maxAge = options.maxAge || 3600;
  const isPrivate = options.private || false;
  
  return (req, res, next) => {
    if (req.method === 'GET') {
      res.setHeader('Cache-Control', `${isPrivate ? 'private' : 'public'}, max-age=${maxAge}`);
    } else {
      res.setHeader('Cache-Control', 'no-store');
    }
    next();
  };
};

module.exports = {
  cacheResponse,
  cacheRoute,
  clearCache,
  invalidateCache,
  getCacheStats,
  etagCache,
  setCacheHeaders,
  generateCacheKey
};
