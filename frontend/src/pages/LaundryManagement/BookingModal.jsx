import React, { useState } from 'react';
import './BookingModal.css';

const BookingModal = ({ isOpen, onClose, laundry, onBookingSuccess }) => {
    const [selectedServices, setSelectedServices] = useState([]);
    const [pickupDate, setPickupDate] = useState('');
    const [pickupTime, setPickupTime] = useState('');
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleServiceToggle = (service) => {
        const isSelected = selectedServices.find(s => s.name === service.name);
        if (isSelected) {
            setSelectedServices(selectedServices.filter(s => s.name !== service.name));
        } else {
            setSelectedServices([...selectedServices, { ...service, quantity: 1 }]);
        }
    };

    const handleQuantityChange = (serviceName, value) => {
        const newQty = parseInt(value) || 1;
        setSelectedServices(selectedServices.map(s =>
            s.name === serviceName ? { ...s, quantity: newQty } : s
        ));
    };

    const calculateTotal = () => {
        return selectedServices.reduce((acc, s) => acc + (s.price * s.quantity), 0);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (selectedServices.length === 0) {
            setError('Please select at least one service');
            return;
        }

        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        if (!userInfo) {
            setError('Please login to continue');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('http://localhost:5000/api/bookings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userInfo.token}`
                },
                body: JSON.stringify({
                    laundry: laundry._id,
                    services: selectedServices,
                    pickupDate,
                    pickupTime,
                    totalPrice: calculateTotal(),
                    notes
                })
            });

            const data = await response.json();

            if (response.ok) {
                onBookingSuccess(data);
                onClose();
            } else {
                setError(data.message || 'Booking failed');
            }
        } catch (err) {
            setError('Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="booking-modal">
                <button className="close-modal" onClick={onClose}>✕</button>
                <div className="modal-header">
                    <h2>Book Service - {laundry.shopName}</h2>
                    <p>Select services and schedule your pickup</p>
                </div>

                {error && <div className="modal-error">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="modal-section">
                        <h3>1. Select Services</h3>
                        <div className="modal-services-list">
                            {laundry.services.map((service, index) => (
                                <div key={index} className="modal-service-item">
                                    <div className="service-main">
                                        <input
                                            type="checkbox"
                                            checked={!!selectedServices.find(s => s.name === service.name)}
                                            onChange={() => handleServiceToggle(service)}
                                        />
                                        <div className="service-details">
                                            <span className="service-name">{service.name}</span>
                                            <span className="service-price">Rs. {service.price} / {service.unit}</span>
                                        </div>
                                    </div>
                                    {selectedServices.find(s => s.name === service.name) && (
                                        <div className="qty-input">
                                            <label>Qty ({service.unit}):</label>
                                            <input
                                                type="number"
                                                min="1"
                                                value={selectedServices.find(s => s.name === service.name).quantity}
                                                onChange={(e) => handleQuantityChange(service.name, e.target.value)}
                                            />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="modal-section-grid">
                        <div className="modal-section">
                            <h3>2. Pickup Info</h3>
                            <div className="input-row">
                                <div className="modal-input-group">
                                    <label>Date</label>
                                    <input
                                        type="date"
                                        value={pickupDate}
                                        onChange={(e) => setPickupDate(e.target.value)}
                                        min={new Date().toISOString().split('T')[0]}
                                        required
                                    />
                                </div>
                                <div className="modal-input-group">
                                    <label>Time</label>
                                    <input type="time" value={pickupTime} onChange={(e) => setPickupTime(e.target.value)} required />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="modal-section">
                        <h3>3. Additional Notes</h3>
                        <textarea
                            placeholder="Any special instructions?"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        ></textarea>
                    </div>

                    <div className="modal-footer">
                        <div className="total-display">
                            <span>Total Estimate</span>
                            <h3>Rs. {calculateTotal()}</h3>
                        </div>
                        <button type="submit" className="confirm-booking-btn" disabled={loading}>
                            {loading ? 'Processing...' : 'Confirm Booking'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BookingModal;
