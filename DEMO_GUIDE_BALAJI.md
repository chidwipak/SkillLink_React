# 👤 BALAJI — Individual Web Services Demo Guide
## Authentication, Signup/Login & Delivery/Verifier Dashboards

---

## 🎯 Your Area of Responsibility

You own two major areas:
1. **All Signup & Login** — Registration, email verification, OTP, login, JWT tokens, password reset, profile management
2. **Delivery Dashboard & Verifier Dashboard** — Delivery person operations and user verification workflow

---

## 📋 Your Complete API Endpoints

### 1. Authentication — Registration & Login

| # | Method | Endpoint | Auth? | Purpose |
|---|--------|----------|-------|---------|
| 1 | `POST` | `/api/auth/register` | ❌ No | Register a new user (all roles) |
| 2 | `POST` | `/api/auth/verify-email` | ❌ No | Verify email with OTP |
| 3 | `POST` | `/api/auth/resend-otp` | ❌ No | Resend OTP to email |
| 4 | `POST` | `/api/auth/login` | ❌ No | Login and get JWT tokens |
| 5 | `POST` | `/api/auth/refresh-token` | ❌ No | Refresh expired access token |
| 6 | `POST` | `/api/auth/forgot-password` | ❌ No | Request password reset OTP |
| 7 | `POST` | `/api/auth/reset-password` | ❌ No | Reset password with OTP/token |
| 8 | `POST` | `/api/auth/logout` | ✅ Logged in | Logout and invalidate refresh token |

### 2. Profile Management

| # | Method | Endpoint | Auth? | Purpose |
|---|--------|----------|-------|---------|
| 9 | `GET` | `/api/auth/profile` | ✅ Logged in | Get current user profile |
| 10 | `PUT` | `/api/auth/profile` | ✅ Logged in | Update profile (name, phone, picture) |

### 3. Delivery Person Dashboard

| # | Method | Endpoint | Auth? | Purpose |
|---|--------|----------|-------|---------|
| 11 | `GET` | `/api/delivery/stats` | ✅ Delivery | Get delivery dashboard statistics |
| 12 | `GET` | `/api/delivery/requests` | ✅ Delivery | Get pending delivery requests |
| 13 | `GET` | `/api/delivery/active` | ✅ Delivery | Get current active delivery |
| 14 | `GET` | `/api/delivery/history` | ✅ Delivery | Get completed delivery history |
| 15 | `PUT` | `/api/delivery/availability` | ✅ Delivery | Toggle online/offline |
| 16 | `PUT` | `/api/delivery/accept/:orderId` | ✅ Delivery | Accept a delivery request |
| 17 | `PUT` | `/api/delivery/deliver/:orderId` | ✅ Delivery | Verify OTP and complete delivery |
| 18 | `GET` | `/api/dashboard/delivery/stats` | ✅ Delivery | Delivery dashboard stats |

### 4. Verifier Dashboard

| # | Method | Endpoint | Auth? | Purpose |
|---|--------|----------|-------|---------|
| 19 | `GET` | `/api/verifier/stats` | ✅ Verifier | Get verifier dashboard stats |
| 20 | `GET` | `/api/verifier/pending` | ✅ Verifier | Get all pending users for review |
| 21 | `GET` | `/api/verifier/users/:userId` | ✅ Verifier | Get detailed user info for review |
| 22 | `PUT` | `/api/verifier/users/:userId/approve` | ✅ Verifier | Approve a user |
| 23 | `PUT` | `/api/verifier/users/:userId/decline` | ✅ Verifier | Decline/reject a user with feedback |

### 5. Security Middleware (Your Contribution)

| # | Middleware | File | Purpose |
|---|-----------|------|---------|
| 24 | `sanitizeRequest` | `middleware/sanitizer.js` | XSS prevention, HTML/script tag removal |
| 25 | `blockInjection` | `middleware/sanitizer.js` | SQL/NoSQL injection blocking |
| 26 | `validation` | `middleware/validation.js` | Email format, phone format, required fields |
| 27 | `rateLimiter` | `middleware/rateLimiter.js` | Rate limiting (5 reqs/min for auth) |
| 28 | `responseFormatter` | `middleware/responseFormatter.js` | Consistent response format |
| 29 | `errorHandler` | `middleware/errorHandler.js` | Centralized error handling |

**Total: 23 API endpoints + 6 middleware** — Authentication is the backbone of the entire system!

---

## 🔄 Complete Authentication Flow (Step-by-Step)

### Registration Flow
```
STEP 1: User submits registration form
    POST /api/auth/register
    Body (multipart/form-data): {
        name: "John Doe",
        email: "john@example.com",
        password: "SecurePass@123",
        phone: "9876543210",
        role: "customer",        // or worker/seller/delivery
        profilePicture: <file>,  // optional
        
        // Worker-specific fields:
        serviceCategory: "electrician",
        skills: "wiring,fan installation",
        experience: 5,
        
        // Seller-specific fields:
        businessName: "Mahesh Traders",
        gstNumber: "GSTIN123...",
        categories: "electrical,plumbing"
    }

STEP 2: Backend processes registration
    → Validates all fields (email format, phone format, required fields)
    → Checks if email already exists
    → Hashes password using bcryptjs (10 salt rounds)
    → Creates User document
    → If worker: Creates Worker document linked to user
    → If seller: Creates Seller document linked to user
    → If delivery: Creates DeliveryPerson document linked to user
    → Generates 6-digit OTP for email verification
    → Sends verification email with OTP
    → Returns success with "please verify your email"

STEP 3: User verifies email
    POST /api/auth/verify-email
    Body: { email: "john@example.com", otp: "123456" }
    → Validates OTP against stored OTP
    → Checks OTP hasn't expired (10-minute window)
    → Sets isEmailVerified = true
    → For customers: Account is immediately active
    → For workers/sellers/delivery: Account pending admin verification

STEP 4 (if OTP expired): Resend OTP
    POST /api/auth/resend-otp
    Body: { email: "john@example.com" }
    → Generates new 6-digit OTP
    → Sends new verification email
```

### Login Flow
```
STEP 1: User submits login
    POST /api/auth/login
    Body: { email: "john@example.com", password: "SecurePass@123" }

STEP 2: Backend authenticates
    → Finds user by email
    → Compares password hash using bcrypt.compare()
    → Checks if email is verified
    → Checks verification_status (workers/sellers must be "Approved")
    → Generates JWT access token (expires in 24h)
    → Generates refresh token (expires in 7 days)
    → Stores refresh token in User document
    → Returns: { token, refreshToken, user: { name, email, role, ... } }

STEP 3: Frontend stores tokens
    → Stores token in localStorage
    → Attaches token to every request via Axios interceptor
    → Authorization: Bearer <token>
```

### Token Refresh Flow
```
When access token expires (24h):
    POST /api/auth/refresh-token
    Body: { refreshToken: "eyJhb..." }
    → Verifies refresh token is valid and not expired
    → Generates new access token
    → Returns: { token: "new_token" }
```

### Password Reset Flow
```
STEP 1: User requests password reset
    POST /api/auth/forgot-password
    Body: { email: "john@example.com" }
    → Generates reset token/OTP
    → Sends reset email with link/OTP

STEP 2: User resets password
    POST /api/auth/reset-password
    Body: { token: "reset_token", password: "NewPass@123" }
    → Verifies reset token
    → Hashes new password
    → Updates user's password
    → Clears reset token
```

---

## 🔄 Delivery Dashboard Flow

```
Delivery person logs in
    ↓
GET /api/delivery/stats
    → Returns: todayDeliveries, totalDeliveries, todayEarnings, rating

GET /api/delivery/requests
    → Returns: list of orders assigned to delivery area
    → Each request shows: pickup address, delivery address, estimated distance

PUT /api/delivery/accept/:orderId
    → Delivery person accepts a request
    → activeDelivery set to this order
    → Gets pickup OTP instructions

PUT /api/delivery/availability
    → Toggle between online/offline

GET /api/delivery/active
    → Shows current active delivery with all details

PUT /api/delivery/deliver/:orderId
    → Delivery person enters customer's OTP
    → OTP verified → Order marked as "delivered"
    → Earnings credited → activeDelivery cleared

GET /api/delivery/history
    → Past completed deliveries with earnings
```

---

## 🔄 Verifier Dashboard Flow

```
Verifier Logs in
    ↓
GET /api/verifier/stats
    → Returns: pendingCount, approvedCount, rejectedCount, totalProcessed

GET /api/verifier/pending
    → Returns: list of all users pending verification
    → Shows: name, role, submitted documents, registration date

GET /api/verifier/users/:userId
    → Returns: detailed user info including:
    → Worker: skills, experience, service category, documents
    → Seller: business details, GST number, shop info
    → Delivery: vehicle info, license, documents

PUT /api/verifier/users/:userId/approve
    → Sets verification_status = "Approved"
    → Sets isVerified = true
    → Notifies user: "Your account has been approved!"

PUT /api/verifier/users/:userId/decline
    Body: { feedback: "Please resubmit clearer Aadhar image" }
    → Sets verification_status = "Rejected"
    → Stores feedback for user to see
    → Notifies user with rejection reason
```

---

## 🎤 Demo Script (What to Show the Professor)

### Demo 1: Registration (3 min)
1. Open Swagger UI → `http://localhost:5005/api-docs`
2. Go to **Auth** section
3. Execute `POST /api/auth/register`:
```json
{
  "name": "Demo User",
  "email": "demo@example.com",
  "password": "Demo@123",
  "phone": "9876543210",
  "role": "customer"
}
```
4. **Show**: User created, OTP sent to email
5. Execute `POST /api/auth/verify-email` with the OTP
6. **Show**: Email verified successfully

### Demo 2: Login & JWT (3 min)
1. Execute `POST /api/auth/login`:
```json
{
  "email": "ananya@example.com",
  "password": "password123"
}
```
2. **Show**: JWT token and refresh token returned
3. **Explain**: "This JWT token contains the user's ID and role, encoded and signed with our secret key"
4. Copy token → Click 🔒 **Authorize** → Paste
5. Execute `GET /api/auth/profile` → Show profile data loaded using JWT

### Demo 3: Profile Update (1 min)
1. Execute `PUT /api/auth/profile` with updated name/phone
2. Execute `GET /api/auth/profile` → Show updated data

### Demo 4: Delivery Dashboard (3 min)
1. **Login as delivery**: `raju.delivery@example.com` / `password123`
2. Re-authorize with new token
3. Execute `GET /api/delivery/stats` → Show dashboard stats
4. Execute `GET /api/delivery/requests` → Show pending requests
5. Execute `PUT /api/delivery/availability` → Toggle availability
6. Execute `GET /api/delivery/history` → Show delivery history

### Demo 5: Verifier Dashboard (3 min)
1. **Need a verifier account** — Login as admin first, or use seed data
2. Execute `GET /api/verifier/stats` → Show verification stats
3. Execute `GET /api/verifier/pending` → Show pending users
4. Execute `GET /api/verifier/users/:userId` → Show user details
5. Execute `PUT /api/verifier/users/:userId/approve` → Approve user
6. **Show**: User's verification_status changed to "Approved"

---

## 🧠 Questions You Should Be Ready to Answer

### Q: "How does user registration work?"
> "Registration is handled by `POST /api/auth/register` which accepts multipart form data (for file uploads). The controller:
> 1. Validates all input fields using our validation middleware
> 2. Checks for existing email to prevent duplicates
> 3. Hashes the password using bcryptjs with 10 salt rounds (never stores plain text)
> 4. Creates the User document with role-specific fields
> 5. For workers/sellers/delivery: creates the corresponding role document (Worker/Seller/DeliveryPerson)
> 6. Generates a 6-digit OTP with 10-minute expiry for email verification
> 7. Sends verification email via Nodemailer"

### Q: "How does JWT authentication work?"
> "When a user logs in, we:
> 1. Verify their credentials (email + bcrypt password comparison)
> 2. Generate a JWT **access token** (expires in 24 hours) containing `userId` and `role`
> 3. Generate a **refresh token** (expires in 7 days) for token renewal
> 4. The access token is sent in every request's `Authorization: Bearer <token>` header
> 5. Our `authenticateToken` middleware in `jwt.js` verifies the token signature using the JWT_SECRET
> 6. If valid, it attaches `req.user = { userId, role }` for controllers to use
> 7. The `authorize('role')` middleware then checks if the user's role matches the required role"

### Q: "Why do you use both access and refresh tokens?"
> "The access token has a short life (24h) for security — if it's stolen, it expires quickly. The refresh token has a longer life (7 days) and is only used to get a new access token without re-entering credentials. This balances security (short-lived tokens) with user experience (don't have to log in every day). The refresh token is stored in the database so we can invalidate it on logout."

### Q: "How do you prevent security attacks?"
> "We have multiple layers:
> 1. **XSS Prevention**: `sanitizer.js` strips HTML tags and script content from all inputs
> 2. **Injection Prevention**: `blockInjection` detects SQL/NoSQL injection patterns ($gt, $where, DROP TABLE, etc.)
> 3. **Rate Limiting**: Auth endpoints limited to 5 requests/min to prevent brute-force attacks
> 4. **Password Hashing**: bcryptjs with 10 salt rounds — passwords never stored in plain text
> 5. **Helmet.js**: Sets security HTTP headers (X-Frame-Options, X-XSS-Protection, etc.)
> 6. **CORS**: Only our frontend origin is allowed to make requests
> 7. **Input Validation**: Email format, phone format, required fields all validated before processing"

### Q: "How does the verifier dashboard differ from admin?"
> "The admin can verify users AND manage all platform operations (analytics, user CRUD, etc.). The verifier has a **focused role** — they only review and approve/reject pending user registrations. They see the submitted documents, verify their authenticity, and either approve (user can start operating) or decline with specific feedback (user can re-apply). This separates concerns — admins handle platform management, verifiers handle document verification."

### Q: "How does the delivery dashboard work?"
> "The delivery person dashboard (`GET /api/delivery/stats`) shows:
> - Today's completed deliveries and earnings
> - Total deliveries and overall earnings
> - Current availability status
> - Average rating from customers
> They can view pending requests, accept one at a time (single active delivery), navigate to pickup location, verify pickup OTP with seller, deliver to customer, verify delivery OTP with customer, and see their delivery history with earnings per delivery."

---

## 📁 Your Files in the Codebase

| Layer | File | What You Built |
|-------|------|---------------|
| **Route** | `routes/auth.js` | Authentication routes (register, login, verify, reset) |
| **Route** | `routes/delivery.js` | Delivery person dashboard routes |
| **Route** | `routes/verifier.js` | Verifier dashboard routes |
| **Controller** | `controllers/authControllerAPI.js` | All auth logic (register, login, JWT, OTP, profile) |
| **Controller** | `controllers/deliveryControllerAPI.js` | Delivery dashboard, accept, deliver, history |
| **Controller** | `controllers/verifierControllerAPI.js` | Verifier stats, approve, decline |
| **Model** | `models/User.js` | User schema (all roles, JWT, OTP fields) |
| **Model** | `models/DeliveryPerson.js` | Delivery person profile |
| **Middleware** | `middleware/jwt.js` | JWT verification & role-based authorization |
| **Middleware** | `middleware/validation.js` | Input validation middleware |
| **Middleware** | `middleware/sanitizer.js` | XSS/injection prevention |
| **Middleware** | `middleware/rateLimiter.js` | Rate limiting |
| **Middleware** | `middleware/errorHandler.js` | Error handling |
| **Middleware** | `middleware/responseFormatter.js` | Response formatting |
| **Swagger** | `swagger.js` | Documentation for Auth, Delivery, Verifier sections |

---

## ⚡ Quick Reference Card

```
YOUR LOGINS (for demo):
  Admin (for setup):  admin@skilllink.com / Admin@123
  Customer:           ananya@example.com / password123
  Delivery:           raju.delivery@example.com / password123
  Worker (to verify): rajesh.electrician@example.com / password123

YOUR SWAGGER SECTIONS:
  → Auth      [10 endpoints]
  → Delivery  [8 endpoints]
  → Verifier  [5 endpoints]

KEY CONCEPTS:
  → JWT (access token + refresh token)
  → bcrypt password hashing (10 salt rounds)
  → Email OTP verification (6-digit, 10-min expiry)
  → Role-based access control (RBAC)
  → Rate limiting (5 req/min for auth)
  → XSS/injection prevention middleware

REGISTRATION FLOW:
  Register → Email OTP → Verify Email → (Worker/Seller: Admin Verification) → Active

JWT TOKEN FLOW:
  Login → Get tokens → Send token in every request → Refresh when expired → Logout
```

---

*You own 23 endpoints + 6 middleware covering the entire authentication system and delivery/verifier dashboards. Authentication is the FOUNDATION that every other team member's feature depends on!*
