const express = require('express');
const router = express.Router();
const { getDbCheckSnapshot } = require('../../controllers/debug/DbCheckController');

router.get('/', getDbCheckSnapshot);

module.exports = router;
