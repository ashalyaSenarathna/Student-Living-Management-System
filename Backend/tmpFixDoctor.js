const mongoose = require('mongoose');
const User = require('./models/laundry/UserModels');
const Doctor = require('./models/health/DoctorModel');
const dotenv = require('dotenv');

dotenv.config();

const fixDoctorProfile = async () => {
    try {
        await mongoose.connect("mongodb+srv://admin:xRLfibGWd5Jzy0im@cluster0.ucmx19s.mongodb.net/student_living");
        console.log('✅ Connected to MongoDB');

        // Find the user 'Idd1'
        const user = await User.findOne({ username: 'Idd1' });
        
        if (!user) {
            console.log('❌ User Idd1 not found');
            process.exit(1);
        }

        // Check if doctor profile already exists
        const existingDoctor = await Doctor.findOne({ user: user._id });
        if (existingDoctor) {
            console.log('ℹ️ Doctor profile already exists for ldd1');
            process.exit(0);
        }

        // Create a default doctor profile
        const [firstName, ...lastNameParts] = user.name.split(' ');
        const lastName = lastNameParts.join(' ') || 'Doctor';

        const doctor = new Doctor({
            user: user._id,
            firstName: firstName,
            lastName: lastName,
            specialization: 'General Practitioner',
            registrationNumber: `REG-${user.username.toUpperCase()}-${Date.now().toString().slice(-4)}`,
            licenseNumber: `LIC-${user.username.toUpperCase()}-001`,
            phone: '0712345678', // Default placeholder
            officeLocation: 'Student Medical Center, Room 01',
            status: 'Approved', // Auto-approve for the user to use it immediately
            isAvailable: true
        });

        await doctor.save();
        console.log('✅ Doctor profile created successfully for ldd1');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

fixDoctorProfile();
