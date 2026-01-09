const mongoose = require('mongoose');
const path = require('path');

require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const Slot = require('../models/Slot');
const Holiday = require('../models/Holiday');

const dateArg = process.argv[2];
const target = dateArg ? new Date(dateArg) : new Date();

if (Number.isNaN(target.getTime())) {
  console.error('Invalid date. Use YYYY-MM-DD (example: 2026-01-06).');
  process.exit(1);
}

target.setHours(0, 0, 0, 0);
const nextDay = new Date(target);
nextDay.setDate(nextDay.getDate() + 1);

const toLocalYMD = (d) => {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

(async () => {
  if (!process.env.MONGO_URI) {
    console.error('MONGO_URI is not set. Check server/.env');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 });

  const holiday = await Holiday.findOne({ date: target }).lean();
  const slots = await Slot.find({ startTime: { $gte: target, $lt: nextDay } })
    .sort({ startTime: 1 })
    .lean();

  console.log(
    JSON.stringify(
      {
        date: toLocalYMD(target),
        holiday: holiday
          ? { date: holiday.date, description: holiday.description }
          : null,
        slots: slots.map((s) => ({
          id: String(s._id),
          startTime: s.startTime,
          endTime: s.endTime,
          status: s.status,
          capacity: s.capacity,
          bookings: (s.bookings || []).length,
        })),
      },
      null,
      2
    )
  );

  await mongoose.disconnect();
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
