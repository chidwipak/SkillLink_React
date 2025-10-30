const Service = require("../models/Service")
const Worker = require("../models/Worker")
const User = require("../models/User")

// Get all services
exports.getAllServices = async (req, res) => {
  try {
    const { category, search, limit = 20, page = 1 } = req.query

    const query = {}
    if (category) {
      query.category = category
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ]
    }

    const services = await Service.find(query)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .sort({ createdAt: -1 })

    const total = await Service.countDocuments(query)

    res.json({
      success: true,
      services,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
      },
    })
  } catch (error) {
    console.error("Get services error:", error)
    res.status(500).json({ success: false, message: "Failed to fetch services" })
  }
}

// Get service by ID
exports.getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id)

    if (!service) {
      return res.status(404).json({ success: false, message: "Service not found" })
    }

    // Get available workers for this service
    const workers = await Worker.find({
      serviceCategory: service.category,
      isAvailable: true,
    })
      .populate("user", "name email phone profilePicture isVerified")
      .limit(10)

    res.json({
      success: true,
      service,
      workers,
    })
  } catch (error) {
    console.error("Get service error:", error)
    res.status(500).json({ success: false, message: "Failed to fetch service" })
  }
}

// Get workers for a service category
exports.getWorkersByCategory = async (req, res) => {
  try {
    const { category } = req.params
    const { limit = 20, page = 1, sortBy = "rating" } = req.query

    const query = {
      serviceCategory: category,
    }

    // Only show verified workers to customers
    if (req.user?.role === "customer" || !req.user) {
      query["$or"] = [
        { "user.isVerified": true },
      ]
    }

    const workers = await Worker.find(query)
      .populate("user", "name email phone profilePicture isVerified")
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .sort(sortBy === "rating" ? { rating: -1 } : { createdAt: -1 })

    const total = await Worker.countDocuments(query)

    res.json({
      success: true,
      workers,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
      },
    })
  } catch (error) {
    console.error("Get workers error:", error)
    res.status(500).json({ success: false, message: "Failed to fetch workers" })
  }
}

// Get worker details
exports.getWorkerDetails = async (req, res) => {
  try {
    const worker = await Worker.findById(req.params.id).populate(
      "user",
      "name email phone profilePicture isVerified"
    )

    if (!worker) {
      return res.status(404).json({ success: false, message: "Worker not found" })
    }

    res.json({
      success: true,
      worker,
    })
  } catch (error) {
    console.error("Get worker details error:", error)
    res.status(500).json({ success: false, message: "Failed to fetch worker details" })
  }
}

// Get service categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await Service.distinct("category")

    res.json({
      success: true,
      categories,
    })
  } catch (error) {
    console.error("Get categories error:", error)
    res.status(500).json({ success: false, message: "Failed to fetch categories" })
  }
}

module.exports = exports
