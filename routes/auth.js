const express = require("express")
const router = express.Router()
const authController = require("../controllers/authControllerAPI")
const { authenticateToken } = require("../middleware/jwt")
const { authLimiter } = require("../middleware/rateLimiter")
const { registerValidation, loginValidation } = require("../middleware/validation")

// Wrapper for multer to handle errors gracefully
const handleUpload = (req, res, next) => {
  authController.uploadRegistration(req, res, (err) => {
    if (err) {
      console.error("Multer error:", err.message)
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ success: false, message: 'File too large. Max 5MB allowed.' })
      }
      return res.status(400).json({ success: false, message: err.message || 'File upload error' })
    }
    next()
  })
}

// Public routes with rate limiting
router.post("/register", authLimiter, handleUpload, registerValidation, authController.register)
router.post("/verify-email", authLimiter, authController.verifyEmail)
router.post("/resend-otp", authLimiter, authController.resendOTP)
router.post("/login", authLimiter, loginValidation, authController.login)
router.post("/refresh-token", authController.refreshToken)
router.post("/forgot-password", authController.forgotPassword)
router.post("/reset-password", authController.resetPassword)

// Protected routes
router.get("/profile", authenticateToken, authController.getProfile)
router.put("/profile", authenticateToken, authController.updateProfile)
router.post("/logout", authenticateToken, authController.logout)

module.exports = router
