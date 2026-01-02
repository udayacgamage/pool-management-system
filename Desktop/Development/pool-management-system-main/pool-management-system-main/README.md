# 🏊 USJ Pool Management System

A full-stack MERN application for managing swimming pool operations at the University of Sri Jayewardenepura. This system facilitates slot booking for students, secure access verification for staff, and schedule management for administrators.

## 🚀 Features

### for 👨‍🎓 Students
- **Browse Slots**: View real-time availability of swimming slots.
- **Book Instantly**: One-click booking system.
- **My Bookings**: View booking history and access entry QR codes.
- **Mobile Friendly**: easy to use on mobile devices.

### for 👮 Staff (Pool Attendants)
- **QR Scanner**: Built-in camera scanner to verify student QR codes.
- **Manual Entry**: Verify bookings using a unique reference code.
- **Access Control**: Prevent double-entry or cancelled bookings.

### for 👨‍💼 Admins
- **Admin Dashboard**: Create, delete, and manage pool slots.
- **Capacity Management**: Set limits for each session.
- **Verification Support**: Access to the scanner tool.

---

## 🛠 Tech Stack

- **Frontend**: React.js, Vite, Tailwind CSS v3, React Router v6.
- **Backend**: Node.js, Express.js.
- **Database**: MongoDB (Local or Atlas) with Mongoose.
- **Authentication**: JWT (JSON Web Tokens).

---

## ⚙️ Setup & Installation

### 1. Prerequisites
- Node.js installed.
- MongoDB installed locally OR a MongoDB Atlas connection string.

### 2. Backend Setup
```bash
cd server
npm install

# Create a .env file
# PORT=5000
# MONGO_URI=mongodb://127.0.0.1:27017/usj-pool-local
# JWT_SECRET=your_super_secret_key
# NODE_ENV=development

# Seed Admin User
node create_admin.js

# Start Server
npm run dev
```

### 3. Frontend Setup
```bash
cd client
npm install
npm run dev
```

### 4. Admin Credentials (Default)
- **Email**: `admin@usj.ac.lk`
- **Password**: `password123`

---

## 📱 Usage Guide

1. **Login**: Go to the homepage. Students register; Admins login with credentials above.
2. **Booking**: Students pick a green slot. A red slot means it is full.
3. **Verification**:
   - Students show the QR code from "My Bookings".
   - Staff logs in, goes to "Scanner", scans the code (or enters the text below it).
   - "ACCESS GRANTED" means the student can enter.

## ⚠️ Troubleshooting
- **Database Connection Error**: Ensure MongoDB is running. If using local, run `mongod`. If using cloud, check your `.env` URI.
- **QR Scanner**: Ensure you gave browser camera permissions. If on desktop without a camera, use the Manual Entry code displayed on the student's booking ticket.
