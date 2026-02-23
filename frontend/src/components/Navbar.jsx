import React, { useState, useEffect } from 'react';
import './Navbar.css';

const Navbar = () => {
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
            <div className="navbar__container">
                {/* Logo */}
                <a href="#home" className="navbar__logo">
                    <div className="navbar__logo-icon">🏠</div>
                    <span className="navbar__logo-text">
                        Student<span className="navbar__logo-accent">Live</span>
                    </span>
                </a>

                {/* Desktop Nav Links */}
                <ul className="navbar__links">
                    <li><a href="#home" className="navbar__link navbar__link--active">Home</a></li>
                    <li><a href="#features" className="navbar__link">Features</a></li>
                    <li><a href="#services" className="navbar__link">Services</a></li>
                    <li><a href="#testimonials" className="navbar__link">Testimonials</a></li>
                    <li><a href="#contact" className="navbar__link">Contact</a></li>
                </ul>

                {/* CTA Buttons */}
                <div className="navbar__actions">
                    <a href="#login" className="btn btn--ghost">Login</a>
                    <a href="#register" className="btn btn--primary">Get Started</a>
                </div>

                {/* Hamburger */}
                <button
                    className={`navbar__hamburger ${menuOpen ? 'open' : ''}`}
                    onClick={() => setMenuOpen(!menuOpen)}
                    aria-label="Toggle menu"
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </button>
            </div>

            {/* Mobile Menu */}
            <div className={`navbar__mobile-menu ${menuOpen ? 'navbar__mobile-menu--open' : ''}`}>
                <ul>
                    <li><a href="#home" onClick={() => setMenuOpen(false)}>Home</a></li>
                    <li><a href="#features" onClick={() => setMenuOpen(false)}>Features</a></li>
                    <li><a href="#services" onClick={() => setMenuOpen(false)}>Services</a></li>
                    <li><a href="#testimonials" onClick={() => setMenuOpen(false)}>Testimonials</a></li>
                    <li><a href="#contact" onClick={() => setMenuOpen(false)}>Contact</a></li>
                    <li><a href="#login" className="mobile-btn-ghost" onClick={() => setMenuOpen(false)}>Login</a></li>
                    <li><a href="#register" className="mobile-btn-primary" onClick={() => setMenuOpen(false)}>Get Started</a></li>
                </ul>
            </div>
        </nav>
    );
};

export default Navbar;
