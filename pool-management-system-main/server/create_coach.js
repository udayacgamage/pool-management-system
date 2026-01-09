const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.resolve(__dirname, '.env') });

const User = require('./models/User');

const createCoach = async () => {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error('MONGO_URI is not defined');
        }
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        const email = 'coach@usj.ac.lk';
        const userExists = await User.findOne({ email });

        if (userExists) {
            console.log('Coach already exists');
            process.exit();
        }

        const user = await User.create({
            name: 'Head Coach Silva',
            email: email,
            password: 'password123',
            role: 'coach',
            specialization: 'Swimming & Water Polo',
            qrCode: 'COACH-001'
        });

        console.log(`Coach created: ${user.email} / password123`);
        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

createCoach();
