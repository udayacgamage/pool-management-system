const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get user from the token
            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                return res.status(401).json({ message: 'Not authorized' });
            }

            next();
        } catch (error) {
            console.log(error);
            return res.status(401).json({ message: 'Not authorized' });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};

const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(401);
        throw new Error('Not authorized as an admin');
    }
}

// Updated: Coaches can also act as Staff (to verify students)
const staff = (req, res, next) => {
    if (req.user && (req.user.role === 'staff' || req.user.role === 'admin' || req.user.role === 'coach')) {
        next();
    } else {
        res.status(401);
        throw new Error('Not authorized as staff');
    }
}

const coach = (req, res, next) => {
    if (req.user && (req.user.role === 'coach' || req.user.role === 'admin')) {
        next();
    } else {
        res.status(401);
        throw new Error('Not authorized as a coach');
    }
}

module.exports = { protect, admin, staff, coach };
