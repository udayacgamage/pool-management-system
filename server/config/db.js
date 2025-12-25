const mongoose = require('mongoose');
require('colors');

const connectDB = async () => {
    try {
        const uri = process.env.MONGO_URI;

        // 1. Check if URI exists
        if (!uri) {
            throw new Error('MONGO_URI is not defined in .env file');
        }

        // 2. Log the URI (masked) to verify you are connecting to the correct cluster
        const maskedURI = uri.replace(/:([^:@]+)@/, ':****@');
        console.log(`⏳ Attempting to connect to: ${maskedURI}`.yellow);

        const conn = await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 5000, // Fail fast (5 seconds)
            family: 4, // Force IPv4 to avoid common DNS timeouts with IPv6
        });

        console.log(`✅ MongoDB Connected: ${conn.connection.host}`.cyan.underline);
    } catch (error) {
        console.error(`❌ MongoDB Connection Error: ${error.message}`.red.bold);

        // 3. Provide specific troubleshooting for ETIMEOUT
        if (error.message.includes('ETIMEOUT') || error.message.includes('querySrv')) {
            console.error('\n⚠️  TROUBLESHOOTING TIPS:'.yellow.bold);
            console.error('1. IP Whitelist: Go to MongoDB Atlas > Network Access > Add IP Address > Allow Access from Anywhere (0.0.0.0/0).');
            console.error('2. Stale URI: If the URI logged above does not match your .env file, restart your terminal to clear old variables.');
            console.error('3. Network: University/Office networks often block MongoDB. Try using a mobile hotspot.');
        }

        process.exit(1);
    }
};

module.exports = connectDB;
