const express = require('express');
const router = express.Router();
const { getNotices, createNotice, deleteNotice } = require('../controllers/noticeController');
const { protect, admin, coach } = require('../middleware/authMiddleware');

router.route('/')
    .get(getNotices)
    .post(protect, coach, createNotice);

router.route('/:id')
    .delete(protect, admin, deleteNotice);

module.exports = router;
