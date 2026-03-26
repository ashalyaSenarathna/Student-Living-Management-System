const express = require('express');
const router = express.Router();
const { protect, admin } = require('../../middleware/authMiddleware');
const {
    createPrescription,
    getPrescriptionById,
    getStudentPrescriptions,
    searchPrescriptionByStudentId,
    dispenseMedicine,
    getAllPrescriptions,
    downloadPrescriptionPDF,
    updatePrescriptionStatus
} = require('../../controllers/health/PrescriptionController');

// Student routes
router.get('/my-prescriptions', protect, getStudentPrescriptions);
router.get('/:id', protect, getPrescriptionById);
router.get('/:id/download', protect, downloadPrescriptionPDF);

// Doctor routes
router.post('/', protect, createPrescription);

// Pharmacy routes
router.get('/search/by-student-id', protect, searchPrescriptionByStudentId);
router.put('/:id/dispense', protect, dispenseMedicine);
router.put('/:id/status', protect, admin, updatePrescriptionStatus);

// Admin routes
router.get('/admin/all', protect, admin, getAllPrescriptions);

module.exports = router;
