const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/User');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const coaches = [
    {
        name: 'Kithsiri Duminda',
        email: 'coach.kithsiri@sjp.ac.lk',
        password: 'Password@123',
        role: 'coach',
        specialization: 'Head Coach'
    },
    {
        name: 'Waruni Liyanage',
        email: 'coach.waruni@sjp.ac.lk',
        password: 'Password@123',
        role: 'coach',
        specialization: 'Swimming Instructor'
    },
    {
        name: 'Banula Devapriya',
        email: 'coach.banula@sjp.ac.lk',
        password: 'Password@123',
        role: 'coach',
        specialization: 'Swimming Instructor'
    },
    {
        name: 'Vihara Jayathilaka',
        email: 'coach.vihara@sjp.ac.lk',
        password: 'Password@123',
        role: 'coach',
        specialization: 'Swimming Instructor'
    },
    {
        name: 'Amadhi Kiripitige',
        email: 'coach.amadhi@sjp.ac.lk',
        password: 'Password@123',
        role: 'coach',
        specialization: 'Swimming Instructor'
    }
];

const seedCoaches = async () => {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error('MONGO_URI is not set. Check server/.env');
        }
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected for Seeding...');

        for (const coach of coaches) {
            // Check if user exists
            const existingUser = await User.findOne({ email: coach.email });

            if (existingUser) {
                // Update existing user if needed, or just skip
                console.log(`Coach ${coach.name} already exists. Updating...`);
                existingUser.name = coach.name;
                existingUser.role = coach.role;
                existingUser.specialization = coach.specialization;
                // Note: We are NOT re-hashing/setting password here to avoid accidental overrides if they changed it.
                // But if you want to FORCE reset, uncomment below:
                existingUser.password = coach.password;
                await existingUser.save();
                console.log(`Updated ${coach.name}`);
            } else {
                // Create new user
                await User.create(coach);
                console.log(`Created new coach: ${coach.name}`);
            }
        }

        console.log('Coach Seeding Completed Successfully!');
        process.exit();
    } catch (error) {
        console.error('Error seeding coaches:', error);
        process.exit(1);
    }
};

seedCoaches();
