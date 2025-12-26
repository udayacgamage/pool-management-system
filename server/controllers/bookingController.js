const Booking = require('../models/Booking');
const Slot = require('../models/Slot');
const User = require('../models/User');

// @desc    Book a slot
// @route   POST /api/bookings
// @access  Private
const createBooking = async (req, res) => {
    try {
        const { slotId } = req.body;
        const userId = req.user.id;

        // 1. Check if slot exists
        const slot = await Slot.findById(slotId);
        if (!slot) {
            res.status(404);
            throw new Error('Slot not found');
        }

        // 2. Check if slot is full
        if (slot.bookings.length >= slot.capacity) {
            res.status(400);
            throw new Error('Slot is fully booked');
        }

        // 3. Check if user already booked this slot
        const existingBooking = await Booking.findOne({ user: userId, slot: slotId });
        if (existingBooking) {
            res.status(400);
            throw new Error('You have already booked this slot');
        }

        // 4. Create Booking
        // Use the User's unique QR Code
        let qrCodeData = req.user.qrCode;

        // Fallback: If user (legacy) doesn't have a QR code, generate and save one now
        if (!qrCodeData) {
            qrCodeData = `USJ-${Math.random().toString(36).substring(2, 8).toUpperCase()}-${Date.now().toString().slice(-4)}`;
            await User.findByIdAndUpdate(userId, { qrCode: qrCodeData });
        }

        const booking = await Booking.create({
            user: userId,
            slot: slotId,
            qrCodeData,
        });

        // 5. Update Slot bookings array
        slot.bookings.push(userId);
        await slot.save(); // Check for atomicity in real prod, but fine for now

        res.status(201).json(booking);
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

        // Find booking by ID directly or by QR Data string
        if (bookingId) {
            booking = await Booking.findById(bookingId).populate('user').populate('slot');
        } else if (qrCodeData) {
            // NEW LOGIC: Find active booking for this User's QR code
            
            // 1. Find all confirmed bookings associated with this QR code
            const bookings = await Booking.find({ 
                qrCodeData, 
                status: 'confirmed' 
            }).populate('user').populate('slot');

            if (!bookings || bookings.length === 0) {
                res.status(404);
                throw new Error('No active bookings found for this QR code');
            }

            // 2. Find the booking that matches the CURRENT time
            const now = new Date();
            
            // Logic: Current time must be within [SlotStart - 30mins, SlotEnd]
            booking = bookings.find(b => {
                if (!b.slot) return false; // Safety check for deleted slots

                const slotStart = new Date(b.slot.startTime);
                const slotEnd = new Date(b.slot.endTime);
                const entryStart = new Date(slotStart.getTime() - 30 * 60000); // Allow entry 30 mins before
                
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

        // Check if the slot time is valid (approximate check, e.g., only allow entry within 30 mins of start)
        const now = new Date();
        const slotStart = new Date(booking.slot.startTime);
        const slotEnd = new Date(booking.slot.endTime);

        // Simple window: Allow check-in 30 mins before start until end time
        // const diff = (now - slotStart) / 1000 / 60; // minutes
        // if (diff < -30 || now > slotEnd) {
        //      res.status(400);
        //      throw new Error('Not within valid entry time window');
        // }


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
