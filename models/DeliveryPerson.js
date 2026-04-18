const mongoose = require("mongoose")

const deliveryPersonSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  vehicleType: {
    type: String,
    enum: ["bike", "scooter", "bicycle", "car"],
    default: "bike",
  },
  vehicleNumber: {
    type: String,
  },
  drivingLicense: String,
  aadharNumber: String,
  documents: [String], // Array of document file paths (Aadhar, License, etc.)
  isAvailable: {
    type: Boolean,
    default: true,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  currentLocation: {
    latitude: Number,
    longitude: Number,
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  totalRatings: {
    type: Number,
    default: 0,
  },
  totalDeliveries: {
    type: Number,
    default: 0,
  },
  earnings: {
    type: Number,
    default: 0,
  },
  pendingRequests: [{
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Seller",
    },
    requestedAt: {
      type: Date,
      default: Date.now,
    },
  }],
  activeDelivery: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
})

// DB Optimization: Indexes for delivery person lookups
deliveryPersonSchema.index({ user: 1 }, { unique: true })
deliveryPersonSchema.index({ isAvailable: 1, isVerified: 1 })
deliveryPersonSchema.index({ rating: -1 })

deliveryPersonSchema.pre("save", function (next) {
  this.updatedAt = new Date()
  next()
})

module.exports = mongoose.model("DeliveryPerson", deliveryPersonSchema)
