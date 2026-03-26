const express = require('express');
const router = express.Router();
const { protect, admin } = require('../../middleware/authMiddleware');
const {
    createAppointment,
    getStudentAppointments,
    getDoctorAppointments,
    getAppointmentById,
    acceptAppointment,
    rejectAppointment,
    completeAppointment,
    cancelAppointment,
    getDoctorSlots,
    getDoctorAvailabilityCalendar
} = require('../../controllers/health/AppointmentController');

// Public routes
router.get('/slots', getDoctorSlots);
router.get('/calendar', getDoctorAvailabilityCalendar);

// Student routes
router.post('/', protect, createAppointment);
router.get('/student/my-appointments', protect, getStudentAppointments);
router.get('/:id', protect, getAppointmentById);
router.put('/:id/cancel', protect, cancelAppointment);

// Doctor routes
router.get('/doctor/appointments', protect, getDoctorAppointments);
router.put('/:id/accept', protect, acceptAppointment);
router.put('/:id/reject', protect, rejectAppointment);
router.put('/:id/complete', protect, completeAppointment);

module.exports = router;
