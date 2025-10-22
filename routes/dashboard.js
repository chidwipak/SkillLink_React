const express = require("express")
const router = express.Router()
const { authenticateToken } = require("../middleware/jwt")
const dashboardController = require("../controllers/dashboardControllerAPI")

// Protected routes - require authentication
router.use(authenticateToken)

// Get dashboard stats (all roles)
router.get("/stats", dashboardController.getDashboardStats)
router.get("/customer/bookings", isLoggedIn, isCustomer, dashboardController.customerBookings)
router.get("/customer/orders", isLoggedIn, isCustomer, dashboardController.customerOrders)
router.get("/customer/orders/:id", isLoggedIn, isCustomer, dashboardController.customerOrderDetails)
router.get("/customer/orders/:id/review", isLoggedIn, isCustomer, dashboardController.customerOrderReview)
router.get("/customer/notifications", isLoggedIn, isCustomer, dashboardController.getCustomerNotifications)

// Customer address management
router.get("/customer/addresses", isLoggedIn, isCustomer, customerController.getCustomerAddresses)
router.post("/customer/addresses/add", isLoggedIn, isCustomer, customerController.addAddress)
router.post("/customer/addresses/update", isLoggedIn, isCustomer, customerController.updateAddress)
router.post("/customer/addresses/:addressId/delete", isLoggedIn, isCustomer, customerController.deleteAddress)

// Customer: Submit product review
router.post("/customer/submit-product-review", isLoggedIn, isCustomer, dashboardController.submitProductReview)

// Worker Dashboard
router.get("/worker", isLoggedIn, isWorker, dashboardController.workerDashboard)
router.get("/worker/bookings", isLoggedIn, isWorker, dashboardController.workerBookings)

// Worker pricing management
router.get("/worker/pricing", isLoggedIn, isWorker, workerController.getWorkerPricing)
router.post("/worker/pricing/update", isLoggedIn, isWorker, workerController.updateWorkerPricing)

// Worker job history
router.get("/worker/history", isLoggedIn, isWorker, workerController.getWorkerHistory)

// Worker earnings page
router.get("/worker/earnings", isLoggedIn, isWorker, workerController.getWorkerEarnings)

// Worker availability management
router.get("/worker/availability", isLoggedIn, isWorker, workerController.getWorkerAvailability)
router.post("/worker/availability", isLoggedIn, isWorker, workerController.updateWorkerAvailability)

// Worker notifications
router.get("/worker/notifications", isLoggedIn, isWorker, workerController.getWorkerNotifications)

// Seller Dashboard
router.get("/seller", isLoggedIn, isSeller, dashboardController.sellerDashboard)
router.get("/seller/products", isLoggedIn, isSeller, dashboardController.sellerProducts)
router.get("/seller/orders", isLoggedIn, isSeller, dashboardController.sellerOrders)
router.get("/seller/orders/:id", isLoggedIn, isSeller, dashboardController.sellerOrderDetails)
router.get("/seller/reviews", isLoggedIn, isSeller, dashboardController.sellerReviews)
router.get("/seller/profile", isLoggedIn, isSeller, dashboardController.sellerProfile)

// Seller: Update order status
router.post("/seller/orders/update-status", isLoggedIn, isSeller, dashboardController.updateOrderStatus)

// Seller: Add product page
router.get("/seller/add-product", isLoggedIn, isSeller, dashboardController.renderAddProduct)

// Seller: Earnings page
router.get("/seller/earnings", isLoggedIn, isSeller, dashboardController.getSellerEarnings)

// Seller: Notifications page
router.get("/seller/notifications", isLoggedIn, isSeller, dashboardController.getSellerNotifications)

// Seller: Shop settings page
router.get("/seller/shop-settings", isLoggedIn, isSeller, dashboardController.getSellerShopSettings)
router.post("/seller/shop-settings/update", isLoggedIn, isSeller, dashboardController.updateSellerShopSettings)

// Admin Dashboard
router.get("/admin", isLoggedIn, isAdmin, dashboardController.adminDashboard)
router.get("/admin/users", isLoggedIn, isAdmin, dashboardController.adminUsers)
router.get("/admin/workers", isLoggedIn, isAdmin, dashboardController.adminWorkers)
router.get("/admin/sellers", isLoggedIn, isAdmin, dashboardController.adminSellers)
router.get("/admin/bookings", isLoggedIn, isAdmin, dashboardController.adminBookings)
router.get("/admin/orders", isLoggedIn, isAdmin, dashboardController.adminOrders)

// Admin: Delete worker
router.post("/admin/workers/delete/:workerId", isLoggedIn, isAdmin, dashboardController.deleteWorker)

// Admin: Delete seller
router.post("/admin/sellers/delete/:sellerId", isLoggedIn, isAdmin, dashboardController.deleteSeller)

// Admin: Delete user
router.post("/admin/users/delete/:userId", isLoggedIn, isAdmin, dashboardController.deleteUser)

// Profile
router.get("/profile", isLoggedIn, dashboardController.viewProfile)
router.get("/profile/edit", isLoggedIn, dashboardController.renderEditProfile)
router.get("/profile/security", isLoggedIn, dashboardController.renderSecuritySettings)
router.post("/profile/update", isLoggedIn, authController.updateProfile)

// API endpoints for real-time updates
router.get("/customer/orders/data", isLoggedIn, isCustomer, dashboardController.customerOrdersData)
router.get("/seller/orders/data", isLoggedIn, isSeller, dashboardController.sellerOrdersData)
router.get("/admin/data", isLoggedIn, isAdmin, dashboardController.adminDashboardData)

// Admin: Get services management page
router.get("/admin/services", isLoggedIn, isAdmin, dashboardController.getAdminServices)

// Admin: Get reports page
router.get("/admin/reports", isLoggedIn, isAdmin, dashboardController.getAdminReports)

module.exports = router