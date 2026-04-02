import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, MapPin, Phone, Search, Filter, Award, Sparkles, X, Clock, UtensilsCrossed } from 'lucide-react';
import './FoodList.css';

const FoodList = () => {
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState('All');
    const navigate = useNavigate();
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    const isFoodProvider = userInfo?.role?.toUpperCase() === 'FOOD_PROVIDER';

    const isRestaurantOpen = (openingTime, closingTime) => {
        if (!openingTime || !closingTime) return true;
        const now = new Date();
        const current = now.getHours() * 60 + now.getMinutes();
        const parseTime = (t) => {
            const parts = t.split(' ');
            if (parts.length !== 2) return 0;
            let [h, m] = parts[0].split(':').map(Number);
            if (parts[1] === 'PM' && h < 12) h += 12;
            if (parts[1] === 'AM' && h === 12) h = 0;
            return h * 60 + m;
        };
        return current >= parseTime(openingTime) && current <= parseTime(closingTime);
    };

    const getImageUrl = (imagePath) => {
        if (!imagePath) return 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
        if (imagePath.startsWith('http')) return imagePath;
        return `http://localhost:5000/${imagePath.replace(/\\/g, '/')}`;
    };

    useEffect(() => {
        const fetchRestaurants = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/food');
                const data = await response.json();
                if (response.ok) {
                    const updated = data.map(r => ({
                        ...r,
                        isOpen: isRestaurantOpen(r.openingTime, r.closingTime)
                    }));
                    setRestaurants(updated);
                } else {
                    setError(data.message || 'Failed to fetch restaurants');
                }
            } catch {
                setError('Could not connect to the server');
            } finally {
                setLoading(false);
            }
        };
        fetchRestaurants();
    }, []);

    const getFiltered = () => {
        let list = [...restaurants];
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            list = list.filter(r =>
                r.restaurantName?.toLowerCase().startsWith(term) ||
                r.address?.toLowerCase().startsWith(term)
            );
        }
        if (activeFilter === 'Top Rated') {
            list = list.filter(r => r.rating > 3);
            list.sort((a, b) => b.rating - a.rating);
        }
        if (activeFilter === 'Open Now') {
            list = list.filter(r => r.isOpen);
        }
        return list;
    };

    const filtered = getFiltered();

    if (loading) return (
        <div className="food-page">
            <div className="food-loading">
                <div className="food-loader"></div>
                <p>Finding delicious options near you...</p>
            </div>
        </div>
    );

    return (
        <div className="food-page">
            <header className="food-header">
                <div className="food-header-content">
                    <div className="food-header-icon">🍽️</div>
                    <h1>Food & Dining</h1>
                    <p>Discover restaurants & canteens near your campus. Order online in seconds.</p>
                </div>
            </header>

            <div className="food-nav-tabs">
                <button className="food-nav-tab active">Browse Food</button>
                {!isFoodProvider && (
                    <button className="food-nav-tab" onClick={() => navigate('/food/my-orders')}>My Orders</button>
                )}
                {!isFoodProvider && (
                    <button className="food-nav-tab" onClick={() => navigate('/food/my-plans')}>My Meal Plans</button>
                )}
            </div>

            <div className="food-filters-bar">
                <div className="food-filter-group">
                    {['All', 'Top Rated', 'Open Now'].map(f => (
                        <button
                            key={f}
                            className={`food-filter-btn ${activeFilter === f ? 'active' : ''}`}
                            onClick={() => setActiveFilter(f)}
                        >
                            {f === 'All' && <Filter size={14} />}
                            {f === 'Top Rated' && <Star size={14} />}
                            {f === 'Open Now' && <Clock size={14} />}
                            {f}
                        </button>
                    ))}
                </div>
                <div className="food-search-container">
                    <div className="food-search-box">
                        <Search className="food-search-icon" size={20} />
                        <input
                            type="text"
                            placeholder="Search restaurants or cuisine..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {searchTerm && (
                            <button className="food-clear-btn" onClick={() => setSearchTerm('')}>
                                <X size={14} />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {error && <div className="food-error">{error}</div>}

            <main className="food-grid-container">
                <AnimatePresence mode="popLayout">
                    {filtered.length > 0 ? (
                        <motion.div className="food-grid" layout>
                            {filtered.map((restaurant, index) => (
                                <motion.div
                                    key={restaurant._id}
                                    className={`food-card ${activeFilter === 'Top Rated' && index === 0 ? 'top-pick' : ''}`}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.3, delay: index * 0.05 }}
                                    layout
                                >
                                    <div className="food-card-image">
                                        <img
                                            src={getImageUrl(restaurant.image)}
                                            alt={restaurant.restaurantName}
                                            onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'; }}
                                        />
                                        <div className="food-image-badges">
                                            <span className={`food-status-badge ${restaurant.isOpen ? 'open' : 'closed'}`}>
                                                {restaurant.isOpen ? 'Open Now' : 'Closed'}
                                            </span>
                                            {restaurant.rating >= 4.5 && (
                                                <span className="food-elite-badge">
                                                    <Award size={12} /> Elite
                                                </span>
                                            )}
                                        </div>
                                        {activeFilter === 'Top Rated' && index === 0 && (
                                            <div className="food-top-ribbon">
                                                <Sparkles size={14} /> #1 Top Rated
                                            </div>
                                        )}
                                        <div className="food-card-overlay">
                                            <UtensilsCrossed size={28} />
                                        </div>
                                    </div>

                                    <div className="food-card-info">
                                        <div className="food-name-row">
                                            <h3>{restaurant.restaurantName}</h3>
                                            <div className={`food-rating-pill ${restaurant.rating >= 4.5 ? 'high' : ''}`}>
                                                <Star size={14} fill={restaurant.rating >= 4.5 ? '#fbbf24' : 'currentColor'} />
                                                <span>{(restaurant.rating || 0).toFixed(1)}</span>
                                            </div>
                                        </div>
                                        <p className="food-address"><MapPin size={14} /> {restaurant.address}</p>
                                        <div className="food-cuisine-tags">
                                            {(restaurant.cuisineTypes || []).slice(0, 3).map((c, i) => (
                                                <span key={i} className="food-cuisine-tag">{c}</span>
                                            ))}
                                            {(restaurant.cuisineTypes || []).length > 3 && (
                                                <span className="food-cuisine-tag">+{restaurant.cuisineTypes.length - 3} more</span>
                                            )}
                                        </div>
                                        <div className="food-card-footer">
                                            <div className="food-price-info">
                                                <span className="food-price">From Rs. {restaurant.menuItems?.[0]?.price || '---'}</span>
                                            </div>
                                            <div className="food-contact-info">
                                                <Phone size={14} /> {restaurant.contactNumber}
                                            </div>
                                        </div>
                                        <button
                                            className="food-view-btn"
                                            onClick={() => navigate(`/food/${restaurant._id}`)}
                                        >
                                            {isFoodProvider ? 'View Menu & Reviews' : 'View Menu & Order'}
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    ) : (
                        <motion.div
                            className="food-no-results"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            <span className="food-no-results-icon">🍽️</span>
                            <h3>No restaurants found</h3>
                            <p>Try searching by a different name or location.</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
};

export default FoodList;
