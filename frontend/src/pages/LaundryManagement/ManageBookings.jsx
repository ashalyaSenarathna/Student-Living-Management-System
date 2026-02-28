import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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

    const getStatusClass = (status) => {
        return status.toLowerCase().replace(' ', '-');
    };

    if (loading) return <div className="manage-loading">Loading Bookings...</div>;

    return (
        <div className="manage-bookings-page">
            <div className="manage-header">
                <h1>Manage Bookings</h1>
                <p>Track and update student laundry orders in real-time.</p>
            </div>

            {error && <div className="manage-error">{error}</div>}

            <div className="bookings-container">
                {bookings.length === 0 ? (
                    <div className="no-bookings">
                        <h3>No bookings found</h3>
                        <p>When students book your services, they will appear here.</p>
                    </div>
                ) : (
                    <div className="bookings-table-wrapper">
                        <table className="bookings-table">
                            <thead>
                                <tr>
                                    <th>Student</th>
                                    <th>Services</th>
                                    <th>Pickup Time</th>
                                    <th>Total Price</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bookings.map(booking => (
                                    <tr key={booking._id}>
                                        <td>
                                            <div className="student-info">
                                                <span className="student-name">{booking.user.name}</span>
                                                <span className="student-email">{booking.user.email}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="service-tags-mini">
                                                {booking.services.map((s, i) => (
                                                    <span key={i} className="service-tag-xs">{s.name} x{s.quantity}</span>
                                                ))}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="pickup-time-cell">
                                                <span className="date">{new Date(booking.pickupDate).toLocaleDateString()}</span>
                                                <span className="time">{booking.pickupTime}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="price-tag">Rs. {booking.totalPrice}</span>
                                        </td>
                                        <td>
                                            <span className={`status-badge-lg ${getStatusClass(booking.status)}`}>
                                                {booking.status}
                                            </span>
                                        </td>
                                        <td>
                                            <select
                                                className="status-select"
                                                value={booking.status}
                                                onChange={(e) => handleStatusUpdate(booking._id, e.target.value)}
                                            >
                                                <option value="Pending">Pending</option>
                                                <option value="Confirmed">Confirmed</option>
                                                <option value="Picked Up">Picked Up</option>
                                                <option value="In Progress">In Progress</option>
                                                <option value="Ready">Ready</option>
                                                <option value="Completed">Completed</option>
                                                <option value="Cancelled">Cancelled</option>
                                            </select>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManageBookings;
