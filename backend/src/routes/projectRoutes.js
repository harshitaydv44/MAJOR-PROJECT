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
  ignoreIndustryRecommendation
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
router.post('/:id/proposal', authorize('UNIVERSITY', 'ADMIN'), submitProposal);
router.put('/:id/proposal/review', authorize('ADMIN'), reviewProposal);

// AI-Assisted Industry Matching
router.post('/:id/recommend-industries', authorize('UNIVERSITY', 'ADMIN'), recommendIndustriesForProject);
router.post('/:id/recommend-industries/accept', authorize('UNIVERSITY', 'ADMIN'), acceptIndustryRecommendation);
router.post('/:id/recommend-industries/ignore', authorize('UNIVERSITY', 'ADMIN'), ignoreIndustryRecommendation);

// Verified Societal Impact
router.post('/:id/impact', authorize('UNIVERSITY', 'ADMIN'), submitImpactOutcome);

// Admin Workflow Intervention
router.post('/:id/admin-intervene', authorize('ADMIN'), adminIntervene);

module.exports = router;
