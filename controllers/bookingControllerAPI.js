const Booking = require("../models/Booking")
const Service = require("../models/Service")
const Worker = require("../models/Worker")
const Payment = require("../models/Payment")
const Notification = require("../models/Notification")

// Create booking
exports.createBooking = async (req, res) => {
  try {
    console.log('=== CREATE BOOKING REQUEST ===')
    console.log('Full request body:', req.body)
    console.log('User ID:', req.user?.userId)
    
    const {
      service: serviceId,
      worker: workerId,
      date,
      time,
      address,
      notes,
      description,
      customerLocation,
    } = req.body

    // Use description as notes if notes not provided
    const bookingNotes = notes || description

    console.log('Extracted fields:')
    console.log('- serviceId:', serviceId, typeof serviceId)
    console.log('- workerId:', workerId, typeof workerId)
    console.log('- date:', date, typeof date)
    console.log('- time:', time, typeof time)
    console.log('- address:', address, typeof address)
    console.log('- notes:', bookingNotes, typeof bookingNotes)
    console.log('============================')

    // Validate required fields
    if (!serviceId || !workerId || !date || !time || !address) {
      console.log('VALIDATION FAILED - Missing fields:')
      console.log('serviceId missing?', !serviceId)
      console.log('workerId missing?', !workerId)
      console.log('date missing?', !date)
      console.log('time missing?', !time)
      console.log('address missing?', !address)
      return res.status(400).json({
        success: false,
        message: "Service, worker, date, time, and address are required",
      })
    }

    // Check if service exists
    const service = await Service.findById(serviceId)
    if (!service) {
      return res.status(404).json({ success: false, message: "Service not found" })
    }

    // Check if worker exists
    const worker = await Worker.findById(workerId)
    if (!worker) {
      return res.status(404).json({ success: false, message: "Worker not found" })
    }

    // Determine the price - first check worker's specific pricing for this service
    let bookingPrice = service.price || 0
    if (worker.pricing && Array.isArray(worker.pricing)) {
      const workerServicePrice = worker.pricing.find(
        p => p.serviceName?.toLowerCase() === service.name.toLowerCase()
      )
      if (workerServicePrice && workerServicePrice.price > 0) {
        bookingPrice = workerServicePrice.price
      }
    }

    // Create booking
    const booking = new Booking({
      customer: req.user.userId,
      worker: workerId,
      service: serviceId,
      date: new Date(date),
      time,
      address,
      notes: bookingNotes,
      price: bookingPrice,
      customerLocation,
      statusHistory: [
        {
          status: "pending",
          timestamp: new Date(),
          notes: "Booking created",
        },
      ],
    })

    await booking.save()

    // Create notification for worker
    await Notification.create({
      user: worker.user,
      title: "New Booking Request",
      message: `You have received a new booking request for ${service.name}`,
      type: "booking",
      link: `/dashboard/worker/bookings/${booking._id}`,
      relatedId: booking._id,
      relatedModel: "Booking",
    })

    // Emit socket event to worker
    if (req.app.io) {
      req.app.io.to(`user-${worker.user}`).emit("new-booking", {
        booking: booking.toObject(),
        service: service.toObject(),
      })
    }

    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      booking,
    })
  } catch (error) {
    console.error("Create booking error:", error)
    res.status(500).json({ success: false, message: "Failed to create booking" })
  }
}

// Get user bookings
exports.getUserBookings = async (req, res) => {
  try {
    const { status, limit = 20, page = 1 } = req.query

    const query = {}
    
    // Filter by role
    if (req.user.role === "customer") {
      query.customer = req.user.userId
    } else if (req.user.role === "worker") {
      const worker = await Worker.findOne({ user: req.user.userId })
      if (!worker) {
        return res.status(404).json({ success: false, message: "Worker profile not found" })
      }
      query.worker = worker._id
    }

    if (status) {
      query.status = status
    }

    const bookings = await Booking.find(query)
      .populate("customer", "name email phone profilePicture address addresses")
      .populate("service", "name category basePrice")
      .populate({
        path: "worker",
        populate: { path: "user", select: "name email phone profilePicture address" },
      })
      .populate("payment")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))

    const total = await Booking.countDocuments(query)

    res.json({
      success: true,
      bookings,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
      },
    })
  } catch (error) {
    console.error("Get bookings error:", error)
    res.status(500).json({ success: false, message: "Failed to fetch bookings" })
  }
}

// Get booking by ID
exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("customer", "name email phone profilePicture address addresses")
      .populate("service", "name category basePrice description")
      .populate({
        path: "worker",
        populate: { path: "user", select: "name email phone profilePicture address" },
      })
      .populate("payment")

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" })
    }

    // Check authorization
    const worker = await Worker.findOne({ user: req.user.userId })
    const isAuthorized =
      booking.customer.toString() === req.user.userId ||
      (worker && booking.worker._id.toString() === worker._id.toString()) ||
      req.user.role === "admin"

    if (!isAuthorized) {
      return res.status(403).json({ success: false, message: "Access denied" })
    }

    res.json({
      success: true,
      booking,
    })
  } catch (error) {
    console.error("Get booking error:", error)
    res.status(500).json({ success: false, message: "Failed to fetch booking" })
  }
}

// Update booking status
exports.updateBookingStatus = async (req, res) => {
  try {
    const { status, notes } = req.body
    const booking = await Booking.findById(req.params.id)

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" })
    }

    // Authorization check
    const worker = await Worker.findOne({ user: req.user.userId })
    const isWorker = worker && booking.worker.toString() === worker._id.toString()
    const isCustomer = booking.customer.toString() === req.user.userId

    if (!isWorker && !isCustomer && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access denied" })
    }

    // Update status
    booking.status = status
    booking.statusHistory.push({
      status,
      timestamp: new Date(),
      notes,
    })

    if (status === "in_progress") {
      booking.actualStartTime = new Date()
    } else if (status === "completed") {
      booking.completionTime = new Date()
    }

    await booking.save()

    // Create notification
    const notifyUserId = isWorker ? booking.customer : worker.user
    await Notification.create({
      user: notifyUserId,
      title: `Booking ${status}`,
      message: `Your booking has been ${status.replace("_", " ")}`,
      type: "booking",
      link: `/ dashboard/bookings/${booking._id}`,
      relatedId: booking._id,
      relatedModel: "Booking",
    })

    // Emit socket event
    if (req.app.io) {
      req.app.io.to(`user-${notifyUserId}`).emit("booking-updated", {
        bookingId: booking._id,
        status,
      })
    }

    res.json({
      success: true,
      message: "Booking status updated",
      booking,
    })
  } catch (error) {
    console.error("Update booking error:", error)
    res.status(500).json({ success: false, message: "Failed to update booking" })
  }
}

// Cancel booking
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" })
    }

    // Only customer can cancel
    if (booking.customer.toString() !== req.user.userId) {
      return res.status(403).json({ success: false, message: "Access denied" })
    }

    if (booking.status === "completed" || booking.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Cannot cancel completed or already cancelled booking",
      })
    }

    booking.status = "cancelled"
    booking.statusHistory.push({
      status: "cancelled",
      timestamp: new Date(),
      notes: "Cancelled by customer",
    })

    await booking.save()

    // Refund if payment was made
    if (booking.payment && booking.paymentStatus === "completed") {
      await Payment.findByIdAndUpdate(booking.payment, { status: "refunded" })
    }

    res.json({
      success: true,
      message: "Booking cancelled successfully",
      booking,
    })
  } catch (error) {
    console.error("Cancel booking error:", error)
    res.status(500).json({ success: false, message: "Failed to cancel booking" })
  }
}

// Worker accept booking
exports.acceptBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" })
    }

    const worker = await Worker.findOne({ user: req.user.userId })
    if (!worker || booking.worker.toString() !== worker._id.toString()) {
      return res.status(403).json({ success: false, message: "Access denied" })
    }

    if (booking.status !== "pending") {
      return res.status(400).json({ success: false, message: "Booking cannot be accepted" })
    }

    // Set to accepted status (intermediate state before completion)
    booking.status = "accepted"
    booking.statusHistory.push({ 
      status: "accepted", 
      timestamp: new Date(),
      notes: "Worker accepted the job"
    })
    await booking.save()

    await Notification.create({
      user: booking.customer,
      title: "Booking Accepted",
      message: `Your booking has been accepted by the worker`,
      type: "booking",
      link: `/dashboard/customer/bookings/${booking._id}`
    })

    res.json({ success: true, message: "Booking accepted successfully", booking })
  } catch (error) {
    console.error("Accept booking error:", error)
    res.status(500).json({ success: false, message: "Failed to accept booking" })
  }
}

// Worker reject booking
exports.rejectBooking = async (req, res) => {
  try {
    const { reason } = req.body
    const booking = await Booking.findById(req.params.id)
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" })
    }

    const worker = await Worker.findOne({ user: req.user.userId })
    if (!worker || booking.worker.toString() !== worker._id.toString()) {
      return res.status(403).json({ success: false, message: "Access denied" })
    }

    if (booking.status !== "pending") {
      return res.status(400).json({ success: false, message: "Booking cannot be rejected" })
    }

    booking.status = "rejected"
    booking.statusHistory.push({ status: "rejected", timestamp: new Date(), notes: reason })
    await booking.save()

    await Notification.create({
      user: booking.customer,
      title: "Booking Rejected",
      message: `Your booking was rejected: ${reason}`,
      type: "booking",
      link: `/dashboard/customer/bookings/${booking._id}`
    })

    res.json({ success: true, message: "Booking rejected", booking })
  } catch (error) {
    console.error("Reject booking error:", error)
    res.status(500).json({ success: false, message: "Failed to reject booking" })
  }
}

// Worker start booking
exports.startBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" })
    }

    const worker = await Worker.findOne({ user: req.user.userId })
    if (!worker || booking.worker.toString() !== worker._id.toString()) {
      return res.status(403).json({ success: false, message: "Access denied" })
    }

    if (booking.status !== "accepted") {
      return res.status(400).json({ success: false, message: "Booking must be accepted first" })
    }

    booking.status = "in-progress"
    booking.statusHistory.push({ status: "in-progress", timestamp: new Date() })
    await booking.save()

    await Notification.create({
      user: booking.customer,
      title: "Work Started",
      message: `Work has started on your booking`,
      type: "booking",
      link: `/dashboard/customer/bookings/${booking._id}`
    })

    res.json({ success: true, message: "Work started", booking })
  } catch (error) {
    console.error("Start booking error:", error)
    res.status(500).json({ success: false, message: "Failed to start booking" })
  }
}

// Worker complete booking
exports.completeBooking = async (req, res) => {
  try {
    const { finalPrice } = req.body
    const booking = await Booking.findById(req.params.id)
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" })
    }

    const worker = await Worker.findOne({ user: req.user.userId })
    if (!worker || booking.worker.toString() !== worker._id.toString()) {
      return res.status(403).json({ success: false, message: "Access denied" })
    }

    if (booking.status !== "in-progress" && booking.status !== "accepted") {
      return res.status(400).json({ success: false, message: "Booking must be accepted or in progress" })
    }

    booking.status = "completed"
    booking.completedAt = new Date()
    const earnedAmount = finalPrice && parseFloat(finalPrice) > 0 ? parseFloat(finalPrice) : booking.price
    booking.finalPrice = earnedAmount
    
    booking.statusHistory.push({ 
      status: "completed", 
      timestamp: new Date(),
      notes: `Final price: ₹${earnedAmount}`
    })
    await booking.save()

    // Update worker earnings and completed jobs count
    worker.earnings = (worker.earnings || 0) + earnedAmount
    worker.jobsCompleted = (worker.jobsCompleted || 0) + 1
    await worker.save()

    await Notification.create({
      user: booking.customer,
      title: "Work Completed",
      message: `Work has been completed. Please leave a review!`,
      type: "booking",
      link: `/dashboard/customer/bookings/${booking._id}`
    })

    res.json({ success: true, message: "Booking completed and earnings updated", booking, earnings: worker.earnings })
  } catch (error) {
    console.error("Complete booking error:", error)
    res.status(500).json({ success: false, message: "Failed to complete booking" })
  }
}

// Add review to booking
exports.addReview = async (req, res) => {
  try {
    const { rating, review } = req.body
    const booking = await Booking.findById(req.params.id)

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" })
    }

    if (booking.customer.toString() !== req.user.userId) {
      return res.status(403).json({ success: false, message: "Access denied" })
    }

    if (booking.status !== "completed") {
      return res.status(400).json({
        success: false,
        message: "Can only review completed bookings",
      })
    }

    booking.rating = rating
    booking.review = review
    booking.isReviewed = true
    await booking.save()

    // Update worker rating - use reviews count for average calculation
    const worker = await Worker.findById(booking.worker)
    const reviewedBookings = await Booking.countDocuments({
      worker: booking.worker,
      isReviewed: true
    })
    
    // Calculate new average rating based on all reviewed bookings
    const allReviewedBookings = await Booking.find({
      worker: booking.worker,
      isReviewed: true
    }).select('rating')
    
    const totalRating = allReviewedBookings.reduce((sum, b) => sum + (b.rating || 0), 0)
    worker.rating = reviewedBookings > 0 ? totalRating / reviewedBookings : rating
    
    // Also add to worker's reviews array
    worker.reviews.push({
      customer: req.user.userId,
      rating: rating,
      comment: review,
      date: new Date()
    })
    
    await worker.save()

    res.json({
      success: true,
      message: "Review added successfully",
      booking,
    })
  } catch (error) {
    console.error("Add review error:", error)
    res.status(500).json({ success: false, message: "Failed to add review" })
  }
}

module.exports = exports
