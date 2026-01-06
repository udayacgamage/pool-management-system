const Slot = require('../models/Slot');
const Booking = require('../models/Booking'); // Import Booking model

// @desc    Get all slots
// @route   GET /api/slots
// @access  Private
// @desc    Get all slots (optional ?date=YYYY-MM-DD)
// @route   GET /api/slots
// @access  Private
const getSlots = async (req, res) => {
    try {
        let targetDate = new Date();

        if (req.query.date) {
            // Interpret YYYY-MM-DD as a local date (not UTC) to avoid off-by-one issues.
            targetDate = new Date(`${req.query.date}T00:00:00`);
        }

        // Set range for the target date (00:00 to 23:59)
        targetDate.setHours(0, 0, 0, 0);

        const nextDay = new Date(targetDate);
        nextDay.setDate(nextDay.getDate() + 1);

        const slots = await Slot.find({
            startTime: { $gte: targetDate, $lt: nextDay }
        })
            .sort({ startTime: 1 });

        res.status(200).json(slots);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get slots for a specific date (for coaches)
// @route   GET /api/slots/today?date=YYYY-MM-DD
// @access  Private/Coach
const getCoachSlots = async (req, res) => {
    try {
        let targetDate = new Date();

        if (req.query.date) {
            // Interpret YYYY-MM-DD as a local date (not UTC) to avoid off-by-one issues.
            targetDate = new Date(`${req.query.date}T00:00:00`);
        }

        targetDate.setHours(0, 0, 0, 0);

        const nextDay = new Date(targetDate);
        nextDay.setDate(nextDay.getDate() + 1);

        const slots = await Slot.find({
            startTime: { $gte: targetDate, $lt: nextDay }
        })
            .sort({ startTime: 1 })
            .populate('bookings', 'name email studentId qrCode profilePic'); // Added profilePic and qrCode for better visibility

        res.status(200).json(slots);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a slot
// @route   POST /api/slots
// @access  Private/Admin
const createSlot = async (req, res) => {
    try {
        const { startTime, endTime, capacity } = req.body;

        // Simple validation
        if (!startTime || !endTime) {
            res.status(400);
            throw new Error('Please add start and end times');
        }

        const slot = await Slot.create({
            startTime,
            endTime,
            capacity: capacity || 20,
        });

        res.status(201).json(slot);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete a slot
// @route   DELETE /api/slots/:id
// @access  Private/Admin
const deleteSlot = async (req, res) => {
    try {
        const slot = await Slot.findById(req.params.id);

        if (!slot) {
            res.status(404);
            throw new Error('Slot not found');
        }

        // Delete associated bookings first
        await Booking.deleteMany({ slot: slot._id });

        await slot.deleteOne();

        res.status(200).json({ id: req.params.id });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = {
    getSlots,
    getCoachSlots,
    createSlot,
    deleteSlot,
};
