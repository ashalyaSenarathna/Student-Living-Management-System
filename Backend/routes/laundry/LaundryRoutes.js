const express = require('express');
const router = express.Router();
const {
    getAllLaundries,
    getLaundryById,
    createLaundry,
    updateLaundry,
    createLaundryReview,
    getLaundryByProvider,
    deleteLaundry
} = require('../../controllers/laundry/LaundryControllers');
const { protect } = require('../../middleware/authMiddleware');

const provider = (req, res, next) => {
    if (req.user && (req.user.role === 'PROVIDER' || req.user.role === 'ADMIN')) {
        next();
    } else {
        res.status(401).json({ message: 'Not authorized as a service provider' });
    }
};

router.route('/my-shop').get(protect, provider, getLaundryByProvider);

router.route('/')
    .get(getAllLaundries)
    .post(protect, provider, createLaundry);

router.route('/:id/reviews').post(protect, createLaundryReview);

router.route('/:id')
    .get(getLaundryById)
    .put(protect, provider, updateLaundry)
    .delete(protect, provider, deleteLaundry);

module.exports = router;
