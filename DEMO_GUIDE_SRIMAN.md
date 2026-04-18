# 👤 SRIMAN — Individual Web Services Demo Guide
## Customer-Worker Pipeline (Booking Services)

---

## 🎯 Your Area of Responsibility

You own the **complete Customer-Worker pipeline**:
- Customer browsing services
- Viewing available workers for a service
- Booking a specific worker
- Broadcasting a booking to multiple workers
- Worker accepting/rejecting/starting/completing bookings
- Alternative workers when a booking is rejected
- Rebooking with a different worker
- Live location sharing during a booking
- Worker reviews

---

## 📋 Your Complete API Endpoints

### 1. Service Browsing (Customer Discovers Services)

| # | Method | Endpoint | Auth? | Purpose |
|---|--------|----------|-------|---------|
| 1 | `GET` | `/api/services` | ❌ No | Browse all services (search, filter by category) |
| 2 | `GET` | `/api/services/categories` | ❌ No | Get unique service categories |
| 3 | `GET` | `/api/services/:id` | ❌ No | Get service details with available workers |
| 4 | `GET` | `/api/services/category/:category/workers` | ❌ No | Get all workers in a category |
| 5 | `GET` | `/api/services/workers/:id` | ❌ No | Get specific worker details |

### 2. Booking Creation (Customer Books a Worker)

| # | Method | Endpoint | Auth? | Purpose |
|---|--------|----------|-------|---------|
| 6 | `POST` | `/api/bookings` | ✅ Customer | Create a booking with a specific worker |
| 7 | `POST` | `/api/bookings/broadcast` | ✅ Customer | Broadcast booking to multiple workers |
| 8 | `GET` | `/api/bookings` | ✅ Any | Get my bookings (filtered by status) |
| 9 | `GET` | `/api/bookings/:id` | ✅ Any | Get specific booking details |

### 3. Worker Actions (Worker Manages Bookings)

| # | Method | Endpoint | Auth? | Purpose |
|---|--------|----------|-------|---------|
| 10 | `PUT` | `/api/bookings/:id/accept` | ✅ Worker | Accept a booking |
| 11 | `PUT` | `/api/bookings/:id/reject` | ✅ Worker | Reject a booking (with reason) |
| 12 | `PUT` | `/api/bookings/:id/start` | ✅ Worker | Start the service |
| 13 | `PUT` | `/api/bookings/:id/complete` | ✅ Worker | Complete the service |
| 14 | `PATCH` | `/api/bookings/:id/status` | ✅ Worker/Admin | Update booking status |

### 4. Customer Actions

| # | Method | Endpoint | Auth? | Purpose |
|---|--------|----------|-------|---------|
| 15 | `PUT` | `/api/bookings/:id/cancel` | ✅ Customer | Cancel a booking |
| 16 | `GET` | `/api/bookings/:id/alternatives` | ✅ Customer | Get alternative workers (after rejection) |
| 17 | `POST` | `/api/bookings/:id/rebook` | ✅ Customer | Rebook with an alternative worker |
| 18 | `POST` | `/api/bookings/:id/broadcast-rebook` | ✅ Customer | Broadcast rejected booking to all workers |

### 5. Live Location & Payment

| # | Method | Endpoint | Auth? | Purpose |
|---|--------|----------|-------|---------|
| 19 | `POST` | `/api/bookings/:id/share-location` | ✅ Customer | Share live location for booking |
| 20 | `POST` | `/api/bookings/:id/stop-location` | ✅ Customer | Stop sharing location |
| 21 | `POST` | `/api/payment/booking` | ✅ Customer | Create payment for a booking |

### 6. Worker Reviews

| # | Method | Endpoint | Auth? | Purpose |
|---|--------|----------|-------|---------|
| 22 | `POST` | `/api/bookings/:id/review` | ✅ Customer | Add review through booking |
| 23 | `POST` | `/api/reviews/worker` | ✅ Customer | Add worker review |
| 24 | `GET` | `/api/reviews/worker/:workerId` | ❌ No | Get worker reviews |

### 7. Search

| # | Method | Endpoint | Auth? | Purpose |
|---|--------|----------|-------|---------|
| 25 | `GET` | `/api/search?query=electrician` | ❌ No | Global search for services/workers |

**Total: 25 endpoints** — This is your complete pipeline!

---

## 🔄 Complete Customer-Worker Flow (Step-by-Step)

### Flow A: Direct Booking (Customer picks a specific worker)
```
STEP 1: Customer browses services
    GET /api/services?category=electrician
    → Returns: Fan Installation, Wiring Repair, MCB Replacement, etc.

STEP 2: Customer views a service with available workers
    GET /api/services/:serviceId
    → Returns: Service details + list of available workers with ratings/pricing

STEP 3: Customer books a specific worker
    POST /api/bookings
    Body: { service: "serviceId", worker: "workerId", date: "2026-04-01",
            time: "10:00 AM", address: { street, city, pincode } }
    → Creates booking with status "pending"
    → Sends notification to worker via Socket.IO

STEP 4: Worker receives notification and accepts
    PUT /api/bookings/:id/accept
    → Status changes: "pending" → "accepted"
    → Customer gets notification: "Your booking was accepted!"

STEP 5: Worker arrives and starts service
    PUT /api/bookings/:id/start
    → Status changes: "accepted" → "in-progress"
    → Customer gets notification with start time

STEP 6: Worker completes the service
    PUT /api/bookings/:id/complete
    Body: { finalPrice: 600 }
    → Status changes: "in-progress" → "completed"
    → Worker earnings updated, jobsCompleted incremented

STEP 7: Customer pays for the booking
    POST /api/payment/booking
    Body: { bookingId: "..." }
    → Creates Razorpay payment

STEP 8: Customer leaves a review
    POST /api/bookings/:id/review
    Body: { rating: 5, review: "Excellent work!" }
    → Worker's average rating recalculated
```

### Flow B: Broadcast Booking (Customer sends to all workers)
```
STEP 1: Customer creates broadcast booking
    POST /api/bookings/broadcast
    Body: { service: "serviceId", workers: ["worker1", "worker2", "worker3"],
            date: "2026-04-01", time: "10:00 AM", address: {...} }
    → Creates separate booking for each worker with isBroadcast=true
    → All workers receive notifications simultaneously

STEP 2: First worker to accept wins
    PUT /api/bookings/:id/accept
    → This booking: status → "accepted"
    → All other broadcast bookings: status → "auto-rejected"
    → Customer notified: "Worker X accepted your booking"

STEP 3: (Same as Flow A from Step 5 onwards)
```

### Flow C: Rejection → Alternative Workers
```
STEP 1: Worker rejects the booking
    PUT /api/bookings/:id/reject
    Body: { reason: "Not available on that date" }
    → Status: "pending" → "rejected"
    → Customer notified with rejection reason

STEP 2: Customer gets alternative workers
    GET /api/bookings/:id/alternatives
    → Returns other available workers for the same service/category

STEP 3: Customer rebooks with alternative
    POST /api/bookings/:id/rebook
    Body: { workerId: "newWorkerId" }
    → Creates new booking with the alternative worker
```

---

## 🎤 Demo Script (What to Show the Professor)

### Demo 1: Service Browsing (2 min)
1. Open Swagger UI → `http://localhost:5005/api-docs`
2. **Services** section → Execute `GET /api/services`
3. Show: All 15 services across 3 categories
4. Execute `GET /api/services/categories` → Show categories
5. Execute `GET /api/services/:id` → Show service with available workers

### Demo 2: Create Booking (3 min)
1. **Login as customer**: `ananya@example.com` / `password123` → Authorize
2. Execute `POST /api/bookings`:
```json
{
  "service": "<service_id>",
  "worker": "<worker_id>",
  "date": "2026-04-05",
  "time": "10:00 AM",
  "address": {
    "street": "123 Main Street",
    "city": "Hyderabad",
    "state": "Telangana",
    "pincode": "500072"
  },
  "notes": "Please bring your own tools"
}
```
3. Show booking created with status "pending"

### Demo 3: Worker Accepts Booking (2 min)
1. **Login as worker**: `rajesh.electrician@example.com` / `password123` → Re-authorize
2. Execute `GET /api/bookings` → Show the pending booking
3. Execute `PUT /api/bookings/:id/accept` → Show status changed to "accepted"

### Demo 4: Start & Complete (2 min)
1. As worker, execute `PUT /api/bookings/:id/start` → Status: "in-progress"
2. Execute `PUT /api/bookings/:id/complete` with `{ "finalPrice": 650 }` → Status: "completed"

### Demo 5: Broadcast Booking (2 min)
1. Login as customer again
2. Execute `POST /api/bookings/broadcast` with multiple worker IDs
3. Show multiple bookings created with `isBroadcast: true`
4. Login as one worker → Accept → Show others auto-rejected

### Demo 6: Worker Review (1 min)
1. Login as customer → Execute `POST /api/reviews/worker`
2. Execute `GET /api/reviews/worker/:workerId` → Show review

---

## 🧠 Questions You Should Be Ready to Answer

### Q: "Explain the booking creation process."
> "When `POST /api/bookings` is called, the controller:
> 1. Validates required fields (service, worker, date, time, address)
> 2. Checks if the worker exists and is available
> 3. Checks if the service exists and gets the price
> 4. Creates a Booking document with status 'pending'
> 5. Sends a real-time notification to the worker via Socket.IO
> 6. Returns the booking with populated service and worker details."

### Q: "What is broadcast booking and how does it work?"
> "Broadcast booking allows a customer to send a booking request to **multiple workers simultaneously**. The controller creates separate Booking documents for each worker, all linked by a `broadcastGroup` ID and marked with `isBroadcast: true`. When the first worker accepts, we find all other bookings in the same broadcast group and set them to 'auto-rejected'. This ensures only one worker gets the job."

### Q: "How does the rejection → rebooking flow work?"
> "When a worker rejects a booking, the customer is notified with the rejection reason. The customer can then call `GET /api/bookings/:id/alternatives` which finds other available workers in the same service category. The customer can choose one and call `POST /api/bookings/:id/rebook` with the new worker's ID, which creates a fresh booking. Alternatively, `POST /api/bookings/:id/broadcast-rebook` sends the booking to all remaining available workers."

### Q: "How does live location sharing work?"
> "The `POST /api/bookings/:id/share-location` endpoint saves the customer's GPS coordinates to the LocationTracking model, which has a 24-hour TTL (auto-delete). We also emit the location via Socket.IO so the worker can see it in real-time on a map. `POST /api/bookings/:id/stop-location` marks the tracking as inactive and removes the socket room. This uses both REST API (for persistence) and WebSocket (for real-time updates)."

### Q: "What HTTP status codes do you use?"
> "201 for booking creation (new resource created), 200 for successful reads and updates, 400 for validation errors (missing fields, invalid dates), 401 for unauthorized (no token), 403 for forbidden (wrong role — a seller can't accept a booking), 404 for booking/worker not found, and 500 for server errors."

---

## 📁 Your Files in the Codebase

| Layer | File | What You Built |
|-------|------|---------------|
| **Route** | `routes/bookings.js` | Booking CRUD routes with validation & rate limiting |
| **Route** | `routes/services.js` | Service browsing routes |
| **Route** | `routes/search.js` | Global search route |
| **Controller** | `controllers/bookingControllerAPI.js` | All booking logic (create, broadcast, accept, reject, start, complete, review, location) |
| **Controller** | `controllers/serviceControllerAPI.js` | Service browsing, worker listing, category filtering |
| **Controller** | `controllers/searchControllerAPI.js` | Global search across services/workers/products |
| **Model** | `models/Booking.js` | Booking schema (customer, worker, service, status, broadcast) |
| **Model** | `models/Service.js` | Service schema (name, category, price, duration) |
| **Model** | `models/LocationTracking.js` | Location tracking with 24-hour TTL |
| **Swagger** | `swagger.js` | Documentation for Services, Bookings, Search sections |
| **Frontend** | `client/src/pages/Services.jsx` | Service browsing page |
| **Frontend** | `client/src/pages/ServiceDetails.jsx` | Service detail with worker list |

---

## ⚡ Quick Reference Card

```
YOUR LOGINS (for demo):
  Customer: ananya@example.com / password123
  Worker:   rajesh.electrician@example.com / password123
  Worker:   suresh.plumber@example.com / password123

YOUR SWAGGER SECTIONS:
  → Services  [5 endpoints]
  → Bookings  [16 endpoints]
  → Reviews   [2 endpoints - worker parts]
  → Search    [1 endpoint]
  → Payments  [1 endpoint - booking payment]

KEY BOOKING STATUSES:
  pending → accepted → in-progress → completed
  pending → rejected → (alternatives) → rebook
  pending(broadcast) → accepted(one) → auto-rejected(others)

BOOKING STATUS FLOW:
  ┌─ Customer creates ──→ pending
  │                          ↓
  │  Worker accepts ──→ accepted
  │  Worker rejects ──→ rejected → alternatives → rebook
  │                          ↓
  │  Worker starts  ──→ in-progress
  │                          ↓
  │  Worker completes ─→ completed → review
  │
  └─ Customer cancels ──→ cancelled
```

---

*You own 25 endpoints covering the complete customer-worker service booking pipeline. The broadcast booking and rejection fallback flows are your standout features!*
