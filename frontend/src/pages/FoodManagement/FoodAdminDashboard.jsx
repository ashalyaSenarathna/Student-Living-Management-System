import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Store,
    ClipboardList,
    CalendarRange,
    Star,
    ArrowRight,
    Search,
    Trash2,
    Phone,
    MapPin
} from 'lucide-react';
import './FoodAdminDashboard.css';

const FoodAdminDashboard = () => {
    const navigate = useNavigate();
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    const [restaurants, setRestaurants] = useState([]);
    const [orders, setOrders] = useState([]);
    const [mealPlans, setMealPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [deletingId, setDeletingId] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [restaurantsRes, ordersRes, plansRes] = await Promise.all([
                    fetch('http://localhost:5000/api/food'),
                    fetch('http://localhost:5000/api/food/orders/all', {
                        headers: { Authorization: `Bearer ${userInfo.token}` }
                    }),
                    fetch('http://localhost:5000/api/food/meal-plans/all', {
                        headers: { Authorization: `Bearer ${userInfo.token}` }
                    })
                ]);

                const restaurantsData = await restaurantsRes.json();
                const ordersData = await ordersRes.json();
                const plansData = await plansRes.json();

                if (!restaurantsRes.ok) {
                    setError(restaurantsData.message || 'Failed to load restaurants');
                    return;
                }

                if (!ordersRes.ok) {
                    setError(ordersData.message || 'Failed to load orders');
                    return;
                }

                if (!plansRes.ok) {
                    setError(plansData.message || 'Failed to load meal plans');
                    return;
                }

                setRestaurants(Array.isArray(restaurantsData) ? restaurantsData : []);
                setOrders(Array.isArray(ordersData) ? ordersData : []);
                setMealPlans(Array.isArray(plansData) ? plansData : []);
            } catch {
                setError('Connection error while loading food admin data.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [userInfo.token]);

    const filteredRestaurants = useMemo(() => {
        if (!search.trim()) return restaurants;
        const query = search.toLowerCase();

        return restaurants.filter((restaurant) => (
            restaurant.restaurantName?.toLowerCase().includes(query)
            || restaurant.address?.toLowerCase().includes(query)
            || restaurant.contactNumber?.includes(query)
        ));
    }, [restaurants, search]);

    const orderCounts = useMemo(() => {
        return {
            total: orders.length,
            pending: orders.filter((o) => o.status === 'Pending').length,
            preparing: orders.filter((o) => o.status === 'Preparing').length,
            activePlans: mealPlans.filter((p) => p.status === 'Active').length
        };
    }, [orders, mealPlans]);

    const handleDeleteRestaurant = async (restaurantId) => {
        if (!window.confirm('Delete this restaurant? This action cannot be undone.')) return;

        setDeletingId(restaurantId);
        setError('');

        try {
            const res = await fetch(`http://localhost:5000/api/food/${restaurantId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${userInfo.token}` }
            });

            const data = await res.json();

            if (res.ok) {
                setRestaurants((prev) => prev.filter((r) => r._id !== restaurantId));
            } else {
                setError(data.message || 'Failed to delete restaurant');
            }
        } catch {
            setError('Connection error while deleting restaurant');
        } finally {
            setDeletingId(null);
        }
    };

    if (loading) {
        return (
            <div className="fad-page">
                <div className="fad-loading">
                    <div className="fad-spinner"></div>
                    <p>Loading food admin dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="fad-page">
            <div className="fad-header">
                <div>
                    <h1>Food Admin Dashboard</h1>
                    <p>Manage restaurants, orders, and meal plans from one place.</p>
                </div>
                <button className="fad-back-btn" onClick={() => navigate('/admin')}>
                    Back to Main Admin
                </button>
            </div>

            {error && <div className="fad-error">{error}</div>}

            <section className="fad-stats">
                <motion.div className="fad-stat-card" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                    <Store size={20} />
                    <div>
                        <p>Total Restaurants</p>
                        <h3>{restaurants.length}</h3>
                    </div>
                </motion.div>

                <motion.div className="fad-stat-card" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
                    <ClipboardList size={20} />
                    <div>
                        <p>Pending Orders</p>
                        <h3>{orderCounts.pending}</h3>
                    </div>
                </motion.div>

                <motion.div className="fad-stat-card" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <ClipboardList size={20} />
                    <div>
                        <p>Preparing Orders</p>
                        <h3>{orderCounts.preparing}</h3>
                    </div>
                </motion.div>

                <motion.div className="fad-stat-card" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                    <CalendarRange size={20} />
                    <div>
                        <p>Active Meal Plans</p>
                        <h3>{orderCounts.activePlans}</h3>
                    </div>
                </motion.div>
            </section>

            <section className="fad-quick-actions">
                <button onClick={() => navigate('/manage-food-orders')}>
                    Manage All Food Orders <ArrowRight size={16} />
                </button>
                <button onClick={() => navigate('/manage-meal-plans')}>
                    Manage All Meal Plans <ArrowRight size={16} />
                </button>
                <button onClick={() => navigate('/food')}>
                    Browse Restaurants <ArrowRight size={16} />
                </button>
            </section>

            <section className="fad-restaurants-section">
                <div className="fad-section-head">
                    <h2>Restaurant Directory</h2>
                    <div className="fad-search-box">
                        <Search size={16} />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by restaurant, address, or contact"
                        />
                    </div>
                </div>

                {filteredRestaurants.length === 0 ? (
                    <div className="fad-empty">No restaurants found.</div>
                ) : (
                    <div className="fad-restaurants-grid">
                        {filteredRestaurants.map((restaurant) => (
                            <div className="fad-restaurant-card" key={restaurant._id}>
                                <div className="fad-restaurant-top">
                                    <h3>{restaurant.restaurantName}</h3>
                                    <span className="fad-rating">
                                        <Star size={14} fill="#f4c542" />
                                        {(restaurant.rating || 0).toFixed(1)}
                                    </span>
                                </div>
                                <p className="fad-row"><MapPin size={14} /> {restaurant.address || 'No address'}</p>
                                <p className="fad-row"><Phone size={14} /> {restaurant.contactNumber || 'N/A'}</p>
                                <div className="fad-card-actions">
                                    <button onClick={() => navigate(`/food/${restaurant._id}`)}>View</button>
                                    <button
                                        className="danger"
                                        onClick={() => handleDeleteRestaurant(restaurant._id)}
                                        disabled={deletingId === restaurant._id}
                                    >
                                        <Trash2 size={14} /> {deletingId === restaurant._id ? 'Deleting...' : 'Delete'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
};

export default FoodAdminDashboard;
