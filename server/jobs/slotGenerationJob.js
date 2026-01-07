const cron = require('node-cron');
const Slot = require('../models/Slot');
const Holiday = require('../models/Holiday');

// Helper to check if a date is a weekend (0=Sun, 6=Sat)
const isWeekend = (date) => {
    const day = date.getDay();
    return day === 0 || day === 6;
};

// Helper to format date as YYYY-MM-DD for comparison
const toDateString = (date) => {
    return date.toISOString().split('T')[0];
};

const generateSlots = async () => {
    console.log('Running automated slot generation job...');
    const today = new Date();

    // We want to ensure slots exist for the next 30 days
    // Start from tomorrow to safe (or today, but usually for future)
    // Let's cover today + 30 days to be safe and robust
    const daysToCover = 30;

    for (let i = 0; i < daysToCover; i++) {
        const targetDate = new Date(today);
        targetDate.setDate(today.getDate() + i);
        targetDate.setHours(0, 0, 0, 0); // Normalize to start of day

        // 1. Skip Weekends
        if (isWeekend(targetDate)) {
            // console.log(`Skipping weekend: ${toDateString(targetDate)}`);
            continue;
        }

        // 2. Check for Holiday
        // We compare logical dates. The Holiday model stores a Date object. 
        // We should query for a holiday that falls on this day.
        // Assuming Holiday.date is stored as 00:00:00 UTC or Local. 
        // Best to match the range of the day.
        const nextDay = new Date(targetDate);
        nextDay.setDate(targetDate.getDate() + 1);

        const holiday = await Holiday.findOne({
            date: {
                $gte: targetDate,
                $lt: nextDay
            }
        });

        if (holiday) {
            console.log(`Skipping holiday: ${toDateString(targetDate)} - ${holiday.description}`);
            continue;
        }

        // 3. Check if slots already exist for this day
        // We'll assume if *any* slot exists, we don't auto-generate (to avoid duplicates or overriding custom schedules)
        const existingSlots = await Slot.countDocuments({
            startTime: {
                $gte: targetDate,
                $lt: nextDay
            }
        });

        if (existingSlots > 0) {
            // console.log(`Slots already exist for: ${toDateString(targetDate)}`);
            continue;
        }

        // 4. Generate Default Slots
        // Default requirement: 08:00 - 17:00 (5PM)
        // Duration: 1 hour per slot? Or one big slot? 
        // The artifacts/previous context imply "Slots" as sessions. 
        // Admin previously deployed specific times. 
        // Let's assume standard hourly slots for a pool: 08:00-09:00, 09:00-10:00, ... 16:00-17:00.
        // Or maybe just a few standard ones. 
        // Based on "Pool Management", likely 1-hour slots. 
        // Let's create slots from 08:00 to 17:00 (last slot ends at 17:00)

        const startHour = 8;
        const endHour = 17;

        const slotsToCreate = [];

        for (let hour = startHour; hour < endHour; hour++) {
            const slotStart = new Date(targetDate);
            slotStart.setHours(hour, 0, 0, 0);

            const slotEnd = new Date(targetDate);
            slotEnd.setHours(hour + 1, 0, 0, 0);

            slotsToCreate.push({
                startTime: slotStart,
                endTime: slotEnd,
                capacity: 30, // Default capacity
                status: 'open'
            });
        }

        if (slotsToCreate.length > 0) {
            await Slot.insertMany(slotsToCreate);
            console.log(`Generated ${slotsToCreate.length} slots for ${toDateString(targetDate)}`);
        }
    }
    console.log('Slot generation job completed.');
};

const initSlotGenerationJob = () => {
    // Run at 00:00 (Midnight) every day
    cron.schedule('0 0 * * *', async () => {
        try {
            await generateSlots();
        } catch (error) {
            console.error('Error in slot generation job:', error);
        }
    });

    // Optional: Run immediately on server start IF needed for dev/demo, 
    // but usually better to let it run on schedule or have a manual trigger.
    // For this task, strict requirement is automated 30 days. 
    // I will trigger it once on initialization safe-guarded to ensure data is there for the user to see.
    // setTimeout(() => generateSlots(), 5000); // 5 sec delay to ensure DB connection
};

module.exports = { initSlotGenerationJob, generateSlots }; // Export generateSlots for testing/manual triggering if needed
