const { body, param, query, validationResult } = require('express-validator');

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

// Validation rules for authentication
const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),
  body('email').trim().isEmail().withMessage('Valid email is required')
    .normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])/).withMessage('Password must contain uppercase, lowercase, number and special character'),
  body('phone').trim().matches(/^[0-9]{10}$/).withMessage('Phone must be 10 digits'),
  body('role').isIn(['customer', 'worker', 'seller', 'delivery']).withMessage('Invalid role'),
  handleValidationErrors
];

const loginValidation = [
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidationErrors
];

// Validation rules for bookings
const createBookingValidation = [
  body('service').trim().notEmpty().withMessage('Service ID is required')
    .isMongoId().withMessage('Invalid service ID'),
  body('worker').trim().notEmpty().withMessage('Worker ID is required')
    .isMongoId().withMessage('Invalid worker ID'),
  body('date').trim().notEmpty().withMessage('Date is required')
    .isISO8601().withMessage('Invalid date format'),
  body('time').trim().notEmpty().withMessage('Time is required'),
  body('address').trim().notEmpty().withMessage('Address is required')
    .isLength({ min: 10, max: 200 }).withMessage('Address must be 10-200 characters'),
  body('description').optional().trim().isLength({ max: 500 }).withMessage('Description too long'),
  handleValidationErrors
];

// Validation rules for products
const createProductValidation = [
  body('name').trim().notEmpty().withMessage('Product name is required')
    .isLength({ min: 3, max: 100 }).withMessage('Name must be 3-100 characters'),
  body('description').trim().notEmpty().withMessage('Description is required')
    .isLength({ min: 10, max: 1000 }).withMessage('Description must be 10-1000 characters'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('stock').optional().isInt({ min: 0 }).withMessage('Stock must be non-negative'),
  body('inStock').optional().isBoolean().withMessage('inStock must be boolean'),
  handleValidationErrors
];

// Validation rules for orders
const createOrderValidation = [
  body('items').isArray({ min: 1 }).withMessage('Order must contain at least one item'),
  body('items.*.product').isMongoId().withMessage('Invalid product ID'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('shippingAddress').trim().notEmpty().withMessage('Shipping address is required')
    .isLength({ min: 10, max: 300 }).withMessage('Address must be 10-300 characters'),
  body('shippingCity').optional().trim().isLength({ min: 2, max: 50 }),
  body('shippingState').optional().trim().isLength({ min: 2, max: 50 }),
  body('shippingZip').optional().trim().matches(/^[0-9]{5,6}$/),
  handleValidationErrors
];

// Validation rules for reviews
const createReviewValidation = [
  body('booking').isMongoId().withMessage('Invalid booking ID'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be 1-5'),
  body('comment').trim().notEmpty().withMessage('Comment is required')
    .isLength({ min: 10, max: 500 }).withMessage('Comment must be 10-500 characters'),
  handleValidationErrors
];

// Validation for MongoDB ID params
const mongoIdValidation = [
  param('id').isMongoId().withMessage('Invalid ID format'),
  handleValidationErrors
];

// Validation for status updates
const statusValidation = [
  body('status').isIn(['pending', 'accepted', 'rejected', 'in-progress', 'completed', 'cancelled'])
    .withMessage('Invalid status'),
  handleValidationErrors
];

module.exports = {
  registerValidation,
  loginValidation,
  createBookingValidation,
  createProductValidation,
  createOrderValidation,
  createReviewValidation,
  mongoIdValidation,
  statusValidation,
  handleValidationErrors
};
