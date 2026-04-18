const express = require("express")
const router = express.Router()
const orderController = require("../controllers/orderControllerAPI")
const { authenticateToken } = require("../middleware/jwt")

// All routes require authentication
router.use(authenticateToken)

// Create order
router.post("/", orderController.createOrder)

// Get user's orders (customer)
router.get("/", orderController.getUserOrders)
router.get("/customer", orderController.getUserOrders)

// Get seller's orders
router.get("/seller", orderController.getSellerOrders)

// Get order details
router.get("/:id", orderController.getOrderById)

// Update order status (for sellers)
router.put("/:id/status", orderController.updateOrderStatus)

// Cancel order (for customers)
router.put("/:id/cancel", orderController.cancelOrder)

// Track order
router.get("/:id/track", orderController.trackOrder)

// Pickup OTP verification (for sellers)
router.post("/verify-pickup-otp", orderController.verifyPickupOTP)

// Get pickup OTPs for an order (for sellers)
router.get("/:orderId/pickup-otps", orderController.getPickupOTPs)

module.exports = router
