const Order = require('../../models/health/OrderModel');
const Pharmaceutical = require('../../models/health/PharmaceuticalModel');
const Inventory = require('../../models/health/InventoryModel');
const fs = require('fs/promises');
const path = require('path');
const crypto = require('crypto');

const generateOrderId = async () => {
    const count = await Order.countDocuments();
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    return `ORD-${dateStr}-${String(count + 1).padStart(4, '0')}`;
};

const PRESCRIPTION_UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'health-prescriptions');
const ALLOWED_PRESCRIPTION_TYPES = new Set(['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']);

const savePrescriptionFile = async (prescriptionFile, studentId) => {
    if (!prescriptionFile) {
        return null;
    }

    if (typeof prescriptionFile === 'string' && prescriptionFile.startsWith('/uploads/')) {
        return prescriptionFile;
    }

    let parsedFile;
    try {
        parsedFile = typeof prescriptionFile === 'string' ? JSON.parse(prescriptionFile) : prescriptionFile;
    } catch (error) {
        throw new Error('Invalid prescription payload');
    }

    if (!parsedFile?.dataUrl || !parsedFile?.type) {
        throw new Error('Prescription file data is incomplete');
    }

    if (!ALLOWED_PRESCRIPTION_TYPES.has(parsedFile.type)) {
        throw new Error('Unsupported prescription file type');
    }

    const dataUrlMatch = String(parsedFile.dataUrl).match(/^data:(.+);base64,(.+)$/);
    if (!dataUrlMatch) {
        throw new Error('Invalid prescription file encoding');
    }

    const [, mimeType, base64Data] = dataUrlMatch;
    if (!ALLOWED_PRESCRIPTION_TYPES.has(mimeType)) {
        throw new Error('Unsupported prescription file type');
    }

    const extensionMap = {
        'application/pdf': '.pdf',
        'image/jpeg': '.jpg',
        'image/jpg': '.jpg',
        'image/png': '.png'
    };

    const filename = `prescription-${studentId}-${Date.now()}-${crypto.randomUUID()}${extensionMap[mimeType] || ''}`;
    const absoluteDir = path.resolve(PRESCRIPTION_UPLOAD_DIR);
    await fs.mkdir(absoluteDir, { recursive: true });
    await fs.writeFile(path.join(absoluteDir, filename), Buffer.from(base64Data, 'base64'));

    return `/uploads/health-prescriptions/${filename}`;
};

// Create order
exports.createOrder = async (req, res) => {
    try {
        const { items, deliveryType, deliveryAddress, prescriptionFile } = req.body;
        const studentId = req.user._id;

        // Validate required fields
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Please add at least one item'
            });
        }

        if (!deliveryType || !['Pickup', 'Room Delivery'].includes(deliveryType)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid delivery type'
            });
        }

        if (deliveryType === 'Room Delivery' && !String(deliveryAddress || '').trim()) {
            return res.status(400).json({
                success: false,
                message: 'Delivery address is required for room delivery'
            });
        }

        // Check quantity limits
        for (let item of items) {
            if (item.quantity <= 0 || item.quantity > 100) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid quantity. Must be between 1 and 100'
                });
            }
        }

        // Fetch pharmaceuticals and validate stock
        let totalAmount = 0;
        let prescriptionRequired = false;
        const orderItems = [];

        for (let item of items) {
            const pharmaceutical = await Pharmaceutical.findById(item.pharmaceuticalId);
            
            if (!pharmaceutical) {
                return res.status(404).json({
                    success: false,
                    message: `Pharmaceutical with ID ${item.pharmaceuticalId} not found`
                });
            }

            if (pharmaceutical.stockQuantity < item.quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for ${pharmaceutical.name}`
                });
            }

            if (pharmaceutical.type === 'Critical') {
                prescriptionRequired = true;
                if (!prescriptionFile) {
                    return res.status(400).json({
                        success: false,
                        message: `Prescription required for ${pharmaceutical.name}`
                    });
                }
            }

            totalAmount += pharmaceutical.price * item.quantity;
            orderItems.push({
                pharmaceutical: pharmaceutical._id,
                quantity: item.quantity,
                price: pharmaceutical.price
            });
        }

        const savedPrescriptionPath = await savePrescriptionFile(prescriptionFile, studentId);

        // Create order
        const order = new Order({
            orderId: await generateOrderId(),
            student: studentId,
            items: orderItems,
            totalAmount,
            deliveryType,
            deliveryAddress: deliveryType === 'Room Delivery' ? String(deliveryAddress).trim() : null,
            prescriptionRequired,
            prescriptionFile: savedPrescriptionPath,
            statusHistory: [{
                status: 'Pending',
                updatedAt: new Date(),
                updatedBy: studentId
            }]
        });

        await order.save();

        // Populate references
        await order.populate([
            { path: 'student', select: 'name email' },
            { path: 'items.pharmaceutical' }
        ]);

        res.status(201).json({
            success: true,
            message: 'Order created successfully',
            data: order
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get student's orders
exports.getStudentOrders = async (req, res) => {
    try {
        const { status } = req.query;
        const studentId = req.user._id;
        
        let filter = { student: studentId };
        if (status) {
            filter.status = status;
        }

        const orders = await Order.find(filter)
            .populate('items.pharmaceutical')
            .populate('student', 'name email')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: orders.length,
            data: orders
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get order by ID
exports.getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('items.pharmaceutical')
            .populate('student', 'name email')
            .populate('statusHistory.updatedBy', 'name role');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Check authorization
        if (order.student.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view this order'
            });
        }

        res.status(200).json({
            success: true,
            data: order
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get all orders (ADMIN only)
exports.getAllOrders = async (req, res) => {
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

        const orders = await Order.find(filter)
            .populate('items.pharmaceutical')
            .populate('student', 'name email')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: orders.length,
            data: orders
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Update order status (ADMIN only)
exports.updateOrderStatus = async (req, res) => {
    try {
        const { status, remarks } = req.body;
        const validStatuses = ['Pending', 'Approved', 'Ready', 'Delivered', 'Picked Up', 'Rejected', 'Cancelled'];

        if (!status || !validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status'
            });
        }

        const order = await Order.findById(req.params.id);
        
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Update status
        order.status = status;
        order.statusHistory.push({
            status,
            updatedAt: new Date(),
            updatedBy: req.user._id,
            remarks
        });

        // If approved, reduce stock
        if (status === 'Approved') {
            for (let item of order.items) {
                const pharmaceutical = await Pharmaceutical.findById(item.pharmaceutical);
                if (pharmaceutical) {
                    pharmaceutical.stockQuantity -= item.quantity;
                    await pharmaceutical.save();

                    // Update inventory
                    const inventory = await Inventory.findOne({ pharmaceutical: item.pharmaceutical });
                    if (inventory) {
                        inventory.currentStock = pharmaceutical.stockQuantity;
                        inventory.transactions.push({
                            type: 'Order_Completed',
                            quantity: -item.quantity,
                            reason: `Order ${order.orderId} approved`,
                            reference: order.orderId,
                            performedBy: req.user._id
                        });
                        await inventory.save();
                    }
                }
            }
        }

        await order.save();
        await order.populate([
            { path: 'student', select: 'name email' },
            { path: 'items.pharmaceutical' }
        ]);

        res.status(200).json({
            success: true,
            message: 'Order status updated successfully',
            data: order
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Cancel order
exports.cancelOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Check authorization
        if (order.student.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to cancel this order'
            });
        }

        // Can only cancel pending orders
        if (!['Pending', 'Approved'].includes(order.status)) {
            return res.status(400).json({
                success: false,
                message: `Cannot cancel order with status: ${order.status}`
            });
        }

        order.status = 'Cancelled';
        order.statusHistory.push({
            status: 'Cancelled',
            updatedAt: new Date(),
            updatedBy: req.user._id,
            remarks: 'Cancelled by user'
        });

        await order.save();

        res.status(200).json({
            success: true,
            message: 'Order cancelled successfully',
            data: order
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
