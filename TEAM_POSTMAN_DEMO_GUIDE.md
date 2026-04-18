# 📬 SkillLink — Postman Demo Guide (Team Division)

> **Import File**: `SkillLink_API_Postman_Collection.json` (55 requests, 16 folders)
> **Server**: `http://localhost:5005` | Run `node app.js` before demo

---

## 🛠️ Setup (Any ONE Member — 1 Minute)

1. **Start Server**:
   ```bash
   cd c:\Users\lokan\Downloads\Skilllink_WBD_final\SkillLink_React_6thfeb2026
   node app.js
   ```
2. **Open Postman** → Click **Import** → Select `SkillLink_API_Postman_Collection.json`
3. You'll see **"SkillLink API — Web Services Demo"** collection with 16 folders

> **💡 Smart Feature**: All Login requests have auto-save scripts. When you run a login, the JWT token is automatically saved to collection variables. All protected endpoints use `{{token}}` — no manual copy-paste needed!

---

## 👤 JEEVAN — Postman Demo: Dashboard APIs

### Folder: `📊 10. Dashboard Stats`

**Demo Flow (3-4 minutes):**

| Step | Action | What to Show |
|------|--------|-------------|
| 1 | Open folder `🔐 2. Authentication` → Run **"Login as Customer"** | Token auto-saved ✅ |
| 2 | Open `📊 10. Dashboard Stats` → Run **"Customer Dashboard Stats"** | Shows bookings & orders summary |
| 3 | Go back → Run **"Login as Worker"** | Switches to worker token |
| 4 | Run **"Worker Dashboard Stats"** | Shows rating: 4.2, earnings, jobs completed |
| 5 | Go back → Run **"Login as Seller"** | Switches to seller token |
| 6 | Run **"Seller Dashboard Stats"** | Shows products, orders, revenue |
| 7 | Run **"Seller Profile"** | Shows business name, categories |
| 8 | Go back → Run **"Login as Admin ⭐"** | Switches to admin token |
| 9 | Run **"Admin Dashboard Stats"** | Shows 25 users, 70 products, 15 services |

**Talking Points:**
- *"Notice how the same dashboard endpoint returns different data based on the logged-in user's role"*
- *"The admin dashboard aggregates system-wide statistics — total users by role, products, services, revenue"*
- *"The worker dashboard shows individual performance metrics — rating, earnings, completed jobs"*

---

## 👤 CHIDWIPAK — Postman Demo: Products/Supplies APIs

### Folder: `🛒 5. Supplies (Products)`

**Demo Flow (3-4 minutes):**

| Step | Action | What to Show |
|------|--------|-------------|
| 1 | Run **"Get All Products"** | Returns ~70 products (no auth needed!) |
| 2 | Run **"Get Products by Category (Electrical)"** | Filtered → only electrical products |
| 3 | Run **"Get Products with Price Range"** | Products between ₹100–₹500 |
| 4 | Run **"Search Products"** (search=LED) | Full-text search results |
| 5 | Run **"Get Unique Products"** | Products grouped by name across sellers |
| 6 | Go to `🔐 2. Authentication` → Run **"Login as Seller"** | Token saved |
| 7 | Run **"Get My Products (Seller)"** | Shows only Mahesh Traders' products |

**Talking Points:**
- *"Public endpoints (GET) need no authentication — anyone can browse products"*
- *"Supports multiple filter types: category, price range, search, pagination"*
- *"Each seller has isolated inventory — `my-products` shows only their own products"*
- *"CRUD operations: Create (POST), Read (GET), Update (PUT), Delete (DELETE)"*

---

## 👤 SRIMAN — Postman Demo: Services & Bookings APIs

### Folders: `🔧 3. Services` and `📅 4. Bookings`

**Demo Flow (3-4 minutes):**

| Step | Action | What to Show |
|------|--------|-------------|
| 1 | Open `🔧 3. Services` → Run **"Get All Services"** | 15 services across 3 categories |
| 2 | Run **"Get Services by Category (Electrician)"** | 5 electrician services |
| 3 | Run **"Get Service Categories"** | `["carpenter","electrician","plumber"]` |
| 4 | Run **"Get Workers by Category"** | 5 electricians with skills, ratings, experience |
| 5 | Go to `🔐 2. Authentication` → Run **"Login as Customer"** | Token saved |
| 6 | Open `📅 4. Bookings` → Run **"Get My Bookings"** | Customer's booking list |
| 7 | Run **"Get Bookings (Paginated)"** | Shows pagination: `?page=1&limit=5&status=pending` |

**Talking Points:**
- *"Services are browsable without authentication — public marketplace design"*
- *"Workers are linked to service categories — customers browse services, then see available workers"*
- *"Bookings require JWT authentication — only logged-in customers can book"*
- *"The booking lifecycle includes: create → accept/reject → start → complete → review"*
- *"Bookings support query parameters for filtering by status and pagination"*

---

## 👤 BALAJI — Postman Demo: Authentication, Payments & Notifications

### Folders: `🔐 2. Authentication`, `💳 7. Payments`, `🔔 9. Notifications`

**Demo Flow (4-5 minutes):**

| Step | Action | What to Show |
|------|--------|-------------|
| 1 | Open `🏥 1. Health Check` → Run **"API Health Check"** | `{"success": true, "message": "SkillLink API is running"}` |
| 2 | Open `🔐 2. Authentication` → Run **"Register New Customer"** | Creates new user with role |
| 3 | Run **"Login as Admin ⭐"** | Show response: JWT token, refreshToken, user object |
| 4 | **Point out** the **Tests** tab → Show auto-save script | Token auto-stored in `{{token}}` |
| 5 | Run **"Get My Profile"** | Shows admin profile (uses auto-saved token) |
| 6 | Run **"Refresh Token"** | Generates new access token from refresh token |
| 7 | Run **"Forgot Password"** | Sends password reset email |
| 8 | Open `🔔 9. Notifications` → Run **"Get My Notifications"** | Paginated notifications |
| 9 | Run **"Get Unread Count"** | Shows unread count |
| 10 | Run **"Mark All Notifications Read"** | PATCH request — marks all read |
| 11 | Open `💳 7. Payments` → Run **"Get Payment History"** | Payment records with pagination |
| 12 | Run **"Logout"** | Invalidates the session |

**Talking Points:**
- *"JWT authentication with dual tokens — short-lived access token + long-lived refresh token"*
- *"The register endpoint supports multipart/form-data for image uploads"*
- *"Password reset uses a secure token sent via email (Ethereal for dev)"*
- *"Notifications support CRUD: create, read, mark-read, delete, cleanup"*
- *"Payments integrate with Razorpay — the webhook endpoint handles server-to-server callbacks"*

---

## 👤 PRANEETH — Postman Demo: Orders, Delivery, Admin & Verifier

### Folders: `📦 6. Orders`, `🚚 11. Delivery`, `🛡️ 13. Admin`, `✅ 14. Verifier`

**Demo Flow (5-6 minutes):**

**Part A — Admin:**

| Step | Action | What to Show |
|------|--------|-------------|
| 1 | Run **"Login as Admin ⭐"** | Token saved |
| 2 | Open `🛡️ 13. Admin` → Run **"Get All Users"** | All 25 users, paginated |
| 3 | Run **"Get Users by Role"** (role=worker) | 15 workers filtered |
| 4 | Run **"Get Approved Users"** | All verified/approved users |
| 5 | Run **"Get Pending Verifications"** | Workers/sellers awaiting verification |
| 6 | Run **"Get System Analytics"** | Full system analytics data |

**Part B — Verifier:**

| Step | Action | What to Show |
|------|--------|-------------|
| 7 | Run **"Login as Verifier"** | Token saved |
| 8 | Open `✅ 14. Verifier` → Run **"Verifier Stats"** | Verifier dashboard |
| 9 | Run **"Get Pending Users"** | Users waiting for approval |

**Part C — Orders:**

| Step | Action | What to Show |
|------|--------|-------------|
| 10 | Run **"Login as Customer"** | Token saved |
| 11 | Open `📦 6. Orders` → Run **"Get My Orders (Customer)"** | Customer's orders |
| 12 | Run **"Login as Seller"** | Token saved |
| 13 | Run **"Get Seller Orders"** | Orders received by seller |

**Part D — Delivery:**

| Step | Action | What to Show |
|------|--------|-------------|
| 14 | Run **"Login as Delivery Person"** | Token saved |
| 15 | Open `🚚 11. Delivery` → Run **"Delivery Stats"** | Dashboard stats |
| 16 | Run **"Get Pending Delivery Requests"** | Available deliveries |
| 17 | Run **"Get Delivery History"** | Past deliveries |
| 18 | Run **"Toggle Delivery Availability"** | Toggles online/offline status |

**Talking Points:**
- *"Admin has full CRUD over users — view, filter by role, verify/reject, delete"*
- *"Verifier is a dedicated role for screening new registrations — separate from admin"*
- *"Orders flow: customer creates → seller confirms → assigns delivery → delivery accepts → delivers with OTP"*
- *"Delivery person can toggle availability and view pending/active/completed deliveries"*
- *"All admin and verifier endpoints are role-restricted — non-admin tokens get 403 Forbidden"*

---

## 📊 Demo Summary — Who Shows What

| Member | Postman Folders | # Requests | Time |
|--------|----------------|------------|------|
| **Jeevan** | Dashboard Stats | 6 + logins | ~4 min |
| **Chidwipak** | Supplies (Products) | 7 + logins | ~4 min |
| **Sriman** | Services + Bookings | 7 + logins | ~4 min |
| **Balaji** | Health + Auth + Payments + Notifications | 12 + logins | ~5 min |
| **Praneeth** | Orders + Delivery + Admin + Verifier | 12 + logins | ~6 min |

> **Total Demo Time: ~23 minutes**

---

## 🔗 Also Show Together (Any Member)

### Swagger UI — 2 Minutes
1. Open browser → `http://localhost:5005/api-docs`
2. Show the 16 tag categories, Authorize button, and "Try it Out" feature
3. Open `http://localhost:5005/api-docs.json` → Show raw OpenAPI 3.0 spec

### OpenAPI Spec in Postman — 1 Minute
1. Run **"Get OpenAPI JSON Spec"** from folder `📄 16. Swagger & OpenAPI Spec`
2. Point out: `openapi: "3.0.0"`, 97 paths, 12 schemas, 16 tags
3. Show the auto-tests pass: "OpenAPI version is 3.0.0" ✅

---

## 🔐 Credentials Quick Reference

| Role | Email | Password |
|------|-------|----------|
| **Admin** | `admin@skilllink.com` | `Admin@123` |
| **Verifier** | `verifier@skilllink.com` | `Verifier@123` |
| **Worker** | `rajesh@skilllink.com` | `Worker@123` |
| **Seller** | `mahesh@skilllink.com` | `Seller@123` |
| **Customer** | `ananya@example.com` | `Customer@123` |
| **Delivery** | `raju@skilllink.com` | `Delivery@123` |

---

*Generated on: March 29, 2026*
