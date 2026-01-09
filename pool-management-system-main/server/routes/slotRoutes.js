const express = require('express');
const router = express.Router();
const { getSlots, createSlot, deleteSlot, getCoachSlots } = require('../controllers/slotController');
const { protect, admin, coach } = require('../middleware/authMiddleware');

// Public route to view slots (or protected depending on requirements)
// Let's make viewing slots available to logged in users
router.get('/', protect, getSlots);

// Coach route to view today's schedule
router.get('/today', protect, coach, getCoachSlots);

// Admin only routes (will add admin auth later)
router.post('/', protect, admin, createSlot);
router.delete('/:id', protect, admin, deleteSlot);

module.exports = router;
