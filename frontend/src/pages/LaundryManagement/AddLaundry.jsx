import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Store,
    MapPin,
    Phone,
    Clock,
    Calendar,
    Plus,
    Trash2,
    UploadCloud,
    Camera,
    Tag,
    Banknote,
    Layers,
    Shirt,
    Weight,
    Package,
    ChevronDown,
    ImagePlus,
    X,
    Sun,
    Moon,
    ArrowRight
} from 'lucide-react';
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
    const [shopId, setShopId] = useState(null);
    const { id } = useParams();
    const isEdit = !!id;

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
        const fetchShop = async () => {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            if (!userInfo || userInfo.role !== 'PROVIDER') {
                navigate('/login');
                return;
            }

            if (!id) return; // Not editing

            try {
                const response = await fetch(`http://localhost:5000/api/laundry/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${userInfo.token}`
                    }
                });
                const myShop = await response.json();

                if (response.ok) {
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

        fetchShop();
    }, [id, navigate]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        if (name === 'contactNumber') {
            // Only allow numbers and max length 10
            const numericValue = value.replace(/[^0-9]/g, '');
            if (numericValue.length <= 10) {
                setFormData({ ...formData, [name]: numericValue });
            }
            return;
        }

        if (name === 'shopName') {
            // Remove numbers
            const sanitizedValue = value.replace(/[0-9]/g, '');
            setFormData({ ...formData, [name]: sanitizedValue });
            return;
        }

        setFormData({ ...formData, [name]: value });
    };

    const handleServiceChange = (index, field, value) => {
        const newServices = [...services];
        if (field === 'name') {
            // Remove numbers
            newServices[index][field] = value.replace(/[0-9]/g, '');
        } else {
            newServices[index][field] = value;
        }
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
                navigate('/profile');
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
                        <div className="section-title-wrapper">
                            <div className="section-icon"><Store size={20} /></div>
                            <h3>Shop Information</h3>
                        </div>

                        <div className="input-row-flex">
                            <div className="input-group">
                                <label>Shop Name</label>
                                <div className="input-wrapper-icon">
                                    <Store className="field-icon" size={18} />
                                    <input type="text" name="shopName" value={formData.shopName} onChange={handleInputChange} placeholder="QuickClean Laundry" required />
                                </div>
                            </div>
                        </div>

                        <div className="input-group">
                            <label>Store Address</label>
                            <div className="input-wrapper-icon">
                                <MapPin className="field-icon" size={18} />
                                <input type="text" name="address" value={formData.address} onChange={handleInputChange} placeholder="123 University Ave, Campus View" required />
                            </div>
                        </div>

                        <div className="input-row-grid">
                            <div className="input-group">
                                <label>Contact Number (10 digits)</label>
                                <div className="input-wrapper-icon">
                                    <Phone className="field-icon" size={18} />
                                    <input type="text" name="contactNumber" value={formData.contactNumber} onChange={handleInputChange} placeholder="0771234567" maxLength="10" required />
                                </div>
                            </div>
                        </div>

                        <div className="timing-container-premium">
                            <div className="timing-flex-row">
                                <div className="timing-block">
                                    <div className="timing-subtitle">
                                        <Calendar size={18} />
                                        <span>Weekly Availability</span>
                                    </div>
                                    <div className="timing-controls">
                                        <div className="timing-control-item">
                                            <label>From</label>
                                            <div className="input-with-icon-mini">
                                                <select name="startDay" value={formData.startDay} onChange={handleInputChange} required>
                                                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => (
                                                        <option key={d} value={d}>{d}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                        <div className="timing-separator">
                                            <ArrowRight size={14} />
                                        </div>
                                        <div className="timing-control-item">
                                            <label>To</label>
                                            <div className="input-with-icon-mini">
                                                <select name="endDay" value={formData.endDay} onChange={handleInputChange} required>
                                                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => (
                                                        <option key={d} value={d}>{d}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="timing-block">
                                    <div className="timing-subtitle">
                                        <Clock size={18} />
                                        <span>Daily Hours</span>
                                    </div>
                                    <div className="timing-controls">
                                        <div className="timing-control-item">
                                            <label><Sun size={12} /> Opening</label>
                                            <div className="input-with-icon-mini">
                                                <select name="openingTime" value={formData.openingTime} onChange={handleInputChange} required>
                                                    {['06:00 AM', '06:30 AM', '07:00 AM', '07:30 AM', '08:00 AM', '08:30 AM', '09:00 AM', '09:30 AM', '10:00 AM'].map(t => (
                                                        <option key={t} value={t}>{t}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                        <div className="timing-separator">
                                            <ArrowRight size={14} />
                                        </div>
                                        <div className="timing-control-item">
                                            <label><Moon size={12} /> Closing</label>
                                            <div className="input-with-icon-mini">
                                                <select name="closingTime" value={formData.closingTime} onChange={handleInputChange} required>
                                                    {['05:00 PM', '05:30 PM', '06:00 PM', '06:30 PM', '07:00 PM', '07:30 PM', '08:00 PM', '08:30 PM', '09:00 PM', '10:00 PM'].map(t => (
                                                        <option key={t} value={t}>{t}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="input-group full-width-group">
                            <label>Shop Showcase Image</label>
                            <div className="image-upload-premium">
                                {!imagePreview && !formData.image ? (
                                    <label className="image-dropbox">
                                        <input type="file" onChange={handleFileChange} accept="image/*" />
                                        <div className="dropbox-content">
                                            <div className="dropbox-icon-outer">
                                                <ImagePlus size={32} />
                                            </div>
                                            <div className="dropbox-text">
                                                <h4>Drag and drop or click to upload</h4>
                                                <p>Help students find your shop with a high-quality photo</p>
                                            </div>
                                            <div className="upload-specs">
                                                <span>PNG, JPG, WEBP • Max 5MB</span>
                                            </div>
                                        </div>
                                    </label>
                                ) : (
                                    <div className="image-preview-standalone">
                                        <img src={imagePreview || formData.image} alt="Shop Preview" />
                                        <div className="image-preview-overlay">
                                            <div className="overlay-actions">
                                                <label className="overlay-btn replace">
                                                    <input type="file" onChange={handleFileChange} accept="image/*" />
                                                    <ImagePlus size={18} />
                                                    <span>Change Image</span>
                                                </label>                                            </div>
                                        </div>
                                        <div className="preview-status-pill">
                                            <Camera size={14} /> Ready to Showcase
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="form-section">
                        <div className="section-title-wrapper premium-section">
                            <div className="section-icon-glow"><Layers size={22} /></div>
                            <div className="section-header-content">
                                <div>
                                    <h3>Services & Pricing</h3>
                                    <p className="section-subtitle">Define what you offer and your rates per unit.</p>
                                </div>
                                <button type="button" onClick={addService} className="add-btn-lux">
                                    <Plus size={18} /> Add New Service
                                </button>
                            </div>
                        </div>

                        <div className="services-cards-grid">
                            <AnimatePresence>
                                {services.map((service, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ duration: 0.3 }}
                                        className="service-card-premium"
                                    >
                                        <div className="card-index">0{index + 1}</div>

                                        <div className="card-row">
                                            <div className="card-field full-width">
                                                <label><Tag size={13} /> Service Name</label>
                                                <input
                                                    type="text"
                                                    placeholder="Premium Washing"
                                                    value={service.name}
                                                    onChange={(e) => handleServiceChange(index, 'name', e.target.value)}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="card-row split">
                                            <div className="card-field">
                                                <label><Banknote size={13} /> Base Price</label>
                                                <div className="price-input-wrapper">
                                                    <span className="currency-badge">Rs.</span>
                                                    <input
                                                        type="number"
                                                        placeholder="0.00"
                                                        value={service.price}
                                                        onChange={(e) => handleServiceChange(index, 'price', e.target.value)}
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            <div className="card-field">
                                                <label><Layers size={13} /> Pricing Unit</label>
                                                <div className="custom-unit-dropdown">
                                                    <div className="unit-options-grid">
                                                        {[
                                                            { value: 'kg', label: 'kg', icon: <Weight size={14} /> },
                                                            { value: 'item', label: 'item', icon: <Shirt size={14} /> },
                                                            { value: 'pair', label: 'pair', icon: <Package size={14} /> }
                                                        ].map(opt => (
                                                            <button
                                                                key={opt.value}
                                                                type="button"
                                                                className={`unit-opt-btn ${service.unit === opt.value ? 'active' : ''}`}
                                                                onClick={() => handleServiceChange(index, 'unit', opt.value)}
                                                                title={`Per ${opt.value}`}
                                                                tabIndex={0}
                                                            >
                                                                <span className="unit-icon">{opt.icon}</span>
                                                                <span className="unit-label">{opt.label}</span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => removeService(index)}
                                            className="remove-card-btn"
                                            title="Delete Service"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
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
