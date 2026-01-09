const Holiday = require('../models/Holiday');

// @desc    Get all holidays
// @route   GET /api/holidays
// @access  Public
const getHolidays = async (req, res) => {
    try {
        const holidays = await Holiday.find().sort({ date: 1 });
        res.status(200).json(holidays);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a holiday
// @route   POST /api/holidays
// @access  Private/Admin
const createHoliday = async (req, res) => {
    try {
        const { date, description, type } = req.body;
        const holiday = await Holiday.create({
            date,
            description,
            type
        });
        res.status(201).json(holiday);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete a holiday
// @route   DELETE /api/holidays/:id
// @access  Private/Admin
const deleteHoliday = async (req, res) => {
    try {
        const holiday = await Holiday.findById(req.params.id);
        if (!holiday) {
            res.status(404);
            throw new Error('Holiday not found');
        }
        await holiday.deleteOne();
        res.status(200).json({ id: req.params.id });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = {
    getHolidays,
    createHoliday,
    deleteHoliday
};
