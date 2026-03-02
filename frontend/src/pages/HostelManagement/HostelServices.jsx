import React, { useState } from 'react';
import './HostelServices.css';

const HostelServices = () => {
    const [searchTerm, setSearchTerm] = useState('');

    // Mock data for hostels
    const hostels = [
        {
            _id: '1',
            name: 'Elite Boys Hostel',
            address: '123 University Lane, Colombo',
            rating: 4.8,
            price: 15000,
            image: 'https://images.unsplash.com/photo-1555854817-5b2260d50c47?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            isOpen: true,
            type: 'Boys'
        },
        {
            _id: '2',
            name: 'Serene Girls Boarding',
            address: '45 Garden Road, Kandy',
            rating: 4.6,
            price: 12000,
            image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            isOpen: true,
            type: 'Girls'
        },
        {
            _id: '3',
            name: 'Modern Stay Apartments',
            address: '88 Tech Park, Malabe',
            rating: 4.9,
            price: 25000,
            image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            isOpen: false,
            type: 'Mixed'
        },
        {
            _id: '4',
            name: 'University Square Hostel',
            address: '10 College Avenue, Galle',
            rating: 4.5,
            price: 10000,
            image: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            isOpen: true,
            type: 'Boys'
        }
    ];

    const filteredHostels = hostels.filter(hostel =>
        hostel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hostel.address.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="hostels-page">
            <header className="hostels-header">
                <div className="header-content">
                    <h1>Hostel & Boarding Services</h1>
                    <p>Find your perfect home away from home. Premium accommodations for students.</p>
                </div>
            </header>

            <div className="filters-bar">
                <div className="filter-group">
                    <button className="filter-btn active">All Hostels</button>
                    <button className="filter-btn">Near University</button>
                    <button className="filter-btn">Boys Only</button>
                    <button className="filter-btn">Girls Only</button>
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

            <main className="hostels-grid">
                {filteredHostels.length > 0 ? (
                    filteredHostels.map(hostel => (
                        <div key={hostel._id} className="hostel-card">
                            <div className="hostel-image">
                                <img src={hostel.image} alt={hostel.name} />
                                <span className={`status-badge ${hostel.isOpen ? 'open' : 'closed'}`}>
                                    {hostel.isOpen ? 'Available' : 'Full'}
                                </span>
                                <span className="type-badge">{hostel.type}</span>
                            </div>
                            <div className="hostel-info">
                                <div className="hostel-name-row">
                                    <h3>{hostel.name}</h3>
                                    <div className="rating">⭐ {hostel.rating.toFixed(1)}</div>
                                </div>
                                <p className="hostel-address">📍 {hostel.address}</p>
                                <div className="hostel-footer">
                                    <div className="price-info">
                                        <span className="price">Rs. {hostel.price.toLocaleString()}</span>
                                        <span className="unit">/month</span>
                                    </div>
                                    <button className="view-btn">View Details</button>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="no-results">
                        <h3>No hostels found</h3>
                        <p>Try searching for a different name or location.</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default HostelServices;
