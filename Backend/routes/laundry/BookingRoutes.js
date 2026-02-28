const express = require('express');
const router = express.Router();
const {
    createBooking,
    getMyBookings,
    getMyShopBookings,
    getShopBookings,
    updateBookingStatus,
    deleteBooking
} = require('../../controllers/laundry/BookingControllers');
const { protect } = require('../../middleware/authMiddleware');

const provider = (req, res, next) => {
    if (req.user && (req.user.role === 'PROVIDER' || req.user.role === 'ADMIN')) {
        next();
    } else {
        res.status(401).json({ message: 'Not authorized as a service provider' });
    }
};

router.route('/')
    .post(protect, createBooking);

router.get('/mybookings', protect, getMyBookings);

router.get('/myshop', protect, provider, getMyShopBookings);

router.get('/shop/:shopId', protect, provider, getShopBookings);

router.put('/:id/status', protect, provider, updateBookingStatus);

router.delete('/:id', protect, deleteBooking);

module.exports = router;
