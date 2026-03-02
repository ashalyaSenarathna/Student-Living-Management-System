const express = require('express');
const router = express.Router();
const hostelController = require('../../controllers/hostel/HostelController');
const { protect, admin } = require('../../middleware/authMiddleware');

// Public routes
router.get('/', hostelController.getHostels);

// Private (Owner) routes — must be BEFORE /:id to avoid being matched as a param
router.get('/mine', protect, hostelController.getMyHostels);
router.post('/', protect, hostelController.addHostel);

// Admin-only routes — must be BEFORE /:id
router.get('/admin/pending', protect, admin, hostelController.getPendingHostels);
router.get('/admin/all', protect, admin, hostelController.getAllHostelsAdmin);
router.put('/:id/approve', protect, admin, hostelController.approveHostel);
router.put('/:id/reject', protect, admin, hostelController.rejectHostel);
router.put('/:id/feature', protect, admin, hostelController.toggleFeatured);
router.put('/:id/featured', protect, admin, hostelController.toggleFeatured);
router.put('/:id/status', protect, admin, hostelController.updateHostelStatus);
router.put('/:id/dismiss-report', protect, admin, hostelController.dismissReport);

// Parameterised routes — always last
router.get('/:id', hostelController.getHostelById);
router.delete('/:id', protect, hostelController.deleteHostel);

module.exports = router;
