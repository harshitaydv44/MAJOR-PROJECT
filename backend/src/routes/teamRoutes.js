const express = require('express');
const router = express.Router();
const {
  getTeams,
  createTeam,
  updateTeam,
  deleteTeam
} = require('../controllers/teamController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getTeams);
router.post('/', authorize('UNIVERSITY', 'ADMIN'), createTeam);
router.put('/:id', authorize('UNIVERSITY', 'ADMIN'), updateTeam);
router.delete('/:id', authorize('UNIVERSITY', 'ADMIN'), deleteTeam);

module.exports = router;
