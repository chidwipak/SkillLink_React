const mongoose = require("mongoose")

const locationTrackingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  relatedId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  relatedModel: {
    type: String,
    enum: ["Booking", "Order", "DeliveryAssignment"],
    required: true,
  },
  location: {
    latitude: {
      type: Number,
      required: true,
    },
    longitude: {
      type: Number,
      required: true,
    },
  },
  accuracy: Number,
  heading: Number,
  speed: Number,
  timestamp: {
    type: Date,
    default: Date.now,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
})

locationTrackingSchema.index({ user: 1, relatedId: 1, timestamp: -1 })
locationTrackingSchema.index({ relatedId: 1, relatedModel: 1, isActive: 1 })
locationTrackingSchema.index({ timestamp: 1 }, { expireAfterSeconds: 86400 }) // Auto-delete after 24 hours

module.exports = mongoose.model("LocationTracking", locationTrackingSchema)
