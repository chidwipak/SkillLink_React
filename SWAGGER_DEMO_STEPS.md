# 🧪 Step-by-Step Demonstration: Web Services & Swagger Implementation

This guide walks through exactly how to demonstrate the Web Services and Swagger/OpenAPI implementation in the SkillLink project.

---

## Pre-Requisites

- Node.js installed
- MongoDB running (local or Atlas)
- Terminal / Command Prompt open
- A web browser (Chrome recommended)

---

## STEP 1: Verify Swagger Dependencies Are Installed

### Command:
```bash
npm list swagger-jsdoc swagger-ui-express
```

### Expected Output:
```
skilllink_react@1.0.0
├── swagger-jsdoc@6.x.x
└── swagger-ui-express@5.x.x
```

> This confirms that both required Swagger packages are installed in the project.

---

## STEP 2: Verify Swagger Configuration File Exists

### Command:
```bash
dir swagger.js
```
(On Mac/Linux: `ls -la swagger.js`)

### Expected Output:
```
 Directory of ...\SkillLink_React_6thfeb2026

03/18/2026  11:49 PM           44,749 swagger.js
               1 File(s)         44,749 bytes
```

> This file contains the complete OpenAPI 3.0 specification with all 97 API paths, schemas, and Swagger UI setup.

---

## STEP 3: Verify Swagger Is Integrated in app.js

### Command:
```bash
findstr "swagger" app.js
```
(On Mac/Linux: `grep -n "swagger" app.js`)

### Expected Output:
```
app.js:10:const { setupSwagger } = require("./swagger")
app.js:134:// Swagger API Documentation
app.js:135:setupSwagger(app)
```

> This shows:
> - **Line 10**: Swagger module is imported
> - **Lines 134-135**: Swagger UI is mounted after all API routes

---

## STEP 4: Start the Server

### Command:
```bash
node app.js
```

### Expected Output:
```
📚 Swagger API Docs available at http://localhost:5005/api-docs
Socket.IO initialized in socket.js
Connected to MongoDB successfully
Database: skilllink
Server running on port 5005 for real-time features
```

> The first line confirms Swagger API Docs are available. Keep this terminal running.

---

## STEP 5: Open Swagger UI in Browser

### Action:
Open your web browser and navigate to:

```
http://localhost:5005/api-docs
```

### What You Will See:

1. **Header Area:**
   - Title: **"SkillLink API Documentation"**
   - Version badge: **1.0.0**
   - OAS badge: **OAS 3.0**
   - Description: *"Complete API documentation for SkillLink - Home Services & Supplies Platform..."*

2. **Server Selector:**
   - Dropdown showing: `http://localhost:5005 - Development Server`

3. **Authorize Button (Green):**
   - Located at top-right
   - Click to enter JWT token for testing protected APIs

4. **Filter by Tag Search Box:**
   - Type to filter endpoints by category name

5. **16 API Categories (Tags) Listed Alphabetically:**
   - Admin — Admin panel operations
   - Auth — Authentication & user management
   - Bookings — Service booking management
   - Dashboard — Role-based dashboard stats
   - Delivery — Delivery person operations
   - Health — API health check
   - Metrics — System performance metrics
   - Notifications — User notifications
   - Orders — Order management
   - Payments — Payment processing
   - Reviews — Reviews for workers, products, sellers
   - Search — Global search
   - Services — Service listings and categories
   - Supplies (Products) — Product/supplies management
   - Verifier — User verification management
   - Workers — Worker availability management

---

## STEP 6: Explore an API Endpoint (Example: Health Check)

### Action:
1. Click on **"Health"** tag to expand it
2. Click on **GET /api/health**
3. Click **"Try it out"** button
4. Click **"Execute"** button

### Expected Response Body:
```json
{
  "success": true,
  "message": "SkillLink API is running",
  "timestamp": "2026-03-19T07:25:53.000Z"
}
```

### Expected Response Header:
```
content-type: application/json
x-response-time: 2.45ms
```

> This proves the API is live and responding.

---

## STEP 7: Test Authentication (Login API)

### Action:
1. Click on **"Auth"** tag to expand it
2. Click on **POST /api/auth/login**
3. Click **"Try it out"**
4. Enter this in the request body:
```json
{
  "email": "admin@skilllink.com",
  "password": "admin123"
}
```
5. Click **"Execute"**

### Expected Response (200 OK):
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "...",
      "name": "Admin",
      "email": "admin@skilllink.com",
      "role": "admin"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6..."
  }
}
```

> Copy the `accessToken` value for the next step.

---

## STEP 8: Authorize Swagger with JWT Token

### Action:
1. Click the green **"Authorize"** button (top-right corner)
2. In the **"Value"** field, paste the `accessToken` you copied
3. Click **"Authorize"**
4. Click **"Close"**

### What Changes:
- All endpoints with a 🔒 lock icon are now authenticated
- When you execute protected endpoints, the JWT token is automatically included

---

## STEP 9: Test a Protected Endpoint (Dashboard Stats)

### Action:
1. Click on **"Dashboard"** tag
2. Click on **GET /api/dashboard/admin/stats**
3. Click **"Try it out"** → **"Execute"**

### Expected Response (200 OK):
```json
{
  "success": true,
  "data": {
    "totalUsers": 25,
    "totalWorkers": 8,
    "totalSellers": 5,
    "totalDelivery": 3,
    "totalBookings": 42,
    "totalOrders": 18,
    "totalRevenue": 45000,
    ...
  }
}
```

> This proves that JWT authentication works through Swagger and the protected API returns data.

---

## STEP 10: View the Raw OpenAPI JSON Specification

### Action:
Navigate to in browser:
```
http://localhost:5005/api-docs.json
```

### What You Will See:
A large JSON document containing the complete OpenAPI 3.0 specification:

```json
{
  "openapi": "3.0.0",
  "info": {
    "title": "SkillLink API Documentation",
    "version": "1.0.0",
    "description": "Complete API documentation for SkillLink..."
  },
  "servers": [
    { "url": "http://localhost:5005", "description": "Development Server" }
  ],
  "components": {
    "securitySchemes": { "bearerAuth": { ... } },
    "schemas": {
      "User": { ... },
      "Service": { ... },
      "Worker": { ... },
      "Booking": { ... },
      "Product": { ... },
      "Order": { ... },
      "Payment": { ... },
      "Notification": { ... },
      "Seller": { ... }
    }
  },
  "paths": {
    "/api/health": { ... },
    "/api/auth/register": { ... },
    "/api/auth/login": { ... },
    ... (97 total paths)
  }
}
```

> This JSON spec can be imported into tools like Postman, Insomnia, or any OpenAPI-compatible client.

---

## STEP 11: Verify Total API Count via Terminal

### Open a new terminal and run:
```bash
node -e "const s = require('./swagger'); console.log('Total API paths:', Object.keys(s.swaggerSpec.paths).length); let total = 0; Object.values(s.swaggerSpec.paths).forEach(p => { total += Object.keys(p).length; }); console.log('Total endpoint methods:', total); console.log('Tags:', s.swaggerSpec.tags.map(t=>t.name).join(', ')); console.log('Schemas:', Object.keys(s.swaggerSpec.components.schemas).join(', '));"
```

### Expected Output:
```
Total API paths: 97
Total endpoint methods: 100+
Tags: Health, Auth, Services, Bookings, Supplies (Products), Orders, Payments, Reviews, Notifications, Dashboard, Delivery, Workers, Admin, Verifier, Search, Metrics
Schemas: User, Service, Worker, Booking, Product, Order, Payment, Notification, Seller, SuccessResponse, ErrorResponse, PaginationInfo
```

---

## STEP 12: View Schemas Section in Swagger UI

### Action:
1. Go back to `http://localhost:5005/api-docs`
2. Scroll to the very bottom of the page
3. You will see the **"Schemas"** section

### What You Will See:
Expandable schema definitions for:

| Schema | Key Properties |
|--------|---------------|
| **User** | _id, name, email, phone, role, verification_status, profilePicture, isEmailVerified |
| **Service** | name, category (electrician/plumber/carpenter), description, price, duration |
| **Worker** | serviceCategory, skills[], experience, rating, isAvailable, jobsCompleted |
| **Booking** | customer, worker, service, date, time, status, price, notes |
| **Product** | name, brand, category, description, price, stock, images[], seller |
| **Order** | orderNumber, customer, items[], totalAmount, status, shippingAddress |
| **Payment** | relatedId, relatedModel, amount, status, razorpayOrderId |
| **Notification** | title, message, type, isRead, link |
| **Seller** | businessName, shopName, categories[], rating, isVerified |

---

## Summary of Implementation

| What | Where | How to Verify |
|------|-------|---------------|
| Swagger config file | `swagger.js` (root) | `dir swagger.js` |
| Swagger import in app | `app.js` line 10 | `findstr "swagger" app.js` |
| Swagger mount in app | `app.js` line 134-135 | `findstr "setupSwagger" app.js` |
| NPM packages | `package.json` | `npm list swagger-jsdoc swagger-ui-express` |
| Swagger UI | Browser: `/api-docs` | Open `http://localhost:5005/api-docs` |
| JSON spec | Browser: `/api-docs.json` | Open `http://localhost:5005/api-docs.json` |
| **97 API paths** | Listed in Swagger UI | Expand any tag category |
| **10 data schemas** | Bottom of Swagger UI | Scroll to "Schemas" section |
| **JWT auth support** | "Authorize" button | Login → copy token → authorize |
| **16 tag categories** | Main Swagger UI page | Visible as collapsible sections |

---

## Files Created/Modified

| File | Change | Purpose |
|------|--------|---------|
| `swagger.js` | **NEW** (400 lines) | Complete OpenAPI 3.0 specification + Swagger UI setup |
| `app.js` | **Modified** (2 lines added) | Import and mount Swagger middleware |
| `package.json` | **Modified** (2 deps added) | `swagger-jsdoc`, `swagger-ui-express` |

---

*This demo guide was created on March 19, 2026*
