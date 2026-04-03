const mongoose = require('mongoose');

const foodOrderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    restaurant: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Restaurant'
    },
    items: [{
        menuItemId: {
            type: mongoose.Schema.Types.ObjectId
        },
        name: {
            type: String,
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        price: {
            type: Number,
            required: true
        }
    }],
    totalAmount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Preparing', 'Ready', 'Delivered', 'Cancelled'],
        default: 'Pending'
    },
    customerName: {
        type: String
    },
    notes: {
        type: String,
        default: ''
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('FoodOrder', foodOrderSchema);
