
# 🚀 Deployment Guide: DailyWin AI

This application has two parts:
1.  **Frontend (React/Vite)**: Deployed to **Netlify** (Static Site).
2.  **Backend (Node.js/Express)**: Deployed to **Render.com** (Web Service).

---

## 📅 Part 1: Environment Variables (Keys)

You must add these "Environment Variables" to your hosting dashboard for the app to work.

### 🟢 Frontend (Netlify)
Add these in **Netlify > Site Settings > Environment Variables**:

| Variable Key | Value (Example) | Description |
| :--- | :--- | :--- |
| `VITE_API_URL` | `https://dailywin-backend.onrender.com/api` | **CRITICAL**: The URL of your live backend (see Part 2). |

### 🔵 Backend (Render/Railway)
Add these in **Render > Dashboard > Environment**:

| Variable Key | Value (Example) | Description |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | Optimizes performance. |
| `PORT` | `10000` | Render usually sets this automatically, but safe to add. |
| `DATABASE_URL` | `postgresql://user:pass@host/db` | Your Neon/Supabase DB Connection String (Transaction Pool). |
| `JWT_SECRET` | `your_super_secret_code_123` | Generating login tokens (make this random!). |
| `GROQ_API_KEY` | `gsk_...` | AI Engine API Key. |
| `API_FOOTBALL_KEY` | `da3e...` | RapidAPI Football Key. |
| `PAYSTACK_SECRET_KEY`| `sk_test_...` | For Payments. |
| `EMAIL_USER` | `admin@dailywin.space` | For sending "Welcome to DailyWin" emails. |
| `EMAIL_PASS` | `password` | Password or App Password for the email. |
| `FRONTEND_URL` | `https://dailywin.space` | URL of your Netlify site (for CORS & Redirects). |

---

## 🚀 Part 2: Deployment Steps

### Step 1: Push to GitHub
1.  Create a GitHub Repository.
2.  Push this entire folder to GitHub.

### Step 2: Deploy Backend (Render.com)
1.  Create a **New Web Service** on Render.
2.  Connect your GitHub Repo.
3.  **Root Directory**: `server` (Important!).
4.  **Build Command**: `npm install && npx prisma generate`.
5.  **Start Command**: `npm start` (or `node src/index.js`).
6.  Add the **Environment Variables** listed above.
7.  Click **Deploy**.
8.  **Copy the URL** Render gives you (e.g., `https://dailywin-backend.onrender.com`). You need this for the Frontend!

### Step 3: Deploy Frontend (Netlify)
1.  Create a **New Site from Git** on Netlify.
2.  Connect your GitHub Repo.
3.  **Build Command**: `npm run build`.
4.  **Publish Directory**: `dist`.
5.  **Environment Variables**:
    *   Add `VITE_API_URL` -> Value: `https://dailywin-backend.onrender.com/api` (The URL from Step 2).
6.  Click **Deploy**.

---

## ⚠️ Important Note on Database
Your `DATABASE_URL` must point to a cloud database (like Neon or Supabase), NOT `localhost`. If you are already using Neon (which you are), just copy the same connection string you use locally!
