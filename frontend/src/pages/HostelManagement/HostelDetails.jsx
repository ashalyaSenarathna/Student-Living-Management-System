import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Star, 
    Send, 
    User, 
    MapPin, 
    ArrowLeft, 
    Share2, 
    Heart, 
    Wifi, 
    Coffee, 
    Shield, 
    Wind, 
    Zap, 
    PhoneCall,
    Grid
} from 'lucide-react';
import './HostelDetails.css';

const facilityIconMap = {
    wifi: <Wifi size={18} />,
    food: <Coffee size={18} />,
    security: <Shield size={18} />,
    ac: <Wind size={18} />,
    power: <Zap size={18} />,
    gym: <Grid size={18} />
};

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
    const [isSaved, setIsSaved] = useState(false);

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

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.15, duration: 0.5 }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { duration: 0.5, ease: "easeOut" }
        }
    };

    if (loading) return (
        <div className="hostel-details-page">
            <div className="loader-container">
                <div className="loader"></div>
                <p className="loading-text">Preparing premium accommodation view...</p>
            </div>
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
        <motion.div 
            className="hostel-details-page"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
        >
            <header className="details-hero" style={{
                backgroundImage: `url(${hostel.images?.[0] || hostel.image || 'https://images.unsplash.com/photo-1493666438817-866a91353ca9?auto=format&fit=crop&w=1200&q=80'})`
            }}>
                <div className="hero-content">
                    <motion.div className="back-link-wrapper" variants={itemVariants}>
                        <button className="back-link" onClick={() => navigate('/hostel')}>
                            <ArrowLeft size={18} /> Back to Search
                        </button>
                    </motion.div>
                    
                    <motion.div className="hero-title-group" variants={itemVariants}>
                        <h1>{hostel.name}</h1>
                        <div className="hero-meta">
                            <span className="meta-pill location-pill">
                                <MapPin size={16} /> {hostel.location}
                            </span>
                            <div className="meta-pill rating-pill-modern">
                                <Star size={16} fill="currentColor" />
                                <span>{(hostel.averageRating || 0).toFixed(1)}</span>
                                <span className="text-muted">({hostel.numReviews || 0} reviews)</span>
                            </div>
                            <span className={`meta-pill gender-pill ${hostel.gender?.toLowerCase() || 'mixed'}`}>
                                {hostel.gender ? hostel.gender.charAt(0).toUpperCase() + hostel.gender.slice(1) : 'Mixed'} Only
                            </span>
                        </div>
                    </motion.div>

                    <div className="hero-actions">
                        <button className="hero-action-btn" onClick={() => {
                            navigator.clipboard.writeText(window.location.href);
                            alert('Link copied to clipboard!');
                        }}>
                            <Share2 size={20} />
                        </button>
                        <button 
                            className={`hero-action-btn ${isSaved ? 'active' : ''}`} 
                            onClick={() => setIsSaved(!isSaved)}
                        >
                            <Heart size={20} fill={isSaved ? "#ef4444" : "none"} color={isSaved ? "#ef4444" : "currentColor"} />
                        </button>
                    </div>
                </div>
            </header>

            <div className="details-container">
                <main className="details-main">
                    <motion.section className="info-section" variants={itemVariants}>
                        <h2>Description</h2>
                        <p>{hostel.description || 'This premium student accommodation offers a comfortable and secure living environment with modern amenities and convenient access to local facilities. Perfect for students seeking a quiet yet connected lifestyle.'}</p>
                    </motion.section>

                    {hostel.images && hostel.images.length > 0 && (
                        <motion.section className="info-section" variants={itemVariants}>
                            <h2>Photo Gallery</h2>
                            <div className="hostel-gallery-grid">
                                {hostel.images.map((img, idx) => (
                                    <div key={idx} className="gallery-item" onClick={() => window.open(img, '_blank')}>
                                        <img src={img} alt={`${hostel.name} view ${idx + 1}`} />
                                        <div className="gallery-overlay">
                                            <Share2 size={24} color="#fff" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.section>
                    )}

                    <motion.section className="info-section" variants={itemVariants}>
                        <h2>Facilities & Amenities</h2>
                        <div className="facilities-grid">
                            {hostel.facilities ? Object.entries(hostel.facilities).map(([key, value]) => (
                                value && (
                                    <div key={key} className="facility-item-modern">
                                        <div className="f-icon-box">
                                            {facilityIconMap[key.toLowerCase()] || <Star size={18} />}
                                        </div>
                                        <span className="facility-name">{key.charAt(0).toUpperCase() + key.slice(1)}</span>
                                    </div>
                                )
                            )) : (
                                <p className="text-muted">Amenities list not provided.</p>
                            )}
                        </div>
                    </motion.section>

                    <motion.section className="info-section" variants={itemVariants}>
                        <h2>Room Availability</h2>
                        <div className="modern-table-card">
                            <table className="modern-table">
                                <thead>
                                    <tr>
                                        <th>Room No</th>
                                        <th>Total Beds</th>
                                        <th>Available</th>
                                        <th>Current Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {hostel.rooms && hostel.rooms.length > 0 ? hostel.rooms.map((room, idx) => (
                                        <tr key={idx}>
                                            <td>Room #{room.roomNo}</td>
                                            <td>{room.totalBeds} Beds</td>
                                            <td>{room.availableBeds} Left</td>
                                            <td>
                                                <span className={`status-indicator ${room.availableBeds > 0 ? 'available' : 'full'}`}>
                                                    {room.availableBeds > 0 ? '● Available' : '● Fully Booked'}
                                                </span>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="4" style={{ textAlign: 'center', padding: '3rem' }}>No room data available currently.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </motion.section>

                    {/* Ratings & Reviews Section */}
                    <motion.section className="info-section ratings-section glass-morphism" variants={itemVariants}>
                        <div className="ratings-header">
                            <h3>Ratings & Reviews</h3>
                        </div>

                        {/* Ratings Summary Dashboard */}
                        <div className="ratings-layout-modern">
                            <div className="rating-summary-card">
                                <h4>Overall Rating</h4>
                                <span className="big-num">{(hostel.averageRating || 0).toFixed(1)}</span>
                                <div className="rating-stars-static" style={{ justifyContent: 'center', marginTop: '0.5rem' }}>
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star key={star} size={24} fill={star <= (hostel.averageRating || 0) ? "#ffca28" : "none"} stroke={star <= (hostel.averageRating || 0) ? "#ffca28" : "#94a3b8"} />
                                    ))}
                                </div>
                                <span className="total-count">Based on {hostel.numReviews || 0} verified reviews</span>
                            </div>

                            <div className="rating-bars-container">
                                {[5, 4, 3, 2, 1].map((starValue) => {
                                    const count = hostel.ratings?.filter(r => Math.round(r.rating) === starValue).length || 0;
                                    const percentage = hostel.numReviews > 0 ? (count / hostel.numReviews) * 100 : 0;
                                    return (
                                        <div key={starValue} className="rating-bar-row">
                                            <div className="star-label">{starValue} <Star size={14} fill="#ffca28" stroke="#ffca28" /></div>
                                            <div className="bar-wrapper">
                                                <motion.div 
                                                    className="bar-fill" 
                                                    initial={{ width: 0 }}
                                                    whileInView={{ width: `${percentage}%` }}
                                                    transition={{ duration: 1, ease: "easeOut" }}
                                                />
                                            </div>
                                            <div className="percentage-label">{Math.round(percentage)}%</div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {token ? (
                            userInfo.role === 'USER' ? (
                                <form className="add-rating-form-modern animate-in" onSubmit={submitReviewHandler}>
                                    <div className="rating-input-group">
                                        <span className="input-label">Share your experience</span>
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
                                    <div className="comment-wrapper-premium">
                                        <div className="input-icon-mini">
                                            <Send size={16} />
                                        </div>
                                        <textarea
                                            className="comment-box-premium"
                                            placeholder="What did you like about this stay? (cleanliness, host, amenities...)"
                                            value={comment}
                                            onChange={(e) => setComment(e.target.value)}
                                            required
                                            maxLength={500}
                                        ></textarea>
                                        <div className="textarea-glow-premium"></div>
                                        <div className="char-count">{comment.length}/500</div>
                                    </div>
                                    <div className="review-action-row">
                                        <button type="submit" className="submit-review-btn-modern" disabled={submittingReview}>
                                            {submittingReview ? (
                                                <div className="loader-mini"></div>
                                            ) : (
                                                <>
                                                    <div className="btn-glow"></div>
                                                    <Send size={18} /> 
                                                    <span>Post Review</span>
                                                </>
                                            )}
                                        </button>
                                        {reviewSuccess && <p className="success-toast">✨ Review published successfully!</p>}
                                    </div>
                                </form>
                            ) : (
                                <div className="user-restriction-card animate-in">
                                    <Shield size={32} className="restriction-icon" />
                                    <p>Reviews are restricted to verified students. {userInfo.role === 'ADMIN' ? 'As an administrator, you' : 'As a property owner, you'} can monitor reviews but cannot post them.</p>
                                </div>
                            )
                        ) : (
                            <div className="login-prompt-card animate-in">
                                <p>Join the community to share your thoughts.</p>
                                <button className="login-link-btn" onClick={() => navigate('/login')}>Login to Review</button>
                            </div>
                        )}

                        <div className="reviews-list-modern">
                            <AnimatePresence>
                                {hostel.ratings && hostel.ratings.length > 0 ? (
                                    hostel.ratings.map((rev, idx) => {
                                        const colors = ['#6366f1', '#a855f7', '#ec4899', '#3b82f6', '#10b981'];
                                        const avatarBg = colors[idx % colors.length];
                                        return (
                                            <motion.div 
                                                key={idx} 
                                                className="review-card-modern"
                                                initial={{ opacity: 0, x: -20 }}
                                                whileInView={{ opacity: 1, x: 0 }}
                                                transition={{ delay: idx * 0.1 }}
                                                viewport={{ once: true }}
                                            >
                                                <div className="rev-header-top">
                                                    <div className="rev-user-details">
                                                        <div className="user-avatar-premium" style={{ background: avatarBg }}>
                                                            {rev.userName?.charAt(0).toUpperCase() || 'U'}
                                                        </div>
                                                        <div className="rev-name-group">
                                                            <h5>{rev.userName}</h5>
                                                            <span>{rev.createdAt ? new Date(rev.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent Stay'}</span>
                                                        </div>
                                                    </div>
                                                    <div className="rev-rating-stars">
                                                        {[1, 2, 3, 4, 5].map((star) => (
                                                            <Star key={star} size={16} fill={star <= rev.rating ? "#ffca28" : "none"} stroke={star <= rev.rating ? "#ffca28" : "#94a3b8"} />
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="rev-text-content">
                                                    <p>{rev.comment}</p>
                                                </div>
                                            </motion.div>
                                        );
                                    })
                                ) : (
                                    <div className="no-reviews-placeholder">
                                        <Star size={44} className="placeholder-icon" />
                                        <p>Be the first to rate this premium stay!</p>
                                    </div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.section>
                </main>

                <aside className="details-sidebar">
                    <motion.div 
                        className="pricing-card-premium"
                        variants={itemVariants}
                    >
                        <div className="price-header-modern">
                            <p className="price-label">Exclusively at</p>
                            <div className="price-main">
                                <span className="amount">Rs. {hostel.price}</span>
                                <span className="period">/mo</span>
                            </div>
                        </div>

                        <div className="contact-divider"></div>

                        <div className="contact-box-premium">
                            <h3>Contact for Reserveration</h3>
                            <div className="phone-badge">
                                <span className="label">Direct Hotline</span>
                                <span className="number">{hostel.contact}</span>
                            </div>
                            
                            <button 
                                className="cta-btn-modern" 
                                onClick={() => window.location.href = `tel:${hostel.contact}`}
                            >
                                <PhoneCall size={20} /> Call Owner Now
                            </button>
                            
                            <p className="contact-help-text">Mention Student Living for priority check-in</p>
                        </div>
                    </motion.div>
                </aside>
            </div>
        </motion.div>
    );
};

export default HostelDetails;
