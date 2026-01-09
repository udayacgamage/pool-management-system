const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const User = require('../models/User');

dotenv.config({ path: path.join(__dirname, '../.env') });

const verifyCredentials = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const safeUri = process.env.MONGO_URI
            ? process.env.MONGO_URI.replace(/\/\/([^@]+)@/, '//***:***@')
            : '';
        console.log('Using Database:', safeUri);

        // Read credentials.json from project root
        const credsPath = path.join(__dirname, '../../credentials.json');
        if (!fs.existsSync(credsPath)) {
            console.error('credentials.json not found at:', credsPath);
            process.exit(1);
        }

        const creds = JSON.parse(fs.readFileSync(credsPath, 'utf8'));
        const usersToCheck = [];

        // Add Admin
        if (creds.admin) {
            usersToCheck.push({ ...creds.admin, label: 'Admin' });
        }

        // Add Coaches
        if (creds.coaches && Array.isArray(creds.coaches)) {
            creds.coaches.forEach(c => usersToCheck.push({ ...c, label: `Coach (${c.name})` }));
        }

        console.log('\n--- Verifying Users ---\n');

        for (const u of usersToCheck) {
            const user = await User.findOne({ email: u.email });
            if (!user) {
                console.log(`❌ ${u.label}: User not found (Email: ${u.email})`);
                continue;
            }

            const isMatch = await user.matchPassword(u.password);
            if (isMatch) {
                console.log(`✅ ${u.label}: Login Successful (${u.email})`);
            } else {
                console.log(`❌ ${u.label}: Invalid Password`);
            }
        }

        console.log('\n-----------------------\n');
        process.exit();

    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

verifyCredentials();
