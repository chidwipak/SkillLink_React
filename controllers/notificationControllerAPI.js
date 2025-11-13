const Notification = require("../models/Notification")

// Get user notifications
exports.getNotifications = async (req, res) => {
  try {
    const { limit = 50, page = 1, unreadOnly = false } = req.query

    const query = { user: req.user.userId }
    if (unreadOnly === "true") {
      query.isRead = false
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))

    const total = await Notification.countDocuments(query)
    const unreadCount = await Notification.countDocuments({
      user: req.user.userId,
      isRead: false,
    })

    res.json({
      success: true,
      notifications,
      unreadCount,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
      },
    })
  } catch (error) {
    console.error("Get notifications error:", error)
    res.status(500).json({ success: false, message: "Failed to fetch notifications" })
  }
}

// Mark notification as read
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user.userId },
      { isRead: true },
      { new: true }
    )

    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found" })
    }

    res.json({
      success: true,
      notification,
    })
  } catch (error) {
    console.error("Mark notification error:", error)
    res.status(500).json({ success: false, message: "Failed to update notification" })
  }
}

// Mark all notifications as read
exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user.userId, isRead: false },
      { isRead: true }
    )

    res.json({
      success: true,
      message: "All notifications marked as read",
    })
  } catch (error) {
    console.error("Mark all notifications error:", error)
    res.status(500).json({ success: false, message: "Failed to update notifications" })
  }
}

// Delete notification
exports.deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      user: req.user.userId,
    })

    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found" })
    }

    res.json({
      success: true,
      message: "Notification deleted",
    })
  } catch (error) {
    console.error("Delete notification error:", error)
    res.status(500).json({ success: false, message: "Failed to delete notification" })
  }
}

// Get unread count
exports.getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      user: req.user.userId,
      isRead: false,
    })

    res.json({
      success: true,
      count,
    })
  } catch (error) {
    console.error("Get unread count error:", error)
    res.status(500).json({ success: false, message: "Failed to get count" })
  }
}

module.exports = exports
