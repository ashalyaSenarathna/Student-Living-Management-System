import React from 'react';
import logo from '../assets/logo.png';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="footer" id="contact">
            <div className="footer__container">
                <div className="footer__brand">
                    <div className="footer__logo">
                        <img src={logo} alt="Student Living Logo" className="footer__logo-img" />
                        <span>Student<span className="footer__accent">Live</span></span>
                    </div>
                    <p className="footer__tagline">
                        Simplifying student living, one room at a time. Your all-in-one platform for managing student accommodation.
                    </p>
                    <div className="footer__social">
                        <a href="#!" className="footer__social-link" aria-label="Facebook">f</a>
                        <a href="#!" className="footer__social-link" aria-label="Twitter">𝕏</a>
                        <a href="#!" className="footer__social-link" aria-label="Instagram">📸</a>
                        <a href="#!" className="footer__social-link" aria-label="LinkedIn">in</a>
                    </div>
                </div>

                <div className="footer__links-group">
                    <h4>Platform</h4>
                    <ul>
                        <li><a href="#features">Features</a></li>
                        <li><a href="#services">Services</a></li>
                        <li><a href="#!">Pricing</a></li>
                        <li><a href="#!">Updates</a></li>
                    </ul>
                </div>

                <div className="footer__links-group">
                    <h4>Support</h4>
                    <ul>
                        <li><a href="#!">Help Center</a></li>
                        <li><a href="#!">Documentation</a></li>
                        <li><a href="#!">Community</a></li>
                        <li><a href="#!">Contact Us</a></li>
                    </ul>
                </div>

                <div className="footer__links-group">
                    <h4>Contact</h4>
                    <ul>
                        <li>📧 support@studentlive.lk</li>
                        <li>📞 +94 11 234 5678</li>
                        <li>📍 Colombo, Sri Lanka</li>
                    </ul>
                </div>
            </div>

            <div className="footer__bottom">
                <p>© {new Date().getFullYear()} StudentLive. All rights reserved.</p>
                <div className="footer__bottom-links">
                    <a href="#!">Privacy Policy</a>
                    <a href="#!">Terms of Service</a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
