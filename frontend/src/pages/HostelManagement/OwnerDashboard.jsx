import React, { useState, useEffect } from 'react';
import './OwnerDashboard.css';

const OwnerDashboard = () => {
    const [hostels, setHostels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('overview');
    const [form, setForm] = useState({
        name: '',
        location: '',
        description: '',
        price: '',
        contact: '',
        gender: 'mixed',
        facilities: {
            wifi: false,
            meals: false,
            water: false,
            electricity: false,
            parking: false
        },
        rooms: [{ roomNo: '', totalBeds: '', availableBeds: '' }],
        images: [null, null, null]
    });
    const [previews, setPreviews] = useState([null, null, null]);
    const [isEditing, setIsEditing] = useState(false);
    const [editHostelId, setEditHostelId] = useState(null);

    const token = (() => {
        try {
            const stored = localStorage.getItem('userInfo');
            return stored ? JSON.parse(stored).token : null;
        } catch { return null; }
    })();

    const [successMsg, setSuccessMsg] = useState('');

    useEffect(() => {
        if (!token) {
            setLoading(false);
            return;
        }
        const fetchMy = async () => {
            try {
                const res = await fetch('http://localhost:5000/api/hostel/mine', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await res.json();
                if (res.ok) setHostels(data);
                else setError(data.message || 'Unable to fetch hostels');
            } catch (err) { setError('Server unreachable'); } finally { setLoading(false); }
        };

        fetchMy();
    }, [token]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        let newValue = value;

        if (name === 'location' || name === 'name') {
            newValue = value.replace(/[^a-zA-Z\s]/g, '');
        } else if (name === 'contact') {
            newValue = value.replace(/\D/g, '').slice(0, 10);
        }

        setForm({ ...form, [name]: newValue });
    };

    const handleContactBlur = () => {
        if (form.contact.length > 0 && form.contact.length < 10) {
            setError('Contact number must be exactly 10 digits.');
        } else if (form.contact.length === 10 || form.contact.length === 0) {
            if (error === 'Contact number must be exactly 10 digits.') {
                setError('');
            }
        }
    };

    const handleFacilityChange = (e) => {
        const { name, checked } = e.target;
        setForm(prev => ({
            ...prev,
            facilities: { ...prev.facilities, [name]: checked }
        }));
    };

    const handleRoomChange = (index, field, value) => {
        const newRooms = [...form.rooms];
        newRooms[index][field] = value;
        setForm({ ...form, rooms: newRooms });
    };

    const addRoom = () => {
        setForm({
            ...form,
            rooms: [...form.rooms, { roomNo: '', totalBeds: '', availableBeds: '' }]
        });
    };

    const removeRoom = (index) => {
        if (form.rooms.length > 1) {
            const newRooms = form.rooms.filter((_, i) => i !== index);
            setForm({ ...form, rooms: newRooms });
        }
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        const newImages = [...form.images];
        const newPreviews = [...previews];

        files.forEach(file => {
            // Find the first slot that doesn't have a file AND doesn't have an existing preview
            const firstEmpty = newPreviews.findIndex(p => p === null);
            if (firstEmpty !== -1) {
                newImages[firstEmpty] = file;
                newPreviews[firstEmpty] = URL.createObjectURL(file);
            }
        });

        setForm({ ...form, images: newImages });
        setPreviews(newPreviews);
    };

    const removeImage = (index) => {
        const newImages = [...form.images];
        const newPreviews = [...previews];

        if (newPreviews[index]) URL.revokeObjectURL(newPreviews[index]);
        newImages[index] = null;
        newPreviews[index] = null;

        setForm({ ...form, images: newImages });
        setPreviews(newPreviews);
    };

    const fileToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);
        });
    };

    const handleEdit = (hostel) => {
        setIsEditing(true);
        setEditHostelId(hostel._id || hostel.id);
        setForm({
            name: hostel.name || '',
            location: hostel.location || '',
            description: hostel.description || '',
            price: hostel.price || '',
            contact: hostel.contact || '',
            gender: hostel.gender || 'mixed',
            facilities: hostel.facilities || {
                wifi: false,
                meals: false,
                water: false,
                electricity: false,
                parking: false
            },
            rooms: hostel.rooms && hostel.rooms.length > 0 ? hostel.rooms : [{ roomNo: '', totalBeds: '', availableBeds: '' }],
            images: [null, null, null] // Reuse existing images logic or handle differently if needed
        });
        
        // Show existing images in previews if available
        if (hostel.images && Array.isArray(hostel.images)) {
            const newPreviews = [null, null, null];
            hostel.images.forEach((img, idx) => {
                if (idx < 3) newPreviews[idx] = img;
            });
            setPreviews(newPreviews);
        } else {
            setPreviews([null, null, null]);
        }
        
        setActiveTab('add');
    };

    const cancelEdit = () => {
        setIsEditing(false);
        setEditHostelId(null);
        setForm({
            name: '', location: '', description: '', price: '', contact: '',
            gender: 'mixed',
            facilities: { wifi: false, meals: false, water: false, electricity: false, parking: false },
            rooms: [{ roomNo: '', totalBeds: '', availableBeds: '' }],
            images: [null, null, null]
        });
        setPreviews([null, null, null]);
        setActiveTab('list');
    };

    const validateForm = () => {
        if (!form.name || !form.location || !form.price || !form.contact) {
            setError('Please fill in Name, Location, Price, and Contact Number.');
            return false;
        }
        if (form.contact.length !== 10) {
            setError('Contact number must be exactly 10 digits.');
            return false;
        }
        
        // Check if there's at least one image (either a new File in form.images OR an existing URL/base64 in previews)
        const hasNewImage = form.images.some(img => img !== null);
        const hasExistingImage = previews.some(p => p !== null && (typeof p === 'string'));
        
        if (!hasNewImage && !hasExistingImage) {
            setError('Please upload at least one image.');
            return false;
        }

        for (const room of form.rooms) {
            if (!room.roomNo || !room.totalBeds || !room.availableBeds) {
                setError('Please fill in all room details.');
                return false;
            }
            if (parseInt(room.availableBeds) > parseInt(room.totalBeds)) {
                setError(`Room ${room.roomNo}: Available beds cannot exceed total beds.`);
                return false;
            }
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');
        if (!token) {
            setError('You must be logged in to add a hostel.');
            return;
        }
        if (!validateForm()) return;

        try {
            let imagesToUpload = [];
            
            // Handle images: if they are files (new), convert to base64. If strings (existing), keep as is.
            const imagePromises = form.images.map(async (img, idx) => {
                if (img instanceof File) {
                    return await fileToBase64(img);
                } else if (previews[idx] && typeof previews[idx] === 'string' && previews[idx].startsWith('http')) {
                    return previews[idx]; // Keep existing URL
                } else if (previews[idx] && typeof previews[idx] === 'string' && previews[idx].startsWith('data:image')) {
                    return previews[idx]; // Keep already converted base64 if any
                }
                return null;
            });

            const processedImages = (await Promise.all(imagePromises)).filter(img => img !== null);

            const url = isEditing 
                ? `http://localhost:5000/api/hostel/${editHostelId}`
                : 'http://localhost:5000/api/hostel';
            
            const method = isEditing ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: form.name,
                    location: form.location,
                    description: form.description,
                    price: form.price,
                    contact: form.contact,
                    gender: form.gender,
                    facilities: form.facilities,
                    rooms: form.rooms,
                    images: processedImages
                })
            });
            const data = await res.json();
            if (res.ok) {
                if (isEditing) {
                    setHostels(prev => prev.map(h => (h._id === editHostelId || h.id === editHostelId) ? data : h));
                    setSuccessMsg('Hostel updated successfully!');
                } else {
                    setHostels(prev => [data, ...prev]);
                    setSuccessMsg('Hostel submitted successfully! It will appear after admin approval.');
                }
                
                // Reset form
                setForm({
                    name: '', location: '', description: '', price: '', contact: '',
                    gender: 'mixed',
                    facilities: { wifi: false, meals: false, water: false, electricity: false, parking: false },
                    rooms: [{ roomNo: '', totalBeds: '', availableBeds: '' }],
                    images: [null, null, null]
                });
                setPreviews([null, null, null]);
                setIsEditing(false);
                setEditHostelId(null);
                
                setTimeout(() => { setActiveTab('list'); setSuccessMsg(''); }, 2000);
            } else {
                setError(data.message || `Failed to ${isEditing ? 'update' : 'add'} hostel.`);
            }
        } catch (err) {
            setError('Could not connect to server. Make sure the backend is running.');
        }
    };

    return (
        <div className="owner-dashboard-container">
            <aside className="od-sidebar">
                <div className="sidebar-header">
                    <h3>Owner Portal</h3>
                </div>
                <nav className="od-nav">
                    <button
                        className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
                        onClick={() => setActiveTab('overview')}
                    >
                        <span className="icon">📊</span> Overview
                    </button>
                    <button
                        className={`nav-item ${activeTab === 'list' ? 'active' : ''}`}
                        onClick={() => setActiveTab('list')}
                    >
                        <span className="icon">🏠</span> My Listings
                    </button>
                    <button
                        className={`nav-item ${activeTab === 'add' ? 'active' : ''}`}
                        onClick={() => {
                            setActiveTab('add');
                            if (isEditing) cancelEdit();
                        }}
                    >
                        <span className="icon">➕</span> {isEditing ? 'Editing...' : 'Add New'}
                    </button>
                </nav>
            </aside>

            <main className="od-main-content">
                <header className="owner-header">
                    <h2>Hostel Owner Dashboard</h2>
                    <p>Manage your boarding entries and hostels from here.</p>
                </header>

                <div className="od-tab-content">
                    {activeTab === 'overview' && (
                        <div className="overview-section">
                            <div className="stats-grid">
                                <div className="stat-card">
                                    <h4>Total Listings</h4>
                                    <p className="stat-number">{hostels.length}</p>
                                </div>
                                <div className="stat-card">
                                    <h4>Active Bookings</h4>
                                    <p className="stat-number">0</p>
                                </div>
                                <div className="stat-card">
                                    <h4>Views (30d)</h4>
                                    <p className="stat-number">24</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'add' && (
                        <div className="owner-form-card">
                            <div className="form-header-flex">
                                <h3>{isEditing ? 'Edit Hostel / Boarding' : 'Add New Hostel / Boarding'}</h3>
                                {isEditing && <button className="btn-cancel-edit" onClick={cancelEdit}>Cancel Edit</button>}
                            </div>
                            {error && <div className="form-error-banner">⚠️ {error}</div>}
                            {successMsg && <div className="form-success-banner">✅ {successMsg}</div>}
                            <form onSubmit={handleSubmit} className="hostel-form-complex">
                                <section className="form-section">
                                    <h4>Basic Information</h4>
                                    <div className="form-group">
                                        <label>Hostel Name / Title *</label>
                                        <input name="name" value={form.name} onChange={handleChange} required placeholder="e.g. Sunshine Boys Hostel" />
                                    </div>
                                    <div className="form-row-3">
                                        <div className="form-group">
                                            <label>Monthly Price (Rs.) *</label>
                                            <input name="price" type="number" value={form.price} onChange={handleChange} required placeholder="5000" />
                                        </div>
                                        <div className="form-group">
                                            <label>Location / Area *</label>
                                            <input name="location" value={form.location} onChange={handleChange} required placeholder="e.g. Malabe" />
                                        </div>
                                        <div className="form-group">
                                            <label>Contact Number *</label>
                                            <input name="contact" value={form.contact} onChange={handleChange} onBlur={handleContactBlur} required placeholder="0712345678" />
                                        </div>
                                    </div>
                                </section>

                                <section className="form-section">
                                    <h4>Preferences & Facilities</h4>
                                    <div className="form-group">
                                        <label>Gender Allowed</label>
                                        <div className="radio-group">
                                            <label><input type="radio" name="gender" value="boys" checked={form.gender === 'boys'} onChange={handleChange} /> Boys</label>
                                            <label><input type="radio" name="gender" value="girls" checked={form.gender === 'girls'} onChange={handleChange} /> Girls</label>
                                            <label><input type="radio" name="gender" value="mixed" checked={form.gender === 'mixed'} onChange={handleChange} /> Mixed</label>
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>Facilities Offered</label>
                                        <div className="checkbox-grid">
                                            {Object.keys(form.facilities).map(f => (
                                                <label key={f} className="checkbox-item">
                                                    <input type="checkbox" name={f} checked={form.facilities[f]} onChange={handleFacilityChange} />
                                                    {f.charAt(0).toUpperCase() + f.slice(1)}
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </section>

                                <section className="form-section">
                                    <h4>Rooms Management</h4>
                                    <div className="rooms-list">
                                        {form.rooms.map((room, index) => (
                                            <div key={index} className="room-entry-row">
                                                <div className="form-group">
                                                    <label>Room No</label>
                                                    <input value={room.roomNo} onChange={(e) => handleRoomChange(index, 'roomNo', e.target.value)} placeholder="A-01" />
                                                </div>
                                                <div className="form-group">
                                                    <label>Total Beds</label>
                                                    <input type="number" value={room.totalBeds} onChange={(e) => handleRoomChange(index, 'totalBeds', e.target.value)} placeholder="4" />
                                                </div>
                                                <div className="form-group">
                                                    <label>Available Beds</label>
                                                    <input type="number" value={room.availableBeds} onChange={(e) => handleRoomChange(index, 'availableBeds', e.target.value)} placeholder="2" />
                                                </div>
                                                {form.rooms.length > 1 && (
                                                    <button type="button" className="btn-remove-room" onClick={() => removeRoom(index)}>×</button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    <button type="button" className="btn-add-room" onClick={addRoom}>+ Add Another Room</button>
                                </section>

                                <section className="form-section">
                                    <h4>Photos & Description</h4>
                                    <div className="form-group">
                                        <label>Hostel Photos (Up to 3) *</label>
                                        <div className="image-upload-wrapper">
                                            <label className="upload-dropzone">
                                                <input
                                                    type="file"
                                                    multiple
                                                    accept="image/*"
                                                    onChange={handleFileChange}
                                                    disabled={form.images.filter(img => img !== null).length >= 3}
                                                    hidden
                                                />
                                                <div className="upload-hint">
                                                    <span className="upload-icon">📸</span>
                                                    <span>Click to upload photos</span>
                                                </div>
                                            </label>
                                            <div className="image-previews-grid">
                                                {previews.map((src, idx) => src && (
                                                    <div key={idx} className="preview-item">
                                                        <img src={src} alt={`preview-${idx}`} />
                                                        <button type="button" className="btn-remove-img" onClick={() => removeImage(idx)}>×</button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>Description & Rules</label>
                                        <textarea name="description" value={form.description} onChange={handleChange} placeholder="Describe your hostel, rules, entry times, etc." />
                                    </div>
                                </section>

                                <div className="form-footer-actions">
                                    <p className="approval-notice">Listing will be visible after <strong>Admin Approval</strong>.</p>
                                    <button type="submit" className="btn-submit-hostel">
                                        {isEditing ? 'Update Hostel' : 'Submit for Approval'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {activeTab === 'list' && (
                        <div className="owner-list">
                            <h3>Your Hostels</h3>
                            {!token && <div className="form-error-banner">⚠️ Please <a href="/login">login</a> to view your listings.</div>}
                            {loading ? <div className="loader"></div> : (
                                hostels.length > 0 ? (
                                    <div className="hostel-grid-owner">
                                        {hostels.map(h => (
                                            <div className="hostel-item-card" key={h._id || h.id}>
                                                <div className="card-badge-status" data-status={h.status || 'pending'}>
                                                    {h.status || 'Pending'}
                                                </div>
                                                <img src={h.images?.[0] || h.image || 'https://images.unsplash.com/photo-1493666438817-866a91353ca9?auto=format&fit=crop&w=400&q=60'} alt={h.name} />
                                                <div className="hostel-meta">
                                                    <h4>{h.name}</h4>
                                                    <p className="loc">📍 {h.location}</p>
                                                    <p className="price">Rs. {h.price || '—'}</p>
                                                    <div className="card-actions">
                                                        <button className="btn-edit-sm" onClick={() => handleEdit(h)}>Edit</button>
                                                        <button className="btn-delete-sm">Delete</button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : <div className="no-hostels">No hostels yet. Click 'Add New' to begin.</div>
                            )}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default OwnerDashboard;
