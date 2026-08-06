# 🦷 Zenora Dental | Enterprise Clinic Management & Booking Platform

**Zenora Dental** is a state-of-the-art, full-stack web application designed specifically for modern dental clinics, healthcare providers, and medical practices. It combines a conversion-optimized patient booking portal with a powerful, real-time React admin dashboard and an automated Express/MongoDB backend.

---

## ✨ Key Features & Selling Points

### 🌟 For the Patient (Frontend)
- **Ultra-Modern & Responsive Design:** Built with clean HTML5, modern CSS variables, and glassmorphism aesthetics that build trust and elevate brand perception.
- **Mobile-First Optimization:** Fluid layouts, touch-friendly booking flows, and responsive typography ensuring a seamless experience on smartphones, tablets, and desktops.
- **Interactive Appointment Booking:** Patients can effortlessly select their preferred service, doctor, date, and time.
- **Instant Booking Tracking:** Patients receive a unique Tracking ID to check their appointment status at any time.

### 🛡️ For the Clinic Admin (React Dashboard)
- **Real-Time Appointment Management:** A sleek React SPA dashboard built with TailwindCSS and Lucide Icons.
- **Live Filtering & Search:** Quickly filter appointments by Status (Pending, Confirmed, Completed, Cancelled) or search by Patient Name, ID, or Phone.
- **Smart Doctor Assignment:** Easily assign specific doctors to pending appointments with a single click.
- **📄 Smart Invoice & Receipt Generator:** Generate professional, branded PDF invoices and receipts directly in the browser using `jsPDF`. Add line items, calculate taxes, and download instantly.
- **📊 Excel CSV Export:** Export filtered patient data securely formatted for Microsoft Excel with raw-text phone numbers and proper date handling.

### ⚡ Under the Hood (Backend & Architecture)
- **Node.js & Express API:** Lightweight, RESTful backend server architecture.
- **MongoDB Database:** Scalable NoSQL database storing appointments, patient histories, and doctor schedules.
- **Automated Email Notifications:** Integrated `Nodemailer` engine that automatically sends beautifully styled HTML emails to patients upon booking confirmation, status updates, or doctor assignments.

---

## 🛠️ Tech Stack

- **Frontend:** HTML5, Modern CSS3 (Vanilla), JavaScript (ES6+), Lucide Icons
- **Admin Dashboard:** React 18, TypeScript, TailwindCSS, Vite, jsPDF, Lucide React
- **Backend:** Node.js, Express.js, Cors, Nodemailer
- **Database:** MongoDB Atlas / Mongoose ODM

---

## 🚀 Quick Start & Installation

### Prerequisites
- Node.js (v18 or higher)
- MongoDB Cluster (Atlas or Local)

### 1. Setup Backend API
```bash
cd backend
npm install
cp .env.example .env
```

Fill in `.env`. `MONGODB_URI`, `JWT_SECRET`, `ALLOWED_ORIGINS` and `FRONTEND_URL` are
required — every authenticated API route rejects all requests without `JWT_SECRET`,
and all cross-origin browser requests are refused without `ALLOWED_ORIGINS`.
`backend/.env.example` documents every key.

Generate a signing secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Start the backend server:
```bash
npm start
```

**On first run against an empty database**, the server creates a Master Admin with a
randomly generated password and prints it once, inside a `SAVE THIS NOW — SHOWN ONLY
ONCE` banner. It is stored only as a bcrypt hash and cannot be recovered afterwards.
You are forced to change it at first login. There are no default credentials.

If you are pointing at a database that predates password hashing, run once:
```bash
node migrate-passwords.js
```

### 2. Setup Admin Dashboard
```bash
cd "ZENORA ADMIN"
npm install
cp .env.example .env.local
npm run dev
```

Set `VITE_API_BASE_URL` to your backend origin, and add the dashboard's origin
(`http://localhost:5173` in dev) to the backend's `ALLOWED_ORIGINS`.

### 3. Open Patient Frontend
Serve the `ZEMORA DENTAL` folder using any static server (VS Code Live Server, Nginx,
or Vercel), and add its origin to the backend's `ALLOWED_ORIGINS` too.

### 4. Seed demo data (optional)
```bash
cd backend
node reset-demo.js
```
Replaces visible appointments with ~12 obviously-fake records spread across today and
the next few days. Soft-deletes the existing ones so the change is reversible; pass
`--hard` for a real purge.

---

## 🔐 Security notes

- Every `/api/*` route requires an `Authorization: Bearer <jwt>` header **except**
  `POST /api/appointments` (patients book), `GET /api/appointments/:id` (requires a
  matching `phone` query parameter), `GET /api/availability`, `POST /api/auth/login`,
  and `POST /api/inbound` (gate this with `INBOUND_WEBHOOK_SECRET`).
- `/api/admins/*` and `PATCH /api/settings` additionally require the `Master Admin`
  role, read from the verified JWT — never from the request body.
- Passwords are bcrypt-hashed at cost factor 12 and compared case-sensitively.
- Deletes are soft: `deletedAt` is set and the document is retained. See
  `DEPLOY_CLINIC.md` for recovery queries.
- Every status change, doctor assignment, edit, delete and price change is written to
  an `auditlogs` collection, readable at `GET /api/audit-log` as a Master Admin.

Full deployment, backup and restore procedure: **[DEPLOY_CLINIC.md](DEPLOY_CLINIC.md)**.

---

## 📄 License & Commercial Terms
This software is packaged as a complete commercial template ready for deployment. Feel free to re-skin, customize, and deploy for your clinic clients!
