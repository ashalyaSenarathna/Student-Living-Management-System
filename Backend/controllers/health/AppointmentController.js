const Appointment = require('../../models/health/AppointmentModel');
const Doctor = require('../../models/health/DoctorModel');

const generateAppointmentId = async () => {
    const count = await Appointment.countDocuments();
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    return `APT-${dateStr}-${String(count + 1).padStart(4, '0')}`;
};

const parseDateOnly = (dateString) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(dateString || ''))) {
        return null;
    }

    const [year, month, day] = dateString.split('-').map(Number);
    const parsedDate = new Date(year, month - 1, day);
    parsedDate.setHours(0, 0, 0, 0);
    return parsedDate;
};

const buildDailySlots = (appointmentDate) => {
    const slots = [];
    const startHour = 9;
    const startMin = 0;
    const endHour = 22;
    const endMin = 0;
    const slotDuration = 30;

    let currentTime = new Date(appointmentDate);
    currentTime.setHours(startHour, startMin, 0, 0);

    const endTime = new Date(appointmentDate);
    endTime.setHours(endHour, endMin, 0, 0);

    while (currentTime < endTime) {
        const nextTime = new Date(currentTime);
        nextTime.setMinutes(nextTime.getMinutes() + slotDuration);

        const startStr = `${String(currentTime.getHours()).padStart(2, '0')}:${String(currentTime.getMinutes()).padStart(2, '0')}`;
        const endStr = `${String(nextTime.getHours()).padStart(2, '0')}:${String(nextTime.getMinutes()).padStart(2, '0')}`;
        slots.push(`${startStr}-${endStr}`);
        currentTime = nextTime;
    }

    return slots;
};

// Create appointment
exports.createAppointment = async (req, res) => {
    try {
        const { doctorId, appointmentDate, timeSlot, reason, symptoms } = req.body;
        const studentId = req.user._id;
        const trimmedReason = String(reason || '').trim();
        const trimmedSymptoms = String(symptoms || '').trim();

        // Validate required fields
        if (!doctorId || !appointmentDate || !timeSlot || !trimmedReason) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
        }

        if (trimmedReason.length < 10 || trimmedReason.length > 160) {
            return res.status(400).json({
                success: false,
                message: 'Reason must be between 10 and 160 characters'
            });
        }

        if (trimmedSymptoms.length > 500) {
            return res.status(400).json({
                success: false,
                message: 'Symptoms must be 500 characters or less'
            });
        }

        // Check if doctor exists and is available
        const doctor = await Doctor.findById(doctorId).populate('user');
        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: 'Doctor not found'
            });
        }

        if (doctor.status !== 'Approved') {
            return res.status(400).json({
                success: false,
                message: 'Doctor is not available for appointments'
            });
        }

        if (!doctor.isAvailable) {
            return res.status(400).json({
                success: false,
                message: 'Doctor is currently unavailable'
            });
        }

        // Check for time slot validity
        const timeRegex = /^(\d{2}):(\d{2})-(\d{2}):(\d{2})$/;
        if (!timeRegex.test(timeSlot)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid time slot format (use HH:MM-HH:MM)'
            });
        }

        // Check for double booking
        const appointmentDate_obj = parseDateOnly(appointmentDate);
        if (!appointmentDate_obj || Number.isNaN(appointmentDate_obj.getTime())) {
            return res.status(400).json({
                success: false,
                message: 'Invalid appointment date format'
            });
        }

        const tomorrow = new Date();
        tomorrow.setHours(0, 0, 0, 0);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const maxDate = new Date(tomorrow);
        maxDate.setDate(maxDate.getDate() + 29);

        if (appointmentDate_obj < tomorrow || appointmentDate_obj > maxDate) {
            return res.status(400).json({
                success: false,
                message: 'Appointments can only be booked from tomorrow up to 30 days ahead'
            });
        }

        const allowedSlots = buildDailySlots(appointmentDate_obj);
        if (!allowedSlots.includes(timeSlot)) {
            return res.status(400).json({
                success: false,
                message: 'Selected time slot is outside the supported booking window'
            });
        }
        
        const nextDay = new Date(appointmentDate_obj);
        nextDay.setDate(nextDay.getDate() + 1);

        const existingAppointment = await Appointment.findOne({
            doctor: doctorId,
            appointmentDate: {
                $gte: appointmentDate_obj,
                $lt: nextDay
            },
            timeSlot: timeSlot,
            status: { $ne: 'Cancelled' }
        });

        if (existingAppointment) {
            return res.status(400).json({
                success: false,
                message: 'This time slot is already booked'
            });
        }

        // Create appointment
        const appointment = new Appointment({
            appointmentId: await generateAppointmentId(),
            student: studentId,
            doctor: doctorId,
            appointmentDate: appointmentDate_obj,
            timeSlot,
            reason: trimmedReason,
            symptoms: trimmedSymptoms
        });

        await appointment.save();
        await appointment.populate([
            { path: 'student', select: 'name email' },
            { path: 'doctor', select: 'firstName lastName specialization' }
        ]);

        res.status(201).json({
            success: true,
            message: 'Appointment created successfully',
            data: appointment
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.getDoctorAvailabilityCalendar = async (req, res) => {
    try {
        const { doctorId, days = 30 } = req.query;

        if (!doctorId) {
            return res.status(400).json({
                success: false,
                message: 'Please provide doctorId'
            });
        }

        const doctor = await Doctor.findById(doctorId);
        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: 'Doctor not found'
            });
        }

        const totalDays = Math.min(Math.max(Number(days) || 30, 1), 60);
        const calendar = [];

        for (let index = 0; index < totalDays; index += 1) {
            const date = new Date();
            date.setHours(0, 0, 0, 0);
            date.setDate(date.getDate() + index + 1);

            const allSlots = buildDailySlots(date);
            const nextDay = new Date(date);
            nextDay.setDate(nextDay.getDate() + 1);

            const bookedAppointments = await Appointment.find({
                doctor: doctorId,
                appointmentDate: { $gte: date, $lt: nextDay },
                status: { $nin: ['Cancelled', 'Rejected'] }
            }).select('timeSlot');

            const bookedSlotSet = new Set(bookedAppointments.map(item => item.timeSlot));
            const availableCount = allSlots.filter(slot => !bookedSlotSet.has(slot)).length;

            calendar.push({
                date: date.toISOString().split('T')[0],
                isAvailable: availableCount > 0,
                availableCount,
                totalSlots: allSlots.length
            });
        }

        res.status(200).json({
            success: true,
            data: calendar
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get student appointments
exports.getStudentAppointments = async (req, res) => {
    try {
        const { status } = req.query;
        const studentId = req.user._id;

        let filter = { student: studentId };
        if (status) {
            filter.status = status;
        }

        const appointments = await Appointment.find(filter)
            .populate('doctor', 'firstName lastName specialization')
            .populate('student', 'name email')
            .populate('prescription')
            .sort({ appointmentDate: -1 });

        res.status(200).json({
            success: true,
            count: appointments.length,
            data: appointments
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get doctor appointments
exports.getDoctorAppointments = async (req, res) => {
    try {
        const { status, date } = req.query;
        
        // Find doctor by user ID
        const doctor = await Doctor.findOne({ user: req.user._id });
        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: 'Doctor profile not found'
            });
        }

        let filter = { doctor: doctor._id };
        if (status) {
            filter.status = status;
        }

        if (date) {
            const startDate = new Date(date);
            startDate.setHours(0, 0, 0, 0);
            const endDate = new Date(date);
            endDate.setHours(23, 59, 59, 999);
            filter.appointmentDate = { $gte: startDate, $lte: endDate };
        }

        const appointments = await Appointment.find(filter)
            .populate('student', 'name email')
            .populate('doctor', 'firstName lastName')
            .sort({ appointmentDate: 1 });

        res.status(200).json({
            success: true,
            count: appointments.length,
            data: appointments
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get appointment details
exports.getAppointmentById = async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id)
            .populate('student', 'name email')
            .populate('doctor', 'firstName lastName specialization phone')
            .populate('prescription');

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: 'Appointment not found'
            });
        }

        // Check authorization
        const doctor = await Doctor.findOne({ user: req.user._id });
        if (appointment.student.toString() !== req.user._id.toString() && 
            (!doctor || doctor._id.toString() !== appointment.doctor.toString()) &&
            req.user.role !== 'ADMIN') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view this appointment'
            });
        }

        res.status(200).json({
            success: true,
            data: appointment
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Accept appointment (DOCTOR)
exports.acceptAppointment = async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id);
        
        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: 'Appointment not found'
            });
        }

        // Verify doctor
        const doctor = await Doctor.findOne({ user: req.user._id });
        if (!doctor || doctor._id.toString() !== appointment.doctor.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to accept this appointment'
            });
        }

        if (appointment.status !== 'Scheduled') {
            return res.status(400).json({
                success: false,
                message: `Cannot accept appointment with status: ${appointment.status}`
            });
        }

        appointment.status = 'Confirmed';
        await appointment.save();

        res.status(200).json({
            success: true,
            message: 'Appointment accepted successfully',
            data: appointment
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Reject appointment (DOCTOR)
exports.rejectAppointment = async (req, res) => {
    try {
        const { reason } = req.body;

        if (!reason) {
            return res.status(400).json({
                success: false,
                message: 'Please provide rejection reason'
            });
        }

        const appointment = await Appointment.findById(req.params.id);
        
        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: 'Appointment not found'
            });
        }

        // Verify doctor
        const doctor = await Doctor.findOne({ user: req.user._id });
        if (!doctor || doctor._id.toString() !== appointment.doctor.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to reject this appointment'
            });
        }

        appointment.status = 'Rejected';
        appointment.doctorRejectionReason = reason;
        await appointment.save();

        res.status(200).json({
            success: true,
            message: 'Appointment rejected successfully',
            data: appointment
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Complete appointment (DOCTOR)
exports.completeAppointment = async (req, res) => {
    try {
        const { consultationNotes, doctorNotes } = req.body;

        const appointment = await Appointment.findById(req.params.id);
        
        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: 'Appointment not found'
            });
        }

        // Verify doctor
        const doctor = await Doctor.findOne({ user: req.user._id });
        if (!doctor || doctor._id.toString() !== appointment.doctor.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to complete this appointment'
            });
        }

        if (appointment.status !== 'Confirmed') {
            return res.status(400).json({
                success: false,
                message: `Cannot complete appointment with status: ${appointment.status}`
            });
        }

        appointment.status = 'Completed';
        appointment.completedAt = new Date();
        appointment.consultationNotes = consultationNotes;
        appointment.doctorNotes = doctorNotes;
        await appointment.save();

        // Update doctor stats
        doctor.completedAppointments = (doctor.completedAppointments || 0) + 1;
        await doctor.save();

        res.status(200).json({
            success: true,
            message: 'Appointment completed successfully',
            data: appointment
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Cancel appointment
exports.cancelAppointment = async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id);
        
        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: 'Appointment not found'
            });
        }

        // Check authorization
        const doctor = await Doctor.findOne({ user: req.user._id });
        if (appointment.student.toString() !== req.user._id.toString() && 
            (!doctor || doctor._id.toString() !== appointment.doctor.toString()) &&
            req.user.role !== 'ADMIN') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to cancel this appointment'
            });
        }

        if (!['Scheduled', 'Confirmed'].includes(appointment.status)) {
            return res.status(400).json({
                success: false,
                message: `Cannot cancel appointment with status: ${appointment.status}`
            });
        }

        appointment.status = 'Cancelled';
        await appointment.save();

        res.status(200).json({
            success: true,
            message: 'Appointment cancelled successfully',
            data: appointment
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get doctor availability slots
exports.getDoctorSlots = async (req, res) => {
    try {
        const { doctorId, date } = req.query;

        if (!doctorId || !date) {
            return res.status(400).json({
                success: false,
                message: 'Please provide doctorId and date'
            });
        }

        const doctor = await Doctor.findById(doctorId);
        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: 'Doctor not found'
            });
        }

        const appointmentDate = parseDateOnly(date);
        if (!appointmentDate || Number.isNaN(appointmentDate.getTime())) {
            return res.status(400).json({
                success: false,
                message: 'Invalid date format'
            });
        }
        // Generate fixed daily time slots from 9 AM to 10 PM
        const slots = [];
        for (const timeSlot of buildDailySlots(appointmentDate)) {
            // Check if slot is booked
            const booked = await Appointment.findOne({
                doctor: doctorId,
                appointmentDate: appointmentDate,
                timeSlot: timeSlot,
                status: { $ne: 'Cancelled' }
            });

            slots.push({
                timeSlot,
                isBooked: !!booked
            });
        }

        res.status(200).json({
            success: true,
            data: {
                availableSlots: slots
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
