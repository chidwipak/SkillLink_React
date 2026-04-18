const fs = require('fs');
const path = require('path');

const AUDIT_EVENTS = {
  USER_LOGIN: 'user.login', USER_LOGOUT: 'user.logout', USER_REGISTER: 'user.register',
  USER_UPDATE: 'user.update', PASSWORD_CHANGE: 'user.password_change',
  ORDER_CREATE: 'order.create', ORDER_UPDATE: 'order.update', ORDER_CANCEL: 'order.cancel', ORDER_COMPLETE: 'order.complete',
  DELIVERY_ASSIGN: 'delivery.assign', DELIVERY_PICKUP: 'delivery.pickup', DELIVERY_IN_TRANSIT: 'delivery.in_transit',
  DELIVERY_COMPLETE: 'delivery.complete', DELIVERY_FAILED: 'delivery.failed', LOCATION_UPDATE: 'delivery.location_update',
  BOOKING_CREATE: 'booking.create', BOOKING_ACCEPT: 'booking.accept', BOOKING_REJECT: 'booking.reject',
  BOOKING_COMPLETE: 'booking.complete', BOOKING_CANCEL: 'booking.cancel',
  PAYMENT_INITIATE: 'payment.initiate', PAYMENT_SUCCESS: 'payment.success', PAYMENT_FAIL: 'payment.fail',
  REFUND_INITIATE: 'refund.initiate', REFUND_COMPLETE: 'refund.complete',
  ADMIN_USER_UPDATE: 'admin.user_update', ADMIN_USER_DELETE: 'admin.user_delete',
  ADMIN_SETTINGS_CHANGE: 'admin.settings_change', ADMIN_VERIFICATION: 'admin.verification'
};

const auditLogs = [];
const MAX_MEMORY_LOGS = 1000;
const AUDIT_DIR = path.join(process.cwd(), 'logs');
const AUDIT_LOG_FILE = path.join(AUDIT_DIR, 'audit.log');

const ensureAuditDir = () => {
  if (!fs.existsSync(AUDIT_DIR)) fs.mkdirSync(AUDIT_DIR, { recursive: true });
};

const generateAuditId = () => `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const writeAuditToFile = (entry) => {
  try {
    ensureAuditDir();
    fs.appendFileSync(AUDIT_LOG_FILE, JSON.stringify(entry) + '\n');
  } catch (error) {
    console.error('Failed to write audit log:', error.message);
  }
};

const createAuditEntry = ({ event, userId = null, targetId = null, targetType = null, before = null, after = null, metadata = {} }) => {
  const entry = {
    id: generateAuditId(),
    timestamp: new Date().toISOString(),
    event,
    actor: { userId, ip: metadata.ip || null, userAgent: metadata.userAgent || null },
    target: { id: targetId, type: targetType },
    changes: { before, after },
    metadata: { ...metadata, ip: undefined, userAgent: undefined }
  };
  
  if (auditLogs.length >= MAX_MEMORY_LOGS) auditLogs.shift();
  auditLogs.push(entry);
  writeAuditToFile(entry);
  return entry;
};

const determineEvent = (req) => {
  const path = req.path.toLowerCase();
  const method = req.method;
  
  if (path.includes('/login')) return AUDIT_EVENTS.USER_LOGIN;
  if (path.includes('/register')) return AUDIT_EVENTS.USER_REGISTER;
  if (path.includes('/logout')) return AUDIT_EVENTS.USER_LOGOUT;
  
  if (path.includes('/order')) {
    if (method === 'POST') return AUDIT_EVENTS.ORDER_CREATE;
    if (method === 'PUT' || method === 'PATCH') return AUDIT_EVENTS.ORDER_UPDATE;
    if (method === 'DELETE') return AUDIT_EVENTS.ORDER_CANCEL;
  }
  
  if (path.includes('/delivery')) {
    if (path.includes('/assign')) return AUDIT_EVENTS.DELIVERY_ASSIGN;
    if (path.includes('/pickup')) return AUDIT_EVENTS.DELIVERY_PICKUP;
    if (path.includes('/complete')) return AUDIT_EVENTS.DELIVERY_COMPLETE;
    if (path.includes('/location')) return AUDIT_EVENTS.LOCATION_UPDATE;
  }
  
  if (path.includes('/booking')) {
    if (method === 'POST') return AUDIT_EVENTS.BOOKING_CREATE;
    if (path.includes('/accept')) return AUDIT_EVENTS.BOOKING_ACCEPT;
    if (path.includes('/reject')) return AUDIT_EVENTS.BOOKING_REJECT;
    if (path.includes('/complete')) return AUDIT_EVENTS.BOOKING_COMPLETE;
    if (path.includes('/cancel')) return AUDIT_EVENTS.BOOKING_CANCEL;
  }
  
  if (path.includes('/payment')) {
    if (method === 'POST') return AUDIT_EVENTS.PAYMENT_INITIATE;
    if (path.includes('/success')) return AUDIT_EVENTS.PAYMENT_SUCCESS;
    if (path.includes('/fail')) return AUDIT_EVENTS.PAYMENT_FAIL;
  }
  
  return null;
};

const determineTargetType = (req) => {
  const path = req.path.toLowerCase();
  if (path.includes('/user')) return 'user';
  if (path.includes('/order')) return 'order';
  if (path.includes('/delivery')) return 'delivery';
  if (path.includes('/booking')) return 'booking';
  if (path.includes('/payment')) return 'payment';
  if (path.includes('/product')) return 'product';
  if (path.includes('/service')) return 'service';
  return 'unknown';
};

const auditTrail = (options = {}) => {
  const auditMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];
  
  return (req, res, next) => {
    if (!auditMethods.includes(req.method)) return next();
    
    const originalJson = res.json.bind(res);
    const startData = options.logBody ? { ...req.body } : null;
    
    res.json = function(body) {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const event = determineEvent(req);
        if (event) {
          createAuditEntry({
            event,
            userId: req.user?.userId,
            targetId: req.params.id || body?.data?._id || body?._id,
            targetType: determineTargetType(req),
            before: startData,
            after: options.logBody ? body?.data : null,
            metadata: { ip: req.ip, userAgent: req.get('User-Agent'), method: req.method, path: req.path, statusCode: res.statusCode }
          });
        }
      }
      return originalJson(body);
    };
    
    next();
  };
};

const logAuditEvent = (event, req, details = {}) => {
  return createAuditEntry({
    event,
    userId: req?.user?.userId,
    targetId: details.targetId || details.orderId || details.bookingId,
    targetType: details.targetType || 'unknown',
    after: details,
    metadata: { ip: req?.ip, userAgent: req?.get?.('User-Agent') }
  });
};

const queryAuditLogs = (filters = {}) => {
  let results = [...auditLogs];
  
  if (filters.event) results = results.filter(log => log.event === filters.event);
  if (filters.userId) results = results.filter(log => log.actor.userId === filters.userId);
  if (filters.targetId) results = results.filter(log => log.target.id === filters.targetId);
  if (filters.startDate) {
    const start = new Date(filters.startDate);
    results = results.filter(log => new Date(log.timestamp) >= start);
  }
  if (filters.endDate) {
    const end = new Date(filters.endDate);
    results = results.filter(log => new Date(log.timestamp) <= end);
  }
  
  results.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  if (filters.limit) results = results.slice(0, filters.limit);
  return results;
};

const getResourceAuditTrail = (targetId, targetType = null) => {
  return queryAuditLogs({ targetId, ...(targetType && { targetType }) });
};

const getUserActivityLog = (userId, limit = 50) => queryAuditLogs({ userId, limit });

const generateAuditReport = (options = {}) => {
  const logs = queryAuditLogs(options);
  const eventCounts = {};
  const userCounts = {};
  
  logs.forEach(log => {
    eventCounts[log.event] = (eventCounts[log.event] || 0) + 1;
    const user = log.actor.userId || 'anonymous';
    userCounts[user] = (userCounts[user] || 0) + 1;
  });
  
  return {
    totalEvents: logs.length,
    eventBreakdown: eventCounts,
    userBreakdown: userCounts,
    timeRange: {
      start: logs.length > 0 ? logs[logs.length - 1].timestamp : null,
      end: logs.length > 0 ? logs[0].timestamp : null
    },
    recentEvents: logs.slice(0, 10)
  };
};

const clearOldAuditLogs = (daysToKeep = 90) => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
  
  const originalCount = auditLogs.length;
  const newLogs = auditLogs.filter(log => new Date(log.timestamp) >= cutoffDate);
  
  auditLogs.length = 0;
  auditLogs.push(...newLogs);
  
  return originalCount - auditLogs.length;
};

module.exports = {
  auditTrail,
  createAuditEntry,
  logAuditEvent,
  queryAuditLogs,
  getResourceAuditTrail,
  getUserActivityLog,
  generateAuditReport,
  clearOldAuditLogs,
  AUDIT_EVENTS
};
