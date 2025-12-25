const express = require('express');
const router = express.Router();
const {
    registerUser,
    loginUser,
    getMe,
    getAllUsers,
    deleteUser
} = require('../controllers/authController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.get('/users', protect, admin, getAllUsers);
router.delete('/users/:id', protect, admin, deleteUser);

module.exports = router;
