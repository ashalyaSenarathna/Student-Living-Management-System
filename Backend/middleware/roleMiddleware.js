const jwt = require('jsonwebtoken');
const User = require('../models/laundry/UserModels');
const Doctor = require('../models/health/DoctorModel');

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecret123');

            // Get user from the token
            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                return res.status(401).json({ message: 'User not found' });
            }

            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    } else {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

// Middleware to check if user is admin
const admin = (req, res, next) => {
    if (req.user && (req.user.role === 'ADMIN' || req.user.role === 'admin')) {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized as an admin' });
    }
};

// Middleware to check if user is doctor
const doctor = async (req, res, next) => {
    try {
        const doctorProfile = await Doctor.findOne({ user: req.user._id });
        if (doctorProfile && doctorProfile.status === 'Approved') {
            req.doctor = doctorProfile;
            next();
        } else {
            res.status(403).json({ message: 'Not authorized as a doctor' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Middleware to check if user is pharmacy admin (using ADMIN role)
const pharmacyAdmin = (req, res, next) => {
    if (req.user && (req.user.role === 'ADMIN' || req.user.role === 'admin')) {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized as pharmacy admin' });
    }
};

// Middleware to check multiple roles
const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (req.user && roles.includes(req.user.role)) {
            next();
        } else {
            res.status(403).json({ message: `Not authorized. Required roles: ${roles.join(', ')}` });
        }
    };
};

module.exports = { protect, admin, doctor, pharmacyAdmin, authorizeRoles };
