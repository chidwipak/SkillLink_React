const express = require("express")
const router = express.Router()
const productController = require("../controllers/productControllerAPI")
const { authenticateToken, authorize } = require("../middleware/jwt")
const multer = require("multer")
const path = require("path")

// Multer configuration for product image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/products/")
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname)
  },
})

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|gif/
    const mimetype = filetypes.test(file.mimetype)
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase())
    if (mimetype && extname) {
      return cb(null, true)
    }
    cb(new Error("Only image files are allowed"))
  },
})

// Seller routes - require authentication and seller role (MUST BE BEFORE /:id)
router.get("/my-products", authenticateToken, authorize("seller"), productController.getMyProducts)
router.post("/", authenticateToken, authorize("seller"), upload.array("images", 5), productController.createProduct)
router.put("/:id", authenticateToken, authorize("seller"), upload.array("images", 5), productController.updateProduct)
router.put("/:id/price", authenticateToken, authorize("seller"), productController.updateProductPrice)
router.put("/:id/stock", authenticateToken, authorize("seller"), productController.toggleProductStock)
router.delete("/:id", authenticateToken, authorize("seller"), productController.deleteProduct)

// Public routes
router.get("/", productController.getAllProducts)
router.get("/unique", productController.getUniqueProducts)
router.get("/product/:name", productController.getProductByName)
router.get("/sellers/:name", productController.getProductSellers)
router.get("/:id", productController.getProductById)

module.exports = router