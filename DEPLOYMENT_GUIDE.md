# SkillLink Deployment Guide

## Architecture
- **Frontend**: React (Vite) → Deploy on **Vercel**
- **Backend**: Express.js API → Deploy on **Render**
- **Database**: MongoDB → **MongoDB Atlas** (free tier)
- **Cache**: Redis → **Redis Cloud** (free tier) or skip (auto-fallback to in-memory)

---

## Step 1: MongoDB Atlas Setup

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster (M0 Sandbox)
3. Create a database user with password
4. Whitelist all IPs: `0.0.0.0/0` (for Render access)
5. Get your connection string: `mongodb+srv://user:pass@cluster.xxxxx.mongodb.net/skilllink`

## Step 2: Deploy Backend on Render

1. Go to [render.com](https://render.com) and connect your GitHub repo
2. Create a **New Web Service**
3. Configure:
   - **Build Command**: `npm install`
   - **Start Command**: `node app.js`
   - **Environment Variables**:
     ```
     NODE_ENV=production
     PORT=5005
     MONGODB_URI=mongodb+srv://user:pass@cluster.xxxxx.mongodb.net/skilllink
     JWT_SECRET=your-strong-secret-key
     CLIENT_URL=https://your-app.vercel.app
     ```
4. Deploy and note the URL (e.g., `https://skilllink-backend.onrender.com`)

## Step 3: Seed the Database

After backend is deployed, seed data using:
```bash
# Set env variable and run seed
MONGODB_URI=mongodb+srv://user:pass@cluster.xxxxx.mongodb.net/skilllink node seed.js
```

## Step 4: Deploy Frontend on Vercel

1. Go to [vercel.com](https://vercel.com) and import your GitHub repo
2. Set **Root Directory** to `client`
3. Framework: **Vite**
4. **Environment Variables**:
   ```
   VITE_API_BASE_URL=https://skilllink-backend.onrender.com
   ```
5. Deploy

## Step 5: Update CORS

After both are deployed, update the backend's `CLIENT_URL` environment variable on Render to match your Vercel frontend URL.

---

## Docker Deployment (Alternative)

```bash
# Clone the repo
git clone <your-repo-url>
cd SkillLink_React_31stmarch2026

# Start all services
docker-compose up -d

# Seed database
docker exec skilllink-backend node seed.js

# Access:
# Frontend: http://localhost
# Backend API: http://localhost:5005
# Swagger docs: http://localhost:5005/api-docs
```

---

## Test Accounts (after seeding)

| Role     | Email                    | Password   |
|----------|--------------------------|------------|
| Admin    | admin@skilllink.com      | admin123   |
| Customer | customer@skilllink.com   | password123|
| Worker   | worker@skilllink.com     | password123|
| Seller   | seller@skilllink.com     | password123|
| Delivery | delivery@skilllink.com   | password123|
| Verifier | verifier@skilllink.com   | password123|

---

## API Documentation

Swagger UI is available at: `{BACKEND_URL}/api-docs`

## CI/CD Pipeline

GitHub Actions runs automatically on push to `main` or `develop`:
- Runs all unit tests
- Generates coverage report
- Verifies Docker builds
- Checks for vulnerabilities
