const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { generateUniqueQrCode } = require('../utils/qr');

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    const { name, email, password } = req.body; // Removed role from destructuring

    try {
        if (!name || !email || !password) {
            res.status(400);
            throw new Error('Please add all fields');
        }

        // Check if user exists
        const userExists = await User.findOne({ email });

        if (userExists) {
            res.status(400);
            throw new Error('User already exists');
        }

        // Generate unique uppercase QR Code
        const qrCode = await generateUniqueQrCode();

        // Create user
        const user = await User.create({
            name,
            email,
            password,
            role: 'student', // Force role to student for public registration
            qrCode
        });

        if (user) {
            res.status(201).json({
                _id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                specialization: user.specialization,
                qrCode: user.qrCode,
                profilePic: user.profilePic,
                token: generateToken(user._id),
            });
        } else {
            res.status(400);
            throw new Error('Invalid user data');
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check for user email
        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                specialization: user.specialization,
                qrCode: user.qrCode, // return the same QR code
                profilePic: user.profilePic,
                token: generateToken(user._id),
            });
        } else {
            res.status(401);
            throw new Error('Invalid credentials');
        }
    } catch (error) {
        res.status(401).json({ message: error.message });
    }
};

// @desc    Get user data
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        res.status(200).json({
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            specialization: user.specialization,
            specialization: user.specialization,
            qrCode: user.qrCode, // added
            profilePic: user.profilePic,
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get all users (Admin only)
// @route   GET /api/auth/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password');
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete user (Admin only)
// @route   DELETE /api/auth/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user) {
            if (user.role === 'admin') {
                res.status(400);
                throw new Error('Cannot delete admin user');
            }
            await User.deleteOne({ _id: user._id });
            res.status(200).json({ message: 'User removed' });
        } else {
            res.status(404);
            throw new Error('User not found');
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Public list of coaches
// @route   GET /api/auth/coaches
// @access  Public
const getCoaches = async (req, res) => {
    try {
        const coaches = await User.find({ role: 'coach' })
            .select('name email specialization');
        res.status(200).json(coaches);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Upload profile picture
// @route   POST /api/auth/upload
// @access  Private
const uploadProfilePic = async (req, res) => {
    try {
        if (!req.file) {
            res.status(400);
            throw new Error('No file uploaded');
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            res.status(404);
            throw new Error('User not found');
        }

        // Save relative path to DB
        user.profilePic = `/uploads/${req.file.filename}`;
        await user.save();

        res.status(200).json({
            message: 'Profile picture uploaded successfully',
            filePath: user.profilePic
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = {
    registerUser,
    loginUser,
    getMe,
    getAllUsers,
    deleteUser,
    deleteUser,
    getCoaches,
    uploadProfilePic
};
