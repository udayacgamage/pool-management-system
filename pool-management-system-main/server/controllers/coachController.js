const CoachAllocation = require('../models/CoachAllocation');
const User = require('../models/User');

// @desc    Get all allocations
// @route   GET /api/coach-allocations
// @access  Public (or Private/Admin/Coach)
const getAllocations = async (req, res) => {
    try {
        const allocations = await CoachAllocation.find()
            .populate('coach', 'name email specialization')
            .sort({ date: 1 });
        res.status(200).json(allocations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Allocate a coach to a date
// @route   POST /api/coach-allocations
// @access  Private/Admin
const createAllocation = async (req, res) => {
    try {
        const { date, coachId } = req.body;

        // Check if coach exists and is actually a coach
        const coach = await User.findById(coachId);
        if (!coach || coach.role !== 'coach') {
            res.status(400);
            throw new Error('Invalid coach ID');
        }

        // Check for existing allocation on that date
        const existing = await CoachAllocation.findOne({ date });
        if (existing) {
            res.status(400);
            throw new Error('A coach is already allocated for this date');
        }

        // Optional: Check if coach is already working 5 days this week (Business logic)
        // For now, implementing simple allocation

        const allocation = await CoachAllocation.create({
            date,
            coach: coachId,
            dayOfWeek: new Date(date).toLocaleDateString('en-US', { weekday: 'long' })
        });

        res.status(201).json(allocation);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete allocation
// @route   DELETE /api/coach-allocations/:id
// @access  Private/Admin
const deleteAllocation = async (req, res) => {
    try {
        const allocation = await CoachAllocation.findById(req.params.id);
        if (!allocation) {
            res.status(404);
            throw new Error('Allocation not found');
        }
        await allocation.deleteOne();
        res.status(200).json({ id: req.params.id });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = {
    getAllocations,
    createAllocation,
    deleteAllocation
};
