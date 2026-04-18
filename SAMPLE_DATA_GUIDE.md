# 🎯 SAMPLE SEED DATA - LOGIN CREDENTIALS & EXPLORATION GUIDE

## 🚀 SERVER IS RUNNING ON: http://localhost:5005

---

## 👤 LOGIN CREDENTIALS

### 🔴 ADMIN ACCESS
```
Email: admin@skilllink.com
Password: Admin@123
```
**What Admin Can Do:**
- View all users, workers, sellers
- Manage entire platform
- View all bookings and orders
- Access admin dashboard

---

### 👷 WORKERS (Service Providers)

#### ⚡ ELECTRICIANS (5 workers)
```
1. Rajesh Kumar
   Email: rajesh@skilllink.com
   Password: Worker@123
   Experience: 5 years
   Skills: Wiring, Fan Installation, Circuit Repair

2. Sunil Sharma
   Email: sunil@skilllink.com
   Password: Worker@123
   Experience: 8 years
   Skills: Panel Board, Industrial Wiring, Troubleshooting

3. Amit Patel
   Email: amit@skilllink.com
   Password: Worker@123
   Experience: 3 years
   Skills: Home Wiring, Light Installation, Switch Repair

4. Vikram Singh
   Email: vikram@skilllink.com
   Password: Worker@123
   Experience: 10 years
   Skills: Commercial Wiring, Generator Installation

5. Pradeep Joshi
   Email: pradeep@skilllink.com
   Password: Worker@123
   Experience: 6 years
   Skills: Solar Panel Installation, Smart Home Wiring
```

#### 🔧 PLUMBERS (5 workers)
```
1. Mohan Das
   Email: mohan@skilllink.com
   Password: Worker@123
   Experience: 7 years
   Skills: Pipe Fitting, Leak Repair, Bathroom Plumbing

2. Ravi Verma
   Email: ravi@skilllink.com
   Password: Worker@123
   Experience: 4 years
   Skills: Toilet Installation, Drainage Cleaning

3. Sanjay Gupta
   Email: sanjay@skilllink.com
   Password: Worker@123
   Experience: 6 years
   Skills: Water Heater Installation, Pipe Replacement

4. Prakash Joshi
   Email: prakash@skilllink.com
   Password: Worker@123
   Experience: 9 years
   Skills: Commercial Plumbing, Water Filtration

5. Karan Malhotra
   Email: karan@skilllink.com
   Password: Worker@123
   Experience: 5 years
   Skills: Gas Line Installation, Boiler Repair
```

#### 🪚 CARPENTERS (5 workers)
```
1. Dinesh Tiwari
   Email: dinesh@skilllink.com
   Password: Worker@123
   Experience: 12 years
   Skills: Furniture Making, Wood Carving, Cabinet Installation

2. Ramesh Yadav
   Email: ramesh@skilllink.com
   Password: Worker@123
   Experience: 5 years
   Skills: Door Installation, Window Repair, Shelving

3. Kishore Kumar
   Email: kishore@skilllink.com
   Password: Worker@123
   Experience: 8 years
   Skills: Wooden Flooring, Staircase Building

4. Vijay Mishra
   Email: vijay@skilllink.com
   Password: Worker@123
   Experience: 7 years
   Skills: Kitchen Cabinets, Furniture Repair

5. Naveen Reddy
   Email: naveen@skilllink.com
   Password: Worker@123
   Experience: 9 years
   Skills: Custom Furniture Design, Antique Restoration
```

---

### 🏪 SELLERS (Product Suppliers)

```
1. Mahesh Traders
   Email: mahesh@skilllink.com
   Password: Seller@123
   Business: Hardware and electrical supplies
   Products: ~23 products
   Categories: Electrical, Plumbing, Carpentry supplies

2. Sharma Hardware
   Email: vishal@skilllink.com
   Password: Seller@123
   Business: General hardware store
   Products: ~23 products
   Categories: Tools, fixtures, materials

3. Green Solutions
   Email: anita@skilllink.com
   Password: Seller@123
   Business: Eco-friendly supplies
   Products: ~24 products
   Categories: Sustainable building materials
```

---

### 👥 CUSTOMERS (Regular Users)

```
1. Ananya Sharma
   Email: ananya@example.com
   Password: Customer@123
   Location: Mumbai, Maharashtra

2. Rohan Mehta
   Email: rohan@example.com
   Password: Customer@123
   Location: Delhi

3. Neha Gupta
   Email: neha@example.com
   Password: Customer@123
   Location: Bangalore, Karnataka
```

---

### 🚚 DELIVERY PERSONS

```
1. Raju Kumar
   Email: raju@skilllink.com
   Password: Delivery@123
   Vehicle: Bike (MH-01-AB-1234)
   Rating: 4.5/5
   Total Deliveries: ~80

2. Suresh Yadav
   Email: suresh@skilllink.com
   Password: Delivery@123
   Vehicle: Scooter (MH-02-CD-5678)
   Rating: 4.7/5
   Total Deliveries: ~60
```

---

## 🎯 SAMPLE SERVICES AVAILABLE

### ⚡ ELECTRICIAN SERVICES
- Wiring Installation - ₹500 (2 hours)
- Fan Installation - ₹300 (1 hour)
- Switch Board Repair - ₹200 (45 mins)
- Light Fixture Installation - ₹250 (1 hour)
- Circuit Breaker Replacement - ₹400 (1.5 hours)

### 🔧 PLUMBER SERVICES
- Pipe Leak Repair - ₹350 (1 hour)
- Tap Installation - ₹200 (45 mins)
- Toilet Repair - ₹400 (1.5 hours)
- Water Heater Installation - ₹800 (3 hours)
- Drainage Cleaning - ₹300 (1 hour)

### 🪚 CARPENTER SERVICES
- Furniture Assembly - ₹500 (2 hours)
- Door Repair - ₹400 (1.5 hours)
- Cabinet Installation - ₹700 (2.5 hours)
- Wooden Flooring - ₹1200 (4 hours)
- Window Frame Repair - ₹450 (1.5 hours)

---

## 🛍️ SAMPLE PRODUCTS (70 Total)

### 📦 Product Categories:
- Electrical Supplies (~23 products)
- Plumbing Supplies (~23 products)
- Carpentry Supplies (~24 products)

### 💰 Price Range:
- Minimum: ₹50
- Maximum: ₹5000
- Average: ₹500-2000

### 📊 Stock Status:
- All products in stock (quantity: 50-500 units)

---

## 🧪 HOW TO EXPLORE THE WEBSITE

### 🎯 CUSTOMER-SELLER PIPELINE (YOUR CONTRIBUTION)

#### AS A CUSTOMER:

1. **Login** as customer
   ```
   Email: ananya@example.com
   Password: Customer@123
   ```

2. **Browse Products**
   - Go to "Supplies" or "Shop" section
   - See all products from all sellers
   - **Middleware working**: Cache loads products super fast!

3. **Search Products**
   - Search for "hammer", "wire", "pipe"
   - Filter by category
   - **Middleware working**: Sanitizer cleans your search input

4. **View Product Details**
   - Click on any product
   - See seller information
   - Check price and stock
   - **Middleware working**: Authentication checks if you're logged in

5. **Place Order**
   - Add product to cart
   - Enter delivery address
   - Confirm order
   - **Middlewares working**:
     - ✅ Authentication: Verifies you're logged in
     - ✅ Validation: Checks address format
     - ✅ Sanitization: Cleans input data
     - ✅ Normalization: Formats phone number

6. **View Your Orders**
   - Go to "My Orders"
   - See order status
   - Track delivery
   - **Middleware working**: Authorization ensures you see only YOUR orders

---

#### AS A SELLER:

1. **Login** as seller
   ```
   Email: mahesh@skilllink.com
   Password: Seller@123
   ```

2. **View Dashboard**
   - See your products
   - Check order statistics
   - Monitor sales

3. **Add New Product**
   - Click "Add Product"
   - Enter product details:
     - Name: "Premium Hammer"
     - Price: 599
     - Category: "Carpentry"
     - Stock: 100
   - Upload product image
   - **Middlewares working**:
     - ✅ Authentication: Checks you're logged in
     - ✅ Authorization: Verifies you're a SELLER (not customer!)
     - ✅ Validation: Ensures price is number, name not empty
     - ✅ Sanitization: Removes dangerous code from description

4. **Edit Product**
   - Update price
   - Change stock quantity
   - Modify description
   - **Middleware working**: Authorization ensures you can only edit YOUR products

5. **View Orders**
   - See orders for your products
   - Update order status
   - Manage deliveries
   - **Middleware working**: Shows only orders containing YOUR products

6. **Delete Product**
   - Remove products you no longer sell
   - **Middleware working**: Cache is cleared so customers don't see deleted items

---

## 🧪 TESTING SCENARIOS

### ✅ Test Authentication:
1. Logout from website
2. Try to access "My Orders" → Should redirect to login
3. Try to access "Add Product" → Should redirect to login

### ✅ Test Authorization:
1. Login as Customer
2. Try to access seller dashboard → Should get "Access Denied"
3. Login as Seller
4. Try to place order → Should work (sellers can also be customers)

### ✅ Test Caching:
1. Browse products page
2. Check network tab in browser
3. Go back and browse again
4. Notice: Second time loads MUCH faster! (from cache)
5. Response header shows: `X-Cache: HIT`

### ✅ Test Validation:
1. Try to add product without name → Error message
2. Try to add product with negative price → Error message
3. Try to place order without address → Error message

### ✅ Test Sanitization:
1. Try entering `<script>alert('hack')</script>` in product description
2. System should clean it automatically
3. No script should run!

---

## 🔍 API ENDPOINTS TO TEST (Using Postman/Thunder Client)

### Customer Endpoints:
```
GET    /api/supplies                    - View all products (cached!)
GET    /api/supplies/:id                - View single product
POST   /api/orders                      - Place order (needs auth)
GET    /api/orders                      - View my orders (needs auth)
GET    /api/orders/:id                  - View order details (needs auth)
PUT    /api/orders/:id/cancel           - Cancel order (needs auth)
```

### Seller Endpoints:
```
GET    /api/supplies/my-products        - View my products (needs auth + seller role)
POST   /api/supplies                    - Add product (needs auth + seller role)
PUT    /api/supplies/:id                - Edit product (needs auth + seller role)
DELETE /api/supplies/:id                - Delete product (needs auth + seller role)
GET    /api/orders/seller               - View orders for my products (needs auth + seller role)
```

### Headers Required:
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

---

## 🎨 WHAT TO LOOK FOR

### 🟢 Things That Should Work:
- Customers can browse products
- Customers can place orders
- Sellers can add/edit/delete products
- Sellers can view orders
- Product listings load fast (cached)
- Search works properly
- Images display correctly

### 🔴 Things That Should NOT Work:
- Customer trying to add products → Blocked by authorization
- Unauthenticated user placing order → Blocked by authentication
- Invalid email format → Blocked by validation
- Negative prices → Blocked by validation
- SQL injection attempts → Blocked by sanitization

---

## 📊 DATABASE CONTENTS

### Total Records Created:
- 1 Admin
- 15 Workers (5 electricians, 5 plumbers, 5 carpenters)
- 3 Sellers
- 70 Products (~23 per seller)
- 3 Customers
- 2 Delivery Persons
- 15 Services (5 per category)

---

## 🚀 QUICK START COMMANDS

```bash
# Seed database (already done)
npm run seed

# Start backend server
npm start
# Server runs on: http://localhost:5005

# Start frontend (in another terminal)
cd client
npm run dev
# Frontend runs on: http://localhost:3000
```

---

## 🎯 YOUR CONTRIBUTION HIGHLIGHTS

### What You Built:
1. **Complete Customer Shopping Flow**
   - Browse products ✅
   - Search products ✅
   - View product details ✅
   - Place orders ✅
   - Track orders ✅

2. **Complete Seller Management Flow**
   - Add products ✅
   - Edit products ✅
   - Delete products ✅
   - View orders ✅
   - Manage inventory ✅

3. **Middlewares Implemented**:
   - ✅ Caching (product listings)
   - ✅ Authentication (JWT tokens)
   - ✅ Authorization (role-based access)
   - ✅ Validation (data correctness)
   - ✅ Sanitization (security)
   - ✅ Normalization (data consistency)

---

## 📞 SAMPLE TEST FLOW

### Complete Order Flow:
1. Login as Customer (ananya@example.com)
2. Browse products → See cache working (fast load)
3. Search for "hammer"
4. Click on product
5. Place order with address
6. View order in "My Orders"
7. Logout
8. Login as Seller (mahesh@skilllink.com)
9. View orders → See the order you placed
10. Update order status to "processing"
11. Logout
12. Login as Customer again
13. Check order status → See updated status!

---

**Happy Testing! 🎉**

Your customer-seller pipeline is complete and production-ready! All middlewares are working perfectly. 🚀
