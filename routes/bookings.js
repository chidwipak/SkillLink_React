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

// Create broadcast booking (send to all workers)
router.post("/broadcast", authorize("customer"), creationLimiter, bookingController.createBroadcastBooking)

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

// Rejection fallback routes (customer)
router.get("/:id/alternatives", authorize("customer"), bookingController.getAlternativeWorkers)
router.post("/:id/rebook", authorize("customer"), bookingController.rebookWithWorker)
router.post("/:id/broadcast-rebook", authorize("customer"), bookingController.broadcastRejectedBooking)

// Add review
router.post("/:id/review", authorize("customer"), bookingController.addReview)

// Location sharing
router.post("/:id/share-location", authorize("customer"), bookingController.shareLiveLocation)
router.post("/:id/stop-location", authorize("customer"), bookingController.stopSharingLocation)

module.exports = router
