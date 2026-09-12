const express = require('express');
const router = express.Router();
const {
  getProjects,
  getProjectById,
  createProject,
  transitionStage,
  addMilestone,
  updateMilestone,
  deleteMilestone,
  addMilestoneComment,
  uploadProjectDocument,
  addProjectUpdate,
  addProjectComment,
  submitImpactOutcome,
  adminIntervene,
  submitProposal,
  reviewProposal,
  assignMentor,
  recommendIndustriesForProject,
  acceptIndustryRecommendation,
  ignoreIndustryRecommendation,
  requestIndustryCollaboration,
  requestMentorReview,
  addMentorFeedback,
  updateProjectPrototype,
  getProjectTests,
  createProjectTest,
  uploadTestEvidence,
  reviewProjectTest,
  getProjectPartnerships,
  updatePartnershipStatus
} = require('../controllers/projectController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.use(protect);

// Projects Listing & Details
router.get('/', getProjects);
router.get('/:id', getProjectById);
router.post('/', authorize('UNIVERSITY', 'ADMIN'), createProject);

// Lifecycle Transition State Machine
router.post('/:id/transition', authorize('UNIVERSITY', 'FACULTY', 'ADMIN'), transitionStage);

// Milestones Management
router.post('/:id/milestones', authorize('UNIVERSITY', 'FACULTY', 'ADMIN'), addMilestone);
router.put('/:id/milestones/:milestoneId', authorize('UNIVERSITY', 'FACULTY', 'ADMIN', 'STUDENT'), updateMilestone);
router.delete('/:id/milestones/:milestoneId', authorize('UNIVERSITY', 'FACULTY', 'ADMIN'), deleteMilestone);
router.post('/:id/milestones/:milestoneId/comments', addMilestoneComment);

// Deliverables & Documents (Cloudinary)
router.post('/:id/documents', upload.single('file'), uploadProjectDocument);

// Collaboration & Activity Timeline
router.post('/:id/updates', authorize('UNIVERSITY', 'FACULTY', 'ADMIN', 'INDUSTRY'), addProjectUpdate);
router.post('/:id/comments', addProjectComment);

// Proposal & Mentorship
router.post('/:id/assign-mentor', authorize('UNIVERSITY', 'ADMIN'), assignMentor);
router.post('/:id/proposal', authorize('UNIVERSITY', 'ADMIN', 'STUDENT'), submitProposal);
router.put('/:id/proposal/review', authorize('ADMIN'), reviewProposal);
router.post('/:id/mentor/request-review', authorize('STUDENT', 'UNIVERSITY', 'FACULTY', 'ADMIN'), requestMentorReview);
router.post('/:id/mentor/feedback', authorize('FACULTY', 'UNIVERSITY', 'ADMIN'), addMentorFeedback);

// AI-Assisted Industry Matching & Collaboration Requests
router.post('/:id/recommend-industries', authorize('UNIVERSITY', 'ADMIN', 'STUDENT', 'FACULTY'), recommendIndustriesForProject);
router.post('/:id/recommend-industries/accept', authorize('UNIVERSITY', 'ADMIN'), acceptIndustryRecommendation);
router.post('/:id/recommend-industries/ignore', authorize('UNIVERSITY', 'ADMIN'), ignoreIndustryRecommendation);
router.post('/:id/request-industry', authorize('STUDENT', 'UNIVERSITY', 'FACULTY', 'ADMIN'), requestIndustryCollaboration);

// Verified Societal Impact
router.post('/:id/impact', authorize('UNIVERSITY', 'ADMIN'), submitImpactOutcome);

// Prototype Tracking
router.put('/:id/prototype', authorize('STUDENT', 'UNIVERSITY', 'FACULTY', 'ADMIN'), updateProjectPrototype);

// Empirical Test Trials & Evidence
router.get('/:id/tests', getProjectTests);
router.post('/:id/tests', authorize('STUDENT', 'UNIVERSITY', 'FACULTY', 'ADMIN'), createProjectTest);
router.post('/:id/tests/:testId/evidence', authorize('STUDENT', 'UNIVERSITY', 'FACULTY', 'ADMIN'), upload.single('file'), uploadTestEvidence);
router.post('/:id/tests/:testId/review', authorize('FACULTY', 'UNIVERSITY', 'ADMIN'), reviewProjectTest);

// Project Industry Partnerships (MongoDB Real Records)
router.get('/:id/partnerships', getProjectPartnerships);
router.put('/:id/partnerships/:partnershipId/status', authorize('INDUSTRY', 'UNIVERSITY', 'ADMIN'), updatePartnershipStatus);

// Admin Workflow Intervention
router.post('/:id/admin-intervene', authorize('ADMIN'), adminIntervene);

module.exports = router;
