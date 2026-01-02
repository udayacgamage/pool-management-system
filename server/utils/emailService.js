const nodemailer = require('nodemailer');

const sendEmail = async (to, subject, html) => {
    try {
        let transporter;

        // Use real SMTP if provided, otherwise fallback to Ethereal
        if (process.env.SMTP_HOST && process.env.SMTP_USER) {
            transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST,
                port: process.env.SMTP_PORT,
                secure: false, // true for 465, false for other ports
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS,
                },
            });
        } else {
            // Ethereal (Testing)
            const testAccount = await nodemailer.createTestAccount();
            transporter = nodemailer.createTransport({
                host: 'smtp.ethereal.email',
                port: 587,
                secure: false,
                auth: {
                    user: testAccount.user,
                    pass: testAccount.pass,
                },
            });
            console.log('Using Ethereal Mail for testing.');
        }

        const info = await transporter.sendMail({
            from: process.env.SMTP_EMAIL || '"Pool System" <no-reply@poolsystem.com>',
            to,
            subject,
            html,
        });

        console.log("Message sent: %s", info.messageId);

        // Preview only available when sending through an Ethereal account
        if (nodemailer.getTestMessageUrl(info)) {
            console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
        }

    } catch (error) {
        console.error("Email sending failed:", error);
    }
};

module.exports = sendEmail;
