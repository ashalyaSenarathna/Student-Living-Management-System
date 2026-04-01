const mongoose = require('mongoose');

const test = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect("mongodb+srv://admin:xRLfibGWd5Jzy0im@cluster0.ucmx19s.mongodb.net/student_living");
        console.log('✅ Connected to MongoDB');
        
        console.log('Loading models...');
        const Pharmaceutical = require('./models/health/PharmaceuticalModel');
        console.log('✅ Pharmaceutical model loaded');
        
        const Order = require('./models/health/OrderModel');
        console.log('✅ Order model loaded');
        
        const Doctor = require('./models/health/DoctorModel');
        console.log('✅ Doctor model loaded');
        
        const Appointment = require('./models/health/AppointmentModel');
        console.log('✅ Appointment model loaded');
        
        const Prescription = require('./models/health/PrescriptionModel');
        console.log('✅ Prescription model loaded');
        
        const Inventory = require('./models/health/InventoryModel');
        console.log('✅ Inventory model loaded');
        
        console.log('\n✅ All models loaded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

test();
