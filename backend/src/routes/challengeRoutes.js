const express = require('express');
const router = express.Router();
const {
  createChallenge,
  getChallenges,
  getChallengeById,
  updateStatus,
  assignCohort,
  sponsorChallenge,
  getStats
} = require('../controllers/challengeController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Public route to view stats
router.get('/stats', getStats);

// Publicly viewable challenge feed
router.get('/', getChallenges);
router.get('/:id', getChallengeById);

// Submissions: Citizen or any logged in user
router.post('/', protect, createChallenge);

// Government Admin: Verification & University Allocation
router.patch('/:id/status', protect, authorize('admin'), updateStatus);

// University: Cohort Assignment
router.post('/:id/assign-cohort', protect, authorize('university', 'admin'), assignCohort);

// Industry: Sponsor Challenge
router.post('/:id/sponsor', protect, authorize('industry', 'admin'), sponsorChallenge);

module.exports = router;
