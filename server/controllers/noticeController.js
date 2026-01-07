const Notice = require('../models/Notice');
const User = require('../models/User');
const sendEmail = require('../utils/emailService');

// @desc    Get all notices
// @route   GET /api/notices
// @access  Public
const getNotices = async (req, res) => {
    try {
        const notices = await Notice.find({ isActive: true }).sort({ createdAt: -1 });
        res.status(200).json(notices);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a notice
// @route   POST /api/notices
// @access  Private/Admin
const createNotice = async (req, res) => {
    try {
        const { title, content, languages, type } = req.body;

        if (!title || !content) {
            return res.status(400).json({ message: 'Title and content are required' });
        }

        // Coaches can post announcements, but they are limited to the "Coach" type.
        const resolvedType = req.user?.role === 'coach' ? 'Coach' : (type || 'General');

        const notice = await Notice.create({
            title,
            content,
            languages,
            type: resolvedType,
            postedBy: req.user?._id,
            postedByName: req.user?.name || '',
            postedByRole: req.user?.role || '',
        });

        // Broadcast email only for admin-posted notices (avoid spamming students with frequent coach posts)
        if (req.user?.role === 'admin') {
            const students = await User.find({ role: 'student' });

            for (const student of students) {
                if (student.email) {
                    const message = `
                        <h3>New Notice: ${title}</h3>
                        <p>Hello ${student.name},</p>
                        <p>A new notice has been posted on the pool management portal.</p>
                        <div style="background: #f8f9fa; padding: 15px; border-left: 4px solid #800000; margin: 20px 0;">
                            ${content}
                        </div>
                    `;
                    // Use fire-and-forget (don't await) to not block the response
                    sendEmail(student.email, `New Notice: ${title}`, message);
                }
            }
        }

        res.status(201).json(notice);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete a notice
// @route   DELETE /api/notices/:id
// @access  Private/Admin
const deleteNotice = async (req, res) => {
    try {
        const notice = await Notice.findById(req.params.id);
        if (!notice) {
            res.status(404);
            throw new Error('Notice not found');
        }
        await notice.deleteOne();
        res.status(200).json({ id: req.params.id });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = {
    getNotices,
    createNotice,
    deleteNotice
};
