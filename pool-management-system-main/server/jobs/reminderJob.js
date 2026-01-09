const cron = require('node-cron');
const Booking = require('../models/Booking');
const User = require('../models/User');
const Slot = require('../models/Slot');
const sendEmail = require('../utils/emailService');

const initReminderJob = () => {
    // Run every 15 minutes
    cron.schedule('*/15 * * * *', async () => {
        console.log('Running reminder check...');
        const now = new Date();
        const oneHourLater = new Date(now.getTime() + 60 * 60000);
        const buffer = new Date(now.getTime() + 75 * 60000); // 1h 15m window

        try {
            // Find unique bookings (un-reminded, confirmed) where slot starts in ~1 hour
            // We need to look up slots, so aggregation or manual loop is needed.
            // Aggregation is cleaner.

            const upcomingBookings = await Booking.find({
                status: 'confirmed',
                reminded: false,
            }).populate('slot').populate('user');

            for (const booking of upcomingBookings) {
                if (!booking.slot) continue;

                const startTime = new Date(booking.slot.startTime);

                // If start time is within the next hour (and hasn't passed more than 15 mins ago?)
                // Simple logic: if startTime is between now+45m and now+75m (approx 1 hour)
                if (startTime > now && startTime <= buffer) {

                    // Send Email
                    const message = `
                        <h3>Reminder: Upcoming Pool Session</h3>
                        <p>Hi ${booking.user.name},</p>
                        <p>This is a reminder that your swimming slot is starting soon.</p>
                        <p><strong>Time:</strong> ${new Date(booking.slot.startTime).toLocaleString()}</p>
                        <p>Please remember to bring your digital ID/QR code for check-in.</p>
                        <br/>
                        <p>Pool Management Team</p>
                    `;

                    await sendEmail(booking.user.email, 'Reminder: Your Pool Slot Starts Soon', message);

                    // Mark as reminded
                    booking.reminded = true;
                    await booking.save();
                }
            }
        } catch (error) {
            console.error('Reminder job error:', error);
        }
    });
};

module.exports = initReminderJob;
