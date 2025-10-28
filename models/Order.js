const mongoose = require("mongoose")

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  price: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "processing", "shipped", "delivered", "rejected", "cancelled"],
    default: "pending",
  },
  isReviewed: {
    type: Boolean,
    default: false,
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Seller",
    required: true,
  },
})

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    unique: true,
    sparse: true,
  },
  orderNumber: {
    type: String,
    unique: true,
    sparse: true,
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  items: [orderItemSchema],
  subtotal: {
    type: Number,
    default: 0,
  },
  platformFee: {
    type: Number,
    default: 0,
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  shippingAddress: {
    name: String,
    phone: String,
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: { type: String, default: "India" },
  },
  // Pickup address from seller's shop
  pickupAddress: {
    name: String,
    phone: String,
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: { type: String, default: "India" },
  },
  status: {
    type: String,
    enum: ["pending", "confirmed", "assigned_delivery", "out_for_delivery", "delivered", "cancelled", "returned"],
    default: "pending",
  },
  payment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Payment",
  },
  paymentStatus: {
    type: String,
    enum: ["pending", "completed", "failed", "refunded"],
    default: "pending",
  },
  // Delivery Person assignment
  deliveryPerson: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "DeliveryPerson",
  },
  deliveryFee: {
    type: Number,
    default: 50,
  },
  // 4-digit OTP for delivery verification
  deliveryOTP: {
    type: String,
  },
  deliveryOTPVerified: {
    type: Boolean,
    default: false,
  },
  // Seller handover tracking
  isHandedToDelivery: {
    type: Boolean,
    default: false,
  },
  handedToDeliveryAt: Date,
  estimatedDeliveryDate: Date,
  actualDeliveryDate: Date,
  trackingUpdates: [
    {
      status: String,
      message: String,
      timestamp: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  customerNotes: String,
  sellerNotes: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
})

// Generate order number and orderId, update the updatedAt field before saving
orderSchema.pre("save", function (next) {
  this.updatedAt = new Date()
  
  // Generate order number if not exists
  if (!this.orderNumber) {
    const timestamp = Date.now().toString(36)
    const random = Math.random().toString(36).substr(2, 5)
    this.orderNumber = `ORD-${timestamp}-${random}`.toUpperCase()
  }
  
  // Generate orderId if not exists
  if (!this.orderId) {
    const timestamp = Date.now().toString(36)
    const random = Math.random().toString(36).substr(2, 5)
    this.orderId = `${timestamp}${random}`.toUpperCase()
  }
  
  next()
})

module.exports = mongoose.model("Order", orderSchema)
