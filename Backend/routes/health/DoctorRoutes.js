const express = require('express');
const router = express.Router();
const { protect, admin } = require('../../middleware/authMiddleware');
const {
    createDoctorProfile,
    getDoctorProfile,
    getMyDoctorProfile,
    updateDoctorProfile,
    getAllDoctors,
    getPendingDoctors,
    approveDoctorApplication,
    rejectDoctorApplication,
    setDoctorAvailability,
    toggleDoctorAvailability
} = require('../../controllers/health/DoctorController');

// Public routes
router.get('/', getAllDoctors);
router.get('/:id', getDoctorProfile);

// Doctor routes
router.post('/', protect, createDoctorProfile);
router.get('/my-profile', protect, getMyDoctorProfile);
router.put('/', protect, updateDoctorProfile);
router.put('/availability/set', protect, setDoctorAvailability);
router.put('/availability/toggle', protect, toggleDoctorAvailability);

// Admin routes
router.get('/admin/pending', protect, admin, getPendingDoctors);
router.put('/:id/approve', protect, admin, approveDoctorApplication);
router.put('/:id/reject', protect, admin, rejectDoctorApplication);

module.exports = router;
