const mongoose = require('mongoose');
require('colors');

// Connection cache variable
let isConnected = false;

const connectDB = async () => {
    if (isConnected) {
        console.log('Using existing MongoDB connection'.cyan);
        return;
    }

    try {
        const uri = process.env.MONGO_URI;

        if (!uri) {
            throw new Error('MONGO_URI is not defined in environment variables');
        }

        const conn = await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 5000,
        });

        isConnected = !!conn.connections[0].readyState;
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`.cyan.underline);
    } catch (error) {
        console.error(`❌ MongoDB Connection Error: ${error.message}`.red.bold);
        // Do not use process.exit(1) in serverless
        throw error;
    }
};

module.exports = connectDB;
