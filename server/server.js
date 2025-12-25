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

// Basic Route
app.get('/', (req, res) => {
  res.send('Pool Management System API is running...');
});

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT}`.yellow.bold);
    });
  } catch (err) {
    console.error('Failed to start server:'.red, err);
    process.exit(1);
  }
};

startServer();