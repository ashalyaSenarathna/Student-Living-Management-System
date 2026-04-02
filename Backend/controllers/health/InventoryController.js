const Inventory = require('../../models/health/InventoryModel');
const Pharmaceutical = require('../../models/health/PharmaceuticalModel');

// Create inventory entry
exports.createInventoryEntry = async (req, res) => {
    try {
        const { pharmaceuticalId, currentStock, minThreshold, maxStock, reorderQuantity } = req.body;

        if (!pharmaceuticalId || currentStock === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Please provide pharmaceutical ID and current stock'
            });
        }

        // Check if pharmaceutical exists
        const pharmaceutical = await Pharmaceutical.findById(pharmaceuticalId);
        if (!pharmaceutical) {
            return res.status(404).json({
                success: false,
                message: 'Pharmaceutical not found'
            });
        }

        // Check if inventory already exists
        const existingInventory = await Inventory.findOne({ pharmaceutical: pharmaceuticalId });
        if (existingInventory) {
            return res.status(400).json({
                success: false,
                message: 'Inventory entry already exists for this pharmaceutical'
            });
        }

        const inventory = new Inventory({
            pharmaceutical: pharmaceuticalId,
            currentStock,
            minThreshold: minThreshold || 10,
            maxStock,
            reorderQuantity,
            transactions: [{
                type: 'Purchase',
                quantity: currentStock,
                reason: 'Initial stock',
                performedBy: req.user._id
            }]
        });

        await inventory.save();
        await inventory.populate('pharmaceutical');

        res.status(201).json({
            success: true,
            message: 'Inventory entry created successfully',
            data: inventory
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get inventory entry
exports.getInventoryEntry = async (req, res) => {
    try {
        const inventory = await Inventory.findById(req.params.id)
            .populate('pharmaceutical')
            .populate('transactions.performedBy', 'name role');

        if (!inventory) {
            return res.status(404).json({
                success: false,
                message: 'Inventory entry not found'
            });
        }

        res.status(200).json({
            success: true,
            data: inventory
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get all inventory
exports.getAllInventory = async (req, res) => {
    try {
        const { lowStock, search } = req.query;
        let filter = {};

        if (lowStock === 'true') {
            filter.$expr = { $lte: ['$currentStock', '$minThreshold'] };
        }

        let inventory = await Inventory.find(filter)
            .populate('pharmaceutical');

        if (search) {
            inventory = inventory.filter(inv => 
                inv.pharmaceutical.name.toLowerCase().includes(search.toLowerCase())
            );
        }

        res.status(200).json({
            success: true,
            count: inventory.length,
            data: inventory
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get inventory by pharmaceutical ID
exports.getInventoryByPharmaceutical = async (req, res) => {
    try {
        const inventory = await Inventory.findOne({ pharmaceutical: req.params.id })
            .populate('pharmaceutical');

        if (!inventory) {
            return res.status(404).json({
                success: false,
                message: 'Inventory entry not found'
            });
        }

        res.status(200).json({
            success: true,
            data: inventory
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Add stock
exports.addStock = async (req, res) => {
    try {
        const { quantity, reason, batchInfo } = req.body;

        if (!quantity || quantity <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid quantity'
            });
        }

        const inventory = await Inventory.findById(req.params.id);
        if (!inventory) {
            return res.status(404).json({
                success: false,
                message: 'Inventory entry not found'
            });
        }

        const previousStock = inventory.currentStock;
        inventory.currentStock += quantity;
        inventory.lastRestockDate = new Date();

        inventory.transactions.push({
            type: 'Purchase',
            quantity,
            reason: reason || 'Stock purchase',
            performedBy: req.user._id
        });

        await inventory.save();

        // Update pharmaceutical stock
        const pharmaceutical = await Pharmaceutical.findById(inventory.pharmaceutical);
        if (pharmaceutical) {
            pharmaceutical.stockQuantity += quantity;
            await pharmaceutical.save();
        }

        await inventory.populate('pharmaceutical');

        res.status(200).json({
            success: true,
            message: `Added ${quantity} units. Stock: ${previousStock} → ${inventory.currentStock}`,
            data: inventory
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Adjust stock
exports.adjustStock = async (req, res) => {
    try {
        const { adjustment, reason } = req.body;

        if (adjustment === undefined || adjustment === null) {
            return res.status(400).json({
                success: false,
                message: 'Please provide adjustment amount'
            });
        }

        const inventory = await Inventory.findById(req.params.id);
        if (!inventory) {
            return res.status(404).json({
                success: false,
                message: 'Inventory entry not found'
            });
        }

        const newStock = inventory.currentStock + adjustment;
        if (newStock < 0) {
            return res.status(400).json({
                success: false,
                message: 'Adjustment would result in negative stock'
            });
        }

        inventory.currentStock = newStock;
        inventory.transactions.push({
            type: 'Stock_Adjustment',
            quantity: adjustment,
            reason: reason || 'Stock adjustment',
            performedBy: req.user._id
        });

        await inventory.save();

        // Update pharmaceutical stock
        const pharmaceutical = await Pharmaceutical.findById(inventory.pharmaceutical);
        if (pharmaceutical) {
            pharmaceutical.stockQuantity = newStock;
            await pharmaceutical.save();
        }

        await inventory.populate('pharmaceutical');

        res.status(200).json({
            success: true,
            message: `Stock adjusted by ${adjustment}. New stock: ${newStock}`,
            data: inventory
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get low stock items
exports.getLowStockItems = async (req, res) => {
    try {
        const inventory = await Inventory.find({
            $expr: { $lte: ['$currentStock', '$minThreshold'] }
        })
            .populate('pharmaceutical')
            .sort({ currentStock: 1 });

        res.status(200).json({
            success: true,
            count: inventory.length,
            data: inventory,
            message: `${inventory.length} items below minimum threshold`
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get inventory report
exports.getInventoryReport = async (req, res) => {
    try {
        const inventory = await Inventory.find()
            .populate('pharmaceutical');

        const report = {
            totalItems: inventory.length,
            totalValue: 0,
            lowStockCount: 0,
            outOfStockCount: 0,
            items: []
        };

        inventory.forEach(inv => {
            const value = inv.currentStock * (inv.pharmaceutical.price || 0);
            report.totalValue += value;

            if (inv.currentStock <= inv.minThreshold) {
                report.lowStockCount++;
            }

            if (inv.currentStock === 0) {
                report.outOfStockCount++;
            }

            report.items.push({
                id: inv._id,
                name: inv.pharmaceutical.name,
                category: inv.pharmaceutical.category,
                currentStock: inv.currentStock,
                minThreshold: inv.minThreshold,
                maxStock: inv.maxStock,
                price: inv.pharmaceutical.price,
                value: value,
                status: inv.currentStock === 0 ? 'Out of Stock' : 
                        inv.currentStock <= inv.minThreshold ? 'Low Stock' : 'Available'
            });
        });

        res.status(200).json({
            success: true,
            data: report
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get transaction history
exports.getTransactionHistory = async (req, res) => {
    try {
        const { type, startDate, endDate } = req.query;
        const inventoryId = req.params.id;

        const inventory = await Inventory.findById(inventoryId)
            .populate('pharmaceutical')
            .populate('transactions.performedBy', 'name role');

        if (!inventory) {
            return res.status(404).json({
                success: false,
                message: 'Inventory entry not found'
            });
        }

        let transactions = inventory.transactions;

        if (type) {
            transactions = transactions.filter(t => t.type === type);
        }

        if (startDate || endDate) {
            transactions = transactions.filter(t => {
                const transDate = new Date(t.transactionDate);
                if (startDate && transDate < new Date(startDate)) return false;
                if (endDate && transDate > new Date(endDate)) return false;
                return true;
            });
        }

        res.status(200).json({
            success: true,
            count: transactions.length,
            data: {
                pharmaceutical: inventory.pharmaceutical,
                transactions: transactions.sort((a, b) => b.transactionDate - a.transactionDate)
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
