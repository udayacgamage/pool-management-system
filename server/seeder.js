const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');
const colors = require('colors');
const Slot = require('./models/Slot');
const connectDB = require('./config/db');

dotenv.config({ path: path.resolve(__dirname, '.env') });

const seedSlots = async () => {
    try {
        await connectDB();

        await Slot.deleteMany(); // Clear existing slots

        const startDate = new Date();
        startDate.setHours(8, 0, 0, 0); // Start today at 8 AM

        const slots = [];

        // Generate slots for the next 30 days
        for (let i = 0; i < 30; i++) {
            const currentDate = new Date(startDate);
            currentDate.setDate(startDate.getDate() + i);

            // Create 2 slots per day: Morning (8-12) and Afternoon (13-17)
            const times = [
                { start: 8, end: 12, name: 'Morning Slot' },
                { start: 13, end: 17, name: 'Afternoon Slot' }
            ];

            times.forEach(time => {
                const sTime = new Date(currentDate);
                sTime.setHours(time.start, 0, 0, 0);

                const eTime = new Date(currentDate);
                eTime.setHours(time.end, 0, 0, 0);

                slots.push({
                    startTime: sTime,
                    endTime: eTime,
                    capacity: 30, // Updated capacity restriction
                    status: 'open'
                });
            });
        }

        await Slot.insertMany(slots);

        console.log('Slots seeded successfully!'.green.inverse);
        process.exit();
    } catch (error) {
        console.error(`${error}`.red.inverse);
        process.exit(1);
    }
};

seedSlots();
