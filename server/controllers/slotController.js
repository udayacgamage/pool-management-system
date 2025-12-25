const Slot = require('../models/Slot');

// @desc    Get all slots
// @route   GET /api/slots
// @access  Private
const getSlots = async (req, res) => {
    try {
        // Filter by query params if needed (e.g., ?date=2023-10-27)
        // For now, return upcoming slots
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const slots = await Slot.find({ startTime: { $gte: today } })
            .sort({ startTime: 1 })
            .populate('bookings', 'id'); // Populate to count bookings, or just use size

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

        await slot.deleteOne();

        res.status(200).json({ id: req.params.id });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = {
    getSlots,
    createSlot,
    deleteSlot,
};
