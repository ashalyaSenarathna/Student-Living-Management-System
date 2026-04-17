import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Sparkles,
    ShieldCheck,
    Users,
    Zap,
    Star,
    ArrowRight,
    CheckCircle2,
    Smartphone,
    Heart,
    Shirt,
    Home,
    MessageCircle
} from 'lucide-react';
import './HomePage.css';

const HomePage = () => {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.15 }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
        }
    };

    return (
        <div className="homepage-premium">
            {/* Background Elements */}
            <div className="bg-elements">
                <div className="glow glow-1"></div>
                <div className="glow glow-2"></div>
            </div>

            {/* Hero Section */}
            <section className="hero-luxe">
                <div className="hero-grid">
                    <motion.div
                        className="hero-content-modern"
                        initial="hidden"
                        animate="visible"
                        variants={containerVariants}
                    >
                        <motion.div className="hero-badge-fancy" variants={itemVariants}>
                            <Sparkles size={14} className="sparkle" />
                            <span>Revolutionizing Student Living</span>
                        </motion.div>

                        <motion.h1 className="hero-title-max" variants={itemVariants}>
                            Your Campus Life, <br />
                            <span className="text-gradient">Redefined.</span>
                        </motion.h1>

                        <motion.p className="hero-lead" variants={itemVariants}>
                            The all-in-one ecosystem for the modern student. From elite laundry care
                            to premium hostel finds—manage it all from a single, stunning dashboard.
                        </motion.p>

                        <motion.div className="hero-cta-group" variants={itemVariants}>
                            <Link to="/register" className="btn-glass-primary">
                                Get Started <ArrowRight size={18} />
                            </Link>
                            <Link to="/laundry" className="btn-subtle">
                                Browse Services
                            </Link>
                        </motion.div>

                        <motion.div className="hero-metrics" variants={itemVariants}>
                            <div className="metric">
                                <span className="m-num">1.2k+</span>
                                <span className="m-label">Active Users</span>
                            </div>
                            <div className="m-divider"></div>
                            <div className="metric">
                                <span className="m-num">98%</span>
                                <span className="m-label">Reliability</span>
                            </div>
                            <div className="m-divider"></div>
                            <div className="metric">
                                <span className="m-num">24/7</span>
                                <span className="m-label">Automated</span>
                            </div>
                        </motion.div>
                    </motion.div>

                    <div className="hero-visual">
                        <motion.div
                            className="visual-core"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 1, ease: "easeOut" }}
                        >
                            <div className="main-device-mockup">
                                <div className="mockup-header">
                                    <div className="mockup-controls"><span></span><span></span><span></span></div>
                                </div>
                                <div className="mockup-body">
                                    <div className="shimmer-row w-40"></div>
                                    <div className="shimmer-grid">
                                        <div className="shimmer-box"></div>
                                        <div className="shimmer-box active"></div>
                                        <div className="shimmer-box"></div>
                                        <div className="shimmer-box"></div>
                                    </div>
                                    <div className="shimmer-row full"></div>
                                </div>
                            </div>

                            {/* Floating UI Elements */}
                            <motion.div
                                className="floating-ui f-1"
                                animate={{ y: [0, -15, 0] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            >
                                <div className="f-icon laundry"><Shirt size={20} /></div>
                                <div className="f-text">
                                    <strong>Status</strong>
                                    <span>Laundry Picked up</span>
                                </div>
                            </motion.div>

                            <motion.div
                                className="floating-ui f-2"
                                animate={{ y: [0, 15, 0] }}
                                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                            >
                                <div className="f-icon payment"><Smartphone size={20} /></div>
                                <div className="f-text">
                                    <strong>Safe Pay</strong>
                                    <span>Transaction Verified</span>
                                </div>
                            </motion.div>

                            <motion.div
                                className="floating-ui f-3"
                                animate={{ x: [0, 10, 0] }}
                                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                            >
                                <div className="f-icon hostel"><Home size={20} /></div>
                                <div className="f-text">
                                    <strong>New Listing</strong>
                                    <span>Hostel Available</span>
                                </div>
                            </motion.div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Social Proof */}



            {/* Core Services */}
            <section className="services-showcase">
                <div className="sec-header-center">
                    <motion.span
                        className="sec-label"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                    >
                        How we help you
                    </motion.span>
                    <h2 className="sec-h2">Solutions for Every Need</h2>
                </div>

                <div className="services-grid-luxe">
                    <motion.div
                        className="service-card-luxe"
                        whileHover={{ y: -10 }}
                    >
                        <div className="s-icon purple"><Shirt /></div>
                        <h3>Professional Laundry</h3>
                        <p>Real-time tracking, door-to-door pickup, and elite garment care for the busy student.</p>
                        <ul className="s-perks">
                            <li><CheckCircle2 size={16} /> Live Status Tracking</li>
                            <li><CheckCircle2 size={16} /> Eco-friendly Cleaning</li>
                        </ul>
                    </motion.div>

                    <motion.div
                        className="service-card-luxe highlight"
                        whileHover={{ y: -10 }}
                    >
                        <div className="s-icon blue"><Home /></div>
                        <h3>Smart Hostel Search</h3>
                        <p>Find your next perfect living space with verified listings and secure virtual tours.</p>
                        <ul className="s-perks">
                            <li><CheckCircle2 size={16} /> Verified Owners only</li>
                            <li><CheckCircle2 size={16} /> Direct Owner Contact</li>
                        </ul>
                    </motion.div>

                    <motion.div
                        className="service-card-luxe"
                        whileHover={{ y: -10 }}
                    >
                        <div className="s-icon pink"><Zap /></div>
                        <h3>Instant Utility</h3>
                        <p>One-tap payments and utility management designed to simplify your daily routine.</p>
                        <ul className="s-perks">
                            <li><CheckCircle2 size={16} /> 2-tap Booking</li>
                            <li><CheckCircle2 size={16} /> Digital Receipts</li>
                        </ul>
                    </motion.div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-banner">
                <div className="cta-content">
                    <div className="icons-stack">
                        <div className="circular-avatar"><Users /></div>
                        <div className="circular-avatar"><MessageCircle /></div>
                        <div className="circular-avatar"><Heart /></div>
                    </div>
                    <h2>Ready to upgrade your student life?</h2>
                    <p>Join over 1,000+ students already using our platform daily.</p>
                    <div className="cta-btns">
                        <Link to="/register" className="btn-primary-glow">Sign Up Free</Link>
                        <Link to="/login" className="btn-outline-white">Login Account</Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default HomePage;
