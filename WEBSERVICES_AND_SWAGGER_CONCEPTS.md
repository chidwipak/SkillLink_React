# 🌐 Web Services & Swagger — Complete Concepts Guide for SkillLink Team

> **For**: All 5 Team Members | **Project**: SkillLink — Home Services & Supplies Platform  
> **Purpose**: Understand every concept needed to confidently demo your Web Services evaluation

---

## 📖 Table of Contents

1. [What is a Web Service?](#1-what-is-a-web-service)
2. [What is a RESTful API?](#2-what-is-a-restful-api)
3. [HTTP Methods Explained](#3-http-methods-explained)
4. [HTTP Status Codes](#4-http-status-codes)
5. [Request & Response Structure](#5-request--response-structure)
6. [Authentication in APIs (JWT)](#6-authentication-in-apis-jwt)
7. [Middleware — The Request Pipeline](#7-middleware--the-request-pipeline)
8. [What is Swagger / OpenAPI?](#8-what-is-swagger--openapi)
9. [How Swagger Works in SkillLink](#9-how-swagger-works-in-skilllink)
10. [How to Demo Using Swagger UI](#10-how-to-demo-using-swagger-ui)
11. [How to Demo Using Postman](#11-how-to-demo-using-postman)
12. [Common Questions & Answers for Evaluation](#12-common-questions--answers-for-evaluation)

---

## 1. What is a Web Service?

### Simple Explanation
A **Web Service** is a way for two different software applications to **talk to each other over the internet** (or a network) using standard protocols like HTTP.

**Real-world analogy**: Think of a restaurant. You (the customer/frontend) don't go into the kitchen (database) directly. Instead, you tell the **waiter** (Web Service/API) what you want, and the waiter goes to the kitchen, gets your food, and brings it back to you.

### In SkillLink
- **Frontend** (React app on port 3000) = Customer sitting at the table
- **Backend API** (Express server on port 5005) = The waiter
- **MongoDB Database** = The kitchen

When a customer clicks "Book a Worker" in the frontend, it sends an HTTP request to `POST /api/bookings`, the backend processes it, saves to the database, and returns a response.

### Types of Web Services
| Type | Description | Used in SkillLink? |
|------|-------------|-------------------|
| **RESTful APIs** | Uses HTTP methods (GET, POST, PUT, DELETE) with JSON data | ✅ YES — Our entire backend |
| SOAP | Uses XML, more strict/formal | ❌ No |
| GraphQL | Single endpoint, client asks for specific data | ❌ No |

---

## 2. What is a RESTful API?

### REST = **RE**presentational **S**tate **T**ransfer

REST is an **architectural style** (a set of rules/guidelines) for building web services. A RESTful API follows these rules:

### The 6 REST Principles

| Principle | What It Means | How SkillLink Follows It |
|-----------|--------------|--------------------------|
| **Client-Server** | Frontend and backend are separate | React frontend (port 3000) ↔ Express backend (port 5005) |
| **Stateless** | Each request is independent. Server doesn't remember previous requests | We use JWT tokens — every request carries its own authentication |
| **Cacheable** | Responses can be cached to improve performance | Our `cache.js` middleware caches GET responses for 5 minutes |
| **Uniform Interface** | Consistent URL patterns and HTTP methods | `/api/bookings` for all booking operations, `/api/orders` for orders |
| **Layered System** | Multiple layers between client and server | Request goes through 10+ middleware layers before hitting the controller |
| **Code on Demand** (optional) | Server can send executable code | Not used in our project |

### RESTful URL Design in SkillLink

```
GET    /api/bookings          → Get all bookings (Read)
POST   /api/bookings          → Create a new booking (Create)
GET    /api/bookings/:id      → Get one specific booking (Read one)
PUT    /api/bookings/:id      → Update a booking (Update)
DELETE /api/bookings/:id      → Delete a booking (Delete)
```

This pattern is called **CRUD** — **C**reate, **R**ead, **U**pdate, **D**elete — and maps directly to HTTP methods.

---

## 3. HTTP Methods Explained

### The 5 Main HTTP Methods

| Method | Purpose | Analogy | Example in SkillLink |
|--------|---------|---------|---------------------|
| **GET** | **Read/Fetch** data | Looking at a menu | `GET /api/services` — Browse all services |
| **POST** | **Create** new data | Placing an order | `POST /api/orders` — Place a new order |
| **PUT** | **Update/Replace** existing data | Changing your entire order | `PUT /api/orders/:id/status` — Update order status |
| **PATCH** | **Partially update** data | Changing just one item in your order | `PATCH /api/notifications/:id/read` — Mark one notification as read |
| **DELETE** | **Remove** data | Cancelling your order | `DELETE /api/notifications/:id` — Delete a notification |

### Key Differences
- **GET** never changes data on the server (it's "safe")
- **POST** creates something new every time (not idempotent)
- **PUT** replaces the entire resource (idempotent — same result if called twice)
- **PATCH** updates only some fields (partial update)
- **DELETE** removes the resource

---

## 4. HTTP Status Codes

Status codes tell the client **what happened** with their request.

### Categories
| Range | Category | Meaning |
|-------|----------|---------|
| **2xx** | ✅ Success | Request was processed successfully |
| **3xx** | ↪️ Redirect | Resource moved somewhere else |
| **4xx** | ❌ Client Error | Something wrong with YOUR request |
| **5xx** | 💥 Server Error | Something broke on the server |

### Status Codes Used in SkillLink

| Code | Meaning | When We Use It |
|------|---------|---------------|
| **200** | OK | Successful GET, PUT, PATCH, DELETE |
| **201** | Created | Successful POST (new booking/order created) |
| **400** | Bad Request | Missing required fields, invalid data |
| **401** | Unauthorized | No token provided, token expired |
| **403** | Forbidden | Token valid but wrong role (customer trying admin route) |
| **404** | Not Found | Booking/Order/User ID doesn't exist |
| **429** | Too Many Requests | Rate limiter triggered (too many requests) |
| **500** | Internal Server Error | Database error, unexpected crash |

---

## 5. Request & Response Structure

### A Typical API Request

```
POST /api/orders HTTP/1.1
Host: localhost:5005
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...

{
  "items": [
    { "productId": "64f1a2b3...", "quantity": 2 }
  ],
  "shippingAddress": {
    "name": "Ananya",
    "phone": "9876543210",
    "street": "123 Main St",
    "city": "Hyderabad",
    "state": "Telangana",
    "zipCode": "500001"
  },
  "paymentMethod": "razorpay"
}
```

**Parts of a Request:**
1. **Method + URL**: `POST /api/orders` — What action and where
2. **Headers**: Metadata like `Content-Type` (JSON) and `Authorization` (JWT token)
3. **Body**: The actual data being sent (only for POST/PUT/PATCH)

### A Typical API Response

```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
    "orderNumber": "ORD-ABCD1234",
    "customer": "64f1a2b3...",
    "items": [...],
    "totalAmount": 1500,
    "status": "pending",
    "createdAt": "2026-03-31T10:30:00.000Z"
  }
}
```

**Parts of a Response:**
1. **Status Code**: 201 (Created)
2. **Body**: JSON with `success` flag, `message`, and `data`

---

## 6. Authentication in APIs (JWT)

### What is JWT?
**JWT** = **JSON Web Token**. It's a secure string that proves who you are.

**Analogy**: JWT is like a **movie ticket**. After you buy it (login), you show it every time you want to enter the theater (API). The ticket has your info (name, role) encoded in it.

### How JWT Works in SkillLink

```
Step 1: User logs in
   POST /api/auth/login  →  { email: "...", password: "..." }

Step 2: Server verifies credentials and returns tokens
   Response: { token: "eyJhb...", refreshToken: "eyJhb..." }

Step 3: User stores the token in browser (localStorage)

Step 4: Every subsequent request includes the token
   GET /api/bookings
   Headers: { Authorization: "Bearer eyJhb..." }

Step 5: Server middleware verifies the token before processing
   jwt.js middleware → Decodes token → Attaches user info to request
```

### Token Structure (3 Parts)
```
eyJhbGciOiJIUzI1NiIs.eyJ1c2VySWQiOiI2NG.SflKxwRJSMeKKF2QT4
|___ Header ___|___ Payload ___|___ Signature ___|
```

- **Header**: Algorithm used (HS256)
- **Payload**: User data (userId, role, expiry time)
- **Signature**: Ensures nobody tampered with the token

### Role-Based Access Control (RBAC)
Our `authorize()` middleware checks the user's role:

```javascript
// Only customers can create bookings
router.post("/", authorize("customer"), bookingController.createBooking)

// Only workers can accept bookings
router.put("/:id/accept", authorize("worker"), bookingController.acceptBooking)

// Only admins can verify workers
router.put("/workers/:id/verify", authorize("admin"), adminController.verifyWorker)
```

---

## 7. Middleware — The Request Pipeline

### What is Middleware?
Middleware is a **function that runs BETWEEN the request arriving and the response being sent**. Think of it as a series of security checkpoints at an airport.

### SkillLink's Middleware Pipeline (in order)

```
Client Request
    ↓
[1] requestLogger     → Logs every request (method, URL, timestamp)
    ↓
[2] requestTimer      → Starts a timer to track response speed
    ↓
[3] addResponseHeaders → Adds standard headers (X-Powered-By, etc.)
    ↓
[4] responseFormatter  → Ensures consistent response format
    ↓
[5] trimStrings       → Trims whitespace from all input strings
    ↓
[6] sanitizeRequest   → Removes XSS/script injection attempts
    ↓
[7] blockInjection    → Blocks SQL/NoSQL injection patterns
    ↓
[8] normalizeRequest  → Normalizes phone numbers, emails, etc.
    ↓
[9] trackActivity     → Tracks user session activity
    ↓
[10] authenticateToken → Verifies JWT token (for protected routes)
    ↓
[11] authorize(role)  → Checks if user has the right role
    ↓
[12] rateLimiter      → Prevents too many requests (5/min for auth)
    ↓
[13] validation       → Validates input fields (email format, etc.)
    ↓
[CONTROLLER]          → Actual business logic
    ↓
[14] errorHandler     → Catches any errors and sends proper response
    ↓
Client Response
```

### Why Middleware Matters (for Evaluation)
Each middleware solves a specific **Web Service quality concern**:
- **Security**: sanitizer, blockInjection, JWT auth, RBAC
- **Performance**: cache, compression, requestTimer
- **Reliability**: errorHandler, asyncHandler, rateLimiter
- **Data Quality**: validation, inputNormalizer, trimStrings
- **Monitoring**: logger, auditTrail, sessionManager

---

## 8. What is Swagger / OpenAPI?

### Simple Explanation
**Swagger** is a tool that **automatically generates interactive documentation** for your API. It creates a webpage where you can:
- See all your API endpoints in one place
- Read what each endpoint does
- **Actually test the endpoints** right from the browser (click "Try it out")
- See the request/response format

### OpenAPI Specification
**OpenAPI** is the standard format for describing APIs. Swagger UI reads this format and creates the documentation page. Our file `swagger.js` defines this specification.

### Why Swagger is Important
1. **For developers**: Easy to understand and test APIs without Postman
2. **For teams**: Everyone can see all endpoints and their parameters
3. **For evaluation**: Professors can see every API endpoint and test them live

### Accessing Swagger in SkillLink
```
URL: http://localhost:5005/api-docs
JSON: http://localhost:5005/api-docs.json
```

---

## 9. How Swagger Works in SkillLink

### Our Implementation (swagger.js)

We define the API documentation in `swagger.js` with these sections:

#### 1. API Info
```javascript
info: {
  title: "SkillLink API Documentation",
  version: "1.0.0",
  description: "Complete API documentation for SkillLink..."
}
```

#### 2. Server Configuration
```javascript
servers: [{ url: "http://localhost:5005", description: "Development Server" }]
```

#### 3. Security Scheme (JWT)
```javascript
securitySchemes: {
  bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" }
}
```

#### 4. Data Schemas (Models)
We define what each data object looks like:
- **User** — name, email, role, verification_status
- **Service** — name, category, price, duration
- **Worker** — skills, experience, rating, availability
- **Booking** — customer, worker, service, status, date
- **Product** — name, brand, category, price, stock
- **Order** — items, totalAmount, status, deliveryOTP
- **Payment** — amount, status, razorpayOrderId
- **Notification** — title, message, type, isRead
- **Seller** — businessName, shopName, rating

#### 5. API Endpoint Paths
Every endpoint is documented with:
- **HTTP method** (GET/POST/PUT/PATCH/DELETE)
- **URL path** (`/api/bookings/{id}/accept`)
- **Tags** (which category it belongs to: Auth, Bookings, Orders, etc.)
- **Summary** (one-line description)
- **Parameters** (path params, query params)
- **Request body** (what data to send)
- **Response codes** (200, 400, 401, 404, etc.)
- **Security** (whether JWT is required)

#### 6. Tags (API Categories)
Our APIs are organized into these tags:
| Tag | What It Covers |
|-----|---------------|
| Health | API health check |
| Auth | Login, register, profile, password reset |
| Services | Service listings, worker browsing |
| Bookings | Booking CRUD, accept/reject, broadcast |
| Supplies (Products) | Product CRUD, CSV upload |
| Orders | Order management, tracking, OTP |
| Payments | Payment creation, verification, refunds |
| Reviews | Worker/product/seller reviews |
| Notifications | User notifications |
| Dashboard | Role-specific dashboard stats |
| Delivery | Delivery person operations |
| Workers | Worker availability |
| Admin | User verification, management |
| Verifier | User approval/rejection |
| Search | Global search |
| Metrics | Performance metrics |

---

## 10. How to Demo Using Swagger UI

### Step-by-Step Demo Flow

#### Step 1: Open Swagger
```
Open browser → http://localhost:5005/api-docs
```

#### Step 2: Test Health Check (No auth needed)
1. Click on **Health** → `GET /api/health`
2. Click **"Try it out"** → Click **"Execute"**
3. You should see: `{ "success": true, "message": "SkillLink API is running" }`

#### Step 3: Login to Get JWT Token
1. Click on **Auth** → `POST /api/auth/login`
2. Click **"Try it out"**
3. Enter the request body:
```json
{
  "email": "ananya@example.com",
  "password": "password123"
}
```
4. Click **"Execute"**
5. **Copy the `token` from the response**

#### Step 4: Authorize Swagger with Token
1. Click the 🔒 **"Authorize"** button at the top of the page
2. Paste the token (WITHOUT the word "Bearer")
3. Click **"Authorize"** → Click **"Close"**
4. Now all protected endpoints will work!

#### Step 5: Test Your Specific Endpoints
Now you can test any endpoint. Example:
- **GET /api/bookings** — See all your bookings
- **POST /api/orders** — Create an order
- **GET /api/dashboard/customer/stats** — See dashboard stats

### Test Accounts (Seeded Data)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@skilllink.com | Admin@123 |
| Customer | ananya@example.com | password123 |
| Customer | rohan@example.com | password123 |
| Customer | neha@example.com | password123 |
| Worker | rajesh.electrician@example.com | password123 |
| Worker | suresh.plumber@example.com | password123 |
| Worker | ramesh.carpenter@example.com | password123 |
| Seller | mahesh.seller@example.com | password123 |
| Seller | sharma.seller@example.com | password123 |
| Delivery | raju.delivery@example.com | password123 |
| Delivery | suresh.delivery@example.com | password123 |

---

## 11. How to Demo Using Postman

### Import Collection
1. Open Postman
2. Click **Import** → Select `SkillLink_API_Postman_Collection.json`
3. All endpoints are pre-configured!

### Demo Flow
1. **Login** → Hit `POST /api/auth/login` → Copy the token
2. **Set Token** → In Postman, go to Collection → Authorization → Bearer Token → Paste token
3. **Test endpoints** one by one

---

## 12. Common Questions & Answers for Evaluation

### Q1: "What type of web services did you implement?"
> "We implemented **RESTful Web Services** using the Express.js framework in Node.js. Our API follows the REST architectural style with proper HTTP methods (GET, POST, PUT, PATCH, DELETE), meaningful URL patterns, stateless communication using JWT tokens, JSON data format, and proper HTTP status codes."

### Q2: "How many API endpoints does your project have?"
> "Our project has **100+ API endpoints** across 16 categories: Authentication, Services, Bookings, Products/Supplies, Orders, Payments, Reviews, Notifications, Dashboard, Delivery, Workers, Admin, Verifier, Search, Health Check, and Metrics."

### Q3: "How do you handle authentication?"
> "We use **JWT (JSON Web Tokens)** for stateless authentication. When a user logs in, they receive an access token and a refresh token. The access token is sent in the Authorization header of every request. Our `jwt.js` middleware verifies the token and extracts user information. We also implement **role-based access control (RBAC)** — our `authorize()` middleware ensures customers can only access customer routes, workers can only access worker routes, and so on."

### Q4: "What is Swagger and why did you use it?"
> "Swagger (OpenAPI) is an **API documentation tool** that generates an interactive webpage where you can see all endpoints, their parameters, and actually test them live. We used it because it serves as living documentation — anyone on the team or evaluating the project can open `http://localhost:5005/api-docs` and understand every API without reading the code. It also supports 'Try it out' functionality, meaning you can test any API directly from the browser."

### Q5: "How do you handle errors in your API?"
> "We have **centralized error handling** through our `errorHandler.js` middleware. Every controller uses `try-catch` blocks, and unhandled errors propagate to the error handler. We return consistent error responses with `{ success: false, message: '...' }` format and proper HTTP status codes (400 for validation errors, 401 for unauthorized, 404 for not found, 500 for server errors)."

### Q6: "What middleware do you use and why?"
> "We have **14+ custom middleware functions** forming a request processing pipeline:
> - **Security**: sanitizer (XSS prevention), blockInjection (SQL/NoSQL injection), JWT authentication, role-based authorization
> - **Performance**: response caching (5-min TTL), compression, request timer
> - **Data Quality**: input validation, string trimming, data normalization
> - **Monitoring**: request logger, audit trail, session tracking
> - **Error Handling**: async handler wrapper, centralized error handler"

### Q7: "How does the booking/order flow work?"
> "The flow is:
> 1. Customer browses services/products (GET requests)
> 2. Customer creates a booking/order (POST request)
> 3. Worker/Seller receives notification (Socket.IO real-time)
> 4. Worker accepts/rejects booking, or Seller confirms order (PUT request)
> 5. Payment is processed (POST to Razorpay API)
> 6. For orders: Seller assigns delivery person → Delivery person picks up → Verifies OTP → Delivered
> 7. Customer can leave a review (POST request)"

### Q8: "How did you document your API?"
> "We used **Swagger/OpenAPI 3.0** specification. Our `swagger.js` file defines all endpoint paths, request/response schemas, authentication requirements, and parameter details. The documentation is served at `/api-docs` using `swagger-ui-express`. We also have a Postman collection (`SkillLink_API_Postman_Collection.json`) for easy testing."

### Q9: "What is the difference between PUT and PATCH?"
> "**PUT** replaces the entire resource — for example, `PUT /api/orders/:id/status` updates the whole status field. **PATCH** partially updates — for example, `PATCH /api/notifications/:id/read` only changes the `isRead` field without touching any other fields. We use PUT for complete state changes (accept booking, cancel order) and PATCH for minor updates (mark notification as read)."

### Q10: "How do you validate input data?"
> "We have **multiple validation layers**:
> 1. `validation.js` middleware checks required fields, email formats, phone number formats
> 2. `sanitizer.js` strips HTML/script tags to prevent XSS
> 3. `inputNormalizer.js` standardizes phone numbers, trims whitespace
> 4. Mongoose schema validation at the database level (required fields, enum values, min/max)
> 5. Controller-level validation for business logic (e.g., can't accept an already-accepted booking)"

---

## Summary: What Each Team Member Should Know

Every team member should be able to explain:
1. ✅ What is a RESTful API and its principles
2. ✅ HTTP methods (GET, POST, PUT, PATCH, DELETE) with examples from your endpoints
3. ✅ HTTP status codes and when each is used
4. ✅ How JWT authentication works in SkillLink
5. ✅ What Swagger/OpenAPI is and how to use it
6. ✅ The middleware pipeline and why each middleware exists
7. ✅ Your specific endpoints — the complete flow for your assigned feature area
8. ✅ How to demo your endpoints using Swagger UI or Postman

---

*This document is your evaluation preparation guide. Read it thoroughly and practice demoing your endpoints!*
