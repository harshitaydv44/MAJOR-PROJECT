const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateProfile,
  getOpportunities,
  getPartnerships,
  createPartnership,
  getDashboardStats
} = require('../controllers/industryController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('INDUSTRY'));

// Corporate Profile
router.get('/profile', getProfile);
router.put('/profile', updateProfile);

// Innovation Opportunities
router.get('/opportunities', getOpportunities);

// Partnerships
router.get('/partnerships', getPartnerships);
router.post('/partnerships', createPartnership);

// Dashboard Stats
router.get('/stats', getDashboardStats);

module.exports = router;
