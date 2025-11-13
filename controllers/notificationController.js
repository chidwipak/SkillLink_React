const User = require("../models/User")

// Get notifications for the current user
exports.getNotifications = async (req, res) => {
  try {
    // Check if user is logged in
    if (!req.session.user) {
      return res.status(401).json({ success: false, message: "Not authenticated" })
    }

    const userId = req.session.user._id
    const user = await User.findById(userId)

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" })
    }

    // Sort notifications by date (newest first)
    const notifications = user.notifications.sort((a, b) => b.createdAt - a.createdAt)

    res.status(200).json({ success: true, notifications })
  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false, message: "Server error" })
  }
}

// Mark notification as read
exports.markAsRead = async (req, res) => {
  try {
    // Check if user is logged in
    if (!req.session.user) {
      return res.status(401).json({ success: false, message: "Not authenticated" })
    }

    const userId = req.session.user._id
    const { notificationId } = req.params

    const user = await User.findById(userId)

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" })
    }

    // Find the notification
    const notification = user.notifications.id(notificationId)
    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found" })
    }

    // Mark as read
    notification.isRead = true
    await user.save()

    res.status(200).json({ success: true, message: "Notification marked as read" })
  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false, message: "Server error" })
  }
}

// Mark all notifications as read
exports.markAllAsRead = async (req, res) => {
  try {
    // Check if user is logged in
    if (!req.session.user) {
      return res.status(401).json({ success: false, message: "Not authenticated" })
    }

    const userId = req.session.user._id
    const user = await User.findById(userId)

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" })
    }

    // Mark all notifications as read
    user.notifications.forEach((notification) => {
      notification.isRead = true
    })

    await user.save()

    res.status(200).json({ success: true, message: "All notifications marked as read" })
  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false, message: "Server error" })
  }
}

// Add notification helper function (to be used by other controllers)
exports.addNotification = async (userId, message, type = "info", link = "") => {
  try {
    const user = await User.findById(userId)

    if (!user) {
      console.error(`Failed to add notification: User ${userId} not found`)
      return false
    }

    user.notifications.push({
      message,
      type,
      isRead: false,
      createdAt: new Date(),
      link,
    })

    await user.save()
    return true
  } catch (err) {
    console.error("Error adding notification:", err)
    return false
  }
}
