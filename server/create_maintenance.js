// Create Maintenance User Script
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

const createMaintenanceUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);

    console.log('MongoDB Connected...');

    // Check if maintenance user already exists
    let existingUser = await User.findOne({ email: 'maintenance@sjp.ac.lk' });
    
    if (existingUser) {
      console.log('Maintenance user already exists! Updating password...');
      // Set password directly - the pre-save hook will hash it
      existingUser.password = 'maintenance123';
      existingUser.role = 'maintenance';
      existingUser.name = 'Maintenance Staff';
      existingUser.department = 'Facilities Management';
      await existingUser.save();
      
      console.log('✅ Maintenance user password updated successfully!');
      console.log('\n📋 Login Credentials:');
      console.log('Email: maintenance@sjp.ac.lk');
      console.log('Password: maintenance123');
      console.log('\n⚠️  Please change the password after first login!');
      process.exit(0);
    }

    // Create maintenance user
    // Set password directly - the pre-save hook will hash it
    const maintenanceUser = new User({
      name: 'Maintenance Staff',
      email: 'maintenance@sjp.ac.lk',
      password: 'maintenance123',
      role: 'maintenance',
      department: 'Facilities Management'
    });

    await maintenanceUser.save();

    console.log('✅ Maintenance user created successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('Email: maintenance@sjp.ac.lk');
    console.log('Password: maintenance123');
    console.log('\n⚠️  Please change the password after first login!');

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

createMaintenanceUser();
