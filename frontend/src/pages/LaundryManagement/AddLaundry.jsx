import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AddLaundry.css';

const AddLaundry = () => {
    const [formData, setFormData] = useState({
        shopName: '',
        address: '',
        contactNumber: '',
        image: '',
        openingTime: '08:00 AM',
        closingTime: '08:00 PM',
        startDay: 'Monday',
        endDay: 'Saturday'
    });
    const [services, setServices] = useState([
        { name: 'Washing', price: '', unit: 'kg' },
        { name: 'Ironing', price: '', unit: 'item' }
    ]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isEdit, setIsEdit] = useState(false);
    const [shopId, setShopId] = useState(null);

    const navigate = useNavigate();

    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const uploadImage = async () => {
        if (!imageFile) return formData.image;

        const uploadData = new FormData();
        uploadData.append('image', imageFile);

        try {
            const res = await fetch('http://localhost:5000/api/upload', {
                method: 'POST',
                body: uploadData
            });
            const data = await res.json();
            if (res.ok) {
                return data.imageUrl;
            } else {
                throw new Error(data.message || 'Image upload failed');
            }
        } catch (err) {
            throw err;
        }
    };

    useEffect(() => {
        const fetchMyShop = async () => {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            if (!userInfo || userInfo.role !== 'PROVIDER') {
                navigate('/login');
                return;
            }

            try {
                const response = await fetch('http://localhost:5000/api/laundry', {
                    headers: {
                        'Authorization': `Bearer ${userInfo.token}`
                    }
                });
                const data = await response.json();

                // Find if this provider already has a shop
                const myShop = data.find(shop => shop.provider._id === userInfo._id);
                if (myShop) {
                    const days = (myShop.openingDays || 'Monday - Saturday').split(' - ');
                    setFormData({
                        shopName: myShop.shopName,
                        address: myShop.address,
                        contactNumber: myShop.contactNumber,
                        image: myShop.image,
                        openingTime: myShop.openingTime || '08:00 AM',
                        closingTime: myShop.closingTime || '08:00 PM',
                        startDay: days[0] || 'Monday',
                        endDay: days[1] || 'Saturday'
                    });
                    setServices(myShop.services);
                    setIsEdit(true);
                    setShopId(myShop._id);
                }
            } catch (err) {
                console.error('Fetch shop error:', err);
            }
        };

        fetchMyShop();
    }, [navigate]);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleServiceChange = (index, field, value) => {
        const newServices = [...services];
        newServices[index][field] = value;
        setServices(newServices);
    };

    const addService = () => {
        setServices([...services, { name: '', price: '', unit: 'kg' }]);
    };

    const removeService = (index) => {
        setServices(services.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const uploadedImageUrl = await uploadImage();
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const method = isEdit ? 'PUT' : 'POST';
            const url = isEdit ? `http://localhost:5000/api/laundry/${shopId}` : 'http://localhost:5000/api/laundry';

            const payload = {
                ...formData,
                image: uploadedImageUrl,
                services,
                openingDays: `${formData.startDay} - ${formData.endDay}`
            };

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userInfo.token}`
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (response.ok) {
                alert(`Laundry shop ${isEdit ? 'updated' : 'added'} successfully!`);
                navigate('/laundry');
            } else {
                setError(data.message || 'Action failed');
            }
        } catch (err) {
            setError(err.message || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="add-laundry-page">
            <div className="bg-blur"></div>
            <div className="form-container">
                <header className="form-header">
                    <h1>{isEdit ? 'Edit Your Shop' : 'Register Your Laundry Shop'}</h1>
                    <p>Tell students about your services and grow your business.</p>
                </header>

                {error && <div className="error-msg">{error}</div>}

                <form onSubmit={handleSubmit} className="premium-form">
                    <div className="form-section">
                        <h3>Shop Information</h3>
                        <div className="input-group">
                            <label>Shop Name</label>
                            <input type="text" name="shopName" value={formData.shopName} onChange={handleInputChange} placeholder="e.g. QuickClean Laundry" required />
                        </div>
                        <div className="input-group">
                            <label>Address</label>
                            <input type="text" name="address" value={formData.address} onChange={handleInputChange} placeholder="e.g. 123 University Ave" required />
                        </div>
                        <div className="input-group">
                            <label>Contact Number</label>
                            <input type="text" name="contactNumber" value={formData.contactNumber} onChange={handleInputChange} placeholder="e.g. 071 234 5678" required />
                        </div>
                        <div className="time-grid">
                            <div className="input-group">
                                <label>Opening Time</label>
                                <select name="openingTime" value={formData.openingTime} onChange={handleInputChange} required>
                                    {['06:00 AM', '06:30 AM', '07:00 AM', '07:30 AM', '08:00 AM', '08:30 AM', '09:00 AM', '09:30 AM', '10:00 AM'].map(t => (
                                        <option key={t} value={t}>{t}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="input-group">
                                <label>Closing Time</label>
                                <select name="closingTime" value={formData.closingTime} onChange={handleInputChange} required>
                                    {['05:00 PM', '05:30 PM', '06:00 PM', '06:30 PM', '07:00 PM', '07:30 PM', '08:00 PM', '08:30 PM', '09:00 PM', '10:00 PM'].map(t => (
                                        <option key={t} value={t}>{t}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="time-grid">
                            <div className="input-group">
                                <label>Start Day</label>
                                <select name="startDay" value={formData.startDay} onChange={handleInputChange} required>
                                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => (
                                        <option key={d} value={d}>{d}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="input-group">
                                <label>End Day</label>
                                <select name="endDay" value={formData.endDay} onChange={handleInputChange} required>
                                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => (
                                        <option key={d} value={d}>{d}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="input-group">
                            <label>Shop Image</label>
                            <div className="file-upload-wrapper">
                                <label className="file-label">
                                    <input type="file" onChange={handleFileChange} accept="image/*" />
                                    <span>{imageFile ? imageFile.name : 'Click to upload shop image'}</span>
                                </label>
                                {(imagePreview || formData.image) && (
                                    <div className="image-preview-box">
                                        <img src={imagePreview || formData.image} alt="Preview" />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="form-section">
                        <div className="section-header">
                            <h3>Services & Pricing</h3>
                            <button type="button" onClick={addService} className="add-btn">+ Add Service</button>
                        </div>

                        {services.map((service, index) => (
                            <div key={index} className="service-row">
                                <input type="text" placeholder="Service Name" value={service.name} onChange={(e) => handleServiceChange(index, 'name', e.target.value)} required />
                                <input type="number" placeholder="Price" value={service.price} onChange={(e) => handleServiceChange(index, 'price', e.target.value)} required />
                                <select value={service.unit} onChange={(e) => handleServiceChange(index, 'unit', e.target.value)}>
                                    <option value="kg">per kg</option>
                                    <option value="item">per item</option>
                                    <option value="pair">per pair</option>
                                </select>
                                <button type="button" onClick={() => removeService(index)} className="remove-btn">✕</button>
                            </div>
                        ))}
                    </div>

                    <button type="submit" className="submit-btn" disabled={loading}>
                        {loading ? 'Processing...' : isEdit ? 'Update Shop Details' : 'Register Shop'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddLaundry;
