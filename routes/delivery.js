const express = require("express");
const router = express.Router();
const { authenticateToken, authorize } = require("../middleware/jwt");
const deliveryController = require("../controllers/deliveryControllerAPI");

// All routes require authentication
router.use(authenticateToken);

// Delivery person dashboard
router.get("/stats", authorize("delivery"), deliveryController.getDashboardStats);
router.get("/requests", authorize("delivery"), deliveryController.getPendingRequests);
router.get("/active", authorize("delivery"), deliveryController.getActiveDelivery);
router.get("/history", authorize("delivery"), deliveryController.getDeliveryHistory);
router.put("/availability", authorize("delivery"), deliveryController.toggleAvailability);

// Accept delivery request
router.put("/accept/:orderId", authorize("delivery"), deliveryController.acceptDeliveryRequest);

// Verify OTP and complete delivery
router.put("/deliver/:orderId", authorize("delivery"), deliveryController.verifyOTPAndDeliver);

// Seller routes - assign and handover
router.put("/assign/:orderId", authorize("seller"), deliveryController.assignToDelivery);
router.put("/handed/:orderId", authorize("seller"), deliveryController.handedToDelivery);

// Customer - get delivery person info
router.get("/info/:orderId", authorize("customer"), deliveryController.getDeliveryPersonInfo);

module.exports = router;
