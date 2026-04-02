        const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
        const path = require('path');

// Load environment variables
        dotenv.config({
            path: path.join(__dirname, '.env'),
            override: true,
        });

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use('/uploads', express.static('uploads'));

// Database Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://admin:xRLfibGWd5Jzy0im@cluster0.ucmx19s.mongodb.net/student_living';

// Routes
app.use('/api/users', require('./routes/laundry/UserRoutes'));
app.use('/api/laundry', require('./routes/laundry/LaundryRoutes'));
app.use('/api/upload', require('./routes/laundry/UploadRoutes'));
app.use('/api/bookings', require('./routes/laundry/BookingRoutes'));
app.use('/api/hostel', require('./routes/hostel/HostelRoutes'));
app.use('/api/food', require('./routes/food/FoodRoutes'));

app.get('/', (req, res) => {
    res.json({ message: 'Welcome to the Student Living Management System API' });
});

// Port configuration
const PORT = process.env.PORT || 5000;

function startHttpServer() {
    app.listen(PORT, () => {
        console.log(`🚀 Server is running on port ${PORT}`);
    });
}

async function startServer() {
    try {
        await mongoose.connect(MONGODB_URI, {
            serverSelectionTimeoutMS: 10000,
        });
        console.log('✅ Connected to MongoDB');
        startHttpServer();
    } catch (err) {
        console.error('❌ MongoDB connection error:', err.message || err);
        process.exit(1);
    }
}

startServer();

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});
