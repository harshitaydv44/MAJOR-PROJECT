const express = require('express');
const router = express.Router();
const {
  createProblem,
  getMyProblems,
  getProblemById,
  updateProblem,
  provideAdditionalInfo,
  saveProblem,
  unsaveProblem,
  getSavedProblems
} = require('../controllers/problemController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Citizen challenges endpoints
router.get('/my', protect, getMyProblems);
router.get('/saved', protect, getSavedProblems);
router.get('/:id', protect, getProblemById);

// Submit new challenge (supports multipart file uploads or JSON)
router.post('/', protect, upload.array('attachments', 5), createProblem);

// Update editable challenge (only SUBMITTED or NEEDS_INFORMATION)
router.put('/:id', protect, updateProblem);

// Citizen provides additional information on administrative request
router.post('/:id/information', protect, provideAdditionalInfo);

// Bookmarking / Saved challenges
router.post('/:id/save', protect, saveProblem);
router.delete('/:id/save', protect, unsaveProblem);

module.exports = router;
