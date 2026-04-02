const express = require('express');
const router = express.Router();
const {
    getAllRestaurants,
    getRestaurantById,
    getMyRestaurant,
    createRestaurant,
    updateRestaurant,
    deleteRestaurant,
    createRestaurantReview
} = require('../../controllers/food/FoodControllers');
const {
    createFoodOrder,
    getMyFoodOrders,
    getRestaurantOrders,
    getAllFoodOrders,
    updateFoodOrderStatus,
    cancelFoodOrder
} = require('../../controllers/food/FoodOrderControllers');
const {
    createMealPlan,
    getMyMealPlans,
    getRestaurantMealPlans,
    getAllMealPlans,
    updateMealPlanStatus,
    deleteMealPlan
} = require('../../controllers/food/MealPlanControllers');
const { protect, admin } = require('../../middleware/authMiddleware');

const foodProvider = (req, res, next) => {
    if (req.user && (req.user.role === 'FOOD_PROVIDER' || req.user.role === 'ADMIN')) {
        next();
    } else {
        res.status(401).json({ message: 'Not authorized as a food provider' });
    }
};

const disallowFoodProviderMealPlanCreate = (req, res, next) => {
    if (req.user && req.user.role === 'FOOD_PROVIDER') {
        return res.status(403).json({ message: 'Food providers cannot create meal plans' });
    }
    next();
};

// Middleware: Allow student to update their own plans or food provider to update their restaurant's plans
const mealPlanUpdateAuth = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Not authenticated' });
    }
    
    // Admin can do anything
    if (req.user.role === 'ADMIN') {
        return next();
    }
    
    // Food provider can update (will check ownership in controller)
    if (req.user.role === 'FOOD_PROVIDER') {
        return next();
    }
    
    // User/Student can update their own plans (will check ownership in controller)
    if (req.user.role === 'USER') {
        return next();
    }
    
    res.status(401).json({ message: 'Not authorized to update meal plans' });
};

// Restaurant routes
router.route('/')
    .get(getAllRestaurants)
    .post(protect, foodProvider, createRestaurant);

router.route('/my-restaurant').get(protect, foodProvider, getMyRestaurant);

// Meal plan routes
router.route('/meal-plans').post(protect, disallowFoodProviderMealPlanCreate, createMealPlan);

router.route('/meal-plans/my').get(protect, getMyMealPlans);

router.route('/meal-plans/restaurant').get(protect, foodProvider, getRestaurantMealPlans);

router.route('/meal-plans/all').get(protect, admin, getAllMealPlans);

router.route('/meal-plans/:id/status').put(protect, mealPlanUpdateAuth, updateMealPlanStatus);

router.route('/meal-plans/:id').delete(protect, deleteMealPlan);

router.route('/:id')
    .get(getRestaurantById)
    .put(protect, foodProvider, updateRestaurant)
    .delete(protect, foodProvider, deleteRestaurant);

router.route('/:id/reviews').post(protect, createRestaurantReview);

// Order routes
router.route('/orders').post(protect, createFoodOrder);

router.route('/orders/my').get(protect, getMyFoodOrders);

router.route('/orders/restaurant').get(protect, foodProvider, getRestaurantOrders);

router.route('/orders/all').get(protect, admin, getAllFoodOrders);

router.route('/orders/:id/status').put(protect, foodProvider, updateFoodOrderStatus);

router.route('/orders/:id/cancel').put(protect, cancelFoodOrder);

module.exports = router;