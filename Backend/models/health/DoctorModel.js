const mongoose = require('mongoose');

const AvailabilitySchema = new mongoose.Schema({
    dayOfWeek: {
        type: String,
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        required: true
    },
    startTime: {
        type: String,
        required: true,
        match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
    },
    endTime: {
        type: String,
        required: true,
        match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
    },
    isAvailable: {
        type: Boolean,
        default: true
    },
    slotDuration: {
        type: Number,
        default: 30
    }
}, { _id: false });

const DoctorSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    specialization: {
        type: String,
        required: [true, 'Please add specialization'],
        enum: ['General Practitioner', 'Cardiologist', 'Dentist', 'Dermatologist', 'Ophthalmologist', 'Psychiatrist', 'Orthopedic', 'Other']
    },
    qualifications: {
        type: String,
        required: false
    },
    registrationNumber: {
        type: String,
        required: true,
        unique: true
    },
    licenseNumber: {
        type: String,
        required: true
    },
    experience: {
        type: Number,
        required: false
    },
    phone: {
        type: String,
        required: true,
        match: /^\+?[0-9]{10,15}$/
    },
    officeLocation: {
        type: String,
        required: true
    },
    bio: {
        type: String,
        required: false
    },
    profilePhoto: {
        type: String,
        required: false
    },
    isAvailable: {
        type: Boolean,
        default: true
    },
    availability: [AvailabilitySchema],
    consultationFee: {
        type: Number,
        required: false,
        default: 0
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected', 'Suspended'],
        default: 'Pending'
    },
    totalAppointments: {
        type: Number,
        default: 0
    },
    completedAppointments: {
        type: Number,
        default: 0
    },
    averageRating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

module.exports = mongoose.model('Doctor', DoctorSchema);
