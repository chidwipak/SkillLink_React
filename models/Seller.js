const mongoose = require("mongoose")

const sellerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  businessName: {
    type: String,
    required: true,
  },
  shopName: {
    type: String,
    default: function() {
      return this.businessName || "My Shop"
    }
  },
  businessDescription: {
    type: String,
    default: "",
  },
  businessAddress: {
    type: String,
    default: "",
  },
  description: String,
  businessEmail: String,
  businessPhone: String,
  gstNumber: String,
  yearsEstablished: {
    type: Number,
    default: 0,
  },
  shopImages: {
    exterior: String,
    interior: String,
  },
  categories: [
    {
      type: String,
      enum: ["electrical", "plumbing", "carpentry"],
    },
  ],
  earnings: {
    type: Number,
    default: 0,
  },
  totalSales: {
    type: Number,
    default: 0,
  },
  rating: {
    type: Number,
    default: 0,
  },
  totalRatings: {
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
  isVerified: {
    type: Boolean,
    default: false,
  },
  verificationDocuments: [String],
  bankDetails: {
    accountName: String,
    accountNumber: String,
    ifscCode: String,
    bankName: String,
  },
})

module.exports = mongoose.model("Seller", sellerSchema)
