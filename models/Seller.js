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
  panNumber: String,
  aadharNumber: String,
  businessRegistrationNumber: String,
  businessLicense: String,
  shopLocation: {
    address: String,
    city: String,
    state: String,
    pincode: String,
    latitude: Number,
    longitude: Number,
  },
  yearsEstablished: {
    type: Number,
    default: 0,
  },
  shopImages: {
    exterior: String,
    interior: String,
  },
  documents: [String], // Array of document file paths (Aadhar, PAN, License, etc.)
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

// DB Optimization: Indexes for seller lookups and filtering
sellerSchema.index({ user: 1 }, { unique: true })
sellerSchema.index({ isVerified: 1 })
sellerSchema.index({ categories: 1 })
sellerSchema.index({ rating: -1 })

module.exports = mongoose.model("Seller", sellerSchema)
