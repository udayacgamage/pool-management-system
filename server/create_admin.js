const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.resolve(__dirname, '.env') });

const User = require('./models/User');
const bcrypt = require('bcryptjs');

const createAdmin = async () => {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error('MONGO_URI is not defined');
        }
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        const adminExists = await User.findOne({ email: 'admin@usj.ac.lk' });

        if (adminExists) {
            console.log('Admin already exists');
            process.exit();
        }

        // Hash password manually since we might bypass pre-save if we used insertMany, 
        // but here we use create which triggers pre-save. 
        // Actually, User model has pre-save hash, so passing plain text is fine.

        const user = await User.create({
            name: 'System Admin',
            email: 'admin@usj.ac.lk',
            password: 'password123',
            role: 'admin',
            department: 'Administration',
            studentId: 'ADMIN001'
        });

        console.log(`Admin created: ${user.email} / password123`);
        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

createAdmin();
