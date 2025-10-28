const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure upload directories exist
const uploadDirs = [
  "public/uploads/profiles",
  "public/uploads/documents",
  "public/uploads/products",
  "public/uploads/shops"
];

uploadDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadPath = "public/uploads/";
    
    // Determine upload path based on fieldname
    if (file.fieldname === "profilePhoto") {
      uploadPath += "profiles/";
    } else if (file.fieldname === "documents" || file.fieldname === "idDocument") {
      uploadPath += "documents/";
    } else if (file.fieldname === "images" || file.fieldname === "productImages") {
      uploadPath += "products/";
    } else if (file.fieldname === "shopImage" || file.fieldname === "shopImages") {
      uploadPath += "shops/";
    }

    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter function
const fileFilter = (req, file, cb) => {
  // Define allowed file types
  const allowedImageTypes = /jpeg|jpg|png|gif|webp/;
  const allowedDocTypes = /pdf|doc|docx/;
  
  const ext = path.extname(file.originalname).toLowerCase();
  const mimetype = file.mimetype;

  // Check if file is an image
  if (file.fieldname === "profilePhoto" || file.fieldname === "images" || 
      file.fieldname === "productImages" || file.fieldname === "shopImage" || 
      file.fieldname === "shopImages") {
    const isValidImage = allowedImageTypes.test(ext) && 
                         /image\/(jpeg|jpg|png|gif|webp)/.test(mimetype);
    
    if (isValidImage) {
      return cb(null, true);
    } else {
      return cb(new Error("Only image files (JPEG, JPG, PNG, GIF, WEBP) are allowed"));
    }
  }

  // Check if file is a document
  if (file.fieldname === "documents" || file.fieldname === "idDocument") {
    const isValidDoc = allowedDocTypes.test(ext) || allowedImageTypes.test(ext);
    
    if (isValidDoc) {
      return cb(null, true);
    } else {
      return cb(new Error("Only PDF, DOC, DOCX, or image files are allowed for documents"));
    }
  }

  cb(new Error("Invalid file type"));
};

// Multer configuration
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Export different upload configurations
module.exports = {
  // Single file uploads
  uploadProfilePhoto: upload.single("profilePhoto"),
  uploadIdDocument: upload.single("idDocument"),
  uploadShopImage: upload.single("shopImage"),
  
  // Multiple file uploads
  uploadProductImages: upload.array("images", 5), // Max 5 images
  uploadShopImages: upload.array("shopImages", 3), // Max 3 images
  uploadDocuments: upload.array("documents", 3), // Max 3 documents
  
  // Mixed uploads
  uploadMixed: upload.fields([
    { name: "profilePhoto", maxCount: 1 },
    { name: "idDocument", maxCount: 2 },
    { name: "shopImage", maxCount: 1 }
  ]),

  // Generic upload
  upload: upload
};
