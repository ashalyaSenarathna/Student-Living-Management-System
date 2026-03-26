import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import {
    AlertCircle,
    CalendarDays,
    CheckCircle2,
    Clock3,
    FileText,
    Stethoscope,
    X
} from 'lucide-react';
import './MyAppointments.css';

const formatDate = (value) => {
    if (!value) return '--';
    return new Date(value).toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};

const getStatusClass = (status = '') => status.toLowerCase().replace(/\s+/g, '-');

const MyAppointments = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState('all');
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [cancelling, setCancelling] = useState(false);

    const API_URL = 'http://localhost:5000/api/health';
    const token = JSON.parse(localStorage.getItem('userInfo') || '{}')?.token || '';

    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await axios.get(`${API_URL}/appointments/student/my-appointments`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const appointmentData = Array.isArray(response.data?.data) ? response.data.data : [];
            setAppointments(appointmentData);
            setSelectedAppointment(prev => {
                if (!prev) return appointmentData[0] || null;
                return appointmentData.find(item => item._id === prev._id) || appointmentData[0] || null;
            });
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load appointments.');
        } finally {
            setLoading(false);
        }
    };

    const filteredAppointments = useMemo(() => {
        const now = new Date();

        switch (filter) {
            case 'upcoming':
                return appointments.filter(apt => new Date(apt.appointmentDate) >= now && !['Cancelled', 'Completed', 'Rejected'].includes(apt.status));
            case 'scheduled':
                return appointments.filter(apt => apt.status === 'Scheduled' || apt.status === 'Confirmed');
            case 'completed':
                return appointments.filter(apt => apt.status === 'Completed');
            case 'past':
                return appointments.filter(apt => new Date(apt.appointmentDate) < now || ['Completed', 'Cancelled', 'Rejected'].includes(apt.status));
            default:
                return appointments;
        }
    }, [appointments, filter]);

    useEffect(() => {
        if (!filteredAppointments.length) {
            setSelectedAppointment(null);
            return;
        }

        setSelectedAppointment(prev => (
            prev && filteredAppointments.some(item => item._id === prev._id)
                ? prev
                : filteredAppointments[0]
        ));
    }, [filteredAppointments]);

    const handleCancelAppointment = async (appointmentId) => {
        if (!window.confirm('Are you sure you want to cancel this appointment?')) return;

        try {
            setCancelling(true);
            await axios.put(`${API_URL}/appointments/${appointmentId}/cancel`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            await fetchAppointments();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to cancel appointment.');
        } finally {
            setCancelling(false);
        }
    };

    if (loading) {
        return (
            <div className="my-appointments-page">
                <div className="appointments-shell appointments-loading-state">
                    <div className="appointments-spinner" />
                    <p>Loading appointments...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="my-appointments-page">
            <div className="appointments-shell">
                <section className="appointments-hero">
                    <div className="appointments-hero-copy">
                        <span className="appointments-eyebrow">My Health Schedule</span>
                        <h1>My appointments</h1>
                        <p>
                            Track upcoming consultations, review doctor notes, and manage your booked
                            sessions from one timeline.
                        </p>
                    </div>

                    <div className="appointments-hero-stats">
                        <div className="appointments-stat-card">
                            <span>Total bookings</span>
                            <strong>{appointments.length}</strong>
                        </div>
                        <div className="appointments-stat-card">
                            <span>Upcoming</span>
                            <strong>{appointments.filter(apt => ['Scheduled', 'Confirmed'].includes(apt.status)).length}</strong>
                        </div>
                    </div>
                </section>

                {error && (
                    <div className="appointments-alert appointments-alert-error">
                        <AlertCircle size={18} />
                        <span>{error}</span>
                    </div>
                )}

                <section className="appointments-filter-bar">
                    {[
                        ['all', `All (${appointments.length})`],
                        ['upcoming', 'Upcoming'],
                        ['scheduled', 'Scheduled'],
                        ['completed', 'Completed'],
                        ['past', 'Past']
                    ].map(([value, label]) => (
                        <button
                            key={value}
                            type="button"
                            className={`appointments-filter-pill ${filter === value ? 'active' : ''}`}
                            onClick={() => setFilter(value)}
                        >
                            {label}
                        </button>
                    ))}
                </section>

                <section className="appointments-layout-card">
                    <div className="appointments-master-list">
                        {filteredAppointments.length === 0 ? (
                            <div className="appointments-empty-state">
                                <CalendarDays size={28} />
                                <div>
                                    <strong>No appointments found</strong>
                                    <p>There are no appointments in the current filter.</p>
                                </div>
                            </div>
                        ) : (
                            filteredAppointments.map(appointment => {
                                const doctorName = appointment.doctor
                                    ? `Dr. ${appointment.doctor.firstName} ${appointment.doctor.lastName}`
                                    : 'Doctor information unavailable';

                                return (
                                    <button
                                        key={appointment._id}
                                        type="button"
                                        className={`appointment-summary-card ${selectedAppointment?._id === appointment._id ? 'selected' : ''}`}
                                        onClick={() => setSelectedAppointment(appointment)}
                                    >
                                        <div className="appointment-summary-head">
                                            <div>
                                                <h3>{doctorName}</h3>
                                                <span>{appointment.doctor?.specialization || 'General consultation'}</span>
                                            </div>
                                            <span className={`appointment-status-pill ${getStatusClass(appointment.status)}`}>
                                                {appointment.status}
                                            </span>
                                        </div>

                                        <div className="appointment-summary-meta">
                                            <span><CalendarDays size={14} /> {formatDate(appointment.appointmentDate)}</span>
                                            <span><Clock3 size={14} /> {appointment.timeSlot}</span>
                                        </div>

                                        <p>{appointment.reason}</p>
                                    </button>
                                );
                            })
                        )}
                    </div>

                    <div className="appointment-detail-panel">
                        {selectedAppointment ? (
                            <>
                                <div className="appointment-detail-header">
                                    <div>
                                        <span className="appointments-section-kicker">Details</span>
                                        <h2>
                                            {selectedAppointment.doctor
                                                ? `Dr. ${selectedAppointment.doctor.firstName} ${selectedAppointment.doctor.lastName}`
                                                : 'Appointment details'}
                                        </h2>
                                    </div>
                                    <button
                                        type="button"
                                        className="appointment-detail-close"
                                        onClick={() => setSelectedAppointment(null)}
                                        aria-label="Close appointment details"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>

                                <div className="appointment-detail-grid">
                                    <div className="detail-card">
                                        <span><Stethoscope size={15} /> Specialization</span>
                                        <strong>{selectedAppointment.doctor?.specialization || '--'}</strong>
                                    </div>
                                    <div className="detail-card">
                                        <span><CalendarDays size={15} /> Date</span>
                                        <strong>{formatDate(selectedAppointment.appointmentDate)}</strong>
                                    </div>
                                    <div className="detail-card">
                                        <span><Clock3 size={15} /> Time slot</span>
                                        <strong>{selectedAppointment.timeSlot}</strong>
                                    </div>
                                    <div className="detail-card">
                                        <span><CheckCircle2 size={15} /> Status</span>
                                        <strong>{selectedAppointment.status}</strong>
                                    </div>
                                </div>

                                <div className="appointment-note-block">
                                    <label>Reason for appointment</label>
                                    <p>{selectedAppointment.reason}</p>
                                </div>

                                {selectedAppointment.symptoms && (
                                    <div className="appointment-note-block">
                                        <label>Symptoms</label>
                                        <p>{selectedAppointment.symptoms}</p>
                                    </div>
                                )}

                                {selectedAppointment.doctorRejectionReason && (
                                    <div className="appointment-note-block danger">
                                        <label>Doctor rejection reason</label>
                                        <p>{selectedAppointment.doctorRejectionReason}</p>
                                    </div>
                                )}

                                {selectedAppointment.consultationNotes && (
                                    <div className="appointment-note-block info">
                                        <label>Consultation notes</label>
                                        <p>{selectedAppointment.consultationNotes}</p>
                                    </div>
                                )}

                                {selectedAppointment.prescription && (
                                    <div className="appointment-note-block success">
                                        <label>Prescription</label>
                                        <p>A prescription is attached to this appointment.</p>
                                        <a href="/health/prescriptions" className="appointment-link-btn">
                                            <FileText size={15} />
                                            View prescriptions
                                        </a>
                                    </div>
                                )}

                                {['Scheduled', 'Confirmed'].includes(selectedAppointment.status) && (
                                    <button
                                        type="button"
                                        className="appointment-cancel-btn"
                                        disabled={cancelling}
                                        onClick={() => handleCancelAppointment(selectedAppointment._id)}
                                    >
                                        {cancelling ? 'Cancelling...' : 'Cancel appointment'}
                                    </button>
                                )}
                            </>
                        ) : (
                            <div className="appointments-empty-state detail-empty">
                                <CalendarDays size={28} />
                                <div>
                                    <strong>Select an appointment</strong>
                                    <p>Choose any appointment from the list to see full details here.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default MyAppointments;
