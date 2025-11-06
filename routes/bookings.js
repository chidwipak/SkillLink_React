const express = require("express")
const router = express.Router()
const { authenticateToken, authorize } = require("../middleware/jwt")
const bookingController = require("../controllers/bookingControllerAPI")
const { creationLimiter } = require("../middleware/rateLimiter")
const { createBookingValidation, mongoIdValidation } = require("../middleware/validation")

// Protected routes - require authentication
router.use(authenticateToken)

// Create booking
router.post("/", authorize("customer"), creationLimiter, createBookingValidation, bookingController.createBooking)

// Get user bookings
router.get("/", bookingController.getUserBookings)

// Get booking by ID
router.get("/:id", bookingController.getBookingById)

// Update booking status
router.patch("/:id/status", authorize("worker", "admin"), bookingController.updateBookingStatus)

// Worker actions
router.put("/:id/accept", authorize("worker"), bookingController.acceptBooking)
router.put("/:id/reject", authorize("worker"), bookingController.rejectBooking)
router.put("/:id/start", authorize("worker"), bookingController.startBooking)
router.put("/:id/complete", authorize("worker"), bookingController.completeBooking)

// Cancel booking
router.put("/:id/cancel", authorize("customer"), bookingController.cancelBooking)

// Add review
router.post("/:id/review", authorize("customer"), bookingController.addReview)

module.exports = router
