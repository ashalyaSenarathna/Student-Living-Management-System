const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/laundry/UserModels');
require('dotenv').config();

const seedAdmin = async () => {
    try {
        await mongoose.connect("mongodb+srv://admin:xRLfibGWd5Jzy0im@cluster0.ucmx19s.mongodb.net/student_living");

        console.log('Connected to MongoDB...');

        // Clear existing admin if exists
        await User.deleteMany({ username: 'admin' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin', salt);

        const admin = new User({
            name: 'System Admin',
            username: 'admin',
            email: 'admin@studentliving.com',
            password: hashedPassword,
            role: 'ADMIN'
        });

        await admin.save();
        console.log('Admin user seeded successfully!');

        process.exit();
    } catch (error) {
        console.error('Error seeding admin:', error);
        process.exit(1);
    }
};

seedAdmin();
