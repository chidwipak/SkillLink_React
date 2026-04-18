const Product = require("../models/Product")
const Seller = require("../models/Seller")
const csvParser = require("csv-parser")
const { Readable } = require("stream")

// Get all products - show all listings from all sellers
exports.getAllProducts = async (req, res) => {
  try {
    const { category, search, minPrice, maxPrice } = req.query
    let query = {}

    if (category) {
      query.category = category
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ]
    }

    if (minPrice || maxPrice) {
      query.price = {}
      if (minPrice) query.price.$gte = parseFloat(minPrice)
      if (maxPrice) query.price.$lte = parseFloat(maxPrice)
    }

    const products = await Product.find(query)
      .populate({
        path: "seller",
        select: "businessName rating totalSales user",
        populate: {
          path: "user",
          select: "name phone address",
        },
      })
      .sort({ name: 1, price: 1 })

    res.json({
      success: true,
      products,
    })
  } catch (error) {
    console.error("Get products error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch products",
    })
  }
}

// Get unique products (grouped by name) for shop listing
exports.getUniqueProducts = async (req, res) => {
  try {
    const { category, search, minPrice, maxPrice } = req.query
    let query = {}

    if (category) {
      query.category = category
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ]
    }

    if (minPrice || maxPrice) {
      query.price = {}
      if (minPrice) query.price.$gte = parseFloat(minPrice)
      if (maxPrice) query.price.$lte = parseFloat(maxPrice)
    }

    const allProducts = await Product.find(query)
      .populate({
        path: "seller",
        select: "businessName rating",
      })
      .sort({ name: 1, price: 1 })

    // Group by product name (case-insensitive)
    const productMap = new Map()
    
    allProducts.forEach(product => {
      // Skip products without a name
      if (!product.name) return
      const key = product.name.toLowerCase().trim()
      if (!productMap.has(key)) {
        productMap.set(key, {
          ...product.toObject(),
          sellerCount: 1,
          lowestPrice: product.stock > 0 ? product.price : Infinity,
          hasStock: product.stock > 0,
          avgRating: product.rating || 0,
          totalReviews: product.reviews ? product.reviews.length : 0,
          _ratingSum: product.rating || 0,
          _ratingCount: product.rating ? 1 : 0
        })
      } else {
        const existing = productMap.get(key)
        existing.sellerCount++
        // Accumulate ratings for averaging
        if (product.rating) {
          existing._ratingSum += product.rating
          existing._ratingCount++
          existing.avgRating = existing._ratingSum / existing._ratingCount
        }
        existing.totalReviews += product.reviews ? product.reviews.length : 0
        if (product.stock > 0) {
          existing.hasStock = true
          if (product.price < existing.lowestPrice) {
            existing.lowestPrice = product.price
            // Update with product that has lower price but keep aggregated data
            const updatedProduct = {
              ...product.toObject(),
              sellerCount: existing.sellerCount,
              lowestPrice: product.price,
              hasStock: true,
              avgRating: existing.avgRating,
              totalReviews: existing.totalReviews,
              _ratingSum: existing._ratingSum,
              _ratingCount: existing._ratingCount
            }
            productMap.set(key, updatedProduct)
          } else {
            productMap.set(key, existing)
          }
        } else {
          productMap.set(key, existing)
        }
      }
    })

    // Convert to array and filter out products with no stock at all
    let products = Array.from(productMap.values())
    
    // Set lowestPrice to actual lowest for display
    products = products.map(p => ({
      ...p,
      lowestPrice: p.lowestPrice === Infinity ? p.price : p.lowestPrice,
      avgRating: Math.round((p.avgRating || 0) * 10) / 10,
      totalReviews: p.totalReviews || 0,
      _ratingSum: undefined,
      _ratingCount: undefined
    }))

    res.json({
      success: true,
      products,
    })
  } catch (error) {
    console.error("Get unique products error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch products",
    })
  }
}

// Get all sellers for a specific product name
exports.getProductByName = async (req, res) => {
  try {
    const { name } = req.params
    
    const products = await Product.find({ 
      name: { $regex: new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
    })
      .populate({
        path: "seller",
        select: "businessName description rating totalSales user shopImages",
        populate: {
          path: "user",
          select: "name phone email address",
        },
      })
      .sort({ stock: -1, price: 1 }) // In-stock first, then by price

    res.json({
      success: true,
      products,
    })
  } catch (error) {
    console.error("Get product by name error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch product sellers",
    })
  }
}

// Get all sellers for a specific product name
exports.getProductSellers = async (req, res) => {
  try {
    const { name } = req.params
    
    const products = await Product.find({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') },
      stock: { $gt: 0 }
    })
      .populate({
        path: "seller",
        select: "businessName description rating totalSales user shopImages",
        populate: {
          path: "user",
          select: "name phone email address",
        },
      })
      .sort({ price: 1 }) // Sort by price ascending

    res.json({
      success: true,
      products,
    })
  } catch (error) {
    console.error("Get product sellers error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch sellers",
    })
  }
}

// Get seller's products - returns products from seller's categories
exports.getMyProducts = async (req, res) => {
  try {
    const seller = await Seller.findOne({ user: req.user.userId })
    if (!seller) {
      return res.status(404).json({
        success: false,
        message: "Seller profile not found",
      })
    }

    // Get products from seller's categories (their own products)
    const products = await Product.find({ 
      seller: seller._id 
    }).sort({ category: 1, name: 1 })

    res.json({
      success: true,
      products,
      categories: seller.categories
    })
  } catch (error) {
    console.error("Get my products error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch products",
    })
  }
}

// Update product price (seller only)
exports.updateProductPrice = async (req, res) => {
  try {
    const seller = await Seller.findOne({ user: req.user.userId })
    if (!seller) {
      return res.status(404).json({
        success: false,
        message: "Seller profile not found",
      })
    }

    const { price } = req.body
    if (!price || price <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid price is required",
      })
    }

    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, seller: seller._id },
      { price: parseFloat(price) },
      { new: true }
    )

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found or not authorized",
      })
    }

    res.json({
      success: true,
      message: "Price updated successfully",
      product,
    })
  } catch (error) {
    console.error("Update price error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to update price",
    })
  }
}

// Toggle product stock status (in stock / out of stock)
exports.toggleProductStock = async (req, res) => {
  try {
    const seller = await Seller.findOne({ user: req.user.userId })
    if (!seller) {
      return res.status(404).json({
        success: false,
        message: "Seller profile not found",
      })
    }

    const { inStock } = req.body
    const stockValue = inStock ? 50 : 0 // If marking in stock, set to 50, otherwise 0

    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, seller: seller._id },
      { stock: stockValue },
      { new: true }
    )

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found or not authorized",
      })
    }

    res.json({
      success: true,
      message: inStock ? "Product marked as in stock" : "Product marked as out of stock",
      product,
    })
  } catch (error) {
    console.error("Toggle stock error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to update stock status",
    })
  }
}

// Get product by ID
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("seller", "businessName description")
      .populate({
        path: "seller",
        populate: {
          path: "user",
          select: "name phone email isVerified",
        },
      })

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      })
    }

    res.json({
      success: true,
      product,
    })
  } catch (error) {
    console.error("Get product error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch product",
    })
  }
}

// Create product (seller only)
exports.createProduct = async (req, res) => {
  try {
    const seller = await Seller.findOne({ user: req.user.userId })

    if (!seller) {
      return res.status(404).json({
        success: false,
        message: "Seller profile not found",
      })
    }

    const { name, brand, description, price, category, stock } = req.body

    // Validate category is in seller's categories
    if (!seller.categories.includes(category)) {
      return res.status(400).json({
        success: false,
        message: "You can only add products in your registered categories",
      })
    }

    // Handle uploaded images
    let images = []
    if (req.files && req.files.length > 0) {
      images = req.files.map(file => `/uploads/products/${file.filename}`)
    }

    const product = new Product({
      name,
      brand: brand || 'Generic',
      description,
      price: parseFloat(price),
      category,
      stock: parseInt(stock) || 50,
      images,
      seller: seller._id,
    })

    await product.save()

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    })
  } catch (error) {
    console.error("Create product error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to create product",
    })
  }
}

// Update product (seller only)
exports.updateProduct = async (req, res) => {
  try {
    const seller = await Seller.findOne({ user: req.user.userId })

    if (!seller) {
      return res.status(404).json({
        success: false,
        message: "Seller profile not found",
      })
    }

    const product = await Product.findOne({
      _id: req.params.id,
      seller: seller._id,
    })

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found or not authorized",
      })
    }

    Object.assign(product, req.body)
    await product.save()

    res.json({
      success: true,
      message: "Product updated successfully",
      product,
    })
  } catch (error) {
    console.error("Update product error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to update product",
    })
  }
}

// Delete product (seller only)
exports.deleteProduct = async (req, res) => {
  try {
    const seller = await Seller.findOne({ user: req.user.userId })

    if (!seller) {
      return res.status(404).json({
        success: false,
        message: "Seller profile not found",
      })
    }

    const product = await Product.findOneAndDelete({
      _id: req.params.id,
      seller: seller._id,
    })

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found or not authorized",
      })
    }

    res.json({
      success: true,
      message: "Product deleted successfully",
    })
  } catch (error) {
    console.error("Delete product error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to delete product",
    })
  }
}

// Bulk CSV product upload (seller only)
exports.csvUploadProducts = async (req, res) => {
  try {
    const seller = await Seller.findOne({ user: req.user.userId })
    if (!seller) {
      return res.status(404).json({ success: false, message: "Seller profile not found" })
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: "Please upload a CSV file" })
    }

    const results = []
    const errors = []
    let rowNum = 0

    // Parse CSV from buffer
    await new Promise((resolve, reject) => {
      const stream = Readable.from(req.file.buffer)
      stream
        .pipe(csvParser())
        .on("data", (row) => {
          rowNum++
          // Normalize keys to lowercase and trim
          const r = {}
          Object.keys(row).forEach((k) => { r[k.trim().toLowerCase()] = (row[k] || '').trim() })

          const name = r.name || r.product_name || r.productname
          const brand = r.brand || 'Generic'
          const category = r.category
          const price = parseFloat(r.price)
          const stock = parseInt(r.stock || r.quantity) || 50
          const description = r.description || ''

          if (!name) { errors.push({ row: rowNum, error: "Missing product name" }); return }
          if (!category || !['electrical', 'plumbing', 'carpentry'].includes(category.toLowerCase())) {
            errors.push({ row: rowNum, error: `Invalid category "${category}". Must be electrical, plumbing, or carpentry` }); return
          }
          if (isNaN(price) || price <= 0) { errors.push({ row: rowNum, error: "Invalid or missing price" }); return }

          const cat = category.toLowerCase()
          if (!seller.categories.includes(cat)) {
            errors.push({ row: rowNum, error: `Category "${cat}" not in your registered categories` }); return
          }

          results.push({ name, brand, category: cat, description, price, stock, seller: seller._id })
        })
        .on("end", resolve)
        .on("error", reject)
    })

    if (results.length === 0) {
      return res.status(400).json({ success: false, message: "No valid products found in CSV", errors })
    }

    const inserted = await Product.insertMany(results)

    res.status(201).json({
      success: true,
      message: `Successfully uploaded ${inserted.length} products`,
      productsCreated: inserted.length,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (error) {
    console.error("CSV upload error:", error)
    res.status(500).json({ success: false, message: "Failed to process CSV upload" })
  }
}

module.exports = exports
