const mongoose = require('mongoose');

const TimeSlotSchema = new mongoose.Schema({
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
    isBooked: {
        type: Boolean,
        default: false
    }
}, { _id: false });

const AppointmentSchema = new mongoose.Schema({
    appointmentId: {
        type: String,
        unique: true,
        required: true
    },
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    doctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor',
        required: true
    },
    appointmentDate: {
        type: Date,
        required: [true, 'Please add appointment date']
    },
    timeSlot: {
        type: String,
        required: [true, 'Please select time slot'],
        example: '10:00-10:30'
    },
    reason: {
        type: String,
        required: [true, 'Please add reason for appointment']
    },
    symptoms: {
        type: String,
        required: false,
        maxlength: 500
    },
    status: {
        type: String,
        enum: ['Scheduled', 'Confirmed', 'Completed', 'Cancelled', 'No-Show', 'Rejected'],
        default: 'Scheduled'
    },
    doctorNotes: {
        type: String,
        required: false
    },
    prescription: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Prescription',
        required: false
    },
    consultationNotes: {
        type: String,
        required: false
    },
    doctorRejectionReason: {
        type: String,
        required: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    completedAt: {
        type: Date,
        required: false
    }
}, { timestamps: true });

// Generate unique appointment ID before validation runs.
AppointmentSchema.pre('validate', async function() {
    if (!this.appointmentId) {
        const count = await mongoose.model('Appointment').countDocuments();
        const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        this.appointmentId = `APT-${dateStr}-${String(count + 1).padStart(4, '0')}`;
    }
});

module.exports = mongoose.model('Appointment', AppointmentSchema);
