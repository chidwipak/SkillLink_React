const express = require("express")
const router = express.Router()
const { authenticateToken, authorize } = require("../middleware/jwt")
const verifierController = require("../controllers/verifierControllerAPI")

// All routes require verifier authentication
router.use(authenticateToken, authorize("verifier"))

// Get verifier dashboard stats
router.get("/stats", verifierController.getVerifierStats)

// Get all pending users
router.get("/pending", verifierController.getPendingUsers)

// Get user details for review
router.get("/users/:userId", verifierController.getUserDetails)

// Approve a user
router.put("/users/:userId/approve", verifierController.approveUser)

// Decline/reject a user
router.put("/users/:userId/decline", verifierController.declineUser)

// Get approved users list
router.get("/users-approved", verifierController.getApprovedUsers)

// Get rejected users list
router.get("/users-rejected", verifierController.getRejectedUsers)

module.exports = router
