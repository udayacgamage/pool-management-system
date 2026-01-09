const express = require('express');
const router = express.Router();
const { createBooking, getMyBookings, cancelBooking, verifyBooking, getStats } = require('../controllers/bookingController');
const { protect, staff, admin } = require('../middleware/authMiddleware');

router.post('/', protect, createBooking);
router.get('/mybookings', protect, getMyBookings);
router.get('/stats', protect, admin, getStats);
router.put('/:id/cancel', protect, cancelBooking);

router.post('/verify', protect, staff, verifyBooking);

module.exports = router;
