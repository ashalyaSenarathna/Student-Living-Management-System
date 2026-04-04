const Laundry = require('../../models/laundry/LaundryModels');
const Booking = require('../../models/laundry/BookingModels');

// @desc    Get all laundry shops
// @route   GET /api/laundry
// @access  Public
const getAllLaundries = async (req, res) => {
    try {
        const laundries = await Laundry.find({}).populate('provider', 'name email');
        res.json(laundries);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single laundry shop
// @route   GET /api/laundry/:id
// @access  Public
const getLaundryById = async (req, res) => {
    try {
        const laundry = await Laundry.findById(req.params.id).populate('provider', 'name email');
        if (laundry) {
            res.json(laundry);
        } else {
            res.status(404).json({ message: 'Laundry shop not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a laundry shop
// @route   POST /api/laundry
// @access  Private/Provider
const createLaundry = async (req, res) => {
    try {
        const { shopName, address, contactNumber, services, image, openingTime, closingTime, openingDays } = req.body;

        // Check how many shops the provider already has
        const shopCount = await Laundry.countDocuments({ provider: req.user._id });

        if (shopCount >= 3) {
            return res.status(400).json({ message: 'Each provider can manage a maximum of 3 laundry shops' });
        }

        const laundry = new Laundry({
            provider: req.user._id,
            shopName,
            address,
            contactNumber,
            services,
            image,
            openingTime,
            closingTime,
            openingDays
        });

        const createdLaundry = await laundry.save();
        res.status(201).json(createdLaundry);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update laundry shop
// @route   PUT /api/laundry/:id
// @access  Private/Provider
const updateLaundry = async (req, res) => {
    try {
        const laundry = await Laundry.findById(req.params.id);

        if (laundry) {
            if (laundry.provider.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
                return res.status(401).json({ message: 'Not authorized to update this shop' });
            }

            laundry.shopName = req.body.shopName || laundry.shopName;
            laundry.address = req.body.address || laundry.address;
            laundry.contactNumber = req.body.contactNumber || laundry.contactNumber;
            laundry.services = req.body.services || laundry.services;
            laundry.image = req.body.image !== undefined ? req.body.image : laundry.image;
            laundry.isOpen = req.body.isOpen !== undefined ? req.body.isOpen : laundry.isOpen;
            laundry.openingTime = req.body.openingTime || laundry.openingTime;
            laundry.closingTime = req.body.closingTime || laundry.closingTime;
            laundry.openingDays = req.body.openingDays || laundry.openingDays;

            const updatedLaundry = await laundry.save();
            res.json(updatedLaundry);
        } else {
            res.status(404).json({ message: 'Laundry shop not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create new review
// @route   POST /api/laundry/:id/reviews
// @access  Private
const createLaundryReview = async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const laundry = await Laundry.findById(req.params.id);

        if (laundry) {
            const alreadyReviewed = laundry.reviews.find(
                (r) => r.user.toString() === req.user._id.toString()
            );

            if (alreadyReviewed) {
                return res.status(400).json({ message: 'Laundry already reviewed' });
            }

            const review = {
                name: req.user.name,
                rating: Number(rating),
                comment,
                user: req.user._id,
            };

            laundry.reviews.push(review);
            laundry.reviewsCount = laundry.reviews.length;
            laundry.rating =
                laundry.reviews.reduce((acc, item) => item.rating + acc, 0) /
                laundry.reviews.length;

            await laundry.save();
            res.status(201).json({ message: 'Review added' });
        } else {
            res.status(404).json({ message: 'Laundry shop not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get laundry shops by provider
// @route   GET /api/laundry/my-shop
// @access  Private/Provider
const getLaundryByProvider = async (req, res) => {
    try {
        const laundries = await Laundry.find({ provider: req.user._id });
        res.json(laundries); // Returns an array (even if empty)
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete laundry shop
// @route   DELETE /api/laundry/:id
// @access  Private/Provider
const deleteLaundry = async (req, res) => {
    try {
        const laundry = await Laundry.findById(req.params.id);

        if (!laundry) {
            return res.status(404).json({ message: 'Laundry shop not found' });
        }

        // Check ownership
        if (laundry.provider.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
            return res.status(401).json({ message: 'Not authorized to delete this shop' });
        }

        await Laundry.findByIdAndDelete(req.params.id);
        
        // Cleanup related bookings
        await Booking.deleteMany({ laundry: req.params.id });

        res.json({ message: 'Laundry shop and related bookings removed successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAllLaundries,
    getLaundryById,
    createLaundry,
    updateLaundry,
    createLaundryReview,
    getLaundryByProvider,
    deleteLaundry
};
