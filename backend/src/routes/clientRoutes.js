const express = require('express');
const router = express.Router();
const {
  getClientDashboard,
  getClientProfile,
  updateClientProfile
} = require('../controllers/clientController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Citizen dashboard: accessible to CLIENT (and ADMIN for oversight)
router.get('/dashboard', protect, authorize('CLIENT', 'ADMIN'), getClientDashboard);

// Citizen profile management
router.get('/profile', protect, getClientProfile);
router.put('/profile', protect, updateClientProfile);

module.exports = router;
