import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './HostelDetails.css';

const HostelDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [hostel, setHostel] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchHostel = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/hostel/${id}`);
                const data = await response.json();
                if (response.ok) {
                    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
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
    }, [id]);

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
