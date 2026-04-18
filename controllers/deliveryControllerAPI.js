const Order = require("../models/Order")
const DeliveryPerson = require("../models/DeliveryPerson")
const Seller = require("../models/Seller")
const User = require("../models/User")
const Notification = require("../models/Notification")

// Generate 4-digit OTP
const generateOTP = () => {
  return Math.floor(1000 + Math.random() * 9000).toString()
}

// Get delivery person dashboard stats
exports.getDashboardStats = async (req, res) => {
  try {
    const deliveryPerson = await DeliveryPerson.findOne({ user: req.user.userId })
    
    if (!deliveryPerson) {
      return res.status(404).json({
        success: false,
        message: "Delivery person profile not found",
      })
    }

    // Count pending requests
    const pendingRequests = deliveryPerson.pendingRequests?.length || 0

    // Count active delivery
    const activeDelivery = deliveryPerson.activeDelivery ? 1 : 0

    // Get today's completed deliveries
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const todayDeliveries = await Order.countDocuments({
      deliveryPerson: deliveryPerson._id,
      status: "delivered",
      actualDeliveryDate: { $gte: today },
    })

    // Calculate today's earnings (₹50 per delivery)
    const todayEarnings = todayDeliveries * 50

    res.json({
      success: true,
      stats: {
        pendingRequests,
        activeDelivery,
        todayDeliveries,
        todayEarnings,
        totalDeliveries: deliveryPerson.totalDeliveries,
        totalEarnings: deliveryPerson.earnings,
        rating: deliveryPerson.rating,
        isAvailable: deliveryPerson.isAvailable,
      },
    })
  } catch (error) {
    console.error("Get delivery stats error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard stats",
    })
  }
}

// Get pending delivery requests
exports.getPendingRequests = async (req, res) => {
  try {
    const deliveryPerson = await DeliveryPerson.findOne({ user: req.user.userId })
      .populate({
        path: "pendingRequests.order",
        populate: [
          { path: "customer", select: "name phone address addresses" },
          { path: "items.product", select: "name images" },
          { path: "items.seller", populate: { path: "user", select: "name phone address" } },
        ],
      })
      .populate({
        path: "pendingRequests.seller",
        select: "businessName shopAddress shopName shopLocation user",
        populate: { path: "user", select: "name phone address" },
      })

    if (!deliveryPerson) {
      return res.status(404).json({
        success: false,
        message: "Delivery person profile not found",
      })
    }

    res.json({
      success: true,
      requests: deliveryPerson.pendingRequests || [],
    })
  } catch (error) {
    console.error("Get pending requests error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch pending requests",
    })
  }
}

// Accept delivery request
exports.acceptDeliveryRequest = async (req, res) => {
  try {
    const { orderId } = req.params
    const deliveryPerson = await DeliveryPerson.findOne({ user: req.user.userId })

    if (!deliveryPerson) {
      return res.status(404).json({
        success: false,
        message: "Delivery person profile not found",
      })
    }

    // Check if already has an active delivery
    if (deliveryPerson.activeDelivery) {
      return res.status(400).json({
        success: false,
        message: "You already have an active delivery. Complete it first.",
      })
    }

    const order = await Order.findById(orderId)
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      })
    }

    // Check if order is still available for pickup
    if (order.deliveryPerson) {
      return res.status(400).json({
        success: false,
        message: "This order has already been assigned to another delivery person",
      })
    }

    // Generate 4-digit OTP for final delivery verification
    const otp = generateOTP()

    // Generate pickup OTPs for each unique seller in the order
    const uniqueSellers = [...new Set(order.items.map(item => item.seller?.toString()))]
    for (const item of order.items) {
      item.pickupOTP = generateOTP()
      item.pickupOTPVerified = false
      item.handedToDelivery = false
    }

    // Update order
    order.deliveryPerson = deliveryPerson._id
    order.status = "assigned_delivery"
    order.deliveryOTP = otp
    order.trackingUpdates.push({
      status: "assigned_delivery",
      message: `Delivery partner assigned. Waiting for pickup from ${uniqueSellers.length > 1 ? uniqueSellers.length + ' sellers' : 'seller'}.`,
      timestamp: new Date(),
    })
    await order.save()

    // Update delivery person - set active delivery and clear from pending
    deliveryPerson.activeDelivery = order._id
    deliveryPerson.pendingRequests = deliveryPerson.pendingRequests.filter(
      (req) => req.order.toString() !== orderId
    )
    await deliveryPerson.save()

    // Remove this order from all other delivery persons' pending requests
    await DeliveryPerson.updateMany(
      { "pendingRequests.order": orderId },
      { $pull: { pendingRequests: { order: orderId } } }
    )

    // Notify customer
    try {
      await Notification.create({
        user: order.customer,
        title: "Delivery Partner Assigned",
        message: `A delivery partner has been assigned for your order #${order.orderNumber}`,
        type: "order",
        link: `/dashboard/customer/orders`,
      })
    } catch (e) { console.error("Notification error:", e) }

    // Notify seller
    try {
      const seller = await Seller.findById(order.items[0].seller)
      if (seller) {
        await Notification.create({
          user: seller.user,
          title: "Delivery Partner Assigned",
          message: `Delivery partner assigned for order #${order.orderNumber}. Please prepare for handover.`,
          type: "order",
          link: `/dashboard/seller/orders`,
        })
      }
    } catch (e) { console.error("Notification error:", e) }

    res.json({
      success: true,
      message: "Delivery request accepted successfully",
      order,
    })
  } catch (error) {
    console.error("Accept delivery error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to accept delivery request",
    })
  }
}

// Get active delivery
exports.getActiveDelivery = async (req, res) => {
  try {
    const deliveryPerson = await DeliveryPerson.findOne({ user: req.user.userId })

    if (!deliveryPerson) {
      return res.status(404).json({
        success: false,
        message: "Delivery person profile not found",
      })
    }

    if (!deliveryPerson.activeDelivery) {
      return res.json({
        success: true,
        activeDelivery: null,
      })
    }

    const order = await Order.findById(deliveryPerson.activeDelivery)
      .populate("customer", "name phone address addresses")
      .populate({
        path: "items.product",
        select: "name images price",
      })
      .populate({
        path: "items.seller",
        select: "businessName shopAddress shopName shopLocation user",
        populate: { path: "user", select: "name phone address" },
      })

    res.json({
      success: true,
      activeDelivery: order,
    })
  } catch (error) {
    console.error("Get active delivery error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch active delivery",
    })
  }
}

// Verify OTP and complete delivery
exports.verifyOTPAndDeliver = async (req, res) => {
  try {
    const { orderId } = req.params
    const { otp } = req.body

    const deliveryPerson = await DeliveryPerson.findOne({ user: req.user.userId })
    if (!deliveryPerson) {
      return res.status(404).json({
        success: false,
        message: "Delivery person profile not found",
      })
    }

    const order = await Order.findById(orderId)
      .populate({
        path: "items.seller",
        select: "user earnings totalSales",
      })

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      })
    }

    // Verify OTP
    if (order.deliveryOTP !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP. Please enter the correct code.",
      })
    }

    // Update order status
    order.status = "delivered"
    order.deliveryOTPVerified = true
    order.actualDeliveryDate = new Date()
    order.trackingUpdates.push({
      status: "delivered",
      message: "Order delivered successfully",
      timestamp: new Date(),
    })

    // Update all items status
    order.items.forEach((item) => {
      item.status = "delivered"
    })
    await order.save()

    // Update delivery person stats
    deliveryPerson.activeDelivery = null
    deliveryPerson.totalDeliveries += 1
    deliveryPerson.earnings += 50 // ₹50 per delivery
    await deliveryPerson.save()

    // Update seller earnings
    for (const item of order.items) {
      const seller = await Seller.findById(item.seller._id || item.seller)
      if (seller) {
        seller.earnings = (seller.earnings || 0) + (item.price * item.quantity)
        seller.totalSales = (seller.totalSales || 0) + 1
        await seller.save()
      }
    }

    // Notify customer
    try {
      await Notification.create({
        user: order.customer,
        title: "Order Delivered",
        message: `Your order #${order.orderNumber} has been delivered successfully!`,
        type: "order",
        link: `/dashboard/customer/orders`,
      })
    } catch (e) { console.error("Notification error:", e) }

    res.json({
      success: true,
      message: "Order delivered successfully!",
      order,
    })
  } catch (error) {
    console.error("Verify OTP error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to verify OTP",
    })
  }
}

// Toggle availability
exports.toggleAvailability = async (req, res) => {
  try {
    const deliveryPerson = await DeliveryPerson.findOne({ user: req.user.userId })

    if (!deliveryPerson) {
      return res.status(404).json({
        success: false,
        message: "Delivery person profile not found",
      })
    }

    deliveryPerson.isAvailable = !deliveryPerson.isAvailable
    await deliveryPerson.save()

    res.json({
      success: true,
      message: `You are now ${deliveryPerson.isAvailable ? "available" : "unavailable"} for deliveries`,
      isAvailable: deliveryPerson.isAvailable,
    })
  } catch (error) {
    console.error("Toggle availability error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to update availability",
    })
  }
}

// Get delivery history
exports.getDeliveryHistory = async (req, res) => {
  try {
    const deliveryPerson = await DeliveryPerson.findOne({ user: req.user.userId })

    if (!deliveryPerson) {
      return res.status(404).json({
        success: false,
        message: "Delivery person profile not found",
      })
    }

    const deliveries = await Order.find({
      deliveryPerson: deliveryPerson._id,
      status: "delivered",
    })
      .populate("customer", "name")
      .populate("items.product", "name")
      .sort({ actualDeliveryDate: -1 })
      .limit(50)

    res.json({
      success: true,
      deliveries,
    })
  } catch (error) {
    console.error("Get delivery history error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch delivery history",
    })
  }
}

// Seller: Assign order to delivery (broadcast to all delivery persons)
exports.assignToDelivery = async (req, res) => {
  try {
    const { orderId } = req.params
    
    // Verify seller owns this order
    const seller = await Seller.findOne({ user: req.user.userId }).populate("user", "address")
    if (!seller) {
      return res.status(404).json({
        success: false,
        message: "Seller profile not found",
      })
    }

    // Check if seller has provided shop address
    const sellerUser = await User.findById(seller.user._id || seller.user)
    if (!sellerUser?.address?.street || !sellerUser?.address?.city) {
      return res.status(400).json({
        success: false,
        message: "Please add your shop address before assigning orders for delivery. This is required for the delivery partner to pick up the package.",
      })
    }

    const order = await Order.findById(orderId)
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      })
    }

    // Check if seller owns this order
    const hasSellerItems = order.items.some(
      (item) => item.seller.toString() === seller._id.toString()
    )
    if (!hasSellerItems) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to assign this order",
      })
    }

    // Check if already assigned
    if (order.deliveryPerson) {
      return res.status(400).json({
        success: false,
        message: "This order already has a delivery person assigned",
      })
    }

    // Store seller's pickup address on the order
    order.pickupAddress = {
      name: seller.businessName || sellerUser.name,
      phone: sellerUser.phone,
      street: sellerUser.address.street,
      city: sellerUser.address.city,
      state: sellerUser.address.state,
      zipCode: sellerUser.address.zipCode,
      country: sellerUser.address.country || "India",
    }

    // Update order status
    order.status = "confirmed"
    order.trackingUpdates.push({
      status: "confirmed",
      message: "Order confirmed by seller. Looking for delivery partner.",
      timestamp: new Date(),
    })
    await order.save()

    // Get all available delivery persons
    const availableDeliveryPersons = await DeliveryPerson.find({
      isAvailable: true,
      isVerified: true,
      activeDelivery: null,
    })

    // Add this order to all available delivery persons' pending requests
    for (const dp of availableDeliveryPersons) {
      dp.pendingRequests.push({
        order: order._id,
        seller: seller._id,
        requestedAt: new Date(),
      })
      await dp.save()
    }

    res.json({
      success: true,
      message: `Order broadcast to ${availableDeliveryPersons.length} delivery partners`,
      deliveryPartnersNotified: availableDeliveryPersons.length,
    })
  } catch (error) {
    console.error("Assign to delivery error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to assign order to delivery",
    })
  }
}

// Seller: Mark order as handed to delivery person
exports.handedToDelivery = async (req, res) => {
  try {
    const { orderId } = req.params
    
    // Verify seller owns this order
    const seller = await Seller.findOne({ user: req.user.userId })
    if (!seller) {
      return res.status(404).json({
        success: false,
        message: "Seller profile not found",
      })
    }

    const order = await Order.findById(orderId)
      .populate("deliveryPerson")
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      })
    }

    // Check if seller owns this order
    const hasSellerItems = order.items.some(
      (item) => item.seller.toString() === seller._id.toString()
    )
    if (!hasSellerItems) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to update this order",
      })
    }

    // Check if delivery person is assigned
    if (!order.deliveryPerson) {
      return res.status(400).json({
        success: false,
        message: "No delivery person assigned yet",
      })
    }

    // Update order status
    order.status = "out_for_delivery"
    order.isHandedToDelivery = true
    order.handedToDeliveryAt = new Date()
    order.trackingUpdates.push({
      status: "out_for_delivery",
      message: "Package picked up by delivery partner. Out for delivery!",
      timestamp: new Date(),
    })
    await order.save()

    // Notify customer
    try {
      await Notification.create({
        user: order.customer,
        title: "Order Out for Delivery",
        message: `Your order #${order.orderNumber} is out for delivery!`,
        type: "order",
        link: `/dashboard/customer/orders`,
      })
    } catch (e) { console.error("Notification error:", e) }

    res.json({
      success: true,
      message: "Order marked as out for delivery",
      order,
    })
  } catch (error) {
    console.error("Handed to delivery error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to update order status",
    })
  }
}

// Get delivery person info for an order (for customer)
exports.getDeliveryPersonInfo = async (req, res) => {
  try {
    const { orderId } = req.params
    
    const order = await Order.findById(orderId)
      .populate({
        path: "deliveryPerson",
        populate: { path: "user", select: "name phone" },
      })

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      })
    }

    // Check if customer owns this order
    if (order.customer.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      })
    }

    if (!order.deliveryPerson) {
      return res.json({
        success: true,
        deliveryPerson: null,
      })
    }

    res.json({
      success: true,
      deliveryPerson: {
        name: order.deliveryPerson.user?.name,
        phone: order.deliveryPerson.user?.phone,
        rating: order.deliveryPerson.rating,
        vehicleType: order.deliveryPerson.vehicleType,
        vehicleNumber: order.deliveryPerson.vehicleNumber,
      },
      deliveryOTP: order.status === "out_for_delivery" ? order.deliveryOTP : null,
    })
  } catch (error) {
    console.error("Get delivery person info error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch delivery person info",
    })
  }
}

module.exports = exports
