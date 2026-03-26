import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { AlertCircle, Check, Pill, Stethoscope, Trash2, UserRound, X } from 'lucide-react';
import './DoctorPortal.css';

const formatDate = (value) => {
    if (!value) return '--';
    return new Date(value).toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};

const DoctorPortal = () => {
    const [appointments, setAppointments] = useState([]);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [prescriptionData, setPrescriptionData] = useState({
        medicines: [],
        diagnosis: '',
        notes: ''
    });
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [newMedicine, setNewMedicine] = useState({
        pharmaceuticalId: '',
        dosage: '',
        frequency: '',
        duration: '',
        instructions: ''
    });
    const [medicines, setMedicines] = useState([]);

    const API_URL = 'http://localhost:5000/api/health';
    const token = JSON.parse(localStorage.getItem('userInfo') || '{}')?.token || '';

    useEffect(() => {
        fetchAppointments();
        fetchMedicines();
    }, []);

    const fetchAppointments = async () => {
        try {
            const response = await axios.get(`${API_URL}/appointments/doctor/appointments`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const appointmentData = response.data.data || [];
            setAppointments(appointmentData);
            setSelectedAppointment(prev => appointmentData.find(item => item._id === prev?._id) || appointmentData[0] || null);
            setLoading(false);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load appointments');
            setLoading(false);
        }
    };

    const fetchMedicines = async () => {
        try {
            const response = await axios.get(`${API_URL}/pharmaceutical`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMedicines(response.data.data || []);
        } catch (err) {
            console.error('Failed to load medicines');
        }
    };

    const resetPrescriptionForm = () => {
        setPrescriptionData({ medicines: [], diagnosis: '', notes: '' });
        setNewMedicine({
            pharmaceuticalId: '',
            dosage: '',
            frequency: '',
            duration: '',
            instructions: ''
        });
    };

    const handleAcceptAppointment = async (appointmentId) => {
        try {
            await axios.put(`${API_URL}/appointments/${appointmentId}/accept`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            resetPrescriptionForm();
            await fetchAppointments();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to accept appointment');
        }
    };

    const handleRejectAppointment = async () => {
        const reason = prompt('Enter rejection reason:');
        if (!reason) return;

        try {
            await axios.put(`${API_URL}/appointments/${selectedAppointment._id}/reject`, { reason }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            resetPrescriptionForm();
            await fetchAppointments();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reject appointment');
        }
    };

    const addMedicineToPrescription = () => {
        if (!newMedicine.pharmaceuticalId || !newMedicine.dosage || !newMedicine.frequency || !newMedicine.duration) {
            setError('Please fill all medicine details before adding.');
            return;
        }

        setError('');
        setPrescriptionData(prev => ({
            ...prev,
            medicines: [...prev.medicines, newMedicine]
        }));

        setNewMedicine({
            pharmaceuticalId: '',
            dosage: '',
            frequency: '',
            duration: '',
            instructions: ''
        });
    };

    const removeMedicineFromPrescription = (index) => {
        setPrescriptionData(prev => ({
            ...prev,
            medicines: prev.medicines.filter((_, i) => i !== index)
        }));
    };

    const handleCompleteAppointment = async (e) => {
        e.preventDefault();

        if (!prescriptionData.diagnosis.trim()) {
            setError('Please enter diagnosis');
            return;
        }

        try {
            setSubmitting(true);

            await axios.post(
                `${API_URL}/prescriptions`,
                {
                    studentId: selectedAppointment.student._id,
                    appointmentId: selectedAppointment._id,
                    medicines: prescriptionData.medicines,
                    diagnosis: prescriptionData.diagnosis,
                    notes: prescriptionData.notes
                },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            await axios.put(
                `${API_URL}/appointments/${selectedAppointment._id}/complete`,
                {
                    consultationNotes: prescriptionData.notes
                },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            resetPrescriptionForm();
            await fetchAppointments();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to complete appointment');
        } finally {
            setSubmitting(false);
        }
    };

    const getMedicineName = (id) => medicines.find(m => m._id === id)?.name || 'Unknown';

    const pendingAppointments = useMemo(
        () => appointments.filter(apt => apt.status === 'Scheduled' || apt.status === 'Confirmed'),
        [appointments]
    );
    const completedAppointments = useMemo(
        () => appointments.filter(apt => apt.status === 'Completed'),
        [appointments]
    );

    if (loading) {
        return (
            <div className="doctor-portal-page">
                <div className="doctor-portal-shell doctor-portal-loading-state">
                    <div className="doctor-portal-spinner" />
                    <p>Loading appointments...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="doctor-portal-page">
            <div className="doctor-portal-shell">
                <section className="doctor-portal-hero">
                    <div className="doctor-portal-hero-copy">
                        <span className="doctor-portal-eyebrow">Doctor Workspace</span>
                        <h1>Doctor portal</h1>
                        <p>
                            Review upcoming consultations, accept or reject requests, and complete
                            confirmed appointments with prescriptions in one focused workspace.
                        </p>
                    </div>

                    <div className="doctor-portal-stats">
                        <div className="doctor-portal-stat-card">
                            <span>Pending + confirmed</span>
                            <strong>{pendingAppointments.length}</strong>
                        </div>
                        <div className="doctor-portal-stat-card">
                            <span>Completed</span>
                            <strong>{completedAppointments.length}</strong>
                        </div>
                    </div>
                </section>

                {error && (
                    <div className="doctor-portal-alert doctor-portal-alert-error">
                        <AlertCircle size={18} />
                        <span>{error}</span>
                    </div>
                )}

                <section className="doctor-portal-layout">
                    <div className="doctor-portal-sidebar">
                        <div className="doctor-portal-section-card">
                            <div className="doctor-portal-section-head">
                                <div>
                                    <span className="doctor-portal-section-kicker">Queue</span>
                                    <h2>Upcoming appointments</h2>
                                </div>
                            </div>

                            {pendingAppointments.length === 0 ? (
                                <div className="doctor-portal-empty-state">
                                    <UserRound size={26} />
                                    <div>
                                        <strong>No upcoming appointments</strong>
                                        <p>New scheduled appointments will appear here.</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="doctor-portal-card-list">
                                    {pendingAppointments.map(apt => (
                                        <button
                                            key={apt._id}
                                            type="button"
                                            className={`doctor-portal-appointment-card ${selectedAppointment?._id === apt._id ? 'selected' : ''}`}
                                            onClick={() => {
                                                setSelectedAppointment(apt);
                                                resetPrescriptionForm();
                                            }}
                                        >
                                            <div className="appointment-card-head">
                                                <h3>{apt.student.name}</h3>
                                                <span className={`appointment-status-pill ${apt.status.toLowerCase()}`}>
                                                    {apt.status}
                                                </span>
                                            </div>
                                            <p>{formatDate(apt.appointmentDate)} • {apt.timeSlot}</p>
                                            <p>{apt.reason}</p>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="doctor-portal-section-card">
                            <div className="doctor-portal-section-head">
                                <div>
                                    <span className="doctor-portal-section-kicker">Archive</span>
                                    <h2>Completed appointments</h2>
                                </div>
                            </div>

                            {completedAppointments.length === 0 ? (
                                <div className="doctor-portal-empty-state compact">
                                    <p>No completed appointments yet.</p>
                                </div>
                            ) : (
                                <div className="doctor-portal-card-list compact">
                                    {completedAppointments.slice(0, 5).map(apt => (
                                        <div key={apt._id} className="doctor-portal-completed-card">
                                            <strong>{apt.student.name}</strong>
                                            <span>{formatDate(apt.appointmentDate)}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="doctor-portal-main">
                        {selectedAppointment ? (
                            <div className="doctor-portal-detail-card">
                                <div className="doctor-portal-detail-head">
                                    <div>
                                        <span className="doctor-portal-section-kicker">Appointment</span>
                                        <h2>{selectedAppointment.student.name}</h2>
                                    </div>
                                    <button
                                        type="button"
                                        className="doctor-portal-close-btn"
                                        onClick={() => {
                                            setSelectedAppointment(null);
                                            resetPrescriptionForm();
                                        }}
                                    >
                                        <X size={18} />
                                    </button>
                                </div>

                                <div className="doctor-portal-detail-grid">
                                    <div className="doctor-portal-info-card">
                                        <span>Email</span>
                                        <strong>{selectedAppointment.student.email}</strong>
                                    </div>
                                    <div className="doctor-portal-info-card">
                                        <span>Date</span>
                                        <strong>{formatDate(selectedAppointment.appointmentDate)}</strong>
                                    </div>
                                    <div className="doctor-portal-info-card">
                                        <span>Time slot</span>
                                        <strong>{selectedAppointment.timeSlot}</strong>
                                    </div>
                                    <div className="doctor-portal-info-card">
                                        <span>Status</span>
                                        <strong>{selectedAppointment.status}</strong>
                                    </div>
                                </div>

                                <div className="doctor-portal-note-block">
                                    <label>Reason</label>
                                    <p>{selectedAppointment.reason}</p>
                                </div>

                                {selectedAppointment.symptoms && (
                                    <div className="doctor-portal-note-block">
                                        <label>Symptoms</label>
                                        <p>{selectedAppointment.symptoms}</p>
                                    </div>
                                )}

                                {selectedAppointment.status === 'Scheduled' && (
                                    <div className="doctor-portal-actions">
                                        <button
                                            type="button"
                                            className="doctor-portal-btn success"
                                            onClick={() => handleAcceptAppointment(selectedAppointment._id)}
                                        >
                                            <Check size={18} />
                                            Accept appointment
                                        </button>
                                        <button
                                            type="button"
                                            className="doctor-portal-btn danger"
                                            onClick={handleRejectAppointment}
                                        >
                                            <X size={18} />
                                            Reject appointment
                                        </button>
                                    </div>
                                )}

                                {selectedAppointment.status === 'Confirmed' && (
                                    <form onSubmit={handleCompleteAppointment} className="doctor-prescription-form">
                                        <div className="doctor-portal-section-head inside-form">
                                            <div>
                                                <span className="doctor-portal-section-kicker">Prescription</span>
                                                <h2>Create prescription</h2>
                                            </div>
                                        </div>

                                        <div className="doctor-field">
                                            <label>Diagnosis</label>
                                            <input
                                                type="text"
                                                value={prescriptionData.diagnosis}
                                                onChange={(e) => setPrescriptionData(prev => ({ ...prev, diagnosis: e.target.value }))}
                                                placeholder="Enter diagnosis"
                                                required
                                            />
                                        </div>

                                        <div className="doctor-prescription-builder">
                                            <div className="doctor-field">
                                                <label>Medicine</label>
                                                <select
                                                    value={newMedicine.pharmaceuticalId}
                                                    onChange={(e) => setNewMedicine(prev => ({ ...prev, pharmaceuticalId: e.target.value }))}
                                                >
                                                    <option value="">Select medicine</option>
                                                    {medicines.map(med => (
                                                        <option key={med._id} value={med._id}>{med.name}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div className="doctor-field">
                                                <label>Dosage</label>
                                                <input
                                                    type="text"
                                                    placeholder="500mg"
                                                    value={newMedicine.dosage}
                                                    onChange={(e) => setNewMedicine(prev => ({ ...prev, dosage: e.target.value }))}
                                                />
                                            </div>

                                            <div className="doctor-field">
                                                <label>Frequency</label>
                                                <select
                                                    value={newMedicine.frequency}
                                                    onChange={(e) => setNewMedicine(prev => ({ ...prev, frequency: e.target.value }))}
                                                >
                                                    <option value="">Select frequency</option>
                                                    <option value="Once daily">Once daily</option>
                                                    <option value="Twice daily">Twice daily</option>
                                                    <option value="Three times daily">Three times daily</option>
                                                    <option value="As needed">As needed</option>
                                                </select>
                                            </div>

                                            <div className="doctor-field">
                                                <label>Duration</label>
                                                <input
                                                    type="text"
                                                    placeholder="7 days"
                                                    value={newMedicine.duration}
                                                    onChange={(e) => setNewMedicine(prev => ({ ...prev, duration: e.target.value }))}
                                                />
                                            </div>

                                            <div className="doctor-field full-width">
                                                <label>Instructions</label>
                                                <input
                                                    type="text"
                                                    placeholder="Optional instructions"
                                                    value={newMedicine.instructions}
                                                    onChange={(e) => setNewMedicine(prev => ({ ...prev, instructions: e.target.value }))}
                                                />
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            className="doctor-portal-btn neutral"
                                            onClick={addMedicineToPrescription}
                                        >
                                            <Pill size={18} />
                                            Add medicine
                                        </button>

                                        {prescriptionData.medicines.length > 0 && (
                                            <div className="doctor-medicine-list">
                                                {prescriptionData.medicines.map((med, idx) => (
                                                    <div key={`${med.pharmaceuticalId}-${idx}`} className="doctor-medicine-item">
                                                        <div>
                                                            <strong>{getMedicineName(med.pharmaceuticalId)}</strong>
                                                            <p>{med.dosage} • {med.frequency} • {med.duration}</p>
                                                            {med.instructions && <p>{med.instructions}</p>}
                                                        </div>
                                                        <button
                                                            type="button"
                                                            className="doctor-remove-btn"
                                                            onClick={() => removeMedicineFromPrescription(idx)}
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        <div className="doctor-field">
                                            <label>Consultation notes</label>
                                            <textarea
                                                value={prescriptionData.notes}
                                                onChange={(e) => setPrescriptionData(prev => ({ ...prev, notes: e.target.value }))}
                                                placeholder="Add notes for the patient"
                                                rows="4"
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            className="doctor-portal-btn primary full-width"
                                            disabled={submitting}
                                        >
                                            <Stethoscope size={18} />
                                            {submitting ? 'Completing appointment...' : 'Complete appointment & create prescription'}
                                        </button>
                                    </form>
                                )}
                            </div>
                        ) : (
                            <div className="doctor-portal-empty-state large">
                                <Stethoscope size={30} />
                                <div>
                                    <strong>Select an appointment</strong>
                                    <p>Choose any appointment from the queue to review details and take action.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default DoctorPortal;
