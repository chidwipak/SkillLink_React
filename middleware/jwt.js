const jwt = require("jsonwebtoken")

const JWT_SECRET = process.env.JWT_SECRET || "skilllink-jwt-secret-2025"
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "skilllink-refresh-secret-2025"

// Generate access token (24 hours)
const generateAccessToken = (userId, role) => {
  return jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: "24h" })
}

// Generate refresh token (long-lived)
const generateRefreshToken = (userId, role) => {
  return jwt.sign({ userId, role }, JWT_REFRESH_SECRET, { expiresIn: "7d" })
}

// Verify access token
const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    return null
  }
}

// Verify refresh token
const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET)
  } catch (error) {
    return null
  }
}

// Middleware to protect routes
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"]
  const token = authHeader && authHeader.split(" ")[1] // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ success: false, message: "Access token required" })
  }

  const decoded = verifyAccessToken(token)
  if (!decoded) {
    return res.status(403).json({ success: false, message: "Invalid or expired token" })
  }

  req.user = decoded
  next()
}

// Middleware to check user role
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" })
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: "Access denied. Insufficient permissions" 
      })
    }

    next()
  }
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  authenticateToken,
  authorize,
}
