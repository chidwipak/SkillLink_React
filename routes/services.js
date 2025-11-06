const express = require("express")
const router = express.Router()
const serviceController = require("../controllers/serviceControllerAPI")

// Public routes
router.get("/", serviceController.getAllServices)
router.get("/categories", serviceController.getCategories)
router.get("/:id", serviceController.getServiceById)
router.get("/category/:category/workers", serviceController.getWorkersByCategory)
router.get("/workers/:id", serviceController.getWorkerDetails)

module.exports = router
