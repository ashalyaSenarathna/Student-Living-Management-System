import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CalendarDays, Utensils, Building2, CircleUser, Clock3, BadgeCheck, Edit2, Trash2, X } from 'lucide-react';
import './MyMealPlans.css';

const MyMealPlans = () => {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editingPlan, setEditingPlan] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [updating, setUpdating] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        if (!userInfo) {
            navigate('/login');
            return;
        }

        const fetchPlans = async () => {
            try {
                const res = await fetch('http://localhost:5000/api/food/meal-plans/my', {
                    headers: {
                        Authorization: `Bearer ${userInfo.token}`
                    }
                });

                const data = await res.json();
                if (res.ok) {
                    setPlans(data);
                } else {
                    setError(data.message || 'Failed to fetch meal plans');
                }
            } catch {
                setError('Connection error');
            } finally {
                setLoading(false);
            }
        };

        fetchPlans();
    }, [navigate]);

    const handleEditClick = (plan) => {
        setEditingPlan(plan);
        setEditForm({
            status: plan.status,
            specialNotes: plan.specialNotes || ''
        });
        setShowEditModal(true);
    };

    const handleCloseEditModal = () => {
        setShowEditModal(false);
        setEditingPlan(null);
        setEditForm({});
    };

    const handleEditFormChange = (e) => {
        const { name, value } = e.target;
        setEditForm(prev => ({ ...prev, [name]: value }));
    };

    const handleUpdatePlan = async () => {
        if (!editingPlan) return;
        
        setUpdating(true);
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        
        try {
            const res = await fetch(`http://localhost:5000/api/food/meal-plans/${editingPlan._id}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${userInfo.token}`
                },
                body: JSON.stringify({
                    status: editForm.status,
                    specialNotes: editForm.specialNotes
                })
            });

            const data = await res.json();
            if (res.ok) {
                setPlans(plans.map(p => p._id === editingPlan._id ? data : p));
                handleCloseEditModal();
                setError('');
            } else {
                setError(data.message || 'Failed to update meal plan');
            }
        } catch (err) {
            setError('Connection error');
        } finally {
            setUpdating(false);
        }
    };

    const handleDeleteClick = (planId) => {
        setShowDeleteConfirm(planId);
    };

    const handleConfirmDelete = async (planId) => {
        setDeleting(true);
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        
        try {
            const res = await fetch(`http://localhost:5000/api/food/meal-plans/${planId}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${userInfo.token}`
                }
            });

            if (res.ok) {
                setPlans(plans.filter(p => p._id !== planId));
                setShowDeleteConfirm(null);
                setError('');
            } else {
                const data = await res.json();
                setError(data.message || 'Failed to delete meal plan');
            }
        } catch (err) {
            setError('Connection error');
        } finally {
            setDeleting(false);
        }
    };

    const handleCancelDelete = () => {
        setShowDeleteConfirm(null);
    };

    const formatMeals = (meals = {}) => {
        const picked = [
            meals.breakfast ? 'Breakfast' : null,
            meals.lunch ? 'Lunch' : null,
            meals.dinner ? 'Dinner' : null
        ].filter(Boolean);

        return picked.length > 0 ? picked.join(', ') : 'No meals selected';
    };

    if (loading) {
        return (
            <div className="mmp-page">
                <div className="mmp-loading">
                    <div className="mmp-spinner"></div>
                    <p>Loading your meal plans...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="mmp-page">
            <div className="mmp-header">
                <CalendarDays size={36} className="mmp-header-icon" />
                <div>
                    <h1>My Meal Plans</h1>
                    <p>Track all active and past plans linked to your student profile.</p>
                </div>
            </div>

            <div className="mmp-nav-tabs">
                <button className="mmp-nav-tab" onClick={() => navigate('/food')}>Browse Food</button>
                <button className="mmp-nav-tab" onClick={() => navigate('/food/my-orders')}>My Orders</button>
                <button className="mmp-nav-tab active">My Meal Plans</button>
            </div>

            {error && <div className="mmp-error">{error}</div>}

            <div className="mmp-container">
                {plans.length === 0 ? (
                    <div className="mmp-empty">
                        <Utensils size={58} className="mmp-empty-icon" />
                        <h3>No meal plans yet</h3>
                        <p>Create your first meal plan from any restaurant details page.</p>
                        <button className="mmp-browse-btn" onClick={() => navigate('/food')}>Go to Food Page</button>
                    </div>
                ) : (
                    <div className="mmp-grid">
                        {plans.map((plan, idx) => (
                            <motion.div
                                key={plan._id}
                                className="mmp-card"
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                            >
                                <div className="mmp-top">
                                    <h3>{plan.restaurant?.restaurantName || 'Restaurant Meal Plan'}</h3>
                                    <span className={`mmp-status ${String(plan.status).toLowerCase()}`}>
                                        <BadgeCheck size={14} /> {plan.status}
                                    </span>
                                </div>

                                <div className="mmp-price">Rs. {plan.totalPrice}</div>
                                <p className="mmp-plan-type">{plan.planType} plan • {plan.durationWeeks} weeks</p>

                                <ul className="mmp-info-list">
                                    <li><CircleUser size={14} /> {plan.studentName} ({plan.studentId})</li>
                                    <li><Building2 size={14} /> {plan.hostelName}{plan.roomNumber ? `, Room ${plan.roomNumber}` : ''}</li>
                                    <li><Utensils size={14} /> {formatMeals(plan.meals)}</li>
                                    <li><Clock3 size={14} /> Starts {new Date(plan.startDate).toLocaleDateString()}</li>
                                </ul>

                                <div className="mmp-meta">
                                    <span>Diet: {plan.dietaryPreference}</span>
                                    <span>Created: {new Date(plan.createdAt).toLocaleDateString()}</span>
                                </div>

                                <div className="mmp-actions">
                                    <button 
                                        className="mmp-btn mmp-btn-edit"
                                        onClick={() => handleEditClick(plan)}
                                        title="Edit meal plan"
                                    >
                                        <Edit2 size={16} />
                                        Edit
                                    </button>
                                    <button 
                                        className="mmp-btn mmp-btn-delete"
                                        onClick={() => handleDeleteClick(plan._id)}
                                        title="Delete meal plan"
                                    >
                                        <Trash2 size={16} />
                                        Delete
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Edit Modal */}
            {showEditModal && editingPlan && (
                <div className="mmp-modal-overlay" onClick={handleCloseEditModal}>
                    <motion.div
                        className="mmp-modal"
                        onClick={(e) => e.stopPropagation()}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        <div className="mmp-modal-header">
                            <h2>Update Meal Plan</h2>
                            <button 
                                className="mmp-modal-close"
                                onClick={handleCloseEditModal}
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="mmp-modal-content">
                            <div className="mmp-modal-field">
                                <label>Restaurant: <span>{editingPlan.restaurant?.restaurantName}</span></label>
                            </div>

                            <div className="mmp-modal-field">
                                <label>Status</label>
                                <select
                                    name="status"
                                    value={editForm.status}
                                    onChange={handleEditFormChange}
                                    className="mmp-modal-input"
                                >
                                    <option value="Active">Active</option>
                                    <option value="Paused">Paused</option>
                                    <option value="Cancelled">Cancelled</option>
                                </select>
                            </div>

                            <div className="mmp-modal-field">
                                <label>Plan Details</label>
                                <div className="mmp-modal-detail">
                                    <span>{editingPlan.planType} Plan</span>
                                    <span>•</span>
                                    <span>{editingPlan.durationWeeks} weeks</span>
                                    <span>•</span>
                                    <span>Rs. {editingPlan.totalPrice}</span>
                                </div>
                            </div>

                            <div className="mmp-modal-field">
                                <label>Student: <span>{editingPlan.studentName} ({editingPlan.studentId})</span></label>
                            </div>

                            <div className="mmp-modal-field">
                                <label>Hostel: <span>{editingPlan.hostelName}{editingPlan.roomNumber ? `, Room ${editingPlan.roomNumber}` : ''}</span></label>
                            </div>

                            <div className="mmp-modal-field">
                                <label>Meals: <span>{formatMeals(editingPlan.meals)}</span></label>
                            </div>

                            <div className="mmp-modal-field">
                                <label>Dietary Preference: <span>{editingPlan.dietaryPreference}</span></label>
                            </div>

                            <div className="mmp-modal-field">
                                <label>Special Notes</label>
                                <textarea
                                    name="specialNotes"
                                    value={editForm.specialNotes}
                                    onChange={handleEditFormChange}
                                    placeholder="Add any special notes or dietary requirements..."
                                    className="mmp-modal-textarea"
                                    rows="3"
                                />
                            </div>
                        </div>

                        <div className="mmp-modal-footer">
                            <button 
                                className="mmp-modal-btn mmp-modal-btn-cancel"
                                onClick={handleCloseEditModal}
                            >
                                Cancel
                            </button>
                            <button 
                                className="mmp-modal-btn mmp-modal-btn-save"
                                onClick={handleUpdatePlan}
                                disabled={updating}
                            >
                                {updating ? 'Updating...' : 'Update Plan'}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="mmp-modal-overlay" onClick={handleCancelDelete}>
                    <motion.div
                        className="mmp-modal mmp-modal-small"
                        onClick={(e) => e.stopPropagation()}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        <div className="mmp-modal-header">
                            <h2>Delete Meal Plan</h2>
                            <button 
                                className="mmp-modal-close"
                                onClick={handleCancelDelete}
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="mmp-modal-content">
                            <p className="mmp-delete-warning">
                                Are you sure you want to delete this meal plan? This action cannot be undone.
                            </p>
                        </div>

                        <div className="mmp-modal-footer">
                            <button 
                                className="mmp-modal-btn mmp-modal-btn-cancel"
                                onClick={handleCancelDelete}
                            >
                                Keep Plan
                            </button>
                            <button 
                                className="mmp-modal-btn mmp-modal-btn-delete"
                                onClick={() => handleConfirmDelete(showDeleteConfirm)}
                                disabled={deleting}
                            >
                                {deleting ? 'Deleting...' : 'Delete Permanently'}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default MyMealPlans;
