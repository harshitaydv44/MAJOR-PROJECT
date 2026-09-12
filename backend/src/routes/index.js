const express = require('express');
const router = express.Router();

const healthRoutes = require('./healthRoutes');
const authRoutes = require('./authRoutes');
const challengeRoutes = require('./challengeRoutes');
const problemRoutes = require('./problemRoutes');
const adminRoutes = require('./adminRoutes');
const notificationRoutes = require('./notificationRoutes');
const universityRoutes = require('./universityRoutes');
const projectRoutes = require('./projectRoutes');
const facultyRoutes = require('./facultyRoutes');
const studentRoutes = require('./studentRoutes');
const teamRoutes = require('./teamRoutes');
const industryRoutes = require('./industryRoutes');
const clientRoutes = require('./clientRoutes');

// Mount API routes
router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/client', clientRoutes);
router.use('/challenges', challengeRoutes);
router.use('/problems', problemRoutes);
router.use('/admin', adminRoutes);
router.use('/notifications', notificationRoutes);
router.use('/universities', universityRoutes);
router.use('/projects', projectRoutes);
router.use('/faculty', facultyRoutes);
router.use('/student', studentRoutes);
router.use('/students', studentRoutes);
router.use('/teams', teamRoutes);
router.use('/industry', industryRoutes);

module.exports = router;
