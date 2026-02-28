const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getAllUsers } = require('../../controllers/laundry/UserControllers');
const { protect, admin } = require('../../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/', protect, admin, getAllUsers);

module.exports = router;
