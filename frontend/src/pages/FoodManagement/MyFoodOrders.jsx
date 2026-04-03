import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag, Clock, CheckCircle, XCircle, ChefHat, Truck, ChevronDown, ChevronUp } from 'lucide-react';
import './MyFoodOrders.css';

const statusConfig = {
    Pending:    { color: '#f59e0b', icon: <Clock size={15} />,        label: 'Pending'   },
    Preparing:  { color: '#3b82f6', icon: <ChefHat size={15} />,      label: 'Preparing' },
    Ready:      { color: '#10b981', icon: <CheckCircle size={15} />,  label: 'Ready'     },
    Delivered:  { color: '#6366f1', icon: <Truck size={15} />,        label: 'Delivered' },
    Cancelled:  { color: '#ef4444', icon: <XCircle size={15} />,      label: 'Cancelled' },
};

const MyFoodOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [expanded, setExpanded] = useState(null);
    const [cancelingOrderId, setCancelingOrderId] = useState(null);
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);
    const [canceling, setCanceling] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        if (!userInfo) { navigate('/login'); return; }

        const fetchOrders = async () => {
            try {
                const res = await fetch('http://localhost:5000/api/food/orders/my', {
                    headers: { 'Authorization': `Bearer ${userInfo.token}` }
                });
                const data = await res.json();
                if (res.ok) setOrders(data);
                else setError(data.message || 'Failed to fetch orders');
            } catch {
                setError('Connection error');
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    const handleCancelClick = (orderId) => {
        setCancelingOrderId(orderId);
        setShowCancelConfirm(true);
    };

    const handleConfirmCancel = async () => {
        if (!cancelingOrderId) return;
        
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        setCanceling(true);

        try {
            const res = await fetch(`http://localhost:5000/api/food/orders/${cancelingOrderId}/cancel`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${userInfo.token}` }
            });
            const data = await res.json();
            
            if (res.ok) {
                setOrders(orders.map(order => 
                    order._id === cancelingOrderId ? data.order : order
                ));
                setError('');
                setShowCancelConfirm(false);
                setCancelingOrderId(null);
            } else {
                setError(data.message || 'Failed to cancel order');
            }
        } catch {
            setError('Connection error');
        } finally {
            setCanceling(false);
        }
    };

    if (loading) return (
        <div className="myo-page">
            <div className="myo-loading">
                <div className="myo-spinner"></div>
                <p>Loading your orders...</p>
            </div>
        </div>
    );

    return (
        <div className="myo-page">
            <div className="myo-header">
                <ShoppingBag size={36} className="myo-header-icon" />
                <div>
                    <h1>My Food Orders</h1>
                    <p>Track the status of all your food orders.</p>
                </div>
            </div>

            <div className="myo-nav-tabs">
                <button className="myo-nav-tab" onClick={() => navigate('/food')}>Browse Food</button>
                <button className="myo-nav-tab active">My Orders</button>
            </div>

            {error && <div className="myo-error">{error}</div>}

            <div className="myo-container">
                {orders.length === 0 ? (
                    <div className="myo-empty">
                        <ShoppingBag size={60} className="myo-empty-icon" />
                        <h3>No orders yet</h3>
                        <p>Start browsing restaurants to place your first order!</p>
                        <button className="myo-browse-btn" onClick={() => navigate('/food')}>
                            Browse Restaurants
                        </button>
                    </div>
                ) : (
                    <div className="myo-order-list">
                        {orders.slice().reverse().map((order, i) => {
                            const cfg = statusConfig[order.status] || statusConfig.Pending;
                            const isOpen = expanded === order._id;
                            return (
                                <motion.div
                                    key={order._id}
                                    className="myo-card"
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                >
                                    <div
                                        className="myo-card-header"
                                        onClick={() => setExpanded(isOpen ? null : order._id)}
                                    >
                                        <div className="myo-order-left">
                                            <div
                                                className="myo-status-dot"
                                                style={{ background: cfg.color, boxShadow: `0 0 8px ${cfg.color}55` }}
                                            ></div>
                                            <div>
                                                <div className="myo-restaurant-name">
                                                    {order.restaurantName || 'Restaurant'}
                                                </div>
                                                <div className="myo-order-date">
                                                    {new Date(order.createdAt).toLocaleString()}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="myo-order-right">
                                            <span
                                                className="myo-status-badge"
                                                style={{ color: cfg.color, background: `${cfg.color}15`, border: `1px solid ${cfg.color}30` }}
                                            >
                                                {cfg.icon} {order.status}
                                            </span>
                                            <span className="myo-total">Rs. {order.totalAmount}</span>
                                            {order.status === 'Pending' && (
                                                <button 
                                                    className="myo-cancel-btn"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleCancelClick(order._id);
                                                    }}
                                                >
                                                    Cancel
                                                </button>
                                            )}
                                            <button className="myo-toggle-btn">
                                                {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                            </button>
                                        </div>
                                    </div>

                                    {isOpen && (
                                        <motion.div
                                            className="myo-card-body"
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                        >
                                            {/* Progress bar */}
                                            <div className="myo-progress">
                                                {['Pending', 'Preparing', 'Ready', 'Delivered'].map((s, idx) => {
                                                    const steps = ['Pending', 'Preparing', 'Ready', 'Delivered'];
                                                    const currentIdx = steps.indexOf(order.status);
                                                    const reached = idx <= currentIdx && order.status !== 'Cancelled';
                                                    return (
                                                        <React.Fragment key={s}>
                                                            <div className={`myo-step ${reached ? 'reached' : ''}`}>
                                                                <div className="myo-step-dot" style={reached ? { background: cfg.color } : {}}></div>
                                                                <span>{s}</span>
                                                            </div>
                                                            {idx < 3 && <div className={`myo-step-line ${idx < currentIdx && order.status !== 'Cancelled' ? 'reached' : ''}`}></div>}
                                                        </React.Fragment>
                                                    );
                                                })}
                                            </div>

                                            <h4 className="myo-items-title">Items Ordered</h4>
                                            <div className="myo-items">
                                                {(order.items || []).map((item, j) => (
                                                    <div key={j} className="myo-item-row">
                                                        <span className="myo-item-name">{item.name}</span>
                                                        <span className="myo-item-qty">×{item.quantity}</span>
                                                        <span className="myo-item-price">Rs. {item.price * item.quantity}</span>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="myo-order-total">
                                                <span>Total</span>
                                                <span>Rs. {order.totalAmount}</span>
                                            </div>
                                        </motion.div>
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Cancel Confirmation Modal */}
            {showCancelConfirm && (
                <div className="myo-modal-overlay" onClick={() => setShowCancelConfirm(false)}>
                    <motion.div
                        className="myo-modal"
                        onClick={(e) => e.stopPropagation()}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        <div className="myo-modal-header">
                            <h3>Cancel Order?</h3>
                        </div>
                        <div className="myo-modal-content">
                            <div className="myo-cancel-warning">
                                <XCircle size={40} color="#ef4444" />
                                <p>Are you sure you want to cancel this order?</p>
                                <p className="myo-cancel-note">This action cannot be undone. The order will be marked as cancelled.</p>
                            </div>
                        </div>
                        <div className="myo-modal-footer">
                            <button 
                                className="myo-btn-keep"
                                onClick={() => setShowCancelConfirm(false)}
                                disabled={canceling}
                            >
                                Keep Order
                            </button>
                            <button 
                                className="myo-btn-confirm-cancel"
                                onClick={handleConfirmCancel}
                                disabled={canceling}
                            >
                                {canceling ? 'Canceling...' : 'Cancel Order'}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default MyFoodOrders;
