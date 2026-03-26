const User = require('../../models/laundry/UserModels');
const Appointment = require('../../models/health/AppointmentModel');
const Doctor = require('../../models/health/DoctorModel');
const Inventory = require('../../models/health/InventoryModel');
const Order = require('../../models/health/OrderModel');
const Pharmaceutical = require('../../models/health/PharmaceuticalModel');
const Prescription = require('../../models/health/PrescriptionModel');

const getDbCheckSnapshot = async (req, res) => {
    try {
        const [
            users,
            doctors,
            pharmaceuticals,
            inventory,
            appointments,
            prescriptions,
            orders
        ] = await Promise.all([
            User.find({}).select('-password').sort({ createdAt: -1 }),
            Doctor.find({})
                .populate('user', 'name username email role isApproved')
                .sort({ createdAt: -1 }),
            Pharmaceutical.find({}).sort({ createdAt: -1 }),
            Inventory.find({})
                .populate('pharmaceutical')
                .populate('transactions.performedBy', 'name email role')
                .sort({ createdAt: -1 }),
            Appointment.find({})
                .populate('student', 'name username email role')
                .populate('doctor', 'firstName lastName specialization officeLocation isAvailable')
                .populate('prescription')
                .sort({ createdAt: -1 }),
            Prescription.find({})
                .populate('student', 'name username email role')
                .populate('doctor', 'firstName lastName specialization')
                .populate('appointment')
                .populate('medicines.pharmaceutical')
                .populate('dispensedItems.pharmaceutical')
                .sort({ createdAt: -1 }),
            Order.find({})
                .populate('student', 'name username email role')
                .populate('items.pharmaceutical')
                .populate('statusHistory.updatedBy', 'name email role')
                .sort({ createdAt: -1 })
        ]);

        res.status(200).json({
            success: true,
            message: 'Database snapshot retrieved successfully',
            generatedAt: new Date().toISOString(),
            counts: {
                users: users.length,
                doctors: doctors.length,
                pharmaceuticals: pharmaceuticals.length,
                inventory: inventory.length,
                appointments: appointments.length,
                prescriptions: prescriptions.length,
                orders: orders.length
            },
            data: {
                users,
                doctors,
                pharmaceuticals,
                inventory,
                appointments,
                prescriptions,
                orders
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    getDbCheckSnapshot
};
