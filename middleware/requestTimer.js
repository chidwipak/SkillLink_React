const routeStats = new Map();
const SLOW_THRESHOLD_MS = 1000;
const VERY_SLOW_THRESHOLD_MS = 3000;

const requestTimer = (options = {}) => {
  const slowThreshold = options.slowThreshold || SLOW_THRESHOLD_MS;
  const logAll = options.logAll || false;
  
  return (req, res, next) => {
    const startTime = process.hrtime.bigint();
    const startMemory = process.memoryUsage().heapUsed;
    
    req.timing = { startTime, startMemory };
    res.setHeader('X-Request-Start', Date.now().toString());
    
    const originalEnd = res.end.bind(res);
    
    res.end = function(...args) {
      const endTime = process.hrtime.bigint();
      const duration = Number(endTime - startTime) / 1000000;
      const endMemory = process.memoryUsage().heapUsed;
      const memoryDelta = endMemory - startMemory;
      
      // Only set headers if they haven't been sent yet
      if (!res.headersSent) {
        res.setHeader('X-Response-Time', `${duration.toFixed(2)}ms`);
        res.setHeader('X-Memory-Delta', `${Math.round(memoryDelta / 1024)}KB`);
      }
      
      const routeKey = `${req.method} ${req.route?.path || req.path}`;
      
      if (duration >= VERY_SLOW_THRESHOLD_MS) {
        console.warn(`⚠️ [VERY SLOW] ${routeKey} took ${duration.toFixed(2)}ms`);
      } else if (duration >= slowThreshold) {
        console.warn(`⏱️ [SLOW] ${routeKey} took ${duration.toFixed(2)}ms`);
      } else if (logAll) {
        console.log(`⏱️ ${routeKey} completed in ${duration.toFixed(2)}ms`);
      }
      
      updateRouteStats(routeKey, duration, res.statusCode);
      return originalEnd.apply(this, args);
    };
    
    next();
  };
};

const updateRouteStats = (route, duration, statusCode) => {
  const existing = routeStats.get(route) || {
    count: 0, totalTime: 0, minTime: Infinity, maxTime: 0, avgTime: 0,
    successCount: 0, errorCount: 0, slowCount: 0, lastAccessed: null
  };
  
  existing.count++;
  existing.totalTime += duration;
  existing.minTime = Math.min(existing.minTime, duration);
  existing.maxTime = Math.max(existing.maxTime, duration);
  existing.avgTime = existing.totalTime / existing.count;
  existing.lastAccessed = new Date().toISOString();
  
  if (statusCode >= 400) existing.errorCount++;
  else existing.successCount++;
  if (duration >= SLOW_THRESHOLD_MS) existing.slowCount++;
  
  routeStats.set(route, existing);
};

const getRouteStats = () => {
  const stats = {};
  routeStats.forEach((value, key) => {
    stats[key] = {
      ...value,
      avgTime: value.avgTime.toFixed(2) + 'ms',
      minTime: value.minTime === Infinity ? 'N/A' : value.minTime.toFixed(2) + 'ms',
      maxTime: value.maxTime.toFixed(2) + 'ms',
      errorRate: ((value.errorCount / value.count) * 100).toFixed(1) + '%',
      slowRate: ((value.slowCount / value.count) * 100).toFixed(1) + '%'
    };
  });
  return stats;
};

const getStats = (route) => routeStats.get(route) || null;
const resetStats = () => routeStats.clear();

const timingBreakdown = (req, res, next) => {
  const marks = new Map();
  const startTime = process.hrtime.bigint();
  
  req.markTime = (label) => marks.set(label, process.hrtime.bigint());
  
  req.getTimings = () => {
    const timings = {};
    let prevTime = startTime;
    marks.forEach((time, label) => {
      const fromStart = Number(time - startTime) / 1000000;
      const fromPrev = Number(time - prevTime) / 1000000;
      timings[label] = { fromStart: `${fromStart.toFixed(2)}ms`, duration: `${fromPrev.toFixed(2)}ms` };
      prevTime = time;
    });
    return timings;
  };
  
  req.markTime('start');
  next();
};

const serverTiming = (req, res, next) => {
  const timings = [];
  const startTime = process.hrtime.bigint();
  
  req.addServerTiming = (name, description) => {
    const duration = Number(process.hrtime.bigint() - startTime) / 1000000;
    timings.push({ name, duration, description });
  };
  
  const originalEnd = res.end.bind(res);
  res.end = function(...args) {
    if (timings.length > 0) {
      const headerValue = timings
        .map(t => `${t.name};dur=${t.duration.toFixed(1)}${t.description ? `;desc="${t.description}"` : ''}`)
        .join(', ');
      res.setHeader('Server-Timing', headerValue);
    }
    return originalEnd.apply(this, args);
  };
  
  next();
};

const timeout = (timeoutMs = 30000) => {
  return (req, res, next) => {
    const timeoutId = setTimeout(() => {
      if (!res.headersSent) {
        res.status(503).json({
          success: false,
          error: { code: 'REQUEST_TIMEOUT', message: `Request timed out after ${timeoutMs}ms` }
        });
      }
    }, timeoutMs);
    
    const originalEnd = res.end.bind(res);
    res.end = function(...args) {
      clearTimeout(timeoutId);
      return originalEnd.apply(this, args);
    };
    
    next();
  };
};

const cpuProfiler = (req, res, next) => {
  const startUsage = process.cpuUsage();
  
  const originalEnd = res.end.bind(res);
  res.end = function(...args) {
    const endUsage = process.cpuUsage(startUsage);
    const userCPU = (endUsage.user / 1000).toFixed(2);
    const systemCPU = (endUsage.system / 1000).toFixed(2);
    
    res.setHeader('X-CPU-User', `${userCPU}ms`);
    res.setHeader('X-CPU-System', `${systemCPU}ms`);
    
    return originalEnd.apply(this, args);
  };
  
  next();
};

const getPerformanceMetrics = (req, res) => {
  const memory = process.memoryUsage();
  const uptime = process.uptime();
  
  res.json({
    success: true,
    data: {
      routeStatistics: getRouteStats(),
      serverMetrics: {
        uptime: `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m`,
        memoryUsage: {
          heapUsed: `${Math.round(memory.heapUsed / 1024 / 1024)}MB`,
          heapTotal: `${Math.round(memory.heapTotal / 1024 / 1024)}MB`,
          rss: `${Math.round(memory.rss / 1024 / 1024)}MB`
        },
        nodeVersion: process.version
      },
      thresholds: { slow: `${SLOW_THRESHOLD_MS}ms`, verySlow: `${VERY_SLOW_THRESHOLD_MS}ms` }
    }
  });
};

module.exports = {
  requestTimer,
  timingBreakdown,
  serverTiming,
  timeout,
  cpuProfiler,
  getRouteStats,
  getStats,
  resetStats,
  getPerformanceMetrics,
  SLOW_THRESHOLD_MS,
  VERY_SLOW_THRESHOLD_MS
};
