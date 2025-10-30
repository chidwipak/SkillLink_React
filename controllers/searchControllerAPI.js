const Service = require("../models/Service")
const Product = require("../models/Product")
const Worker = require("../models/Worker")

// Search API
exports.search = async (req, res) => {
  try {
    const { query, type } = req.query
    const results = {}

    if (!query) {
      return res.json({ success: true, results: {}, query: "", type: type || "all" })
    }

    const searchRegex = new RegExp(query, "i")

    // Search services
    if (type === "services" || type === "all" || !type) {
      results.services = await Service.find({
        $or: [
          { name: searchRegex },
          { description: searchRegex },
          { category: searchRegex },
        ],
      }).limit(20)
    }

    // Search products
    if (type === "products" || type === "all" || !type) {
      results.products = await Product.find({
        $or: [
          { name: searchRegex },
          { description: searchRegex },
          { brand: searchRegex },
          { category: searchRegex },
        ],
      })
        .populate("seller", "businessName")
        .limit(20)
    }

    // Search workers
    if (type === "workers" || type === "all" || !type) {
      results.workers = await Worker.find({
        $or: [
          { serviceCategory: searchRegex },
          { skills: searchRegex },
        ],
      })
        .populate("user", "name profilePicture")
        .limit(20)
    }

    res.json({ success: true, results, query, type: type || "all" })
  } catch (error) {
    console.error("Search error:", error)
    res.status(500).json({ success: false, message: "Search failed" })
  }
}

module.exports = exports
