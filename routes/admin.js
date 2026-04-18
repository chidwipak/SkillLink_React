const express = require("express")
const router = express.Router()
const { authenticateToken, authorize } = require("../middleware/jwt")
const adminController = require("../controllers/adminControllerAPI")
const verifierController = require("../controllers/verifierControllerAPI")

// All routes require admin authentication
router.use(authenticateToken, authorize("admin"))

// Get pending verifications
router.get("/verifications/pending", adminController.getPendingVerifications)

// Verify worker
router.put("/workers/:id/verify", adminController.verifyWorker)

// Verify seller
router.put("/sellers/:id/verify", adminController.verifySeller)

// Verify delivery person
router.put("/delivery/:id/verify", adminController.verifyDelivery)

// User management
router.get("/users", adminController.getAllUsers)

// Verification status views (approved/rejected users - view only) — must be before :userId
router.get("/users/approved", verifierController.getApprovedUsers)
router.get("/users/rejected", verifierController.getRejectedUsers)

router.get("/users/:userId", adminController.getUserDetails)
router.put("/users/:userId/status", adminController.updateUserStatus)
router.delete("/users/:userId", adminController.deleteUser)

// Analytics
router.get("/analytics", adminController.getSystemAnalytics)

module.exports = router
