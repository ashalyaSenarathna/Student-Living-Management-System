import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Star, MapPin, Phone, Clock, ShoppingCart, Plus, Minus, X, ChevronRight } from 'lucide-react';
import './FoodDetails.css';

const mealPlanOptions = [
    {
        value: 'BASIC',
        label: 'Basic Plan',
        pricePerWeek: 3500,
        description: 'Budget-friendly everyday meals.'
    },
    {
        value: 'STANDARD',
        label: 'Standard Plan',
        pricePerWeek: 5000,
        description: 'Balanced meals with wider menu variety.'
    },
    {
        value: 'PREMIUM',
        label: 'Premium Plan',
        pricePerWeek: 7000,
        description: 'High variety plan with chef specials.'
    }
];

// Meal pricing percentages - sum should equal 1.0
const MEAL_PRICING = {
    breakfast: 0.30,  // 30% of base plan price
    lunch: 0.35,      // 35% of base plan price
    dinner: 0.35      // 35% of base plan price
};

const FoodDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [restaurant, setRestaurant] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [cart, setCart] = useState({});
    const [orderPlaced, setOrderPlaced] = useState(false);
    const [orderPlacing, setOrderPlacing] = useState(false);
    const [activeCategory, setActiveCategory] = useState('All');
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [reviewMsg, setReviewMsg] = useState('');
    const [submittingReview, setSubmittingReview] = useState(false);
    const [mealPlanSubmitting, setMealPlanSubmitting] = useState(false);
    const [mealPlanMsg, setMealPlanMsg] = useState('');
    const [mealPlanForm, setMealPlanForm] = useState({
        studentName: '',
        studentId: '',
        contactNumber: '',
        hostelName: '',
        roomNumber: '',
        dietaryPreference: 'None',
        planType: 'STANDARD',
        durationWeeks: 4,
        startDate: '',
        specialNotes: '',
        meals: {
            breakfast: true,
            lunch: true,
            dinner: true
        }
    });
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    const isFoodProvider = userInfo?.role?.toUpperCase() === 'FOOD_PROVIDER';
    const contactRegex = /^\d{10}$/;

    useEffect(() => {
        const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
        if (userInfo?.name) {
            setMealPlanForm(prev => ({ ...prev, studentName: userInfo.name }));
        }
    }, []);

    const getImageUrl = (imagePath, fallback) => {
        if (!imagePath) return fallback;
        if (imagePath.startsWith('http')) return imagePath;
        return `http://localhost:5000/${imagePath.replace(/\\/g, '/')}`;
    };

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const res = await fetch(`http://localhost:5000/api/food/${id}`);
                const data = await res.json();
                if (res.ok) setRestaurant(data);
                else setError(data.message || 'Failed to fetch details');
            } catch {
                setError('Connection error');
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [id]);

    const addToCart = (item) => {
        setCart(prev => ({ ...prev, [item._id]: (prev[item._id] || 0) + 1 }));
    };

    const removeFromCart = (item) => {
        setCart(prev => {
            const updated = { ...prev };
            if (updated[item._id] > 1) updated[item._id]--;
            else delete updated[item._id];
            return updated;
        });
    };

    const getTotalItems = () => Object.values(cart).reduce((a, b) => a + b, 0);
    const getTotalPrice = () => {
        return (restaurant?.menuItems || []).reduce((total, item) => {
            return total + (cart[item._id] || 0) * item.price;
        }, 0);
    };

    const handlePlaceOrder = async () => {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        if (!userInfo) { navigate('/login'); return; }

        const cartItems = Object.entries(cart).map(([itemId, quantity]) => {
            const item = restaurant.menuItems.find(m => m._id === itemId);
            return { menuItemId: itemId, name: item?.name, quantity, price: item?.price };
        });

        setOrderPlacing(true);
        try {
            const res = await fetch('http://localhost:5000/api/food/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userInfo.token}`
                },
                body: JSON.stringify({
                    restaurantId: id,
                    items: cartItems,
                    totalAmount: getTotalPrice()
                })
            });
            if (res.ok) {
                setOrderPlaced(true);
                setCart({});
            } else {
                const data = await res.json();
                alert(data.message || 'Failed to place order');
            }
        } catch {
            alert('Connection error');
        } finally {
            setOrderPlacing(false);
        }
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        if (!userInfo) { navigate('/login'); return; }
        setSubmittingReview(true);
        try {
            const res = await fetch(`http://localhost:5000/api/food/${id}/reviews`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userInfo.token}`
                },
                body: JSON.stringify({ rating, comment })
            });
            const data = await res.json();
            if (res.ok) {
                setReviewMsg('Review added successfully!');
                setComment('');
                setRating(5);
                const refreshRes = await fetch(`http://localhost:5000/api/food/${id}`);
                const refreshData = await refreshRes.json();
                setRestaurant(refreshData);
            } else {
                setReviewMsg(data.message || 'Failed to add review');
            }
        } catch {
            setReviewMsg('Something went wrong');
        } finally {
            setSubmittingReview(false);
        }
    };

    const handleMealInputChange = (e) => {
        const { name, value } = e.target;

        if (name === 'contactNumber') {
            const digitsOnly = value.replace(/\D/g, '').slice(0, 10);
            setMealPlanForm(prev => ({ ...prev, [name]: digitsOnly }));
            return;
        }

        if (name === 'durationWeeks') {
            const digitsOnly = value.replace(/\D/g, '');
            setMealPlanForm(prev => ({ ...prev, [name]: digitsOnly }));
            return;
        }

        setMealPlanForm(prev => ({ ...prev, [name]: value }));
    };

    const handleMealToggle = (mealKey) => {
        setMealPlanForm(prev => ({
            ...prev,
            meals: {
                ...prev.meals,
                [mealKey]: !prev.meals[mealKey]
            }
        }));
    };

    const selectedPlan = mealPlanOptions.find(plan => plan.value === mealPlanForm.planType) || mealPlanOptions[1];
    
    // Calculate total price based on selected meals
    const calculateMealPlanPrice = () => {
        const basePrice = selectedPlan.pricePerWeek;
        const duration = Number(mealPlanForm.durationWeeks || 0);
        let mealMultiplier = 0;
        
        if (mealPlanForm.meals.breakfast) mealMultiplier += MEAL_PRICING.breakfast;
        if (mealPlanForm.meals.lunch) mealMultiplier += MEAL_PRICING.lunch;
        if (mealPlanForm.meals.dinner) mealMultiplier += MEAL_PRICING.dinner;
        
        return Math.round(basePrice * mealMultiplier * duration);
    };
    
    const estimatedTotal = calculateMealPlanPrice();

    const handleMealPlanSubmit = async (e) => {
        e.preventDefault();
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        if (!userInfo) {
            navigate('/login');
            return;
        }

        if (!mealPlanForm.meals.breakfast && !mealPlanForm.meals.lunch && !mealPlanForm.meals.dinner) {
            setMealPlanMsg('Please select at least one meal option.');
            return;
        }

        if (!contactRegex.test(mealPlanForm.contactNumber)) {
            setMealPlanMsg('Contact number must be exactly 10 digits.');
            return;
        }

        if (!mealPlanForm.startDate) {
            setMealPlanMsg('Please select a start date.');
            return;
        }

        const selectedDate = new Date(mealPlanForm.startDate);
        selectedDate.setHours(0, 0, 0, 0);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (selectedDate < today) {
            setMealPlanMsg('Start date cannot be in the past.');
            return;
        }

        setMealPlanSubmitting(true);
        setMealPlanMsg('');

        try {
            const res = await fetch('http://localhost:5000/api/food/meal-plans', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userInfo.token}`
                },
                body: JSON.stringify({
                    restaurantId: id,
                    ...mealPlanForm,
                    durationWeeks: Number(mealPlanForm.durationWeeks)
                })
            });

            const data = await res.json();
            if (res.ok) {
                setMealPlanMsg('Meal plan created successfully.');
                setMealPlanForm(prev => ({
                    ...prev,
                    studentId: '',
                    contactNumber: '',
                    hostelName: '',
                    roomNumber: '',
                    specialNotes: '',
                    startDate: ''
                }));
            } else {
                setMealPlanMsg(data.message || 'Failed to create meal plan.');
            }
        } catch {
            setMealPlanMsg('Connection error while creating meal plan.');
        } finally {
            setMealPlanSubmitting(false);
        }
    };

    const categories = restaurant
        ? ['All', ...new Set((restaurant.menuItems || []).map(i => i.category).filter(Boolean))]
        : ['All'];

    const filteredMenu = (restaurant?.menuItems || []).filter(item =>
        activeCategory === 'All' ? true : item.category === activeCategory
    );

    if (loading) return <div className="fd-loading"><div className="fd-spinner"></div><p>Loading menu...</p></div>;
    if (error) return <div className="fd-error">{error}</div>;
    if (!restaurant) return null;

    const cartCount = getTotalItems();

    return (
        <div className="fd-page">
            {/* Hero */}
            <div
                className="fd-hero"
                style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.55), rgba(6,10,31,1)), url(${getImageUrl(restaurant.image, 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80')})` }}
            >
                <div className="fd-hero-content">
                    <button className="fd-back-btn" onClick={() => navigate('/food')}>
                        <ArrowLeft size={18} /> Back to restaurants
                    </button>
                    <h1>{restaurant.restaurantName}</h1>
                    <div className="fd-hero-meta">
                        <span className="fd-meta-pill"><Star size={14} fill="#fbbf24" color="#fbbf24" /> {(restaurant.rating || 0).toFixed(1)}</span>
                        <span className="fd-meta-pill"><MapPin size={14} /> {restaurant.address}</span>
                        <span className="fd-meta-pill"><Phone size={14} /> {restaurant.contactNumber}</span>
                        {restaurant.openingTime && (
                            <span className="fd-meta-pill"><Clock size={14} /> {restaurant.openingTime} – {restaurant.closingTime}</span>
                        )}
                    </div>
                    {(restaurant.cuisineTypes || []).length > 0 && (
                        <div className="fd-cuisine-list">
                            {restaurant.cuisineTypes.map((c, i) => <span key={i} className="fd-cuisine-chip">{c}</span>)}
                        </div>
                    )}
                </div>
            </div>

            <div className="fd-layout">
                {/* Menu Main */}
                <main className="fd-main">
                    {/* Category Pills */}
                    {categories.length > 1 && (
                        <div className="fd-category-bar">
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    className={`fd-cat-btn ${activeCategory === cat ? 'active' : ''}`}
                                    onClick={() => setActiveCategory(cat)}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    )}

                    <h2 className="fd-section-title">
                        {activeCategory === 'All' ? 'Full Menu' : activeCategory}
                        <span className="fd-item-count">({filteredMenu.length} items)</span>
                    </h2>

                    <div className="fd-menu-list">
                        <AnimatePresence>
                            {filteredMenu.map((item, i) => (
                                <motion.div
                                    key={item._id}
                                    className="fd-menu-item"
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.04 }}
                                >
                                    <div className="fd-item-image">
                                        <img
                                            src={getImageUrl(item.image, 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=200&q=80')}
                                            alt={item.name}
                                            onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=200&q=80'; }}
                                        />
                                        {item.isVeg && <span className="fd-veg-badge">🥦 Veg</span>}
                                    </div>
                                    <div className="fd-item-details">
                                        <h3>{item.name}</h3>
                                        {item.description && <p className="fd-item-desc">{item.description}</p>}
                                        {item.category && <span className="fd-item-cat">{item.category}</span>}
                                    </div>
                                    <div className="fd-item-actions">
                                        <span className="fd-item-price">Rs. {item.price}</span>
                                        {isFoodProvider ? (
                                            <span className="fd-view-only-pill">Menu only</span>
                                        ) : cart[item._id] ? (
                                            <div className="fd-qty-control">
                                                <button onClick={() => removeFromCart(item)}><Minus size={14} /></button>
                                                <span>{cart[item._id]}</span>
                                                <button onClick={() => addToCart(item)}><Plus size={14} /></button>
                                            </div>
                                        ) : (
                                            <button className="fd-add-btn" onClick={() => addToCart(item)}>
                                                <Plus size={16} /> Add
                                            </button>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    {/* Reviews */}
                    <section className="fd-reviews-section">
                        <h2>Reviews & Ratings</h2>

                        <div className="fd-add-review">
                            <h3>Leave a Review</h3>
                            <form onSubmit={handleReviewSubmit}>
                                <div className="fd-star-input">
                                    <label>Rating:</label>
                                    <div className="fd-stars">
                                        {[1,2,3,4,5].map(s => (
                                            <span key={s} className={`fd-star ${rating >= s ? 'active' : ''}`} onClick={() => setRating(s)}>★</span>
                                        ))}
                                    </div>
                                </div>
                                <textarea
                                    className="fd-review-textarea"
                                    placeholder="Share your dining experience..."
                                    value={comment}
                                    onChange={e => setComment(e.target.value)}
                                    required
                                />
                                <button type="submit" className="fd-review-submit" disabled={submittingReview}>
                                    {submittingReview ? 'Posting...' : 'Post Review'}
                                </button>
                                {reviewMsg && <p className="fd-review-msg">{reviewMsg}</p>}
                            </form>
                        </div>

                        <div className="fd-reviews-list">
                            {(restaurant.reviews || []).length === 0 ? (
                                <p className="fd-no-reviews">No reviews yet. Be the first to review!</p>
                            ) : (
                                (restaurant.reviews || []).slice().reverse().map((rev, i) => (
                                    <div key={i} className="fd-review-card">
                                        <div className="fd-review-header">
                                            <div className="fd-user-avatar">{rev.name?.charAt(0) || 'U'}</div>
                                            <div className="fd-review-meta">
                                                <h4>{rev.name}</h4>
                                                <div className="fd-review-stars">
                                                    {'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}
                                                </div>
                                            </div>
                                            <span className="fd-review-date">
                                                {new Date(rev.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="fd-review-comment">{rev.comment}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </section>

                    {!isFoodProvider && <section className="fd-meal-plan-section">
                        <div className="fd-meal-plan-header">
                            <h2>Student Meal Plan</h2>
                            <p>Share your student details and pick a weekly plan for this restaurant.</p>
                        </div>

                        <form className="fd-meal-plan-form" onSubmit={handleMealPlanSubmit}>
                            <div className="fd-form-grid">
                                <label>
                                    Student Name
                                    <input
                                        type="text"
                                        name="studentName"
                                        value={mealPlanForm.studentName}
                                        onChange={handleMealInputChange}
                                        required
                                    />
                                </label>

                                <label>
                                    Student ID
                                    <input
                                        type="text"
                                        name="studentId"
                                        value={mealPlanForm.studentId}
                                        onChange={handleMealInputChange}
                                        required
                                    />
                                </label>

                                <label>
                                    Contact Number
                                    <input
                                        type="text"
                                        name="contactNumber"
                                        value={mealPlanForm.contactNumber}
                                        onChange={handleMealInputChange}
                                        inputMode="numeric"
                                        pattern="\d{10}"
                                        maxLength={10}
                                        title="Enter exactly 10 digits"
                                        required
                                    />
                                </label>

                                <label>
                                    Hostel Name
                                    <input
                                        type="text"
                                        name="hostelName"
                                        value={mealPlanForm.hostelName}
                                        onChange={handleMealInputChange}
                                        required
                                    />
                                </label>

                                <label>
                                    Room Number
                                    <input
                                        type="text"
                                        name="roomNumber"
                                        value={mealPlanForm.roomNumber}
                                        onChange={handleMealInputChange}
                                    />
                                </label>

                                <label>
                                    Start Date
                                    <input
                                        type="date"
                                        name="startDate"
                                        value={mealPlanForm.startDate}
                                        onChange={handleMealInputChange}
                                        min={new Date().toISOString().split('T')[0]}
                                        required
                                    />
                                </label>
                            </div>

                            <div className="fd-form-grid fd-plan-grid">
                                <label>
                                    Plan Type
                                    <select
                                        name="planType"
                                        value={mealPlanForm.planType}
                                        onChange={handleMealInputChange}
                                    >
                                        {mealPlanOptions.map(plan => (
                                            <option key={plan.value} value={plan.value}>
                                                {plan.label} - Rs. {plan.pricePerWeek}/week
                                            </option>
                                        ))}
                                    </select>
                                </label>

                                <label>
                                    Duration (Weeks)
                                    <input
                                        type="number"
                                        name="durationWeeks"
                                        min="1"
                                        max="12"
                                        value={mealPlanForm.durationWeeks}
                                        onChange={handleMealInputChange}
                                        onKeyDown={(e) => {
                                            if (['e', 'E', '+', '-', '.'].includes(e.key)) {
                                                e.preventDefault();
                                            }
                                        }}
                                        required
                                    />
                                </label>

                                <label>
                                    Dietary Preference
                                    <select
                                        name="dietaryPreference"
                                        value={mealPlanForm.dietaryPreference}
                                        onChange={handleMealInputChange}
                                    >
                                        <option value="None">None</option>
                                        <option value="Vegetarian">Vegetarian</option>
                                        <option value="Vegan">Vegan</option>
                                        <option value="Halal">Halal</option>
                                        <option value="Gluten Free">Gluten Free</option>
                                    </select>
                                </label>
                            </div>

                            <div className="fd-meals-row">
                                <span>Meals Included</span>
                                <div className="fd-meals-toggles">
                                    {['breakfast', 'lunch', 'dinner'].map(meal => (
                                        <button
                                            key={meal}
                                            type="button"
                                            className={`fd-meal-toggle ${mealPlanForm.meals[meal] ? 'active' : ''}`}
                                            onClick={() => handleMealToggle(meal)}
                                        >
                                            {meal}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <label className="fd-notes-label">
                                Special Notes
                                <textarea
                                    name="specialNotes"
                                    value={mealPlanForm.specialNotes}
                                    onChange={handleMealInputChange}
                                    placeholder="Allergies, preferred spice level, or any custom request"
                                />
                            </label>

                            <div className="fd-plan-summary">
                                <div>
                                    <strong>{selectedPlan.label}</strong>
                                    <p>{selectedPlan.description}</p>
                                </div>
                                <div className="fd-plan-price">Estimated Total: Rs. {estimatedTotal}</div>
                            </div>

                            <button type="submit" className="fd-meal-submit-btn" disabled={mealPlanSubmitting}>
                                {mealPlanSubmitting ? 'Creating Plan...' : 'Create Meal Plan'}
                            </button>

                            {mealPlanMsg && <p className="fd-meal-plan-msg">{mealPlanMsg}</p>}
                            <button
                                type="button"
                                className="fd-view-plans-btn"
                                onClick={() => navigate('/food/my-plans')}
                            >
                                View My Meal Plans
                            </button>
                        </form>
                    </section>}
                </main>

                {/* Sidebar / Cart */}
                <aside className="fd-sidebar">
                    {!isFoodProvider && <div className="fd-cart-card">
                        <div className="fd-cart-header">
                            <ShoppingCart size={22} />
                            <h3>Your Order</h3>
                            {cartCount > 0 && <span className="fd-cart-badge">{cartCount}</span>}
                        </div>

                        {orderPlaced ? (
                            <div className="fd-order-success">
                                <div className="fd-success-check">✅</div>
                                <h4>Order Placed!</h4>
                                <p>Your order is being prepared.</p>
                                <button className="fd-view-orders-btn" onClick={() => navigate('/food/my-orders')}>
                                    View My Orders <ChevronRight size={16} />
                                </button>
                                <button className="fd-order-again-btn" onClick={() => setOrderPlaced(false)}>
                                    Order More
                                </button>
                            </div>
                        ) : cartCount === 0 ? (
                            <div className="fd-cart-empty">
                                <span className="fd-cart-empty-icon">🛒</span>
                                <p>Add items from the menu to get started.</p>
                            </div>
                        ) : (
                            <>
                                <div className="fd-cart-items">
                                    {Object.entries(cart).map(([itemId, qty]) => {
                                        const item = restaurant.menuItems.find(m => m._id === itemId);
                                        if (!item) return null;
                                        return (
                                            <div key={itemId} className="fd-cart-item">
                                                <div className="fd-cart-item-info">
                                                    <span className="fd-cart-item-name">{item.name}</span>
                                                    <span className="fd-cart-item-price">Rs. {item.price * qty}</span>
                                                </div>
                                                <div className="fd-cart-item-qty">
                                                    <button onClick={() => removeFromCart(item)}><Minus size={12} /></button>
                                                    <span>{qty}</span>
                                                    <button onClick={() => addToCart(item)}><Plus size={12} /></button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="fd-cart-total">
                                    <span>Total</span>
                                    <span>Rs. {getTotalPrice()}</span>
                                </div>
                                <button
                                    className="fd-place-order-btn"
                                    onClick={handlePlaceOrder}
                                    disabled={orderPlacing}
                                >
                                    {orderPlacing ? 'Placing Order...' : 'Place Order'}
                                </button>
                            </>
                        )}
                    </div>}

                    <div className="fd-info-card">
                        <h3>Restaurant Info</h3>
                        <ul className="fd-info-list">
                            {restaurant.openingTime && (
                                <li><span>Hours</span><span>{restaurant.openingTime} – {restaurant.closingTime}</span></li>
                            )}
                            <li><span>Contact</span><span>{restaurant.contactNumber}</span></li>
                            <li><span>Location</span><span>{restaurant.address}</span></li>
                        </ul>
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default FoodDetails;
