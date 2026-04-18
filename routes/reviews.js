const express = require("express")
const router = express.Router()
const reviewController = require("../controllers/reviewControllerAPI")
const { authenticateToken } = require("../middleware/jwt")

// Add review for worker (requires auth)
router.post("/worker", authenticateToken, reviewController.addWorkerReview)

// Add review for product (requires auth)
router.post("/product", authenticateToken, reviewController.addProductReview)

// Add review for seller (requires auth)
router.post("/seller", authenticateToken, reviewController.addSellerReview)

// Get worker reviews (public)
router.get("/worker/:workerId", reviewController.getWorkerReviews)

// Get product reviews (public)
router.get("/product/:productId", reviewController.getProductReviews)

// Get seller reviews (public)
router.get("/seller/:sellerId", reviewController.getSellerReviews)

module.exports = router
