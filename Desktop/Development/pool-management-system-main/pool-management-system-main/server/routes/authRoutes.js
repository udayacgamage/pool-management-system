const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getMe, getAllUsers, deleteUser, getCoaches, uploadProfilePic } = require('../controllers/authController');
const upload = require('../middleware/uploadMiddleware');
const { protect, admin } = require('../middleware/authMiddleware');

// Public
router.get('/coaches', getCoaches);
router.post('/upload', protect, upload.single('profilePic'), uploadProfilePic);

// Auth
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.get('/users', protect, admin, getAllUsers);
router.delete('/users/:id', protect, admin, deleteUser);

module.exports = router;
