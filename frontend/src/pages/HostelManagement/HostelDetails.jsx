import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, Send, User } from 'lucide-react';
import './HostelDetails.css';

const HostelDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [hostel, setHostel] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [hover, setHover] = useState(0);
    const [submittingReview, setSubmittingReview] = useState(false);
    const [reviewSuccess, setReviewSuccess] = useState(false);

    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    const token = userInfo.token;

    useEffect(() => {
        const fetchHostel = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/hostel/${id}`);
                const data = await response.json();
                if (response.ok) {
                    const isAdmin = userInfo.role?.toLowerCase() === 'admin';
                    const isOwner = userInfo._id === data.owner?._id || userInfo._id === data.owner;

                    if (data.status !== 'approved' && !isAdmin && !isOwner) {
                        setError('This listing is unavailable or pending approval.');
                    } else {
                        setHostel(data);
                    }
                } else {
                    setError(data.message || 'Hostel not found');
                }
            } catch (err) {
                setError('Failed to connect to the server');
            } finally {
                setLoading(false);
            }
        };
        fetchHostel();
    }, [id, reviewSuccess]);

    const submitReviewHandler = async (e) => {
        e.preventDefault();
        if (rating === 0) return alert('Please select a rating');

        setSubmittingReview(true);
        try {
            const res = await fetch(`http://localhost:5000/api/hostel/${id}/reviews`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ rating, comment })
            });

            if (res.ok) {
                setReviewSuccess(true);
                setRating(0);
                setComment('');
                setTimeout(() => setReviewSuccess(false), 3000);
            } else {
                const data = await res.json();
                alert(data.message || 'Failed to submit review');
            }
        } catch (err) {
            alert('Error submitting review');
        } finally {
            setSubmittingReview(false);
        }
    };

    if (loading) return (
        <div className="hostel-details-page">
            <div className="loader"></div>
            <p className="loading-text">Loading premium accommodation details...</p>
        </div>
    );

    if (error) return (
        <div className="hostel-details-page">
            <div className="error-display">
                <p>{error}</p>
                <button className="back-btn" onClick={() => navigate('/hostel')}>Back to Search</button>
            </div>
        </div>
    );

    if (!hostel) return null;

    return (
        <div className="hostel-details-page">
            <header className="details-hero" style={{
                backgroundImage: `linear-gradient(rgba(6, 10, 31, 0.4), rgba(6, 10, 31, 1)), url(${hostel.images?.[0] || hostel.image || 'https://images.unsplash.com/photo-1493666438817-866a91353ca9?auto=format&fit=crop&w=1200&q=80'})`
            }}>
                <div className="hero-content">
                    <button className="back-link" onClick={() => navigate('/hostel')}>← Back to Search</button>
                    <h1>{hostel.name}</h1>
                    <div className="hero-meta">
                        <span className="location-pill">📍 {hostel.location}</span>
                        <div className="rating-pill">
                            <Star size={16} fill="#ffca28" stroke="#ffca28" />
                            <span>{(hostel.averageRating || 0).toFixed(1)}</span>
                            <span className="rating-count-mini">({hostel.numReviews || 0} reviews)</span>
                        </div>
                        <span className={`gender-pill ${hostel.gender?.toLowerCase() || 'mixed'}`}>
                            {hostel.gender ? hostel.gender.charAt(0).toUpperCase() + hostel.gender.slice(1) : 'Mixed'} Only
                        </span>
                    </div>
                </div>
            </header>

            <div className="details-container">
                <main className="details-main">
                    <section className="info-section">
                        <h2>Description</h2>
                        <p>{hostel.description || 'This premium student accommodation offers a comfortable and secure living environment with modern amenities and convenient access to local facilities.'}</p>
                    </section>

                    {hostel.images && hostel.images.length > 0 && (
                        <section className="info-section">
                            <h2>Photo Gallery</h2>
                            <div className="hostel-gallery-grid">
                                {hostel.images.map((img, idx) => (
                                    <div key={idx} className="gallery-item">
                                        <img src={img} alt={`${hostel.name} view ${idx + 1}`} onClick={() => window.open(img, '_blank')} />
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    <section className="info-section">
                        <h2>Facilities & Amenities</h2>
                        <div className="facilities-grid">
                            {hostel.facilities ? Object.entries(hostel.facilities).map(([key, value]) => (
                                value && (
                                    <div key={key} className="facility-item">
                                        <span className="facility-icon">✨</span>
                                        <span className="facility-name">{key.charAt(0).toUpperCase() + key.slice(1)}</span>
                                    </div>
                                )
                            )) : (
                                <p className="no-data">Amenities list not provided.</p>
                            )}
                        </div>
                    </section>

                    <section className="info-section">
                        <h2>Room Availability</h2>
                        <div className="table-container">
                            <table className="rooms-table">
                                <thead>
                                    <tr>
                                        <th>Room No</th>
                                        <th>Total Beds</th>
                                        <th>Available</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {hostel.rooms && hostel.rooms.length > 0 ? hostel.rooms.map((room, idx) => (
                                        <tr key={idx}>
                                            <td>{room.roomNo}</td>
                                            <td>{room.totalBeds}</td>
                                            <td>{room.availableBeds}</td>
                                            <td>
                                                <span className={`status-tag ${room.availableBeds > 0 ? 'available' : 'full'}`}>
                                                    {room.availableBeds > 0 ? 'Available' : 'Full'}
                                                </span>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="4" style={{ textAlign: 'center', padding: '2rem' }}>No room data available.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* Ratings & Reviews Section */}
                    <div className="ratings-wrapper-modern">
                        <section className="ratings-section glass-morphism">
                            <div className="ratings-header">
                                <h3>Ratings & Reviews</h3>
                                <div className="overall-rating">
                                    <span className="rating-num">{(hostel.averageRating || 0).toFixed(1)}</span>
                                    <div className="rating-stars-static">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Star key={star} size={18} fill={star <= (hostel.averageRating || 0) ? "#ffca28" : "none"} stroke={star <= (hostel.averageRating || 0) ? "#ffca28" : "#94a3b8"} />
                                        ))}
                                    </div>
                                    <span className="rating-count">({hostel.numReviews || 0} reviews)</span>
                                </div>
                            </div>

                            {token ? (
                                <form className="add-rating-form-modern" onSubmit={submitReviewHandler}>
                                    <div className="rating-input-group">
                                        <span className="input-label">Rate this hostel</span>
                                        <div className="stars-input">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <Star
                                                    key={star}
                                                    size={32}
                                                    className={`interactive-star ${(hover || rating) >= star ? 'active' : ''}`}
                                                    fill={(hover || rating) >= star ? "#ffca28" : "none"}
                                                    stroke={(hover || rating) >= star ? "#ffca28" : "#94a3b8"}
                                                    onMouseEnter={() => setHover(star)}
                                                    onMouseLeave={() => setHover(0)}
                                                    onClick={() => setRating(star)}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    <div className="comment-wrapper">
                                        <textarea
                                            className="comment-box-modern"
                                            placeholder="Share your experience (cleanliness, environment, food...)"
                                            value={comment}
                                            onChange={(e) => setComment(e.target.value)}
                                            required
                                        ></textarea>
                                        <div className="textarea-glow"></div>
                                    </div>
                                    <button type="submit" className="submit-review-btn-modern" disabled={submittingReview}>
                                        {submittingReview ? <div className="loader-mini"></div> : <><Send size={18} style={{ marginRight: '8px' }} /> Submit Review</>}
                                    </button>
                                    {reviewSuccess && <p className="success-toast">✨ Review submitted successfully!</p>}
                                </form>
                            ) : (
                                <div className="login-prompt-card">
                                    <p>You must be logged in to leave a review.</p>
                                    <button className="login-link-btn" onClick={() => navigate('/login')}>Login Now</button>
                                </div>
                            )}

                            <div className="reviews-list-modern">
                                {hostel.ratings && hostel.ratings.length > 0 ? (
                                    hostel.ratings.map((rev, idx) => (
                                        <div key={idx} className="review-card-modern">
                                            <div className="rev-user-info">
                                                <div className="user-avatar-mini">
                                                    <User size={18} color="#fff" />
                                                </div>
                                                <div className="rev-meta">
                                                    <span className="rev-username">{rev.userName}</span>
                                                    <span className="rev-date">{rev.createdAt ? new Date(rev.createdAt).toLocaleDateString() : 'Just now'}</span>
                                                </div>
                                                <div className="rev-stars-mini">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <Star key={star} size={14} fill={star <= rev.rating ? "#ffca28" : "none"} stroke={star <= rev.rating ? "#ffca28" : "#94a3b8"} />
                                                    ))}
                                                </div>
                                            </div>
                                            <p className="rev-comment-text">{rev.comment}</p>
                                        </div>
                                    ))
                                ) : (
                                    <div className="no-reviews-placeholder">
                                        <Star size={48} className="placeholder-icon" />
                                        <p>No reviews yet. Be the first to share your thoughts!</p>
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>
                </main>

                <aside className="details-sidebar">
                    <div className="pricing-card">
                        <p className="price-label">Monthly Rent</p>
                        <div className="price-value">
                            <span className="currency">Rs.</span>
                            <span className="amount">{hostel.price}</span>
                            <span className="period">/ month</span>
                        </div>
                        <div className="contact-info">
                            <h3>Contact Information</h3>
                            <p>📞 {hostel.contact || 'Not Provided'}</p>
                        </div>
                        <button className="book-btn" onClick={() => window.location.href = `tel:${hostel.contact}`}>
                            Contact Owner
                        </button>
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default HostelDetails;
