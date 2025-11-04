const Payment = require("../models/Payment");
const Booking = require("../models/Booking");
const Order = require("../models/Order");
const Notification = require("../models/Notification");
const { emitToRoom } = require("../socket");

// Note: Razorpay SDK would be required for production
// const Razorpay = require("razorpay");
// const razorpay = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY_ID,
//   key_secret: process.env.RAZORPAY_KEY_SECRET
// });

// Create payment order for booking
exports.createBookingPayment = async (req, res) => {
  try {
    const { bookingId } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.customer.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (booking.paymentStatus === "paid") {
      return res.status(400).json({ message: "Booking already paid" });
    }

    // Create payment record
    const payment = await Payment.create({
      user: req.user.userId,
      booking: bookingId,
      amount: booking.price,
      currency: "INR",
      status: "pending",
      method: "razorpay"
    });

    // In production, create Razorpay order here
    // const razorpayOrder = await razorpay.orders.create({
    //   amount: booking.price * 100, // amount in paise
    //   currency: "INR",
    //   receipt: payment._id.toString(),
    //   payment_capture: 1
    // });
    // payment.razorpayOrderId = razorpayOrder.id;
    // await payment.save();

    // For development, simulate Razorpay order
    payment.razorpayOrderId = `order_${Date.now()}`;
    await payment.save();

    booking.payment = payment._id;
    await booking.save();

    res.json({
      message: "Payment order created",
      payment: {
        id: payment._id,
        orderId: payment.razorpayOrderId,
        amount: payment.amount,
        currency: payment.currency
      }
    });
  } catch (error) {
    console.error("Create booking payment error:", error);
    res.status(500).json({ message: "Failed to create payment", error: error.message });
  }
};

// Create payment order for product order
exports.createOrderPayment = async (req, res) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.customer.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Check if payment already exists
    const existingPayment = await Payment.findOne({ order: orderId, status: { $in: ["pending", "completed"] } });
    if (existingPayment) {
      return res.status(400).json({ message: "Payment already initiated for this order" });
    }

    // Create payment record
    const payment = await Payment.create({
      user: req.user.userId,
      order: orderId,
      amount: order.total,
      currency: "INR",
      status: "pending",
      method: "razorpay"
    });

    // In production, create Razorpay order here
    // const razorpayOrder = await razorpay.orders.create({
    //   amount: order.total * 100, // amount in paise
    //   currency: "INR",
    //   receipt: payment._id.toString(),
    //   payment_capture: 1
    // });
    // payment.razorpayOrderId = razorpayOrder.id;
    // await payment.save();

    // For development, simulate Razorpay order
    payment.razorpayOrderId = `order_${Date.now()}`;
    await payment.save();

    order.payment = payment._id;
    await order.save();

    res.json({
      message: "Payment order created",
      payment: {
        id: payment._id,
        orderId: payment.razorpayOrderId,
        amount: payment.amount,
        currency: payment.currency
      }
    });
  } catch (error) {
    console.error("Create order payment error:", error);
    res.status(500).json({ message: "Failed to create payment", error: error.message });
  }
};

// Verify payment
exports.verifyPayment = async (req, res) => {
  try {
    const { paymentId, razorpayPaymentId, razorpayOrderId, razorpaySignature } = req.body;

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    if (payment.user.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // In production, verify signature using Razorpay SDK
    // const crypto = require("crypto");
    // const expectedSignature = crypto
    //   .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    //   .update(razorpayOrderId + "|" + razorpayPaymentId)
    //   .digest("hex");
    //
    // if (expectedSignature !== razorpaySignature) {
    //   payment.status = "failed";
    //   payment.failureReason = "Signature verification failed";
    //   await payment.save();
    //   return res.status(400).json({ message: "Payment verification failed" });
    // }

    // For development, simulate verification
    payment.status = "completed";
    payment.razorpayPaymentId = razorpayPaymentId || `pay_${Date.now()}`;
    payment.transactionId = razorpayPaymentId || `txn_${Date.now()}`;
    await payment.save();

    // Update booking or order
    if (payment.booking) {
      const booking = await Booking.findById(payment.booking).populate("worker", "name");
      booking.paymentStatus = "paid";
      booking.status = "accepted";
      await booking.save();

      // Notify worker
      const notification = await Notification.create({
        user: booking.worker._id,
        title: "New Booking",
        message: `You have a new booking. Payment received: ₹${payment.amount}`,
        type: "booking",
        link: `/dashboard/worker/bookings/${booking._id}`
      });

      emitToRoom(booking.worker._id.toString(), "new-booking", { booking });
    }

    if (payment.order) {
      const order = await Order.findById(payment.order);
      order.status = "processing";
      order.statusHistory.push({
        status: "processing",
        timestamp: new Date(),
        note: "Payment received"
      });
      await order.save();

      // Notify sellers
      const sellers = [...new Set(order.items.map(item => item.seller.toString()))];
      for (const sellerId of sellers) {
        const notification = await Notification.create({
          user: sellerId,
          title: "New Order",
          message: `You have a new order #${order.orderNumber}. Payment received: ₹${payment.amount}`,
          type: "order",
          link: `/dashboard/seller/orders/${order._id}`
        });

        emitToRoom(sellerId, "new-order", { orderId: order._id });
      }
    }

    res.json({
      message: "Payment verified successfully",
      payment
    });
  } catch (error) {
    console.error("Verify payment error:", error);
    res.status(500).json({ message: "Failed to verify payment", error: error.message });
  }
};

// Handle payment webhook from Razorpay
exports.handleWebhook = async (req, res) => {
  try {
    // In production, verify webhook signature
    // const webhookSignature = req.headers["x-razorpay-signature"];
    // const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    //
    // const crypto = require("crypto");
    // const expectedSignature = crypto
    //   .createHmac("sha256", webhookSecret)
    //   .update(JSON.stringify(req.body))
    //   .digest("hex");
    //
    // if (expectedSignature !== webhookSignature) {
    //   return res.status(400).json({ message: "Invalid signature" });
    // }

    const event = req.body.event;
    const paymentEntity = req.body.payload.payment.entity;

    // Find payment by razorpayOrderId
    const payment = await Payment.findOne({ razorpayOrderId: paymentEntity.order_id });
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    switch (event) {
      case "payment.captured":
        payment.status = "completed";
        payment.razorpayPaymentId = paymentEntity.id;
        payment.transactionId = paymentEntity.id;
        await payment.save();

        // Update booking or order
        if (payment.booking) {
          await Booking.findByIdAndUpdate(payment.booking, { paymentStatus: "paid" });
        }
        if (payment.order) {
          await Order.findByIdAndUpdate(payment.order, { status: "processing" });
        }
        break;

      case "payment.failed":
        payment.status = "failed";
        payment.failureReason = paymentEntity.error_description;
        await payment.save();

        // Notify user
        const notification = await Notification.create({
          user: payment.user,
          title: "Payment Failed",
          message: `Your payment of ₹${payment.amount} failed. Please try again.`,
          type: "error"
        });
        break;

      default:
        console.log("Unhandled webhook event:", event);
    }

    res.json({ status: "ok" });
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(500).json({ message: "Webhook processing failed", error: error.message });
  }
};

// Get payment details
exports.getPaymentById = async (req, res) => {
  try {
    const { id } = req.params;

    const payment = await Payment.findById(id)
      .populate("user", "name email")
      .populate("booking")
      .populate("order");

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    // Check authorization
    if (payment.user._id.toString() !== req.user.userId && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.json({ payment });
  } catch (error) {
    console.error("Get payment by ID error:", error);
    res.status(500).json({ message: "Failed to fetch payment", error: error.message });
  }
};

// Get user's payment history
exports.getPaymentHistory = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;

    const filter = { user: req.user.userId };
    if (status) filter.status = status;

    const payments = await Payment.find(filter)
      .populate("booking", "service date time")
      .populate("order", "orderNumber total")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Payment.countDocuments(filter);

    res.json({
      payments,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalCount: count
    });
  } catch (error) {
    console.error("Get payment history error:", error);
    res.status(500).json({ message: "Failed to fetch payment history", error: error.message });
  }
};

// Refund payment (admin only)
exports.refundPayment = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { amount, reason } = req.body;

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    if (payment.status !== "completed") {
      return res.status(400).json({ message: "Can only refund completed payments" });
    }

    // In production, create refund via Razorpay API
    // const refund = await razorpay.payments.refund(payment.razorpayPaymentId, {
    //   amount: (amount || payment.amount) * 100,
    //   notes: { reason }
    // });

    payment.status = "refunded";
    payment.failureReason = reason || "Refunded by admin";
    await payment.save();

    // Notify user
    const notification = await Notification.create({
      user: payment.user,
      title: "Payment Refunded",
      message: `Your payment of ₹${amount || payment.amount} has been refunded.`,
      type: "success"
    });

    emitToRoom(payment.user.toString(), "payment-refunded", { paymentId });

    res.json({
      message: "Payment refunded successfully",
      payment
    });
  } catch (error) {
    console.error("Refund payment error:", error);
    res.status(500).json({ message: "Failed to refund payment", error: error.message });
  }
};
