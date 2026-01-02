const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const testConnection = async () => {
    try {
        console.log('Attempting to connect to MongoDB Atlas...');
        console.log('URI:', process.env.MONGO_URI);
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000
        });
        console.log(`✅ Success! Connected to: ${conn.connection.host}`);
        process.exit(0);
    } catch (error) {
        console.error('❌ Connection Failed!');
        console.error('Error Name:', error.name);
        console.error('Error Message:', error.message);
        if (error.reason) console.error('Reason:', error.reason);
        process.exit(1);
    }
};

testConnection();
