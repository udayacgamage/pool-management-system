const Booking = require('../models/Booking');
const Slot = require('../models/Slot');
const User = require('../models/User');
const { generateUniqueQrCode } = require('../utils/qr');
const Holiday = require('../models/Holiday');
const sendEmail = require('../utils/emailService');

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

        // Block bookings once the slot has started
        const now = new Date();
        const slotStart = new Date(slot.startTime);
        if (now >= slotStart) {
            res.status(400);
            throw new Error('This slot has already started and can no longer be booked');
        }

        // Check if date is a Holiday
        const slotDate = new Date(slot.startTime);
        slotDate.setHours(0, 0, 0, 0);
        const holiday = await Holiday.findOne({ date: slotDate });

        if (holiday) {
            res.status(400);
            throw new Error(`Facility closed: ${holiday.description}`);
        }

        // Check for ANY existing booking for this user on the same date
        const startOfDay = new Date(slotDate);
        const endOfDay = new Date(slotDate);
        endOfDay.setHours(23, 59, 59, 999);

        const existingDailyBooking = await Booking.findOne({
            user: userId,
            status: { $ne: 'cancelled' }, // Ignore cancelled bookings
            // We need to check bookings where the associated slot is on the same day
            // This requires a more complex query or populating. 
            // MongoDB aggregation or finding all user bookings for the day is safer.
        }).populate({
            path: 'slot',
            match: {
                startTime: { $gte: startOfDay, $lte: endOfDay }
            }
        });

        // Since populate with match returns null slot if not matched, we filter
        // However, a simpler way without deep populate filtering issues in one query:

        const userBookings = await Booking.find({
            user: userId,
            status: { $ne: 'cancelled' }
        }).populate('slot');

        const hasBookingToday = userBookings.some(b => {
            const bDate = new Date(b.slot.startTime);
            return bDate.getDate() === slotDate.getDate() &&
                bDate.getMonth() === slotDate.getMonth() &&
                bDate.getFullYear() === slotDate.getFullYear();
        });

        if (hasBookingToday) {
            res.status(400);
            throw new Error('You already have a booking for this date');
        }

        // Capacity check
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

        // Send Confirmation Email
        const populatedBooking = await Booking.findById(booking._id).populate('user').populate('slot');
        if (populatedBooking && populatedBooking.user && populatedBooking.user.email) {
            const message = `
                <h3>Booking Confirmed</h3>
                <p>Hello ${populatedBooking.user.name},</p>
                <p>Your booking has been successfully confirmed.</p>
                <ul>
                    <li><strong>Date:</strong> ${new Date(slot.startTime).toDateString()}</li>
                    <li><strong>Time:</strong> ${new Date(slot.startTime).toLocaleTimeString()} - ${new Date(slot.endTime).toLocaleTimeString()}</li>
                </ul>
                <p>Please present your QR code at the entrance.</p>
            `;
            await sendEmail(populatedBooking.user.email, 'Pool Booking Confirmation', message);
        }

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

        const now = new Date();

        // Filter out cancelled bookings that are in the past
        const filteredBookings = bookings.filter(b => {
            // Always keep if not cancelled
            if (b.status !== 'cancelled') return true;

            // If slot is missing (edge case), maybe hide or keep. Keeping for now.
            if (!b.slot) return false;

            // If cancelled, keep only if the slot hasn't finished yet (or is in future)
            // "after that day pasted" implies we hide it once the day/event is over.
            const slotEnd = new Date(b.slot.endTime);
            return slotEnd > now;
        });

        res.status(200).json(filteredBookings);
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

        // Send Cancellation Email
        const user = await User.findById(req.user.id);
        if (user && user.email) {
            const message = `
                <h3>Booking Cancelled</h3>
                <p>Hello ${user.name},</p>
                <p>Your booking for the pool slot has been successfully cancelled.</p>
            `;
            await sendEmail(user.email, 'Pool Booking Cancelled', message);
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

        // --- NO-SHOW CALCULATIONS ---
        // Definition: Status is 'confirmed' (not attended/cancelled) AND slot has ended in the past
        const now = new Date();
        const noShows = await Booking.find({
            status: 'confirmed'
        }).populate({
            path: 'slot',
            match: { endTime: { $lt: now } }
        });

        // Filter out bookings where slot is null (future slots or didn't match time)
        const validNoShows = noShows.filter(b => b.slot !== null);
        const noShowCount = validNoShows.length;
        const noShowRate = totalBookings > 0 ? ((noShowCount / totalBookings) * 100).toFixed(1) : 0;

        // Top No-Showers
        const noShowUserCounts = {};
        validNoShows.forEach(b => {
            if (b.user) {
                noShowUserCounts[b.user] = (noShowUserCounts[b.user] || 0) + 1;
            }
        });

        // Convert to array, sort, and slice
        // We need to fetch User names. 
        // Optimized: Aggregation is better but complex with 'lookup' on filtered documents. 
        // JS processing is fine for <10k records. For scaling, move to aggregate.
        const topNoShowersIds = Object.entries(noShowUserCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5);

        const topNoShowers = [];
        for (const [uid, count] of topNoShowersIds) {
            const u = await User.findById(uid);
            if (u) topNoShowers.push({ name: u.name, email: u.email, count, id: u._id });
        }


        // --- HEAT MAP CALCULATIONS ---
        // Aggregate all slots to find average occupancy by Day of Week + Hour
        const heatMapData = await Slot.aggregate([
            {
                $project: {
                    dayOfWeek: { $dayOfWeek: "$startTime" }, // 1 (Sun) - 7 (Sat)
                    hour: { $hour: "$startTime" },
                    bookings: { $size: "$bookings" },
                    capacity: 1
                }
            },
            {
                $group: {
                    _id: { day: "$dayOfWeek", hour: "$hour" },
                    totalBookings: { $sum: "$bookings" },
                    totalCapacity: { $sum: "$capacity" },
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    day: "$_id.day",
                    hour: "$_id.hour",
                    occupancyPercent: {
                        $cond: [
                            { $eq: ["$totalCapacity", 0] },
                            0,
                            { $multiply: [{ $divide: ["$totalBookings", "$totalCapacity"] }, 100] }
                        ]
                    },
                    avgBookings: { $divide: ["$totalBookings", "$count"] }
                }
            },
            { $sort: { day: 1, hour: 1 } }
        ]);

        // Existing Trends
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
            trends: highOccupancySlots,
            // New Analytics
            noShowRate,
            noShowCount,
            topNoShowers,
            heatMap: heatMapData,
            revenueLost: noShowCount * 500 // Assuming 500 LKR per slot value? Just an estimate number.
        });
    } catch (error) {
        console.error(error); // Log internal errors
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
