const express = require("express");
const router = express.Router();
const { authenticateToken, authorize } = require("../middleware/jwt");
const paymentController = require("../controllers/paymentControllerAPI");

// All routes require authentication (except webhook)
router.post("/webhook", paymentController.handleWebhook);

router.use(authenticateToken);

// Create payment orders
router.post("/booking", paymentController.createBookingPayment);
router.post("/order", paymentController.createOrderPayment);

// Verify payment
router.post("/verify", paymentController.verifyPayment);

// Get payment details
router.get("/:id", paymentController.getPaymentById);

// Get payment history
router.get("/", paymentController.getPaymentHistory);

// Refund (admin only)
router.post("/:paymentId/refund", authorize("admin"), paymentController.refundPayment);

module.exports = router;
