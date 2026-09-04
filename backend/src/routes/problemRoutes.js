const express = require('express');
const router = express.Router();
const { getMyProblems, getProblemById } = require('../controllers/problemController');
const { protect } = require('../middleware/authMiddleware');

// Authenticated citizen problem routes
router.get('/my', protect, getMyProblems);
router.get('/:id', protect, getProblemById);

module.exports = router;
