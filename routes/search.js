const express = require("express")
const router = express.Router()
const searchController = require("../controllers/searchControllerAPI")

// Search route - returns JSON results
router.get("/", searchController.search)

module.exports = router
