const Pharmaceutical = require('../../models/health/PharmaceuticalModel');
const Inventory = require('../../models/health/InventoryModel');

const parseDateOnly = (value) => {
    if (!value) return null;
    if (value instanceof Date) {
        return new Date(value.getFullYear(), value.getMonth(), value.getDate());
    }

    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
        const [year, month, day] = value.split('-').map(Number);
        return new Date(year, month - 1, day);
    }

    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime())
        ? null
        : new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
};

const getTodayDateOnly = () => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
};

// Get all pharmaceuticals
exports.getAllPharmaceuticals = async (req, res) => {
    try {
        const { category, type, availability, search } = req.query;
        let filter = {};

        if (category) filter.category = category;
        if (type) filter.type = type;
        if (availability) filter.availability = availability;
        
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        const pharmaceuticals = await Pharmaceutical.find(filter)
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: pharmaceuticals.length,
            data: pharmaceuticals
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get single pharmaceutical
exports.getPharmaceutical = async (req, res) => {
    try {
        const pharmaceutical = await Pharmaceutical.findById(req.params.id);
        
        if (!pharmaceutical) {
            return res.status(404).json({
                success: false,
                message: 'Pharmaceutical not found'
            });
        }

        res.status(200).json({
            success: true,
            data: pharmaceutical
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Create pharmaceutical (ADMIN only)
exports.createPharmaceutical = async (req, res) => {
    try {
        // Validate required fields
        const {
            name,
            category,
            type,
            price,
            dosage,
            expiryDate,
            stockQuantity,
            minStockLevel,
            minThreshold,
            maxStock,
            reorderQuantity
        } = req.body;
        
        if (!name || !category || !type || !price || !dosage || !expiryDate || stockQuantity === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
        }

        // Validate price
        if (price < 0) {
            return res.status(400).json({
                success: false,
                message: 'Price cannot be negative'
            });
        }

        // Validate stock quantity
        if (stockQuantity < 0) {
            return res.status(400).json({
                success: false,
                message: 'Stock quantity cannot be negative'
            });
        }

        // Validate expiry date
        const parsedExpiryDate = parseDateOnly(expiryDate);
        if (!parsedExpiryDate) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid expiry date'
            });
        }

        if (parsedExpiryDate < getTodayDateOnly()) {
            return res.status(400).json({
                success: false,
                message: 'Expiry date cannot be in the past'
            });
        }

        const pharmaceutical = new Pharmaceutical({
            ...req.body,
            expiryDate: parsedExpiryDate,
            minStockLevel: minStockLevel ?? minThreshold ?? 10
        });
        await pharmaceutical.save();

        const inventory = new Inventory({
            pharmaceutical: pharmaceutical._id,
            currentStock: stockQuantity,
            minThreshold: minThreshold ?? minStockLevel ?? 10,
            maxStock,
            reorderQuantity,
            lastRestockDate: stockQuantity > 0 ? new Date() : undefined,
            transactions: [{
                type: 'Purchase',
                quantity: stockQuantity,
                reason: 'Initial stock via pharmaceutical creation',
                performedBy: req.user._id
            }]
        });

        await inventory.save();

        res.status(201).json({
            success: true,
            message: 'Pharmaceutical created successfully',
            data: pharmaceutical
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Update pharmaceutical (ADMIN only)
exports.updatePharmaceutical = async (req, res) => {
    try {
        const { price, stockQuantity, expiryDate, minStockLevel, minThreshold, maxStock, reorderQuantity } = req.body;

        // Validate fields if provided
        if (price !== undefined && price < 0) {
            return res.status(400).json({
                success: false,
                message: 'Price cannot be negative'
            });
        }

        if (stockQuantity !== undefined && stockQuantity < 0) {
            return res.status(400).json({
                success: false,
                message: 'Stock quantity cannot be negative'
            });
        }

        if (expiryDate) {
            const parsedExpiryDate = parseDateOnly(expiryDate);
            if (!parsedExpiryDate) {
                return res.status(400).json({
                    success: false,
                    message: 'Please provide a valid expiry date'
                });
            }

            if (parsedExpiryDate < getTodayDateOnly()) {
                return res.status(400).json({
                    success: false,
                    message: 'Expiry date cannot be in the past'
                });
            }
        }

        let pharmaceutical = await Pharmaceutical.findById(req.params.id);
        
        if (!pharmaceutical) {
            return res.status(404).json({
                success: false,
                message: 'Pharmaceutical not found'
            });
        }

        const previousStock = pharmaceutical.stockQuantity;

        pharmaceutical = await Pharmaceutical.findByIdAndUpdate(
            req.params.id,
            {
                ...req.body,
                ...(expiryDate ? { expiryDate: parseDateOnly(expiryDate) } : {}),
                ...(minStockLevel !== undefined || minThreshold !== undefined
                    ? { minStockLevel: minStockLevel ?? minThreshold }
                    : {})
            },
            { new: true, runValidators: true }
        );

        let inventory = await Inventory.findOne({ pharmaceutical: req.params.id });

        if (!inventory) {
            inventory = new Inventory({
                pharmaceutical: pharmaceutical._id,
                currentStock: pharmaceutical.stockQuantity,
                minThreshold: minThreshold ?? minStockLevel ?? pharmaceutical.minStockLevel ?? 10,
                maxStock,
                reorderQuantity,
                lastRestockDate: pharmaceutical.stockQuantity > 0 ? new Date() : undefined,
                transactions: [{
                    type: 'Purchase',
                    quantity: pharmaceutical.stockQuantity,
                    reason: 'Inventory record created during pharmaceutical update',
                    performedBy: req.user._id
                }]
            });
        } else {
            if (stockQuantity !== undefined && stockQuantity !== previousStock) {
                inventory.transactions.push({
                    type: 'Stock_Adjustment',
                    quantity: stockQuantity - previousStock,
                    reason: 'Stock synced from pharmaceutical update',
                    performedBy: req.user._id
                });
            }

            if (stockQuantity !== undefined) {
                inventory.currentStock = stockQuantity;
                inventory.lastRestockDate = stockQuantity > previousStock ? new Date() : inventory.lastRestockDate;
            }

            if (minThreshold !== undefined || minStockLevel !== undefined) {
                inventory.minThreshold = minThreshold ?? minStockLevel;
            }

            if (maxStock !== undefined) {
                inventory.maxStock = maxStock;
            }

            if (reorderQuantity !== undefined) {
                inventory.reorderQuantity = reorderQuantity;
            }
        }

        await inventory.save();

        res.status(200).json({
            success: true,
            message: 'Pharmaceutical updated successfully',
            data: pharmaceutical
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Delete pharmaceutical (ADMIN only)
exports.deletePharmaceutical = async (req, res) => {
    try {
        const pharmaceutical = await Pharmaceutical.findByIdAndDelete(req.params.id);
        
        if (!pharmaceutical) {
            return res.status(404).json({
                success: false,
                message: 'Pharmaceutical not found'
            });
        }

        await Inventory.findOneAndDelete({ pharmaceutical: req.params.id });

        res.status(200).json({
            success: true,
            message: 'Pharmaceutical deleted successfully',
            data: {}
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get low stock items (ADMIN)
exports.getLowStockItems = async (req, res) => {
    try {
        const pharmaceuticals = await Pharmaceutical.find({
            $expr: { $lte: ['$stockQuantity', '$minStockLevel'] }
        }).sort({ stockQuantity: 1 });

        res.status(200).json({
            success: true,
            count: pharmaceuticals.length,
            data: pharmaceuticals
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get expired items (ADMIN)
exports.getExpiredItems = async (req, res) => {
    try {
        const now = new Date();
        const pharmaceuticals = await Pharmaceutical.find({
            expiryDate: { $lt: now }
        });

        res.status(200).json({
            success: true,
            count: pharmaceuticals.length,
            data: pharmaceuticals
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
