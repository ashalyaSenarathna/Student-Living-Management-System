const FoodOrder = require('../../models/food/FoodOrderModels');
const Restaurant = require('../../models/food/FoodModels');

const PROVIDER_ALLOWED_STATUS_UPDATES = ['Preparing', 'Ready', 'Delivered'];

// @desc    Create food order
// @route   POST /api/food/orders
// @access  Private
const createFoodOrder = async (req, res) => {
    try {
        if (req.user?.role === 'FOOD_PROVIDER') {
            return res.status(403).json({ message: 'Food providers can view menus and reviews, but cannot place orders' });
        }

        const { restaurantId, items, totalAmount, notes } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ message: 'No items in order' });
        }

        const restaurant = await Restaurant.findById(restaurantId);
        if (!restaurant) {
            return res.status(404).json({ message: 'Restaurant not found' });
        }

        const order = new FoodOrder({
            user: req.user._id,
            restaurant: restaurantId,
            items,
            totalAmount,
            customerName: req.user.name,
            notes: notes || ''
        });

        const created = await order.save();

        // Populate restaurant name for the response
        await created.populate('restaurant', 'restaurantName address');
        res.status(201).json(created);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get current user's food orders
// @route   GET /api/food/orders/my
// @access  Private
const getMyFoodOrders = async (req, res) => {
    try {
        const orders = await FoodOrder.find({ user: req.user._id })
            .populate('restaurant', 'restaurantName address image')
            .sort({ createdAt: -1 });

        // Flatten restaurantName into each order for convenience
        const result = orders.map(o => ({
            ...o.toObject(),
            restaurantName: o.restaurant?.restaurantName || 'Restaurant'
        }));

        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all orders for the provider's restaurant
// @route   GET /api/food/orders/restaurant
// @access  Private/FoodProvider
const getRestaurantOrders = async (req, res) => {
    try {
        const restaurant = await Restaurant.findOne({ provider: req.user._id });

        if (!restaurant) {
            return res.status(404).json({ message: 'No restaurant found for this provider' });
        }

        const orders = await FoodOrder.find({ restaurant: restaurant._id })
            .populate('user', 'name email username')
            .sort({ createdAt: -1 });

        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all food orders (Admin)
// @route   GET /api/food/orders/all
// @access  Private/Admin
const getAllFoodOrders = async (req, res) => {
    try {
        const orders = await FoodOrder.find({})
            .populate('user', 'name email')
            .populate('restaurant', 'restaurantName address')
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update food order status
// @route   PUT /api/food/orders/:id/status
// @access  Private/FoodProvider or Admin
const updateFoodOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;

        if (!PROVIDER_ALLOWED_STATUS_UPDATES.includes(status)) {
            return res.status(400).json({
                message: 'Invalid status. Use Preparing, Ready, or Delivered.'
            });
        }

        const order = await FoodOrder.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Verify the provider owns this order's restaurant (or is admin)
        if (req.user.role !== 'ADMIN') {
            const restaurant = await Restaurant.findOne({ provider: req.user._id });
            if (!restaurant || order.restaurant.toString() !== restaurant._id.toString()) {
                return res.status(401).json({ message: 'Not authorized to update this order' });
            }
        }

        order.status = status;
        const updated = await order.save();
        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Cancel (user cancels own order)
// @route   PUT /api/food/orders/:id/cancel
// @access  Private
const cancelFoodOrder = async (req, res) => {
    try {
        const order = await FoodOrder.findById(req.params.id).populate('restaurant');

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        const isOrderOwner = order.user.toString() === req.user._id.toString();
        const isAdmin = req.user.role === 'ADMIN';
        const isProvider = req.user.role === 'FOOD_PROVIDER' && order.restaurant?.provider?.toString() === req.user._id.toString();

        if (!isOrderOwner && !isAdmin && !isProvider) {
            return res.status(401).json({ message: 'Not authorized to cancel this order' });
        }

        if (order.status !== 'Pending') {
            return res.status(400).json({ message: 'Can only cancel pending orders' });
        }

        order.status = 'Cancelled';
        await order.save();
        res.json({ message: 'Order cancelled', order });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createFoodOrder,
    getMyFoodOrders,
    getRestaurantOrders,
    getAllFoodOrders,
    updateFoodOrderStatus,
    cancelFoodOrder
};
