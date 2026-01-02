const express = require('express');
const router = express.Router();
const { createBooking, getMyBookings, cancelBooking, verifyBooking, getStats } = require('../controllers/bookingController');
const { protect, staff, admin, coach } = require('../middleware/authMiddleware');

router.post('/', protect, createBooking);
router.get('/mybookings', protect, getMyBookings);
router.get('/stats', protect, admin, getStats);
router.put('/:id/cancel', protect, cancelBooking);

router.post('/verify', protect, coach, verifyBooking);

module.exports = router;
