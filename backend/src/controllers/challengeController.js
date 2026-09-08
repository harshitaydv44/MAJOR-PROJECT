const Challenge = require('../models/Challenge');
const User = require('../models/User');
const University = require('../models/University');
const aiService = require('../services/aiService');
const { dispatchNotification } = require('../services/notificationDispatcher');
const { successResponse, errorResponse } = require('../utils/responseHandler');

/**
 * Create a new civic challenge
 * POST /api/challenges
 */
const createChallenge = async (req, res, next) => {
  try {
    const {
      title,
      description,
      category,
      district,
      location,
      priority,
      attachments,
      tags
    } = req.body;

    if (!title || !description || !category || !district) {
      return errorResponse(res, 'Please provide title, description, category, and district', null, 400);
    }

    // Duplicate submission prevention (5-minute window for identical title by same citizen)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const recentDuplicate = await Challenge.findOne({
      submittedBy: req.user.id,
      title: title.trim(),
      createdAt: { $gte: fiveMinutesAgo }
    });
    if (recentDuplicate) {
      return errorResponse(
        res,
        'Duplicate challenge submission detected. A challenge with this title was recently submitted.',
        null,
        429
      );
    }

    const challenge = await Challenge.create({
      title,
      description,
      category,
      district,
      location: location || {
        area: '',
        landmark: '',
        coordinates: { lat: 28.6139, lng: 77.2090 }
      },
      priority: priority || 'medium',
      submittedBy: req.user.id,
      attachments: attachments || [],
      tags: tags || [],
      milestones: [
        { title: 'Community Problem Verification', completed: false },
        { title: 'University Research & Team Assignment', completed: false },
        { title: 'Functional Prototype Development', completed: false },
        { title: 'Pilot Field Testing in Delhi Ward', completed: false }
      ]
    });

    // Phase 3: AI Service Integration (isolated, resilient to partial or total outage)
    try {
      const [otherChallenges, universities] = await Promise.all([
        Challenge.find({ _id: { $ne: challenge._id } })
          .select('code title description')
          .limit(50)
          .lean(),
        University.find({}).lean()
      ]);

      const [classifyResult, priorityResult, dupResult, summaryResult, matchResult] = await Promise.allSettled([
        aiService.classify(challenge.title, challenge.description),
        aiService.recommendPriority({
          title: challenge.title,
          description: challenge.description,
          urgency: challenge.urgency,
          severity: challenge.severity,
          affectedPopulation: challenge.impact
        }),
        otherChallenges.length > 0
          ? aiService.checkDuplicates({
              title: challenge.title,
              description: challenge.description,
              existingChallenges: otherChallenges
            })
          : Promise.resolve(null),
        aiService.summarize({
          title: challenge.title,
          description: challenge.description,
          location: challenge.location?.area || challenge.location?.landmark,
          district: challenge.district
        }),
        universities.length > 0
          ? aiService.matchUniversities(challenge, universities)
          : Promise.resolve(null)
      ]);

      if (classifyResult.status === 'fulfilled' && classifyResult.value) {
        challenge.aiClassification = classifyResult.value;
      } else if (classifyResult.status === 'rejected') {
        console.warn('[AI Service Notice] Classification failed:', classifyResult.reason?.message);
      }

      if (priorityResult.status === 'fulfilled' && priorityResult.value) {
        challenge.aiPriority = {
          recommendedPriority: priorityResult.value.recommendation,
          confidence: priorityResult.value.confidence,
          reasoning: priorityResult.value.reasoning
        };
      } else if (priorityResult.status === 'rejected') {
        console.warn('[AI Service Notice] Priority recommendation failed:', priorityResult.reason?.message);
      }

      if (dupResult.status === 'fulfilled' && dupResult.value) {
        challenge.aiDuplicateScore = dupResult.value.similarityScore || 0;
        challenge.aiDuplicates = (dupResult.value.topMatches || []).map((m) => ({
          challengeId: m.id,
          code: m.code,
          title: m.title,
          similarityScore: m.similarityScore
        }));
      } else if (dupResult.status === 'rejected') {
        console.warn('[AI Service Notice] Duplicate check failed:', dupResult.reason?.message);
      }

      if (summaryResult.status === 'fulfilled' && summaryResult.value?.summary) {
        challenge.aiSummary = summaryResult.value.summary;
      } else if (summaryResult.status === 'rejected') {
        console.warn('[AI Service Notice] Summarization failed:', summaryResult.reason?.message);
      }

      if (matchResult.status === 'fulfilled' && matchResult.value && matchResult.value.length > 0) {
        challenge.aiRecommendedUniversities = matchResult.value.map((r) => ({
          ...r,
          status: 'PENDING',
          matchedAt: new Date()
        }));
      } else if (matchResult.status === 'rejected') {
        console.warn('[AI Service Notice] University matching failed:', matchResult.reason?.message);
      }

      await challenge.save();
    } catch (aiBatchErr) {
      console.warn('[AI Service Notice] AI enrichment failed non-critically:', aiBatchErr.message);
    }

    const populated = await Challenge.findById(challenge._id).populate('submittedBy', 'name email organization role');

    // Notify administrators of new societal challenge
    try {
      const admins = await User.find({ role: 'ADMIN' });
      for (const admin of admins) {
        await dispatchNotification({
          recipient: admin._id,
          sender: req.user.id,
          senderName: req.user.name,
          type: 'CHALLENGE_SUBMITTED',
          title: 'New Societal Challenge Submitted',
          message: `Citizen [${req.user.name}] submitted challenge [${challenge.code || 'DEL'}] "${challenge.title}" in ${challenge.district}.`,
          relatedEntity: 'Challenge',
          relatedEntityId: challenge._id
        });
      }
    } catch (notifErr) {
      console.warn('[Notification Error]', notifErr.message);
    }

    return successResponse(res, 'Challenge submitted successfully for government verification', { challenge: populated }, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Get all challenges with filtering
 * GET /api/challenges
 */
const getChallenges = async (req, res, next) => {
  try {
    const { category, district, status, priority, submittedBy, assignedUniversity } = req.query;

    const query = {};
    if (category) query.category = category;
    if (district) query.district = district;
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (submittedBy) query.submittedBy = submittedBy;
    if (assignedUniversity) query.assignedUniversity = assignedUniversity;

    const challenges = await Challenge.find(query)
      .populate('submittedBy', 'name district organization')
      .populate('assignedUniversity', 'name email organization')
      .populate('assignedStudents', 'name email organization')
      .populate('industryPartner', 'name email organization')
      .sort({ createdAt: -1 });

    return successResponse(res, 'Challenges retrieved successfully', {
      count: challenges.length,
      challenges
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get challenge by ID
 * GET /api/challenges/:id
 */
const getChallengeById = async (req, res, next) => {
  try {
    const challenge = await Challenge.findById(req.params.id)
      .populate('submittedBy', 'name district organization')
      .populate('assignedUniversity', 'name email organization')
      .populate('assignedStudents', 'name email organization')
      .populate('industryPartner', 'name email organization');

    if (!challenge) {
      return errorResponse(res, 'Challenge not found', null, 404);
    }

    return successResponse(res, 'Challenge retrieved successfully', { challenge });
  } catch (error) {
    next(error);
  }
};

/**
 * Update challenge status & university allocation (Admin only)
 * PATCH /api/challenges/:id/status
 */
const updateStatus = async (req, res, next) => {
  try {
    const { status, assignedUniversity, priority } = req.body;

    const challenge = await Challenge.findById(req.params.id);
    if (!challenge) {
      return errorResponse(res, 'Challenge not found', null, 404);
    }

    if (status) challenge.status = status;
    if (assignedUniversity) challenge.assignedUniversity = assignedUniversity;
    if (priority) challenge.priority = priority;

    // Auto update milestones based on status
    if (status === 'verified' && challenge.milestones.length > 0) {
      challenge.milestones[0].completed = true;
    }
    if (status === 'assigned' && challenge.milestones.length > 1) {
      challenge.milestones[0].completed = true;
      challenge.milestones[1].completed = true;
    }

    await challenge.save();

    const updated = await Challenge.findById(challenge._id)
      .populate('submittedBy', 'name email organization')
      .populate('assignedUniversity', 'name email organization');

    return successResponse(res, 'Challenge status updated successfully', { challenge: updated });
  } catch (error) {
    next(error);
  }
};

/**
 * Assign cohort and faculty lead (University only)
 * POST /api/challenges/:id/assign-cohort
 */
const assignCohort = async (req, res, next) => {
  try {
    const { facultyLead, studentIds, solutionNotes } = req.body;

    const challenge = await Challenge.findById(req.params.id);
    if (!challenge) {
      return errorResponse(res, 'Challenge not found', null, 404);
    }

    if (facultyLead) challenge.facultyLead = facultyLead;
    if (studentIds && Array.isArray(studentIds)) {
      challenge.assignedStudents = studentIds;
    }
    if (solutionNotes) challenge.solutionNotes = solutionNotes;
    challenge.status = 'IN_PROGRESS';

    if (challenge.milestones.length > 1) {
      challenge.milestones[0].completed = true;
      challenge.milestones[1].completed = true;
    }

    await challenge.save();

    const updated = await Challenge.findById(challenge._id)
      .populate('submittedBy', 'name email organization')
      .populate('assignedUniversity', 'name email organization')
      .populate('assignedStudents', 'name email organization');

    return successResponse(res, 'Cohort assigned and project set to in-progress', { challenge: updated });
  } catch (error) {
    next(error);
  }
};

/**
 * Sponsor challenge (Industry only)
 * POST /api/challenges/:id/sponsor
 */
const sponsorChallenge = async (req, res, next) => {
  try {
    const { sponsoredAmount } = req.body;

    const challenge = await Challenge.findById(req.params.id);
    if (!challenge) {
      return errorResponse(res, 'Challenge not found', null, 404);
    }

    challenge.industryPartner = req.user.id;
    if (sponsoredAmount) {
      challenge.sponsoredAmount = Number(sponsoredAmount);
    }

    await challenge.save();

    const updated = await Challenge.findById(challenge._id)
      .populate('submittedBy', 'name email organization')
      .populate('assignedUniversity', 'name email organization')
      .populate('industryPartner', 'name email organization');

    return successResponse(res, 'Sponsorship pledged successfully', { challenge: updated });
  } catch (error) {
    next(error);
  }
};

/**
 * Get aggregated statistics for state portal
 * GET /api/challenges/stats
 */
const getStats = async (req, res, next) => {
  try {
    const total = await Challenge.countDocuments();
    const verified = await Challenge.countDocuments({ status: { $in: ['verified', 'assigned', 'in_progress', 'under_review', 'resolved'] } });
    const inProgress = await Challenge.countDocuments({ status: 'in_progress' });
    const resolved = await Challenge.countDocuments({ status: 'resolved' });

    const byDistrict = await Challenge.aggregate([
      { $group: { _id: '$district', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const byCategory = await Challenge.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    return successResponse(res, 'Statistics retrieved successfully', {
      total,
      verified,
      inProgress,
      resolved,
      byDistrict,
      byCategory
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createChallenge,
  getChallenges,
  getChallengeById,
  updateStatus,
  assignCohort,
  sponsorChallenge,
  getStats
};
