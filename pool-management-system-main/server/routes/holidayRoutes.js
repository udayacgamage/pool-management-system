const express = require('express');
const router = express.Router();
const { getHolidays, createHoliday, deleteHoliday } = require('../controllers/holidayController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
    .get(getHolidays)
    .post(protect, admin, createHoliday);

router.route('/:id')
    .delete(protect, admin, deleteHoliday);

module.exports = router;
