const express = require("express")
const router = express.Router()
const { authenticateToken } = require("../middleware/jwt")
const notificationController = require("../controllers/notificationControllerAPI")

// Protected routes - require authentication
router.use(authenticateToken)

// Get notifications
router.get("/", notificationController.getNotifications)

// Get unread count
router.get("/unread-count", notificationController.getUnreadCount)

// Mark notification as read
router.patch("/:id/read", notificationController.markAsRead)

// Mark all as read
router.patch("/mark-all-read", notificationController.markAllAsRead)

// Delete notification
router.delete("/:id", notificationController.deleteNotification)

module.exports = router
