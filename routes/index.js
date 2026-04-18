const express = require("express")
const router = express.Router()

// Root route
router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "SkillLink API is running",
    version: "1.0.0",
    docs: "/api-docs",
  })
})

// API health check
router.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "SkillLink API is running",
    timestamp: new Date().toISOString(),
  })
})

module.exports = router
