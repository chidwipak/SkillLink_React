const Order = require("../models/Order")
const Product = require("../models/Product")
const Seller = require("../models/Seller")
const Payment = require("../models/Payment")
const DeliveryAssignment = require("../models/DeliveryAssignment")
const Notification = require("../models/Notification")

// Create order
exports.createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod } = req.body

    console.log("Create order request:", JSON.stringify(req.body, null, 2))

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Order must contain at least one item",
      })
    }

    // Calculate totals and validate products
    let subtotal = 0
    const orderItems = []

    for (const item of items) {
      // Support both productId and product field names
      const productId = item.productId || item.product || item._id
      console.log("Looking for product:", productId)
      
      if (!productId) {
        return res.status(400).json({
          success: false,
          message: `Invalid item - no product ID provided`,
        })
      }

      const product = await Product.findById(productId)
      if (!product) {
        console.log("Product not found for ID:", productId)
        return res.status(404).json({
          success: false,
          message: `Product with ID ${productId} not found`,
        })
      }

      console.log("Found product:", product.name)

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}`,
        })
      }

      const itemTotal = (item.price || product.price) * item.quantity
      subtotal += itemTotal

      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        price: item.price || product.price,
        seller: product.seller,
        status: "pending",
      })

      // Reduce stock
      product.stock -= item.quantity
      await product.save()
    }

    const deliveryFee = 50
    const platformFee = Math.round(subtotal * 0.02) // 2% platform fee
    const total = subtotal + deliveryFee + platformFee

    // Create order
    const order = new Order({
      customer: req.user.userId,
      items: orderItems,
      shippingAddress: {
        name: shippingAddress.name,
        phone: shippingAddress.phone,
        street: shippingAddress.address || shippingAddress.street,
        city: shippingAddress.city,
        state: shippingAddress.state,
        zipCode: shippingAddress.pincode || shippingAddress.zipCode,
        country: shippingAddress.country || "India",
      },
      totalAmount: total,
      subtotal,
      deliveryFee,
      platformFee,
      paymentStatus: req.body.paymentStatus === 'completed' ? 'completed' : 'pending',
      status: "pending",
      trackingUpdates: [
        {
          status: "pending",
          message: "Order placed successfully",
          timestamp: new Date(),
        },
      ],
    })

    await order.save()

    // Create payment record if online payment
    if (paymentMethod === "razorpay") {
      const payment = new Payment({
        user: req.user.userId,
        order: order._id,
        amount: total,
        method: "razorpay",
        status: "pending",
      })
      await payment.save()
      order.payment = payment._id
      await order.save()
    }

    // Notify sellers (optional - don't fail order if notification fails)
    try {
      const uniqueSellers = [...new Set(orderItems.map((item) => item.seller.toString()))]
      for (const sellerId of uniqueSellers) {
        const seller = await Seller.findById(sellerId)
        if (seller) {
          await Notification.create({
            user: seller.user,
            title: "New Order Received",
            message: `You have a new order #${order.orderNumber}`,
            type: "order",
            link: `/dashboard/seller/orders`,
            data: { orderId: order._id },
          })
        }
      }
    } catch (notifError) {
      console.error("Notification error:", notifError)
    }

    res.status(201).json({
      success: true,
      message: "Order placed successfully!",
      order,
    })
  } catch (error) {
    console.error("Create order error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to create order",
    })
  }
}

// Get user orders
exports.getUserOrders = async (req, res) => {
  try {
    const { status } = req.query
    let query = { customer: req.user.userId }

    if (status) {
      query.status = status
    }

    const orders = await Order.find(query)
      .populate("customer", "name phone email")
      .populate({
        path: "items.product",
        select: "name price images",
      })
      .populate({
        path: "items.seller",
        select: "businessName user",
        populate: { path: "user", select: "name" }
      })
      .populate("payment")
      .populate({
        path: "deliveryPerson",
        populate: { path: "user", select: "name phone" }
      })
      .sort({ createdAt: -1 })

    res.json({
      success: true,
      orders,
    })
  } catch (error) {
    console.error("Get orders error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
    })
  }
}

// Get seller orders
exports.getSellerOrders = async (req, res) => {
  try {
    const { status } = req.query
    const seller = await Seller.findOne({ user: req.user.userId })
    
    if (!seller) {
      return res.status(404).json({
        success: false,
        message: "Seller profile not found",
      })
    }

    let query = { "items.seller": seller._id }
    if (status) {
      query.status = status
    }

    const orders = await Order.find(query)
      .populate("customer", "name phone email")
      .populate({
        path: "items.product",
        select: "name price images",
      })
      .populate("payment")
      .sort({ createdAt: -1 })

    res.json({
      success: true,
      orders,
    })
  } catch (error) {
    console.error("Get seller orders error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
    })
  }
}

// Get order by ID
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("customer", "name phone email")
      .populate({
        path: "items.product",
        select: "name price images description",
      })
      .populate({
        path: "items.seller",
        populate: {
          path: "user",
          select: "name phone email",
        },
      })
      .populate("payment")
      .populate({
        path: "deliveryPerson",
        populate: { path: "user", select: "name phone" }
      })

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      })
    }

    // Check authorization
    const seller = await Seller.findOne({ user: req.user.userId })
    const isAuthorized =
      order.customer._id.toString() === req.user.userId ||
      (seller &&
        order.items.some((item) => item.seller?._id?.toString() === seller._id.toString())) ||
      req.user.role === "admin" ||
      req.user.role === "delivery"

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this order",
      })
    }

    res.json({
      success: true,
      order,
    })
  } catch (error) {
    console.error("Get order error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch order",
    })
  }
}

// Update order status (seller/admin)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, notes } = req.body
    const order = await Order.findById(req.params.id)

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      })
    }

    // Check authorization
    if (req.user.role !== "admin") {
      const seller = await Seller.findOne({ user: req.user.userId })
      if (
        !seller ||
        !order.items.some((item) => item.seller.toString() === seller._id.toString())
      ) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to update this order",
        })
      }
    }

    order.status = status
    order.statusHistory.push({
      status,
      timestamp: new Date(),
      notes,
    })

    await order.save()

    // Create notification for customer
    await Notification.create({
      user: order.customer,
      title: "Order Status Updated",
      message: `Your order #${order.orderNumber} status has been updated to ${status}`,
      type: "order",
      link: `/dashboard/orders/${order._id}`,
      data: { orderId: order._id, status },
    })

    // Emit socket event
    if (req.app.io) {
      req.app.io.to(`user-${order.customer}`).emit("order-updated", {
        orderId: order._id,
        status,
      })
    }

    res.json({
      success: true,
      message: "Order status updated successfully",
      order,
    })
  } catch (error) {
    console.error("Update order status error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to update order status",
    })
  }
}

// Cancel order
exports.cancelOrder = async (req, res) => {
  try {
    const { reason } = req.body
    const order = await Order.findById(req.params.id)

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      })
    }

    // Check if user is the customer
    if (order.customer.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to cancel this order",
      })
    }

    // Can only cancel pending or processing orders
    if (!["pending", "processing"].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: "Cannot cancel order in current status",
      })
    }

    order.status = "cancelled"
    order.statusHistory.push({
      status: "cancelled",
      timestamp: new Date(),
      notes: reason,
    })

    await order.save()

    // Restore product stock
    for (const item of order.items) {
      const product = await Product.findById(item.product)
      if (product) {
        product.stock += item.quantity
        await product.save()
      }
    }

    res.json({
      success: true,
      message: "Order cancelled successfully",
      order,
    })
  } catch (error) {
    console.error("Cancel order error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to cancel order",
    })
  }
}

// Track order
exports.trackOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate({
        path: "deliveryPerson",
        populate: { path: "user", select: "name phone" }
      })
      .select("orderNumber status trackingUpdates deliveryPerson customer")

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      })
    }

    // Check if user is the customer
    if (order.customer.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to track this order",
      })
    }

    res.json({
      success: true,
      order,
    })
  } catch (error) {
    console.error("Track order error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to track order",
    })
  }
}

// Verify pickup OTP and hand over to delivery (for sellers)
exports.verifyPickupOTP = async (req, res) => {
  try {
    const { orderId, otp } = req.body

    // Get seller from user ID
    const seller = await Seller.findOne({ user: req.user.userId })
    if (!seller) {
      return res.status(404).json({
        success: false,
        message: "Seller profile not found",
      })
    }
    const sellerId = seller._id

    const order = await Order.findById(orderId)
      .populate("customer", "name")
      .populate("deliveryPerson")

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      })
    }

    // Find items belonging to this seller
    const sellerItems = order.items.filter(
      item => item.seller?.toString() === sellerId?.toString()
    )

    if (sellerItems.length === 0) {
      return res.status(403).json({
        success: false,
        message: "No items from your store in this order",
      })
    }

    // Check if any item matches the OTP
    let verifiedItem = null
    for (const item of sellerItems) {
      if (item.pickupOTP === otp && !item.pickupOTPVerified) {
        item.pickupOTPVerified = true
        item.handedToDelivery = true
        item.handedAt = new Date()
        item.status = "shipped"
        verifiedItem = item
        break
      }
    }

    if (!verifiedItem) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP or already verified",
      })
    }

    // Check if all items from all sellers have been handed over
    const allItemsHandedOver = order.items.every(item => item.handedToDelivery)
    
    if (allItemsHandedOver) {
      order.status = "out_for_delivery"
      order.isHandedToDelivery = true
      order.handedToDeliveryAt = new Date()
      order.trackingUpdates.push({
        status: "out_for_delivery",
        message: "All items collected. Package is out for delivery.",
        timestamp: new Date(),
      })
    } else {
      order.trackingUpdates.push({
        status: "partial_pickup",
        message: "Some items collected from seller. Waiting for remaining pickups.",
        timestamp: new Date(),
      })
    }

    await order.save()

    res.json({
      success: true,
      message: allItemsHandedOver 
        ? "All items handed over. Order is out for delivery!" 
        : "Item handed over successfully. Waiting for other sellers.",
      allItemsReady: allItemsHandedOver,
    })
  } catch (error) {
    console.error("Verify pickup OTP error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to verify pickup OTP",
    })
  }
}

// Get pickup OTPs for seller's items (seller view)
exports.getPickupOTPs = async (req, res) => {
  try {
    const orderId = req.params.orderId

    // Get seller from user ID
    const seller = await Seller.findOne({ user: req.user.userId })
    if (!seller) {
      return res.status(404).json({
        success: false,
        message: "Seller profile not found",
      })
    }
    const sellerId = seller._id

    const order = await Order.findById(orderId)
      .populate("items.product", "name")
      .populate("deliveryPerson")

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      })
    }

    // Find items belonging to this seller
    const sellerItems = order.items
      .filter(item => item.seller?.toString() === sellerId?.toString())
      .map(item => ({
        product: item.product?.name,
        quantity: item.quantity,
        pickupOTP: item.pickupOTP,
        handedToDelivery: item.handedToDelivery,
        handedAt: item.handedAt,
      }))

    res.json({
      success: true,
      items: sellerItems,
      orderStatus: order.status,
      deliveryAssigned: !!order.deliveryPerson,
    })
  } catch (error) {
    console.error("Get pickup OTPs error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to get pickup OTPs",
    })
  }
}

module.exports = exports
