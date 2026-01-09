const mongoose = require('mongoose');

const slotSchema = mongoose.Schema(
    {
        startTime: {
            type: Date,
            required: true,
        },
        endTime: {
            type: Date,
            required: true,
        },
        capacity: {
            type: Number,
            required: true,
            default: 30, // Updated default capacity per requirements
        },
        bookings: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
        status: {
            type: String,
            enum: ['open', 'closed', 'maintenance'],
            default: 'open',
        },
    },
    {
        timestamps: true,
    }
);

// Virtual for remaining spots
slotSchema.virtual('remainingSpots').get(function () {
    return this.capacity - this.bookings.length;
});

// Calculate duration in hours, formatted e.g., "08:00 - 09:00"
slotSchema.virtual('timeLabel').get(function () {
    const start = new Date(this.startTime);
    const end = new Date(this.endTime);

    // Simple time formatting helper
    const options = { hour: '2-digit', minute: '2-digit', hour12: true };
    return `${start.toLocaleTimeString([], options)} - ${end.toLocaleTimeString([], options)}`;
});

slotSchema.set('toJSON', { virtuals: true });
slotSchema.set('toObject', { virtuals: true });

// Prevent duplicate slots (optional, but good practice)
// slotSchema.index({ startTime: 1, endTime: 1 }, { unique: true });

module.exports = mongoose.model('Slot', slotSchema);
