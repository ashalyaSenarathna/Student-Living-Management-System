import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, User, Mail, Shield, BadgeCheck, PencilLine } from 'lucide-react';
import './Profile.css';

const Profile = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        username: '',
        profilePic: ''
    });
    const [message, setMessage] = useState('');

    const navigate = useNavigate();

    useEffect(() => {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        if (!userInfo) {
            navigate('/login');
            return;
        }

        // In a real app, we'd fetch the latest data from API
        // For now, we use localStorage as start
        setUser(userInfo);
        setFormData({
            name: userInfo.name,
            email: userInfo.email,
            username: userInfo.username,
            profilePic: userInfo.profilePic || ''
        });
        setLoading(false);
    }, [navigate]);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, profilePic: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setMessage('Updating profile...');

        // Simulating an update
        setTimeout(() => {
            const updatedUser = { ...user, ...formData };
            localStorage.setItem('userInfo', JSON.stringify(updatedUser));
            setUser(updatedUser);
            setIsEditing(false);
            setMessage('Profile updated successfully!');
            setTimeout(() => setMessage(''), 3000);
        }, 1000);
    };

    if (loading) return <div className="profile-loading">Loading...</div>;

    return (
        <div className="profile-page">
            <div className="profile-bg-blobs">
                <div className="blob blob-1"></div>
                <div className="blob blob-2"></div>
            </div>

            <div className="profile-container">
                <div className="profile-card">
                    <div className="profile-header">
                        <div className="avatar-wrapper">
                            <div className="profile-avatar-luxe">
                                {formData.profilePic ? (
                                    <img src={formData.profilePic} alt="Profile" className="avatar-img" />
                                ) : (
                                    <span className="avatar-letter">{user.name.charAt(0).toUpperCase()}</span>
                                )}
                                {isEditing && (
                                    <label className="avatar-edit-overlay">
                                        <Camera size={20} />
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            hidden
                                        />
                                    </label>
                                )}
                            </div>
                        </div>
                        <div className="header-text-block">
                            <h2>{user.name}</h2>
                            <div className="badge-pills">
                                <span className="role-chip"><Shield size={12} /> {user.role}</span>
                                {user.role === 'PROVIDER' && user.isApproved && (
                                    <span className="verified-chip"><BadgeCheck size={12} /> Verified</span>
                                )}
                            </div>
                        </div>
                    </div>

                    {message && <div className="status-message">{message}</div>}

                    <div className="profile-content">
                        {isEditing ? (
                            <form onSubmit={handleUpdate} className="edit-form">
                                <div className="input-group">
                                    <label>Full Name</label>
                                    <input type="text" name="name" value={formData.name} onChange={handleInputChange} required />
                                </div>
                                <div className="input-group">
                                    <label>Username</label>
                                    <input type="text" name="username" value={formData.username} onChange={handleInputChange} required />
                                </div>
                                <div className="input-group">
                                    <label>Email Address</label>
                                    <input type="email" name="email" value={formData.email} onChange={handleInputChange} required />
                                </div>
                                <div className="form-actions">
                                    <button type="submit" className="save-btn">Save Changes</button>
                                    <button type="button" className="cancel-btn" onClick={() => setIsEditing(false)}>Cancel</button>
                                </div>
                            </form>
                        ) : (
                            <div className="view-mode">
                                <div className="info-item">
                                    <span className="label">Username</span>
                                    <span className="value">{user.username}</span>
                                </div>
                                <div className="info-item">
                                    <span className="label">Email</span>
                                    <span className="value">{user.email}</span>
                                </div>
                                <div className="info-item">
                                    <span className="label">Account Type</span>
                                    <span className="value">{user.role}</span>
                                </div>
                                {user.role === 'PROVIDER' && (
                                    <div className="info-item">
                                        <span className="label">Account Status</span>
                                        <span className={`value status-${user.isApproved ? 'active' : 'pending'}`}>
                                            {user.isApproved ? 'Approved' : 'Pending Approval'}
                                        </span>
                                    </div>
                                )}
                                <button className="edit-btn" onClick={() => setIsEditing(true)}>Edit Profile</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
