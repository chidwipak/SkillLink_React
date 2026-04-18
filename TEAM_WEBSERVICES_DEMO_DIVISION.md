# 🌐 SkillLink — Web Services & Swagger Demo Division (Team of 5)

> **Each member demonstrates the Web Services (Swagger UI + Postman) for the API endpoints they built.**
> **Server URL**: `http://localhost:5005` | **Swagger UI**: `http://localhost:5005/api-docs`

---

## 📌 Before the Demo — Common Setup (Any ONE Member Does This)

```bash
cd c:\Users\lokan\Downloads\Skilllink_WBD_final\SkillLink_React_6thfeb2026
node app.js
```
- Open **Swagger UI** → `http://localhost:5005/api-docs`
- Open **Postman** → Import `SkillLink_API_Postman_Collection.json`

---

## 👤 Member 1: JEEVAN KUMAR KOTATI — Dashboard APIs

### Your Contribution
Dashboard stats for Customer, Worker, and Seller roles.

### Files You Worked On
| File | Purpose |
|------|---------|
| `routes/dashboard-new.js` | Dashboard route definitions |
| `controllers/dashboardControllerAPI.js` | Dashboard business logic (32KB) |

### Swagger UI Demo (Your Endpoints)

Open `http://localhost:5005/api-docs` → Expand **"Dashboard"** tag

| # | Method | Endpoint | Auth | What to Show |
|---|--------|----------|------|-------------|
| 1 | GET | `/api/dashboard/customer/stats` | ✅ Customer | Customer's bookings, orders summary |
| 2 | GET | `/api/dashboard/worker/stats` | ✅ Worker | Worker earnings, rating (4.2), completed jobs |
| 3 | GET | `/api/dashboard/seller/stats` | ✅ Seller | Products count, orders, revenue |
| 4 | GET | `/api/dashboard/seller/profile` | ✅ Seller | Seller business profile details |
| 5 | PUT | `/api/dashboard/seller/shop-settings` | ✅ Seller | Update shop name, description, images |
| 6 | GET | `/api/dashboard/delivery/stats` | ✅ Delivery | Delivery person statistics |
| 7 | GET | `/api/dashboard/admin/stats` | ✅ Admin | System-wide overview (25 users, 70 products, 15 services) |

### Step-by-Step Swagger Demo

1. **Login as Customer** → `POST /api/auth/login` with:
   ```json
   { "email": "ananya@example.com", "password": "Customer@123" }
   ```
2. Copy the `token` → Click **Authorize** → Paste token → Authorize
3. **Try** `GET /api/dashboard/customer/stats` → Execute → Show customer stats
4. **Login as Worker** → `POST /api/auth/login` with:
   ```json
   { "email": "rajesh@skilllink.com", "password": "Worker@123" }
   ```
5. Re-authorize with new token
6. **Try** `GET /api/dashboard/worker/stats` → Shows rating: 4.2, earnings, bookings
7. **Login as Seller** → `POST /api/auth/login` with:
   ```json
   { "email": "mahesh@skilllink.com", "password": "Seller@123" }
   ```
8. Re-authorize → **Try** `GET /api/dashboard/seller/stats` → Shows products, revenue
9. **Try** `GET /api/dashboard/seller/profile` → Shows business details
10. **Login as Admin** → `POST /api/auth/login` with:
    ```json
    { "email": "admin@skilllink.com", "password": "Admin@123" }
    ```
11. Re-authorize → **Try** `GET /api/dashboard/admin/stats` → Shows system-wide: 25 users, 70 products, 15 services

### What to Explain
- *"Each role has its own dashboard API that returns role-specific statistics"*
- *"The same JWT token determines what data is returned — role-based access control"*
- *"The dashboard APIs aggregate data from multiple collections (users, bookings, orders, products) for comprehensive stats"*

---

## 👤 Member 2: CHIDWIPAK KUPPANI — Products/Supplies APIs (Customer-Seller Pipeline)

### Your Contribution
Customer-Seller pipeline — Products/Supplies management.

### Files You Worked On
| File | Purpose |
|------|---------|
| `routes/supplies.js` | Product/supply route definitions |
| `controllers/productControllerAPI.js` | Product business logic (16KB) |

### Swagger UI Demo (Your Endpoints)

Open `http://localhost:5005/api-docs` → Expand **"Supplies (Products)"** tag

| # | Method | Endpoint | Auth | What to Show |
|---|--------|----------|------|-------------|
| 1 | GET | `/api/supplies` | ❌ | Browse all 70 products |
| 2 | GET | `/api/supplies?category=electrical` | ❌ | Filter by category |
| 3 | GET | `/api/supplies?search=LED` | ❌ | Search products |
| 4 | GET | `/api/supplies?minPrice=100&maxPrice=500` | ❌ | Price range filter |
| 5 | GET | `/api/supplies/unique` | ❌ | Unique products grouped by name |
| 6 | GET | `/api/supplies/{id}` | ❌ | Product details by ID |
| 7 | POST | `/api/supplies` | ✅ Seller | Create a new product (multipart form) |
| 8 | GET | `/api/supplies/my-products` | ✅ Seller | Seller's own products |
| 9 | PUT | `/api/supplies/{id}` | ✅ Seller | Update product |
| 10 | DELETE | `/api/supplies/{id}` | ✅ Seller | Delete product |
| 11 | PUT | `/api/supplies/{id}/price` | ✅ Seller | Update product price |
| 12 | PUT | `/api/supplies/{id}/stock` | ✅ Seller | Toggle stock status |

Also show **Reviews** for products/sellers:

| # | Method | Endpoint | Auth | What to Show |
|---|--------|----------|------|-------------|
| 13 | POST | `/api/reviews/product` | ✅ Customer | Add product review |
| 14 | GET | `/api/reviews/product/{productId}` | ❌ | Get product reviews |
| 15 | POST | `/api/reviews/seller` | ✅ Customer | Add seller review |
| 16 | GET | `/api/reviews/seller/{sellerId}` | ❌ | Get seller reviews |

### Step-by-Step Swagger Demo

1. **No Auth Needed First** — Test public endpoints:
   - **Try** `GET /api/supplies` → Shows all 70 products with pagination
   - **Try** `GET /api/supplies?category=electrical` → Shows electrical products only
   - **Try** `GET /api/supplies?search=LED` → Shows LED products
   - **Try** `GET /api/supplies?minPrice=100&maxPrice=500` → Price filtered
   - **Try** `GET /api/supplies/unique` → Unique products grouped by name
2. **Login as Seller**:
   ```json
   { "email": "mahesh@skilllink.com", "password": "Seller@123" }
   ```
3. Authorize with token → **Try** `GET /api/supplies/my-products` → Shows seller's products
4. Copy any product `_id` from the response
5. **Try** `PUT /api/supplies/{id}/price` with that ID and body: `{"price": 999}` → Price updated
6. **Try** `PUT /api/supplies/{id}/stock` with body: `{"inStock": false}` → Stock toggled

### What to Explain
- *"Products support CRUD operations — Create, Read, Update, Delete"*
- *"Public endpoints for browsing, protected endpoints for seller management"*
- *"Supports filtering by category, search, price range, and pagination"*
- *"Each seller has their own inventory — my-products shows only their products"*

---

## 👤 Member 3: KUNDA SRIMAN — Services & Bookings APIs (Customer-Worker Pipeline)

### Your Contribution
Customer-Worker pipeline — Services listing and Booking management.

### Files You Worked On
| File | Purpose |
|------|---------|
| `routes/services.js` | Service listing routes |
| `routes/bookings.js` | Booking management routes |
| `controllers/serviceControllerAPI.js` | Service logic |
| `controllers/bookingControllerAPI.js` | Booking logic (43KB — largest controller) |

### Swagger UI Demo (Your Endpoints)

Open `http://localhost:5005/api-docs` → Expand **"Services"** and **"Bookings"** tags

**Services (Public):**

| # | Method | Endpoint | Auth | What to Show |
|---|--------|----------|------|-------------|
| 1 | GET | `/api/services` | ❌ | All 15 services with pagination |
| 2 | GET | `/api/services?category=electrician` | ❌ | 5 electrician services |
| 3 | GET | `/api/services/categories` | ❌ | `["carpenter","electrician","plumber"]` |
| 4 | GET | `/api/services/{id}` | ❌ | Service details with available workers |
| 5 | GET | `/api/services/category/plumber/workers` | ❌ | 5 plumber workers with ratings |
| 6 | GET | `/api/services/workers/{id}` | ❌ | Specific worker details |

**Bookings (Protected):**

| # | Method | Endpoint | Auth | What to Show |
|---|--------|----------|------|-------------|
| 7 | POST | `/api/bookings` | ✅ Customer | Create a booking |
| 8 | GET | `/api/bookings` | ✅ Any | Get user's bookings |
| 9 | POST | `/api/bookings/broadcast` | ✅ Customer | Broadcast to multiple workers |
| 10 | GET | `/api/bookings/{id}` | ✅ Any | Booking details |
| 11 | PATCH | `/api/bookings/{id}/status` | ✅ Worker | Update booking status |
| 12 | PUT | `/api/bookings/{id}/accept` | ✅ Worker | Accept booking |
| 13 | PUT | `/api/bookings/{id}/reject` | ✅ Worker | Reject booking |
| 14 | PUT | `/api/bookings/{id}/start` | ✅ Worker | Start service |
| 15 | PUT | `/api/bookings/{id}/complete` | ✅ Worker | Complete service |
| 16 | PUT | `/api/bookings/{id}/cancel` | ✅ Customer | Cancel booking |
| 17 | GET | `/api/bookings/{id}/alternatives` | ✅ Customer | Alternative workers |
| 18 | POST | `/api/bookings/{id}/review` | ✅ Customer | Add review |

Also **Worker Reviews:**

| # | Method | Endpoint | Auth | What to Show |
|---|--------|----------|------|-------------|
| 19 | POST | `/api/reviews/worker` | ✅ Customer | Add worker review |
| 20 | GET | `/api/reviews/worker/{workerId}` | ❌ | Get worker reviews |

### Step-by-Step Swagger Demo

1. **Public Services** (no auth):
   - **Try** `GET /api/services` → 15 services returned
   - **Try** `GET /api/services/categories` → 3 categories
   - **Try** `GET /api/services/category/electrician/workers` → 5 electricians with skills, ratings
2. Copy a `worker _id` and `service _id` from responses
3. **Login as Customer**:
   ```json
   { "email": "ananya@example.com", "password": "Customer@123" }
   ```
4. Authorize → **Try** `GET /api/bookings` → Customer's bookings
5. **Try** `POST /api/bookings` with body using the IDs you copied:
   ```json
   {
     "service": "PASTE_SERVICE_ID",
     "worker": "PASTE_WORKER_ID",
     "date": "2026-04-15",
     "time": "10:00 AM",
     "address": { "street": "123 Main St", "city": "Mumbai", "state": "Maharashtra", "zipCode": "400001" }
   }
   ```

### What to Explain
- *"Services are public — any user can browse. Bookings require authentication."*
- *"The booking lifecycle: pending → accepted → in-progress → completed"*
- *"Workers can accept/reject bookings. If rejected, customers get alternative workers."*
- *"Bookings controller is the largest (43KB) — handles complex multi-step workflows"*

---

## 👤 Member 4: KAINURU BALAJI — Auth, Payments, Delivery Dashboard APIs

### Your Contribution
Login/Signup pages, Booking form pages, Delivery dashboard.

### Files You Worked On
| File | Purpose |
|------|---------|
| `routes/auth.js` | Authentication routes |
| `routes/payment.js` | Payment processing routes |
| `controllers/authControllerAPI.js` | Auth logic (22KB) |
| `controllers/paymentControllerAPI.js` | Payment logic (12KB) |

### Swagger UI Demo (Your Endpoints)

Open `http://localhost:5005/api-docs` → Expand **"Auth"** and **"Payments"** tags

**Authentication (10 endpoints):**

| # | Method | Endpoint | Auth | What to Show |
|---|--------|----------|------|-------------|
| 1 | POST | `/api/auth/register` | ❌ | Register new user (multipart — name, email, password, phone, role) |
| 2 | POST | `/api/auth/verify-email` | ❌ | Verify email with OTP |
| 3 | POST | `/api/auth/resend-otp` | ❌ | Resend OTP |
| 4 | POST | `/api/auth/login` | ❌ | Login → Returns JWT tokens |
| 5 | POST | `/api/auth/refresh-token` | ❌ | Refresh expired access token |
| 6 | POST | `/api/auth/forgot-password` | ❌ | Request password reset |
| 7 | POST | `/api/auth/reset-password` | ❌ | Reset with token |
| 8 | GET | `/api/auth/profile` | ✅ | Get current user profile |
| 9 | PUT | `/api/auth/profile` | ✅ | Update profile (with image upload) |
| 10 | POST | `/api/auth/logout` | ✅ | Logout user |

**Payments (7 endpoints):**

| # | Method | Endpoint | Auth | What to Show |
|---|--------|----------|------|-------------|
| 11 | POST | `/api/payment/webhook` | ❌ | Razorpay webhook handler |
| 12 | POST | `/api/payment/booking` | ✅ | Create booking payment |
| 13 | POST | `/api/payment/order` | ✅ | Create order payment |
| 14 | POST | `/api/payment/verify` | ✅ | Verify payment completion |
| 15 | GET | `/api/payment` | ✅ | Payment history (paginated) |
| 16 | GET | `/api/payment/{id}` | ✅ | Payment details |
| 17 | POST | `/api/payment/{paymentId}/refund` | ✅ | Refund payment |

**Notifications (6 endpoints):**

| # | Method | Endpoint | Auth | What to Show |
|---|--------|----------|------|-------------|
| 18 | GET | `/api/notifications` | ✅ | Get notifications (paginated) |
| 19 | GET | `/api/notifications/unread-count` | ✅ | Unread count |
| 20 | PATCH | `/api/notifications/mark-all-read` | ✅ | Mark all read |
| 21 | PATCH | `/api/notifications/{id}/read` | ✅ | Mark single read |
| 22 | DELETE | `/api/notifications/{id}` | ✅ | Delete notification |
| 23 | DELETE | `/api/notifications/cleanup/read` | ✅ | Delete all read notifications |

### Step-by-Step Swagger Demo

1. **Show Registration** — `POST /api/auth/register` → Try it Out:
   ```json
   {
     "name": "Demo User",
     "email": "demo@example.com",
     "password": "Demo@123",
     "phone": "8888888888",
     "role": "customer"
   }
   ```
2. **Show Login** — `POST /api/auth/login`:
   ```json
   { "email": "admin@skilllink.com", "password": "Admin@123" }
   ```
   → Show the JWT `token` and `refreshToken` in response
3. **Authorize** with the token → Click Authorize button → Paste token
4. **Show Get Profile** — `GET /api/auth/profile` → Returns user details
5. **Show Refresh Token** — `POST /api/auth/refresh-token` with the refresh token
6. **Show Notifications** — `GET /api/notifications` → User's notifications
7. **Show Unread Count** — `GET /api/notifications/unread-count`
8. **Show Payment History** — `GET /api/payment?page=1&limit=10`
9. **Show Logout** — `POST /api/auth/logout`

### What to Explain
- *"Authentication uses JWT with access and refresh tokens for security"*
- *"Registration supports multiple roles — customer, worker, seller, delivery"*
- *"Passwords are hashed with bcrypt before storage"*
- *"Protected endpoints require `Authorization: Bearer <token>` header"*
- *"Payments integrate with Razorpay — webhook for server-to-server callbacks"*
- *"Notifications support pagination, read/unread tracking, and cleanup"*

---

## 👤 Member 5: AJJAPAGU PRANEETH — Orders, Delivery & Admin APIs

### Your Contribution
Seller-Delivery pipeline, Admin dashboard, Order management.

### Files You Worked On
| File | Purpose |
|------|---------|
| `routes/orders.js` | Order management routes |
| `routes/delivery.js` | Delivery operations routes |
| `routes/admin.js` | Admin panel routes |
| `routes/verifier.js` | Verifier routes |
| `controllers/orderControllerAPI.js` | Order logic (16KB) |
| `controllers/deliveryControllerAPI.js` | Delivery logic (18KB) |
| `controllers/adminControllerAPI.js` | Admin logic (19KB) |
| `controllers/verifierControllerAPI.js` | Verifier logic |

### Swagger UI Demo (Your Endpoints)

Open `http://localhost:5005/api-docs` → Expand **"Orders"**, **"Delivery"**, **"Admin"**, **"Verifier"** tags

**Orders (8 endpoints):**

| # | Method | Endpoint | Auth | What to Show |
|---|--------|----------|------|-------------|
| 1 | POST | `/api/orders` | ✅ Customer | Create order with items & shipping address |
| 2 | GET | `/api/orders` | ✅ Customer | Customer's orders |
| 3 | GET | `/api/orders/seller` | ✅ Seller | Seller's received orders |
| 4 | GET | `/api/orders/{id}` | ✅ Any | Order details |
| 5 | PUT | `/api/orders/{id}/status` | ✅ Seller | Update order status |
| 6 | PUT | `/api/orders/{id}/cancel` | ✅ Customer | Cancel order |
| 7 | GET | `/api/orders/{id}/track` | ✅ Any | Track order |
| 8 | POST | `/api/orders/verify-pickup-otp` | ✅ Seller | Verify pickup OTP |

**Delivery (10 endpoints):**

| # | Method | Endpoint | Auth | What to Show |
|---|--------|----------|------|-------------|
| 9 | GET | `/api/delivery/stats` | ✅ Delivery | Dashboard statistics |
| 10 | GET | `/api/delivery/requests` | ✅ Delivery | Pending requests |
| 11 | GET | `/api/delivery/active` | ✅ Delivery | Active delivery |
| 12 | GET | `/api/delivery/history` | ✅ Delivery | Delivery history |
| 13 | PUT | `/api/delivery/availability` | ✅ Delivery | Toggle availability |
| 14 | PUT | `/api/delivery/accept/{orderId}` | ✅ Delivery | Accept request |
| 15 | PUT | `/api/delivery/deliver/{orderId}` | ✅ Delivery | Complete with OTP |
| 16 | PUT | `/api/delivery/assign/{orderId}` | ✅ Seller | Assign to delivery |
| 17 | PUT | `/api/delivery/handed/{orderId}` | ✅ Seller | Mark as handed |
| 18 | GET | `/api/delivery/info/{orderId}` | ✅ Customer | Get delivery person info |

**Admin (10 endpoints):**

| # | Method | Endpoint | Auth | What to Show |
|---|--------|----------|------|-------------|
| 19 | GET | `/api/admin/verifications/pending` | ✅ Admin | Pending verifications |
| 20 | PUT | `/api/admin/workers/{id}/verify` | ✅ Admin | Verify/reject worker |
| 21 | PUT | `/api/admin/sellers/{id}/verify` | ✅ Admin | Verify/reject seller |
| 22 | PUT | `/api/admin/delivery/{id}/verify` | ✅ Admin | Verify/reject delivery |
| 23 | GET | `/api/admin/users` | ✅ Admin | All users (25 users, paginated) |
| 24 | GET | `/api/admin/users?role=worker` | ✅ Admin | Filter by role |
| 25 | GET | `/api/admin/users/approved` | ✅ Admin | Approved users |
| 26 | GET | `/api/admin/users/rejected` | ✅ Admin | Rejected users |
| 27 | GET | `/api/admin/users/{userId}` | ✅ Admin | User details with stats |
| 28 | GET | `/api/admin/analytics` | ✅ Admin | System analytics |

**Verifier (5 endpoints):**

| # | Method | Endpoint | Auth | What to Show |
|---|--------|----------|------|-------------|
| 29 | GET | `/api/verifier/stats` | ✅ Verifier | Verifier dashboard stats |
| 30 | GET | `/api/verifier/pending` | ✅ Verifier | Pending users |
| 31 | GET | `/api/verifier/users/{userId}` | ✅ Verifier | User details for review |
| 32 | PUT | `/api/verifier/users/{userId}/approve` | ✅ Verifier | Approve user |
| 33 | PUT | `/api/verifier/users/{userId}/decline` | ✅ Verifier | Decline with feedback |

### Step-by-Step Swagger Demo

**Part A — Admin & Verifier:**
1. **Login as Admin**:
   ```json
   { "email": "admin@skilllink.com", "password": "Admin@123" }
   ```
2. Authorize → **Try** `GET /api/admin/users` → Shows all 25 users
3. **Try** `GET /api/admin/users?role=worker` → Shows only workers
4. **Try** `GET /api/admin/verifications/pending` → Pending verifications
5. **Try** `GET /api/admin/analytics` → System analytics
6. **Login as Verifier**:
   ```json
   { "email": "verifier@skilllink.com", "password": "Verifier@123" }
   ```
7. Authorize → **Try** `GET /api/verifier/stats` → Verifier dashboard
8. **Try** `GET /api/verifier/pending` → Pending users

**Part B — Orders:**
9. **Login as Customer** → **Try** `GET /api/orders` → Customer orders
10. **Login as Seller** → **Try** `GET /api/orders/seller` → Seller's orders

**Part C — Delivery:**
11. **Login as Delivery Person**:
    ```json
    { "email": "raju@skilllink.com", "password": "Delivery@123" }
    ```
12. Authorize → **Try** `GET /api/delivery/stats` → Delivery stats
13. **Try** `GET /api/delivery/requests` → Pending requests
14. **Try** `GET /api/delivery/history` → History
15. **Try** `PUT /api/delivery/availability` → Toggle availability

### What to Explain
- *"Orders follow a lifecycle: pending → confirmed → assigned_delivery → out_for_delivery → delivered"*
- *"Delivery uses OTP verification — delivery person must enter OTP to confirm delivery"*
- *"Admin has full system visibility — can view/manage all users and verify workers/sellers"*
- *"Verifier is a separate role specifically for reviewing and approving/declining new registrations"*
- *"Role-based access ensures only authorized users can access specific endpoints"*

---

## 📊 Summary — Endpoint Count Per Member

| Member | Endpoints | Categories |
|--------|-----------|------------|
| **Jeevan** | 7 endpoints | Dashboard |
| **Chidwipak** | 16 endpoints | Supplies, Product/Seller Reviews |
| **Sriman** | 20 endpoints | Services, Bookings, Worker Reviews |
| **Balaji** | 23 endpoints | Auth, Payments, Notifications |
| **Praneeth** | 33 endpoints | Orders, Delivery, Admin, Verifier |
| **All Members** | Swagger itself | `swagger.js`, `/api-docs`, `/api-docs.json` |

---

## 🔐 Credentials Quick Reference

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@skilllink.com` | `Admin@123` |
| Verifier | `verifier@skilllink.com` | `Verifier@123` |
| Worker (Electrician) | `rajesh@skilllink.com` | `Worker@123` |
| Worker (Plumber) | `mohan@skilllink.com` | `Worker@123` |
| Worker (Carpenter) | `dinesh@skilllink.com` | `Worker@123` |
| Seller | `mahesh@skilllink.com` | `Seller@123` |
| Customer | `ananya@example.com` | `Customer@123` |
| Delivery | `raju@skilllink.com` | `Delivery@123` |

---

## 🌐 Common Points ALL Members Should Mention

1. **RESTful Web Services** — Proper HTTP methods: GET (read), POST (create), PUT/PATCH (update), DELETE (remove)
2. **JWT Authentication** — Secure token-based auth with access + refresh tokens
3. **OpenAPI 3.0 Specification** — Machine-readable API docs at `/api-docs.json`
4. **Swagger UI** — Interactive API testing at `/api-docs` with "Try it Out" feature
5. **Role-Based Access** — Different roles see/access different endpoints
6. **Request/Response Format** — JSON throughout: `{ success: true/false, data/message }`
7. **Pagination** — Supported on list endpoints: `?page=1&limit=10` → `{ total, page, pages }`

---

*Generated on: March 29, 2026*
