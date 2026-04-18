const activeSessions = new Map();
const SESSION_TIMEOUT = 30 * 60 * 1000;
const MAX_SESSIONS_PER_USER = 5;

const generateSessionId = () => `sess_${Date.now().toString(36)}_${Math.random().toString(36).substr(2, 12)}`;

const parseUserAgent = (userAgent) => {
  if (!userAgent) return { type: 'unknown', browser: 'unknown', os: 'unknown' };
  const ua = userAgent.toLowerCase();
  
  let type = 'desktop';
  if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) type = 'mobile';
  else if (ua.includes('tablet') || ua.includes('ipad')) type = 'tablet';
  
  let browser = 'unknown';
  if (ua.includes('chrome')) browser = 'Chrome';
  else if (ua.includes('firefox')) browser = 'Firefox';
  else if (ua.includes('safari')) browser = 'Safari';
  else if (ua.includes('edge')) browser = 'Edge';
  
  let os = 'unknown';
  if (ua.includes('windows')) os = 'Windows';
  else if (ua.includes('mac')) os = 'macOS';
  else if (ua.includes('linux')) os = 'Linux';
  else if (ua.includes('android')) os = 'Android';
  else if (ua.includes('iphone') || ua.includes('ipad')) os = 'iOS';
  
  return { type, browser, os };
};

const getUserSessions = (userId) => {
  const sessions = [];
  activeSessions.forEach(session => {
    if (session.userId === userId) sessions.push(session);
  });
  return sessions;
};

const enforceMaxSessions = (userId) => {
  const userSessions = getUserSessions(userId);
  if (userSessions.length > MAX_SESSIONS_PER_USER) {
    userSessions.sort((a, b) => new Date(a.lastActivity) - new Date(b.lastActivity));
    const toRemove = userSessions.slice(0, userSessions.length - MAX_SESSIONS_PER_USER);
    toRemove.forEach(session => activeSessions.delete(session.sessionId));
  }
};

const createSession = (userId, metadata = {}) => {
  const sessionId = generateSessionId();
  const session = {
    sessionId,
    userId,
    createdAt: new Date(),
    lastActivity: new Date(),
    expiresAt: new Date(Date.now() + SESSION_TIMEOUT),
    ip: metadata.ip || null,
    userAgent: metadata.userAgent || null,
    device: parseUserAgent(metadata.userAgent)
  };
  activeSessions.set(sessionId, session);
  enforceMaxSessions(userId);
  return session;
};

const getSession = (sessionId) => activeSessions.get(sessionId) || null;

const updateActivity = (sessionId) => {
  const session = activeSessions.get(sessionId);
  if (!session) return false;
  session.lastActivity = new Date();
  session.expiresAt = new Date(Date.now() + SESSION_TIMEOUT);
  activeSessions.set(sessionId, session);
  return true;
};

const destroySession = (sessionId) => activeSessions.delete(sessionId);

const destroyUserSessions = (userId) => {
  const sessions = getUserSessions(userId);
  sessions.forEach(session => activeSessions.delete(session.sessionId));
  return sessions.length;
};

const isValidSession = (sessionId) => {
  const session = activeSessions.get(sessionId);
  if (!session) return false;
  if (new Date() > new Date(session.expiresAt)) {
    activeSessions.delete(sessionId);
    return false;
  }
  return true;
};

const cleanupExpiredSessions = () => {
  const now = new Date();
  let cleaned = 0;
  activeSessions.forEach((session, sessionId) => {
    if (now > new Date(session.expiresAt)) {
      activeSessions.delete(sessionId);
      cleaned++;
    }
  });
  return cleaned;
};

setInterval(cleanupExpiredSessions, 5 * 60 * 1000);

const trackActivity = (req, res, next) => {
  const sessionId = req.headers['x-session-id'] || req.cookies?.sessionId;
  if (sessionId && isValidSession(sessionId)) {
    updateActivity(sessionId);
    req.sessionId = sessionId;
    req.session = getSession(sessionId);
  }
  next();
};

const requireSession = (req, res, next) => {
  const sessionId = req.headers['x-session-id'] || req.cookies?.sessionId;
  if (!sessionId || !isValidSession(sessionId)) {
    return res.status(401).json({
      success: false,
      error: { code: 'SESSION_INVALID', message: 'Valid session required' }
    });
  }
  req.sessionId = sessionId;
  req.session = getSession(sessionId);
  next();
};

const getSessionStats = () => {
  const stats = {
    totalSessions: activeSessions.size,
    uniqueUsers: new Set(),
    byDevice: { desktop: 0, mobile: 0, tablet: 0, unknown: 0 }
  };
  activeSessions.forEach(session => {
    stats.uniqueUsers.add(session.userId);
    const deviceType = session.device?.type || 'unknown';
    stats.byDevice[deviceType] = (stats.byDevice[deviceType] || 0) + 1;
  });
  stats.uniqueUsers = stats.uniqueUsers.size;
  return stats;
};

module.exports = {
  createSession,
  getSession,
  getUserSessions,
  updateActivity,
  destroySession,
  destroyUserSessions,
  isValidSession,
  cleanupExpiredSessions,
  trackActivity,
  requireSession,
  getSessionStats,
  generateSessionId
};
