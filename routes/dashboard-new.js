const express = require("express")
const router = express.Router()
const multer = require("multer")
const path = require("path")
const { authenticateToken, authorize } = require("../middleware/jwt")
const dashboardController = require("../controllers/dashboardControllerAPI")

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadPath = "public/uploads/"
    if (file.fieldname === "profilePicture") {
      uploadPath += "profiles/"
    } else if (file.fieldname.includes("shop")) {
      uploadPath += "shops/"
    }
    cb(null, uploadPath)
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname))
  },
})

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif|webp/
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
    const mimetype = allowedTypes.test(file.mimetype)
    if (extname && mimetype) {
      return cb(null, true)
    }
    cb(new Error("Only image files are allowed"))
  },
})

// All routes require authentication
router.use(authenticateToken)

// Customer dashboard stats
router.get("/customer/stats", authorize("customer"), dashboardController.getCustomerStats)

// Worker dashboard stats
router.get("/worker/stats", authorize("worker"), dashboardController.getWorkerStats)

// Seller dashboard stats
router.get("/seller/stats", authorize("seller"), dashboardController.getSellerStats)

// Seller profile and shop settings
router.get("/seller/profile", authorize("seller"), dashboardController.getSellerProfile)
router.put("/seller/shop-settings", authorize("seller"), upload.fields([
  { name: "profilePicture", maxCount: 1 },
  { name: "shopExteriorImage", maxCount: 1 },
  { name: "shopInteriorImage", maxCount: 1 },
]), dashboardController.updateSellerShopSettings)

// Delivery person dashboard stats
router.get("/delivery/stats", authorize("delivery"), dashboardController.getDeliveryStats)

// Admin dashboard stats
router.get("/admin/stats", authorize("admin"), dashboardController.getAdminStats)

// Earnings breakdown (for logged-in user: worker/seller/delivery/admin)
router.get("/earnings/breakdown", authenticateToken, dashboardController.getEarningsBreakdown)

// Admin: get earnings breakdown for any user
router.get("/admin/users/:userId/earnings", authorize("admin"), dashboardController.getUserEarningsBreakdown)

module.exports = router
