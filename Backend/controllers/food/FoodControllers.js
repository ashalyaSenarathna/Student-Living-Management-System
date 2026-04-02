const Restaurant = require('../../models/food/FoodModels');
const contactRegex = /^\d{10}$/;
const timeRegex = /^(0[1-9]|1[0-2]):[0-5][0-9]\s(AM|PM)$/;

const toMinutes = (time) => {
    const [clock, period] = String(time).split(' ');
    let [hours, minutes] = clock.split(':').map(Number);
    if (period === 'AM' && hours === 12) hours = 0;
    if (period === 'PM' && hours !== 12) hours += 12;
    return hours * 60 + minutes;
};

const buildValidationMessage = (error) => {
    if (error?.name !== 'ValidationError') {
        return null;
    }

    const messages = Object.values(error.errors || {}).map((e) => e.message).filter(Boolean);
    return messages.length ? messages[0] : 'Validation failed';
};

const validateRestaurantFields = ({ contactNumber, openingTime, closingTime }) => {
    if (contactNumber !== undefined && !contactRegex.test(String(contactNumber))) {
        return 'Contact number must be exactly 10 digits';
    }

    if (openingTime !== undefined && !timeRegex.test(String(openingTime))) {
        return 'Opening time must be in hh:mm AM/PM format';
    }

    if (closingTime !== undefined && !timeRegex.test(String(closingTime))) {
        return 'Closing time must be in hh:mm AM/PM format';
    }

    if (
        openingTime !== undefined &&
        closingTime !== undefined &&
        timeRegex.test(String(openingTime)) &&
        timeRegex.test(String(closingTime)) &&
        toMinutes(closingTime) <= toMinutes(openingTime)
    ) {
        return 'Closing time must be later than opening time';
    }

    return null;
};

// @desc    Get all restaurants
// @route   GET /api/food
// @access  Public
const getAllRestaurants = async (req, res) => {
    try {
        const restaurants = await Restaurant.find({}).populate('provider', 'name email');
        res.json(restaurants);
    } catch (error) {
        const validationMessage = buildValidationMessage(error);
        if (validationMessage) {
            return res.status(400).json({ message: validationMessage });
        }

        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single restaurant
// @route   GET /api/food/:id
// @access  Public
const getRestaurantById = async (req, res) => {
    try {
        const restaurant = await Restaurant.findById(req.params.id).populate('provider', 'name email');
        if (restaurant) {
            res.json(restaurant);
        } else {
            res.status(404).json({ message: 'Restaurant not found' });
        }
    } catch (error) {
        const validationMessage = buildValidationMessage(error);
        if (validationMessage) {
            return res.status(400).json({ message: validationMessage });
        }

        res.status(500).json({ message: error.message });
    }
};

// @desc    Get provider's own restaurant
// @route   GET /api/food/my-restaurant
// @access  Private/FoodProvider
const getMyRestaurant = async (req, res) => {
    try {
        const restaurant = await Restaurant.findOne({ provider: req.user._id });
        if (restaurant) {
            res.json(restaurant);
        } else {
            res.status(404).json({ message: 'No restaurant found for this provider' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a restaurant
// @route   POST /api/food
// @access  Private/FoodProvider
const createRestaurant = async (req, res) => {
    try {
        const { restaurantName, address, contactNumber, image, openingTime, closingTime, cuisineTypes, menuItems } = req.body;

        const fieldError = validateRestaurantFields({ contactNumber, openingTime, closingTime });
        if (fieldError) {
            return res.status(400).json({ message: fieldError });
        }

        // One restaurant per provider
        const existing = await Restaurant.findOne({ provider: req.user._id });
        if (existing) {
            return res.status(400).json({ message: 'Provider already has a registered restaurant. Please update it instead.' });
        }

        const restaurant = new Restaurant({
            provider: req.user._id,
            restaurantName,
            address,
            contactNumber,
            image,
            openingTime,
            closingTime,
            cuisineTypes: cuisineTypes || [],
            menuItems: menuItems || []
        });

        const created = await restaurant.save();
        res.status(201).json(created);
    } catch (error) {
        const validationMessage = buildValidationMessage(error);
        if (validationMessage) {
            return res.status(400).json({ message: validationMessage });
        }

        res.status(500).json({ message: error.message });
    }
};

// @desc    Update restaurant
// @route   PUT /api/food/:id
// @access  Private/FoodProvider
const updateRestaurant = async (req, res) => {
    try {
        const restaurant = await Restaurant.findById(req.params.id);

        if (!restaurant) {
            return res.status(404).json({ message: 'Restaurant not found' });
        }

        if (restaurant.provider.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
            return res.status(401).json({ message: 'Not authorized to update this restaurant' });
        }

        const fieldError = validateRestaurantFields({
            contactNumber: req.body.contactNumber,
            openingTime: req.body.openingTime,
            closingTime: req.body.closingTime
        });
        if (fieldError) {
            return res.status(400).json({ message: fieldError });
        }

        restaurant.restaurantName = req.body.restaurantName || restaurant.restaurantName;
        restaurant.address = req.body.address || restaurant.address;
        restaurant.contactNumber = req.body.contactNumber || restaurant.contactNumber;
        restaurant.image = req.body.image !== undefined ? req.body.image : restaurant.image;
        restaurant.openingTime = req.body.openingTime || restaurant.openingTime;
        restaurant.closingTime = req.body.closingTime || restaurant.closingTime;
        restaurant.cuisineTypes = req.body.cuisineTypes !== undefined ? req.body.cuisineTypes : restaurant.cuisineTypes;
        restaurant.menuItems = req.body.menuItems !== undefined ? req.body.menuItems : restaurant.menuItems;
        restaurant.isOpen = req.body.isOpen !== undefined ? req.body.isOpen : restaurant.isOpen;

        const updated = await restaurant.save();
        res.json(updated);
    } catch (error) {
        const validationMessage = buildValidationMessage(error);
        if (validationMessage) {
            return res.status(400).json({ message: validationMessage });
        }

        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete restaurant
// @route   DELETE /api/food/:id
// @access  Private/Admin or Owner
const deleteRestaurant = async (req, res) => {
    try {
        const restaurant = await Restaurant.findById(req.params.id);

        if (!restaurant) {
            return res.status(404).json({ message: 'Restaurant not found' });
        }

        if (restaurant.provider.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
            return res.status(401).json({ message: 'Not authorized to delete this restaurant' });
        }

        await restaurant.deleteOne();
        res.json({ message: 'Restaurant removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a review for a restaurant
// @route   POST /api/food/:id/reviews
// @access  Private
const createRestaurantReview = async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const restaurant = await Restaurant.findById(req.params.id);

        if (!restaurant) {
            return res.status(404).json({ message: 'Restaurant not found' });
        }

        const alreadyReviewed = restaurant.reviews.find(
            (r) => r.user.toString() === req.user._id.toString()
        );

        if (alreadyReviewed) {
            return res.status(400).json({ message: 'Restaurant already reviewed by you' });
        }

        const review = {
            name: req.user.name,
            rating: Number(rating),
            comment,
            user: req.user._id
        };

        restaurant.reviews.push(review);
        restaurant.reviewsCount = restaurant.reviews.length;
        restaurant.rating =
            restaurant.reviews.reduce((acc, item) => item.rating + acc, 0) /
            restaurant.reviews.length;

        await restaurant.save();
        res.status(201).json({ message: 'Review added' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAllRestaurants,
    getRestaurantById,
    getMyRestaurant,
    createRestaurant,
    updateRestaurant,
    deleteRestaurant,
    createRestaurantReview
};
