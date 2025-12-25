const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const colors = require('colors');
const connectDB = require('./config/db');
dotenv.config({ path: path.resolve(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/slots', require('./routes/slotRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));

// Database Connection
connectDB();

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