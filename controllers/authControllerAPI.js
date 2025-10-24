const User = require("../models/User")
const Worker = require("../models/Worker")
const Seller = require("../models/Seller")
const bcrypt = require("bcryptjs")
const crypto = require("crypto")
const emailService = require("../utils/emailService")
const multer = require("multer")
const path = require("path")
const fs = require("fs")
const { 
  generateAccessToken, 
  generateRefreshToken,
  verifyRefreshToken 
} = require("../middleware/jwt")

// Configure multer for profile photo uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = "public/uploads/profiles/"
    
    // Different paths for different file types
    if (file.fieldname === 'shopExteriorImage' || file.fieldname === 'shopInteriorImage') {
      uploadPath = "public/uploads/shops/"
    } else if (file.fieldname.includes('Document') || file.fieldname.includes('License')) {
      uploadPath = "public/uploads/documents/"
    }
    
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true })
    }
    cb(null, uploadPath)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
    const ext = path.extname(file.originalname)
    const prefix = file.fieldname.includes('shop') ? 'shop-' : 
                  file.fieldname.includes('Document') ? 'doc-' :
                  file.fieldname.includes('License') ? 'license-' : 'profile-'
    cb(null, prefix + uniqueSuffix + ext)
  },
})

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true)
    } else {
      cb(new Error("Only images are allowed"))
    }
  },
}).single("profilePicture")

// Multer middleware for registration (exported for use in routes)
exports.uploadRegistration = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    // Allow images for profile and shop photos
    if (file.fieldname === 'profilePicture' || file.fieldname === 'shopExteriorImage' || file.fieldname === 'shopInteriorImage') {
      if (file.mimetype.startsWith("image/")) {
        cb(null, true)
      } else {
        cb(new Error("Only images are allowed for photos"))
      }
    } 
    // Allow documents and images for document fields
    else if (file.fieldname.includes('Document') || file.fieldname.includes('License')) {
      if (file.mimetype.startsWith("image/") || file.mimetype === "application/pdf") {
        cb(null, true)
      } else {
        cb(new Error("Only images or PDF are allowed for documents"))
      }
    } else {
      cb(null, true)
    }
  },
}).fields([
  { name: 'profilePicture', maxCount: 1 },
  { name: 'shopExteriorImage', maxCount: 1 },
  { name: 'shopInteriorImage', maxCount: 1 },
  { name: 'aadharDocument', maxCount: 1 },
  { name: 'businessDocument', maxCount: 1 },
  { name: 'drivingLicense', maxCount: 1 },
  { name: 'deliveryDocument', maxCount: 1 }
])

// Register new user
exports.register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      role,
      // Worker specific
      serviceCategory,
      skills,
      experience,
      // Seller specific
      businessName,
      description,
      categories,
    } = req.body

    // Validation
    if (!name || !email || !password || !phone || !role) {
      return res.status(400).json({ 
        success: false, 
        message: "All required fields must be provided" 
      })
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid email format" 
      })
    }

    // Check if user exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: "Email already registered" 
      })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Generate OTP for email verification
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    // Create user with profile picture if uploaded
    const userData = {
      name,
      email,
      password: hashedPassword,
      phone,
      role,
      emailVerificationOTP: otp,
      emailVerificationExpiry: otpExpiry,
      isEmailVerified: false,
    }

    // Add profile picture path if file was uploaded
    if (req.files && req.files.profilePicture && req.files.profilePicture[0]) {
      userData.profilePicture = "/uploads/profiles/" + req.files.profilePicture[0].filename
    }

    const user = new User(userData)
    await user.save()

    // Create role-specific profile
    if (role === "worker") {
      const workerData = {
        user: user._id,
        serviceCategory: serviceCategory || "electrician",
        skills: skills ? skills.split(",").map((s) => s.trim()) : [],
        experience: experience || 0,
      }
      
      // Add worker document if uploaded
      if (req.files && req.files.aadharDocument && req.files.aadharDocument[0]) {
        workerData.documents = ["/uploads/documents/" + req.files.aadharDocument[0].filename]
      }
      
      await Worker.create(workerData)
    } else if (role === "seller") {
      const sellerData = {
        user: user._id,
        businessName: businessName || name,
        description: req.body.businessDescription || description || "",
        businessDescription: req.body.businessDescription || description || "",
        categories: categories ? categories.split(",").map((c) => c.trim()) : req.body.categories ? req.body.categories.split(",").map((c) => c.trim()) : [],
        shopImages: {}
      }
      
      // Add shop images if uploaded
      if (req.files && req.files.shopExteriorImage && req.files.shopExteriorImage[0]) {
        sellerData.shopImages.exterior = "/uploads/shops/" + req.files.shopExteriorImage[0].filename
      }
      if (req.files && req.files.shopInteriorImage && req.files.shopInteriorImage[0]) {
        sellerData.shopImages.interior = "/uploads/shops/" + req.files.shopInteriorImage[0].filename
      }
      
      // Add GST number if provided
      if (req.body.gstNumber) {
        sellerData.gstNumber = req.body.gstNumber
      }
      
      await Seller.create(sellerData)
    }

    // Send OTP via email (optional, doesn't block registration)
    console.log(`📧 Sending OTP to ${email}: ${otp}`)
    try {
      const emailResult = await emailService.sendVerificationEmail(email, name, otp)
      
      if (emailResult.success) {
        console.log("✅ Verification email sent successfully");
      } else {
        console.log("⚠️ Warning: Email sending failed:", emailResult.error);
      }
    } catch (emailError) {
      console.log("⚠️ Email service error:", emailError.message);
      // Continue with registration even if email fails
    }

    res.status(201).json({
      success: true,
      message: "Registration successful! You can now login with your credentials.",
      data: { email, otpSent: true },
    })
  } catch (error) {
    console.error("Registration error:", error)
    res.status(500).json({ 
      success: false, 
      message: "Registration failed", 
      error: error.message 
    })
  }
}

// Verify email with OTP
exports.verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body

    if (!email || !otp) {
      return res.status(400).json({ 
        success: false, 
        message: "Email and OTP are required" 
      })
    }

    const user = await User.findOne({ email })
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      })
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ 
        success: false, 
        message: "Email already verified" 
      })
    }

    if (user.emailVerificationOTP !== otp) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid OTP" 
      })
    }

    if (new Date() > user.emailVerificationExpiry) {
      return res.status(400).json({ 
        success: false, 
        message: "OTP expired. Please request a new one." 
      })
    }

    user.isEmailVerified = true
    user.emailVerificationOTP = undefined
    user.emailVerificationExpiry = undefined
    await user.save()

    res.json({
      success: true,
      message: "Email verified successfully. You can now login.",
    })
  } catch (error) {
    console.error("Email verification error:", error)
    res.status(500).json({ 
      success: false, 
      message: "Verification failed" 
    })
  }
}

// Resend OTP
exports.resendOTP = async (req, res) => {
  try {
    const { email } = req.body

    const user = await User.findOne({ email })
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      })
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ 
        success: false, 
        message: "Email already verified" 
      })
    }

    // Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000)

    user.emailVerificationOTP = otp
    user.emailVerificationExpiry = otpExpiry
    await user.save()

    // Send OTP via email
    console.log(`📧 Resending OTP to ${email}: ${otp}`)
    const emailResult = await emailService.sendVerificationEmail(email, user.name, otp)
    
    if (emailResult.success) {
      console.log("✅ OTP resent successfully");
      res.json({
        success: true,
        message: "A new OTP has been sent to your email",
      })
    } else {
      console.log("❌ Failed to send OTP:", emailResult.error);
      res.status(500).json({
        success: false,
        message: "Failed to send OTP. Please try again later.",
      })
    }
  } catch (error) {
    console.error("Resend OTP error:", error)
    res.status(500).json({ 
      success: false, 
      message: "Failed to send OTP" 
    })
  }
}

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: "Email and password are required" 
      })
    }

    // Find user
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid email or password" 
      })
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid email or password" 
      })
    }

    // Generate tokens
    const accessToken = generateAccessToken(user._id, user.role)
    const refreshToken = generateRefreshToken(user._id, user.role)

    // Save refresh token to user
    user.refreshToken = refreshToken
    await user.save()

    // Return user data without password
    const userData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      profilePicture: user.profilePicture,
      address: user.address,
      isVerified: user.isVerified,
      isEmailVerified: user.isEmailVerified,
      createdAt: user.createdAt,
    }

    res.json({
      success: true,
      message: "Login successful",
      token: accessToken,
      refreshToken,
      user: userData,
    })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({ 
      success: false, 
      message: "Login failed" 
    })
  }
}

// Refresh token
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body

    if (!refreshToken) {
      return res.status(400).json({ 
        success: false, 
        message: "Refresh token required" 
      })
    }

    const decoded = verifyRefreshToken(refreshToken)
    if (!decoded) {
      return res.status(403).json({ 
        success: false, 
        message: "Invalid refresh token" 
      })
    }

    // Verify token exists in database
    const user = await User.findById(decoded.userId)
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(403).json({ 
        success: false, 
        message: "Invalid refresh token" 
      })
    }

    // Generate new tokens
    const newAccessToken = generateAccessToken(user._id, user.role)
    const newRefreshToken = generateRefreshToken(user._id, user.role)

    user.refreshToken = newRefreshToken
    await user.save()

    res.json({
      success: true,
      token: newAccessToken,
      refreshToken: newRefreshToken,
    })
  } catch (error) {
    console.error("Refresh token error:", error)
    res.status(500).json({ 
      success: false, 
      message: "Token refresh failed" 
    })
  }
}

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password -refreshToken")
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      })
    }

    let profile = { user }

    // Get role-specific data
    if (user.role === "worker") {
      profile.workerProfile = await Worker.findOne({ user: user._id })
    } else if (user.role === "seller") {
      profile.sellerProfile = await Seller.findOne({ user: user._id })
    }

    res.json({
      success: true,
      user: profile.user,
      profile: profile.workerProfile || profile.sellerProfile,
    })
  } catch (error) {
    console.error("Get profile error:", error)
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch profile" 
    })
  }
}

// Update user profile
exports.updateProfile = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message,
      })
    }

    try {
      const { name, phone, address, addresses } = req.body
      const user = await User.findById(req.user.userId)

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        })
      }

      // Update basic fields
      if (name) user.name = name
      if (phone) user.phone = phone

      // Update addresses array for customers (multiple addresses)
      if (addresses) {
        const addressesData = typeof addresses === 'string' ? JSON.parse(addresses) : addresses
        user.addresses = addressesData
        // Set default address as primary address
        const defaultAddr = addressesData.find(a => a.isDefault) || addressesData[0]
        if (defaultAddr) {
          user.address = {
            street: defaultAddr.street,
            city: defaultAddr.city,
            state: defaultAddr.state,
            zipCode: defaultAddr.zipCode,
            country: defaultAddr.country || 'India'
          }
        }
      }

      // Update single address if provided (for workers, sellers, delivery)
      if (address && !addresses) {
        const addressData = typeof address === 'string' ? JSON.parse(address) : address
        user.address = {
          street: addressData.street || user.address?.street,
          city: addressData.city || user.address?.city,
          state: addressData.state || user.address?.state,
          zipCode: addressData.zipCode || user.address?.zipCode,
          country: addressData.country || user.address?.country || 'India'
        }
      }

      // Update profile picture if uploaded
      if (req.file) {
        // Delete old profile picture if it exists and is not default
        if (user.profilePicture && user.profilePicture !== "/images/default-profile.png") {
          const oldPath = path.join(__dirname, "..", "public", user.profilePicture)
          if (fs.existsSync(oldPath)) {
            fs.unlinkSync(oldPath)
          }
        }
        user.profilePicture = "/uploads/profiles/" + req.file.filename
      }

      await user.save()

      // Return updated user without sensitive data
      const updatedUser = await User.findById(user._id).select("-password -refreshToken")

      res.json({
        success: true,
        message: "Profile updated successfully",
        user: updatedUser,
      })
    } catch (error) {
      console.error("Update profile error:", error)
      res.status(500).json({
        success: false,
        message: "Failed to update profile",
        error: error.message
      })
    }
  })
}

// Logout
exports.logout = async (req, res) => {
  try {
    // Clear refresh token from database
    await User.findByIdAndUpdate(req.user.userId, { refreshToken: null })

    res.json({
      success: true,
      message: "Logout successful",
    })
  } catch (error) {
    console.error("Logout error:", error)
    res.status(500).json({ 
      success: false, 
      message: "Logout failed" 
    })
  }
}

// Forgot password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body

    const user = await User.findOne({ email })
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      })
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex")
    const resetTokenHash = crypto.createHash("sha256").update(resetToken).digest("hex")

    user.passwordResetToken = resetTokenHash
    user.passwordResetExpiry = Date.now() + 30 * 60 * 1000 // 30 minutes
    await user.save()

    // TODO: Send reset link via email
    console.log(`Reset token for ${email}: ${resetToken}`)

    res.json({
      success: true,
      message: "Password reset link sent to your email",
      // For development only - remove in production
      resetToken: process.env.NODE_ENV === "development" ? resetToken : undefined,
    })
  } catch (error) {
    console.error("Forgot password error:", error)
    res.status(500).json({ 
      success: false, 
      message: "Failed to process request" 
    })
  }
}

// Reset password
exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body

    if (!token || !password) {
      return res.status(400).json({ 
        success: false, 
        message: "Token and password are required" 
      })
    }

    // Hash the token to match with stored hash
    const resetTokenHash = crypto.createHash("sha256").update(token).digest("hex")

    const user = await User.findOne({
      passwordResetToken: resetTokenHash,
      passwordResetExpiry: { $gt: Date.now() },
    })

    if (!user) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid or expired reset token" 
      })
    }

    // Update password
    user.password = await bcrypt.hash(password, 10)
    user.passwordResetToken = undefined
    user.passwordResetExpiry = undefined
    await user.save()

    res.json({
      success: true,
      message: "Password reset successful. You can now login with your new password.",
    })
  } catch (error) {
    console.error("Reset password error:", error)
    res.status(500).json({ 
      success: false, 
      message: "Failed to reset password" 
    })
  }
}

module.exports = exports
