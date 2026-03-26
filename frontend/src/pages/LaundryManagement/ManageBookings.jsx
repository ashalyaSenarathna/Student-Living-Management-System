import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Clock,
    CheckCircle2,
    AlertCircle,
    User,
    Hash,
    Calendar,
    CreditCard,
    Settings2,
    RefreshCw,
    TrendingUp,
    CheckSquare,
    Package
} from 'lucide-react';
import './ManageBookings.css';

const ManageBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchBookings = async () => {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            if (!userInfo || userInfo.role !== 'PROVIDER') {
                navigate('/login');
                return;
            }

            try {
                const response = await fetch('http://localhost:5000/api/bookings/myshop', {
                    headers: {
                        'Authorization': `Bearer ${userInfo.token}`
                    }
                });
                const data = await response.json();
                if (response.ok) {
                    setBookings(data);
                } else {
                    setError(data.message || 'Failed to fetch bookings');
                }
            } catch (err) {
                setError('Connection error');
            } finally {
                setLoading(false);
            }
        };

        fetchBookings();
    }, [navigate]);

    const handleStatusUpdate = async (bookingId, newStatus) => {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        try {
            const response = await fetch(`http://localhost:5000/api/bookings/${bookingId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userInfo.token}`
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (response.ok) {
                setBookings(bookings.map(b => b._id === bookingId ? { ...b, status: newStatus } : b));
            } else {
                alert('Update failed');
            }
        } catch (err) {
            alert('Something went wrong');
        }
    };

    const stats = {
        total: bookings.length,
        pending: bookings.filter(b => b.status === 'Pending').length,
        ongoing: bookings.filter(b => ['Confirmed', 'Ready'].includes(b.status)).length,
        completed: bookings.filter(b => b.status === 'Completed').length
    };

    const getStatusClass = (status) => {
        return status.toLowerCase().replace(' ', '-');
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Pending': return <AlertCircle size={14} />;
            case 'Confirmed': return <RefreshCw size={14} />;
            case 'Ready': return <TrendingUp size={14} />;
            case 'Completed': return <CheckCircle2 size={14} />;
            case 'Cancelled': return <Hash size={14} />;
            default: return null;
        }
    };

    if (loading) return <div className="manage-loading">Loading Bookings...</div>;

    return (
        <div className="manage-bookings-page">
            <div className="manage-header-premium">
                <div className="header-badge">Admin Dashboard</div>
                <h1>Order Management</h1>
                <p>Monitor your shop's performance and fulfill orders with precision.</p>

                <div className="stats-grid">
                    <div className="stat-card pending">
                        <div className="stat-icon"><Clock /></div>
                        <div className="stat-info">
                            <span className="count">{stats.pending}</span>
                            <span className="label">Awaiting Action</span>
                        </div>
                    </div>
                    <div className="stat-card ongoing">
                        <div className="stat-icon"><RefreshCw /></div>
                        <div className="stat-info">
                            <span className="count">{stats.ongoing}</span>
                            <span className="label">In Progress</span>
                        </div>
                    </div>
                    <div className="stat-card completed">
                        <div className="stat-icon"><CheckSquare /></div>
                        <div className="stat-info">
                            <span className="count">{stats.completed}</span>
                            <span className="label">Total Fulfilled</span>
                        </div>
                    </div>
                </div>
            </div>

            {error && <div className="manage-error">{error}</div>}

            <div className="bookings-container-premium">
                {bookings.length === 0 ? (
                    <motion.div
                        className="no-bookings-fancy"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        <div className="no-bookings-icon">
                            <Package size={50} />
                        </div>
                        <h3>The shop is quiet for now</h3>
                        <p>When students schedule pickups, their live orders will appear here.</p>
                    </motion.div>
                ) : (
                    <div className="bookings-table-wrapper-luxe">
                        <table className="bookings-table-modern">
                            <thead>
                                <tr>
                                    <th><User size={14} /> Student Details</th>
                                    <th><Package size={14} /> Services Requested</th>
                                    <th><Calendar size={14} /> Pickup Schedule</th>
                                    <th><CreditCard size={14} /> Revenue</th>
                                    <th><TrendingUp size={14} /> Tracking</th>
                                    <th><Settings2 size={14} /> Command</th>
                                </tr>
                            </thead>
                            <tbody>
                                <AnimatePresence mode="popLayout">
                                    {bookings.map((booking, index) => (
                                        <motion.tr
                                            key={booking._id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            layout
                                        >
                                            <td className="student-cell">
                                                <div className="avatar-mini">{booking.user.name.charAt(0)}</div>
                                                <div className="student-details">
                                                    <span className="name">{booking.user.name}</span>
                                                    <span className="email">{booking.user.email}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="service-tags-modern">
                                                    {booking.services.map((s, i) => (
                                                        <span key={i} className="service-pill-mini">
                                                            {s.name} <span className="qty">×{s.quantity}</span>
                                                        </span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td>
                                                <div className="schedule-cell">
                                                    <span className="date-badge">{new Date(booking.pickupDate).toLocaleDateString()}</span>
                                                    <span className="time-pill">{booking.pickupTime}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="revenue-pill">
                                                    <span className="currency">Rs.</span>
                                                    <span className="amount">{booking.totalPrice}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`status-badge-premium ${getStatusClass(booking.status)}`}>
                                                    {getStatusIcon(booking.status)}
                                                    {booking.status}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="action-command-box">
                                                    <select
                                                        className="status-dropdown-luxe"
                                                        value={booking.status}
                                                        onChange={(e) => handleStatusUpdate(booking._id, e.target.value)}
                                                    >
                                                        <option value="Pending">⏱ Pending Approval</option>
                                                        <option value="Confirmed">📦 Confirm Booking</option>
                                                        <option value="Ready">⚡ Mark as Ready</option>
                                                        <option value="Completed">✅ Completed</option>
                                                        <option value="Cancelled">❌ Cancel Order</option>
                                                    </select>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManageBookings;
