const express = require('express');
const router = express.Router();
const {
  getStudents,
  addStudent,
  updateStudent,
  removeStudent
} = require('../controllers/studentController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getStudents);
router.post('/', authorize('UNIVERSITY', 'ADMIN'), addStudent);
router.put('/:id', authorize('UNIVERSITY', 'ADMIN'), updateStudent);
router.delete('/:id', authorize('UNIVERSITY', 'ADMIN'), removeStudent);

module.exports = router;
