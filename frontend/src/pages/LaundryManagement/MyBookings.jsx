import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Clock, CheckCircle, Shirt, Package, 
    Trash2, MapPin, Calendar, DollarSign, 
    XCircle, Store, Tag, ShoppingBag 
} from 'lucide-react';
import './MyBookings.css';

const MyBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeFilter, setActiveFilter] = useState('All');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchMyBookings = async () => {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            if (!userInfo) {
                navigate('/login');
                return;
            }

            try {
                const response = await fetch('http://localhost:5000/api/bookings/mybookings', {
                    headers: { 'Authorization': `Bearer ${userInfo.token}` }
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

        fetchMyBookings();
    }, [navigate]);

    const getStatusStep = (status) => {
        const steps = ['Pending', 'Confirmed', 'Ready', 'Completed'];
        return steps.indexOf(status);
    };

    const handleDelete = async (bookingId) => {
        if (!window.confirm('Are you sure you want to delete this booking?')) return;

        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        try {
            const response = await fetch(`http://localhost:5000/api/bookings/${bookingId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${userInfo.token}` }
            });

            if (response.ok) {
                setBookings(bookings.filter(b => b._id !== bookingId));
            } else {
                const data = await response.json();
                alert(data.message || 'Delete failed');
            }
        } catch (err) {
            alert('Something went wrong');
        }
    };

    const filteredBookings = bookings.filter(booking => {
        if (activeFilter === 'All') return true;
        if (activeFilter === 'Active') return ['Pending', 'Confirmed', 'Ready'].includes(booking.status);
        if (activeFilter === 'Completed') return booking.status === 'Completed';
        if (activeFilter === 'Cancelled') return booking.status === 'Cancelled';
        return true;
    });

    if (loading) {
        return (
            <div className="bookings-loading-container">
                <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="loading-spinner"
                >
                    <Clock size={40} color="#6c63ff" />
                </motion.div>
                <h2>Loading your bookings...</h2>
            </div>
        );
    }

    return (
        <div className="my-bookings-page">
            <div className="my-bookings-header">
                <motion.h1 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    Track My Bookings
                </motion.h1>
                <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    Monitor your laundry status in real-time from pickup to delivery.
                </motion.p>
            </div>

            {error && (
                <div className="my-bookings-error">
                    <XCircle size={20} />
                    <span>{error}</span>
                </div>
            )}

            <div className="bookings-filters">
                {['All', 'Active', 'Completed', 'Cancelled'].map(filter => (
                    <button
                        key={filter}
                        className={`filter-btn ${activeFilter === filter ? 'active' : ''}`}
                        onClick={() => setActiveFilter(filter)}
                    >
                        {filter}
                    </button>
                ))}
            </div>

            <motion.div layout className="orders-grid">
                <AnimatePresence>
                    {filteredBookings.length === 0 ? (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="no-orders"
                        >
                            <div className="no-orders-icon">
                                <ShoppingBag size={64} strokeWidth={1} />
                            </div>
                            <h3>No {activeFilter !== 'All' ? activeFilter.toLowerCase() : ''} bookings found</h3>
                            <p>Your laundry orders will appear here once you make a booking.</p>
                            <button className="browse-btn" onClick={() => navigate('/laundry')}>
                                Browse Laundry Shops
                            </button>
                        </motion.div>
                    ) : (
                        filteredBookings.map((booking, i) => (
                            <motion.div 
                                key={booking._id} 
                                layout
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.4, delay: i * 0.1, type: "spring", stiffness: 100 }}
                                className="order-card"
                            >
                                <div className="order-card-header">
                                    <div className="shop-info-mini">
                                        <h3>
                                            <Store size={20} className="inline-icon" />
                                            {booking.laundry?.shopName || 'Laundry Shop'}
                                        </h3>
                                        <p>
                                            <MapPin size={14} className="inline-icon" />
                                            {booking.laundry?.address}
                                        </p>
                                    </div>
                                    <div className="header-right">
                                        <div className={`status-badge-main ${booking.status.toLowerCase()}`}>
                                            {booking.status}
                                        </div>
                                        <button 
                                            className="delete-booking-btn" 
                                            onClick={() => handleDelete(booking._id)} 
                                            title="Delete Booking"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>

                                {booking.status !== 'Cancelled' && (
                                    <div className="order-tracking-visual">
                                        {[
                                            { label: 'Pending', icon: Clock },
                                            { label: 'Confirmed', icon: CheckCircle },
                                            { label: 'Ready', icon: Shirt },
                                            { label: 'Completed', icon: Package }
                                        ].map((step, index) => {
                                            const currentStep = getStatusStep(booking.status);
                                            let stepStatus = 'upcoming';
                                            if (currentStep > index || booking.status === 'Completed') stepStatus = 'completed';
                                            else if (currentStep === index) stepStatus = 'current';

                                            const StepIcon = step.icon;

                                            return (
                                                <div key={index} className={`track-step ${stepStatus}`}>
                                                    <div className="step-icon">
                                                        <StepIcon size={20} />
                                                    </div>
                                                    <div className="step-label">{step.label}</div>
                                                    {index < 3 && <div className="step-line"></div>}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                <div className="order-details-box">
                                    <div className="details-row">
                                        <span className="label"><Calendar size={14} className="inline-icon"/> Pickup Info</span>
                                        <span className="value">
                                            {new Date(booking.pickupDate).toLocaleDateString()} at {booking.pickupTime}
                                        </span>
                                    </div>
                                    <div className="details-row">
                                        <span className="label"><Tag size={14} className="inline-icon"/> Services</span>
                                        <div className="value services-tags-user">
                                            {booking.services.map((s, i) => (
                                                <span key={i} className="mini-tag">
                                                    {s.name} <span className="qty">x{s.quantity}</span>
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="details-row total">
                                        <span className="label"><DollarSign size={16} className="inline-icon"/> Total Amount</span>
                                        <span className="value amount">Rs. {booking.totalPrice}</span>
                                    </div>
                                </div>

                                {booking.notes && (
                                    <div className="order-notes-box">
                                        <strong>Notes:</strong> {booking.notes}
                                    </div>
                                )}

                                <div className="order-footer">
                                    <span className="order-id">ID: #{booking._id.slice(-6).toUpperCase()}</span>
                                    <span className="order-date">Placed: {new Date(booking.createdAt).toLocaleDateString()}</span>
                                </div>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};

export default MyBookings;
