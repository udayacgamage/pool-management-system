// Server Entry Point - Updated for Vercel Deployment
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
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true
}));
app.use(express.json());

// Health Check (No DB required)
app.get('/ping', (req, res) => res.status(200).send('pong'));

// Serve static files from uploads folder
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/slots', require('./routes/slotRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/notices', require('./routes/noticeRoutes'));
app.use('/api/holidays', require('./routes/holidayRoutes'));
app.use('/api/coach-allocations', require('./routes/coachRoutes'));
app.use('/api/contact', require('./routes/contactRoutes'));

// Database Connection Middleware (Better for Vercel/Serverless)
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error(`DB Connection Error: ${error.message}`);
    res.status(500).json({ error: 'Database connection failed', details: error.message });
  }
});

/* 
// Old connection method - disabled for serverless stability
connectDB().then(() => {
  // Start Cron Jobs (Disabled for Serverless/Vercel)
  // initReminderJob(); 
}).catch(err => {
  console.error(`DB connection failed: ${err.message}`);
}); 
*/

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