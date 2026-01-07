// Server Entry Point - Updated for Vercel Deployment
const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const colors = require('colors');
const connectDB = require('./config/db');
// const initReminderJob = require('./jobs/reminderJob');

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

// Database Connection Middleware (Must run before routes)
// Ensures handlers don't execute before MongoDB is connected.
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error(`DB Connection Error: ${error.message}`);
    res.status(500).json({ error: 'Database connection failed', details: error.message });
  }
});

// Serve static files (Check if exists first to avoid crashes)
const fs = require('fs');
const uploadsDir = path.join(__dirname, '/uploads');
if (fs.existsSync(uploadsDir)) {
  app.use('/uploads', express.static(uploadsDir));
}

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/slots', require('./routes/slotRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/notices', require('./routes/noticeRoutes'));
app.use('/api/holidays', require('./routes/holidayRoutes'));
app.use('/api/coach-allocations', require('./routes/coachRoutes'));
app.use('/api/contact', require('./routes/contactRoutes'));

const { initSlotGenerationJob, generateSlots } = require('./jobs/slotGenerationJob');

/* 
// Old connection method - disabled for serverless stability
connectDB().then(() => {
  // Start Cron Jobs (Disabled for Serverless/Vercel)
  // initReminderJob(); 
  initSlotGenerationJob();
  
  // DEV: Run once immediately to populate data for review
  console.log('Triggering initial slot check...');
  generateSlots();
}).catch(err => {
  console.error(`DB connection failed: ${err.message}`);
}); 
*/

// For Vercel/Serverless adaptations, we might need a HTTP endpoint to trigger these cron jobs 
// if actual background processes aren't supported. 
// However, assuming this runs as a standard Node server locally:
if (process.env.NODE_ENV !== 'production') {
  // Re-enable DB connection for local dev to support cron jobs
  connectDB().then(() => {
    // initReminderJob();
    initSlotGenerationJob();
    // Run once on startup to ensure data exists for the user immediately
    generateSlots();
  });
}

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