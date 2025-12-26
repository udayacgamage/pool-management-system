const Booking = require('../models/Booking');
const Slot = require('../models/Slot');
const User = require('../models/User');
const { generateUniqueQrCode } = require('../utils/qr');

// @desc    Book a slot
// @route   POST /api/bookings
// @access  Private
const createBooking = async (req, res) => {
    try {
        const { slotId } = req.body;
        const userId = req.user.id;

        // Load slot once
        const slot = await Slot.findById(slotId);
        if (!slot) {
            res.status(404);
            throw new Error('Slot not found');
        }

        // Capacity check
        if (slot.bookings.length >= slot.capacity) {
            res.status(400);
            throw new Error('Slot is fully booked');
        }

        // Prevent duplicate booking
        const existingBooking = await Booking.findOne({ user: userId, slot: slotId });
        if (existingBooking) {
            res.status(400);
            throw new Error('You have already booked this slot');
        }

        // Ensure persistent QR (legacy users)
        if (!req.user.qrCode) {
            const newQr = await generateUniqueQrCode();
            await User.findByIdAndUpdate(userId, { qrCode: newQr });
            req.user.qrCode = newQr;
        }

        // Create booking using user QR
        const booking = await Booking.create({
            user: userId,
            slot: slotId,
            qrCodeData: req.user.qrCode,
        });

        // Update slot bookings
        slot.bookings.push(userId);
        await slot.save();

        res.status(200).json(booking);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get logged in user bookings
// @route   GET /api/bookings/mybookings
// @access  Private
const getMyBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ user: req.user.id })
            .populate('slot')
            .sort({ createdAt: -1 });
        res.status(200).json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Cancel booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private
const cancelBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            res.status(404);
            throw new Error('Booking not found');
        }

        // Ensure user owns booking
        if (booking.user.toString() !== req.user.id) {
            res.status(401);
            throw new Error('Not authorized to cancel this booking');
        }

        if (booking.status === 'cancelled') {
            res.status(400);
            throw new Error('Booking already cancelled');
        }

        // Update booking status
        booking.status = 'cancelled';
        await booking.save();

        // Remove from slot
        const slot = await Slot.findById(booking.slot);
        if (slot) {
            slot.bookings = slot.bookings.filter(id => id.toString() !== req.user.id);
            await slot.save();
        }

        res.status(200).json(booking);

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

const verifyBooking = async (req, res) => {
    const { qrCodeData, bookingId } = req.body;

    try {
        let booking;

        if (bookingId) {
            booking = await Booking.findById(bookingId).populate('user').populate('slot');
        } else if (qrCodeData) {
            // Resolve user by their unique, uppercase QR code
            const code = String(qrCodeData).toUpperCase();
            const user = await User.findOne({ qrCode: code });
            if (!user) {
                res.status(404);
                throw new Error('QR not recognized');
            }

            // Find this user's confirmed bookings and pick the one in the current time window
            const bookings = await Booking.find({
                user: user._id,
                status: 'confirmed'
            }).populate('user').populate('slot');

            if (!bookings || bookings.length === 0) {
                res.status(404);
                throw new Error('No active bookings for this user');
            }

            const now = new Date();
            booking = bookings.find(b => {
                if (!b.slot) return false;
                const slotStart = new Date(b.slot.startTime);
                const slotEnd = new Date(b.slot.endTime);
                const entryStart = new Date(slotStart.getTime() - 30 * 60000);
                return now >= entryStart && now <= slotEnd;
            });

            if (!booking) {
                res.status(400);
                throw new Error('No booking scheduled for the current time');
            }
        }

        if (!booking) {
            res.status(404);
            throw new Error('Booking not found');
        }

        if (booking.status === 'cancelled') {
            res.status(400);
            throw new Error('This booking was cancelled');
        }

        if (booking.status === 'attended') {
            res.status(400);
            throw new Error('Booking already used/attended');
        }

        booking.status = 'attended';
        await booking.save();

        res.status(200).json({
            success: true,
            message: 'Entry Verified',
            user: booking.user.name,
            slot: `${booking.slot.startTime} - ${booking.slot.endTime}`
        });

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const getStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments({ role: 'student' });
        const totalBookings = await Booking.countDocuments({});
        const attendedBookings = await Booking.countDocuments({ status: 'attended' });
        const cancelledBookings = await Booking.countDocuments({ status: 'cancelled' });
        const totalSlots = await Slot.countDocuments({});

        // Use aggregation to sort by bookings length
        const highOccupancySlots = await Slot.aggregate([
            {
                $project: {
                    startTime: 1,
                    endTime: 1,
                    capacity: 1,
                    bookingCount: { $size: "$bookings" }
                }
            },
            { $sort: { bookingCount: -1 } },
            { $limit: 5 }
        ]);

        res.status(200).json({
            users: totalUsers,
            bookings: totalBookings,
            attended: attendedBookings,
            cancelled: cancelledBookings,
            slots: totalSlots,
            trends: highOccupancySlots
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createBooking,
    getMyBookings,
    cancelBooking,
    verifyBooking,
    getStats
};
