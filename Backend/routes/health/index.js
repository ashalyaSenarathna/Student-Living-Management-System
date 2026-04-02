const express = require('express');
const router = express.Router();

const pharmaceuticalRoutes = require('./PharmaceuticalRoutes');
const orderRoutes = require('./OrderRoutes');
const appointmentRoutes = require('./AppointmentRoutes');
const prescriptionRoutes = require('./PrescriptionRoutes');
const doctorRoutes = require('./DoctorRoutes');
const inventoryRoutes = require('./InventoryRoutes');

router.use('/pharmaceutical', pharmaceuticalRoutes);
router.use('/orders', orderRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/prescriptions', prescriptionRoutes);
router.use('/doctors', doctorRoutes);
router.use('/inventory', inventoryRoutes);

module.exports = router;
