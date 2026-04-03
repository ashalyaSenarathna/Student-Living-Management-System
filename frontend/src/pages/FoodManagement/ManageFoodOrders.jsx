import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, CheckCircle, XCircle, Clock, ChefHat, Truck, Eye } from 'lucide-react';
import './ManageFoodOrders.css';

const statusConfig = {
    Pending:    { color: '#f59e0b', icon: <Clock size={16} />,       bg: 'rgba(245,158,11,0.1)',   border: 'rgba(245,158,11,0.2)'   },
    Preparing:  { color: '#3b82f6', icon: <ChefHat size={16} />,     bg: 'rgba(59,130,246,0.1)',   border: 'rgba(59,130,246,0.2)'   },
    Ready:      { color: '#10b981', icon: <CheckCircle size={16} />, bg: 'rgba(16,185,129,0.1)',   border: 'rgba(16,185,129,0.2)'   },
    Delivered:  { color: '#6366f1', icon: <Truck size={16} />,       bg: 'rgba(99,102,241,0.1)',   border: 'rgba(99,102,241,0.2)'   },
    Cancelled:  { color: '#ef4444', icon: <XCircle size={16} />,     bg: 'rgba(239,68,68,0.1)',    border: 'rgba(239,68,68,0.2)'    },
};

const STATUSES = ['Pending', 'Preparing', 'Ready', 'Delivered', 'Cancelled'];
const ACTION_STATUSES = ['Preparing', 'Ready', 'Delivered'];

const ManageFoodOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeStatus, setActiveStatus] = useState('All');
    const [expanded, setExpanded] = useState(null);
    const [updating, setUpdating] = useState(null);
    const [cancelingOrderId, setCancelingOrderId] = useState(null);
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);
    const [canceling, setCanceling] = useState(false);

    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    const isAdmin = userInfo?.role?.toUpperCase() === 'ADMIN';

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const endpoint = isAdmin
                    ? 'http://localhost:5000/api/food/orders/all'
                    : 'http://localhost:5000/api/food/orders/restaurant';

                const res = await fetch(endpoint, {
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
    }, [isAdmin, userInfo.token]);

    const updateStatus = async (orderId, status) => {
        setUpdating(orderId);
        try {
            const res = await fetch(`http://localhost:5000/api/food/orders/${orderId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userInfo.token}`
                },
                body: JSON.stringify({ status })
            });
            if (res.ok) {
                setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status } : o));
            }
        } catch {}
        setUpdating(null);
    };

    const handleCancelClick = (orderId) => {
        setCancelingOrderId(orderId);
        setShowCancelConfirm(true);
    };

    const handleConfirmCancel = async () => {
        if (!cancelingOrderId) return;
        
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

    const filtered = activeStatus === 'All' ? orders : orders.filter(o => o.status === activeStatus);

    if (loading) return <div className="mfo-page"><div className="mfo-loading"><div className="mfo-spinner"></div><p>Loading orders...</p></div></div>;

    return (
        <div className="mfo-page">
            <div className="mfo-hero">
                <div className="mfo-hero-content">
                    <Package size={36} className="mfo-hero-icon" />
                    <div>
                        <h1>Manage Orders</h1>
                        <p>View and update customer food orders.</p>
                    </div>
                </div>
                <div className="mfo-stats">
                    {['Pending', 'Preparing', 'Ready'].map(s => (
                        <div key={s} className="mfo-stat">
                            <span className="mfo-stat-num">{orders.filter(o => o.status === s).length}</span>
                            <span className="mfo-stat-label">{s}</span>
                        </div>
                    ))}
                </div>
            </div>

            {error && <div className="mfo-error">{error}</div>}

            <div className="mfo-container">
                {/* Filter Tabs */}
                <div className="mfo-filter-tabs">
                    {['All', ...STATUSES].map(s => (
                        <button
                            key={s}
                            className={`mfo-tab ${activeStatus === s ? 'active' : ''}`}
                            onClick={() => setActiveStatus(s)}
                        >
                            {s} {s !== 'All' && <span className="mfo-tab-count">{orders.filter(o => o.status === s).length}</span>}
                        </button>
                    ))}
                </div>

                {/* Orders */}
                {filtered.length === 0 ? (
                    <div className="mfo-empty">
                        <Package size={48} className="mfo-empty-icon" />
                        <p>No {activeStatus !== 'All' ? activeStatus.toLowerCase() : ''} orders.</p>
                    </div>
                ) : (
                    <div className="mfo-list">
                        {filtered.map((order, i) => {
                            const cfg = statusConfig[order.status] || statusConfig.Pending;
                            return (
                                <motion.div
                                    key={order._id}
                                    className="mfo-card"
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.04 }}
                                >
                                    <div className="mfo-card-header">
                                        <div className="mfo-order-info">
                                            <span className="mfo-order-id">#{order._id?.slice(-6)?.toUpperCase()}</span>
                                            <span className="mfo-customer">{order.customerName || 'Customer'}</span>
                                            {isAdmin && (
                                                <span className="mfo-customer">{order.restaurant?.restaurantName || order.restaurantName || 'Restaurant'}</span>
                                            )}
                                            <span className="mfo-time">{new Date(order.createdAt).toLocaleString()}</span>
                                        </div>
                                        <div className="mfo-header-right">
                                            <span
                                                className="mfo-status-chip"
                                                style={{ color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}` }}
                                            >
                                                {cfg.icon} {order.status}
                                            </span>
                                            <span className="mfo-total">Rs. {order.totalAmount}</span>
                                            <button
                                                className="mfo-expand-btn"
                                                onClick={() => setExpanded(expanded === order._id ? null : order._id)}
                                            >
                                                <Eye size={16} />
                                            </button>
                                        </div>
                                    </div>

                                    {expanded === order._id && (
                                        <motion.div
                                            className="mfo-card-body"
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                        >
                                            <div className="mfo-items">
                                                <h4>Order Items</h4>
                                                {(order.items || []).map((item, j) => (
                                                    <div key={j} className="mfo-item-row">
                                                        <span>{item.name}</span>
                                                        <span className="mfo-item-qty">x{item.quantity}</span>
                                                        <span className="mfo-item-price">Rs. {item.price * item.quantity}</span>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="mfo-status-actions">
                                                <p className="mfo-update-label">Update Status:</p>
                                                <div className="mfo-status-btns">
                                                    {ACTION_STATUSES.map(s => (
                                                        <button
                                                            key={s}
                                                            className={`mfo-status-btn ${order.status === s ? 'current' : ''}`}
                                                            onClick={() => updateStatus(order._id, s)}
                                                            disabled={updating === order._id || order.status === s}
                                                            style={order.status === s ? { background: statusConfig[s]?.bg, borderColor: statusConfig[s]?.border, color: statusConfig[s]?.color } : {}}
                                                        >
                                                            {updating === order._id ? '...' : s}
                                                        </button>
                                                    ))}
                                                </div>
                                                {order.status === 'Pending' && (
                                                    <button 
                                                        className="mfo-cancel-btn"
                                                        onClick={() => handleCancelClick(order._id)}
                                                    >
                                                        <XCircle size={14} /> Cancel Order
                                                    </button>
                                                )}
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
                <div className="mfo-modal-overlay" onClick={() => setShowCancelConfirm(false)}>
                    <motion.div
                        className="mfo-modal"
                        onClick={(e) => e.stopPropagation()}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        <div className="mfo-modal-header">
                            <h3>Cancel Order?</h3>
                        </div>
                        <div className="mfo-modal-content">
                            <div className="mfo-cancel-warning">
                                <XCircle size={40} color="#ef4444" />
                                <p>Are you sure you want to cancel this order?</p>
                                <p className="mfo-cancel-note">This action cannot be undone. The order will be marked as cancelled.</p>
                            </div>
                        </div>
                        <div className="mfo-modal-footer">
                            <button 
                                className="mfo-btn-keep"
                                onClick={() => setShowCancelConfirm(false)}
                                disabled={canceling}
                            >
                                Keep Order
                            </button>
                            <button 
                                className="mfo-btn-confirm-cancel"
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

export default ManageFoodOrders;
