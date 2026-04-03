import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Trash2, Save, UtensilsCrossed, Image, Clock, MapPin, Phone, AlertCircle } from 'lucide-react';
import './AddFood.css';

const AddFood = () => {
    const navigate = useNavigate();
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [existingRestaurant, setExistingRestaurant] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [menuItemFiles, setMenuItemFiles] = useState([]);
    const [menuItemPreviews, setMenuItemPreviews] = useState([]);

    const blankItem = { name: '', category: '', price: '', description: '', isVeg: false };
    const [form, setForm] = useState({
        restaurantName: '',
        address: '',
        contactNumber: '',
        image: '',
        openingTime: '',
        closingTime: '',
        cuisineTypes: '',
        menuItems: [{ ...blankItem }]
    });

    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    const contactRegex = /^\d{10}$/;
    const timeRegex = /^(0[1-9]|1[0-2]):[0-5][0-9]\s(AM|PM)$/;
    const toMinutes = (time) => {
        const [clock, period] = time.split(' ');
        let [hours, minutes] = clock.split(':').map(Number);
        if (period === 'AM' && hours === 12) hours = 0;
        if (period === 'PM' && hours !== 12) hours += 12;
        return hours * 60 + minutes;
    };

    const getImageUrl = (imagePath) => {
        if (!imagePath) return '';
        if (imagePath.startsWith('http') || imagePath.startsWith('blob:')) return imagePath;
        return `http://localhost:5000/${imagePath.replace(/\\/g, '/')}`;
    };

    useEffect(() => {
        const fetchMyRestaurant = async () => {
            try {
                const res = await fetch('http://localhost:5000/api/food/my-restaurant', {
                    headers: { 'Authorization': `Bearer ${userInfo.token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    if (data && data._id) {
                        setExistingRestaurant(data);
                        setIsEditing(true);
                        setForm({
                            restaurantName: data.restaurantName || '',
                            address: data.address || '',
                            contactNumber: data.contactNumber || '',
                            image: data.image || '',
                            openingTime: data.openingTime || '',
                            closingTime: data.closingTime || '',
                            cuisineTypes: (data.cuisineTypes || []).join(', '),
                            menuItems: data.menuItems?.length ? data.menuItems : [{ ...blankItem }]
                        });
                        setImagePreview(data.image || '');
                        setMenuItemPreviews((data.menuItems || []).map((item) => item.image || ''));
                        setMenuItemFiles((data.menuItems || []).map(() => null));
                    }
                }
            } catch {}
        };
        fetchMyRestaurant();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === 'contactNumber') {
            const digitsOnly = value.replace(/\D/g, '').slice(0, 10);
            setForm(prev => ({ ...prev, [name]: digitsOnly }));
            return;
        }

        if (name === 'openingTime' || name === 'closingTime') {
            setForm(prev => ({ ...prev, [name]: value.toUpperCase() }));
            return;
        }

        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleItemChange = (index, field, value) => {
        setForm(prev => {
            const items = [...prev.menuItems];
            items[index] = { ...items[index], [field]: field === 'isVeg' ? value : value };
            return { ...prev, menuItems: items };
        });
    };

    const addItem = () => {
        setForm(prev => ({ ...prev, menuItems: [...prev.menuItems, { ...blankItem }] }));
        setMenuItemFiles(prev => [...prev, null]);
        setMenuItemPreviews(prev => [...prev, '']);
    };

    const removeItem = (index) => {
        setForm(prev => ({
            ...prev,
            menuItems: prev.menuItems.filter((_, i) => i !== index)
        }));
        setMenuItemFiles(prev => prev.filter((_, i) => i !== index));
        setMenuItemPreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
    };

    const handleMenuItemFileChange = (index, e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setMenuItemFiles(prev => {
            const updated = [...prev];
            updated[index] = file;
            return updated;
        });

        setMenuItemPreviews(prev => {
            const updated = [...prev];
            updated[index] = URL.createObjectURL(file);
            return updated;
        });
    };

    const uploadImageFile = async (file, fallback = '') => {
        if (!file) return fallback;

        const uploadData = new FormData();
        uploadData.append('image', file);

        const res = await fetch('http://localhost:5000/api/upload', {
            method: 'POST',
            body: uploadData,
        });

        const data = await res.json();
        if (!res.ok) {
            throw new Error(data.message || 'Image upload failed');
        }

        return data.imageUrl;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage('');

        if (!contactRegex.test(form.contactNumber)) {
            setMessage('Contact number must be exactly 10 digits.');
            setSaving(false);
            return;
        }

        if (!timeRegex.test(form.openingTime) || !timeRegex.test(form.closingTime)) {
            setMessage('Opening and closing time must follow hh:mm AM/PM format (e.g. 08:00 AM).');
            setSaving(false);
            return;
        }

        if (toMinutes(form.closingTime) <= toMinutes(form.openingTime)) {
            setMessage('Closing time must be later than opening time.');
            setSaving(false);
            return;
        }

        const payload = {
            ...form,
            cuisineTypes: form.cuisineTypes.split(',').map(s => s.trim()).filter(Boolean)
        };

        try {
            const uploadedImageUrl = await uploadImageFile(imageFile, form.image);
            payload.image = uploadedImageUrl;

            const updatedMenuItems = await Promise.all(
                (payload.menuItems || []).map(async (item, index) => {
                    const menuImage = await uploadImageFile(menuItemFiles[index], item.image || '');
                    return { ...item, image: menuImage };
                })
            );
            payload.menuItems = updatedMenuItems;

            const url = isEditing
                ? `http://localhost:5000/api/food/${existingRestaurant._id}`
                : 'http://localhost:5000/api/food';
            const method = isEditing ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userInfo.token}`
                },
                body: JSON.stringify(payload)
            });

            const data = await res.json();
            if (res.ok) {
                setMessage(isEditing ? 'Restaurant updated successfully!' : 'Restaurant created successfully!');
                setImageFile(null);
                setImagePreview(payload.image || '');
                setMenuItemFiles((payload.menuItems || []).map(() => null));
                setMenuItemPreviews((payload.menuItems || []).map((item) => item.image || ''));
                if (!isEditing) {
                    setExistingRestaurant(data);
                    setIsEditing(true);
                }
            } else {
                setMessage(data.message || 'Failed to save');
            }
        } catch {
            setMessage('Connection error');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!existingRestaurant?._id) return;
        
        setSaving(true);
        setMessage('');

        try {
            const res = await fetch(`http://localhost:5000/api/food/${existingRestaurant._id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${userInfo.token}`
                }
            });

            const data = await res.json();
            if (res.ok) {
                setMessage('Restaurant deleted successfully!');
                setTimeout(() => {
                    navigate('/food');
                }, 1500);
            } else {
                setMessage(data.message || 'Failed to delete restaurant');
            }
        } catch {
            setMessage('Connection error');
        } finally {
            setSaving(false);
            setShowDeleteConfirm(false);
        }
    };

    return (
        <div className="af-page">
            <div className="af-header">
                <div className="af-header-icon"><UtensilsCrossed size={32} /></div>
                <div>
                    <h1>{isEditing ? 'Manage My Restaurant' : 'Register Restaurant'}</h1>
                    <p>{isEditing ? 'Update your restaurant info and menu.' : 'List your restaurant on the platform.'}</p>
                </div>
            </div>

            <form className="af-form" onSubmit={handleSubmit}>
                <motion.div className="af-section" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <h2 className="af-section-title">Restaurant Details</h2>
                    <div className="af-grid-2">
                        <div className="af-field">
                            <label><UtensilsCrossed size={16} /> Restaurant Name *</label>
                            <input name="restaurantName" value={form.restaurantName} onChange={handleChange} placeholder="e.g. Campus Bites" required />
                        </div>
                        <div className="af-field">
                            <label><Phone size={16} /> Contact Number *</label>
                            <input
                                name="contactNumber"
                                value={form.contactNumber}
                                onChange={handleChange}
                                placeholder="0771234567"
                                inputMode="numeric"
                                maxLength={10}
                                pattern="[0-9]{10}"
                                title="Enter exactly 10 digits"
                                required
                            />
                        </div>
                        <div className="af-field af-field-full">
                            <label><MapPin size={16} /> Address *</label>
                            <input name="address" value={form.address} onChange={handleChange} placeholder="Restaurant address" required />
                        </div>
                        <div className="af-field af-field-full">
                            <label><Image size={16} /> Image URL</label>
                            <input name="image" value={form.image} onChange={handleChange} placeholder="https://... (optional)" />
                            <div className="af-image-upload">
                                <label className="af-upload-label">Or upload from device</label>
                                <input type="file" accept="image/*" onChange={handleFileChange} />
                                {(imagePreview || form.image) && (
                                    <img
                                        className="af-image-preview"
                                        src={getImageUrl(imagePreview || form.image)}
                                        alt="Restaurant preview"
                                    />
                                )}
                            </div>
                        </div>
                        <div className="af-field">
                            <label><Clock size={16} /> Opening Time</label>
                            <input
                                name="openingTime"
                                value={form.openingTime}
                                onChange={handleChange}
                                placeholder="08:00 AM"
                                pattern="(0[1-9]|1[0-2]):[0-5][0-9] (AM|PM)"
                                title="Use format hh:mm AM/PM (e.g. 08:00 AM)"
                                required
                            />
                        </div>
                        <div className="af-field">
                            <label><Clock size={16} /> Closing Time</label>
                            <input
                                name="closingTime"
                                value={form.closingTime}
                                onChange={handleChange}
                                placeholder="10:00 PM"
                                pattern="(0[1-9]|1[0-2]):[0-5][0-9] (AM|PM)"
                                title="Use format hh:mm AM/PM (e.g. 10:00 PM)"
                                required
                            />
                        </div>
                        <div className="af-field af-field-full">
                            <label>Cuisine Types (comma-separated)</label>
                            <input name="cuisineTypes" value={form.cuisineTypes} onChange={handleChange} placeholder="e.g. Sri Lankan, Chinese, Fast Food" />
                        </div>
                    </div>
                </motion.div>

                {/* Menu Items */}
                <motion.div className="af-section" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <div className="af-section-header">
                        <h2 className="af-section-title">Menu Items</h2>
                        <button type="button" className="af-add-item-btn" onClick={addItem}>
                            <Plus size={16} /> Add Item
                        </button>
                    </div>

                    <div className="af-menu-list">
                        {form.menuItems.map((item, index) => (
                            <motion.div
                                key={index}
                                className="af-menu-item"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <div className="af-item-number">{index + 1}</div>
                                <div className="af-item-fields">
                                    <div className="af-grid-3">
                                        <div className="af-field">
                                            <label>Item Name *</label>
                                            <input
                                                value={item.name}
                                                onChange={e => handleItemChange(index, 'name', e.target.value)}
                                                placeholder="e.g. Rice & Curry"
                                                required
                                            />
                                        </div>
                                        <div className="af-field">
                                            <label>Category</label>
                                            <input
                                                value={item.category}
                                                onChange={e => handleItemChange(index, 'category', e.target.value)}
                                                placeholder="e.g. Main Course"
                                            />
                                        </div>
                                        <div className="af-field">
                                            <label>Price (Rs.) *</label>
                                            <input
                                                type="number"
                                                value={item.price}
                                                onChange={e => handleItemChange(index, 'price', e.target.value)}
                                                placeholder="250"
                                                required
                                                min="0"
                                            />
                                        </div>
                                    </div>
                                    <div className="af-grid-2">
                                        <div className="af-field">
                                            <label>Description (optional)</label>
                                            <input
                                                value={item.description}
                                                onChange={e => handleItemChange(index, 'description', e.target.value)}
                                                placeholder="Short description..."
                                            />
                                        </div>
                                        <div className="af-field">
                                            <label>Image URL (optional)</label>
                                            <input
                                                value={item.image || ''}
                                                onChange={e => handleItemChange(index, 'image', e.target.value)}
                                                placeholder="https://..."
                                            />
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => handleMenuItemFileChange(index, e)}
                                            />
                                            {(menuItemPreviews[index] || item.image) && (
                                                <img
                                                    className="af-image-preview"
                                                    src={getImageUrl(menuItemPreviews[index] || item.image)}
                                                    alt={`Menu item ${index + 1}`}
                                                />
                                            )}
                                        </div>
                                    </div>
                                    <label className="af-veg-toggle">
                                        <input
                                            type="checkbox"
                                            checked={item.isVeg}
                                            onChange={e => handleItemChange(index, 'isVeg', e.target.checked)}
                                        />
                                        <span>Vegetarian item</span>
                                    </label>
                                </div>
                                {form.menuItems.length > 1 && (
                                    <button type="button" className="af-remove-item" onClick={() => removeItem(index)}>
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {message && (
                    <div className={`af-message ${message.includes('success') ? 'success' : 'error'}`}>
                        {message}
                    </div>
                )}

                <div className="af-form-actions">
                    <button type="button" className="af-cancel-btn" onClick={() => navigate('/food')}>
                        Cancel
                    </button>
                    <div className="af-action-buttons">
                        {isEditing && (
                            <button 
                                type="button" 
                                className="af-delete-btn" 
                                onClick={() => setShowDeleteConfirm(true)}
                                disabled={saving}
                            >
                                <Trash2 size={18} />
                                Delete Restaurant
                            </button>
                        )}
                        <button type="submit" className="af-save-btn" disabled={saving}>
                            <Save size={18} />
                            {saving ? 'Saving...' : isEditing ? 'Update Restaurant' : 'Create Restaurant'}
                        </button>
                    </div>
                </div>

                {showDeleteConfirm && (
                    <motion.div className="af-delete-confirm-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <motion.div className="af-delete-confirm-modal" initial={{ scale: 0.9 }} animate={{ scale: 1 }}>
                            <div className="af-confirm-header">
                                <AlertCircle size={32} className="af-confirm-icon" />
                                <h2>Delete Restaurant</h2>
                            </div>
                            <p className="af-confirm-message">
                                Are you sure you want to delete your restaurant? This action cannot be undone and all menu items will be deleted.
                            </p>
                            <div className="af-confirm-buttons">
                                <button 
                                    type="button" 
                                    className="af-confirm-cancel" 
                                    onClick={() => setShowDeleteConfirm(false)}
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="button" 
                                    className="af-confirm-delete" 
                                    onClick={handleDelete}
                                    disabled={saving}
                                >
                                    {saving ? 'Deleting...' : 'Delete'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </form>
        </div>
    );
};

export default AddFood;
