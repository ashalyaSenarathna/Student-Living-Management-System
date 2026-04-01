const Doctor = require('../../models/health/DoctorModel');
const User = require('../../models/laundry/UserModels');

// Create doctor profile
exports.createDoctorProfile = async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            specialization,
            qualifications,
            registrationNumber,
            licenseNumber,
            experience,
            phone,
            officeLocation,
            bio,
            availability,
            consultationFee
        } = req.body;

        // Validate required fields
        if (!firstName || !lastName || !specialization || !registrationNumber || !licenseNumber || !phone || !officeLocation) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
        }

        // Validate phone format
        const phoneRegex = /^\+?[0-9]{10,15}$/;
        if (!phoneRegex.test(phone)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid phone number format'
            });
        }

        // Check if doctor profile already exists
        const existingDoctor = await Doctor.findOne({ user: req.user._id });
        if (existingDoctor) {
            return res.status(400).json({
                success: false,
                message: 'Doctor profile already exists for this user'
            });
        }

        // Check if registration number already exists
        const regExists = await Doctor.findOne({ registrationNumber });
        if (regExists) {
            return res.status(400).json({
                success: false,
                message: 'Registration number already in use'
            });
        }

        // Create doctor profile
        const doctor = new Doctor({
            user: req.user._id,
            firstName,
            lastName,
            specialization,
            qualifications,
            registrationNumber,
            licenseNumber,
            experience,
            phone,
            officeLocation,
            bio,
            availability: availability || [],
            consultationFee: consultationFee || 0,
            status: 'Pending'
        });

        await doctor.save();

        // Update user role
        await User.findByIdAndUpdate(req.user._id, { role: 'DOCTOR' });

        await doctor.populate('user', 'name email');

        res.status(201).json({
            success: true,
            message: 'Doctor profile created. Pending admin approval.',
            data: doctor
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get doctor profile
exports.getDoctorProfile = async (req, res) => {
    try {
        const doctor = await Doctor.findById(req.params.id)
            .populate('user', 'name email');

        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: 'Doctor not found'
            });
        }

        res.status(200).json({
            success: true,
            data: doctor
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get my doctor profile
exports.getMyDoctorProfile = async (req, res) => {
    try {
        const doctor = await Doctor.findOne({ user: req.user._id })
            .populate('user', 'name email');

        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: 'Doctor profile not found'
            });
        }

        res.status(200).json({
            success: true,
            data: doctor
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Update doctor profile
exports.updateDoctorProfile = async (req, res) => {
    try {
        let doctor = await Doctor.findOne({ user: req.user._id });

        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: 'Doctor profile not found'
            });
        }

        // Validate phone if being updated
        if (req.body.phone) {
            const phoneRegex = /^\+?[0-9]{10,15}$/;
            if (!phoneRegex.test(req.body.phone)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid phone number format'
                });
            }
        }

        // Don't allow certain fields to be updated
        delete req.body.user;
        delete req.body.status;
        delete req.body.registrationNumber;
        
        doctor = await Doctor.findByIdAndUpdate(
            doctor._id,
            req.body,
            { new: true, runValidators: true }
        ).populate('user', 'name email');

        res.status(200).json({
            success: true,
            message: 'Doctor profile updated successfully',
            data: doctor
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get all doctors
exports.getAllDoctors = async (req, res) => {
    try {
        const { specialization, status, search } = req.query;
        let filter = { status: 'Approved' };

        if (specialization) filter.specialization = specialization;
        if (status) filter.status = status;

        if (search) {
            filter.$or = [
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } },
                { specialization: { $regex: search, $options: 'i' } }
            ];
        }

        const doctors = await Doctor.find(filter)
            .populate('user', 'name email')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: doctors.length,
            data: doctors
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get pending doctor applications (ADMIN)
exports.getPendingDoctors = async (req, res) => {
    try {
        const doctors = await Doctor.find({ status: 'Pending' })
            .populate('user', 'name email')
            .sort({ createdAt: 1 });

        res.status(200).json({
            success: true,
            count: doctors.length,
            data: doctors
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Approve doctor (ADMIN)
exports.approveDoctorApplication = async (req, res) => {
    try {
        const doctor = await Doctor.findById(req.params.id);

        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: 'Doctor not found'
            });
        }

        doctor.status = 'Approved';
        await doctor.save();

        res.status(200).json({
            success: true,
            message: 'Doctor application approved',
            data: doctor
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Reject doctor (ADMIN)
exports.rejectDoctorApplication = async (req, res) => {
    try {
        const { reason } = req.body;

        if (!reason) {
            return res.status(400).json({
                success: false,
                message: 'Please provide rejection reason'
            });
        }

        const doctor = await Doctor.findById(req.params.id);

        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: 'Doctor not found'
            });
        }

        doctor.status = 'Rejected';
        await doctor.save();

        res.status(200).json({
            success: true,
            message: 'Doctor application rejected',
            data: doctor
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Update doctor availability
exports.setDoctorAvailability = async (req, res) => {
    try {
        const { availability } = req.body;

        if (!availability || !Array.isArray(availability)) {
            return res.status(400).json({
                success: false,
                message: 'Please provide valid availability'
            });
        }

        const doctor = await Doctor.findOne({ user: req.user._id });

        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: 'Doctor profile not found'
            });
        }

        doctor.availability = availability;
        await doctor.save();

        res.status(200).json({
            success: true,
            message: 'Availability updated successfully',
            data: doctor
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Toggle doctor availability status
exports.toggleDoctorAvailability = async (req, res) => {
    try {
        const doctor = await Doctor.findOne({ user: req.user._id });

        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: 'Doctor profile not found'
            });
        }

        doctor.isAvailable = !doctor.isAvailable;
        await doctor.save();

        res.status(200).json({
            success: true,
            message: `Availability status updated to ${doctor.isAvailable ? 'Available' : 'Not Available'}`,
            data: doctor
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
