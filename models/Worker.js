const mongoose = require("mongoose")

const pricingSchema = new mongoose.Schema({
  serviceName: String,
  price: {
    type: Number,
    default: 0,
  },
})

const workerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  serviceCategory: {
    type: String,
    enum: ["electrician", "plumber", "carpenter"],
    required: true,
  },
  skills: [String],
  experience: {
    type: Number, // in years
    default: 0,
  },
  professionalEmail: String,
  professionalPhone: String,
  idNumber: String,
  idProofDocument: String,
  pricing: [pricingSchema],
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
  earnings: {
    type: Number,
    default: 0,
  },
  jobsCompleted: {
    type: Number,
    default: 0,
  },
  jobsRejected: {
    type: Number,
    default: 0,
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  verificationDocuments: [String],
  availability: {
    monday: { isAvailable: Boolean, from: String, to: String },
    tuesday: { isAvailable: Boolean, from: String, to: String },
    wednesday: { isAvailable: Boolean, from: String, to: String },
    thursday: { isAvailable: Boolean, from: String, to: String },
    friday: { isAvailable: Boolean, from: String, to: String },
    saturday: { isAvailable: Boolean, from: String, to: String },
    sunday: { isAvailable: Boolean, from: String, to: String },
  },
})

module.exports = mongoose.model("Worker", workerSchema)
