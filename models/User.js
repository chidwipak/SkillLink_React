const mongoose = require("mongoose")

const addressSchema = new mongoose.Schema({
  street: String,
  city: String,
  state: String,
  zipCode: String,
  country: { type: String, default: "India" },
})

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
  },
  role: {
    type: String,
    enum: ["customer", "worker", "seller", "delivery", "admin"],
    default: "customer",
  },
  address: addressSchema,
  addresses: [addressSchema], // Multiple addresses for customers
  profilePicture: {
    type: String,
    default: "/images/default-profile.png",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastLogin: {
    type: Date,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  emailVerificationOTP: String,
  emailVerificationExpiry: Date,
  passwordResetToken: String,
  passwordResetExpiry: Date,
  refreshToken: String,
  notifications: [
    {
      message: String,
      type: {
        type: String,
        enum: ["info", "success", "warning", "error"],
        default: "info",
      },
      isRead: {
        type: Boolean,
        default: false,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
      link: String,
    },
  ],
})

module.exports = mongoose.model("User", userSchema)
