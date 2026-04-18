# 👤 JEEVAN — Individual Web Services Demo Guide
## Customer, Worker & Seller Dashboards

---

## 🎯 Your Area of Responsibility

You own the **dashboard systems** for three user roles:
- **Customer Dashboard** — Stats, bookings overview, orders overview
- **Worker Dashboard** — Stats, earnings, bookings, availability
- **Seller Dashboard** — Stats, products overview, orders, revenue, shop settings

---

## 📋 Your Complete API Endpoints

### 1. Customer Dashboard

| # | Method | Endpoint | Auth? | Purpose |
|---|--------|----------|-------|---------|
| 1 | `GET` | `/api/dashboard/customer/stats` | ✅ Customer | Get customer dashboard statistics |

**What this returns:**
- Total bookings count (pending, active, completed)
- Total orders count (pending, delivered, cancelled)
- Total spent amount
- Recent bookings list
- Recent orders list
- Favourite services/workers

### 2. Worker Dashboard

| # | Method | Endpoint | Auth? | Purpose |
|---|--------|----------|-------|---------|
| 2 | `GET` | `/api/dashboard/worker/stats` | ✅ Worker | Get worker dashboard statistics |
| 3 | `PUT` | `/api/workers/availability` | ✅ Worker | Toggle worker availability (online/offline) |

**What worker stats returns:**
- Total bookings (accepted, completed, rejected)
- Earnings (today, this week, this month, total)
- Average rating and total reviews
- Upcoming bookings list
- Recent booking history
- Jobs completed count

### 3. Seller Dashboard

| # | Method | Endpoint | Auth? | Purpose |
|---|--------|----------|-------|---------|
| 4 | `GET` | `/api/dashboard/seller/stats` | ✅ Seller | Get seller dashboard statistics |
| 5 | `GET` | `/api/dashboard/seller/profile` | ✅ Seller | Get seller profile with shop details |
| 6 | `PUT` | `/api/dashboard/seller/shop-settings` | ✅ Seller | Update shop name, description, images |

**What seller stats returns:**
- Total products count (in-stock, out-of-stock)
- Total orders count (pending, confirmed, delivered)
- Revenue (today, this week, this month, total)
- Average rating and total reviews
- Recent orders list
- Top-selling products

### 4. General Dashboard

| # | Method | Endpoint | Auth? | Purpose |
|---|--------|----------|-------|---------|
| 7 | `GET` | `/api/dashboard/stats` | ✅ Any logged-in | Get generic dashboard stats based on role |

### 5. Notifications (Cross-Dashboard)

| # | Method | Endpoint | Auth? | Purpose |
|---|--------|----------|-------|---------|
| 8 | `GET` | `/api/notifications` | ✅ Any | Get user's notifications (paginated) |
| 9 | `GET` | `/api/notifications/unread-count` | ✅ Any | Get unread notification count |
| 10 | `PATCH` | `/api/notifications/mark-all-read` | ✅ Any | Mark all notifications as read |
| 11 | `PATCH` | `/api/notifications/:id/read` | ✅ Any | Mark one notification as read |
| 12 | `DELETE` | `/api/notifications/:id` | ✅ Any | Delete a notification |
| 13 | `DELETE` | `/api/notifications/cleanup/read` | ✅ Any | Delete all read notifications |

**Total: 13 endpoints** covering all three dashboards + notifications!

---

## 🔄 Dashboard Data Flows

### Customer Dashboard Flow
```
Customer logs in
    ↓
GET /api/dashboard/customer/stats
    ↓
Controller: getCustomerStats()
    ↓
Queries:
    → Booking.countDocuments({ customer: userId })  [total bookings]
    → Order.countDocuments({ customer: userId })     [total orders]
    → Booking.find({ customer: userId, status: "completed" })  [completed]
    → Payment.aggregate({ user: userId })            [total spent]
    → Booking.find().sort({ createdAt: -1 }).limit(5) [recent bookings]
    → Order.find().sort({ createdAt: -1 }).limit(5)    [recent orders]
    ↓
Returns: { totalBookings, activeBookings, completedBookings,
           totalOrders, pendingOrders, deliveredOrders,
           totalSpent, recentBookings, recentOrders }
```

### Worker Dashboard Flow
```
Worker logs in
    ↓
GET /api/dashboard/worker/stats
    ↓
Controller: getWorkerStats()
    ↓
Queries:
    → Worker.findOne({ user: userId })              [worker profile]
    → Booking.countDocuments({ worker: workerId })    [booking counts by status]
    → Booking.aggregate({ completionTime >= today })  [today's earnings]
    → Booking.aggregate({ completionTime >= weekStart })[weekly earnings]
    → Booking.find().sort({ date: 1 }).limit(5)       [upcoming bookings]
    ↓
Returns: { totalBookings, completedJobs, pendingBookings,
           rating, totalReviews, earnings: { today, week, month, total },
           upcomingBookings, recentHistory }
```

### Seller Dashboard Flow
```
Seller logs in
    ↓
GET /api/dashboard/seller/stats
    ↓
Controller: getSellerStats()
    ↓
Queries:
    → Seller.findOne({ user: userId })               [seller profile]
    → Product.countDocuments({ seller: sellerId })     [product counts]
    → Order.find({ "items.seller": sellerId })         [order counts by status]
    → Order.aggregate({ match: delivered, group: totalRevenue }) [revenue]
    ↓
Returns: { totalProducts, inStockProducts, outOfStockProducts,
           totalOrders, pendingOrders, deliveredOrders,
           revenue: { today, week, month, total },
           rating, totalReviews, recentOrders, topProducts }
```

---

## 🎤 Demo Script (What to Show the Professor)

### Demo 1: Customer Dashboard (3 min)
1. Open Swagger UI → `http://localhost:5005/api-docs`
2. **Login as customer**: `POST /api/auth/login` → `ananya@example.com` / `password123`
3. Copy token → Click 🔒 **Authorize** → Paste
4. Go to **Dashboard** section
5. Execute `GET /api/dashboard/customer/stats`
6. **Explain**: "This returns all the data needed for the customer dashboard — booking counts, order counts, amounts spent, and recent activity."

### Demo 2: Worker Dashboard (3 min)
1. **Login as worker**: `POST /api/auth/login` → `rajesh.electrician@example.com` / `password123`
2. Re-authorize with new token
3. Execute `GET /api/dashboard/worker/stats`
4. **Explain**: "This shows the worker their earnings, job completion stats, ratings, and upcoming bookings."
5. Execute `PUT /api/workers/availability` with `{ "isAvailable": false }`
6. **Show** availability toggled — "Workers can go online/offline"

### Demo 3: Seller Dashboard (3 min)
1. **Login as seller**: `POST /api/auth/login` → `mahesh.seller@example.com` / `password123`
2. Re-authorize with new token
3. Execute `GET /api/dashboard/seller/stats`
4. **Show**: Total products, orders, revenue breakdown
5. Execute `GET /api/dashboard/seller/profile`
6. **Show**: Shop name, business details, images
7. Execute `PUT /api/dashboard/seller/shop-settings` with new shop description

### Demo 4: Notifications (2 min)
1. As any user, execute `GET /api/notifications`
2. Show the notification list with types (booking, order, payment)
3. Execute `GET /api/notifications/unread-count`
4. Execute `PATCH /api/notifications/mark-all-read`
5. Execute `GET /api/notifications/unread-count` again → Show count is now 0

---

## 🧠 Questions You Should Be Ready to Answer

### Q: "How do dashboards differ by role?"
> "Each role has a dedicated dashboard endpoint that returns role-specific data. The customer dashboard shows booking/order counts and spending. The worker dashboard shows earnings, job stats, and upcoming bookings. The seller dashboard shows product inventory, order counts, and revenue analytics. Each endpoint is protected by JWT authentication and role-based authorization — a customer cannot access the seller dashboard because the `authorize('seller')` middleware blocks it."

### Q: "How do you calculate earnings/revenue?"
> "We use MongoDB's **aggregation pipeline**. For worker earnings, we aggregate completed bookings where `completionTime` falls within the desired period (today/week/month) and `$sum` the `finalPrice` field. For seller revenue, we aggregate delivered orders where `items.seller` matches the seller ID and sum the item prices. This gives us real-time calculated stats, not pre-cached values."

### Q: "What is the difference between the general `/dashboard/stats` and role-specific stats?"
> "The general `GET /api/dashboard/stats` detects the user's role from the JWT token and calls the appropriate role-specific function internally. It's a convenience endpoint. The role-specific endpoints (`/dashboard/customer/stats`, `/dashboard/worker/stats`, `/dashboard/seller/stats`) have explicit role authorization middleware for stricter access control."

### Q: "How do notifications work?"
> "Notifications are created in the backend whenever a significant event occurs — like a new booking, order status change, or payment confirmation. They're stored in the Notification model with fields: user (who receives it), title, message, type, isRead, and link (where to navigate). The frontend polls `GET /api/notifications/unread-count` in the header, and the full list is loaded on the notifications page. We also push real-time notifications via Socket.IO."

### Q: "How does the shop-settings upload work?"
> "The `PUT /api/dashboard/seller/shop-settings` endpoint accepts `multipart/form-data` using **Multer** middleware. Sellers can upload a profile picture, shop exterior image, and shop interior image. Multer stores files in `public/uploads/` directories with unique filenames (timestamp + random suffix). The file paths are saved in the Seller model."

---

## 📁 Your Files in the Codebase

| Layer | File | What You Built |
|-------|------|---------------|
| **Route** | `routes/dashboard-new.js` | Dashboard API routes with multer for shop images |
| **Route** | `routes/notifications.js` | Notification CRUD routes |
| **Route** | `routes/workers.js` | Worker availability route |
| **Controller** | `controllers/dashboardControllerAPI.js` | All dashboard stats logic (customer/worker/seller/delivery/admin) |
| **Controller** | `controllers/notificationControllerAPI.js` | Notification CRUD logic |
| **Model** | `models/Notification.js` | Notification schema (user, title, message, type, isRead) |
| **Swagger** | `swagger.js` | Documentation for Dashboard, Notifications, Workers sections |
| **Frontend** | `client/src/pages/dashboard/` | Customer, Worker, Seller dashboard pages |

---

## ⚡ Quick Reference Card

```
YOUR LOGINS (for demo):
  Customer: ananya@example.com / password123
  Worker:   rajesh.electrician@example.com / password123
  Seller:   mahesh.seller@example.com / password123

YOUR SWAGGER SECTIONS:
  → Dashboard     [7 endpoints]
  → Notifications [6 endpoints]

KEY CONCEPTS:
  → Role-based dashboard data (different stats per role)
  → MongoDB aggregation for earnings/revenue calculations
  → Multer file upload for shop images
  → Real-time notifications via Socket.IO
  → Pagination for notification lists

NOTIFICATION TYPES:
  info, success, warning, error, booking, order, payment, delivery
```

---

*You own 13 endpoints across three dashboards and the notification system. Practice switching between roles during the demo!*
