const express = require('express');
const router = express.Router();
const { protect, admin } = require('../../middleware/authMiddleware');
const {
    createInventoryEntry,
    getInventoryEntry,
    getAllInventory,
    getInventoryByPharmaceutical,
    addStock,
    adjustStock,
    getLowStockItems,
    getInventoryReport,
    getTransactionHistory
} = require('../../controllers/health/InventoryController');

// Admin routes
router.post('/', protect, admin, createInventoryEntry);
router.get('/', protect, admin, getAllInventory);
router.get('/low-stock', protect, admin, getLowStockItems);
router.get('/report', protect, admin, getInventoryReport);
router.get('/:id', protect, admin, getInventoryEntry);
router.get('/pharmaceutical/:id', protect, admin, getInventoryByPharmaceutical);
router.post('/:id/add-stock', protect, admin, addStock);
router.post('/:id/adjust', protect, admin, adjustStock);
router.get('/:id/transactions', protect, admin, getTransactionHistory);

module.exports = router;
