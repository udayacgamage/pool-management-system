const mongoose = require('mongoose');

const bookingSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        slot: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Slot',
            required: true,
        },
        status: {
            type: String,
            enum: ['confirmed', 'cancelled', 'attended', 'missed'],
            default: 'confirmed',
        },
        reminded: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

// Prevent double booking for same slot by same user
bookingSchema.index({ user: 1, slot: 1 }, { unique: true });

module.exports = mongoose.model('Booking', bookingSchema);
