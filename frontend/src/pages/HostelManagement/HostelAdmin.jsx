import React, { useEffect, useState } from 'react';
import './HostelAdmin.css';

const TABS = [
    { id: 'pending', label: '⏳ Pending Listings' },
    { id: 'all', label: '📂 Manage All' },
    { id: 'reviews', label: '⭐ Reviews Moderation' },
    { id: 'reported', label: '🚩 Reported Listings' },
    { id: 'featured', label: '📌 Featured Listings' },
];

const BASE = 'http://localhost:5000/api';

const StarRating = ({ rating = 0 }) => (
    <span className="ha-stars">
        {[1, 2, 3, 4, 5].map(i => <span key={i} className={i <= Math.round(rating) ? 'ha-star filled' : 'ha-star'}>★</span>)}
        <span className="ha-rating-num">{Number(rating).toFixed(1)}</span>
    </span>
);

const HostelAdmin = () => {
    const [activeTab, setActiveTab] = useState('pending');
    const [pending, setPending] = useState([]);
    const [allHostels, setAllHostels] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [reported, setReported] = useState([]);
    const [featured, setFeatured] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const token = (() => {
        try { const s = localStorage.getItem('userInfo'); return s ? JSON.parse(s).token : null; } catch { return null; }
    })();
    const auth = token ? { Authorization: `Bearer ${token}` } : {};

    const flash = (msg, isErr = false) => {
        if (isErr) setError(msg); else setSuccess(msg);
        setTimeout(() => { setError(''); setSuccess(''); }, 3500);
    };

    const req = async (url, method = 'GET', body = null) => {
        const opts = { method, headers: { ...auth, ...(body ? { 'Content-Type': 'application/json' } : {}) } };
        if (body) opts.body = JSON.stringify(body);
        try {
            const res = await fetch(url, opts);
            const data = await res.json();
            return { ok: res.ok, data };
        } catch { return { ok: false, data: { message: 'Network error' } }; }
    };

    useEffect(() => {
        const fetchAll = async () => {
            setLoading(true);
            const [pRes, aRes] = await Promise.all([
                req(`${BASE}/hostel/admin/pending`),
                req(`${BASE}/hostel/admin/all`),
            ]);
            if (pRes.ok) setPending(pRes.data); else flash(pRes.data.message || 'Failed to load pending', true);
            if (aRes.ok) {
                const all = aRes.data;
                setAllHostels(all);
                setReported(all.filter(h => h.reported));
                setFeatured(all.filter(h => h.isFeatured));
            }
            setLoading(false);
        };
        fetchAll();
    }, []);

    /* ---- Pending actions ---- */
    const approveHostel = async (id) => {
        const { ok, data } = await req(`${BASE}/hostel/${id}/approve`, 'PUT');
        if (ok) { setPending(p => p.filter(x => x._id !== id)); flash('Listing approved!'); }
        else flash(data.message || 'Failed', true);
    };
    const rejectHostel = async (id) => {
        const { ok, data } = await req(`${BASE}/hostel/${id}/reject`, 'PUT');
        if (ok) { setPending(p => p.filter(x => x._id !== id)); flash('Listing rejected.'); }
        else flash(data.message || 'Failed', true);
    };

    /* ---- Reviews actions ---- */
    const deleteReview = async (id) => {
        const { ok, data } = await req(`${BASE}/reviews/${id}`, 'DELETE');
        if (ok) { setReviews(r => r.filter(x => x._id !== id)); flash('Review removed.'); }
        else flash(data.message || 'Failed', true);
    };

    /* ---- Reported / General actions ---- */
    const removeListing = async (id) => {
        if (!window.confirm('Are you sure you want to permanently delete this listing?')) return;
        
        const { ok, data } = await req(`${BASE}/hostel/${id}`, 'DELETE');
        if (ok) { 
            setReported(r => r.filter(x => x._id !== id)); 
            setAllHostels(a => a.filter(x => x._id !== id)); 
            setPending(p => p.filter(x => x._id !== id));
            setFeatured(f => f.filter(x => x._id !== id));
            flash('Listing removed.'); 
        }
        else flash(data.message || 'Failed', true);
    };
    const dismissReport = async (id) => {
        const { ok, data } = await req(`${BASE}/hostel/${id}/dismiss-report`, 'PUT');
        if (ok) { setReported(r => r.filter(x => x._id !== id)); flash('Report dismissed.'); }
        else flash(data.message || 'Failed', true);
    };

    /* ---- Featured actions ---- */
    const toggleFeatured = async (hostel) => {
        const isFeatured = hostel.isFeatured;
        const { ok, data } = await req(`${BASE}/hostel/${hostel._id}/feature`, 'PUT', { featured: !isFeatured });
        if (ok) {
            setAllHostels(a => a.map(x => x._id === hostel._id ? { ...x, isFeatured: !isFeatured } : x));
            setFeatured(isFeatured
                ? featured.filter(x => x._id !== hostel._id)
                : [...featured, { ...hostel, isFeatured: true }]
            );
            flash(isFeatured ? 'Removed from featured.' : 'Listing featured!');
        } else flash(data.message || 'Failed', true);
    };

    /* ---- Stat counts ---- */
    const stats = [
        { label: 'Pending', value: pending.length, color: '#f59e0b', icon: '⏳' },
        { label: 'Total', value: allHostels.length, color: '#3b82f6', icon: '📂' },
        { label: 'Reported', value: reported.length, color: '#ef4444', icon: '🚩' },
        { label: 'Featured', value: featured.length, color: '#10b981', icon: '📌' },
    ];

    if (loading) return (
        <div className="ha-container">
            <div className="ha-main" style={{ justifyContent: 'center', alignItems: 'center' }}>
                <div className="ha-loader" />
            </div>
        </div>
    );

    return (
        <div className="ha-container">
            {/* ===== SIDEBAR ===== */}
            <aside className="ha-sidebar">
                <div className="sidebar-brand">
                    <span className="brand-icon">🛡️</span>
                    <h3>Admin Portal</h3>
                </div>
                <nav className="ha-nav">
                    {TABS.map(t => (
                        <button
                            key={t.id}
                            className={`ha-nav-item ${activeTab === t.id ? 'active' : ''}`}
                            onClick={() => setActiveTab(t.id)}
                        >
                            <span className="nav-label">{t.label}</span>
                            {t.id === 'pending' && pending.length > 0 && <span className="ha-badge">{pending.length}</span>}
                        </button>
                    ))}
                </nav>
            </aside>

            {/* ===== MAIN AREA ===== */}
            <main className="ha-main">
                <header className="ha-header-new">
                    <div className="header-info">
                        <h2>{TABS.find(t => t.id === activeTab)?.label.split(' ').slice(1).join(' ') || 'Dashboard'}</h2>
                        <p>Manage listings, users, and moderation from one place.</p>
                    </div>
                    <div className="header-actions">
                        {/* Optional: Add search or profile here later */}
                    </div>
                </header>

                <div className="ha-scroll-content">
                    {/* ===== STATS GRID ===== */}
                    <div className="ha-stats-grid">
                        {stats.map(s => (
                            <div key={s.label} className="ha-stat-card">
                                <div className="ha-stat-info">
                                    <span className="ha-stat-label">{s.label}</span>
                                    <span className="ha-stat-val">{s.value}</span>
                                </div>
                                <div className="ha-stat-icon-bg" style={{ backgroundColor: `${s.color}15`, color: s.color }}>
                                    {s.icon}
                                </div>
                            </div>
                        ))}
                    </div>

                    {error && <div className="ha-alert ha-alert--error">{error}</div>}
                    {success && <div className="ha-alert ha-alert--success">{success}</div>}

                    {/* ===== CONTENT CARD ===== */}
                    <div className="ha-content-card">
                        {/* ===== PENDING LISTINGS ===== */}
                        {activeTab === 'pending' && (
                            <div className="ha-section">
                                <div className="ha-card-head">
                                    <h3>Pending Approval</h3>
                                    <span className="ha-count-pill danger">{pending.length} awaiting review</span>
                                </div>
                                {pending.length === 0
                                    ? <div className="ha-empty">🎉 No pending listings. All caught up!</div>
                                    : (
                                        <div className="ha-grid-layout">
                                            {pending.map(p => (
                                                <div key={p._id} className="ha-pending-card">
                                                    <div className="ha-card-img">
                                                        <img
                                                            src={p.images?.[0] || p.image || 'https://images.unsplash.com/photo-1493666438817-866a91353ca9?auto=format&fit=crop&w=500&q=70'}
                                                            alt={p.name}
                                                            onError={e => e.target.src = 'https://images.unsplash.com/photo-1493666438817-866a91353ca9?auto=format&fit=crop&w=500&q=70'}
                                                        />
                                                        <span className="ha-type-tag">{p.gender ? p.gender.charAt(0).toUpperCase() + p.gender.slice(1) : 'Hostel'}</span>
                                                    </div>
                                                    <div className="ha-card-body">
                                                        <h4>{p.name}</h4>
                                                        <p className="ha-meta">📍 {p.location}</p>
                                                        <p className="ha-price-tag">Rs. {p.price || '—'} /mo</p>
                                                        <p className="ha-meta" style={{ fontSize: '0.85rem' }}>🏠 {p.owner?.name || p.owner?.username || 'Unknown'}</p>
                                                        <p className="ha-meta" style={{ fontSize: '0.8rem', opacity: 0.6 }}>📧 {p.owner?.email || '—'}</p>
                                                    </div>
                                                    <div className="ha-card-footer">
                                                        <button className="ha-btn-action approve" onClick={() => approveHostel(p._id)}>
                                                            Approve
                                                        </button>
                                                        <button className="ha-btn-action reject" onClick={() => rejectHostel(p._id)}>
                                                            Reject
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                            </div>
                        {/* ===== MANAGE ALL LISTINGS ===== */}
                        {activeTab === 'all' && (
                            <div className="ha-section">
                                <div className="ha-card-head">
                                    <h3>System Listings</h3>
                                    <span className="ha-count-pill">{allHostels.length} total hostels</span>
                                </div>
                                <div className="ha-table-wrapper">
                                    <table className="ha-modern-table">
                                        <thead>
                                            <tr>
                                                <th>Hostel</th>
                                                <th>Owner</th>
                                                <th>Status</th>
                                                <th>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {allHostels.map(h => (
                                                <tr key={h._id}>
                                                    <td>
                                                        <div className="ha-user-cell">
                                                            <img src={h.images?.[0] || h.image || ''} style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover' }} alt="" />
                                                            <div>
                                                                <strong>{h.name}</strong>
                                                                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{h.location}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>{h.owner?.name || h.owner?.username || '—'}</td>
                                                    <td>
                                                        <span className={`ha-count-pill ${h.status === 'approved' ? 'success' : h.status === 'pending' ? 'warning' : 'danger'}`}>
                                                            {h.status || 'Pending'}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <button className="ha-btn-text danger" onClick={() => removeListing(h._id)}>Delete</button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* ===== REVIEWS MODERATION ===== */}
                        {activeTab === 'reviews' && (
                            <div className="ha-section">
                                <div className="ha-card-head">
                                    <h3>Review Moderation</h3>
                                    <span className="ha-count-pill">{reviews.length} total</span>
                                </div>
                                {reviews.length === 0
                                    ? <div className="ha-empty">No reviews to moderate.</div>
                                    : (
                                        <div className="reviews-mod-list">
                                            {reviews.map(r => (
                                                <div key={r._id} className="review-mod-card" style={{ border: '1px solid #f1f5f9', padding: '20px', borderRadius: '12px', marginBottom: '16px' }}>
                                                    <div className="rmc-top" style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
                                                        <div className="ha-avatar" style={{ width: '40px', height: '40px' }}>{(r.userName || r.user || 'U')[0].toUpperCase()}</div>
                                                        <div className="rmc-meta" style={{ flex: 1 }}>
                                                            <strong>{r.userName || r.user || 'Anonymous'}</strong>
                                                            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>on {r.hostelName || r.hostel || '—'} • {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : ''}</div>
                                                        </div>
                                                        <StarRating rating={r.rating} />
                                                        <button className="ha-btn-text danger" onClick={() => deleteReview(r._id)}>Remove</button>
                                                    </div>
                                                    <p className="rmc-comment" style={{ fontStyle: 'italic', color: '#334155' }}>"{r.comment}"</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                            </div>
                        )}

                        {/* ===== REPORTED LISTINGS ===== */}
                        {activeTab === 'reported' && (
                            <div className="ha-section">
                                <div className="ha-card-head">
                                    <h3>Reported Listings</h3>
                                    <span className="ha-count-pill danger">{reported.length} flagged</span>
                                </div>
                                {reported.length === 0
                                    ? <div className="ha-empty">🎉 No reported listings right now.</div>
                                    : (
                                        <div className="ha-grid-layout">
                                            {reported.map(h => (
                                                <div key={h._id} className="ha-pending-card">
                                                    <div className="ha-card-img">
                                                        <img
                                                            src={h.image || 'https://images.unsplash.com/photo-1493666438817-866a91353ca9?auto=format&fit=crop&w=500&q=70'}
                                                            alt={h.name}
                                                            onError={e => e.target.src = 'https://images.unsplash.com/photo-1493666438817-866a91353ca9?auto=format&fit=crop&w=500&q=70'}
                                                        />
                                                        <span className="ha-reported-tag">🚩 Reported</span>
                                                    </div>
                                                    <div className="ha-card-body">
                                                        <h4>{h.name}</h4>
                                                        <p className="ha-meta">📍 {h.location}</p>
                                                        <p className="ha-meta">🏠 Owner: {h.ownerName || h.owner || 'Unknown'}</p>
                                                        {h.reportReason && <p style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '8px', fontWeight: '500' }}>⚠️ Reason: {h.reportReason}</p>}
                                                    </div>
                                                    <div className="ha-card-footer">
                                                        <button className="ha-btn-action reject" onClick={() => removeListing(h._id)}>
                                                            Remove
                                                        </button>
                                                        <button className="ha-btn-action ghost" onClick={() => dismissReport(h._id)}>
                                                            Dismiss
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                            </div>
                        )}

                        {/* ===== FEATURED LISTINGS ===== */}
                        {activeTab === 'featured' && (
                            <div className="ha-section">
                                <div className="ha-card-head">
                                    <h3>Featured Management</h3>
                                    <span className="ha-count-pill success">{featured.length} slots used</span>
                                </div>
                                <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '24px' }}>📌 Featured listings are highlighted on the public results page. Select approved listings to feature.</p>

                                <div className="ha-table-wrapper">
                                    <table className="ha-modern-table">
                                        <thead>
                                            <tr>
                                                <th>Listing</th>
                                                <th>Location</th>
                                                <th>Status</th>
                                                <th>Featured</th>
                                                <th>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {allHostels.filter(h => h.status === 'approved').map(h => (
                                                <tr key={h._id}>
                                                    <td>
                                                        <div className="ha-user-cell">
                                                            <img src={h.images?.[0] || h.image || ''} style={{ width: '48px', height: '32px', borderRadius: '4px', objectFit: 'cover' }} alt="" />
                                                            <strong>{h.name}</strong>
                                                        </div>
                                                    </td>
                                                    <td>{h.location}</td>
                                                    <td><span className="ha-count-pill success">Approved</span></td>
                                                    <td>
                                                        {h.isFeatured
                                                            ? <span className="ha-count-pill" style={{ backgroundColor: '#eff6ff', color: '#2563eb' }}>📌 Featured</span>
                                                            : <span className="ha-count-pill" style={{ opacity: 0.5 }}>Standard</span>
                                                        }
                                                    </td>
                                                    <td>
                                                        <button
                                                            className={`ha-btn-text ${h.isFeatured ? 'danger' : 'success'}`}
                                                            onClick={() => toggleFeatured(h)}
                                                        >
                                                            {h.isFeatured ? 'Remove' : 'Feature'}
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default HostelAdmin;
