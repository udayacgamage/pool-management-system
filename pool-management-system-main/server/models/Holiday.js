const mongoose = require('mongoose');

const holidaySchema = mongoose.Schema(
    {
        date: {
            type: Date,
            required: true,
            unique: true, // Only one entry per date to avoid ambiguity
        },
        description: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            enum: ['Holiday', 'Maintenance'],
            default: 'Holiday',
        }
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Holiday', holidaySchema);
