import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { AlertCircle, Download, FileText, Pill, Stethoscope, X } from 'lucide-react';
import './PrescriptionPanel.css';

const formatDate = (value) => {
    if (!value) return '--';
    return new Date(value).toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};

const getStatusClass = (status = '') => status.toLowerCase().replace(/\s+/g, '_');

const pdfEscape = (value = '') => String(value)
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
    .replace(/[^\x20-\x7E]/g, '?');

const splitPdfText = (text = '', maxLength = 86) => {
    const words = String(text || '').split(/\s+/).filter(Boolean);
    const lines = [];
    let currentLine = '';

    words.forEach(word => {
        const candidate = currentLine ? `${currentLine} ${word}` : word;
        if (candidate.length > maxLength) {
            if (currentLine) {
                lines.push(currentLine);
            }
            currentLine = word;
        } else {
            currentLine = candidate;
        }
    });

    if (currentLine) {
        lines.push(currentLine);
    }

    return lines.length ? lines : [''];
};

const buildSimplePdfBlob = (title, sections, footerText) => {
    const pageWidth = 595;
    const pageHeight = 842;
    const left = 48;
    const top = 680;
    const lineHeight = 18;
    const bottomMargin = 84;
    const pages = [];
    let currentLines = [];
    let cursorY = top;

    const pushLine = (text, font = 'F1', size = 11) => {
        if (cursorY < bottomMargin) {
            pages.push(currentLines);
            currentLines = [];
            cursorY = top;
        }

        currentLines.push({ text, x: left, y: cursorY, font, size });
        cursorY -= lineHeight;
    };

    sections.forEach(section => {
        if (section.heading) {
            pushLine(section.heading, 'F2', 14);
        }

        section.lines.forEach(line => pushLine(line, 'F1', 11));
        pushLine('');
    });

    if (currentLines.length) {
        pages.push(currentLines);
    }

    const pageCount = pages.length || 1;
    const pdfObjects = new Map();
    pdfObjects.set(1, '<< /Type /Catalog /Pages 2 0 R >>');
    pdfObjects.set(2, `<< /Type /Pages /Count ${pageCount} /Kids [${Array.from({ length: pageCount }, (_, index) => `${5 + index * 2} 0 R`).join(' ')}] >>`);
    pdfObjects.set(3, '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');
    pdfObjects.set(4, '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>');

    pages.forEach((lines, index) => {
        const contentObjectId = 6 + index * 2;
        const pageObjectId = 5 + index * 2;
        const headerBottom = pageHeight - 138;
        const contentLines = [
            '0.07 0.24 0.44 rg',
            `0 ${pageHeight - 120} ${pageWidth} 120 re f`,
            '0.94 0.97 1 rg',
            `${left} ${pageHeight - 82} 180 2 re f`,
            '0.13 0.16 0.22 rg',
            `40 ${headerBottom} ${pageWidth - 80} 1 re f`,
            'BT',
            '1 1 1 rg',
            `/F2 24 Tf 1 0 0 1 ${left} ${pageHeight - 54} Tm (${pdfEscape(title)}) Tj`,
            `/F1 11 Tf 1 0 0 1 ${left} ${pageHeight - 78} Tm (${pdfEscape('Student Living Medical Center')}) Tj`,
            '0.25 0.29 0.35 rg',
            `/F1 10 Tf 1 0 0 1 ${left} 26 Tm (${pdfEscape(footerText)}) Tj`,
            `/F1 10 Tf 1 0 0 1 ${pageWidth - 112} 26 Tm (${pdfEscape(`Page ${index + 1} of ${pageCount}`)}) Tj`,
            '0.1 0.13 0.19 rg'
        ];

        lines.forEach(line => {
            contentLines.push(`/${line.font} ${line.size} Tf 1 0 0 1 ${line.x} ${line.y} Tm (${pdfEscape(line.text)}) Tj`);
        });
        contentLines.push('ET');

        const stream = contentLines.join('\n');
        pdfObjects.set(contentObjectId, `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`);
        pdfObjects.set(pageObjectId, `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${contentObjectId} 0 R >>`);
    });

    let buffer = '%PDF-1.4\n';
    const offsets = [0];

    Array.from(pdfObjects.keys()).sort((a, b) => a - b).forEach(objectId => {
        offsets[objectId] = buffer.length;
        buffer += `${objectId} 0 obj\n${pdfObjects.get(objectId)}\nendobj\n`;
    });

    const xrefOffset = buffer.length;
    buffer += `xref\n0 ${pdfObjects.size + 1}\n0000000000 65535 f \n`;
    for (let objectId = 1; objectId <= pdfObjects.size; objectId += 1) {
        buffer += `${String(offsets[objectId]).padStart(10, '0')} 00000 n \n`;
    }
    buffer += `trailer\n<< /Size ${pdfObjects.size + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

    return new Blob([buffer], { type: 'application/pdf' });
};

const PrescriptionPanel = () => {
    const [prescriptions, setPrescriptions] = useState([]);
    const [selectedPrescription, setSelectedPrescription] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState('active');

    const API_URL = 'http://localhost:5000/api/health';
    const token = JSON.parse(localStorage.getItem('userInfo') || '{}')?.token || '';

    useEffect(() => {
        fetchPrescriptions();
    }, []);

    const fetchPrescriptions = async () => {
        try {
            setError('');
            const response = await axios.get(`${API_URL}/prescriptions/my-prescriptions`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const prescriptionData = Array.isArray(response.data?.data) ? response.data.data : [];
            setPrescriptions(prescriptionData);
            setSelectedPrescription(prescriptionData[0] || null);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load prescriptions.');
        } finally {
            setLoading(false);
        }
    };

    const downloadAsPdf = (prescription) => {
        const sections = [
            {
                heading: 'Prescription Summary',
                lines: [
                    `Prescription ID: ${prescription.prescriptionId}`,
                    `Issued Date: ${formatDate(prescription.createdAt)}`,
                    `Valid Until: ${formatDate(prescription.expiryDate)}`,
                    `Status: ${prescription.status}`,
                    `Patient: ${prescription.student?.name || 'N/A'}`,
                    `Doctor: Dr. ${prescription.doctor?.firstName || ''} ${prescription.doctor?.lastName || ''}`,
                    `Specialization: ${prescription.doctor?.specialization || 'Medical practitioner'}`
                ]
            },
            {
                heading: 'Diagnosis',
                lines: splitPdfText(prescription.diagnosis || 'Not specified')
            },
            {
                heading: 'Medicines',
                lines: (prescription.medicines || []).flatMap((med, index) => ([
                    `${index + 1}. ${med.pharmaceutical?.name || 'Unknown medicine'}`,
                    `   Dosage: ${med.dosage}`,
                    `   Frequency: ${med.frequency}`,
                    `   Duration: ${med.duration}`,
                    ...splitPdfText(`   Instructions: ${med.instructions || 'None'}`)
                ]))
            },
            {
                heading: 'Doctor Notes',
                lines: splitPdfText(prescription.notes || 'No additional notes')
            }
        ];

        const blob = buildSimplePdfBlob(
            `Prescription ${prescription.prescriptionId}`,
            sections,
            'Student Living Management System • Medical Prescription Record'
        );

        const url = URL.createObjectURL(blob);
        const element = document.createElement('a');
        element.href = url;
        element.download = 'prescription.pdf';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
        URL.revokeObjectURL(url);
    };

    const filteredPrescriptions = useMemo(() => {
        switch (filter) {
            case 'active':
                return prescriptions.filter(p => p.status === 'ACTIVE');
            case 'dispensed':
                return prescriptions.filter(p => ['DISPENSED', 'PARTIALLY_DISPENSED'].includes(p.status));
            case 'expired':
                return prescriptions.filter(p => p.status === 'EXPIRED');
            default:
                return prescriptions;
        }
    }, [prescriptions, filter]);

    useEffect(() => {
        if (!filteredPrescriptions.length) {
            setSelectedPrescription(null);
            return;
        }

        setSelectedPrescription(prev => (
            prev && filteredPrescriptions.some(item => item._id === prev._id)
                ? prev
                : filteredPrescriptions[0]
        ));
    }, [filteredPrescriptions]);

    if (loading) {
        return (
            <div className="prescription-page">
                <div className="prescription-shell prescription-loading-state">
                    <div className="prescription-spinner" />
                    <p>Loading prescriptions...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="prescription-page">
            <div className="prescription-shell">
                <section className="prescription-hero">
                    <div className="prescription-hero-copy">
                        <span className="prescription-eyebrow">Medical Records</span>
                        <h1>My prescriptions</h1>
                        <p>
                            Review active prescriptions, see dispensed medicines, and keep a clean exportable
                            record of your treatment plan.
                        </p>
                    </div>

                    <div className="prescription-hero-stats">
                        <div className="prescription-stat-card">
                            <span>Total prescriptions</span>
                            <strong>{prescriptions.length}</strong>
                        </div>
                        <div className="prescription-stat-card">
                            <span>Active now</span>
                            <strong>{prescriptions.filter(p => p.status === 'ACTIVE').length}</strong>
                        </div>
                    </div>
                </section>

                {error && (
                    <div className="prescription-alert prescription-alert-error">
                        <AlertCircle size={18} />
                        <span>{error}</span>
                    </div>
                )}

                <section className="prescription-filter-bar">
                    {[
                        ['all', `All (${prescriptions.length})`],
                        ['active', 'Active'],
                        ['dispensed', 'Dispensed'],
                        ['expired', 'Expired']
                    ].map(([value, label]) => (
                        <button
                            key={value}
                            type="button"
                            className={`prescription-filter-pill ${filter === value ? 'active' : ''}`}
                            onClick={() => setFilter(value)}
                        >
                            {label}
                        </button>
                    ))}
                </section>

                <section className="prescription-layout-card">
                    <div className="prescription-master-list">
                        {filteredPrescriptions.length === 0 ? (
                            <div className="prescription-empty-state">
                                <FileText size={28} />
                                <div>
                                    <strong>No prescriptions found</strong>
                                    <p>There are no prescriptions in the current filter.</p>
                                </div>
                            </div>
                        ) : (
                            filteredPrescriptions.map(prescription => (
                                <button
                                    key={prescription._id}
                                    type="button"
                                    className={`prescription-summary-card ${selectedPrescription?._id === prescription._id ? 'selected' : ''}`}
                                    onClick={() => setSelectedPrescription(prescription)}
                                >
                                    <div className="prescription-summary-head">
                                        <div>
                                            <h3>Dr. {prescription.doctor?.firstName} {prescription.doctor?.lastName}</h3>
                                            <span>{prescription.doctor?.specialization || 'Medical practitioner'}</span>
                                        </div>
                                        <span className={`prescription-status-pill ${getStatusClass(prescription.status)}`}>
                                            {prescription.status}
                                        </span>
                                    </div>

                                    <div className="prescription-summary-meta">
                                        <span>{prescription.prescriptionId}</span>
                                        <span>{formatDate(prescription.createdAt)}</span>
                                    </div>

                                    <p>{prescription.diagnosis}</p>
                                </button>
                            ))
                        )}
                    </div>

                    <div className="prescription-detail-panel">
                        {selectedPrescription ? (
                            <>
                                <div className="prescription-detail-header">
                                    <div>
                                        <span className="prescription-section-kicker">Details</span>
                                        <h2>{selectedPrescription.prescriptionId}</h2>
                                    </div>
                                    <button
                                        type="button"
                                        className="prescription-detail-close"
                                        onClick={() => setSelectedPrescription(null)}
                                        aria-label="Close prescription details"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>

                                <div className="prescription-detail-grid">
                                    <div className="prescription-detail-card">
                                        <span><Stethoscope size={15} /> Doctor</span>
                                        <strong>Dr. {selectedPrescription.doctor?.firstName} {selectedPrescription.doctor?.lastName}</strong>
                                    </div>
                                    <div className="prescription-detail-card">
                                        <span><FileText size={15} /> Status</span>
                                        <strong>{selectedPrescription.status}</strong>
                                    </div>
                                    <div className="prescription-detail-card">
                                        <span>Date issued</span>
                                        <strong>{formatDate(selectedPrescription.createdAt)}</strong>
                                    </div>
                                    <div className="prescription-detail-card">
                                        <span>Valid until</span>
                                        <strong>{formatDate(selectedPrescription.expiryDate)}</strong>
                                    </div>
                                </div>

                                <div className="prescription-note-block">
                                    <label>Diagnosis</label>
                                    <p>{selectedPrescription.diagnosis}</p>
                                </div>

                                <div className="prescription-note-block">
                                    <label>Medicines</label>
                                    <div className="prescription-medicine-list">
                                        {(selectedPrescription.medicines || []).map((medicine, idx) => (
                                            <div key={`${selectedPrescription._id}-${idx}`} className="prescription-medicine-item">
                                                <div className="medicine-item-title">
                                                    <Pill size={16} />
                                                    <strong>{medicine.pharmaceutical?.name || 'Unknown medicine'}</strong>
                                                </div>
                                                <div className="medicine-item-grid">
                                                    <span>Dosage: {medicine.dosage}</span>
                                                    <span>Frequency: {medicine.frequency}</span>
                                                    <span>Duration: {medicine.duration}</span>
                                                </div>
                                                {medicine.instructions && <p>{medicine.instructions}</p>}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {selectedPrescription.notes && (
                                    <div className="prescription-note-block info">
                                        <label>Doctor notes</label>
                                        <p>{selectedPrescription.notes}</p>
                                    </div>
                                )}

                                {(selectedPrescription.dispensedItems || []).length > 0 && (
                                    <div className="prescription-note-block success">
                                        <label>Dispensed items</label>
                                        <div className="dispensed-items-list">
                                            {selectedPrescription.dispensedItems.map((item, idx) => (
                                                <div key={`${selectedPrescription._id}-dispensed-${idx}`} className="dispensed-item-card">
                                                    <strong>{item.pharmaceutical?.name || 'Medicine dispensed'}</strong>
                                                    <span>{item.quantityDispensed} units</span>
                                                    <span>{formatDate(item.dispensedDate)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <button
                                    type="button"
                                    className="prescription-download-btn"
                                    onClick={() => downloadAsPdf(selectedPrescription)}
                                >
                                    <Download size={18} />
                                    Download PDF
                                </button>
                            </>
                        ) : (
                            <div className="prescription-empty-state detail-empty">
                                <FileText size={28} />
                                <div>
                                    <strong>Select a prescription</strong>
                                    <p>Choose any prescription from the list to see full details here.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default PrescriptionPanel;
