const express = require('express');
const router = express.Router();
const { getAllocations, createAllocation, deleteAllocation } = require('../controllers/coachController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
    .get(getAllocations)
    .post(protect, admin, createAllocation);

router.route('/:id')
    .delete(protect, admin, deleteAllocation);

module.exports = router;
