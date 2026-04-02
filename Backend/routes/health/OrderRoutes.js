const express = require('express');
const router = express.Router();
const { protect, admin } = require('../../middleware/authMiddleware');
const {
    createOrder,
    getStudentOrders,
    getOrderById,
    getAllOrders,
    updateOrderStatus,
    cancelOrder
} = require('../../controllers/health/OrderController');

// Student routes
router.post('/', protect, createOrder);
router.get('/my-orders', protect, getStudentOrders);
router.get('/:id', protect, getOrderById);
router.put('/:id/cancel', protect, cancelOrder);

// Admin routes
router.get('/admin/all', protect, admin, getAllOrders);
router.put('/:id/status', protect, admin, updateOrderStatus);

module.exports = router;
