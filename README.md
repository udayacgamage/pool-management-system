# 🏊 USJ Pool Management System

A full-stack MERN application for managing swimming pool operations at the University of Sri Jayewardenepura. This system facilitates slot booking for students, secure access verification for staff, and schedule management for administrators, now with automated email notifications.

## 🚀 Key Features

### 📧 Automated Email Notifications (NEW)
- **Instant Confirmation**: Students receive an email immediately after booking.
- **Cancellation Alerts**: Notification sent upon booking cancellation.
- **Smart Reminders**: Automated cron job sends reminders 1 hour before the slot starts.
- **Admin Broadcasts**: New notices posted by admins are automatically emailed to all students.

### 👨‍🎓 Student Dashboard
- **Calendar Booking**: Visual calendar to check availability and book slots instantly.
- **My Bookings**: View active bookings and history (auto-hides expired cancelled slots).
- **Digital ID Card**: Auto-generated QR Code card for facility access (Downloadable).
- **Profile Management**: Upload and update profile pictures.
- **Real-time Notices**: View important announcements from the admin.

### 🏊‍♂️ Coach Dashboard
- **Schedule View**: View assigned slots and shifts.
- **QR Scanner**: Integrated `html5-qrcode` scanner for verifying student IDs.
- **Attendance Tracking**: Scanning a code verifies the booking and marks attendance in the database.

### 👨‍💼 Admin Dashboard
- **Notice Management**: Create and delete notices (with email broadcast).
- **Holiday Management**: Block out dates for pool maintenance or holidays.
- **Coach Allocations**: Assign coaches to specific time slots.
- **Slot Management**: Create, delete, and manage pool slots and capacities.

---

## 🛠 Tech Stack

- **Frontend**: React.js, Vite, Tailwind CSS v3, React Router v6
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Local or Atlas) with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **Email Service**: Nodemailer (SMTP), Node-Cron (Scheduling)
- **Utilities**: Multer (File Uploads), HTML5-QRCode (Scanner)

---

## ⚙️ Setup & Installation

### 1. Prerequisites
- Node.js installed.
- MongoDB installed locally OR a MongoDB Atlas connection string.

### 2. Backend Setup
```bash
cd server
npm install

# Create a .env file in /server with the following:
# PORT=5000
# MONGO_URI=mongodb://127.0.0.1:27017/usj-pool-local
# JWT_SECRET=your_super_secret_key
# NODE_ENV=development
#
# # Email Configuration (Gmail App Password)
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USER=usjppool@gmail.com
# SMTP_PASS=ihnpdwqzlvyqiegf
# SMTP_EMAIL=usjppool@gmail.com

# Seed Admin & Data
node create_admin.js
node seeder.js

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

## 📱 Usage Flow

1.  **Registration**: Students register an account and upload a profile picture.
2.  **Booking**: Students select a date on the calendar, choose a slot, and confirm. An email is sent instantly.
3.  **Entry**:
    *   Student opens "My Bookings" -> "View QR".
    *   Coach logs in, opens "Scanner", and scans the code.
    *   System verifies the valid booking for the current time.
4.  **Notices**: Admins post notices about pool closures or events, which are broadcasted to all students via email.

## ⚠️ Troubleshooting
-   **Email Errors**: Ensure you are using an **App Password** for Gmail, not your regular password.
-   **Scanner Issues**: Ensure browser permissions for the camera are enabled.
-   **Database**: Verify MongoDB service is running (`mongod`).
