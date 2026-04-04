const Booking = require('../../models/laundry/BookingModels');
const Laundry = require('../../models/laundry/LaundryModels');

const timeToMinutes = (timeStr) => {
    if (!timeStr) return 0;
    const [time, modifier] = timeStr.split(' ');
    let [hours, minutes] = time.split(':');
    hours = parseInt(hours, 10);
    minutes = parseInt(minutes, 10);

    if (modifier === 'PM' && hours !== 12) {
        hours += 12;
    } else if (modifier === 'AM' && hours === 12) {
        hours = 0;
    }
    return hours * 60 + minutes;
};

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private
const createBooking = async (req, res) => {
    try {
        const {
            laundry,
            services,
            pickupDate,
            pickupTime,
            totalPrice,
            notes
        } = req.body;

        if (services && services.length === 0) {
            return res.status(400).json({ message: 'No services selected' });
        }

        // Fetch shop details for time verification
        const shop = await Laundry.findById(laundry);
        if (!shop) {
            return res.status(404).json({ message: 'Laundry shop not found' });
        }

        // Verify if shop is open at the requested pickupTime
        const requestedTimeMins = timeToMinutes(pickupTime);
        const openTimeMins = timeToMinutes(shop.openingTime);
        const closeTimeMins = timeToMinutes(shop.closingTime);

        if (requestedTimeMins < openTimeMins || requestedTimeMins > closeTimeMins) {
            return res.status(400).json({ 
                message: `Booking failed. This shop is only open from ${shop.openingTime} to ${shop.closingTime}.` 
            });
        }

        const booking = new Booking({
            user: req.user._id,
            laundry,
            services,
            pickupDate,
            pickupTime,
            totalPrice,
            notes
        });

        const createdBooking = await booking.save();
        res.status(201).json(createdBooking);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user bookings
// @route   GET /api/bookings/mybookings
// @access  Private
const getMyBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ user: req.user._id })
            .populate('laundry', 'shopName address contactNumber');
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get bookings for the logged-in provider's shop
// @route   GET /api/bookings/myshop
// @access  Private/Provider
const getMyShopBookings = async (req, res) => {
    try {
        const Laundry = require('../../models/laundry/LaundryModels');
        const shop = await Laundry.findOne({ provider: req.user._id });

        if (!shop) {
            return res.status(404).json({ message: 'Shop not found for this provider' });
        }

        const bookings = await Booking.find({ laundry: shop._id })
            .populate('user', 'name email username')
            .sort({ createdAt: -1 });
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get shop bookings (for providers)
// @route   GET /api/bookings/shop/:shopId
// @access  Private/Provider
const getShopBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ laundry: req.params.shopId })
            .populate('user', 'name email username');
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update booking status
// @route   PUT /api/bookings/:id/status
// @access  Private/Provider
const updateBookingStatus = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (booking) {
            booking.status = req.body.status || booking.status;
            booking.paymentStatus = req.body.paymentStatus || booking.paymentStatus;

            const updatedBooking = await booking.save();
            res.json(updatedBooking);
        } else {
            res.status(404).json({ message: 'Booking not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a booking
// @route   DELETE /api/bookings/:id
// @access  Private
const deleteBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (booking) {
            // Check if user is the one who made the booking OR is an admin/provider
            if (booking.user.toString() !== req.user._id.toString() && req.user.role === 'USER') {
                return res.status(401).json({ message: 'User not authorized to delete this booking' });
            }

            await booking.deleteOne();
            res.json({ message: 'Booking removed' });
        } else {
            res.status(404).json({ message: 'Booking not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createBooking,
    getMyBookings,
    getMyShopBookings,
    getShopBookings,
    updateBookingStatus,
    deleteBooking
};
