import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, MapPin, Phone, Search, Filter, Award, Sparkles, X } from 'lucide-react';
import './LaundryList.css';

const LaundryList = () => {
    const [laundries, setLaundries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState('All');
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

    const filteredLaundries = React.useMemo(() => {
        let list = [...laundries];

        // Apply search filter (Matching beginning of name or address)
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            list = list.filter(shop =>
                shop.shopName.toLowerCase().startsWith(term) ||
                shop.address.toLowerCase().startsWith(term)
            );
        }

        // Apply Top Rated filter and sort
        if (activeFilter === 'Top Rated') {
            list = list.filter(shop => shop.rating > 3);
            list.sort((a, b) => b.rating - a.rating);
        }

        return list;
    }, [laundries, searchTerm, activeFilter]);

    if (loading) return (
        <div className="laundry-page">
            <div className="laundry-loading">
                <div className="loader"></div>
                <p>Finding premium services...</p>
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
                    <button
                        className={`filter-btn ${activeFilter === 'All' ? 'active' : ''}`}
                        onClick={() => setActiveFilter('All')}
                    >
                        <Filter size={14} /> All Services
                    </button>
                    <button
                        className={`filter-btn ${activeFilter === 'Top Rated' ? 'active' : ''}`}
                        onClick={() => setActiveFilter('Top Rated')}
                    >
                        <Star size={14} /> Top Rated
                    </button>
                </div>
                <div className="search-container-premium">
                    <div className="search-box-luxe">
                        <Search className="search-icon" size={20} />
                        <input
                            type="text"
                            placeholder="Find a laundry shop..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {searchTerm && (
                            <button className="clear-search-btn" onClick={() => setSearchTerm('')}>
                                <X size={14} />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {error && <div className="error-display">{error}</div>}

            <main className="providers-grid-container">
                <AnimatePresence mode="popLayout">
                    {filteredLaundries.length > 0 ? (
                        <motion.div
                            className="providers-grid"
                            layout
                        >
                            {filteredLaundries.map((shop, index) => (
                                <motion.div
                                    key={shop._id}
                                    className={`provider-card ${activeFilter === 'Top Rated' && index === 0 ? 'top-choice' : ''}`}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.2, delay: index * 0.01 }}
                                    layout
                                >
                                    <div className="provider-image">
                                        <img src={shop.image || 'https://images.unsplash.com/photo-1545173168-9f1947eebb7f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'} alt={shop.shopName} />
                                        <div className="image-badges">
                                            <span className={`status-badge ${shop.isOpen ? 'open' : 'closed'}`}>
                                                {shop.isOpen ? 'Open Now' : 'Closed'}
                                            </span>
                                            {shop.rating >= 4.5 && (
                                                <span className="elite-badge">
                                                    <Award size={12} /> Elite
                                                </span>
                                            )}
                                        </div>
                                        {activeFilter === 'Top Rated' && index === 0 && (
                                            <div className="top-choice-ribbon">
                                                <Sparkles size={14} /> #1 Top Rated
                                            </div>
                                        )}
                                    </div>
                                    <div className="provider-info">
                                        <div className="provider-name-row">
                                            <h3>{shop.shopName}</h3>
                                            <div className={`rating-pill ${shop.rating >= 4.5 ? 'high' : ''}`}>
                                                <Star size={14} fill={shop.rating >= 4.5 ? "#fbbf24" : "currentColor"} />
                                                <span>{shop.rating.toFixed(1)}</span>
                                            </div>
                                        </div>
                                        <p className="shop-address"><MapPin size={14} /> {shop.address}</p>
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
                                                <span><Phone size={14} /> {shop.contactNumber}</span>
                                            </div>
                                        </div>
                                        <button className="book-btn-premium" onClick={() => navigate(`/laundry/${shop._id}`)}>
                                            Explore Services
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    ) : (
                        <motion.div
                            className="no-results"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            style={{ 
                                color: '#ef4444', 
                                textAlign: 'center', 
                                padding: '80px 20px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '10px'
                            }}
                        >
                            <Search size={48} opacity={0.5} />
                            <h3 style={{ fontSize: '1.5rem', fontWeight: '700' }}>
                                {searchTerm ? `No results found for "${searchTerm}"` : "No services found"}
                            </h3>
                            <p style={{ opacity: 0.7, fontSize: '0.95rem' }}>Try searching for a different name or location.</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
};

export default LaundryList;
