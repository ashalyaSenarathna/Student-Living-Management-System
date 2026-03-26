        const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use('/uploads', express.static('uploads'));

// Database Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/student_living';

mongoose.connect("mongodb+srv://admin:xRLfibGWd5Jzy0im@cluster0.ucmx19s.mongodb.net/student_living")
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch((err) => console.error('❌ MongoDB connection error:', err));

// Routes
app.use('/api/users', require('./routes/laundry/UserRoutes'));
app.use('/api/laundry', require('./routes/laundry/LaundryRoutes'));
app.use('/api/upload', require('./routes/laundry/UploadRoutes'));
app.use('/api/bookings', require('./routes/laundry/BookingRoutes'));
app.use('/api/hostel', require('./routes/hostel/HostelRoutes'));
app.use('/api/db-check', require('./routes/debug/DbCheckRoutes'));

// Health Management Routes
app.use('/api/health/pharmaceutical', require('./routes/health/PharmaceuticalRoutes'));
app.use('/api/health/orders', require('./routes/health/OrderRoutes'));
app.use('/api/health/appointments', require('./routes/health/AppointmentRoutes'));
app.use('/api/health/prescriptions', require('./routes/health/PrescriptionRoutes'));
app.use('/api/health/doctors', require('./routes/health/DoctorRoutes'));
app.use('/api/health/inventory', require('./routes/health/InventoryRoutes'));

app.get('/', (req, res) => {
    res.json({ message: 'Welcome to the Student Living Management System API' });
});

// JSON body size limit for base64 images
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Port configuration
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!'); 
});
