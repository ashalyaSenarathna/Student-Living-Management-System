const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema({
    pharmaceutical: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pharmaceutical',
        required: true
    },
    quantity: {
        type: Number,
        required: [true, 'Please add quantity'],
        min: 1
    },
    price: {
        type: Number,
        required: true
    }
}, { _id: false });

const OrderSchema = new mongoose.Schema({
    orderId: {
        type: String,
        unique: true,
        required: true
    },
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [OrderItemSchema],
    totalAmount: {
        type: Number,
        required: true,
        min: 0
    },
    deliveryType: {
        type: String,
        enum: ['Pickup', 'Room Delivery'],
        required: [true, 'Please specify delivery type']
    },
    deliveryAddress: {
        type: String,
        required: false
    },
    prescriptionRequired: {
        type: Boolean,
        default: false
    },
    prescriptionFile: {
        type: String,
        required: false
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Ready', 'Delivered', 'Picked Up', 'Rejected', 'Cancelled'],
        default: 'Pending'
    },
    statusHistory: [{
        status: String,
        updatedAt: { type: Date, default: Date.now },
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        remarks: String
    }],
    notes: {
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

// Generate unique order ID before validation runs.
OrderSchema.pre('validate', async function() {
    if (!this.orderId) {
        const count = await mongoose.model('Order').countDocuments();
        const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        this.orderId = `ORD-${dateStr}-${String(count + 1).padStart(4, '0')}`;
    }
});

module.exports = mongoose.model('Order', OrderSchema);
