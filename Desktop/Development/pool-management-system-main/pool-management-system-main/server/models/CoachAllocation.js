const mongoose = require('mongoose');

const coachAllocationSchema = mongoose.Schema(
    {
        date: {
            type: Date,
            required: true,
        },
        coach: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        dayOfWeek: {
            type: String, // e.g., "Monday", "Tuesday"
        }
    },
    {
        timestamps: true,
    }
);

// Prevent multiple coaches for the same day (Requirement: "one unique coach per day")
coachAllocationSchema.index({ date: 1 }, { unique: true });

module.exports = mongoose.model('CoachAllocation', coachAllocationSchema);
