# 👤 PRANEETH — Individual Web Services Demo Guide
## Admin Dashboard + Seller-Delivery Pipeline

---

## 🎯 Your Area of Responsibility

You own two major areas:
1. **Admin Dashboard** — User management, verification, analytics, platform oversight
2. **Seller-Delivery Pipeline** — How orders move from seller to delivery person to customer

---

## 📋 Your Complete API Endpoints

### 1. Admin — Verification Management

| # | Method | Endpoint | Auth? | Purpose |
|---|--------|----------|-------|---------|
| 1 | `GET` | `/api/admin/verifications/pending` | ✅ Admin | Get all pending verifications (workers, sellers, delivery) |
| 2 | `PUT` | `/api/admin/workers/:id/verify` | ✅ Admin | Approve or reject a worker |
| 3 | `PUT` | `/api/admin/sellers/:id/verify` | ✅ Admin | Approve or reject a seller |
| 4 | `PUT` | `/api/admin/delivery/:id/verify` | ✅ Admin | Approve or reject a delivery person |

### 2. Admin — User Management

| # | Method | Endpoint | Auth? | Purpose |
|---|--------|----------|-------|---------|
| 5 | `GET` | `/api/admin/users` | ✅ Admin | Get all users (filterable by role, status) |
| 6 | `GET` | `/api/admin/users/approved` | ✅ Admin | Get all approved users |
| 7 | `GET` | `/api/admin/users/rejected` | ✅ Admin | Get all rejected users |
| 8 | `GET` | `/api/admin/users/:userId` | ✅ Admin | Get detailed user information with role stats |
| 9 | `PUT` | `/api/admin/users/:userId/status` | ✅ Admin | Update user status (active/inactive) |
| 10 | `DELETE` | `/api/admin/users/:userId` | ✅ Admin | Delete a user from the system |

### 3. Admin — Analytics & Dashboard

| # | Method | Endpoint | Auth? | Purpose |
|---|--------|----------|-------|---------|
| 11 | `GET` | `/api/admin/analytics` | ✅ Admin | Get system-wide analytics |
| 12 | `GET` | `/api/dashboard/admin/stats` | ✅ Admin | Get admin dashboard stats |

### 4. Seller-Delivery Pipeline (Order Fulfillment)

| # | Method | Endpoint | Auth? | Purpose |
|---|--------|----------|-------|---------|
| 13 | `PUT` | `/api/orders/:id/status` | ✅ Seller | Update order status (confirmed, preparing) |
| 14 | `PUT` | `/api/delivery/assign/:orderId` | ✅ Seller | Assign order to delivery person |
| 15 | `PUT` | `/api/delivery/handed/:orderId` | ✅ Seller | Confirm handed to delivery person |
| 16 | `POST` | `/api/orders/verify-pickup-otp` | ✅ Seller | Verify pickup OTP |
| 17 | `GET` | `/api/orders/:orderId/pickup-otps` | ✅ Seller | Get pickup OTPs |

### 5. Delivery Person Operations

| # | Method | Endpoint | Auth? | Purpose |
|---|--------|----------|-------|---------|
| 18 | `GET` | `/api/delivery/requests` | ✅ Delivery | Get pending delivery requests |
| 19 | `PUT` | `/api/delivery/accept/:orderId` | ✅ Delivery | Accept a delivery request |
| 20 | `GET` | `/api/delivery/active` | ✅ Delivery | Get current active delivery |
| 21 | `PUT` | `/api/delivery/deliver/:orderId` | ✅ Delivery | Verify customer OTP & complete delivery |
| 22 | `GET` | `/api/delivery/info/:orderId` | ✅ Customer | Customer gets delivery person info |

### 6. Metrics & Performance

| # | Method | Endpoint | Auth? | Purpose |
|---|--------|----------|-------|---------|
| 23 | `GET` | `/api/metrics` | ❌ No | Get system performance metrics |

**Total: 23 endpoints** covering admin operations and the delivery pipeline!

---

## 🔄 Seller-Delivery Pipeline Flow (Step-by-Step)

```
STEP 1: Order is placed by customer (status: "pending")
    → Customer creates order via POST /api/orders

STEP 2: Seller confirms the order
    PUT /api/orders/:id/status
    Body: { status: "confirmed" }
    → Status: "pending" → "confirmed"
    → Customer notified: "Your order has been confirmed!"

STEP 3: Seller assigns delivery person
    PUT /api/delivery/assign/:orderId
    → System finds available delivery persons in the area
    → Creates a delivery request with pickup OTP
    → Status: "confirmed" → "assigned_delivery"
    → Delivery person notified: "New delivery request!"

STEP 4: Delivery person accepts the request
    PUT /api/delivery/accept/:orderId
    → Delivery person receives pickup address and OTP instructions
    → DeliveryPerson.activeDelivery = orderId

STEP 5: Delivery person arrives at seller's shop
    → Delivery person shows pickup OTP to seller
    POST /api/orders/verify-pickup-otp
    Body: { orderId: "...", otp: "1234" }
    → Item marked as handedToDelivery = true

STEP 6: Seller confirms handover
    PUT /api/delivery/handed/:orderId
    → All items for this seller confirmed as handed
    → Status: "assigned_delivery" → "out_for_delivery"
    → Customer notified: "Your order is on the way!"

STEP 7: Delivery person delivers to customer
    PUT /api/delivery/deliver/:orderId
    Body: { otp: "5678" }   ← Customer's delivery OTP
    → Verifies OTP against order.deliveryOTP
    → Status: "out_for_delivery" → "delivered"
    → Customer notified: "Your order has been delivered!"
    → Delivery person earnings updated
```

### Order Status Flow
```
pending → confirmed → assigned_delivery → out_for_delivery → delivered
   ↓                                                           
cancelled (customer can cancel before confirmed)
```

---

## 🔄 Admin Verification Flow

```
STEP 1: New worker/seller/delivery person registers
    POST /api/auth/register
    → Account created with verification_status: "Pending"
    → Admin notified: "New verification request!"

STEP 2: Admin views pending verifications
    GET /api/admin/verifications/pending
    → Returns all pending workers, sellers, delivery persons
    → Shows their submitted documents (Aadhar, PAN, etc.)

STEP 3: Admin approves or rejects
    PUT /api/admin/workers/:id/verify
    Body: { approved: true }
    → verification_status: "Pending" → "Approved"
    → isVerified: true
    → User notified: "Your account has been verified!"

    OR

    Body: { approved: false, rejectionReason: "Invalid documents" }
    → verification_status: "Pending" → "Rejected"
    → User notified with rejection reason
```

---

## 🎤 Demo Script (What to Show the Professor)

### Demo 1: Admin Dashboard (3 min)
1. Open Swagger UI → `http://localhost:5005/api-docs`
2. **Login as admin**: `POST /api/auth/login` → `admin@skilllink.com` / `Admin@123`
3. Copy token → Click 🔒 **Authorize** → Paste
4. Execute `GET /api/dashboard/admin/stats`
5. **Show**: Total users, bookings, orders, revenue, user breakdown by role
6. Execute `GET /api/admin/analytics`
7. **Show**: System-wide analytics

### Demo 2: User Verification (3 min)
1. As admin, execute `GET /api/admin/verifications/pending`
2. **Show**: List of pending workers, sellers, delivery persons with documents
3. Execute `PUT /api/admin/workers/:id/verify` with `{ "approved": true }`
4. **Show**: Worker verified successfully
5. Execute `GET /api/admin/users?role=worker` → Show worker now approved

### Demo 3: User Management (2 min)
1. Execute `GET /api/admin/users` → Show all users with pagination
2. Execute `GET /api/admin/users/:userId` → Show detailed user with role-specific stats
3. Execute `GET /api/admin/users/approved` → Show approved users
4. Execute `GET /api/admin/users/rejected` → Show rejected users

### Demo 4: Seller-Delivery Pipeline (4 min)
1. **Login as seller**: `mahesh.seller@example.com` / `password123` → Re-authorize
2. Execute `GET /api/orders/seller` → Show seller's pending orders
3. Execute `PUT /api/orders/:id/status` with `{ "status": "confirmed" }` → Confirm order
4. Execute `PUT /api/delivery/assign/:orderId` → Assign to delivery
5. **Login as delivery**: `raju.delivery@example.com` / `password123` → Re-authorize
6. Execute `GET /api/delivery/requests` → Show the delivery request
7. Execute `PUT /api/delivery/accept/:orderId` → Accept delivery
8. Execute `GET /api/delivery/active` → Show active delivery details

### Demo 5: Delivery Completion (2 min)
1. As delivery person, execute `PUT /api/delivery/deliver/:orderId` with OTP
2. Show order status changed to "delivered"
3. Execute `GET /api/metrics` → Show system performance metrics

---

## 🧠 Questions You Should Be Ready to Answer

### Q: "How does the admin verification system work?"
> "When workers, sellers, or delivery persons register, they submit their documents (Aadhar, PAN, business license). Their `verification_status` is set to 'Pending'. Admins call `GET /api/admin/verifications/pending` to see all pending users. They review the documents and call `PUT /api/admin/workers/:id/verify` with `approved: true/false`. If approved, `isVerified` is set to true and the user can start operating. If rejected, a reason is provided and the user is notified."

### Q: "Explain the seller-delivery pipeline."
> "After a customer places an order:
> 1. Seller confirms the order (`PUT /api/orders/:id/status`)
> 2. Seller assigns a delivery person (`PUT /api/delivery/assign/:orderId`) — system finds available delivery persons
> 3. Delivery person accepts (`PUT /api/delivery/accept/:orderId`)
> 4. Delivery person goes to seller, seller verifies pickup OTP (`POST /api/orders/verify-pickup-otp`)
> 5. Seller confirms handover (`PUT /api/delivery/handed/:orderId`)
> 6. Delivery person delivers to customer, verifies customer's delivery OTP (`PUT /api/delivery/deliver/:orderId`)
> This ensures secure handoff at every step with OTP verification."

### Q: "What is the OTP verification system?"
> "We have **two-level OTP verification**:
> 1. **Pickup OTP**: Generated per seller per order when delivery is assigned. The delivery person shows this OTP to the seller to prove they're authorized to pick up the order.
> 2. **Delivery OTP**: Generated when the order is created. The customer tells this OTP to the delivery person to confirm delivery.
> This prevents unauthorized pickups and wrong deliveries."

### Q: "How does the admin user management work?"
> "Admins can view all users with filtering by role and verification status (`GET /api/admin/users`). They can view detailed user profiles including role-specific stats like a worker's completed jobs and earnings (`GET /api/admin/users/:userId`). They can update user status (activate/deactivate) and delete users from the platform. We implement soft-delete where possible to maintain data integrity."

### Q: "What are system metrics?"
> "The `GET /api/metrics` endpoint returns real-time performance data including:
> - Average response time across all endpoints
> - Request count per endpoint
> - Slow request detection (requests taking > 1 second)
> - Cache hit/miss ratio
> - Memory and CPU usage
> This helps monitor the API's health and identify bottlenecks."

---

## 📁 Your Files in the Codebase

| Layer | File | What You Built |
|-------|------|---------------|
| **Route** | `routes/admin.js` | Admin routes with admin-only authorization |
| **Route** | `routes/admin-api.js` | Alternative admin API routes |
| **Route** | `routes/delivery.js` | Delivery person routes |
| **Controller** | `controllers/adminControllerAPI.js` | Verification, user management, analytics |
| **Controller** | `controllers/deliveryControllerAPI.js` | Delivery assignment, OTP, tracking (seller parts) |
| **Model** | `models/DeliveryPerson.js` | Delivery person schema (vehicle, documents, availability) |
| **Model** | `models/DeliveryAssignment.js` | Delivery tracking (OTP, location, status) |
| **Middleware** | `middleware/requestTimer.js` | Performance tracking |
| **Middleware** | `middleware/logger.js` | Request logging |
| **Swagger** | `swagger.js` | Documentation for Admin, Delivery, Metrics sections |

---

## ⚡ Quick Reference Card

```
YOUR LOGINS (for demo):
  Admin:    admin@skilllink.com / Admin@123
  Seller:   mahesh.seller@example.com / password123
  Delivery: raju.delivery@example.com / password123

YOUR SWAGGER SECTIONS:
  → Admin     [10 endpoints]
  → Delivery  [9 endpoints - assign/handed/info parts]
  → Dashboard [1 endpoint - admin stats]
  → Metrics   [1 endpoint]

KEY FLOWS:
  Verification: Pending → Approved/Rejected
  Order Delivery: confirmed → assigned_delivery → out_for_delivery → delivered

OTP SYSTEM:
  Pickup OTP:   Seller verifies delivery person at shop
  Delivery OTP: Customer verifies delivery person at doorstep

ADMIN CAPABILITIES:
  → View/approve/reject pending verifications
  → View all users with filters
  → Get detailed user profiles
  → Update user status
  → Delete users
  → View system analytics
```

---

*You own 23 endpoints covering the admin panel and the complete seller-to-delivery pipeline. The OTP verification system is your standout feature!*
