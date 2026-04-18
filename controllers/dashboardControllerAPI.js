const Booking = require("../models/Booking")
const Order = require("../models/Order")
const Worker = require("../models/Worker")
const Seller = require("../models/Seller")
const User = require("../models/User")

// Get dashboard stats based on user role
exports.getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.userId
    const role = req.user.role
    let stats = {}

    if (role === "customer") {
      const activeBookings = await Booking.countDocuments({
        customer: userId,
        status: { $in: ["pending", "accepted", "in_progress"] },
      })

      const pendingOrders = await Order.countDocuments({
        customer: userId,
        status: { $in: ["pending", "confirmed", "processing"] },
      })

      const completedBookings = await Booking.countDocuments({
        customer: userId,
        status: "completed",
      })

      const totalSpent = await Order.aggregate([
        { $match: { customer: userId, paymentStatus: "completed" } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ])

      stats = {
        activeBookings,
        pendingOrders,
        completedBookings,
        totalSpent: totalSpent[0]?.total || 0,
      }
    } else if (role === "worker") {
      const worker = await Worker.findOne({ user: userId })

      if (worker) {
        const pendingBookings = await Booking.countDocuments({
          worker: worker._id,
          status: "pending",
        })

        const activeBookings = await Booking.countDocuments({
          worker: worker._id,
          status: { $in: ["accepted", "in_progress"] },
        })

        const completedBookings = await Booking.countDocuments({
          worker: worker._id,
          status: "completed",
        })

        const totalEarnings = await Booking.aggregate([
          { $match: { worker: worker._id, status: "completed", paymentStatus: "completed" } },
          { $group: { _id: null, total: { $sum: "$price" } } },
        ])

        stats = {
          pendingBookings,
          activeBookings,
          completedBookings,
          totalEarnings: totalEarnings[0]?.total || 0,
          rating: worker.rating,
          isVerified: worker.user?.isVerified,
        }
      }
    } else if (role === "seller") {
      const seller = await Seller.findOne({ user: userId })

      if (seller) {
        const totalProducts = await require("../models/Product").countDocuments({
          seller: seller._id,
        })

        const pendingOrders = await Order.countDocuments({
          "items.seller": seller._id,
          status: { $in: ["pending", "confirmed"] },
        })

        const completedOrders = await Order.countDocuments({
          "items.seller": seller._id,
          status: "delivered",
        })

        const totalRevenue = await Order.aggregate([
          { $unwind: "$items" },
          { $match: { "items.seller": seller._id, paymentStatus: "completed" } },
          { $group: { _id: null, total: { $sum: { $multiply: ["$items.price", "$items.quantity"] } } } },
        ])

        stats = {
          totalProducts,
          pendingOrders,
          completedOrders,
          totalRevenue: totalRevenue[0]?.total || 0,
          isVerified: seller.user?.isVerified,
        }
      }
    } else if (role === "delivery") {
      const DeliveryAssignment = require("../models/DeliveryAssignment")

      const assignedDeliveries = await DeliveryAssignment.countDocuments({
        deliveryPerson: userId,
        status: { $in: ["assigned", "accepted"] },
      })

      const inTransit = await DeliveryAssignment.countDocuments({
        deliveryPerson: userId,
        status: "in_transit",
      })

      const completedToday = await DeliveryAssignment.countDocuments({
        deliveryPerson: userId,
        status: "delivered",
        actualDeliveryTime: { $gte: new Date().setHours(0, 0, 0, 0) },
      })

      stats = {
        assignedDeliveries,
        inTransit,
        completedToday,
      }
    } else if (role === "admin") {
      const totalUsers = await User.countDocuments()

      const pendingVerifications = await User.countDocuments({
        role: { $in: ["worker", "seller", "delivery"] },
        isVerified: false,
      })

      const activeBookings = await Booking.countDocuments({
        status: { $in: ["pending", "accepted", "in_progress"] },
      })

      const totalRevenue = await Order.aggregate([
        { $match: { paymentStatus: "completed" } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ])

      stats = {
        totalUsers,
        pendingVerifications,
        activeBookings,
        totalRevenue: totalRevenue[0]?.total || 0,
      }
    }

    res.json({
      success: true,
      stats,
    })
  } catch (error) {
    console.error("Get dashboard stats error:", error)
    res.status(500).json({ success: false, message: "Failed to fetch dashboard stats" })
  }
}

// Get customer dashboard stats
exports.getCustomerStats = async (req, res) => {
  try {
    const userId = req.user.userId;
    const mongoose = require("mongoose");
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Get bookings stats
    const totalBookings = await Booking.countDocuments({ customer: userId });
    const pendingBookings = await Booking.countDocuments({ customer: userId, status: "pending" });
    const completedBookings = await Booking.countDocuments({ customer: userId, status: "completed" });

    // Get recent bookings
    const recentBookings = await Booking.find({ customer: userId })
      .populate("service", "name category")
      .populate("worker", "name phone")
      .sort({ createdAt: -1 })
      .limit(5);

    // Get orders stats
    const totalOrders = await Order.countDocuments({ customer: userId });
    const pendingOrders = await Order.countDocuments({
      customer: userId,
      status: { $in: ["pending", "processing"] }
    });
    const deliveredOrders = await Order.countDocuments({ customer: userId, status: "delivered" });

    // Get recent orders
    const recentOrders = await Order.find({ customer: userId })
      .populate("items.product", "name price images")
      .sort({ createdAt: -1 })
      .limit(5);

    // Calculate total spent from completed orders
    const orderSpentData = await Order.aggregate([
      { $match: { customer: userObjectId, status: "delivered" } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } }
    ]);
    const orderSpent = orderSpentData.length > 0 ? orderSpentData[0].total : 0;

    // Calculate total spent from completed bookings (using finalPrice or price)
    const bookingSpentData = await Booking.aggregate([
      { $match: { customer: userObjectId, status: "completed" } },
      { $group: { _id: null, total: { $sum: { $ifNull: ["$finalPrice", "$price"] } } } }
    ]);
    const bookingSpent = bookingSpentData.length > 0 ? bookingSpentData[0].total : 0;

    // Total spent = orders + completed bookings
    const totalSpent = orderSpent + bookingSpent;

    res.json({
      bookings: {
        total: totalBookings,
        pending: pendingBookings,
        completed: completedBookings,
        recent: recentBookings
      },
      orders: {
        total: totalOrders,
        pending: pendingOrders,
        delivered: deliveredOrders,
        recent: recentOrders
      },
      totalSpent,
      orderSpent,
      bookingSpent
    });
  } catch (error) {
    console.error("Get customer stats error:", error);
    res.status(500).json({ message: "Failed to fetch customer stats", error: error.message });
  }
};

// Get worker dashboard stats
exports.getWorkerStats = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get worker profile
    const worker = await Worker.findOne({ user: userId });
    if (!worker) {
      return res.status(404).json({ message: "Worker profile not found" });
    }

    // Get bookings stats
    const totalBookings = await Booking.countDocuments({ worker: worker._id });
    const pendingBookings = await Booking.countDocuments({ worker: worker._id, status: "pending" });
    const acceptedBookings = await Booking.countDocuments({ worker: worker._id, status: "accepted" });
    const inProgressBookings = await Booking.countDocuments({ worker: worker._id, status: "in_progress" });
    const completedBookings = await Booking.countDocuments({ worker: worker._id, status: "completed" });

    // Get recent bookings
    const recentBookings = await Booking.find({ worker: worker._id })
      .populate("customer", "name email phone")
      .populate("service", "name category")
      .sort({ createdAt: -1 })
      .limit(10);

    // Calculate earnings using finalPrice (or price as fallback)
    const earningsData = await Booking.aggregate([
      {
        $match: {
          worker: worker._id,
          status: "completed"
        }
      },
      {
        $group: {
          _id: null,
          total: {
            $sum: {
              $ifNull: ["$finalPrice", "$price"]
            }
          },
          count: { $sum: 1 }
        }
      }
    ]);
    const totalEarnings = earningsData.length > 0 ? earningsData[0].total : 0;
    const completedJobs = earningsData.length > 0 ? earningsData[0].count : 0;

    // Calculate monthly earnings
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const monthlyEarningsData = await Booking.aggregate([
      {
        $match: {
          worker: worker._id,
          status: "completed",
          completedAt: { $gte: startOfMonth }
        }
      },
      {
        $group: {
          _id: null,
          total: {
            $sum: {
              $ifNull: ["$finalPrice", "$price"]
            }
          }
        }
      }
    ]);
    const monthlyEarnings = monthlyEarningsData.length > 0 ? monthlyEarningsData[0].total : 0;

    // Get pricing data for pie chart (Accepted vs Completed)
    const acceptedTotal = await Booking.aggregate([
      {
        $match: {
          worker: worker._id,
          status: "accepted"
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$price" },
          count: { $sum: 1 }
        }
      }
    ]);

    const completedTotal = await Booking.aggregate([
      {
        $match: {
          worker: worker._id,
          status: "completed"
        }
      },
      {
        $group: {
          _id: null,
          total: {
            $sum: {
              $ifNull: ["$finalPrice", "$price"]
            }
          },
          count: { $sum: 1 }
        }
      }
    ]);

    const chartData = {
      accepted: {
        count: acceptedTotal.length > 0 ? acceptedTotal[0].count : 0,
        value: acceptedTotal.length > 0 ? acceptedTotal[0].total : 0
      },
      completed: {
        count: completedTotal.length > 0 ? completedTotal[0].count : 0,
        value: completedTotal.length > 0 ? completedTotal[0].total : 0
      }
    };

    // Get rating count from reviewed bookings
    const totalRatingsCount = await Booking.countDocuments({
      worker: worker._id,
      isReviewed: true
    });

    // Get customer feedback/reviews for this worker
    const workerReviews = await Booking.find({
      worker: worker._id,
      isReviewed: true,
      rating: { $exists: true }
    })
      .populate("customer", "name email")
      .populate("service", "name category")
      .select("customer service rating review createdAt completionTime")
      .sort({ completionTime: -1, createdAt: -1 })
      .limit(10);

    const formattedReviews = workerReviews.map(b => ({
      customer: b.customer,
      service: b.service,
      rating: b.rating,
      comment: b.review,
      date: b.completionTime || b.createdAt
    }));

    res.json({
      worker: {
        id: worker._id,
        isVerified: worker.isVerified,
        isAvailable: worker.isAvailable,
        rating: worker.rating,
        totalRatings: totalRatingsCount,
        service: worker.service
      },
      bookings: {
        total: totalBookings,
        pending: pendingBookings,
        accepted: acceptedBookings,
        inProgress: inProgressBookings,
        completed: completedBookings,
        recent: recentBookings
      },
      earnings: {
        total: totalEarnings,
        monthly: monthlyEarnings,
        completedJobs
      },
      reviews: formattedReviews,
      chartData
    });
  } catch (error) {
    console.error("Get worker stats error:", error);
    res.status(500).json({ message: "Failed to fetch worker stats", error: error.message });
  }
};

// Get seller dashboard stats
exports.getSellerStats = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get seller profile
    const seller = await Seller.findOne({ user: userId });
    if (!seller) {
      return res.status(404).json({ message: "Seller profile not found" });
    }

    const Product = require("../models/Product");

    // Get products stats
    const totalProducts = await Product.countDocuments({ seller: seller._id });
    const activeProducts = await Product.countDocuments({ seller: seller._id, inStock: true });
    const outOfStockProducts = await Product.countDocuments({ seller: seller._id, inStock: false });

    // Get recent products
    const recentProducts = await Product.find({ seller: seller._id })
      .sort({ createdAt: -1 })
      .limit(5);

    // Get orders stats (items sold by this seller)
    const orderAggregation = await Order.aggregate([
      { $unwind: "$items" },
      { $match: { "items.seller": seller._id } },
      {
        $group: {
          _id: "$items.status",
          count: { $sum: 1 },
          total: { $sum: "$items.price" }
        }
      }
    ]);

    const orderStats = {
      total: 0,
      pending: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0
    };

    orderAggregation.forEach(stat => {
      orderStats.total += stat.count;
      if (orderStats[stat._id] !== undefined) {
        orderStats[stat._id] = stat.count;
      }
    });

    // Get recent orders
    const orders = await Order.find({ "items.seller": seller._id })
      .populate("customer", "name email phone")
      .populate("items.product", "name price images")
      .sort({ createdAt: -1 })
      .limit(10);

    // Filter items for this seller only
    const recentOrders = orders.map(order => ({
      ...order.toObject(),
      items: order.items.filter(item => item.seller.toString() === seller._id.toString())
    }));

    // Calculate revenue by status (delivered vs pending)
    const revenueByStatus = await Order.aggregate([
      { $unwind: "$items" },
      {
        $match: {
          "items.seller": seller._id,
          "status": { $in: ["pending", "confirmed", "assigned_delivery", "out_for_delivery", "delivered"] }
        }
      },
      {
        $group: {
          _id: "$status",
          total: { $sum: { $multiply: ["$items.price", "$items.quantity"] } }
        }
      }
    ]);

    let deliveredRevenue = 0;
    let pendingRevenue = 0;
    revenueByStatus.forEach(stat => {
      if (stat._id === 'delivered') {
        deliveredRevenue = stat.total;
      } else {
        pendingRevenue += stat.total;
      }
    });
    const totalRevenue = deliveredRevenue + pendingRevenue;

    // Calculate monthly revenue
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const monthlyRevenueData = await Order.aggregate([
      { $unwind: "$items" },
      {
        $match: {
          "items.seller": seller._id,
          "items.status": { $in: ["shipped", "delivered"] },
          createdAt: { $gte: startOfMonth }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: { $multiply: ["$items.price", "$items.quantity"] } }
        }
      }
    ]);
    const monthlyRevenue = monthlyRevenueData.length > 0 ? monthlyRevenueData[0].total : 0;

    // Get customer reviews from seller's products
    const productsWithReviews = await Product.find({
      seller: seller._id,
      "reviews.0": { $exists: true }
    })
      .select("name reviews")
      .populate("reviews.customer", "name")
      .lean();

    // Flatten all reviews across products, attach product name, sort by date
    const allReviews = [];
    productsWithReviews.forEach(product => {
      product.reviews.forEach(review => {
        allReviews.push({
          customer: review.customer?.name || "Unknown Customer",
          product: product.name,
          rating: review.rating || 0,
          comment: review.comment || "",
          date: review.date
        });
      });
    });
    allReviews.sort((a, b) => new Date(b.date) - new Date(a.date));
    const sellerReviews = allReviews.slice(0, 10);

    // Get top products by rating and sales
    const topProducts = await Product.find({ seller: seller._id })
      .sort({ rating: -1, numReviews: -1 })
      .limit(5)
      .select("name price rating numReviews inStock images")
      .lean();

    res.json({
      seller: {
        id: seller._id,
        isVerified: seller.isVerified,
        shopName: seller.shopName,
        rating: seller.rating,
        totalRatings: seller.totalRatings
      },
      products: {
        total: totalProducts,
        active: activeProducts,
        outOfStock: outOfStockProducts,
        recent: recentProducts
      },
      orders: {
        ...orderStats,
        recent: recentOrders
      },
      revenue: {
        total: totalRevenue,
        delivered: deliveredRevenue,
        pending: pendingRevenue,
        monthly: monthlyRevenue
      },
      reviews: sellerReviews,
      topProducts
    });
  } catch (error) {
    console.error("Get seller stats error:", error);
    res.status(500).json({ message: "Failed to fetch seller stats", error: error.message });
  }
};

// Get delivery person dashboard stats
exports.getDeliveryStats = async (req, res) => {
  try {
    const userId = req.user.userId;
    const DeliveryAssignment = require("../models/DeliveryAssignment");

    // Get delivery assignments
    const totalDeliveries = await DeliveryAssignment.countDocuments({ deliveryPerson: userId });
    const assignedDeliveries = await DeliveryAssignment.countDocuments({
      deliveryPerson: userId,
      status: "assigned"
    });
    const inTransitDeliveries = await DeliveryAssignment.countDocuments({
      deliveryPerson: userId,
      status: { $in: ["picked_up", "in_transit"] }
    });
    const completedDeliveries = await DeliveryAssignment.countDocuments({
      deliveryPerson: userId,
      status: "delivered"
    });

    // Get recent deliveries
    const recentDeliveries = await DeliveryAssignment.find({ deliveryPerson: userId })
      .populate({
        path: "order",
        populate: [
          { path: "customer", select: "name phone" },
          { path: "items.product", select: "name images" }
        ]
      })
      .sort({ createdAt: -1 })
      .limit(10);

    // Calculate earnings from completed deliveries
    const earningsData = await DeliveryAssignment.aggregate([
      {
        $match: {
          deliveryPerson: userId,
          status: "delivered"
        }
      },
      {
        $lookup: {
          from: "orders",
          localField: "order",
          foreignField: "_id",
          as: "orderData"
        }
      },
      { $unwind: "$orderData" },
      {
        $group: {
          _id: null,
          total: { $sum: "$orderData.deliveryFee" }
        }
      }
    ]);
    const totalEarnings = earningsData.length > 0 ? earningsData[0].total : 0;

    // Calculate monthly earnings
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const monthlyEarningsData = await DeliveryAssignment.aggregate([
      {
        $match: {
          deliveryPerson: userId,
          status: "delivered",
          deliveredAt: { $gte: startOfMonth }
        }
      },
      {
        $lookup: {
          from: "orders",
          localField: "order",
          foreignField: "_id",
          as: "orderData"
        }
      },
      { $unwind: "$orderData" },
      {
        $group: {
          _id: null,
          total: { $sum: "$orderData.deliveryFee" }
        }
      }
    ]);
    const monthlyEarnings = monthlyEarningsData.length > 0 ? monthlyEarningsData[0].total : 0;

    res.json({
      deliveries: {
        total: totalDeliveries,
        assigned: assignedDeliveries,
        inTransit: inTransitDeliveries,
        completed: completedDeliveries,
        recent: recentDeliveries
      },
      earnings: {
        total: totalEarnings,
        monthly: monthlyEarnings
      }
    });
  } catch (error) {
    console.error("Get delivery stats error:", error);
    res.status(500).json({ message: "Failed to fetch delivery stats", error: error.message });
  }
};

// Get admin dashboard stats
exports.getAdminStats = async (req, res) => {
  try {
    const Product = require("../models/Product");
    const Service = require("../models/Service");

    // Users stats
    const totalUsers = await User.countDocuments();
    const customerCount = await User.countDocuments({ role: "customer" });
    const workerCount = await User.countDocuments({ role: "worker" });
    const sellerCount = await User.countDocuments({ role: "seller" });
    const deliveryCount = await User.countDocuments({ role: "delivery" });

    // Verification pending counts
    const pendingWorkers = await Worker.countDocuments({ isVerified: false });
    const pendingSellers = await Seller.countDocuments({ isVerified: false });
    const DeliveryPerson = require("../models/DeliveryPerson");
    const pendingDelivery = await DeliveryPerson.countDocuments({ isVerified: false });

    // Bookings stats
    const totalBookings = await Booking.countDocuments();
    const pendingBookings = await Booking.countDocuments({ status: "pending" });
    const acceptedBookings = await Booking.countDocuments({ status: "accepted" });
    const inProgressBookings = await Booking.countDocuments({ status: { $in: ["in-progress", "in_progress"] } });
    const completedBookings = await Booking.countDocuments({ status: "completed" });
    const cancelledBookings = await Booking.countDocuments({ status: "cancelled" });
    const rejectedBookings = await Booking.countDocuments({ status: "rejected" });

    // Orders stats
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: { $in: ["pending", "confirmed"] } });
    const assignedOrders = await Order.countDocuments({ status: "assigned_delivery" });
    const outForDeliveryOrders = await Order.countDocuments({ status: "out_for_delivery" });
    const deliveredOrders = await Order.countDocuments({ status: "delivered" });
    const cancelledOrders = await Order.countDocuments({ status: "cancelled" });

    // Products stats
    const totalProducts = await Product.countDocuments();
    const activeProducts = await Product.countDocuments({ inStock: true });

    // Services stats
    const totalServices = await Service.countDocuments();

    // Revenue calculation
    const bookingRevenueData = await Booking.aggregate([
      { $match: { status: "completed" } },
      { $group: { _id: null, total: { $sum: { $ifNull: ["$finalPrice", "$price"] } } } }
    ]);
    const bookingRevenue = bookingRevenueData.length > 0 ? bookingRevenueData[0].total : 0;

    const orderRevenueData = await Order.aggregate([
      { $match: { status: { $ne: "cancelled" } } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } }
    ]);
    const orderRevenue = orderRevenueData.length > 0 ? orderRevenueData[0].total : 0;

    const totalRevenue = bookingRevenue + orderRevenue;

    // Monthly revenue
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const monthlyBookingRevenue = await Booking.aggregate([
      {
        $match: {
          status: "completed",
          completedAt: { $gte: startOfMonth }
        }
      },
      { $group: { _id: null, total: { $sum: { $ifNull: ["$finalPrice", "$price"] } } } }
    ]);
    const monthlyBookingTotal = monthlyBookingRevenue.length > 0 ? monthlyBookingRevenue[0].total : 0;

    const monthlyOrderRevenue = await Order.aggregate([
      {
        $match: {
          status: { $ne: "cancelled" },
          createdAt: { $gte: startOfMonth }
        }
      },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } }
    ]);
    const monthlyOrderTotal = monthlyOrderRevenue.length > 0 ? monthlyOrderRevenue[0].total : 0;

    const monthlyRevenue = monthlyBookingTotal + monthlyOrderTotal;

    // Recent activities
    const recentUsers = await User.find()
      .select("name email role createdAt isEmailVerified")
      .sort({ createdAt: -1 })
      .limit(5);

    const recentBookings = await Booking.find()
      .populate("customer", "name email phone")
      .populate("worker", "name")
      .populate("service", "name category price")
      .sort({ createdAt: -1 })
      .limit(10);

    const recentOrders = await Order.find()
      .populate("customer", "name email phone")
      .populate("items.product", "name price images")
      .populate("items.seller", "shopName")
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      users: {
        total: totalUsers,
        customers: customerCount,
        workers: workerCount,
        sellers: sellerCount,
        delivery: deliveryCount,
        recent: recentUsers
      },
      verifications: {
        pendingWorkers,
        pendingSellers,
        pendingDelivery
      },
      bookings: {
        total: totalBookings,
        pending: pendingBookings,
        accepted: acceptedBookings,
        inProgress: inProgressBookings,
        completed: completedBookings,
        cancelled: cancelledBookings,
        rejected: rejectedBookings,
        recent: recentBookings
      },
      orders: {
        total: totalOrders,
        pending: pendingOrders,
        assigned: assignedOrders,
        outForDelivery: outForDeliveryOrders,
        delivered: deliveredOrders,
        cancelled: cancelledOrders,
        recent: recentOrders
      },
      products: {
        total: totalProducts,
        active: activeProducts
      },
      services: {
        total: totalServices
      },
      revenue: {
        total: totalRevenue,
        monthly: monthlyRevenue,
        bookings: bookingRevenue,
        orders: orderRevenue
      }
    });
  } catch (error) {
    console.error("Get admin stats error:", error);
    res.status(500).json({ message: "Failed to fetch admin stats", error: error.message });
  }
};

// Get seller profile data
exports.getSellerProfile = async (req, res) => {
  try {
    const userId = req.user.userId;

    const seller = await Seller.findOne({ user: userId }).populate("user", "name email phone profilePicture");
    if (!seller) {
      return res.status(404).json({ message: "Seller profile not found" });
    }

    const Product = require("../models/Product");
    const productsCount = await Product.countDocuments({ seller: seller._id });
    const ordersCount = await Order.countDocuments({ "items.seller": seller._id });

    // Calculate total revenue
    const revenueData = await Order.aggregate([
      { $unwind: "$items" },
      { $match: { "items.seller": seller._id, paymentStatus: "completed" } },
      { $group: { _id: null, total: { $sum: { $multiply: ["$items.price", "$items.quantity"] } } } }
    ]);
    const totalRevenue = revenueData.length > 0 ? revenueData[0].total : 0;

    res.json({
      seller: {
        _id: seller._id,
        businessName: seller.businessName || seller.shopName,
        businessDescription: seller.businessDescription,
        businessPhone: seller.businessPhone,
        businessAddress: seller.businessAddress,
        gstNumber: seller.gstNumber,
        shopImages: seller.shopImages || {},
        isVerified: seller.isVerified,
        rating: seller.rating,
        totalRatings: seller.totalRatings,
      },
      products: productsCount,
      orders: ordersCount,
      revenue: totalRevenue,
    });
  } catch (error) {
    console.error("Get seller profile error:", error);
    res.status(500).json({ message: "Failed to fetch seller profile", error: error.message });
  }
};

// Update seller shop settings with image uploads
exports.updateSellerShopSettings = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name, businessName, businessDescription, businessPhone, businessAddress, gstNumber } = req.body;

    // Update user name if provided
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (name && name !== user.name) {
      user.name = name;
    }

    // Update profile picture if uploaded
    if (req.files && req.files.profilePicture && req.files.profilePicture[0]) {
      user.profilePicture = "/uploads/profiles/" + req.files.profilePicture[0].filename;
    }
    await user.save();

    // Get or create seller profile
    let seller = await Seller.findOne({ user: userId });
    if (!seller) {
      return res.status(404).json({ message: "Seller profile not found" });
    }

    // Update seller fields
    if (businessName) seller.businessName = businessName;
    if (seller.shopName === undefined || seller.shopName === "My Shop") {
      seller.shopName = businessName; // Keep shopName in sync
    }
    if (businessDescription !== undefined) seller.businessDescription = businessDescription;
    if (businessPhone) seller.businessPhone = businessPhone;
    if (businessAddress !== undefined) seller.businessAddress = businessAddress;
    if (gstNumber !== undefined) seller.gstNumber = gstNumber;

    // Initialize shopImages if not exists
    if (!seller.shopImages) {
      seller.shopImages = {};
    }

    // Update shop images if uploaded
    if (req.files) {
      if (req.files.shopExteriorImage && req.files.shopExteriorImage[0]) {
        seller.shopImages.exterior = "/uploads/shops/" + req.files.shopExteriorImage[0].filename;
      }
      if (req.files.shopInteriorImage && req.files.shopInteriorImage[0]) {
        seller.shopImages.interior = "/uploads/shops/" + req.files.shopInteriorImage[0].filename;
      }
    }

    await seller.save();

    // Return updated user data
    const updatedUser = await User.findById(userId).select("-password");

    res.json({
      message: "Shop settings updated successfully",
      user: updatedUser,
      seller: {
        businessName: seller.businessName,
        businessDescription: seller.businessDescription,
        businessPhone: seller.businessPhone,
        businessAddress: seller.businessAddress,
        gstNumber: seller.gstNumber,
        shopImages: seller.shopImages,
      }
    });
  } catch (error) {
    console.error("Update seller shop settings error:", error);
    res.status(500).json({ message: "Failed to update shop settings", error: error.message });
  }
};

module.exports = exports
