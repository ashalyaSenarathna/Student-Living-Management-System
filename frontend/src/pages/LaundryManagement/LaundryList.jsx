import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './LaundryList.css';

const LaundryList = () => {
    const [laundries, setLaundries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

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

        // If days are not recognized, default to open (or handle as needed)
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
        const fetchLaundries = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/laundry');
                const data = await response.json();
                if (response.ok) {
                    const updatedLaundries = data.map(shop => ({
                        ...shop,
                        isOpen: isShopCurrentlyOpen(shop.openingTime, shop.closingTime, shop.openingDays)
                    }));
                    setLaundries(updatedLaundries);
                } else {
                    setError(data.message || 'Failed to fetch services');
                }
            } catch (err) {
                setError('Could not connect to the server');
            } finally {
                setLoading(false);
            }
        };

        fetchLaundries();
    }, []);

    const filteredLaundries = laundries.filter(shop =>
        shop.shopName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shop.address.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return (
        <div className="laundry-page">
            <div className="laundry-loading">
                <div className="loader"></div>
                <p>Finding premium services near you...</p>
            </div>
        </div>
    );

    return (
        <div className="laundry-page">
            <header className="laundry-header">
                <div className="header-content">
                    <h1>Laundry Services</h1>
                    <p>Professional care for your clothes. Book your slot in seconds.</p>
                </div>
            </header>

            <div className="filters-bar">
                <div className="filter-group">
                    <button className="filter-btn active">All Services</button>
                    <button className="filter-btn">Near Me</button>
                    <button className="filter-btn">Top Rated</button>
                </div>
                <div className="search-box">
                    <input
                        type="text"
                        placeholder="Search by shop name or location..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {error && <div className="error-display">{error}</div>}

            <main className="providers-grid">
                {filteredLaundries.length > 0 ? (
                    filteredLaundries.map(shop => (
                        <div key={shop._id} className="provider-card">
                            <div className="provider-image">
                                <img src={shop.image || 'https://images.unsplash.com/photo-1545173168-9f1947eebb7f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'} alt={shop.shopName} />
                                <span className={`status-badge ${shop.isOpen ? 'open' : 'closed'}`}>
                                    {shop.isOpen ? 'Open Now' : 'Closed'}
                                </span>
                            </div>
                            <div className="provider-info">
                                <div className="provider-name-row">
                                    <h3>{shop.shopName}</h3>
                                    <div className="rating">⭐ {shop.rating.toFixed(1)}</div>
                                </div>
                                <p className="shop-address">📍 {shop.address}</p>
                                <div className="services-tags">
                                    {shop.services.slice(0, 3).map((s, i) => (
                                        <span key={i} className="service-tag">{s.name}</span>
                                    ))}
                                    {shop.services.length > 3 && <span className="service-tag">+{shop.services.length - 3} more</span>}
                                </div>
                                <div className="provider-footer">
                                    <div className="price-info">
                                        <span className="price">From Rs. {shop.services[0]?.price || '---'}</span>
                                        <span className="unit">/{shop.services[0]?.unit || 'kg'}</span>
                                    </div>
                                    <div className="contact-info">
                                        <span>📞 {shop.contactNumber}</span>
                                    </div>
                                </div>
                                <button className="book-btn" onClick={() => navigate(`/laundry/${shop._id}`)}>View Services & Book</button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="no-results">
                        <h3>No laundry shops found</h3>
                        <p>Try searching for a different name or location.</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default LaundryList;
