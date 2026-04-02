import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users,
    UserCheck,
    Briefcase,
    ShieldAlert,
    Search,
    LogOut,
    Menu,
    X,
    Home,
    Star,
    Flag,
    CheckCircle2,
    Clock,
    Trash2
} from 'lucide-react';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('ALL');
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
                setUsers(users.map(u => u._id === userId ? { ...u, isApproved } : u));
            } else {
                const data = await response.json();
                alert(data.message || 'Operation failed');
            }
        } catch (err) {
            alert('Error updating status');
        }
    };

    const handleDelete = async (userId) => {
        if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            return;
        }

        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        try {
            const response = await fetch(`http://localhost:5000/api/users/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${userInfo.token}`,
                },
            });

            if (response.ok) {
                setUsers(users.filter(u => u._id !== userId));
            } else {
                const data = await response.json();
                alert(data.message || 'Delete failed');
            }
        } catch (err) {
            alert('Error deleting user');
        }
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch =
            user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.username.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesFilter = activeFilter === 'ALL' || user.role.toUpperCase() === activeFilter;

        return matchesSearch && matchesFilter;
    });

    if (loading) return (
        <div className="admin-loading">
            <div className="loader"></div>
            <p>Initializing Secure Admin Panel...</p>
        </div>
    );

    return (
        <div className="admin-dashboard">
            {/* Sidebar */}
            <aside className="admin-sidebar">
                <div className="sidebar-logo">
                    <div className="logo-icon">
                        <ShieldAlert size={24} color="#fff" />
                    </div>
                    <h2>AdminPortal</h2>
                </div>

                <nav className="sidebar-nav">
                    <button className="nav-item active">
                        <Users size={20} />
                        <span>User Management</span>
                    </button>
                    <button
                        className="nav-item"
                        onClick={() => navigate('/hostel-admin')}
                    >
                        <Home size={20} />
                        <span>Hostel Admin</span>
                    </button>
                    <button
                        className="nav-item"
                        onClick={() => navigate('/food-admin')}
                    >
                        <Star size={20} />
                        <span>Food Admin</span>
                    </button>
                </nav>

                <div className="sidebar-footer">
                    <button className="nav-item" onClick={() => {
                        localStorage.removeItem('userInfo');
                        navigate('/login');
                    }}>
                        <LogOut size={20} />
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="admin-main">
                <header className="admin-header">
                    <div className="header-title">
                        <h1>Admin Dashboard</h1>
                        <p>Welcome back! Here's what's happening in your system.</p>
                    </div>
                </header>

                {error && <div className="error-message">{error}</div>}

                {/* Stats Grid */}
                <div className="admin-stats-overview">
                    <motion.div
                        className="stat-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <div className="stat-icon" style={{ background: 'rgba(99, 102, 241, 0.1)', color: '#6366f1' }}>
                            <Users size={24} />
                        </div>
                        <div className="stat-info">
                            <span className="stat-label">Total Users</span>
                            <span className="stat-value">{users.length}</span>
                        </div>
                    </motion.div>

                    <motion.div
                        className="stat-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                            <UserCheck size={24} />
                        </div>
                        <div className="stat-info">
                            <span className="stat-label">Active Students</span>
                            <span className="stat-value">{users.filter(u => u.role === 'USER').length}</span>
                        </div>
                    </motion.div>

                    <motion.div
                        className="stat-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <div className="stat-icon" style={{ background: 'rgba(168, 85, 247, 0.1)', color: '#a855f7' }}>
                            <Briefcase size={24} />
                        </div>
                        <div className="stat-info">
                            <span className="stat-label">Laundry Providers</span>
                            <span className="stat-value">{users.filter(u => u.role === 'PROVIDER').length}</span>
                        </div>
                    </motion.div>

                    <motion.div
                        className="stat-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.35 }}
                    >
                        <div className="stat-icon" style={{ background: 'rgba(236, 72, 153, 0.1)', color: '#ec4899' }}>
                            <Home size={24} />
                        </div>
                        <div className="stat-info">
                            <span className="stat-label">Hostel Providers</span>
                            <span className="stat-value">{users.filter(u => u.role === 'HOSTEL_OWNER').length}</span>
                        </div>
                    </motion.div>

                    <motion.div
                        className="stat-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
                            <ShieldAlert size={24} />
                        </div>
                        <div className="stat-info">
                            <span className="stat-label">Admins</span>
                            <span className="stat-value">{users.filter(u => u.role === 'ADMIN').length}</span>
                        </div>
                    </motion.div>
                </div>

                {/* Table Section */}
                <div className="admin-content">
                    <div className="content-toolbar">
                        <div className="search-bar">
                            <Search size={18} />
                            <input
                                type="text"
                                placeholder="Search by name, email or username..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <div className="table-filters">
                            {['ALL', 'USER', 'PROVIDER', 'HOSTEL_OWNER', 'ADMIN'].map(filter => (
                                <button
                                    key={filter}
                                    className={`filter-btn ${activeFilter === filter ? 'active' : ''}`}
                                    onClick={() => setActiveFilter(filter)}
                                >
                                    {filter === 'ALL' ? 'All Roles' :
                                        filter === 'PROVIDER' ? 'Laundry Providers' :
                                            filter === 'HOSTEL_OWNER' ? 'Hostel Providers' :
                                                filter.charAt(0) + filter.slice(1).toLowerCase() + 's'}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="users-table-container">
                        <table className="users-table">
                            <thead>
                                <tr>
                                    <th>User</th>
                                    <th>Username</th>
                                    <th>Email</th>
                                    <th>Role</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <AnimatePresence>
                                    {filteredUsers.map((user, index) => (
                                        <motion.tr
                                            key={user._id}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            transition={{ delay: index * 0.05 }}
                                        >
                                            <td>
                                                <div className="user-cell">
                                                    <div className="user-avatar-small">
                                                        {user.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                        <span style={{ fontWeight: 600 }}>{user.name}</span>
                                                        <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>UUID: {user._id.slice(-6)}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>{user.username}</td>
                                            <td>{user.email}</td>
                                            <td>
                                                <span className={`role-badge ${user.role.toLowerCase()}`}>
                                                    {user.role === 'PROVIDER' ? 'Laundry Provider' :
                                                        user.role === 'HOSTEL_OWNER' ? 'Hostel Provider' :
                                                            user.role}
                                                </span>
                                            </td>
                                            <td>
                                                {(user.role === 'PROVIDER' || user.role === 'HOSTEL_OWNER') ? (
                                                    <div className="admin-status-badge">
                                                        <span className={`admin-status-dot ${user.isApproved ? 'approved' : 'pending'}`}></span>
                                                        {user.isApproved ? 'Approved' : 'Pending'}
                                                    </div>
                                                ) : (
                                                    <div className="admin-status-badge">
                                                        <span className="admin-status-dot approved"></span>
                                                        Active
                                                    </div>
                                                )}
                                            </td>
                                            <td className="actions-cell">
                                                <div className="actions-stack">
                                                    {(user.role === 'PROVIDER' || user.role === 'HOSTEL_OWNER') && (
                                                        <button
                                                            className={`action-btn ${user.isApproved ? 'btn-reject' : 'btn-approve'}`}
                                                            onClick={() => handleApprove(user._id, !user.isApproved)}
                                                        >
                                                            {user.isApproved ? 'Reject' : 'Approve'}
                                                        </button>
                                                    )}
                                                    <button
                                                        className="action-btn btn-delete"
                                                        onClick={() => handleDelete(user._id)}
                                                        title="Delete User"
                                                    >
                                                        <Trash2 size={16} />
                                                        <span>Delete User</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                                {filteredUsers.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="users-empty-cell">
                                            <div className="users-empty-wrap">
                                                <Search size={48} opacity={0.2} />
                                                <p>No users found matching your criteria</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
