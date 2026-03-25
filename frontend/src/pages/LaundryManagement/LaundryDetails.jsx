import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import BookingModal from './BookingModal';
import './LaundryDetails.css';

const LaundryDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [laundry, setLaundry] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Review states
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [reviewMessage, setReviewMessage] = useState('');

    // Booking states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [bookingSuccess, setBookingSuccess] = useState(false);

    const isShopCurrentlyOpen = (openingTime, closingTime, openingDays) => {
        if (!openingTime || !closingTime || !openingDays) return true;

        const now = new Date();
        const currentDay = now.getDay();
        const currentTime = now.getHours() * 60 + now.getMinutes();

        const daysMap = {
            'Sunday': 0, 'Sun': 0,
            'Monday': 1, 'Mon': 1,
            'Tuesday': 2, 'Tue': 2,
            'Wednesday': 3, 'Wed': 3,
            'Thursday': 4, 'Thu': 4,
            'Friday': 5, 'Fri': 5,
            'Saturday': 6, 'Sat': 6
        };

        const days = openingDays.split('-').map(d => d.trim());
        const startDay = daysMap[days[0]];
        const endDay = daysMap[days[1]];

        // If days are not recognized, default to open
        if (startDay === undefined || endDay === undefined) return true;

        let dayInRange = false;
        if (startDay <= endDay) {
            dayInRange = currentDay >= startDay && currentDay <= endDay;
        } else {
            // Handle ranges like Friday - Monday
            dayInRange = currentDay >= startDay || currentDay <= endDay;
        }

        if (!dayInRange) return false;

        const parseTime = (timeStr) => {
            if (!timeStr) return 0;
            const parts = timeStr.split(' ');
            if (parts.length !== 2) return 0;
            const [time, modifier] = parts;
            let [hours, minutes] = time.split(':');
            hours = parseInt(hours);
            minutes = parseInt(minutes);
            if (modifier === 'PM' && hours < 12) hours += 12;
            if (modifier === 'AM' && hours === 12) hours = 0;
            return hours * 60 + minutes;
        };

        const startMinutes = parseTime(openingTime);
        const endMinutes = parseTime(closingTime);

        return currentTime >= startMinutes && currentTime <= endMinutes;
    };

    useEffect(() => {
        const fetchLaundryDetails = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/laundry/${id}`);
                const data = await response.json();
                if (response.ok) {
                    // Update current open status based on time
                    const isOpen = isShopCurrentlyOpen(data.openingTime, data.closingTime, data.openingDays);
                    setLaundry({ ...data, isOpen });
                } else {
                    setError(data.message || 'Failed to fetch details');
                }
            } catch (err) {
                setError('Connection error');
            } finally {
                setLoading(false);
            }
        };

        fetchLaundryDetails();
    }, [id]);

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));

        if (!userInfo) {
            alert('Please login to leave a review');
            navigate('/login');
            return;
        }

        setSubmitting(true);
        setReviewMessage('');

        try {
            const response = await fetch(`http://localhost:5000/api/laundry/${id}/reviews`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userInfo.token}`
                },
                body: JSON.stringify({ rating, comment })
            });

            const data = await response.json();

            if (response.ok) {
                setReviewMessage('Review added successfully!');
                setComment('');
                setRating(5);
                // Refresh laundry data to show new review
                const refreshRes = await fetch(`http://localhost:5000/api/laundry/${id}`);
                const refreshData = await refreshRes.json();
                setLaundry(refreshData);
            } else {
                setReviewMessage(data.message || 'Failed to add review');
            }
        } catch (err) {
            setReviewMessage('Something went wrong');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="details-loading">Loading...</div>;
    if (error) return <div className="details-error">{error}</div>;
    if (!laundry) return null;

    return (
        <div className="laundry-details-page">
            <div className="details-hero" style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(6,10,31,1)), url(${laundry.image})` }}>
                <div className="hero-content">
                    <button className="back-btn" onClick={() => navigate('/laundry')}>← Back to list</button>
                    <h1>{laundry.shopName}</h1>
                    <div className="hero-meta">
                        <span className="rating-pill">⭐ {laundry.rating.toFixed(1)}</span>
                        <span className="reviews-pill">{laundry.reviewsCount} Reviews</span>
                        <span className={`status-pill ${laundry.isOpen ? 'open' : 'closed'}`}>
                            {laundry.isOpen ? 'Open Now' : 'Closed'}
                        </span>
                    </div>
                    <p className="hero-address">📍 {laundry.address}</p>
                    <p className="hero-contact">📞 {laundry.contactNumber}</p>
                </div>
            </div>

            <div className="details-grid">
                <main className="details-main">
                    <section className="services-section">
                        <h2>Our Services</h2>
                        <div className="services-list">
                            {laundry.services.map((service, index) => (
                                <div key={index} className="service-item">
                                    <div className="service-info">
                                        <h3>{service.name}</h3>
                                        <p>Fast and professional {service.name.toLowerCase()} service.</p>
                                    </div>
                                    <div className="service-price">
                                        <span className="amount">Rs. {service.price}</span>
                                        <span className="unit">/ {service.unit}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="reviews-section">
                        <h2>Reviews & Ratings</h2>

                        {/* New Review Form */}
                        <div className="add-review-box">
                            <h3>Leave a Review</h3>
                            <form onSubmit={handleReviewSubmit}>
                                <div className="rating-input">
                                    <label>Rating:</label>
                                    <div className="stars">
                                        {[1, 2, 3, 4, 5].map(s => (
                                            <span
                                                key={s}
                                                className={`star ${rating >= s ? 'active' : ''}`}
                                                onClick={() => setRating(s)}
                                            >★</span>
                                        ))}
                                    </div>
                                </div>
                                <div className="comment-input">
                                    <textarea
                                        placeholder="Share your experience with this shop..."
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        required
                                    ></textarea>
                                </div>
                                <button type="submit" className="submit-review-btn" disabled={submitting}>
                                    {submitting ? 'Submitting...' : 'Post Review'}
                                </button>
                                {reviewMessage && <p className="review-status">{reviewMessage}</p>}
                            </form>
                        </div>

                        {/* Reviews List */}
                        <div className="reviews-list">
                            {laundry.reviews.length === 0 ? (
                                <p className="no-reviews">No reviews yet. Be the first to review!</p>
                            ) : (
                                laundry.reviews.slice().reverse().map((review, index) => (
                                    <div key={index} className="review-card">
                                        <div className="review-header">
                                            <div className="user-initial">{review.name.charAt(0)}</div>
                                            <div className="user-meta">
                                                <h4>{review.name}</h4>
                                                <div className="review-stars">
                                                    {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                                                </div>
                                            </div>
                                            <span className="review-date">
                                                {new Date(review.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="review-comment">{review.comment}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </section>
                </main>

                <aside className="details-sidebar">
                    <div className="booking-card">
                        <h3>Book a Service</h3>
                        {bookingSuccess ? (
                            <div className="booking-success-mini">
                                <p>✅ Booking successful!</p>
                                <button className="book-again-btn" onClick={() => setBookingSuccess(false)}>Book Another</button>
                            </div>
                        ) : (
                            <>
                                <p>Select your services and schedule a pickup or drop-off.</p>
                                <button
                                    className="book-now-btn"
                                    onClick={() => {
                                        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
                                        if (!userInfo) {
                                            navigate('/login');
                                        } else {
                                            setIsModalOpen(true);
                                        }
                                    }}
                                >
                                    Book Now
                                </button>
                            </>
                        )}
                        <ul className="perks-list">
                            <li>✨ Quality Guarantee</li>
                        </ul>
                    </div>

                    <div className="info-card">
                        <h3>Business Hours</h3>
                        <ul className="hours-list">
                            <li><span>Days:</span> <span>{laundry.openingDays || 'Mon - Sat'}</span></li>
                            <li><span>Hours:</span> <span>{laundry.openingTime || '08:00 AM'} - {laundry.closingTime || '08:00 PM'}</span></li>
                            <li><span>Status:</span> <span style={{ color: laundry.isOpen ? '#10b981' : '#ef4444' }}>{laundry.isOpen ? 'Open Now' : 'Closed'}</span></li>
                        </ul>
                    </div>
                </aside>
            </div>

            <BookingModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                laundry={laundry}
                onBookingSuccess={() => setBookingSuccess(true)}
            />
        </div>
    );
};

export default LaundryDetails;
