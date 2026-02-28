import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './MyBookings.css';

const MyBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
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

        fetchMyBookings();
    }, [navigate]);

    const getStatusStep = (status) => {
        const steps = ['Pending', 'Confirmed', 'Picked Up', 'In Progress', 'Ready', 'Completed'];
        return steps.indexOf(status);
    };

    const getStatusClass = (status) => {
        return status.toLowerCase().replace(' ', '-');
    };

    const handleDelete = async (bookingId) => {
        if (!window.confirm('Are you sure you want to delete this booking?')) return;

        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        try {
            const response = await fetch(`http://localhost:5000/api/bookings/${bookingId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${userInfo.token}`
                }
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

    if (loading) return <div className="user-bookings-loading">Loading your orders...</div>;

    return (
        <div className="my-bookings-page">
            <div className="my-bookings-header">
                <h1>Track My Bookings</h1>
                <p>Monitor your laundry status in real-time from pickup to delivery.</p>
            </div>

            {error && <div className="my-bookings-error">{error}</div>}

            <div className="orders-grid">
                {bookings.length === 0 ? (
                    <div className="no-orders">
                        <div className="no-orders-icon">🧺</div>
                        <h3>No bookings yet</h3>
                        <p>Your laundry orders will appear here once you make a booking.</p>
                        <button className="browse-btn" onClick={() => navigate('/laundry')}>Browse Laundry Shops</button>
                    </div>
                ) : (
                    bookings.map(booking => (
                        <div key={booking._id} className="order-card">
                            <div className="order-card-header">
                                <div className="shop-info-mini">
                                    <h3>{booking.laundry?.shopName || 'Laundry Shop'}</h3>
                                    <p>📍 {booking.laundry?.address}</p>
                                </div>
                                <div className="header-right">
                                    <div className={`status-badge-main ${getStatusClass(booking.status)}`}>
                                        {booking.status}
                                    </div>
                                    <button className="delete-booking-btn" onClick={() => handleDelete(booking._id)} title="Delete Booking">
                                        🗑️
                                    </button>
                                </div>
                            </div>

                            <div className="order-tracking-visual">
                                {['Pending', 'Confirmed', 'Processing', 'Ready'].map((step, index) => {
                                    const currentStep = getStatusStep(booking.status);
                                    let stepStatus = 'upcoming';
                                    if (currentStep > index || booking.status === 'Completed') stepStatus = 'completed';
                                    else if (currentStep === index) stepStatus = 'current';

                                    // Mapping complex statuses to simplified 4-step UI
                                    const displaySteps = [
                                        { label: 'Pending', icon: '🕒' },
                                        { label: 'Confirmed', icon: '✅' },
                                        { label: 'Processing', icon: '🧺' },
                                        { label: 'Ready', icon: '👕' }
                                    ];

                                    return (
                                        <div key={index} className={`track-step ${stepStatus}`}>
                                            <div className="step-icon">{displaySteps[index].icon}</div>
                                            <div className="step-label">{displaySteps[index].label}</div>
                                            {index < 3 && <div className="step-line"></div>}
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="order-details-box">
                                <div className="details-row">
                                    <span className="label">Pickup Slot:</span>
                                    <span className="value">{new Date(booking.pickupDate).toLocaleDateString()} at {booking.pickupTime}</span>
                                </div>
                                <div className="details-row">
                                    <span className="label">Services:</span>
                                    <div className="value services-tags-user">
                                        {booking.services.map((s, i) => (
                                            <span key={i} className="mini-tag">{s.name} x{s.quantity}</span>
                                        ))}
                                    </div>
                                </div>
                                <div className="details-row total">
                                    <span className="label">Total Amount:</span>
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
                                <span className="order-date">Date: {new Date(booking.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default MyBookings;
