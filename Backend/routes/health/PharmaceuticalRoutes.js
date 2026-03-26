const express = require('express');
const router = express.Router();
const { protect, admin } = require('../../middleware/authMiddleware');
const {
    getAllPharmaceuticals,
    getPharmaceutical,
    createPharmaceutical,
    updatePharmaceutical,
    deletePharmaceutical,
    getLowStockItems,
    getExpiredItems
} = require('../../controllers/health/PharmaceuticalController');

// Admin routes
router.post('/', protect, admin, createPharmaceutical);
router.put('/:id', protect, admin, updatePharmaceutical);
router.delete('/:id', protect, admin, deletePharmaceutical);
router.get('/admin/low-stock', protect, admin, getLowStockItems);
router.get('/admin/expired', protect, admin, getExpiredItems);

// Public routes
router.get('/', getAllPharmaceuticals);
router.get('/:id', getPharmaceutical);

module.exports = router;
