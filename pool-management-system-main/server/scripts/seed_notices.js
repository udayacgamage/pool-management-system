const mongoose = require('mongoose');
const path = require('path');

require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const Notice = require('../models/Notice');

const notices = [
  {
    title: 'Pool Session Booking Rules (Semester 2)',
    type: 'Rules',
    languages: ['English'],
    content:
      'Please arrive 10 minutes early with your QR code. Bookings close once a session has started. One booking per student per day.',
  },
  {
    title: 'Lane Maintenance Update',
    type: 'General',
    languages: ['English'],
    content:
      'Routine maintenance may temporarily reduce lane availability this week. Please check the dashboard for live slot status before reserving.',
  },
  {
    title: 'Emergency: Weather Advisory',
    type: 'Emergency',
    languages: ['English'],
    content:
      'If there is thunder/lightning, pool operations may be suspended for safety. Follow staff instructions on site.',
  },
];

(async () => {
  if (!process.env.MONGO_URI) {
    console.error('MONGO_URI is not set. Check server/.env');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 });

  for (const n of notices) {
    await Notice.findOneAndUpdate(
      { title: n.title },
      {
        $set: {
          content: n.content,
          type: n.type,
          languages: n.languages,
          isActive: true,
        },
      },
      { upsert: true, new: true }
    );
  }

  const count = await Notice.countDocuments({ isActive: true });
  console.log(`✅ Seeded notices. Active notices count: ${count}`);

  await mongoose.disconnect();
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
