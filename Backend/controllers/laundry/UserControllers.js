const User = require('../../models/laundry/UserModels');
const Doctor = require('../../models/health/DoctorModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
const registerUser = async (req, res) => {
    try {
        const { name, username, email, password, role } = req.body;

        // Check if user exists (by email or username)
        const userExists = await User.findOne({ $or: [{ email }, { username }] });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const user = await User.create({
            name,
            username,
            email,
            password: hashedPassword,
            role: role || 'USER',
            isApproved: (role === 'PROVIDER' || role === 'HOSTEL_OWNER' || role === 'DOCTOR' || role === 'FOOD_PROVIDER') ? false : true
        });

        if (role === 'DOCTOR') {
            const [firstName, ...lastNameParts] = name.split(' ');
            const lastName = lastNameParts.join(' ') || 'Doctor';

            await Doctor.create({
                user: user._id,
                firstName: firstName,
                lastName: lastName,
                specialization: 'General Practitioner',
                registrationNumber: `REG-${user.username.toUpperCase()}-${Date.now().toString().slice(-4)}`,
                licenseNumber: `LIC-${user.username.toUpperCase()}-001`,
                phone: '0000000000',
                officeLocation: 'Update needed',
                status: 'Approved' // Set to approved for simplicity during dev, or 'Pending' if approval is wanted
            });
        }

        if (user) {
            res.status(201).json({
                _id: user.id,
                name: user.name,
                username: user.username,
                email: user.email,
                role: user.role,
                isApproved: user.isApproved,
                token: generateToken(user._id)
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Authenticate a user
// @route   POST /api/users/login
// @access  Public
const loginUser = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Check for user by username (include password because select: false)
        const user = await User.findOne({ username }).select('+password');

        if (user && (await bcrypt.compare(password, user.password))) {
            // Check if provider, hostel owner, food provider, or doctor is approved
            if ((user.role === 'PROVIDER' || user.role === 'HOSTEL_OWNER' || user.role === 'DOCTOR' || user.role === 'FOOD_PROVIDER') && !user.isApproved) {
                return res.status(403).json({ message: 'Your account is pending admin approval. Please wait for the administrator to approve your account.' });
            }

            res.json({
                _id: user.id,
                name: user.name,
                username: user.username,
                email: user.email,
                role: user.role,
                isApproved: user.isApproved,
                token: generateToken(user._id)
            });
        } else {
            res.status(401).json({ message: 'Invalid username or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({});
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Approve/Reject provider
// @route   PUT /api/users/:id/approve
// @access  Private/Admin
const approveProvider = async (req, res) => {
    try {
        const { isApproved } = req.body;
        const user = await User.findById(req.params.id);

        if (user && (user.role === 'PROVIDER' || user.role === 'HOSTEL_OWNER' || user.role === 'DOCTOR' || user.role === 'FOOD_PROVIDER')) {
            user.isApproved = isApproved;
            await user.save();
            res.json({ message: `${user.role} ${isApproved ? 'approved' : 'rejected'}` });
        } else {
            res.status(404).json({ message: 'Provider, Doctor, or Food Provider not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (user) {
            // Prevent admin from deleting themselves (optional but recommended)
            if (user._id.toString() === req.user._id.toString()) {
                return res.status(400).json({ message: 'You cannot delete yourself' });
            }

            await User.findByIdAndDelete(req.params.id);
            res.json({ message: 'User removed successfully' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update user profile (Name, Email, Password)
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('+password');

        if (user) {
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;
            user.username = req.body.username || user.username;

            if (req.body.password) {
                // Hash new password
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(req.body.password, salt);
            }

            const updatedUser = await user.save();

            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                username: updatedUser.username,
                email: updatedUser.email,
                role: updatedUser.role,
                isApproved: updatedUser.isApproved,
                token: generateToken(updatedUser._id),
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'supersecret123', {
        expiresIn: '30d'
    });
};

const getUserCount = async (req, res) => {
    try {
        const count = await User.countDocuments();
        res.json({ count });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    registerUser,
    loginUser,
    getAllUsers,
    approveProvider,
    deleteUser,
    updateUserProfile,
    getUserCount
};
