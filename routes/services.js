const express = require("express")
const router = express.Router()
const serviceController = require("../controllers/serviceControllerAPI")
const { cacheResponse } = require("../middleware/cache")

// Public routes (cached for performance)
router.get("/", cacheResponse({ ttl: 5 * 60 * 1000 }), serviceController.getAllServices)
router.get("/categories", cacheResponse({ ttl: 10 * 60 * 1000 }), serviceController.getCategories)
router.get("/:id", cacheResponse({ ttl: 5 * 60 * 1000 }), serviceController.getServiceById)
router.get("/category/:category/workers", cacheResponse({ ttl: 2 * 60 * 1000 }), serviceController.getWorkersByCategory)
router.get("/workers/:id", cacheResponse({ ttl: 2 * 60 * 1000 }), serviceController.getWorkerDetails)

module.exports = router
