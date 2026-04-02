const mongoose = require('mongoose');

const PrescriptionMedicineSchema = new mongoose.Schema({
    pharmaceutical: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pharmaceutical',
        required: true
    },
    dosage: {
        type: String,
        required: [true, 'Please add dosage'],
        example: '1 tablet twice daily'
    },
    duration: {
        type: String,
        required: [true, 'Please add duration'],
        example: '7 days'
    },
    instructions: {
        type: String,
        required: false
    },
    frequency: {
        type: String,
        enum: ['Once daily', 'Twice daily', 'Three times daily', 'Four times daily', 'As needed'],
        required: true
    }
}, { _id: false });

const PrescriptionSchema = new mongoose.Schema({
    prescriptionId: {
        type: String,
        unique: true,
        required: true
    },
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    studentId: {
        type: String,
        required: true
    },
    doctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor',
        required: true
    },
    appointment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appointment',
        required: false
    },
    medicines: [PrescriptionMedicineSchema],
    prescriptionDate: {
        type: Date,
        default: Date.now
    },
    diagnosis: {
        type: String,
        required: true
    },
    notes: {
        type: String,
        required: false
    },
    status: {
        type: String,
        enum: ['ACTIVE', 'PARTIALLY_DISPENSED', 'DISPENSED', 'EXPIRED', 'CANCELLED'],
        default: 'ACTIVE'
    },
    dispensedItems: [{
        pharmaceutical: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Pharmaceutical'
        },
        quantityDispensed: Number,
        dispensedDate: Date,
        dispensedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    }],
    expiryDate: {
        type: Date,
        required: true
    },
    fileUrl: {
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
    }
}, { timestamps: true });

// Generate unique prescription ID before validation runs.
PrescriptionSchema.pre('validate', async function() {
    if (!this.prescriptionId) {
        const count = await mongoose.model('Prescription').countDocuments();
        const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        this.prescriptionId = `RX-${dateStr}-${String(count + 1).padStart(4, '0')}`;
    }
});

module.exports = mongoose.model('Prescription', PrescriptionSchema);
