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
        postedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        postedByName: {
            type: String,
            default: '',
        },
        postedByRole: {
            type: String,
            default: '',
        },
        languages: {
            type: [String],
            default: ['English'], // 'Sinhala', 'English'
        },
        type: {
            type: String,
            enum: ['Rules', 'Emergency', 'Competition', 'General', 'Coach'],
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
