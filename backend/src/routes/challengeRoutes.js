const express = require('express');
const router = express.Router();
const {
  createChallenge,
  getChallenges,
  getChallengeById,
  updateStatus,
  assignCohort,
  sponsorChallenge,
  getStats,
  getStudentChallenges,
  expressInterest,
  getInterestStatus
} = require('../controllers/challengeController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Public route to view stats
router.get('/stats', getStats);

// Student: Get their challenges with tabs (Placed before /:id)
router.get('/student/my-challenges', protect, authorize('STUDENT'), getStudentChallenges);

// Publicly viewable challenge feed
router.get('/', getChallenges);
router.get('/:id', getChallengeById);

// Submissions: Citizen or any logged in user
router.post('/', protect, createChallenge);

// Student: Express interest in a challenge
router.post('/:id/express-interest', protect, authorize('STUDENT'), expressInterest);

// Student: Check interest status for a challenge
router.get('/:id/interest-status', protect, authorize('STUDENT'), getInterestStatus);

// Government Admin: Verification & University Allocation
router.patch('/:id/status', protect, authorize('admin'), updateStatus);

// University: Cohort Assignment
router.post('/:id/assign-cohort', protect, authorize('university', 'admin'), assignCohort);

// Industry: Sponsor Challenge
router.post('/:id/sponsor', protect, authorize('industry', 'admin'), sponsorChallenge);

module.exports = router;
