const Worker = require("../models/Worker")
const Product = require("../models/Product")
const Order = require("../models/Order")
const Seller = require("../models/Seller")
const Booking = require("../models/Booking")

// Add review for worker
exports.addWorkerReview = async (req, res) => {
  try {
    const { workerId, rating, comment, bookingId } = req.body
    const userId = req.user.userId

    const worker = await Worker.findById(workerId)
    if (!worker) {
      return res.status(404).json({ success: false, message: "Worker not found" })
    }

    const ratingValue = parseFloat(rating)
    if (isNaN(ratingValue) || ratingValue < 1 || ratingValue > 5) {
      return res.status(400).json({ success: false, message: "Invalid rating value" })
    }

    if (bookingId) {
      const booking = await Booking.findById(bookingId)
      if (!booking) {
        return res.status(404).json({ success: false, message: "Booking not found" })
      }
      if (booking.customer.toString() !== userId) {
        return res.status(403).json({ success: false, message: "You can only review your own bookings" })
      }
      if (booking.status !== "completed") {
        return res.status(400).json({ success: false, message: "You can only review completed bookings" })
      }
      if (booking.isReviewed) {
        return res.status(400).json({ success: false, message: "You have already reviewed this booking" })
      }
      booking.isReviewed = true
      await booking.save()
    }

    worker.reviews.push({
      customer: userId,
      rating: ratingValue,
      comment,
      date: new Date(),
    })

    const totalRating = worker.reviews.reduce((sum, review) => sum + review.rating, 0)
    worker.rating = totalRating / worker.reviews.length
    await worker.save()

    res.json({ success: true, message: "Review added successfully" })
  } catch (error) {
    console.error("Add worker review error:", error)
    res.status(500).json({ success: false, message: "Failed to add review" })
  }
}

// Add review for product
exports.addProductReview = async (req, res) => {
  try {
    const { productId, rating, comment, orderId } = req.body
    const userId = req.user.userId

    const product = await Product.findById(productId)
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" })
    }

    const ratingValue = parseFloat(rating)
    if (isNaN(ratingValue) || ratingValue < 1 || ratingValue > 5) {
      return res.status(400).json({ success: false, message: "Invalid rating value" })
    }

    if (orderId) {
      const order = await Order.findById(orderId)
      if (!order) {
        return res.status(404).json({ success: false, message: "Order not found" })
      }
      if (order.customer.toString() !== userId) {
        return res.status(403).json({ success: false, message: "You can only review products from your own orders" })
      }

      const orderItem = order.items.find((item) => item.product?.toString() === productId)
      if (!orderItem) {
        return res.status(404).json({ success: false, message: "Product not found in this order" })
      }
      if (orderItem.status !== "delivered") {
        return res.status(400).json({ success: false, message: "You can only review delivered products" })
      }
      if (orderItem.isReviewed) {
        return res.status(400).json({ success: false, message: "You have already reviewed this product" })
      }
      orderItem.isReviewed = true
      await order.save()
    }

    product.reviews.push({
      customer: userId,
      rating: ratingValue,
      comment,
      date: new Date(),
    })

    const totalRating = product.reviews.reduce((sum, review) => sum + review.rating, 0)
    product.rating = totalRating / product.reviews.length
    await product.save()

    // Update seller rating
    const seller = await Seller.findById(product.seller)
    if (seller) {
      const products = await Product.find({ seller: seller._id })
      let totalSellerRating = 0
      let totalReviews = 0
      products.forEach((p) => {
        if (p.reviews?.length > 0) {
          p.reviews.forEach((r) => {
            totalSellerRating += r.rating
            totalReviews++
          })
        }
      })
      if (totalReviews > 0) {
        seller.rating = totalSellerRating / totalReviews
        await seller.save()
      }
    }

    res.json({ success: true, message: "Review added successfully" })
  } catch (error) {
    console.error("Add product review error:", error)
    res.status(500).json({ success: false, message: "Failed to add review" })
  }
}

// Get worker reviews
exports.getWorkerReviews = async (req, res) => {
  try {
    const worker = await Worker.findById(req.params.workerId)
      .populate("reviews.customer", "name profilePicture")
    
    if (!worker) {
      return res.status(404).json({ success: false, message: "Worker not found" })
    }

    res.json({ success: true, reviews: worker.reviews, rating: worker.rating })
  } catch (error) {
    console.error("Get worker reviews error:", error)
    res.status(500).json({ success: false, message: "Failed to fetch reviews" })
  }
}

// Get product reviews
exports.getProductReviews = async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId)
      .populate("reviews.customer", "name profilePicture")
    
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" })
    }

    res.json({ success: true, reviews: product.reviews, rating: product.rating })
  } catch (error) {
    console.error("Get product reviews error:", error)
    res.status(500).json({ success: false, message: "Failed to fetch reviews" })
  }
}

module.exports = exports
