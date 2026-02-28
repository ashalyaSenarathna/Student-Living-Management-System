import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [user, setUser] = useState(null);
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);

        // Load user info from localStorage
        const storedUser = localStorage.getItem('userInfo');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }

        return () => window.removeEventListener('scroll', handleScroll);
    }, [location.pathname]);

    const handleLogout = () => {
        localStorage.removeItem('userInfo');
        setUser(null);
        window.location.reload();
    };

    return (
        <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
            <div className="navbar__container">
                <Link to="/" className="navbar__logo">
                    <div className="navbar__logo-icon">🏠</div>
                    <span className="navbar__logo-text">Student<span className="navbar__logo-accent">Living</span></span>
                </Link>

                <div className={`navbar__menu ${menuOpen ? 'navbar__menu--active' : ''}`}>
                    <ul className="navbar__list">
                        <li><Link to="/" className={`navbar__link ${location.pathname === '/' ? 'navbar__link--active' : ''}`}>Home</Link></li>
                        <li><Link to="/laundry" className={`navbar__link ${location.pathname === '/laundry' ? 'navbar__link--active' : ''}`}>Laundry</Link></li>
                        {user && user.role?.toUpperCase() !== 'PROVIDER' && user.role?.toUpperCase() !== 'ADMIN' && (
                            <li><Link to="/my-bookings" className={`navbar__link ${location.pathname === '/my-bookings' ? 'navbar__link--active' : ''}`}>My Bookings</Link></li>
                        )}
                        {user && user.role?.toUpperCase() === 'PROVIDER' && (
                            <>
                                <li><Link to="/add-laundry" className={`navbar__link ${location.pathname === '/add-laundry' ? 'navbar__link--active' : ''}`}>Manage Shop</Link></li>
                                <li><Link to="/manage-bookings" className={`navbar__link ${location.pathname === '/manage-bookings' ? 'navbar__link--active' : ''}`}>Bookings</Link></li>
                            </>
                        )}
                        {user && user.role?.toUpperCase() === 'ADMIN' && (
                            <li><Link to="/admin" className={`navbar__link ${location.pathname === '/admin' ? 'navbar__link--active' : ''}`}>Admin</Link></li>
                        )}
                    </ul>
                </div>

                <div className="navbar__actions">
                    {user ? (
                        <div className="navbar__user-profile">
                            <Link to="/profile" className="user-info">
                                <span className="user-name">Hi, {user.username}</span>
                                <div className="user-avatar">
                                    {user.username.charAt(0).toUpperCase()}
                                </div>
                            </Link>
                            <button onClick={handleLogout} className="btn-logout">
                                <span className="logout-icon">⏻</span>
                                Logout
                            </button>
                        </div>
                    ) : (
                        <>
                            <Link to="/login" className="btn btn--ghost">Login</Link>
                            <Link to="/register" className="btn btn--primary">Get Started</Link>
                        </>
                    )}

                    <button className="navbar__toggle" onClick={() => setMenuOpen(!menuOpen)}>
                        <div className={`hamburger ${menuOpen ? 'hamburger--open' : ''}`}></div>
                    </button>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            <div className={`navbar__mobile-overlay ${menuOpen ? 'navbar__mobile-overlay--open' : ''}`}>
                <div className="mobile-menu-content">
                    <ul className="mobile-nav-list">
                        <li><Link to="/laundry" onClick={() => setMenuOpen(false)}>Laundry Services</Link></li>
                        {user && user.role?.toUpperCase() !== 'PROVIDER' && user.role?.toUpperCase() !== 'ADMIN' && (
                            <li><Link to="/my-bookings" onClick={() => setMenuOpen(false)}>My Bookings</Link></li>
                        )}
                        {user && user.role?.toUpperCase() === 'PROVIDER' && (
                            <>
                                <li><Link to="/add-laundry" onClick={() => setMenuOpen(false)}>Manage Laundry Shop</Link></li>
                                <li><Link to="/manage-bookings" onClick={() => setMenuOpen(false)}>Manage Bookings</Link></li>
                            </>
                        )}
                        {user && user.role?.toUpperCase() === 'ADMIN' && (
                            <li><Link to="/admin" onClick={() => setMenuOpen(false)}>Admin Panel</Link></li>
                        )}
                        {user ? (
                            <>
                                <li><Link to="/profile" onClick={() => setMenuOpen(false)}>My Profile</Link></li>
                                <li><button onClick={handleLogout} className="mobile-logout-btn">Logout</button></li>
                            </>
                        ) : (
                            <>
                                <li><Link to="/login" onClick={() => setMenuOpen(false)}>Login</Link></li>
                                <li><Link to="/register" className="mobile-btn-primary" onClick={() => setMenuOpen(false)}>Get Started</Link></li>
                            </>
                        )}
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
