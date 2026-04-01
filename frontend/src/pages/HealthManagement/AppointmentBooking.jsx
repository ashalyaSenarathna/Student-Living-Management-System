import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import {
    AlertCircle,
    CheckCircle2,
    Clock3,
    MapPin,
    Search,
    ShieldCheck,
    Stethoscope,
    UserRound,
    X
} from 'lucide-react';
import './AppointmentBooking.css';

const MIN_REASON_LENGTH = 10;
const MAX_REASON_LENGTH = 160;
const MAX_SYMPTOMS_LENGTH = 500;

const formatCurrency = (value = 0) => `Rs. ${Number(value).toFixed(2)}`;

const buildDateOptions = (days = 30) => Array.from({ length: days }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() + index + 1);

    return {
        value: date.toISOString().split('T')[0],
        weekday: date.toLocaleDateString('en-US', { weekday: 'short' }),
        day: date.toLocaleDateString('en-US', { day: '2-digit' }),
        month: date.toLocaleDateString('en-US', { month: 'short' })
    };
});

const getTomorrow = () => {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    return date.toISOString().split('T')[0];
};

const getMaxDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 30);
    return date.toISOString().split('T')[0];
};

const formatAvailabilityPreview = (availability = []) => {
    if (!availability.length) {
        return 'Availability schedule not published';
    }

    const activeDay = availability.find(slot => slot.isAvailable);
    if (!activeDay) {
        return 'No active clinic hours';
    }

    return `${activeDay.dayOfWeek}: ${activeDay.startTime} - ${activeDay.endTime}`;
};

const AppointmentBooking = () => {
    const [doctors, setDoctors] = useState([]);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [selectedDate, setSelectedDate] = useState('');
    const [availableSlots, setAvailableSlots] = useState([]);
    const [dateAvailability, setDateAvailability] = useState({});
    const [selectedSlot, setSelectedSlot] = useState('');
    const [reason, setReason] = useState('');
    const [symptoms, setSymptoms] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [specializationFilter, setSpecializationFilter] = useState('All');
    const [loading, setLoading] = useState(true);
    const [slotsLoading, setSlotsLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});

    const API_URL = 'http://localhost:5000/api/health';
    const token = JSON.parse(localStorage.getItem('userInfo') || '{}')?.token || '';
    const dateOptions = useMemo(() => buildDateOptions(30), []);

    useEffect(() => {
        fetchDoctors();
    }, []);

    const fetchDoctors = async () => {
        try {
            const response = await axios.get(`${API_URL}/doctors`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setDoctors(response.data.data || []);
            setLoading(false);
        } catch (err) {
            setError('Failed to load doctors.');
            setLoading(false);
        }
    };

    const specializationOptions = useMemo(() => ([
        'All',
        ...new Set(doctors.map(doctor => doctor.specialization).filter(Boolean))
    ]), [doctors]);

    const filteredDoctors = useMemo(() => doctors.filter(doctor => {
        const searchTarget = [
            doctor.firstName,
            doctor.lastName,
            doctor.specialization,
            doctor.officeLocation,
            doctor.qualifications
        ].filter(Boolean).join(' ').toLowerCase();

        const matchesSearch = searchTarget.includes(searchTerm.toLowerCase());
        const matchesSpecialization = specializationFilter === 'All' || doctor.specialization === specializationFilter;

        return matchesSearch && matchesSpecialization;
    }), [doctors, searchTerm, specializationFilter]);

    const resetDrawerState = () => {
        setSelectedDate('');
        setAvailableSlots([]);
        setDateAvailability({});
        setSelectedSlot('');
        setReason('');
        setSymptoms('');
        setFieldErrors({});
    };

    const handleDoctorSelect = (doctor) => {
        setSelectedDoctor(doctor);
        setError('');
        setSuccess('');
        resetDrawerState();
        fetchDateAvailability(doctor._id);
    };

    const closeDrawer = () => {
        setSelectedDoctor(null);
        resetDrawerState();
    };

    const fetchDateAvailability = async (doctorId) => {
        try {
            const response = await axios.get(`${API_URL}/appointments/calendar`, {
                params: { doctorId, days: 30 },
                headers: { Authorization: `Bearer ${token}` }
            });
            setDateAvailability(Object.fromEntries(
                (response.data.data || []).map(item => [item.date, item])
            ));
        } catch (err) {
            setDateAvailability({});
        }
    };

    const fetchSlots = async (doctorId, date) => {
        try {
            setSlotsLoading(true);
            setError('');
            const response = await axios.get(`${API_URL}/appointments/slots`, {
                params: { doctorId, date },
                headers: { Authorization: `Bearer ${token}` }
            });
            setAvailableSlots(response.data.data.availableSlots || []);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load available time slots.');
            setAvailableSlots([]);
        } finally {
            setSlotsLoading(false);
        }
    };

    const handleDateChange = (date) => {
        if (dateAvailability[date] && !dateAvailability[date].isAvailable) {
            return;
        }

        setSelectedDate(date);
        setSelectedSlot('');
        setFieldErrors(prev => ({ ...prev, selectedDate: '', selectedSlot: '' }));

        if (selectedDoctor && date) {
            fetchSlots(selectedDoctor._id, date);
        } else {
            setAvailableSlots([]);
        }
    };

    const validateForm = () => {
        const nextErrors = {};

        if (!selectedDoctor?._id) {
            nextErrors.selectedDoctor = 'Choose a doctor to continue.';
        }

        if (!selectedDate) {
            nextErrors.selectedDate = 'Select an appointment date.';
        }

        if (selectedDate) {
            const appointmentDate = new Date(selectedDate);
            const tomorrow = new Date(getTomorrow());
            const maxDate = new Date(getMaxDate());
            if (appointmentDate < tomorrow || appointmentDate > maxDate) {
                nextErrors.selectedDate = 'Date must be between tomorrow and the next 30 days.';
            }
        }

        if (!selectedSlot) {
            nextErrors.selectedSlot = 'Pick one available time slot.';
        }

        if (!reason.trim()) {
            nextErrors.reason = 'Enter the reason for your appointment.';
        } else if (reason.trim().length < MIN_REASON_LENGTH) {
            nextErrors.reason = `Reason must be at least ${MIN_REASON_LENGTH} characters.`;
        } else if (reason.trim().length > MAX_REASON_LENGTH) {
            nextErrors.reason = `Reason must be less than ${MAX_REASON_LENGTH} characters.`;
        }

        if (symptoms.trim().length > MAX_SYMPTOMS_LENGTH) {
            nextErrors.symptoms = `Symptoms must be under ${MAX_SYMPTOMS_LENGTH} characters.`;
        }

        if (selectedDoctor && !selectedDoctor.isAvailable) {
            nextErrors.selectedDoctor = 'This doctor is currently unavailable for booking.';
        }

        setFieldErrors(nextErrors);

        if (Object.keys(nextErrors).length > 0) {
            setError(Object.values(nextErrors)[0]);
            return false;
        }

        setError('');
        return true;
    };

    const handleBookAppointment = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            setSubmitting(true);
            await axios.post(
                `${API_URL}/appointments`,
                {
                    doctorId: selectedDoctor._id,
                    appointmentDate: selectedDate,
                    timeSlot: selectedSlot,
                    reason: reason.trim(),
                    symptoms: symptoms.trim()
                },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            setSuccess(`Appointment booked successfully with Dr. ${selectedDoctor.firstName} ${selectedDoctor.lastName}.`);
            closeDrawer();
            setTimeout(() => setSuccess(''), 4000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to book appointment.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="appointment-booking-page">
                <div className="appointment-shell appointment-loading-state">
                    <div className="appointment-spinner" />
                    <p>Loading doctors...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="appointment-booking-page">
            <div className="appointment-shell">
                <section className="appointment-hero">
                    <div className="appointment-hero-copy">
                        <span className="appointment-eyebrow">Health Appointments</span>
                        <h1>Book a doctor consultation</h1>
                        <p>
                            Search by specialization, compare doctors quickly, and book from a focused
                            scheduling drawer with live slot availability.
                        </p>
                    </div>

                    <div className="appointment-hero-stats">
                        <div className="appointment-stat-card">
                            <span>Approved doctors</span>
                            <strong>{doctors.length}</strong>
                        </div>
                        <div className="appointment-stat-card">
                            <span>Available now</span>
                            <strong>{doctors.filter(doctor => doctor.isAvailable).length}</strong>
                        </div>
                    </div>
                </section>

                {error && (
                    <div className="appointment-alert appointment-alert-error">
                        <AlertCircle size={18} />
                        <span>{error}</span>
                    </div>
                )}

                {success && (
                    <div className="appointment-alert appointment-alert-success">
                        <CheckCircle2 size={18} />
                        <span>{success}</span>
                    </div>
                )}

                <section className="appointment-toolbar">
                    <div className="appointment-search">
                        <Search size={18} />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search doctors, specialization, location, or qualifications"
                        />
                    </div>

                    <div className="appointment-filter-group">
                        {specializationOptions.map(option => (
                            <button
                                key={option}
                                type="button"
                                className={`appointment-filter-pill ${specializationFilter === option ? 'active' : ''}`}
                                onClick={() => setSpecializationFilter(option)}
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                </section>

                <section className="appointment-content-card">
                    <div className="appointment-section-heading">
                        <div>
                            <span className="appointment-section-kicker">Doctors</span>
                            <h2>Choose your doctor</h2>
                        </div>
                        <p>{filteredDoctors.length} doctor(s) match your search</p>
                    </div>

                    {filteredDoctors.length === 0 ? (
                        <div className="appointment-empty-state">
                            <UserRound size={28} />
                            <div>
                                <strong>No doctors found</strong>
                                <p>Try changing the search term or specialization filter.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="doctor-card-grid">
                            {filteredDoctors.map(doctor => (
                                <button
                                    key={doctor._id}
                                    type="button"
                                    className={`doctor-card ${selectedDoctor?._id === doctor._id ? 'selected' : ''}`}
                                    onClick={() => handleDoctorSelect(doctor)}
                                >
                                    <div className="doctor-card-header">
                                        <div className="doctor-avatar">
                                            {doctor.firstName?.[0]}{doctor.lastName?.[0]}
                                        </div>
                                        <div className="doctor-card-heading">
                                            <h3>Dr. {doctor.firstName} {doctor.lastName}</h3>
                                            <span>{doctor.specialization}</span>
                                        </div>
                                    </div>

                                    <div className="doctor-card-meta">
                                        <div><MapPin size={15} /> {doctor.officeLocation}</div>
                                        <div><Clock3 size={15} /> {doctor.experience || 0} years experience</div>
                                        <div><ShieldCheck size={15} /> {doctor.qualifications || 'Qualified medical practitioner'}</div>
                                    </div>

                                    <div className="doctor-card-footer">
                                        <span className={`doctor-status-pill ${doctor.isAvailable ? 'available' : 'unavailable'}`}>
                                            {doctor.isAvailable ? 'Available for booking' : 'Temporarily unavailable'}
                                        </span>
                                        <strong>{doctor.consultationFee ? formatCurrency(doctor.consultationFee) : 'Free consultation'}</strong>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </section>
            </div>

            {selectedDoctor && (
                <div className="appointment-drawer-overlay" onClick={closeDrawer}>
                    <aside className="appointment-drawer" onClick={(e) => e.stopPropagation()}>
                        <div className="appointment-drawer-header">
                            <div>
                                <span className="appointment-section-kicker">Book appointment</span>
                                <h2>Dr. {selectedDoctor.firstName} {selectedDoctor.lastName}</h2>
                            </div>
                            <button type="button" className="appointment-close-btn" onClick={closeDrawer}>
                                <X size={18} />
                            </button>
                        </div>

                        <div className="appointment-doctor-summary">
                            <div className="doctor-summary-row">
                                <span><Stethoscope size={15} /> Specialization</span>
                                <strong>{selectedDoctor.specialization}</strong>
                            </div>
                            <div className="doctor-summary-row">
                                <span><MapPin size={15} /> Location</span>
                                <strong>{selectedDoctor.officeLocation}</strong>
                            </div>
                            <div className="doctor-summary-row">
                                <span><Clock3 size={15} /> Typical hours</span>
                                <strong>{formatAvailabilityPreview(selectedDoctor.availability)}</strong>
                            </div>
                            <div className="doctor-summary-row">
                                <span><ShieldCheck size={15} /> Fee</span>
                                <strong>{selectedDoctor.consultationFee ? formatCurrency(selectedDoctor.consultationFee) : 'Free consultation'}</strong>
                            </div>
                        </div>

                        <form className="appointment-form" onSubmit={handleBookAppointment}>
                            <div className="appointment-field">
                                <label>Appointment date</label>
                                <div className={`appointment-date-picker ${fieldErrors.selectedDate ? 'has-error' : ''}`}>
                                    {dateOptions.map(option => (
                                        (() => {
                                            const availabilityMeta = dateAvailability[option.value];
                                            const isUnavailable = availabilityMeta && !availabilityMeta.isAvailable;

                                            return (
                                        <button
                                            key={option.value}
                                            type="button"
                                            className={`appointment-date-option ${selectedDate === option.value ? 'selected' : ''} ${isUnavailable ? 'unavailable' : ''}`}
                                            onClick={() => handleDateChange(option.value)}
                                            disabled={isUnavailable}
                                        >
                                            {isUnavailable && (
                                                <span className="appointment-date-x">
                                                    <X size={14} />
                                                </span>
                                            )}
                                            <span>{option.weekday}</span>
                                            <strong>{option.day}</strong>
                                            <small>{option.month}</small>
                                        </button>
                                            );
                                        })()
                                    ))}
                                </div>
                                {fieldErrors.selectedDate && <small>{fieldErrors.selectedDate}</small>}
                            </div>

                            <div className="appointment-field">
                                <label>Available time slots</label>
                                {slotsLoading ? (
                                    <div className="appointment-slot-status">Loading time slots...</div>
                                ) : selectedDate ? (
                                    availableSlots.length > 0 ? (
                                        <select
                                            className={`appointment-slot-select ${fieldErrors.selectedSlot ? 'has-error' : ''}`}
                                            value={selectedSlot}
                                            onChange={(e) => {
                                                setSelectedSlot(e.target.value);
                                                setFieldErrors(prev => ({ ...prev, selectedSlot: '' }));
                                            }}
                                        >
                                            <option value="">Select a time slot</option>
                                            {availableSlots.map(slot => (
                                                <option
                                                    key={slot.timeSlot}
                                                    value={slot.isBooked ? '' : slot.timeSlot}
                                                    disabled={slot.isBooked}
                                                >
                                                    {slot.timeSlot}{slot.isBooked ? ' - Not available' : ''}
                                                </option>
                                            ))}
                                        </select>
                                    ) : (
                                        <div className="appointment-slot-status">No available slots for this date.</div>
                                    )
                                ) : (
                                    <div className="appointment-slot-status">Choose a date to view available slots.</div>
                                )}
                                {fieldErrors.selectedSlot && <small>{fieldErrors.selectedSlot}</small>}
                            </div>

                            <div className="appointment-field">
                                <label htmlFor="appointment-reason">Reason for appointment</label>
                                <input
                                    id="appointment-reason"
                                    type="text"
                                    value={reason}
                                    onChange={(e) => {
                                        setReason(e.target.value);
                                        setFieldErrors(prev => ({ ...prev, reason: '' }));
                                    }}
                                    className={fieldErrors.reason ? 'has-error' : ''}
                                    placeholder="Example: recurring migraines and dizziness"
                                    maxLength={MAX_REASON_LENGTH}
                                />
                                <div className="field-footnote">
                                    <span>{reason.trim().length}/{MAX_REASON_LENGTH}</span>
                                </div>
                                {fieldErrors.reason && <small>{fieldErrors.reason}</small>}
                            </div>

                            <div className="appointment-field">
                                <label htmlFor="appointment-symptoms">Symptoms or notes</label>
                                <textarea
                                    id="appointment-symptoms"
                                    value={symptoms}
                                    onChange={(e) => {
                                        setSymptoms(e.target.value);
                                        setFieldErrors(prev => ({ ...prev, symptoms: '' }));
                                    }}
                                    className={fieldErrors.symptoms ? 'has-error' : ''}
                                    placeholder="Add symptoms, duration, triggers, medication history, or anything helpful for the doctor."
                                    rows="5"
                                    maxLength={MAX_SYMPTOMS_LENGTH}
                                />
                                <div className="field-footnote">
                                    <span>{symptoms.trim().length}/{MAX_SYMPTOMS_LENGTH}</span>
                                </div>
                                {fieldErrors.symptoms && <small>{fieldErrors.symptoms}</small>}
                            </div>

                            <div className="appointment-review-card">
                                <h3>Booking summary</h3>
                                <div className="doctor-summary-row">
                                    <span>Doctor</span>
                                    <strong>Dr. {selectedDoctor.firstName} {selectedDoctor.lastName}</strong>
                                </div>
                                <div className="doctor-summary-row">
                                    <span>Date</span>
                                    <strong>{selectedDate || '--'}</strong>
                                </div>
                                <div className="doctor-summary-row">
                                    <span>Time slot</span>
                                    <strong>{selectedSlot || '--'}</strong>
                                </div>
                                <div className="doctor-summary-row">
                                    <span>Fee</span>
                                    <strong>{selectedDoctor.consultationFee ? formatCurrency(selectedDoctor.consultationFee) : 'Free consultation'}</strong>
                                </div>
                            </div>

                            <button type="submit" className="appointment-submit-btn" disabled={submitting}>
                                {submitting ? 'Booking appointment...' : 'Confirm appointment'}
                            </button>
                        </form>
                    </aside>
                </div>
            )}
        </div>
    );
};

export default AppointmentBooking;
