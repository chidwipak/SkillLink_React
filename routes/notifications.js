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

// Mark all as read (must come before /:id routes)
router.patch("/mark-all-read", notificationController.markAllAsRead)

// Delete all read notifications (cleanup - must come before /:id routes)
router.delete("/cleanup/read", notificationController.deleteReadNotifications)

// Mark notification as read
router.patch("/:id/read", notificationController.markAsRead)

// Delete notification
router.delete("/:id", notificationController.deleteNotification)

module.exports = router
