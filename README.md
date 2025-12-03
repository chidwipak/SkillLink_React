# 🔧 SkillLink - Complete Home Services & Supplies Platform# SkillLink - Home Services Platform



<div align="center">## 🚀 Quick Start (Single Command)



![SkillLink Banner](https://img.shields.io/badge/SkillLink-Home%20Services%20Platform-blue?style=for-the-badge)1. **Install dependencies** (first time only):

```bash

**A comprehensive platform connecting customers with skilled professionals and quality supplies**npm install

cd client && npm install

[![React](https://img.shields.io/badge/React-18.2.0-61DAFB?style=flat-square&logo=react)](https://reactjs.org/)cd ..

[![Node.js](https://img.shields.io/badge/Node.js-18.x-339933?style=flat-square&logo=node.js)](https://nodejs.org/)```

[![MongoDB](https://img.shields.io/badge/MongoDB-6.0-47A248?style=flat-square&logo=mongodb)](https://www.mongodb.com/)

[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.x-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)2. **Seed the database** (first time only):

```bash

</div>npm run seed

```

---

3. **Run the entire application** (backend + frontend):

## 📖 About SkillLink```bash

npm run dev

SkillLink is a full-stack web application that bridges the gap between:```

- **Customers** seeking home services (electricians, plumbers, carpenters) and supplies

- **Skilled Workers** offering professional servicesThat's it! The application will be available at:

- **Sellers** providing quality hardware and supplies- **Frontend**: http://localhost:3000

- **Delivery Personnel** ensuring timely product deliveries- **Backend API**: http://localhost:3001



The platform features real-time notifications, secure payments, review systems, and comprehensive dashboards for all user types.## 📋 Available Scripts



---- `npm run dev` - Run both backend and frontend concurrently

- `npm run server` - Run only the backend server

## ✨ Key Features- `npm run client` - Run only the frontend

- `npm start` - Run backend in production mode

### 🏠 For Customers- `npm run seed` - Seed the database with sample data

- **Book Professional Services** - Hire verified electricians, plumbers, and carpenters

- **Shop Quality Supplies** - Browse and order electrical, plumbing, and carpentry products## 🔧 Environment Setup

- **Multiple Address Management** - Save and manage multiple delivery/service addresses

- **Real-time Order Tracking** - Track service bookings and product deliveriesCreate `.env` file in the root directory:

- **Review & Rating System** - Rate and review workers, sellers, and products```env

- **Secure Checkout** - Multiple payment options with address selectionMONGODB_URI=mongodb://localhost:27017/skilllink

JWT_SECRET=skilllink-jwt-secret-2025

### 👷 For WorkersPORT=3001

- **Job Management Dashboard** - Accept, manage, and complete service requestsCLIENT_URL=http://localhost:3000

- **Earnings Tracking** - View earnings, completed jobs, and ratings```

- **Profile Management** - Showcase skills, experience, and certifications

- **Location-based Services** - Get jobs based on your service areaCreate `client/.env` file:

```env

### 🏪 For SellersVITE_API_URL=http://localhost:3001/api

- **Product Management** - Add, edit, and manage product listingsVITE_SOCKET_URL=http://localhost:3001

- **Order Processing** - Handle customer orders efficiently```

- **Shop Profile** - Customize shop information and images

- **Sales Analytics** - Track sales, revenue, and customer insights## Login Credentials



### 🚚 For Delivery Personnel### Admin

- **Delivery Dashboard** - View assigned deliveries with route information- Email: admin@skilllink.com

- **Address Details** - See both seller and customer addresses- Password: Admin@123

- **Delivery Status Updates** - Update delivery progress in real-time

### Workers (15 total)

### 👨‍💼 For Administrators- Rajesh Kumar (Electrician) - rajesh@skilllink.com / Worker@123

- **Comprehensive Dashboard** - Overview of platform metrics and analytics- Sunil Sharma (Electrician) - sunil@skilllink.com / Worker@123

- **User Management** - Manage customers, workers, sellers, and delivery personnel- Amit Patel (Electrician) - amit@skilllink.com / Worker@123

- **Revenue Analytics** - Track platform revenue with visual charts- Vikram Singh (Electrician) - vikram@skilllink.com / Worker@123

- **Content Moderation** - Review and manage user-generated content- Pradeep Joshi (Electrician) - pradeep@skilllink.com / Worker@123

- Mohan Das (Plumber) - mohan@skilllink.com / Worker@123

---- Ravi Verma (Plumber) - ravi@skilllink.com / Worker@123

- Sanjay Gupta (Plumber) - sanjay@skilllink.com / Worker@123

## 🛠️ Technology Stack- Prakash Joshi (Plumber) - prakash@skilllink.com / Worker@123

- Karan Malhotra (Plumber) - karan@skilllink.com / Worker@123

### Frontend- Dinesh Tiwari (Carpenter) - dinesh@skilllink.com / Worker@123

| Technology | Purpose |- Ramesh Yadav (Carpenter) - ramesh@skilllink.com / Worker@123

|------------|---------|- Kishore Kumar (Carpenter) - kishore@skilllink.com / Worker@123

| React 18 | UI Library |- Vijay Mishra (Carpenter) - vijay@skilllink.com / Worker@123

| Vite | Build Tool & Dev Server |- Naveen Reddy (Carpenter) - naveen@skilllink.com / Worker@123

| TailwindCSS | Styling Framework |

| Redux Toolkit | State Management |### Sellers (3 total)

| React Router | Navigation |- Mahesh Traders - mahesh@skilllink.com / Seller@123

| Axios | API Requests |- Sharma Hardware - vishal@skilllink.com / Seller@123

| Socket.IO Client | Real-time Features |- Green Solutions - anita@skilllink.com / Seller@123



### Backend### Customers (3 total)

| Technology | Purpose |- Ananya Sharma - ananya@example.com / Customer@123

|------------|---------|- Rohan Mehta - rohan@example.com / Customer@123

| Node.js | Runtime Environment |- Neha Gupta - neha@example.com / Customer@123

| Express.js | Web Framework |

| MongoDB | Database |## Features

| Mongoose | ODM |

| JWT | Authentication |- User registration with validation (name letters only, password min 6 chars with uppercase/number/special char, unique email)

| Socket.IO | Real-time Communication |- Service booking system

| Multer | File Uploads |- Product ordering system

| Nodemailer | Email Services |- Worker dashboard with job management and pricing

- Seller dashboard with product and order management

---- Customer dashboard with orders, bookings, and reviews

- Admin dashboard with analytics and charts

## 🚀 Quick Start- Review and rating system for workers and sellers

- Real-time notifications

### Prerequisites- Multiple address management

- Node.js 18.x or higher- Dynamic charts (revenue, ratings, job distribution)

- MongoDB 6.0 or higher (local or Atlas)

- npm or pnpm## Project Structure



### Installation- app.js - Main server file

- seed.js - Database seeding script

1. **Clone the repository**- routes/ - Express route handlers

```bash- controllers/ - Business logic

git clone https://github.com/chidwipak/SkillLink_React.git- models/ - MongoDB models

cd SkillLink_React- views/ - EJS templates

```- public/ - Static files (CSS, JS, images)



2. **Install dependencies**## Seeded Data

```bash

npm install- 1 Admin user

cd client && npm install- 15 Workers (5 electricians, 5 plumbers, 5 carpenters)

cd ..- 3 Sellers with different categories

```- 15 Services per category (electrician, plumber, carpenter)

- 45 Products (15 per category for each seller)

3. **Configure environment variables**- 3 Customer users



Create `.env` in the root directory:## Technologies

```env

MONGODB_URI=mongodb://localhost:27017/skilllink- Node.js

JWT_SECRET=skilllink-jwt-secret-2025- Express.js

PORT=3001- MongoDB

CLIENT_URL=http://localhost:3000- EJS

```- Bootstrap 5

- Chart.js

Create `client/.env`:
```env
VITE_API_URL=http://localhost:3001/api
VITE_SOCKET_URL=http://localhost:3001
```

4. **Seed the database** (first time only)
```bash
npm run seed
```

5. **Start the application**
```bash
npm run dev
```

🎉 **That's it!** The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001

---

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Run both backend and frontend concurrently |
| `npm run server` | Run only the backend server |
| `npm run client` | Run only the frontend |
| `npm start` | Run backend in production mode |
| `npm run seed` | Seed the database with sample data |

---

## 🔐 Demo Credentials

### Admin Account
| Email | Password |
|-------|----------|
| admin@skilllink.com | Admin@123 |

### Sample Worker Accounts
| Name | Category | Email | Password |
|------|----------|-------|----------|
| Rajesh Kumar | Electrician | rajesh@skilllink.com | Worker@123 |
| Mohan Das | Plumber | mohan@skilllink.com | Worker@123 |
| Dinesh Tiwari | Carpenter | dinesh@skilllink.com | Worker@123 |

### Sample Seller Accounts
| Shop Name | Email | Password |
|-----------|-------|----------|
| Mahesh Traders | mahesh@skilllink.com | Seller@123 |
| Sharma Hardware | vishal@skilllink.com | Seller@123 |
| Green Solutions | anita@skilllink.com | Seller@123 |

### Sample Customer Accounts
| Name | Email | Password |
|------|-------|----------|
| Ananya Sharma | ananya@example.com | Customer@123 |
| Rohan Mehta | rohan@example.com | Customer@123 |
| Neha Gupta | neha@example.com | Customer@123 |

---

## 📁 Project Structure

```
SkillLink/
├── app.js                 # Main server entry point
├── socket.js              # Socket.IO configuration
├── seed.js                # Database seeding script
├── package.json           # Backend dependencies
│
├── client/                # React Frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── layouts/       # Layout components
│   │   ├── store/         # Redux store & slices
│   │   ├── services/      # API service functions
│   │   ├── utils/         # Utility functions
│   │   └── styles/        # Global styles
│   ├── public/            # Static assets
│   └── package.json       # Frontend dependencies
│
├── controllers/           # Route controllers/handlers
├── models/                # MongoDB/Mongoose models
├── routes/                # Express route definitions
├── middleware/            # Custom middleware
├── utils/                 # Backend utilities
└── public/                # Static files & uploads
    ├── images/            # Static images
    └── uploads/           # User uploaded files
```

---

## 🌟 Key Highlights

### 🎨 Modern UI/UX
- Animated hero carousel with auto-sliding (3 slides for Services, Supplies, Partner)
- Responsive design for all devices
- Smooth transitions and hover effects
- Professional color scheme

### 🔔 Real-time Features
- Instant notifications for orders, bookings, and updates
- Live status updates for deliveries
- Socket.IO powered real-time communication

### 🔒 Security
- JWT-based authentication
- Password hashing with bcrypt
- Input validation and sanitization
- Rate limiting for API protection

### 📊 Analytics
- Revenue tracking with visual charts
- User activity analytics
- Performance metrics for workers and sellers

---

## 👥 Team

This project was developed by:
- **Chidwipak** - Full Stack Development
- **Kainuru Balaji** - Backend Development
- **Kunda Sriman** - Frontend Development
- **Jeevan Kumar Kotati** - Database & API
- **Ajjapagu Praneeth** - UI/UX & Testing

---

## 📄 License

This project is developed for educational purposes.

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

<div align="center">

**Made with ❤️ by the SkillLink Team**

</div>
