# 🚀 Zenora Dental | Production Deployment Guide

This step-by-step guide explains how to deploy the **Zenora Dental** suite to cloud providers so your clinic (or your clients) can access it live on the web with a custom domain.

---

## 🏗️ Architecture Overview
Zenora Dental consists of 3 distinct parts:
1. **Backend API (`/backend`):** Node.js Express server + MongoDB. Best deployed on **Render**, **Railway**, or **Heroku**.
2. **Admin Dashboard (`/ZENORA ADMIN`):** React SPA built with Vite. Best deployed on **Vercel** or **Netlify**.
3. **Patient Frontend (`/ZEMORA DENTAL`):** Static HTML/CSS/JS web portal. Best deployed on **Vercel** or **Netlify**.

---

## ⚡ Step 1: Deploying the Backend API (Render.com - Recommended Free/Cheap)

1. Push your project code to a private GitHub repository.
2. Go to [Render.com](https://render.com) and create a new **Web Service**.
3. Connect your GitHub repository.
4. Configure the build settings:
   - **Root Directory:** `backend`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
5. Under **Environment Variables**, add the following:
   - `PORT`: `10000` (or leave default)
   - `MONGODB_URI`: Your MongoDB Atlas live production connection string.
   - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM_EMAIL`: Your live SMTP email server credentials.
6. Click **Create Web Service**. Once built, copy the live URL (e.g., `https://zenora-backend.onrender.com`).

---

## 🖥️ Step 2: Deploying the Admin Dashboard (Vercel)

1. Before deploying, update the API base URLs inside your React components (or configure an `.env.production` file) so that fetch calls point to your live backend URL instead of `http://localhost:3001`.
2. Go to [Vercel.com](https://vercel.com) and click **Add New > Project**.
3. Import your GitHub repository.
4. Configure the project settings:
   - **Framework Preset:** `Vite`
   - **Root Directory:** `ZENORA ADMIN`
5. Click **Deploy**. Vercel will automatically build the static bundle (`npm run build`) and give you a live URL (e.g., `https://zenora-admin.vercel.app`).

---

## 🌐 Step 3: Deploying the Patient Frontend (Vercel / Netlify)

1. Make sure any `fetch()` calls inside `ZEMORA DENTAL/assets/js/booking.js` point to your live backend URL (e.g., `https://zenora-backend.onrender.com/api/book`).
2. On Vercel or Netlify, import the exact same GitHub repository again.
3. Configure settings:
   - **Root Directory:** `ZEMORA DENTAL`
   - **Framework Preset:** `Other` (Static HTML)
4. Click **Deploy**. You will receive your public-facing URL (e.g., `https://zenora-dental.vercel.app`).

---

## 🔗 Step 4: Attaching a Custom Domain

To give your clinic a professional web presence (e.g., `www.zenoradental.com`):
1. Buy your domain on Namecheap, GoDaddy, or Cloudflare.
2. In your Vercel project settings for the **Patient Frontend**, go to **Domains** and enter `www.zenoradental.com`.
3. Vercel will provide you with DNS records (usually a CNAME or A Record).
4. Paste those records into your domain registrar's DNS settings.
5. For the admin portal, you can attach a subdomain like `admin.zenoradental.com` to your Vercel Admin dashboard project!
