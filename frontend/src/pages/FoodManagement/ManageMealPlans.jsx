import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarDays, CircleUserRound, UtensilsCrossed, Building2, BadgeCheck, Clock3 } from 'lucide-react';
import './ManageMealPlans.css';

const ManageMealPlans = () => {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeStatus, setActiveStatus] = useState('All');
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    const isAdmin = userInfo?.role?.toUpperCase() === 'ADMIN';

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const endpoint = isAdmin
                    ? 'http://localhost:5000/api/food/meal-plans/all'
                    : 'http://localhost:5000/api/food/meal-plans/restaurant';

                const res = await fetch(endpoint, {
                    headers: {
                        Authorization: `Bearer ${userInfo.token}`
                    }
                });

                const data = await res.json();
                if (res.ok) {
                    setPlans(Array.isArray(data) ? data : []);
                } else {
                    setError(data.message || 'Failed to fetch meal plan orders');
                }
            } catch {
                setError('Connection error');
            } finally {
                setLoading(false);
            }
        };

        fetchPlans();
    }, [isAdmin, userInfo.token]);

    const statuses = ['Active', 'Paused', 'Cancelled'];

    const filteredPlans = useMemo(() => {
        if (activeStatus === 'All') return plans;
        return plans.filter((p) => p.status === activeStatus);
    }, [plans, activeStatus]);

    const getMealSummary = (meals = {}) => {
        const selected = [];
        if (meals.breakfast) selected.push('Breakfast');
        if (meals.lunch) selected.push('Lunch');
        if (meals.dinner) selected.push('Dinner');
        return selected.length ? selected.join(', ') : 'No meals selected';
    };

    if (loading) {
        return (
            <div className="mmpv-page">
                <div className="mmpv-loading">
                    <div className="mmpv-spinner"></div>
                    <p>Loading meal plan orders...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="mmpv-page">
            <div className="mmpv-hero">
                <div className="mmpv-hero-left">
                    <CalendarDays className="mmpv-hero-icon" size={34} />
                    <div>
                        <h1>Meal Plan Orders</h1>
                        <p>{isAdmin ? 'View all meal plans across all restaurants.' : 'View all meal plans subscribed to your restaurant.'}</p>
                    </div>
                </div>
                <div className="mmpv-stats">
                    {statuses.map((status) => (
                        <div key={status} className="mmpv-stat">
                            <span className="mmpv-stat-num">{plans.filter((p) => p.status === status).length}</span>
                            <span className="mmpv-stat-label">{status}</span>
                        </div>
                    ))}
                </div>
            </div>

            {error && <div className="mmpv-error">{error}</div>}

            <div className="mmpv-tabs">
                {['All', ...statuses].map((status) => (
                    <button
                        key={status}
                        className={`mmpv-tab ${activeStatus === status ? 'active' : ''}`}
                        onClick={() => setActiveStatus(status)}
                    >
                        {status}
                        {status !== 'All' && (
                            <span className="mmpv-tab-count">{plans.filter((p) => p.status === status).length}</span>
                        )}
                    </button>
                ))}
            </div>

            {filteredPlans.length === 0 ? (
                <div className="mmpv-empty">
                    <UtensilsCrossed size={56} className="mmpv-empty-icon" />
                    <h3>No meal plan orders found</h3>
                    <p>{activeStatus === 'All' ? 'No one has subscribed yet.' : `No ${activeStatus.toLowerCase()} meal plans right now.`}</p>
                </div>
            ) : (
                <div className="mmpv-grid">
                    {filteredPlans.map((plan, idx) => (
                        <motion.div
                            key={plan._id}
                            className="mmpv-card"
                            initial={{ opacity: 0, y: 14 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                        >
                            <div className="mmpv-top">
                                <h3>{plan.studentName}</h3>
                                <span className={`mmpv-status ${String(plan.status).toLowerCase()}`}>
                                    <BadgeCheck size={14} /> {plan.status}
                                </span>
                            </div>

                            <div className="mmpv-price">Rs. {plan.totalPrice}</div>
                            <p className="mmpv-plan-meta">{plan.planType} plan • {plan.durationWeeks} week(s)</p>

                            {isAdmin && plan.restaurant?.restaurantName && (
                                <p className="mmpv-plan-meta">Restaurant: {plan.restaurant.restaurantName}</p>
                            )}

                            <ul className="mmpv-info-list">
                                <li><CircleUserRound size={14} /> {plan.studentName} ({plan.studentId})</li>
                                <li><Building2 size={14} /> {plan.hostelName}{plan.roomNumber ? `, Room ${plan.roomNumber}` : ''}</li>
                                <li><UtensilsCrossed size={14} /> {getMealSummary(plan.meals)}</li>
                                <li><Clock3 size={14} /> Starts {new Date(plan.startDate).toLocaleDateString()}</li>
                            </ul>

                            <div className="mmpv-footer">
                                <span>Diet: {plan.dietaryPreference || 'None'}</span>
                                <span>Created: {new Date(plan.createdAt).toLocaleDateString()}</span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ManageMealPlans;
