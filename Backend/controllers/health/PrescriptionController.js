const Prescription = require('../../models/health/PrescriptionModel');
const Doctor = require('../../models/health/DoctorModel');
const User = require('../../models/laundry/UserModels');
const Appointment = require('../../models/health/AppointmentModel');
const Inventory = require('../../models/health/InventoryModel');
const Pharmaceutical = require('../../models/health/PharmaceuticalModel');

const generatePrescriptionId = async () => {
    const count = await Prescription.countDocuments();
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    return `RX-${dateStr}-${String(count + 1).padStart(4, '0')}`;
};

const VALID_PRESCRIPTION_STATUSES = ['ACTIVE', 'PARTIALLY_DISPENSED', 'DISPENSED', 'EXPIRED', 'CANCELLED'];

// Create prescription (DOCTOR)
exports.createPrescription = async (req, res) => {
    try {
        const { studentId, appointmentId, medicines, diagnosis, notes, fileUrl } = req.body;

        // Validate required fields
        if (!studentId || !medicines || !Array.isArray(medicines) || medicines.length === 0 || !diagnosis) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
        }

        // Check if student exists
        const student = await User.findById(studentId);
        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        // Get doctor info
        const doctor = await Doctor.findOne({ user: req.user._id });
        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: 'Doctor profile not found'
            });
        }

        // Validate medicines
        for (let medicine of medicines) {
            if (!medicine.pharmaceuticalId || !medicine.dosage || !medicine.duration || !medicine.frequency) {
                return res.status(400).json({
                    success: false,
                    message: 'Please provide all medicine details'
                });
            }

            const pharm = await Pharmaceutical.findById(medicine.pharmaceuticalId);
            if (!pharm) {
                return res.status(404).json({
                    success: false,
                    message: `Pharmaceutical with ID ${medicine.pharmaceuticalId} not found`
                });
            }
        }

        // Create prescription
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 30); // Valid for 30 days

        const prescription = new Prescription({
            prescriptionId: await generatePrescriptionId(),
            student: studentId,
            studentId,
            doctor: doctor._id,
            appointment: appointmentId,
            medicines: medicines.map(m => ({
                pharmaceutical: m.pharmaceuticalId,
                dosage: m.dosage,
                duration: m.duration,
                instructions: m.instructions,
                frequency: m.frequency
            })),
            diagnosis,
            notes,
            fileUrl,
            expiryDate,
            status: 'ACTIVE'
        });

        await prescription.save();
        await prescription.populate([
            { path: 'student', select: 'name email' },
            { path: 'doctor', select: 'firstName lastName specialization' },
            { path: 'medicines.pharmaceutical' }
        ]);

        // Update appointment with prescription
        if (appointmentId) {
            await Appointment.findByIdAndUpdate(appointmentId, { prescription: prescription._id });
        }

        res.status(201).json({
            success: true,
            message: 'Prescription created successfully',
            data: prescription
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get prescription by ID
exports.getPrescriptionById = async (req, res) => {
    try {
        const prescription = await Prescription.findById(req.params.id)
            .populate('student', 'name email')
            .populate('doctor', 'firstName lastName specialization')
            .populate('medicines.pharmaceutical')
            .populate('appointment');

        if (!prescription) {
            return res.status(404).json({
                success: false,
                message: 'Prescription not found'
            });
        }

        // Check authorization
        if (prescription.student._id.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
            const doctor = await Doctor.findOne({ user: req.user._id });
            if (!doctor || doctor._id.toString() !== prescription.doctor._id.toString()) {
                return res.status(403).json({
                    success: false,
                    message: 'Not authorized to view this prescription'
                });
            }
        }

        res.status(200).json({
            success: true,
            data: prescription
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get student prescriptions
exports.getStudentPrescriptions = async (req, res) => {
    try {
        const { status } = req.query;
        const studentId = req.user._id;

        let filter = { student: studentId };
        if (status) {
            filter.status = status;
        }

        const prescriptions = await Prescription.find(filter)
            .populate('doctor', 'firstName lastName specialization')
            .populate('medicines.pharmaceutical')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: prescriptions.length,
            data: prescriptions
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Search prescriptions by student ID (PHARMACY)
exports.searchPrescriptionByStudentId = async (req, res) => {
    try {
        const { studentId } = req.query;

        if (!studentId) {
            return res.status(400).json({
                success: false,
                message: 'Please provide student ID'
            });
        }

        const prescriptions = await Prescription.find({
            studentId: studentId,
            status: { $in: ['ACTIVE', 'PARTIALLY_DISPENSED'] }
        })
            .populate('student', 'name email')
            .populate('doctor', 'firstName lastName')
            .populate('medicines.pharmaceutical')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: prescriptions.length,
            data: prescriptions
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Dispense medicine from prescription (PHARMACY)
exports.dispenseMedicine = async (req, res) => {
    try {
        const { medicineId, quantityDispensed } = req.body;

        if (!medicineId || !quantityDispensed || quantityDispensed <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Please provide valid medicine ID and quantity'
            });
        }

        const prescription = await Prescription.findById(req.params.id);
        if (!prescription) {
            return res.status(404).json({
                success: false,
                message: 'Prescription not found'
            });
        }

        // Find medicine in prescription
        const medicineIndex = prescription.medicines.findIndex(m => m._id.toString() === medicineId);
        if (medicineIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Medicine not found in this prescription'
            });
        }

        const medicine = prescription.medicines[medicineIndex];
        const pharmaceutical = await Pharmaceutical.findById(medicine.pharmaceutical);

        if (!pharmaceutical) {
            return res.status(404).json({
                success: false,
                message: 'Pharmaceutical item not found'
            });
        }

        // Check stock
        if (pharmaceutical.stockQuantity < quantityDispensed) {
            return res.status(400).json({
                success: false,
                message: `Insufficient stock. Available: ${pharmaceutical.stockQuantity}`
            });
        }

        // Add dispensed item record
        prescription.dispensedItems.push({
            pharmaceutical: medicine.pharmaceutical,
            quantityDispensed,
            dispensedDate: new Date(),
            dispensedBy: req.user._id
        });

        // Update status if all medicines are dispensed
        const allDispensed = prescription.medicines.every((m, index) => {
            return prescription.dispensedItems.some(d => 
                d.pharmaceutical.toString() === m.pharmaceutical.toString()
            );
        });

        if (allDispensed) {
            prescription.status = 'DISPENSED';
        } else {
            prescription.status = 'PARTIALLY_DISPENSED';
        }

        await prescription.save();

        // Update pharmaceutical stock
        pharmaceutical.stockQuantity -= quantityDispensed;
        await pharmaceutical.save();

        // Update inventory
        const inventory = await Inventory.findOne({ pharmaceutical: medicine.pharmaceutical });
        if (inventory) {
            inventory.currentStock = pharmaceutical.stockQuantity;
            inventory.transactions.push({
                type: 'Dispensed',
                quantity: -quantityDispensed,
                reason: `Dispensed from prescription ${prescription.prescriptionId}`,
                reference: prescription.prescriptionId,
                performedBy: req.user._id
            });
            await inventory.save();
        }

        await prescription.populate([
            { path: 'student', select: 'name email' },
            { path: 'medicines.pharmaceutical' }
        ]);

        res.status(200).json({
            success: true,
            message: 'Medicine dispensed successfully',
            data: prescription
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Update prescription status (PHARMACY/ADMIN)
exports.updatePrescriptionStatus = async (req, res) => {
    try {
        const { status } = req.body;

        if (!VALID_PRESCRIPTION_STATUSES.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid prescription status'
            });
        }

        const prescription = await Prescription.findById(req.params.id)
            .populate('student', 'name email')
            .populate('doctor', 'firstName lastName')
            .populate('medicines.pharmaceutical');

        if (!prescription) {
            return res.status(404).json({
                success: false,
                message: 'Prescription not found'
            });
        }

        prescription.status = status;

        if (status === 'EXPIRED' && !prescription.expiryDate) {
            prescription.expiryDate = new Date();
        }

        await prescription.save();

        res.status(200).json({
            success: true,
            message: 'Prescription status updated successfully',
            data: prescription
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get all prescriptions (ADMIN)
exports.getAllPrescriptions = async (req, res) => {
    try {
        const { status, student, startDate, endDate } = req.query;
        let filter = {};

        if (status) filter.status = status;
        if (student) filter.student = student;

        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate) filter.createdAt.$gte = new Date(startDate);
            if (endDate) filter.createdAt.$lte = new Date(endDate);
        }

        const prescriptions = await Prescription.find(filter)
            .populate('student', 'name email')
            .populate('doctor', 'firstName lastName')
            .populate('medicines.pharmaceutical')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: prescriptions.length,
            data: prescriptions
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Download prescription as PDF (mock function - would integrate with pdf library)
exports.downloadPrescriptionPDF = async (req, res) => {
    try {
        const prescription = await Prescription.findById(req.params.id)
            .populate('student', 'name email')
            .populate('doctor', 'firstName lastName specialization')
            .populate('medicines.pharmaceutical');

        if (!prescription) {
            return res.status(404).json({
                success: false,
                message: 'Prescription not found'
            });
        }

        // Check authorization
        if (prescription.student._id.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to download this prescription'
            });
        }

        // In a real application, you would generate a PDF here
        // For now, return the data in JSON format that can be used by frontend to generate PDF
        res.status(200).json({
            success: true,
            data: prescription,
            message: 'Use this data to generate PDF on frontend'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
