const User = require("../models/User");
const Worker = require("../models/Worker");
const Seller = require("../models/Seller");
const Notification = require("../models/Notification");
const { emitNotification } = require("../socket");

// Get all pending verifications
exports.getPendingVerifications = async (req, res) => {
  try {
    // Get pending workers
    const pendingWorkers = await Worker.find({ isVerified: false })
      .populate("user", "name email phone createdAt")
      .populate("service", "name category")
      .sort({ createdAt: -1 });

    // Get pending sellers
    const pendingSellers = await Seller.find({ isVerified: false })
      .populate("user", "name email phone createdAt")
      .sort({ createdAt: -1 });

    // Get pending delivery persons
    const pendingDelivery = await User.find({ 
      role: "delivery", 
      isEmailVerified: true 
    })
      .select("name email phone createdAt")
      .sort({ createdAt: -1 });

    res.json({
      workers: pendingWorkers,
      sellers: pendingSellers,
      delivery: pendingDelivery
    });
  } catch (error) {
    console.error("Get pending verifications error:", error);
    res.status(500).json({ message: "Failed to fetch pending verifications", error: error.message });
  }
};

// Verify/approve worker
exports.verifyWorker = async (req, res) => {
  try {
    const { id } = req.params;
    const { approved, rejectionReason } = req.body;

    const worker = await Worker.findOne({ user: id }).populate("user");
    if (!worker) {
      return res.status(404).json({ message: "Worker not found" });
    }

    if (approved) {
      worker.isVerified = true;
      worker.verifiedAt = new Date();
      worker.verifiedBy = req.user.userId;
      await worker.save();

      // Create notification
      const notification = await Notification.create({
        user: worker.user._id,
        title: "Account Verified",
        message: "Congratulations! Your worker account has been verified. You can now start accepting bookings.",
        type: "success"
      });

      // Emit Socket.IO event
      emitNotification(worker.user._id, notification);

      res.json({ 
        message: "Worker verified successfully", 
        worker 
      });
    } else {
      // Reject verification
      worker.verificationStatus = "rejected";
      worker.rejectionReason = rejectionReason || "Did not meet verification requirements";
      await worker.save();

      // Create notification
      const notification = await Notification.create({
        user: worker.user._id,
        title: "Verification Rejected",
        message: `Your worker verification was rejected. Reason: ${rejectionReason || "Did not meet requirements"}`,
        type: "error"
      });

      // Emit Socket.IO event
      emitNotification(worker.user._id, notification);

      res.json({ 
        message: "Worker verification rejected", 
        worker 
      });
    }
  } catch (error) {
    console.error("Verify worker error:", error);
    res.status(500).json({ message: "Failed to verify worker", error: error.message });
  }
};

// Verify/approve seller
exports.verifySeller = async (req, res) => {
  try {
    const { id } = req.params;
    const { approved, rejectionReason } = req.body;

    const seller = await Seller.findOne({ user: id }).populate("user");
    if (!seller) {
      return res.status(404).json({ message: "Seller not found" });
    }

    if (approved) {
      seller.isVerified = true;
      seller.verifiedAt = new Date();
      seller.verifiedBy = req.user.userId;
      await seller.save();

      // Create notification
      const notification = await Notification.create({
        user: seller.user._id,
        title: "Shop Verified",
        message: "Congratulations! Your shop has been verified. You can now start selling products.",
        type: "success"
      });

      // Emit Socket.IO event
      emitNotification(seller.user._id, notification);

      res.json({ 
        message: "Seller verified successfully", 
        seller 
      });
    } else {
      // Reject verification
      seller.verificationStatus = "rejected";
      seller.rejectionReason = rejectionReason || "Did not meet verification requirements";
      await seller.save();

      // Create notification
      const notification = await Notification.create({
        user: seller.user._id,
        title: "Verification Rejected",
        message: `Your shop verification was rejected. Reason: ${rejectionReason || "Did not meet requirements"}`,
        type: "error"
      });

      // Emit Socket.IO event
      emitNotification(seller.user._id, notification);

      res.json({ 
        message: "Seller verification rejected", 
        seller 
      });
    }
  } catch (error) {
    console.error("Verify seller error:", error);
    res.status(500).json({ message: "Failed to verify seller", error: error.message });
  }
};

// Verify/approve delivery person
exports.verifyDelivery = async (req, res) => {
  try {
    const { id } = req.params;
    const { approved, rejectionReason } = req.body;

    const user = await User.findById(id);
    if (!user || user.role !== "delivery") {
      return res.status(404).json({ message: "Delivery person not found" });
    }

    if (approved) {
      user.isVerified = true;
      await user.save();

      // Create notification
      const notification = await Notification.create({
        user: user._id,
        title: "Account Verified",
        message: "Congratulations! Your delivery account has been verified. You can now accept delivery assignments.",
        type: "success"
      });

      // Emit Socket.IO event
      emitNotification(user._id, notification);

      res.json({ 
        message: "Delivery person verified successfully", 
        user 
      });
    } else {
      // Reject verification
      await Notification.create({
        user: user._id,
        title: "Verification Rejected",
        message: `Your delivery verification was rejected. Reason: ${rejectionReason || "Did not meet requirements"}`,
        type: "error"
      });

      res.json({ 
        message: "Delivery person verification rejected"
      });
    }
  } catch (error) {
    console.error("Verify delivery error:", error);
    res.status(500).json({ message: "Failed to verify delivery person", error: error.message });
  }
};

// Get all users (admin)
exports.getAllUsers = async (req, res) => {
  try {
    const { role, verified, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (role) filter.role = role;
    if (verified !== undefined) filter.isEmailVerified = verified === "true";

    const users = await User.find(filter)
      .select("-password -refreshToken -passwordResetToken -emailVerificationOTP")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await User.countDocuments(filter);

    res.json({
      users,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalCount: count
    });
  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({ message: "Failed to fetch users", error: error.message });
  }
};

// Get user details (admin)
exports.getUserDetails = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId)
      .select("-password -refreshToken -passwordResetToken -emailVerificationOTP");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get role-specific details
    let roleDetails = null;
    if (user.role === "worker") {
      roleDetails = await Worker.findOne({ user: userId }).populate("service");
    } else if (user.role === "seller") {
      roleDetails = await Seller.findOne({ user: userId });
    }

    res.json({
      user,
      roleDetails
    });
  } catch (error) {
    console.error("Get user details error:", error);
    res.status(500).json({ message: "Failed to fetch user details", error: error.message });
  }
};

// Update user status (admin)
exports.updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { isActive, isEmailVerified } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (isActive !== undefined) user.isActive = isActive;
    if (isEmailVerified !== undefined) user.isEmailVerified = isEmailVerified;

    await user.save();

    // Create notification
    const notification = await Notification.create({
      user: userId,
      title: "Account Status Updated",
      message: `Your account status has been updated by admin.`,
      type: "info"
    });

    // Emit Socket.IO event
    emitNotification(userId, notification);

    res.json({ 
      message: "User status updated successfully", 
      user 
    });
  } catch (error) {
    console.error("Update user status error:", error);
    res.status(500).json({ message: "Failed to update user status", error: error.message });
  }
};

// Delete user (admin)
exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Delete role-specific data
    if (user.role === "worker") {
      await Worker.deleteOne({ user: userId });
    } else if (user.role === "seller") {
      await Seller.deleteOne({ user: userId });
    }

    // Delete user
    await User.findByIdAndDelete(userId);

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ message: "Failed to delete user", error: error.message });
  }
};

// Get system analytics (admin)
exports.getSystemAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }

    // User growth analytics
    const userGrowth = await User.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    // Booking analytics
    const bookingStats = await require("../models/Booking").aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalRevenue: { $sum: "$price" }
        }
      }
    ]);

    // Order analytics
    const orderStats = await require("../models/Order").aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalRevenue: { $sum: "$total" }
        }
      }
    ]);

    res.json({
      userGrowth,
      bookingStats,
      orderStats
    });
  } catch (error) {
    console.error("Get system analytics error:", error);
    res.status(500).json({ message: "Failed to fetch analytics", error: error.message });
  }
};
