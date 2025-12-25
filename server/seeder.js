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

        // Generate slots for the next 7 days
        for (let i = 0; i < 7; i++) {
            const currentDate = new Date(startDate);
            currentDate.setDate(startDate.getDate() + i);

            // Create 3 slots per day: 8-9, 10-11, 4-5
            const times = [
                { start: 8, end: 9 },
                { start: 10, end: 11 },
                { start: 16, end: 17 }
            ];

            times.forEach(time => {
                const sTime = new Date(currentDate);
                sTime.setHours(time.start, 0, 0, 0);

                const eTime = new Date(currentDate);
                eTime.setHours(time.end, 0, 0, 0);

                slots.push({
                    startTime: sTime,
                    endTime: eTime,
                    capacity: 15,
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
