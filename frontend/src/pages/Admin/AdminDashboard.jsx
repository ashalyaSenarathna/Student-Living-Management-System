import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUsers = async () => {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));

            if (!userInfo || userInfo.role?.toUpperCase() !== 'ADMIN') {
                navigate('/login');
                return;
            }

            try {
                const response = await fetch('http://localhost:5000/api/users', {
                    headers: {
                        'Authorization': `Bearer ${userInfo.token}`,
                    },
                });

                const data = await response.json();

                if (response.ok) {
                    setUsers(data);
                } else {
                    setError(data.message || 'Failed to fetch users');
                    if (response.status === 401 || response.status === 403) {
                        navigate('/login');
                    }
                }
            } catch (err) {
                setError('Something went wrong. Please try again.');
                console.error('Fetch users error:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, [navigate]);

    const handleApprove = async (userId, isApproved) => {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        try {
            const response = await fetch(`http://localhost:5000/api/users/${userId}/approve`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userInfo.token}`,
                },
                body: JSON.stringify({ isApproved }),
            });

            if (response.ok) {
                // Update local state
                setUsers(users.map(u => u._id === userId ? { ...u, isApproved } : u));
            } else {
                const data = await response.json();
                alert(data.message || 'Operation failed');
            }
        } catch (err) {
            alert('Error updating status');
        }
    };

    if (loading) return <div className="admin-loading">Loading Management Data...</div>;

    return (
        <div className="admin-dashboard">
            <div className="admin-header">
                <h1>Admin Dashboard</h1>
                <p>Manage registered students and system users.</p>
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="admin-stats-overview">
                <div className="stat-card">
                    <span className="stat-label">Total Users</span>
                    <span className="stat-value">{users.length}</span>
                </div>
                <div className="stat-card">
                    <span className="stat-label">Active Admin</span>
                    <span className="stat-value">{users.filter(u => u.role === 'ADMIN').length}</span>
                </div>
                <div className="stat-card">
                    <span className="stat-label">Students</span>
                    <span className="stat-value">{users.filter(u => u.role === 'USER').length}</span>
                </div>
                <div className="stat-card">
                    <span className="stat-label">Laundry Providers</span>
                    <span className="stat-value">{users.filter(u => u.role === 'PROVIDER').length}</span>
                </div>
            </div>

            <div className="admin-content">
                <div className="users-table-container">
                    <table className="users-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Username</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user._id}>
                                    <td>
                                        <div className="user-cell">
                                            <div className="user-avatar-small">
                                                {user.name.charAt(0).toUpperCase()}
                                            </div>
                                            {user.name}
                                        </div>
                                    </td>
                                    <td>{user.username}</td>
                                    <td>{user.email}</td>
                                    <td>
                                        <span className={`role-badge ${user.role.toLowerCase()}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td>
                                        {user.role === 'PROVIDER' ? (
                                            <span className={`status-badge ${user.isApproved ? 'approved' : 'pending'}`}>
                                                {user.isApproved ? '✅ Approved' : '⏳ Pending'}
                                            </span>
                                        ) : (
                                            <span className="status-badge approved">Active</span>
                                        )}
                                    </td>
                                    <td>
                                        {user.role === 'PROVIDER' && (
                                            <button
                                                className={`action-btn ${user.isApproved ? 'btn-reject' : 'btn-approve'}`}
                                                onClick={() => handleApprove(user._id, !user.isApproved)}
                                            >
                                                {user.isApproved ? 'Deactivate' : 'Approve'}
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
