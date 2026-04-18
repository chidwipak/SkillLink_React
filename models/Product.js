const mongoose = require("mongoose")

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  brand: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ["electrical", "plumbing", "carpentry"],
    required: true,
  },
  description: String,
  specifications: [{ key: String, value: String }],
  price: {
    type: Number,
    required: true,
  },
  stock: {
    type: Number,
    required: true,
    default: 0,
  },
  images: [
    {
      type: String,
    },
  ],
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Seller",
    required: true,
  },
  rating: {
    type: Number,
    default: 0,
  },
  reviews: [
    {
      customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      rating: Number,
      comment: String,
      date: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

// DB Optimization: Indexes for product search and filtering
productSchema.index({ seller: 1 })
productSchema.index({ category: 1, price: 1 })
productSchema.index({ name: "text", description: "text", brand: "text" })
productSchema.index({ createdAt: -1 })

module.exports = mongoose.model("Product", productSchema)
