const mongoose = require('mongoose');

const laundrySchema = new mongoose.Schema({
    provider: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    shopName: {
        type: String,
        required: [true, 'Please add a shop name']
    },
    address: {
        type: String,
        required: [true, 'Please add an address']
    },
    contactNumber: {
        type: String,
        required: [true, 'Please add a contact number']
    },
    services: [{
        name: String, // e.g., 'Washing', 'Dry Cleaning'
        price: Number,
        unit: String // e.g., 'kg', 'item'
    }],
    image: {
        type: String,
        default: 'https://images.unsplash.com/photo-1545173168-9f1947eebb7f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    },
    rating: {
        type: Number,
        default: 0
    },
    reviews: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        name: String,
        rating: {
            type: Number,
            required: true
        },
        comment: {
            type: String,
            required: true
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    reviewsCount: {
        type: Number,
        default: 0
    },
    isOpen: {
        type: Boolean,
        default: true
    },
    openingTime: {
        type: String,
        default: '08:00 AM'
    },
    closingTime: {
        type: String,
        default: '08:00 PM'
    },
    openingDays: {
        type: String,
        default: 'Mon - Sat'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Laundry', laundrySchema);
