const asyncHandler = require('express-async-handler');
const nodemailer = require('nodemailer');

// @desc    Send contact email
// @route   POST /api/contact
// @access  Public
const sendContactEmail = asyncHandler(async (req, res) => {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
        res.status(400);
        throw new Error('Please fill in all fields');
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    const mailOptions = {
        from: `"${name}" <${email}>`, // sender address
        to: process.env.SMTP_EMAIL || 'usjppool@gmail.com', // list of receivers
        replyTo: email,
        subject: `New Contact Form Submission: ${name}`, // Subject line
        html: `
            <h3>New Contact Message</h3>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Message:</strong></p>
            <p>${message}</p>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        res.status(200).json({ success: true, message: 'Email sent successfully' });
    } catch (error) {
        console.error('Email send error:', error);
        res.status(500);
        throw new Error('Email could not be sent');
    }
});

module.exports = {
    sendContactEmail,
};
