const mongoose = require('mongoose');

const PharmaceuticalSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a pharmaceutical name'],
        trim: true
    },
    category: {
        type: String,
        enum: ['pain_reliever', 'antibiotics', 'antacid', 'cold_medicine', 'vitamin', 'topical', 'other'],
        required: [true, 'Please add a category']
    },
    type: {
        type: String,
        enum: ['Normal', 'Critical'],
        required: [true, 'Please specify item type'],
        default: 'Normal'
    },
    description: {
        type: String,
        required: false
    },
    price: {
        type: Number,
        required: [true, 'Please add a price'],
        min: 0
    },
    dosage: {
        type: String,
        required: true,
        example: '500mg, 250ml'
    },
    manufacturer: {
        type: String,
        required: false
    },
    expiryDate: {
        type: Date,
        required: true
    },
    stockQuantity: {
        type: Number,
        required: [true, 'Please add stock quantity'],
        default: 0,
        min: 0
    },
    availability: {
        type: String,
        enum: ['Available', 'Low Stock', 'Out of Stock'],
        default: 'Available'
    },
    minStockLevel: {
        type: Number,
        default: 10
    },
    image: {
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

// Update availability based on stock
PharmaceuticalSchema.pre('save', function() {
    if (this.stockQuantity === 0) {
        this.availability = 'Out of Stock';
    } else if (this.stockQuantity <= this.minStockLevel) {
        this.availability = 'Low Stock';
    } else {
        this.availability = 'Available';
    }
});

module.exports = mongoose.model('Pharmaceutical', PharmaceuticalSchema);
