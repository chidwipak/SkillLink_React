# 🌐 SkillLink — Web Services & Swagger API Documentation

This document provides a comprehensive overview of **all Web Services (RESTful APIs)** implemented in SkillLink and the **Swagger/OpenAPI documentation** integration that makes them interactive and testable.

---

## 📌 What Was Implemented

| Component | Description | File Location |
|-----------|-------------|---------------|
| **Swagger Configuration** | OpenAPI 3.0 spec with 97 paths, 100+ endpoints, 10 schemas | `swagger.js` |
| **Swagger UI Integration** | Interactive API docs served at `/api-docs` | `app.js` (line 10, 134-135) |
| **JSON Spec Endpoint** | Machine-readable OpenAPI spec at `/api-docs.json` | `swagger.js` (line 391) |
| **NPM Packages** | `swagger-jsdoc` + `swagger-ui-express` | `package.json` |

---

## 🚀 How to Access & Demonstrate

### Step 1: Start the Server
```bash
node app.js
```

### Step 2: Open Swagger UI
Navigate to: **http://localhost:5005/api-docs**

### Step 3: View Raw JSON Spec
Navigate to: **http://localhost:5005/api-docs.json**

### What You Will See
- **Title**: "SkillLink API Documentation" with version `1.0.0` and `OAS 3.0` badge
- **Server**: `http://localhost:5005 - Development Server`
- **Authorize Button**: Click to enter JWT token for testing protected routes
- **Filter by Tag**: Search box to filter endpoints by category
- **16 Tag Categories**: Each expandable to show all endpoints
- **Try it Out**: Every endpoint has an "Execute" button to test live

---

## 📁 Where Exactly Everything Is Implemented

### 1. Swagger Configuration File

**File:** `swagger.js` (400 lines)

| Section | Lines | What It Contains |
|---------|-------|-----------------|
| Package Imports | 1-2 | `swagger-jsdoc`, `swagger-ui-express` |
| OpenAPI Info | 4-14 | Title, version, description, contact |
| Server Config | 15-20 | Development server URL (localhost:5005) |
| Security Schemes | 22-29 | JWT Bearer authentication definition |
| Data Schemas | 30-182 | 10 reusable model schemas (User, Service, Worker, Booking, Product, Order, Payment, Notification, Seller, Common Responses) |
| Tags Definition | 184-201 | 16 API categories with descriptions |
| Health Endpoints | 213-219 | 1 endpoint |
| Auth Endpoints | 221-239 | 10 endpoints (register, login, verify, profile, etc.) |
| Services Endpoints | 241-246 | 5 endpoints |
| Bookings Endpoints | 248-264 | 13 endpoints |
| Supplies Endpoints | 266-280 | 9 endpoints |
| Orders Endpoints | 282-293 | 8 endpoints |
| Payments Endpoints | 295-302 | 7 endpoints |
| Reviews Endpoints | 304-310 | 6 endpoints |
| Notifications Endpoints | 312-318 | 6 endpoints |
| Dashboard Endpoints | 320-327 | 7 endpoints |
| Delivery Endpoints | 329-339 | 10 endpoints |
| Workers Endpoints | 341-342 | 1 endpoint |
| Admin Endpoints | 344-355 | 10 endpoints |
| Verifier Endpoints | 357-362 | 5 endpoints |
| Search Endpoints | 364-365 | 1 endpoint |
| Metrics Endpoints | 367-368 | 1 endpoint |
| Swagger UI Setup | 372-397 | Express middleware setup with custom styling |

### 2. App.js Integration

**File:** `app.js`

```javascript
// Line 10 — Import
const { setupSwagger } = require("./swagger")

// Lines 134-135 — Mount after all API routes
// Swagger API Documentation
setupSwagger(app)
```

### 3. NPM Dependencies

**File:** `package.json`

```json
"swagger-jsdoc": "^6.x.x",
"swagger-ui-express": "^5.x.x"
```

---

## 🏗️ Web Services Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT (React Frontend)                      │
│                         http://localhost:3000                         │
└───────────────────────────────┬─────────────────────────────────────┘
                                │ HTTP Requests (REST API)
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     EXPRESS SERVER (app.js)                           │
│                     http://localhost:5005                             │
│                                                                      │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────────────┐     │
│  │ Middleware   │→ │ Route Files  │→ │ Controller Files        │     │
│  │ (15 custom)  │  │ (17 files)   │  │ (14 files)              │     │
│  └─────────────┘  └──────────────┘  └────────────┬────────────┘     │
│                                                   │                  │
│  ┌─────────────────────────────────────────────────┘                 │
│  │                                                                   │
│  ▼                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │ Models       │  │ Socket.IO    │  │ Swagger UI   │              │
│  │ (12 schemas) │  │ (Real-time)  │  │ /api-docs    │              │
│  └──────┬───────┘  └──────────────┘  └──────────────┘              │
│         │                                                            │
└─────────┼────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────┐
│   MongoDB Database   │
│   (skilllink db)     │
└─────────────────────┘
```

---

## 📋 Complete API Endpoints Summary (97 Paths, 100+ Methods)

### 🏥 Health Check (1 endpoint)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/health` | ❌ | API health check |

### 🔐 Authentication & Users — `routes/auth.js` → `controllers/authControllerAPI.js` (10 endpoints)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | ❌ | Register new user (customer/worker/seller/delivery) |
| POST | `/api/auth/verify-email` | ❌ | Verify email with OTP |
| POST | `/api/auth/resend-otp` | ❌ | Resend verification OTP |
| POST | `/api/auth/login` | ❌ | Login and get JWT tokens |
| POST | `/api/auth/refresh-token` | ❌ | Refresh expired access token |
| POST | `/api/auth/forgot-password` | ❌ | Request password reset |
| POST | `/api/auth/reset-password` | ❌ | Reset password with token |
| GET | `/api/auth/profile` | ✅ | Get current user profile |
| PUT | `/api/auth/profile` | ✅ | Update profile (with image upload) |
| POST | `/api/auth/logout` | ✅ | Logout user |

### 🔧 Services — `routes/services.js` → `controllers/serviceControllerAPI.js` (5 endpoints)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/services` | ❌ | List services (filter by category, search, paginate) |
| GET | `/api/services/categories` | ❌ | Get unique service categories |
| GET | `/api/services/{id}` | ❌ | Get service details with available workers |
| GET | `/api/services/category/{category}/workers` | ❌ | Get workers by service category |
| GET | `/api/services/workers/{id}` | ❌ | Get specific worker details |

### 📅 Bookings — `routes/bookings.js` → `controllers/bookingControllerAPI.js` (13 endpoints)

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| POST | `/api/bookings` | ✅ | Customer | Create a booking |
| GET | `/api/bookings` | ✅ | Any | Get user's bookings (paginated) |
| POST | `/api/bookings/broadcast` | ✅ | Customer | Broadcast booking to multiple workers |
| GET | `/api/bookings/{id}` | ✅ | Any | Get booking details |
| PATCH | `/api/bookings/{id}/status` | ✅ | Worker/Admin | Update booking status |
| PUT | `/api/bookings/{id}/accept` | ✅ | Worker | Accept a booking |
| PUT | `/api/bookings/{id}/reject` | ✅ | Worker | Reject a booking |
| PUT | `/api/bookings/{id}/start` | ✅ | Worker | Start working on booking |
| PUT | `/api/bookings/{id}/complete` | ✅ | Worker | Complete a booking |
| PUT | `/api/bookings/{id}/cancel` | ✅ | Customer | Cancel a booking |
| GET | `/api/bookings/{id}/alternatives` | ✅ | Customer | Get alternative workers |
| POST | `/api/bookings/{id}/rebook` | ✅ | Customer | Rebook with different worker |
| POST | `/api/bookings/{id}/review` | ✅ | Customer | Add review after completion |
| POST | `/api/bookings/{id}/share-location` | ✅ | Any | Share live location |

### 🛒 Supplies (Products) — `routes/supplies.js` → `controllers/productControllerAPI.js` (9 endpoints)

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/api/supplies` | ❌ | — | Browse all products |
| POST | `/api/supplies` | ✅ | Seller | Create product (with images) |
| GET | `/api/supplies/my-products` | ✅ | Seller | Get seller's own products |
| GET | `/api/supplies/unique` | ❌ | — | Unique products grouped by name |
| POST | `/api/supplies/csv-upload` | ✅ | Seller | Bulk upload via CSV |
| GET | `/api/supplies/{id}` | ❌ | — | Product details |
| PUT | `/api/supplies/{id}` | ✅ | Seller | Update product |
| DELETE | `/api/supplies/{id}` | ✅ | Seller | Delete product |
| PUT | `/api/supplies/{id}/price` | ✅ | Seller | Update price |
| PUT | `/api/supplies/{id}/stock` | ✅ | Seller | Toggle stock status |

### 📦 Orders — `routes/orders.js` → `controllers/orderControllerAPI.js` (8 endpoints)

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| POST | `/api/orders` | ✅ | Customer | Place an order |
| GET | `/api/orders` | ✅ | Customer | Get my orders |
| GET | `/api/orders/seller` | ✅ | Seller | Get seller's orders |
| GET | `/api/orders/{id}` | ✅ | Any | Order details |
| PUT | `/api/orders/{id}/status` | ✅ | Seller | Update order status |
| PUT | `/api/orders/{id}/cancel` | ✅ | Customer | Cancel order |
| GET | `/api/orders/{id}/track` | ✅ | Any | Track order |
| POST | `/api/orders/verify-pickup-otp` | ✅ | Seller | Verify pickup OTP |
| GET | `/api/orders/{orderId}/pickup-otps` | ✅ | Seller | Get pickup OTPs |

### 💳 Payments — `routes/payment.js` → `controllers/paymentControllerAPI.js` (7 endpoints)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/payment/webhook` | ❌ | Razorpay webhook handler |
| POST | `/api/payment/booking` | ✅ | Create booking payment |
| POST | `/api/payment/order` | ✅ | Create order payment |
| POST | `/api/payment/verify` | ✅ | Verify payment completion |
| GET | `/api/payment` | ✅ | Payment history (paginated) |
| GET | `/api/payment/{id}` | ✅ | Payment details |
| POST | `/api/payment/{paymentId}/refund` | ✅ | Refund payment (admin) |

### ⭐ Reviews — `routes/reviews.js` → `controllers/reviewControllerAPI.js` (6 endpoints)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/reviews/worker` | ✅ | Add worker review |
| POST | `/api/reviews/product` | ✅ | Add product review |
| POST | `/api/reviews/seller` | ✅ | Add seller review |
| GET | `/api/reviews/worker/{workerId}` | ❌ | Get worker's reviews |
| GET | `/api/reviews/product/{productId}` | ❌ | Get product's reviews |
| GET | `/api/reviews/seller/{sellerId}` | ❌ | Get seller's reviews |

### 🔔 Notifications — `routes/notifications.js` → `controllers/notificationControllerAPI.js` (6 endpoints)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/notifications` | ✅ | Get user notifications (paginated) |
| GET | `/api/notifications/unread-count` | ✅ | Get unread count |
| PATCH | `/api/notifications/mark-all-read` | ✅ | Mark all as read |
| PATCH | `/api/notifications/{id}/read` | ✅ | Mark single as read |
| DELETE | `/api/notifications/{id}` | ✅ | Delete notification |
| DELETE | `/api/notifications/cleanup/read` | ✅ | Delete all read notifications |

### 📊 Dashboard — `routes/dashboard-new.js` → `controllers/dashboardControllerAPI.js` (7 endpoints)

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/api/dashboard/customer/stats` | ✅ | Customer | Customer dashboard stats |
| GET | `/api/dashboard/worker/stats` | ✅ | Worker | Worker earnings, bookings, reviews |
| GET | `/api/dashboard/seller/stats` | ✅ | Seller | Seller products, orders, revenue |
| GET | `/api/dashboard/seller/profile` | ✅ | Seller | Seller profile info |
| PUT | `/api/dashboard/seller/shop-settings` | ✅ | Seller | Update shop settings (images) |
| GET | `/api/dashboard/delivery/stats` | ✅ | Delivery | Delivery dashboard stats |
| GET | `/api/dashboard/admin/stats` | ✅ | Admin | System-wide admin stats |

### 🚚 Delivery — `routes/delivery.js` → `controllers/deliveryControllerAPI.js` (10 endpoints)

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/api/delivery/stats` | ✅ | Delivery | Dashboard statistics |
| GET | `/api/delivery/requests` | ✅ | Delivery | Pending delivery requests |
| GET | `/api/delivery/active` | ✅ | Delivery | Active delivery details |
| GET | `/api/delivery/history` | ✅ | Delivery | Delivery history |
| PUT | `/api/delivery/availability` | ✅ | Delivery | Toggle availability |
| PUT | `/api/delivery/accept/{orderId}` | ✅ | Delivery | Accept delivery request |
| PUT | `/api/delivery/deliver/{orderId}` | ✅ | Delivery | Complete with OTP |
| PUT | `/api/delivery/assign/{orderId}` | ✅ | Seller | Assign to delivery |
| PUT | `/api/delivery/handed/{orderId}` | ✅ | Seller | Mark as handed |
| GET | `/api/delivery/info/{orderId}` | ✅ | Customer | Get delivery person info |

### 👷 Workers — `routes/workers.js` (1 endpoint)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| PUT | `/api/workers/availability` | ✅ | Update worker availability |

### 🛡️ Admin — `routes/admin.js` → `controllers/adminControllerAPI.js` (10 endpoints)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/admin/verifications/pending` | ✅ | Pending verifications |
| PUT | `/api/admin/workers/{id}/verify` | ✅ | Verify/reject worker |
| PUT | `/api/admin/sellers/{id}/verify` | ✅ | Verify/reject seller |
| PUT | `/api/admin/delivery/{id}/verify` | ✅ | Verify/reject delivery person |
| GET | `/api/admin/users` | ✅ | All users (filter, paginate) |
| GET | `/api/admin/users/approved` | ✅ | Approved users |
| GET | `/api/admin/users/rejected` | ✅ | Rejected users |
| GET | `/api/admin/users/{userId}` | ✅ | User details with stats |
| PUT | `/api/admin/users/{userId}/status` | ✅ | Update user status |
| DELETE | `/api/admin/users/{userId}` | ✅ | Delete user |
| GET | `/api/admin/analytics` | ✅ | System analytics |

### ✅ Verifier — `routes/verifier.js` → `controllers/verifierControllerAPI.js` (5 endpoints)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/verifier/stats` | ✅ | Verifier dashboard stats |
| GET | `/api/verifier/pending` | ✅ | All pending users |
| GET | `/api/verifier/users/{userId}` | ✅ | User details for review |
| PUT | `/api/verifier/users/{userId}/approve` | ✅ | Approve user |
| PUT | `/api/verifier/users/{userId}/decline` | ✅ | Decline with feedback |

### 🔍 Search — `routes/search.js` → `controllers/searchControllerAPI.js` (1 endpoint)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/search` | ❌ | Global search (services, products, workers) |

### 📈 Metrics (1 endpoint)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/metrics` | ❌ | System performance metrics |

---

## 📐 Data Schemas Documented in Swagger

These schemas are defined in `swagger.js` (lines 30-182) and visible in the Swagger UI under "Schemas":

| Schema | Model File | Key Fields |
|--------|-----------|------------|
| **User** | `models/User.js` | name, email, phone, role, verification_status, profilePicture |
| **Service** | `models/Service.js` | name, category, description, price, duration |
| **Worker** | `models/Worker.js` | serviceCategory, skills, experience, rating, isAvailable |
| **Booking** | `models/Booking.js` | customer, worker, service, date, time, status, price |
| **Product** | `models/Product.js` | name, brand, category, price, stock, images, seller |
| **Order** | `models/Order.js` | orderNumber, items, totalAmount, status, shippingAddress |
| **Payment** | `models/Payment.js` | relatedId, relatedModel, amount, status, razorpayOrderId |
| **Notification** | `models/Notification.js` | title, message, type, isRead, link |
| **Seller** | `models/Seller.js` | businessName, shopName, categories, rating |
| **SuccessResponse** | — | `{ success: true, message: "..." }` |
| **ErrorResponse** | — | `{ success: false, message: "..." }` |
| **PaginationInfo** | — | `{ total, page, pages }` |

---

## 🔒 JWT Authentication in Swagger

### How It Works

1. **Login** via `POST /api/auth/login` with email & password
2. **Copy** the `accessToken` from the response
3. **Click "Authorize"** button (top-right of Swagger UI)
4. **Paste** the token (without "Bearer " prefix — Swagger adds it)
5. **All protected endpoints** now have the 🔒 lock icon and will send the token

### Security Scheme Definition (in `swagger.js`)

```javascript
securitySchemes: {
  bearerAuth: {
    type: "http",
    scheme: "bearer",
    bearerFormat: "JWT",
    description: "Enter your JWT token obtained from /api/auth/login"
  }
}
```

---

## 🗂️ Complete File Structure

```
SkillLink_React_6thfeb2026/
│
├── swagger.js                          ← NEW: Swagger/OpenAPI configuration (400 lines)
├── app.js                              ← MODIFIED: Lines 10, 134-135 (Swagger integration)
├── package.json                        ← MODIFIED: Added swagger-jsdoc, swagger-ui-express
│
├── routes/                             ← 17 route files defining API paths
│   ├── index.js                        → Health check
│   ├── auth.js                         → Authentication routes
│   ├── services.js                     → Service listing routes
│   ├── bookings.js                     → Booking management routes
│   ├── supplies.js                     → Product/supply routes
│   ├── orders.js                       → Order management routes
│   ├── payment.js                      → Payment processing routes
│   ├── reviews.js                      → Review routes
│   ├── notifications.js                → Notification routes
│   ├── dashboard-new.js                → Dashboard stats routes
│   ├── delivery.js                     → Delivery operations routes
│   ├── workers.js                      → Worker management routes
│   ├── admin.js                        → Admin panel routes
│   ├── admin-api.js                    → Admin API routes
│   ├── verifier.js                     → Verifier routes
│   ├── search.js                       → Search route
│   └── dashboard.js                    → Legacy dashboard
│
├── controllers/                        ← 14 controller files (business logic)
│   ├── authControllerAPI.js            → Auth logic (22KB)
│   ├── serviceControllerAPI.js         → Services logic
│   ├── bookingControllerAPI.js         → Bookings logic (43KB)
│   ├── productControllerAPI.js         → Products logic (16KB)
│   ├── orderControllerAPI.js           → Orders logic (16KB)
│   ├── paymentControllerAPI.js         → Payment logic (12KB)
│   ├── reviewControllerAPI.js          → Reviews logic
│   ├── notificationControllerAPI.js    → Notifications logic
│   ├── dashboardControllerAPI.js       → Dashboard logic (32KB)
│   ├── deliveryControllerAPI.js        → Delivery logic (18KB)
│   ├── adminControllerAPI.js           → Admin logic (19KB)
│   ├── verifierControllerAPI.js        → Verifier logic
│   ├── searchControllerAPI.js          → Search logic
│   └── notificationController.js       → Notification helpers
│
├── models/                             ← 12 Mongoose schema files
│   ├── User.js                         → Base user model
│   ├── Worker.js                       → Worker profile
│   ├── Seller.js                       → Seller profile
│   ├── DeliveryPerson.js               → Delivery person profile
│   ├── Service.js                      → Service definitions
│   ├── Product.js                      → Product catalog
│   ├── Booking.js                      → Service bookings
│   ├── Order.js                        → Product orders
│   ├── Payment.js                      → Payment records
│   ├── Notification.js                 → User notifications
│   ├── DeliveryAssignment.js           → Delivery tracking
│   └── LocationTracking.js             → Location data
│
└── middleware/                         ← 15 custom middleware files
    ├── jwt.js                          → JWT authentication
    ├── auth.js                         → Role authorization
    ├── rateLimiter.js                  → Rate limiting
    ├── validation.js                   → Input validation
    ├── upload.js                       → File uploads
    ├── sanitizer.js                    → XSS/injection protection
    ├── cache.js                        → Response caching
    ├── logger.js                       → Request logging
    ├── errorHandler.js                 → Error handling
    ├── responseFormatter.js            → Response formatting
    ├── requestTimer.js                 → Performance tracking
    ├── sessionManager.js               → Session management
    ├── inputNormalizer.js              → Input normalization
    ├── pagination.js                   → Pagination helper
    └── asyncHandler.js                 → Async error wrapper
```

---

## 📊 Implementation Statistics

| Metric | Count |
|--------|-------|
| **Total API Paths** | 97 |
| **Total Endpoint Methods** | 100+ |
| **API Tag Categories** | 16 |
| **Data Schemas** | 12 (10 model + 2 common) |
| **Route Files** | 17 |
| **Controller Files** | 14 |
| **Model Files** | 12 |
| **Middleware Files** | 15 |
| **Public Endpoints** (no auth) | ~20 |
| **Protected Endpoints** (JWT) | ~80 |

---

## 🧪 How to Verify the Implementation

### Quick Verification Commands

```bash
# 1. Start the server
node app.js

# 2. Test health endpoint
curl http://localhost:5005/api/health

# 3. Test Swagger JSON spec
curl http://localhost:5005/api-docs.json

# 4. Open Swagger UI in browser
# Navigate to: http://localhost:5005/api-docs
```

### Verify in Code

```bash
# Check swagger.js exists and has content
dir swagger.js

# Check swagger is imported in app.js
findstr "swagger" app.js

# Check packages are installed
npm list swagger-jsdoc swagger-ui-express
```

---

## 👥 Team Member Contribution Mapping

| API Category | Route File | Controller File | Primary Member |
|-------------|-----------|-----------------|----------------|
| Auth & Users | `auth.js` | `authControllerAPI.js` | Kainuru Balaji |
| Products & Supplies | `supplies.js` | `productControllerAPI.js` | Chidwipak Kuppani |
| Dashboard Stats | `dashboard-new.js` | `dashboardControllerAPI.js` | Jeevan Kumar Kotati |
| Bookings & Services | `bookings.js`, `services.js` | `bookingControllerAPI.js`, `serviceControllerAPI.js` | Kunda Sriman |
| Delivery & Orders | `delivery.js`, `orders.js` | `deliveryControllerAPI.js`, `orderControllerAPI.js` | Ajjapagu Praneeth |
| Swagger Integration | `swagger.js` | — | All Members |

---

*Generated on: March 19, 2026*
*Swagger Version: OpenAPI 3.0.0*
*Server: Express.js on Node.js*
