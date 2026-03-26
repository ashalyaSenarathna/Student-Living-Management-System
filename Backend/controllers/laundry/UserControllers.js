const User = require('../../models/laundry/UserModels');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
const registerUser = async (req, res) => {
    try {
        const { name, username, email, password, role } = req.body;
        const trimmedEmail = String(email || '').trim().toLowerCase();
        const trimmedUsername = String(username || '').trim();

        // Check if user exists (by email or username)
        const userExists = await User.findOne({ $or: [{ email: trimmedEmail }, { username: trimmedUsername }] });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const user = await User.create({
            name,
            username: trimmedUsername,
            email: trimmedEmail,
            password: hashedPassword,
            role: role || 'USER',
            isApproved: (role === 'PROVIDER' || role === 'HOSTEL_OWNER') ? false : true
        });

        if (user) {
            res.status(201).json({
                success: true,
                message: 'Registration successful',
                data: {
                    _id: user.id,
                    name: user.name,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                    isApproved: user.isApproved,
                    token: generateToken(user._id)
                }
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
        const identifier = String(req.body.email || req.body.username || '').trim();
        const password = req.body.password;

        if (!identifier || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email/username and password are required'
            });
        }

        const isEmail = identifier.includes('@');

        // Check for user by email or username (include password because select: false)
        const user = await User.findOne(
            isEmail
                ? { email: identifier.toLowerCase() }
                : { username: identifier }
        ).select('+password');

        if (user && (await bcrypt.compare(password, user.password))) {
            // Check if provider or hostel owner is approved
            if ((user.role === 'PROVIDER' || user.role === 'HOSTEL_OWNER') && !user.isApproved) {
                return res.status(403).json({ message: 'Your account is pending admin approval. Please wait for the administrator to approve your account.' });
            }

            res.json({
                success: true,
                message: 'Login successful',
                data: {
                    _id: user.id,
                    name: user.name,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                    isApproved: user.isApproved,
                    token: generateToken(user._id)
                }
            });
        } else {
            res.status(401).json({ success: false, message: 'Invalid username or password' });
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

        if (user && (user.role === 'PROVIDER' || user.role === 'HOSTEL_OWNER')) {
            user.isApproved = isApproved;
            await user.save();
            res.json({ message: `Provider ${isApproved ? 'approved' : 'rejected'}` });
        } else {
            res.status(404).json({ message: 'Laundry or Hostel provider not found' });
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
                success: true,
                message: 'Profile updated successfully',
                data: {
                    _id: updatedUser._id,
                    name: updatedUser.name,
                    username: updatedUser.username,
                    email: updatedUser.email,
                    role: updatedUser.role,
                    isApproved: updatedUser.isApproved,
                    token: generateToken(updatedUser._id),
                }
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

module.exports = {
    registerUser,
    loginUser,
    getAllUsers,
    approveProvider,
    deleteUser,
    updateUserProfile
};
