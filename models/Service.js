const mongoose = require("mongoose")

const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ["electrician", "plumber", "carpenter"],
    required: true,
  },
  subcategory: String,
  description: String,
  price: {
    type: Number,
    required: true,
  },
  duration: {
    type: Number, // in minutes
    default: 60,
  },
  image: {
    type: String,
    default: "/images/default-service.jpg",
  },
})

module.exports = mongoose.model("Service", serviceSchema)
