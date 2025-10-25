const express = require("express");
const router = express.Router();
const { authenticateToken, authorize } = require("../middleware/jwt");
const adminController = require("../controllers/adminControllerAPI");

// All routes require authentication and admin role
router.use(authenticateToken);
router.use(authorize("admin"));

// Verification management
router.get("/verifications/pending", adminController.getPendingVerifications);
router.put("/workers/:workerId/verify", adminController.verifyWorker);
router.put("/sellers/:sellerId/verify", adminController.verifySeller);

// User management
router.get("/users", adminController.getAllUsers);
router.get("/users/:userId", adminController.getUserDetails);
router.put("/users/:userId/status", adminController.updateUserStatus);
router.delete("/users/:userId", adminController.deleteUser);

// Analytics
router.get("/analytics", adminController.getSystemAnalytics);

module.exports = router;
