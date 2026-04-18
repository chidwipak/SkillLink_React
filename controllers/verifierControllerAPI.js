const User = require("../models/User");
const Worker = require("../models/Worker");
const Seller = require("../models/Seller");
const DeliveryPerson = require("../models/DeliveryPerson");
const emailService = require("../utils/emailService");
const { emitNotification } = require("../socket");
const Notification = require("../models/Notification");

// Get all pending users (verification_status === "Pending")
exports.getPendingUsers = async (req, res) => {
  try {
    const pendingUsers = await User.find({ 
      verification_status: "Pending",
      role: { $nin: ["admin", "verifier"] }
    })
      .select("-password -refreshToken")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      users: pendingUsers,
      count: pendingUsers.length,
    });
  } catch (error) {
    console.error("Get pending users error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch pending users" });
  }
};

// Get user details for verification review
exports.getUserDetails = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select("-password -refreshToken");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    let roleProfile = null;

    if (user.role === "worker") {
      roleProfile = await Worker.findOne({ user: user._id });
    } else if (user.role === "seller") {
      roleProfile = await Seller.findOne({ user: user._id });
    } else if (user.role === "delivery") {
      roleProfile = await DeliveryPerson.findOne({ user: user._id });
    }

    res.json({
      success: true,
      user,
      roleProfile,
    });
  } catch (error) {
    console.error("Get user details error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch user details" });
  }
};

// Approve a user
exports.approveUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.verification_status === "Approved") {
      return res.status(400).json({ success: false, message: "User is already approved" });
    }

    user.verification_status = "Approved";
    user.rejection_feedback = null;
    await user.save();

    // Create notification for the user
    try {
      const notification = await Notification.create({
        user: user._id,
        title: "Account Approved",
        message: "Congratulations! Your account has been approved. You can now login and use SkillLink.",
        type: "success",
      });
      emitNotification(user._id, notification);
    } catch (notifErr) {
      console.log("Notification error (non-blocking):", notifErr.message);
    }

    res.json({
      success: true,
      message: `User ${user.name} has been approved successfully`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        verification_status: user.verification_status,
      },
    });
  } catch (error) {
    console.error("Approve user error:", error);
    res.status(500).json({ success: false, message: "Failed to approve user" });
  }
};

// Decline/Reject a user
exports.declineUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { feedback } = req.body;

    if (!feedback || !feedback.trim()) {
      return res.status(400).json({ 
        success: false, 
        message: "Feedback is mandatory when declining a user" 
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.verification_status = "Rejected";
    user.rejection_feedback = feedback.trim();
    await user.save();

    // Send rejection email
    try {
      await emailService.sendRejectionEmail(user.email, user.name, feedback.trim());
      console.log(`✅ Rejection email sent to ${user.email}`);
    } catch (emailErr) {
      console.log("⚠️ Rejection email error (non-blocking):", emailErr.message);
    }

    // Create notification for the user
    try {
      const notification = await Notification.create({
        user: user._id,
        title: "Account Rejected",
        message: `Your account has been rejected. Reason: ${feedback.trim()}. Please register again with valid details.`,
        type: "error",
      });
      emitNotification(user._id, notification);
    } catch (notifErr) {
      console.log("Notification error (non-blocking):", notifErr.message);
    }

    res.json({
      success: true,
      message: `User ${user.name} has been rejected`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        verification_status: user.verification_status,
        rejection_feedback: user.rejection_feedback,
      },
    });
  } catch (error) {
    console.error("Decline user error:", error);
    res.status(500).json({ success: false, message: "Failed to decline user" });
  }
};

// Get verifier dashboard stats
exports.getVerifierStats = async (req, res) => {
  try {
    const pendingCount = await User.countDocuments({ 
      verification_status: "Pending",
      role: { $nin: ["admin", "verifier"] }
    });
    const approvedCount = await User.countDocuments({ 
      verification_status: "Approved",
      role: { $nin: ["admin", "verifier"] }
    });
    const rejectedCount = await User.countDocuments({ 
      verification_status: "Rejected",
      role: { $nin: ["admin", "verifier"] }
    });

    // Get recent pending users (last 5)
    const recentPending = await User.find({ 
      verification_status: "Pending",
      role: { $nin: ["admin", "verifier"] }
    })
      .select("name email role createdAt profilePicture")
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      stats: {
        pending: pendingCount,
        approved: approvedCount,
        rejected: rejectedCount,
        total: pendingCount + approvedCount + rejectedCount,
      },
      recentPending,
    });
  } catch (error) {
    console.error("Get verifier stats error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch verifier stats" });
  }
};

// Get all approved users (for admin view)
exports.getApprovedUsers = async (req, res) => {
  try {
    const approvedUsers = await User.find({ 
      verification_status: "Approved",
      role: { $nin: ["admin", "verifier"] }
    })
      .select("-password -refreshToken")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      users: approvedUsers,
      count: approvedUsers.length,
    });
  } catch (error) {
    console.error("Get approved users error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch approved users" });
  }
};

// Get all rejected users (for admin view)
exports.getRejectedUsers = async (req, res) => {
  try {
    const rejectedUsers = await User.find({ 
      verification_status: "Rejected",
      role: { $nin: ["admin", "verifier"] }
    })
      .select("-password -refreshToken")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      users: rejectedUsers,
      count: rejectedUsers.length,
    });
  } catch (error) {
    console.error("Get rejected users error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch rejected users" });
  }
};
