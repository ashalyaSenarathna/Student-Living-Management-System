import React from 'react';
import './HomePage.css';

const services = [
    {
        id: 1,
        icon: '🏠',
        title: 'Hostel',
        desc: 'Find and manage your student accommodation with ease. Browse available rooms, book instantly, and handle all rental matters from one dashboard.',
        color: '#6c63ff',
        features: ['Room Booking', 'Lease Management', 'Room Transfers'],
    },
    {
        id: 2,
        icon: '🍽️',
        title: 'Food',
        desc: 'Never skip a meal. Order from your hostel canteen, track meal plans, and get nutritious food delivered right to your room.',
        color: '#f59e0b',
        features: ['Meal Plans', 'Online Ordering', 'Dietary Preferences'],
    },
    {
        id: 3,
        icon: '❤️',
        title: 'Health',
        desc: 'Your wellness matters. Book appointments with campus health professionals, access medical records, and stay on top of your health.',
        color: '#ef4444',
        features: ['Doctor Appointments', 'Health Records', '24/7 Emergency'],
    },
    {
        id: 4,
        icon: '👕',
        title: 'Laundry',
        desc: 'Schedule laundry pickups, track your clothes, and get them back fresh and folded — without ever leaving your room.',
        color: '#10b981',
        features: ['Pickup Scheduling', 'Real-time Tracking', 'Express Service'],
    },
];

const HomePage = () => {
    return (
        <main className="homepage">
            {/* ── Background Orbs ── */}
            <div className="bg-orb orb-1" />
            <div className="bg-orb orb-2" />
            <div className="bg-orb orb-3" />

            {/* ── HERO ── */}
            <section className="hero" id="home">
                <div className="hero__content">
                    <div className="hero__badge">
                        <span className="badge__dot" />
                        Your All-in-One Student Living Platform
                    </div>
                    <h1 className="hero__title">
                        Everything You Need,
                        <br />
                        <span className="hero__gradient">Right Here.</span>
                    </h1>
                    <p className="hero__subtitle">
                        Hostel, Food, Health &amp; Laundry — all managed from a single,
                        simple platform built specifically for student life at SLIIT.
                    </p>
                    <div className="hero__cta">
                        <a href="#services" className="hero-btn hero-btn--primary">
                            Explore Services <span>↓</span>
                        </a>
                        <a href="#register" className="hero-btn hero-btn--outline">
                            Get Started Free
                        </a>
                    </div>
                </div>

                {/* Mini stats */}
                <div className="hero__stats">
                    {[
                        { value: '2,500+', label: 'Students' },
                        { value: '4', label: 'Services' },
                        { value: '150+', label: 'Hostels' },
                        { value: '98%', label: 'Satisfaction' },
                    ].map((s, i) => (
                        <div key={i} className="hero__stat">
                            <span className="hero__stat-value">{s.value}</span>
                            <span className="hero__stat-label">{s.label}</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── SERVICES ── */}
            <section className="services section" id="services">
                <div className="section__header">
                    <span className="eyebrow">What We Offer</span>
                    <h2 className="section__title">Our Services</h2>
                    <p className="section__subtitle">
                        Four core services designed to make student living simpler, safer, and more comfortable.
                    </p>
                </div>

                <div className="services__grid">
                    {services.map((svc) => (
                        <div key={svc.id} className="service-card" style={{ '--accent': svc.color }}>
                            <div className="service-card__icon" style={{ background: svc.color + '20', color: svc.color }}>
                                {svc.icon}
                            </div>
                            <h3 className="service-card__title">{svc.title}</h3>
                            <p className="service-card__desc">{svc.desc}</p>
                            <ul className="service-card__features">
                                {svc.features.map((f, i) => (
                                    <li key={i}>
                                        <span className="feature-dot" style={{ background: svc.color }} />
                                        {f}
                                    </li>
                                ))}
                            </ul>
                            <a href={`#${svc.title.toLowerCase()}`} className="service-card__link" style={{ color: svc.color }}>
                                Learn more →
                            </a>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── CTA ── */}
            <section className="cta-section">
                <div className="cta-orb cta-orb-1" />
                <div className="cta-orb cta-orb-2" />
                <div className="cta__content">
                    <h2 className="cta__title">Ready to simplify your student life?</h2>
                    <p className="cta__subtitle">
                        Join thousands of students already using StudentLive across SLIIT.
                    </p>
                    <a href="#register" className="hero-btn hero-btn--primary">
                        Sign Up Free
                    </a>
                </div>
            </section>
        </main>
    );
};

export default HomePage;
