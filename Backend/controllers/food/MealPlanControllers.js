const MealPlan = require('../../models/food/MealPlanModels');
const Restaurant = require('../../models/food/FoodModels');

const PLAN_BASE_PRICES = {
    BASIC: 3500,
    STANDARD: 5000,
    PREMIUM: 7000
};

// Meal pricing percentages - sum equals 1.0
const MEAL_PRICING = {
    breakfast: 0.30,  // 30% of base plan price
    lunch: 0.35,      // 35% of base plan price
    dinner: 0.35      // 35% of base plan price
};

// @desc    Create a meal plan
// @route   POST /api/food/meal-plans
// @access  Private
const createMealPlan = async (req, res) => {
    try {
        if (req.user?.role === 'FOOD_PROVIDER') {
            return res.status(403).json({ message: 'Food providers can view menus and reviews, but cannot create meal plans' });
        }

        const contactRegex = /^\d{10}$/;

        const {
            restaurantId,
            studentName,
            studentId,
            contactNumber,
            hostelName,
            roomNumber,
            dietaryPreference,
            planType,
            durationWeeks,
            meals,
            startDate,
            specialNotes
        } = req.body;

        const restaurant = await Restaurant.findById(restaurantId);
        if (!restaurant) {
            return res.status(404).json({ message: 'Restaurant not found' });
        }

        if (!PLAN_BASE_PRICES[planType]) {
            return res.status(400).json({ message: 'Invalid meal plan type' });
        }

        const duration = Number(durationWeeks);
        if (!duration || duration < 1 || duration > 12) {
            return res.status(400).json({ message: 'Duration must be between 1 and 12 weeks' });
        }

        if (!contactRegex.test(String(contactNumber || ''))) {
            return res.status(400).json({ message: 'Contact number must be exactly 10 digits' });
        }

        const selectedDate = new Date(startDate);
        selectedDate.setHours(0, 0, 0, 0);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (Number.isNaN(selectedDate.getTime()) || selectedDate < today) {
            return res.status(400).json({ message: 'Start date cannot be in the past' });
        }

        const selectedMeals = {
            breakfast: !!meals?.breakfast,
            lunch: !!meals?.lunch,
            dinner: !!meals?.dinner
        };

        if (!selectedMeals.breakfast && !selectedMeals.lunch && !selectedMeals.dinner) {
            return res.status(400).json({ message: 'Select at least one meal option' });
        }

        // Calculate total price based on selected meals
        const basePrice = PLAN_BASE_PRICES[planType];
        let mealMultiplier = 0;
        
        if (selectedMeals.breakfast) mealMultiplier += MEAL_PRICING.breakfast;
        if (selectedMeals.lunch) mealMultiplier += MEAL_PRICING.lunch;
        if (selectedMeals.dinner) mealMultiplier += MEAL_PRICING.dinner;
        
        const totalPrice = Math.round(basePrice * mealMultiplier * duration);

        const mealPlan = new MealPlan({
            user: req.user._id,
            restaurant: restaurantId,
            studentName,
            studentId,
            contactNumber,
            hostelName,
            roomNumber: roomNumber || '',
            dietaryPreference: dietaryPreference || 'None',
            planType,
            durationWeeks: duration,
            meals: selectedMeals,
            startDate,
            specialNotes: specialNotes || '',
            totalPrice
        });

        const created = await mealPlan.save();
        await created.populate('restaurant', 'restaurantName image address');

        res.status(201).json(created);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get current user's meal plans
// @route   GET /api/food/meal-plans/my
// @access  Private
const getMyMealPlans = async (req, res) => {
    try {
        const plans = await MealPlan.find({ user: req.user._id })
            .populate('restaurant', 'restaurantName image address')
            .sort({ createdAt: -1 });

        res.json(plans);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get meal plans for provider's restaurant
// @route   GET /api/food/meal-plans/restaurant
// @access  Private/FoodProvider
const getRestaurantMealPlans = async (req, res) => {
    try {
        const restaurant = await Restaurant.findOne({ provider: req.user._id });

        if (!restaurant) {
            return res.status(404).json({ message: 'Restaurant not found for this provider' });
        }

        const plans = await MealPlan.find({ restaurant: restaurant._id })
            .populate('restaurant', 'restaurantName image address')
            .populate('user', 'name username email')
            .sort({ createdAt: -1 });

        res.json(plans);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all meal plans (Admin)
// @route   GET /api/food/meal-plans/all
// @access  Private/Admin
const getAllMealPlans = async (req, res) => {
    try {
        const plans = await MealPlan.find({})
            .populate('restaurant', 'restaurantName image address')
            .populate('user', 'name username email')
            .sort({ createdAt: -1 });

        res.json(plans);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update meal plan status (provider manage plans)
// @route   PUT /api/food/meal-plans/:id/status
// @desc    Update meal plan status (student updates own plan or provider manages their plans)
// @route   PUT /api/food/meal-plans/:id/status
// @access  Private
const PROVIDER_ALLOWED_STATUS_UPDATES = ['Active', 'Paused', 'Cancelled'];

const updateMealPlanStatus = async (req, res) => {
    try {
        const { status, specialNotes } = req.body;

        if (!PROVIDER_ALLOWED_STATUS_UPDATES.includes(status)) {
            return res.status(400).json({
                message: 'Invalid status. Use Active, Paused, or Cancelled.'
            });
        }

        const mealPlan = await MealPlan.findById(req.params.id);

        if (!mealPlan) {
            return res.status(404).json({ message: 'Meal plan not found' });
        }

        // Authorization: Check if user is admin, plan owner (student), or provider managing this plan
        if (req.user.role === 'ADMIN') {
            // Admin can update any plan - proceed
        } else if (req.user.role === 'USER' || !req.user.role) {
            // User/Student can only update their own plans
            if (mealPlan.user.toString() !== req.user._id.toString()) {
                return res.status(401).json({ message: 'Not authorized to update this meal plan' });
            }
        } else if (req.user.role === 'FOOD_PROVIDER') {
            // Provider can only update plans for their restaurant
            const restaurant = await Restaurant.findOne({ provider: req.user._id });
            if (!restaurant || mealPlan.restaurant.toString() !== restaurant._id.toString()) {
                return res.status(401).json({ message: 'Not authorized to update this meal plan' });
            }
        } else {
            return res.status(401).json({ message: 'Not authorized to update meal plans' });
        }

        mealPlan.status = status;
        if (specialNotes !== undefined) {
            mealPlan.specialNotes = specialNotes || '';
        }
        const updated = await mealPlan.save();
        // Populate restaurant and user details before sending response
        await updated.populate('restaurant', 'restaurantName image address');
        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete meal plan (student only)
// @route   DELETE /api/food/meal-plans/:id
// @access  Private
const deleteMealPlan = async (req, res) => {
    try {
        const mealPlan = await MealPlan.findById(req.params.id);

        if (!mealPlan) {
            return res.status(404).json({ message: 'Meal plan not found' });
        }

        // Verify the user owns this meal plan (or is admin)
        if (req.user.role !== 'ADMIN' && mealPlan.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized to delete this meal plan' });
        }

        await MealPlan.deleteOne({ _id: req.params.id });
        res.json({ message: 'Meal plan deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createMealPlan,
    getMyMealPlans,
    getRestaurantMealPlans,
    getAllMealPlans,
    updateMealPlanStatus,
    deleteMealPlan
};
