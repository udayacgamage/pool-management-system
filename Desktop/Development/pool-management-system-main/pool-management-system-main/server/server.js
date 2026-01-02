const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const colors = require('colors');
const connectDB = require('./config/db');
const initReminderJob = require('./jobs/reminderJob');

dotenv.config({ path: path.resolve(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from uploads folder
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/slots', require('./routes/slotRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/notices', require('./routes/noticeRoutes'));
app.use('/api/holidays', require('./routes/holidayRoutes'));
app.use('/api/coach-allocations', require('./routes/coachRoutes'));

// Database Connection
console.log('Attempting to connect to DB... (Restart Triggered)');
connectDB().then(() => {
  // Start Cron Jobs
  initReminderJob();
}).catch(err => {
  console.error(`DB connection failed: ${err.message}`);
});

// Basic Route
app.get('/', (req, res) => {
  res.json({ message: 'Pool Management System API is operational' });
});

// Export for Vercel
module.exports = app;

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`.yellow.bold);
  });
}