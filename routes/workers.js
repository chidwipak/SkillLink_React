const express = require("express")
const router = express.Router()
const { authenticateToken, authorize } = require("../middleware/jwt")
const Worker = require("../models/Worker")

// All routes require worker authentication
router.use(authenticateToken, authorize("worker"))

// Update availability
router.put("/availability", async (req, res) => {
  try {
    const { isAvailable } = req.body
    const worker = await Worker.findOne({ user: req.user.userId })

    if (!worker) {
      return res.status(404).json({
        success: false,
        message: "Worker profile not found",
      })
    }

    worker.isAvailable = isAvailable
    await worker.save()

    res.json({
      success: true,
      message: `Availability ${isAvailable ? 'enabled' : 'disabled'}`,
      worker,
    })
  } catch (error) {
    console.error("Update availability error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to update availability",
    })
  }
})

module.exports = router
