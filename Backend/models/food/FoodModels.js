const mongoose = require('mongoose');

const contactRegex = /^\d{10}$/;
const timeRegex = /^(0[1-9]|1[0-2]):[0-5][0-9]\s(AM|PM)$/;

const menuItemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add an item name']
    },
    category: {
        type: String,
        default: 'General'
    },
    price: {
        type: Number,
        required: [true, 'Please add a price']
    },
    description: {
        type: String,
        default: ''
    },
    image: {
        type: String,
        default: ''
    },
    isVeg: {
        type: Boolean,
        default: false
    },
    isAvailable: {
        type: Boolean,
        default: true
    }
});

const restaurantSchema = new mongoose.Schema({
    provider: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    restaurantName: {
        type: String,
        required: [true, 'Please add a restaurant name']
    },
    address: {
        type: String,
        required: [true, 'Please add an address']
    },
    contactNumber: {
        type: String,
        required: [true, 'Please add a contact number'],
        match: [contactRegex, 'Contact number must be exactly 10 digits']
    },
    image: {
        type: String,
        default: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80'
    },
    cuisineTypes: {
        type: [String],
        default: []
    },
    menuItems: [menuItemSchema],
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
        default: '08:00 AM',
        match: [timeRegex, 'Opening time must be in hh:mm AM/PM format']
    },
    closingTime: {
        type: String,
        default: '10:00 PM',
        match: [timeRegex, 'Closing time must be in hh:mm AM/PM format']
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Restaurant', restaurantSchema);
