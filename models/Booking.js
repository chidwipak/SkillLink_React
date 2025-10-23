const mongoose = require("mongoose")

const bookingSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  worker: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Worker",
    required: true,
  },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Service",
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  address: {
    type: mongoose.Schema.Types.Mixed, // Accepts both string and object
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected", "in-progress", "in_progress", "completed", "cancelled"],
    default: "pending",
  },
  price: {
    type: Number,
    required: true,
    default: 0,
  },
  finalPrice: {
    type: Number,
    default: 0,
  },
  notes: String,
  customerLocation: {
    latitude: Number,
    longitude: Number,
    address: String,
    shareLocation: {
      type: Boolean,
      default: false,
    },
  },
  workerLocation: {
    latitude: Number,
    longitude: Number,
    lastUpdated: Date,
  },
  payment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Payment",
  },
  paymentStatus: {
    type: String,
    enum: ["pending", "completed", "failed"],
    default: "pending",
  },
  scheduledStartTime: Date,
  actualStartTime: Date,
  completionTime: Date,
  isReviewed: {
    type: Boolean,
    default: false,
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
  },
  review: String,
  statusHistory: [
    {
      status: String,
      timestamp: {
        type: Date,
        default: Date.now,
      },
      notes: String,
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
})

// Update the updatedAt field before saving
bookingSchema.pre("save", function (next) {
  this.updatedAt = new Date()
  next()
})

module.exports = mongoose.model("Booking", bookingSchema)
