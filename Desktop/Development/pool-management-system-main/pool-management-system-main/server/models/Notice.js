const mongoose = require('mongoose');

const noticeSchema = mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        content: {
            type: String,
            required: true,
        },
        languages: {
            type: [String],
            default: ['English'], // 'Sinhala', 'English'
        },
        type: {
            type: String,
            enum: ['Rules', 'Emergency', 'Competition', 'General'],
            default: 'General',
        },
        isActive: {
            type: Boolean,
            default: true,
        }
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Notice', noticeSchema);
