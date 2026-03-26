const mongoose = require('mongoose');

const InventoryTransactionSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['Purchase', 'Dispensed', 'Order_Completed', 'Stock_Adjustment'],
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    reason: {
        type: String,
        required: true
    },
    reference: {
        type: String,
        required: false
    },
    transactionDate: {
        type: Date,
        default: Date.now
    },
    performedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { _id: false });

const InventorySchema = new mongoose.Schema({
    pharmaceutical: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pharmaceutical',
        required: true,
        unique: true
    },
    currentStock: {
        type: Number,
        required: true,
        default: 0,
        min: 0
    },
    minThreshold: {
        type: Number,
        required: true,
        default: 10
    },
    maxStock: {
        type: Number,
        required: false
    },
    reorderQuantity: {
        type: Number,
        required: false
    },
    lastRestockDate: {
        type: Date,
        required: false
    },
    expiringItems: [{
        batch: String,
        quantity: Number,
        expiryDate: Date
    }],
    transactions: [InventoryTransactionSchema],
    lastUpdated: {
        type: Date,
        default: Date.now
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

module.exports = mongoose.model('Inventory', InventorySchema);
