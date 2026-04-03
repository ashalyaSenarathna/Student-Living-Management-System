const mongoose = require('mongoose');

const mealPlanSchema = new mongoose.Schema(
    {
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
        studentName: {
            type: String,
            required: [true, 'Please add a student name']
        },
        studentId: {
            type: String,
            required: [true, 'Please add a student ID']
        },
        contactNumber: {
            type: String,
            required: [true, 'Please add a contact number']
        },
        hostelName: {
            type: String,
            required: [true, 'Please add a hostel name']
        },
        roomNumber: {
            type: String,
            default: ''
        },
        dietaryPreference: {
            type: String,
            enum: ['None', 'Vegetarian', 'Vegan', 'Halal', 'Gluten Free'],
            default: 'None'
        },
        planType: {
            type: String,
            enum: ['BASIC', 'STANDARD', 'PREMIUM'],
            required: true
        },
        durationWeeks: {
            type: Number,
            required: true,
            min: 1,
            max: 12
        },
        meals: {
            breakfast: {
                type: Boolean,
                default: true
            },
            lunch: {
                type: Boolean,
                default: true
            },
            dinner: {
                type: Boolean,
                default: true
            }
        },
        startDate: {
            type: Date,
            required: true
        },
        specialNotes: {
            type: String,
            default: ''
        },
        totalPrice: {
            type: Number,
            required: true
        },
        status: {
            type: String,
            enum: ['Active', 'Paused', 'Cancelled'],
            default: 'Active'
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('MealPlan', mealPlanSchema);
