const mongoose = require('mongoose');

const HostelSchema = new mongoose.Schema({
    name: { type: String, required: true },
    location: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    contact: { type: String, required: true },
    gender: { 
        type: String, 
        enum: ['boys', 'girls', 'mixed'], 
        default: 'mixed' 
    },
    facilities: {
        wifi: { type: Boolean, default: false },
        meals: { type: Boolean, default: false },
        water: { type: Boolean, default: false },
        electricity: { type: Boolean, default: false },
        parking: { type: Boolean, default: false }
    },
    rooms: [{
        roomNo: { type: String },
        totalBeds: { type: Number },
        availableBeds: { type: Number }
    }],
    images: [{ type: String }], // Array of Base64 strings or URLs
    status: { 
        type: String, 
        enum: ['pending', 'approved', 'rejected'], 
        default: 'pending' 
    },
    owner: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    isFeatured: { type: Boolean, default: false },
    ratings: [
        {
            user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
            userName: { type: String, required: true },
            rating: { type: Number, required: true },
            comment: { type: String, required: true },
        }
    ],
    averageRating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
}, { timestamps: true });

// Index for search functionality
HostelSchema.index({ name: 'text', location: 'text' });

module.exports = mongoose.model('Hostel', HostelSchema);
