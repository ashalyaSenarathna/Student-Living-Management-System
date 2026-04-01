import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star } from 'lucide-react';
import './HostelManagement.css';

const HostelManagement = () => {
    const [hostels, setHostels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all'); // 'all', 'boys', 'girls', 'mixed'
    const navigate = useNavigate();

    useEffect(() => {
        const fetchHostels = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/hostel');
                const data = await response.json();
                if (response.ok) {
                    // Backend already filters by status: 'approved' for this public endpoint
                    setHostels(data);
                } else {
                    setError(data.message || 'Failed to fetch hostels');
                }
            } catch (err) {
                setError('Could not connect to the server');
            } finally {
                setLoading(false);
            }
        };

        fetchHostels();
    }, []);

    const filtered = hostels.filter(h => {
        const matchesSearch = h.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            h.location?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filter === 'all' || (h.gender?.toLowerCase() === filter);
        return matchesSearch && matchesFilter;
    });

    if (loading) return (
        <div className="hostel-page">
            <div className="loader"></div>
            <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.6)' }}>Finding your next home...</p>
        </div>
    );

    return (
        <div className="hostel-page">
            <header className="hostel-header">
                <div className="header-content">
                    <h1>Hostels & Boardings</h1>
                    <p>Find the perfect student accommodation with premium facilities.</p>
                </div>
            </header>

            <div className="hostel-controls">
                <div className="filter-group">
                    <button
                        className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                        onClick={() => setFilter('all')}
                    >All</button>
                    <button
                        className={`filter-btn ${filter === 'boys' ? 'active' : ''}`}
                        onClick={() => setFilter('boys')}
                    >Boys Only</button>
                    <button
                        className={`filter-btn ${filter === 'girls' ? 'active' : ''}`}
                        onClick={() => setFilter('girls')}
                    >Girls Only</button>
                </div>
                <div className="search-box">
                    <input
                        type="text"
                        placeholder="Search by name or location..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {error && <div className="error-display">{error}</div>}

            <main className="hostel-grid">
                {filtered.length > 0 ? (
                    filtered.map(h => (
                        <div key={h._id || h.id} className="hostel-card">
                            <div className="hostel-image">
                                <img src={h.images?.[0] || h.image || 'https://images.unsplash.com/photo-1493666438817-866a91353ca9?auto=format&fit=crop&w=800&q=80'} alt={h.name} />
                                <span className={`gender-badge ${h.gender?.toLowerCase() || 'mixed'}`}>
                                    {h.gender ? h.gender.charAt(0).toUpperCase() + h.gender.slice(1) : 'Mixed'}
                                </span>
                            </div>
                            <div className="hostel-info">
                                <div className="hostel-name-row">
                                    <h3>{h.name || 'Unnamed Accommodation'}</h3>
                                    <div className="hostel-card-rating">
                                        <Star size={14} fill="#ffca28" stroke="#ffca28" />
                                        <span>{(h.averageRating || 0).toFixed(1)}</span>
                                        <span className="review-count">({h.numReviews || 0})</span>
                                    </div>
                                </div>
                                <p className="hostel-location">📍 {h.location || 'Location Not Specified'}</p>
                                <p className="hostel-desc">{h.description || 'Premium student accommodation with modern facilities and secure environment.'}</p>
                                <div className="hostel-footer">
                                    <div className="price-info">
                                        <span className="price">Rs. {h.price || '---'}</span>
                                        <span className="unit">/ month</span>
                                    </div>
                                    <button onClick={() => navigate(`/hostel/${h._id || h.id}`)} className="view-btn">View Details</button>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="no-results">
                        <h3>No accommodations found</h3>
                        <p>Try adjusting your filters or search terms.</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default HostelManagement;

