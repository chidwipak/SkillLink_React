# SkillLink - Home Services Platform

## 🚀 Quick Start (Single Command)

1. **Install dependencies** (first time only):
```bash
npm install
cd client && npm install
cd ..
```

2. **Seed the database** (first time only):
```bash
npm run seed
```

3. **Run the entire application** (backend + frontend):
```bash
npm run dev
```

That's it! The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001

## 📋 Available Scripts

- `npm run dev` - Run both backend and frontend concurrently
- `npm run server` - Run only the backend server
- `npm run client` - Run only the frontend
- `npm start` - Run backend in production mode
- `npm run seed` - Seed the database with sample data

## 🔧 Environment Setup

Create `.env` file in the root directory:
```env
MONGODB_URI=mongodb://localhost:27017/skilllink
JWT_SECRET=skilllink-jwt-secret-2025
PORT=3001
CLIENT_URL=http://localhost:3000
```

Create `client/.env` file:
```env
VITE_API_URL=http://localhost:3001/api
VITE_SOCKET_URL=http://localhost:3001
```

## Login Credentials

### Admin
- Email: admin@skilllink.com
- Password: Admin@123

### Workers (15 total)
- Rajesh Kumar (Electrician) - rajesh@skilllink.com / Worker@123
- Sunil Sharma (Electrician) - sunil@skilllink.com / Worker@123
- Amit Patel (Electrician) - amit@skilllink.com / Worker@123
- Vikram Singh (Electrician) - vikram@skilllink.com / Worker@123
- Pradeep Joshi (Electrician) - pradeep@skilllink.com / Worker@123
- Mohan Das (Plumber) - mohan@skilllink.com / Worker@123
- Ravi Verma (Plumber) - ravi@skilllink.com / Worker@123
- Sanjay Gupta (Plumber) - sanjay@skilllink.com / Worker@123
- Prakash Joshi (Plumber) - prakash@skilllink.com / Worker@123
- Karan Malhotra (Plumber) - karan@skilllink.com / Worker@123
- Dinesh Tiwari (Carpenter) - dinesh@skilllink.com / Worker@123
- Ramesh Yadav (Carpenter) - ramesh@skilllink.com / Worker@123
- Kishore Kumar (Carpenter) - kishore@skilllink.com / Worker@123
- Vijay Mishra (Carpenter) - vijay@skilllink.com / Worker@123
- Naveen Reddy (Carpenter) - naveen@skilllink.com / Worker@123

### Sellers (3 total)
- Mahesh Traders - mahesh@skilllink.com / Seller@123
- Sharma Hardware - vishal@skilllink.com / Seller@123
- Green Solutions - anita@skilllink.com / Seller@123

### Customers (3 total)
- Ananya Sharma - ananya@example.com / Customer@123
- Rohan Mehta - rohan@example.com / Customer@123
- Neha Gupta - neha@example.com / Customer@123

## Features

- User registration with validation (name letters only, password min 6 chars with uppercase/number/special char, unique email)
- Service booking system
- Product ordering system
- Worker dashboard with job management and pricing
- Seller dashboard with product and order management
- Customer dashboard with orders, bookings, and reviews
- Admin dashboard with analytics and charts
- Review and rating system for workers and sellers
- Real-time notifications
- Multiple address management
- Dynamic charts (revenue, ratings, job distribution)

## Project Structure

- app.js - Main server file
- seed.js - Database seeding script
- routes/ - Express route handlers
- controllers/ - Business logic
- models/ - MongoDB models
- views/ - EJS templates
- public/ - Static files (CSS, JS, images)

## Seeded Data

- 1 Admin user
- 15 Workers (5 electricians, 5 plumbers, 5 carpenters)
- 3 Sellers with different categories
- 15 Services per category (electrician, plumber, carpenter)
- 45 Products (15 per category for each seller)
- 3 Customer users

## Technologies

- Node.js
- Express.js
- MongoDB
- EJS
- Bootstrap 5
- Chart.js
