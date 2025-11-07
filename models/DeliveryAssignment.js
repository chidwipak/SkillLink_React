const mongoose = require("mongoose")

const deliveryAssignmentSchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    required: true,
  },
  deliveryPerson: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  status: {
    type: String,
    enum: ["assigned", "accepted", "picked_up", "in_transit", "arrived", "delivered", "failed"],
    default: "assigned",
  },
  pickupLocation: {
    address: String,
    coordinates: {
      latitude: Number,
      longitude: Number,
    },
  },
  deliveryLocation: {
    address: String,
    coordinates: {
      latitude: Number,
      longitude: Number,
    },
  },
  currentLocation: {
    latitude: Number,
    longitude: Number,
    timestamp: Date,
  },
  estimatedDeliveryTime: Date,
  actualDeliveryTime: Date,
  deliveryOTP: String,
  deliveryOTPVerified: {
    type: Boolean,
    default: false,
  },
  notes: String,
  deliveryProof: String, // Photo or signature
  statusHistory: [
    {
      status: String,
      timestamp: {
        type: Date,
        default: Date.now,
      },
      location: {
        latitude: Number,
        longitude: Number,
      },
      notes: String,
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

deliveryAssignmentSchema.index({ order: 1 })
deliveryAssignmentSchema.index({ deliveryPerson: 1, status: 1 })

module.exports = mongoose.model("DeliveryAssignment", deliveryAssignmentSchema)
