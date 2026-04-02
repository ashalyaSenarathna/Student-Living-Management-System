import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sun, Moon, ChevronDown } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [medicalDropdownOpen, setMedicalDropdownOpen] = useState(false);
    const [foodDropdownOpen, setFoodDropdownOpen] = useState(false);
    const [adminDropdownOpen, setAdminDropdownOpen] = useState(false);
    const [user, setUser] = useState(null);
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
    const location = useLocation();

    useEffect(() => {
        if (theme === 'light') {
            document.body.classList.add('light-mode');
        } else {
            document.body.classList.remove('light-mode');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    useEffect(() => {
        // Close mobile menu when location changes
        setMenuOpen(false);
        setMedicalDropdownOpen(false);
        setFoodDropdownOpen(false);
        setAdminDropdownOpen(false);
    }, [location.pathname]);

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

        // Close menu when window is resized to desktop size
        const handleResize = () => {
            if (window.innerWidth > 1024) {
                setMenuOpen(false);
            }
        };
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', handleResize);
        };
    }, [location.pathname]);

    const handleLogout = () => {
        localStorage.removeItem('userInfo');
        setUser(null);
        window.location.reload();
    };

    const medicalPanelItems = [
        { label: '💊 Medical Panel', path: '/health/medical-panel', roles: ['USER'] },
        { label: '📅 Book Appointment', path: '/health/appointment-booking', roles: ['USER'] },
        { label: 'My Appointments', path: '/health/my-appointments', roles: ['USER'] },
        { label: '📋 Prescriptions', path: '/health/prescriptions', roles: ['USER'] },
        { label: '👨‍⚕️ Doctor Portal', path: '/health/doctor-portal', roles: ['DOCTOR'] },
    ];

    const visibleMedicalItems = medicalPanelItems.filter(item =>
        item.roles.includes(user?.role?.toUpperCase())
    );

    const foodPanelItems = [
        { label: '🍔 Food Hub', path: '/food', roles: ['USER', 'FOOD_PROVIDER', 'ADMIN'] },
        { label: '📦 My Orders', path: '/food/my-orders', roles: ['USER'] },
        { label: '🍽️ My Meal Plans', path: '/food/my-plans', roles: ['USER'] },
        { label: '➕ Add/Manage Food', path: '/food/add', roles: ['FOOD_PROVIDER'] },
        { label: '📋 Manage Orders', path: '/food/manage-orders', roles: ['FOOD_PROVIDER'] },
        { label: '📅 Manage Plans', path: '/food/manage-plans', roles: ['FOOD_PROVIDER'] },
    ];

    const visibleFoodItems = foodPanelItems.filter(item =>
        item.roles.includes(user?.role?.toUpperCase())
    );

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
                        {user?.role?.toUpperCase() !== 'HOSTEL_OWNER' && (
                            <li><Link to="/laundry" className={`navbar__link ${location.pathname === '/laundry' ? 'navbar__link--active' : ''}`}>Laundry</Link></li>
                        )}
                        <li><Link to="/hostel" className={`navbar__link ${location.pathname === '/hostel' ? 'navbar__link--active' : ''}`}>Hostel</Link></li>

                        {/* Medical Panel Dropdown */}
                        {visibleMedicalItems.length > 0 && (
                            <li className="navbar__dropdown">
                                <button
                                    className={`navbar__link navbar__dropdown-trigger ${location.pathname.startsWith('/health') ? 'navbar__link--active' : ''
                                        }`}
                                    onClick={() => setMedicalDropdownOpen(!medicalDropdownOpen)}
                                >
                                    🏥 Medical Panel
                                    <ChevronDown size={16} className={`dropdown-icon ${medicalDropdownOpen ? 'open' : ''}`} />
                                </button>
                                <div className={`navbar__dropdown-menu ${medicalDropdownOpen ? 'open' : ''}`}>
                                    {visibleMedicalItems.map((item) => (
                                        <Link
                                            key={item.path}
                                            to={item.path}
                                            className={`navbar__dropdown-item ${location.pathname === item.path ? 'active' : ''}`}
                                            onClick={() => setMedicalDropdownOpen(false)}
                                        >
                                            {item.label}
                                        </Link>
                                    ))}
                                </div>
                            </li>
                        )}

                        {/* Food Panel Dropdown */}
                        {visibleFoodItems.length > 0 && (
                            <li className="navbar__dropdown">
                                <button
                                    className={`navbar__link navbar__dropdown-trigger ${location.pathname.startsWith('/food') ? 'navbar__link--active' : ''
                                        }`}
                                    onClick={() => setFoodDropdownOpen(!foodDropdownOpen)}
                                >
                                    🍔 Food
                                    <ChevronDown size={16} className={`dropdown-icon ${foodDropdownOpen ? 'open' : ''}`} />
                                </button>
                                <div className={`navbar__dropdown-menu ${foodDropdownOpen ? 'open' : ''}`}>
                                    {visibleFoodItems.map((item) => (
                                        <Link
                                            key={item.path}
                                            to={item.path}
                                            className={`navbar__dropdown-item ${location.pathname === item.path ? 'active' : ''}`}
                                            onClick={() => setFoodDropdownOpen(false)}
                                        >
                                            {item.label}
                                        </Link>
                                    ))}
                                </div>
                            </li>
                        )}

                        {user &&
                            user.role?.toUpperCase() !== 'PROVIDER' &&
                            user.role?.toUpperCase() !== 'HOSTEL_OWNER' &&
                            user.role?.toUpperCase() !== 'ADMIN' && (
                                <li><Link to="/my-bookings" className={`navbar__link ${location.pathname === '/my-bookings' ? 'navbar__link--active' : ''}`}>My Laundry Bookings</Link></li>
                            )}
                        {user && user.role?.toUpperCase() === 'PROVIDER' && (
                            <>
                                <li><Link to="/add-laundry" className={`navbar__link ${location.pathname === '/add-laundry' ? 'navbar__link--active' : ''}`}>Manage Shop</Link></li>
                                <li><Link to="/manage-bookings" className={`navbar__link ${location.pathname === '/manage-bookings' ? 'navbar__link--active' : ''}`}>Bookings Manage</Link></li>
                            </>
                        )}
                        {user && user.role?.toUpperCase() === 'HOSTEL_OWNER' && (
                            <li><Link to="/hostel-owner" className={`navbar__link ${location.pathname === '/hostel-owner' ? 'navbar__link--active' : ''}`}>Hostel Owner</Link></li>
                        )}
                        {user && user.role?.toUpperCase() === 'ADMIN' && (
                            <li><Link to="/admin" className={`navbar__link ${location.pathname.startsWith('/admin') || location.pathname === '/hostel-admin' || location.pathname === '/health/pharmacy-admin' || location.pathname === '/food/admin' ? 'navbar__link--active' : ''}`}>🛡️ Admin Portal</Link></li>
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
            <div
                className={`navbar__mobile-overlay ${menuOpen ? 'navbar__mobile-overlay--open' : ''}`}
                onClick={() => setMenuOpen(false)}
            >
                <div className="mobile-menu-content" onClick={(e) => e.stopPropagation()}>
                    <ul className="mobile-nav-list">
                        {user?.role?.toUpperCase() !== 'HOSTEL_OWNER' && (
                            <li><Link to="/laundry" onClick={() => setMenuOpen(false)}>Laundry Services</Link></li>
                        )}
                        <li><Link to="/hostel" onClick={() => setMenuOpen(false)}>Hostel & Boarding</Link></li>

                        {/* Medical Panel Mobile Dropdown */}
                        {visibleMedicalItems.length > 0 && (
                            <li className="mobile-dropdown">
                                <button
                                    className="mobile-dropdown-trigger"
                                    onClick={() => setMedicalDropdownOpen(!medicalDropdownOpen)}
                                >
                                    🏥 Medical Panel
                                    <ChevronDown size={16} className={`dropdown-icon ${medicalDropdownOpen ? 'open' : ''}`} />
                                </button>
                                <div className={`mobile-dropdown-menu ${medicalDropdownOpen ? 'open' : ''}`}>
                                    {visibleMedicalItems.map((item) => (
                                        <Link
                                            key={item.path}
                                            to={item.path}
                                            className="mobile-dropdown-item"
                                            onClick={() => {
                                                setMenuOpen(false);
                                                setMedicalDropdownOpen(false);
                                            }}
                                        >
                                            {item.label}
                                        </Link>
                                    ))}
                                </div>
                            </li>
                        )}

                        {/* Food Panel Mobile Dropdown */}
                        {visibleFoodItems.length > 0 && (
                            <li className="mobile-dropdown">
                                <button
                                    className="mobile-dropdown-trigger"
                                    onClick={() => setFoodDropdownOpen(!foodDropdownOpen)}
                                >
                                    🍔 Food Hub
                                    <ChevronDown size={16} className={`dropdown-icon ${foodDropdownOpen ? 'open' : ''}`} />
                                </button>
                                <div className={`mobile-dropdown-menu ${foodDropdownOpen ? 'open' : ''}`}>
                                    {visibleFoodItems.map((item) => (
                                        <Link
                                            key={item.path}
                                            to={item.path}
                                            className="mobile-dropdown-item"
                                            onClick={() => {
                                                setMenuOpen(false);
                                                setFoodDropdownOpen(false);
                                            }}
                                        >
                                            {item.label}
                                        </Link>
                                    ))}
                                </div>
                            </li>
                        )}

                        {user &&
                            user.role?.toUpperCase() !== 'PROVIDER' &&
                            user.role?.toUpperCase() !== 'HOSTEL_OWNER' &&
                            user.role?.toUpperCase() !== 'ADMIN' && (
                                <li><Link to="/my-bookings" onClick={() => setMenuOpen(false)}>My Bookings</Link></li>
                            )}
                        {user && user.role?.toUpperCase() === 'PROVIDER' && (
                            <>
                                <li><Link to="/add-laundry" onClick={() => setMenuOpen(false)}>Manage Laundry Shop</Link></li>
                                <li><Link to="/manage-bookings" onClick={() => setMenuOpen(false)}>Manage Bookings</Link></li>
                            </>
                        )}
                        {user && user.role?.toUpperCase() === 'HOSTEL_OWNER' && (
                            <li><Link to="/hostel-owner" onClick={() => setMenuOpen(false)}>Hostel Owner Dashboard</Link></li>
                        )}
                        {user && user.role?.toUpperCase() === 'ADMIN' && (
                            <li><Link to="/admin" onClick={() => setMenuOpen(false)}>🛡️ Admin Portal</Link></li>
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
