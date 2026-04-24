const express = require('express');
const router = express.Router();
const {
    registerUser,
    loginUser,
    getAllUsers,
    approveProvider,
    deleteUser,
    updateUserProfile,
    getUserCount
} = require('../../controllers/laundry/UserControllers');
const { protect, admin } = require('../../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/count', getUserCount);
router.put('/profile', protect, updateUserProfile);
router.get('/', protect, admin, getAllUsers);
router.put('/:id/approve', protect, admin, approveProvider);
router.delete('/:id', protect, admin, deleteUser);

module.exports = router;
