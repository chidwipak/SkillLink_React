const mongoose = require("mongoose")

const paymentSchema = new mongoose.Schema({
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
    enum: ["Booking", "Order"],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    default: "INR",
  },
  paymentMethod: {
    type: String,
    enum: ["razorpay", "cash", "upi"],
    default: "razorpay",
  },
  razorpayOrderId: String,
  razorpayPaymentId: String,
  razorpaySignature: String,
  status: {
    type: String,
    enum: ["pending", "processing", "completed", "failed", "refunded"],
    default: "pending",
  },
  transactionDate: {
    type: Date,
    default: Date.now,
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

paymentSchema.index({ user: 1, status: 1 })
paymentSchema.index({ relatedId: 1, relatedModel: 1 })
paymentSchema.index({ razorpayOrderId: 1 })

module.exports = mongoose.model("Payment", paymentSchema)
