import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sun, Moon } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [user, setUser] = useState(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
    const location = useLocation();

    const isStudent = user && user.role?.toUpperCase() !== 'PROVIDER' && user.role?.toUpperCase() !== 'FOOD_PROVIDER' && user.role?.toUpperCase() !== 'HOSTEL_OWNER' && user.role?.toUpperCase() !== 'ADMIN';
    const isProvider = user && user.role?.toUpperCase() === 'PROVIDER';
    const isFoodProvider = user && user.role?.toUpperCase() === 'FOOD_PROVIDER';
    const isHostelOwner = user && user.role?.toUpperCase() === 'HOSTEL_OWNER';
    const isAdmin = user && user.role?.toUpperCase() === 'ADMIN';

    const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

    useEffect(() => {
        if (theme === 'light') {
            document.body.classList.add('light-mode');
        } else {
            document.body.classList.remove('light-mode');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'dark' ? 'light' : 'dark');
    };

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
                        {!user && (
                            <>
                                <li><Link to="/" className={`navbar__link ${location.pathname === '/' ? 'navbar__link--active' : ''}`}>Home</Link></li>
                                <li><Link to="/laundry" className={`navbar__link ${location.pathname === '/laundry' ? 'navbar__link--active' : ''}`}>Laundry</Link></li>
                                <li><Link to="/food" className={`navbar__link ${location.pathname.startsWith('/food') ? 'navbar__link--active' : ''}`}>Food</Link></li>
                                <li><Link to="/hostel" className={`navbar__link ${location.pathname === '/hostel' ? 'navbar__link--active' : ''}`}>Hostel</Link></li>
                            </>
                        )}
                        {isStudent && (
                            <>
                                <li><Link to="/laundry" className={`navbar__link ${location.pathname === '/laundry' ? 'navbar__link--active' : ''}`}>Laundry</Link></li>
                                <li><Link to="/food" className={`navbar__link ${location.pathname.startsWith('/food') ? 'navbar__link--active' : ''}`}>Food</Link></li>
                                <li><Link to="/hostel" className={`navbar__link ${location.pathname === '/hostel' ? 'navbar__link--active' : ''}`}>Hostel</Link></li>
                                <li><Link to="/my-bookings" className={`navbar__link ${location.pathname === '/my-bookings' ? 'navbar__link--active' : ''}`}>My Laundry Bookings</Link></li>
                            </>
                        )}
                        {isProvider && (
                            <>
                                <li><Link to="/add-laundry" className={`navbar__link ${location.pathname === '/add-laundry' ? 'navbar__link--active' : ''}`}>Manage Laundry</Link></li>
                                <li><Link to="/manage-bookings" className={`navbar__link ${location.pathname === '/manage-bookings' ? 'navbar__link--active' : ''}`}>Manage Bookings</Link></li>
                            </>
                        )}
                        {isFoodProvider && (
                            <>
                                <li><Link to="/food" className={`navbar__link ${location.pathname.startsWith('/food') ? 'navbar__link--active' : ''}`}>Food</Link></li>
                                <li><Link to="/add-food" className={`navbar__link ${location.pathname === '/add-food' ? 'navbar__link--active' : ''}`}>Manage Restaurant</Link></li>
                                <li><Link to="/manage-food-orders" className={`navbar__link ${location.pathname === '/manage-food-orders' ? 'navbar__link--active' : ''}`}>Food Orders</Link></li>
                                <li><Link to="/manage-meal-plans" className={`navbar__link ${location.pathname === '/manage-meal-plans' ? 'navbar__link--active' : ''}`}>Meal Plan Orders</Link></li>
                            </>
                        )}
                        {isHostelOwner && (
                            <li><Link to="/hostel-owner" className={`navbar__link ${location.pathname === '/hostel-owner' ? 'navbar__link--active' : ''}`}>Hostel Owner</Link></li>
                        )}
                        {isAdmin && (
                            <>
                                <li><Link to="/admin" className={`navbar__link ${location.pathname === '/admin' ? 'navbar__link--active' : ''}`}>Admin</Link></li>
                                <li><Link to="/food-admin" className={`navbar__link ${location.pathname === '/food-admin' ? 'navbar__link--active' : ''}`}>Food Admin</Link></li>
                                <li><Link to="/manage-food-orders" className={`navbar__link ${location.pathname === '/manage-food-orders' ? 'navbar__link--active' : ''}`}>Food Orders</Link></li>
                                <li><Link to="/manage-meal-plans" className={`navbar__link ${location.pathname === '/manage-meal-plans' ? 'navbar__link--active' : ''}`}>Meal Plans</Link></li>
                                <li><Link to="/hostel-admin" className={`navbar__link ${location.pathname === '/hostel-admin' ? 'navbar__link--active' : ''}`}>Hostel Admin</Link></li>
                            </>
                        )}
                    </ul>
                </div>

                <div className="navbar__actions">
                    <button
                        onClick={toggleTheme}
                        className="theme-toggle-btn"
                        aria-label="Toggle Theme"
                    >
                        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                    </button>

                    {user ? (
                        <div className="navbar__user-profile">
                            <Link to="/profile" className="user-info">
                                <span className="user-name">Hi, {user.username}</span>
                                <div className="user-avatar">
                                    {user.profilePic ? (
                                        <img src={user.profilePic} alt="Profile" className="nav-avatar-img" />
                                    ) : (
                                        user.name ? user.name.charAt(0).toUpperCase() : user.username.charAt(0).toUpperCase()
                                    )}
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
                        {!user && (
                            <>
                                <li><Link to="/" onClick={() => setMenuOpen(false)}>Home</Link></li>
                                <li><Link to="/laundry" onClick={() => setMenuOpen(false)}>Laundry</Link></li>
                                <li><Link to="/food" onClick={() => setMenuOpen(false)}>Food</Link></li>
                                <li><Link to="/hostel" onClick={() => setMenuOpen(false)}>Hostel</Link></li>
                            </>
                        )}
                        {isStudent && (
                            <>
                                <li><Link to="/laundry" onClick={() => setMenuOpen(false)}>Laundry Services</Link></li>
                                <li><Link to="/food" onClick={() => setMenuOpen(false)}>Food & Dining</Link></li>
                                <li><Link to="/hostel" onClick={() => setMenuOpen(false)}>Hostel & Boarding</Link></li>
                                <li><Link to="/my-bookings" onClick={() => setMenuOpen(false)}>My Bookings</Link></li>
                            </>
                        )}
                        {isProvider && (
                            <>
                                <li><Link to="/add-laundry" onClick={() => setMenuOpen(false)}>Manage Laundry Shop</Link></li>
                                <li><Link to="/manage-bookings" onClick={() => setMenuOpen(false)}>Manage Bookings</Link></li>
                            </>
                        )}
                        {isFoodProvider && (
                            <>
                                <li><Link to="/food" onClick={() => setMenuOpen(false)}>Food</Link></li>
                                <li><Link to="/add-food" onClick={() => setMenuOpen(false)}>Manage Restaurant</Link></li>
                                <li><Link to="/manage-food-orders" onClick={() => setMenuOpen(false)}>Manage Food Orders</Link></li>
                                <li><Link to="/manage-meal-plans" onClick={() => setMenuOpen(false)}>Meal Plan Orders</Link></li>
                            </>
                        )}
                        {isHostelOwner && (
                            <li><Link to="/hostel-owner" onClick={() => setMenuOpen(false)}>Hostel Owner Dashboard</Link></li>
                        )}
                        {isAdmin && (
                            <>
                                <li><Link to="/admin" onClick={() => setMenuOpen(false)}>Admin Panel</Link></li>
                                <li><Link to="/food-admin" onClick={() => setMenuOpen(false)}>Food Admin</Link></li>
                                <li><Link to="/manage-food-orders" onClick={() => setMenuOpen(false)}>Food Orders</Link></li>
                                <li><Link to="/manage-meal-plans" onClick={() => setMenuOpen(false)}>Meal Plans</Link></li>
                                <li><Link to="/hostel-admin" onClick={() => setMenuOpen(false)}>Hostel Admin</Link></li>
                            </>
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
                        <li>
                            <button
                                onClick={() => { toggleTheme(); setMenuOpen(false); }}
                                className="mobile-theme-toggle-btn"
                            >
                                {theme === 'dark' ? <><Sun size={20} /> Switch to Light Mode</> : <><Moon size={20} /> Switch to Dark Mode</>}
                            </button>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
