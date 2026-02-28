import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';

const HomePage = () => {
    return (
        <div className="homepage">
            {/* Hero Section */}
            <section className="hero">
                <div className="hero__background">
                    <div className="blob blob-1"></div>
                    <div className="blob blob-2"></div>
                    <div className="blob blob-3"></div>
                </div>

                <div className="hero__content">
                    <div className="hero__badge">✨ The Future of Student Living</div>
                    <h1 className="hero__title">
                        Elevate Your <span className="text-gradient">University Experience</span>
                    </h1>
                    <p className="hero__subtitle">
                        Seamlessly manage your student life. From premium laundry services to social hubs,
                        everything you need is just one click away.
                    </p>
                    <div className="hero__actions">
                        <Link to="/register" className="btn-primary-large">Get Started Now</Link>
                        <Link to="/laundry" className="btn-secondary-large">Explore Services</Link>
                    </div>

                    <div className="hero__stats">
                        <div className="hero__stat-item">
                            <span className="stat-num">500+</span>
                            <span className="stat-label">Happy Students</span>
                        </div>
                        <div className="divider-v"></div>
                        <div className="hero__stat-item">
                            <span className="stat-num">24/7</span>
                            <span className="stat-label">Support</span>
                        </div>
                        <div className="divider-v"></div>
                        <div className="hero__stat-item">
                            <span className="stat-num">100%</span>
                            <span className="stat-label">Safe & Secure</span>
                        </div>
                    </div>
                </div>

                <div className="hero__image-container">
                    <div className="glass-card main-card">
                        <div className="card-header">
                            <div className="dots"><span></span><span></span><span></span></div>
                        </div>
                        <div className="card-mockup">
                            <div className="mockup-row header"></div>
                            <div className="mockup-grid">
                                <div className="mockup-item"></div>
                                <div className="mockup-item"></div>
                                <div className="mockup-item"></div>
                                <div className="mockup-item"></div>
                            </div>
                        </div>
                    </div>
                    <div className="glass-card floating-card-1">
                        <div className="icon">🧺</div>
                        <div className="text">Laundry ready!</div>
                    </div>
                    <div className="glass-card floating-card-2">
                        <div className="icon">💳</div>
                        <div className="text">Payment safe</div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="features" id="services">
                <div className="section-header">
                    <h2>Premium Features</h2>
                    <p>Designed specifically for the modern student lifestyle.</p>
                </div>

                <div className="features__grid">
                    <div className="feature-card">
                        <div className="feature-icon">🧼</div>
                        <h3>Smart Laundry</h3>
                        <p>Schedule, track, and pay for your laundry services without leaving your room.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">🤝</div>
                        <h3>Community Hub</h3>
                        <p>Connect with fellow residents and discover local student events effortlessly.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">🛡️</div>
                        <h3>24/7 Security</h3>
                        <p>Your safety is our priority. Integrated emergency services and secure access.</p>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default HomePage;
