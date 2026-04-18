# 👤 CHIDWIPAK — Individual Web Services Demo Guide
## Customer-Seller Pipeline (Cart → Order → Seller Fulfillment → Feedback)

---

## 🎯 Your Area of Responsibility

You own the **complete Customer-Seller pipeline**:
- Customer browsing products in the shop
- Adding products to cart
- Placing an order (checkout)
- Order reaching the seller
- Seller confirming/updating order status
- Payment processing for orders
- Customer leaving product and seller reviews (feedback)

---

## 📋 Your Complete API Endpoints

### 1. Product Browsing (Customer Views Products)

| # | Method | Endpoint | Auth? | Purpose |
|---|--------|----------|-------|---------|
| 1 | `GET` | `/api/supplies` | ❌ No | Browse all products (with search, category filter, price filter) |
| 2 | `GET` | `/api/supplies/unique` | ❌ No | Get unique products grouped by name |
| 3 | `GET` | `/api/supplies/:id` | ❌ No | Get single product details |
| 4 | `GET` | `/api/supplies/product/:name` | ❌ No | Get product by name |
| 5 | `GET` | `/api/supplies/sellers/:name` | ❌ No | Get all sellers offering a product |

### 2. Order Management (Customer Places Order)

| # | Method | Endpoint | Auth? | Purpose |
|---|--------|----------|-------|---------|
| 6 | `POST` | `/api/orders` | ✅ Customer | Create a new order |
| 7 | `GET` | `/api/orders` | ✅ Customer | Get all my orders |
| 8 | `GET` | `/api/orders/:id` | ✅ Customer | Get specific order details |
| 9 | `PUT` | `/api/orders/:id/cancel` | ✅ Customer | Cancel an order |
| 10 | `GET` | `/api/orders/:id/track` | ✅ Customer | Track order status |

### 3. Seller Order Handling (Seller Receives & Processes Orders)

| # | Method | Endpoint | Auth? | Purpose |
|---|--------|----------|-------|---------|
| 11 | `GET` | `/api/orders/seller` | ✅ Seller | Get all orders assigned to me |
| 12 | `PUT` | `/api/orders/:id/status` | ✅ Seller | Update order status (confirm, prepare, etc.) |
| 13 | `POST` | `/api/orders/verify-pickup-otp` | ✅ Seller | Verify pickup OTP when delivery person arrives |
| 14 | `GET` | `/api/orders/:orderId/pickup-otps` | ✅ Seller | Get pickup OTPs for an order |

### 4. Seller Product Management

| # | Method | Endpoint | Auth? | Purpose |
|---|--------|----------|-------|---------|
| 15 | `POST` | `/api/supplies` | ✅ Seller | Create/add a new product |
| 16 | `GET` | `/api/supplies/my-products` | ✅ Seller | Get my listed products |
| 17 | `PUT` | `/api/supplies/:id` | ✅ Seller | Update product details |
| 18 | `PUT` | `/api/supplies/:id/price` | ✅ Seller | Update product price |
| 19 | `PUT` | `/api/supplies/:id/stock` | ✅ Seller | Toggle product stock status |
| 20 | `DELETE` | `/api/supplies/:id` | ✅ Seller | Delete a product |
| 21 | `POST` | `/api/supplies/csv-upload` | ✅ Seller | Bulk upload products via CSV |

### 5. Payment (Order Payment Processing)

| # | Method | Endpoint | Auth? | Purpose |
|---|--------|----------|-------|---------|
| 22 | `POST` | `/api/payment/order` | ✅ Customer | Create payment for an order |
| 23 | `POST` | `/api/payment/verify` | ✅ Customer | Verify payment after Razorpay |
| 24 | `GET` | `/api/payment/:id` | ✅ Logged in | Get payment details |
| 25 | `GET` | `/api/payment` | ✅ Logged in | Get payment history |

### 6. Reviews & Feedback

| # | Method | Endpoint | Auth? | Purpose |
|---|--------|----------|-------|---------|
| 26 | `POST` | `/api/reviews/product` | ✅ Customer | Add product review |
| 27 | `POST` | `/api/reviews/seller` | ✅ Customer | Add seller review |
| 28 | `GET` | `/api/reviews/product/:productId` | ❌ No | Get product reviews |
| 29 | `GET` | `/api/reviews/seller/:sellerId` | ❌ No | Get seller reviews |

**Total: 29 endpoints** — This is your pipeline!

---

## 🔄 Complete Customer-Seller Flow (Step-by-Step)

```
STEP 1: Customer browses products
    GET /api/supplies?category=electrical&search=LED
    → Returns list of products with prices, images, ratings

STEP 2: Customer views a specific product
    GET /api/supplies/:productId
    → Returns full product details, seller info, reviews

STEP 3: Customer views all sellers for that product
    GET /api/supplies/sellers/LED Bulb 9W
    → Returns list of sellers with prices and ratings

STEP 4: Customer places an order (from cart)
    POST /api/orders
    Body: { items: [{productId, quantity}], shippingAddress: {...}, paymentMethod: "razorpay" }
    → Creates order, generates pickup OTPs per seller, sends notifications

STEP 5: Payment is created
    POST /api/payment/order
    Body: { orderId: "..." }
    → Creates Razorpay payment order

STEP 6: Payment is verified
    POST /api/payment/verify
    Body: { paymentId, razorpayPaymentId, razorpayOrderId, razorpaySignature }
    → Verifies payment, updates order to "confirmed"

STEP 7: Seller receives the order
    GET /api/orders/seller
    → Returns all orders containing seller's products

STEP 8: Seller updates order status
    PUT /api/orders/:id/status
    Body: { status: "confirmed" }
    → Updates order, sends notification to customer

STEP 9: Customer tracks the order
    GET /api/orders/:id/track
    → Returns order with tracking history and current status

STEP 10: Delivery person picks up (seller verifies OTP)
    POST /api/orders/verify-pickup-otp
    Body: { orderId: "...", otp: "1234" }
    → Verifies pickup, marks item as handed to delivery

STEP 11: After delivery, customer leaves reviews
    POST /api/reviews/product
    Body: { productId, rating: 5, comment: "Great quality!" }

    POST /api/reviews/seller
    Body: { sellerId, rating: 4, comment: "Fast shipping" }
```

---

## 🎤 Demo Script (What to Show the Professor)

### Demo 1: Product Browsing (2 min)
1. Open Swagger UI → `http://localhost:5005/api-docs`
2. Go to **Supplies (Products)** section
3. Execute `GET /api/supplies` → Show all products
4. Execute `GET /api/supplies?category=electrical` → Show filtering
5. Execute `GET /api/supplies/:id` → Show single product detail

### Demo 2: Order Creation (3 min)
1. **Login as customer**: `POST /api/auth/login` with `ananya@example.com` / `password123`
2. Copy token → Click **Authorize** → Paste token
3. Execute `POST /api/orders` with:
```json
{
  "items": [
    { "productId": "<use_real_product_id>", "quantity": 2 }
  ],
  "shippingAddress": {
    "name": "Ananya Sharma",
    "phone": "9876543210",
    "street": "123 Main St, Kukatpally",
    "city": "Hyderabad",
    "state": "Telangana",
    "zipCode": "500072"
  },
  "paymentMethod": "razorpay"
}
```
4. Show the order was created with status "pending"

### Demo 3: Seller Side (2 min)
1. **Login as seller**: `POST /api/auth/login` with `mahesh.seller@example.com` / `password123`
2. Copy token → Re-authorize
3. Execute `GET /api/orders/seller` → Show the new order appears
4. Execute `PUT /api/orders/:id/status` → Change to "confirmed"

### Demo 4: Payment (2 min)
1. Login as customer again
2. Execute `POST /api/payment/order` → Show Razorpay order created
3. Execute `GET /api/payment` → Show payment history

### Demo 5: Reviews (1 min)
1. As customer, execute `POST /api/reviews/product` with rating and comment
2. Execute `GET /api/reviews/product/:productId` → Show the review

---

## 🧠 Questions You Should Be Ready to Answer

### Q: "Explain the order creation flow."
> "When a customer calls `POST /api/orders`, the controller:
> 1. Validates the items array and shipping address
> 2. Fetches each product from the database to get current prices
> 3. Groups items by seller (since orders can have products from multiple sellers)
> 4. Generates unique pickup OTPs per seller (for delivery person verification)
> 5. Calculates subtotal, platform fee, and total amount
> 6. Saves the order to MongoDB
> 7. Sends real-time notifications to each seller via Socket.IO
> 8. Returns the order with status 'pending'"

### Q: "How does the seller receive orders?"
> "The seller calls `GET /api/orders/seller`. In the controller, we first find the Seller document linked to the logged-in user, then query all Orders where any `item.seller` matches that seller's ID. This means if an order has products from 3 different sellers, each seller only sees the items relevant to them."

### Q: "How does the pickup OTP system work?"
> "When an order is created, each seller's items get a unique 4-digit pickup OTP stored in `item.pickupOTP`. When the delivery person arrives at the seller's shop, the seller verifies the OTP via `POST /api/orders/verify-pickup-otp`. This confirms the items were properly handed over to the delivery person."

### Q: "How do reviews work?"
> "We have separate review endpoints for products and sellers. When `POST /api/reviews/product` is called, the controller:
> 1. Verifies the user has actually ordered that product (checks Order collection)
> 2. Prevents duplicate reviews (checks if already reviewed)
> 3. Creates a review object with rating, comment, and user info
> 4. Pushes it to the product's `reviews` array
> 5. Recalculates the product's average rating
> The same pattern applies for seller reviews."

### Q: "What HTTP methods and status codes do you use?"
> "For browsing products I use `GET` (200 OK), for creating orders `POST` (201 Created), for updating order status `PUT` (200 OK), for cancelling orders `PUT` (200 OK). Error responses include 400 (bad request — missing fields), 401 (unauthorized — no token), 403 (forbidden — wrong role), 404 (order not found), and 500 (server error)."

### Q: "How is the payment integrated?"
> "We use Razorpay as the payment gateway. The flow is:
> 1. Frontend calls `POST /api/payment/order` with the orderId
> 2. Backend creates a Razorpay order via the Razorpay API and saves a Payment record
> 3. Frontend opens the Razorpay checkout modal
> 4. After payment, frontend calls `POST /api/payment/verify` with the Razorpay signature
> 5. Backend verifies the signature to ensure it's authentic
> 6. Updates the payment status to 'completed' and the order status to 'confirmed'"

---

## 📁 Your Files in the Codebase

| Layer | File | What You Built |
|-------|------|---------------|
| **Route** | `routes/supplies.js` | Product API routes with multer for image uploads |
| **Route** | `routes/orders.js` | Order CRUD routes |
| **Route** | `routes/payment.js` | Payment processing routes |
| **Route** | `routes/reviews.js` | Review routes for products and sellers |
| **Controller** | `controllers/productControllerAPI.js` | Product CRUD, search, filter, CSV bulk upload |
| **Controller** | `controllers/orderControllerAPI.js` | Order creation, seller orders, tracking, OTP |
| **Controller** | `controllers/paymentControllerAPI.js` | Razorpay integration, payment verification |
| **Controller** | `controllers/reviewControllerAPI.js` | Review creation with duplicate prevention |
| **Model** | `models/Product.js` | Product schema with reviews, ratings |
| **Model** | `models/Order.js` | Order schema with items, tracking, OTP |
| **Model** | `models/Payment.js` | Payment schema with Razorpay fields |
| **Swagger** | `swagger.js` | Documentation for Supplies, Orders, Payments, Reviews |
| **Frontend** | `client/src/pages/Shop.jsx` | Product browsing page |
| **Frontend** | `client/src/pages/ProductDetail.jsx` | Product detail page |
| **Frontend** | `client/src/pages/Checkout.jsx` | Checkout page |
| **Frontend** | `client/src/pages/PaymentGateway.jsx` | Payment page |

---

## ⚡ Quick Reference Card

```
YOUR LOGIN (for demo):
  Customer: ananya@example.com / password123
  Seller: mahesh.seller@example.com / password123

YOUR SWAGGER SECTIONS:
  → Supplies (Products)  [8 endpoints]
  → Orders               [10 endpoints]
  → Payments             [7 endpoints]
  → Reviews              [6 endpoints - product & seller parts]

KEY MODELS:
  → Product (name, brand, category, price, stock, seller, reviews)
  → Order (customer, items[], totalAmount, status, deliveryOTP)
  → Payment (user, amount, status, razorpayOrderId)

KEY STATUS FLOWS:
  Order:   pending → confirmed → assigned_delivery → out_for_delivery → delivered
  Payment: pending → processing → completed (or failed → refunded)
```

---

*You own 29 endpoints covering the complete customer-seller commerce pipeline. Practice the demo script and you'll ace this!*
