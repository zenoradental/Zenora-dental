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
```
Create a `.env` file in the `backend` folder:
```env
PORT=3001
MONGODB_URI=your_mongodb_connection_string
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM_EMAIL="Zenora Dental <your_email@gmail.com>"
```
Start the backend server:
```bash
npm start
```

### 2. Setup Admin Dashboard
```bash
cd "ZENORA ADMIN"
npm install
npm run dev
```

### 3. Open Patient Frontend
Simply serve the `ZEMORA DENTAL` folder using any static server (like VS Code Live Server, Nginx, or Vercel).

---

## 📄 License & Commercial Terms
This software is packaged as a complete commercial template ready for deployment. Feel free to re-skin, customize, and deploy for your clinic clients!
