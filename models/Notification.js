const mongoose = require("mongoose")

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["info", "success", "warning", "error", "booking", "order", "payment", "delivery"],
    default: "info",
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  link: {
    type: String,
  },
  actionType: {
    type: String,
    enum: ["none", "rebook", "broadcast", "view"],
    default: "none",
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed, // Flexible JSON data (e.g. suggested workers, service info)
  },
  relatedId: {
    type: mongoose.Schema.Types.ObjectId,
  },
  relatedModel: {
    type: String,
    enum: ["Booking", "Order", "Payment", "User"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

notificationSchema.index({ user: 1, createdAt: -1 })
notificationSchema.index({ user: 1, isRead: 1 })

module.exports = mongoose.model("Notification", notificationSchema)
