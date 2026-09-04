const express = require('express');
const router = express.Router();
const {
  getOverview,
  getAnalyticsDashboard,
  exportAnalyticsCSV,
  getGeographicMapData,
  recommendUniversitiesForChallenge,
  acceptUniversityRecommendation,
  ignoreUniversityRecommendation,
  getChallenges,
  getChallengeById,
  getValidationQueue,
  validateChallenge,
  rejectChallenge,
  requestInformation,
  markDuplicate,
  changePriority,
  addInternalNote,
  assignUniversity,
  getChallengeAuditHistory,
  updateChallengeStatus,
  getUniversities,
  getIndustryPartners,
  updateAdminProfile,
  aiAnalyzeChallenge
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Apply protect and authorize('ADMIN') to all admin endpoints
router.use(protect);
router.use(authorize('ADMIN'));

// Analytics & Overview
router.get('/overview', getOverview);
router.get('/analytics', getAnalyticsDashboard);
router.get('/analytics/export', exportAnalyticsCSV);
router.get('/map', getGeographicMapData);

// Challenge Management
router.get('/challenges', getChallenges);
router.get('/challenges/:id', getChallengeById);
router.get('/validation-queue', getValidationQueue);

// Administrative Workflow Actions
router.post('/challenges/:id/validate', validateChallenge);
router.post('/challenges/:id/reject', rejectChallenge);
router.post('/challenges/:id/request-info', requestInformation);
router.post('/challenges/:id/duplicate', markDuplicate);
router.patch('/challenges/:id/priority', changePriority);
router.post('/challenges/:id/notes', addInternalNote);
router.post('/challenges/:id/assign', assignUniversity);
router.post('/challenges/:id/ai-analyze', aiAnalyzeChallenge);
router.post('/challenges/:id/recommend-universities', recommendUniversitiesForChallenge);
router.post('/challenges/:id/recommend-universities/accept', acceptUniversityRecommendation);
router.post('/challenges/:id/recommend-universities/ignore', ignoreUniversityRecommendation);
router.get('/challenges/:id/audit-history', getChallengeAuditHistory);
router.patch('/challenges/:id/status', updateChallengeStatus);

// Partner Registries & Profile
router.get('/universities', getUniversities);
router.get('/industry', getIndustryPartners);
router.put('/profile', updateAdminProfile);

module.exports = router;
