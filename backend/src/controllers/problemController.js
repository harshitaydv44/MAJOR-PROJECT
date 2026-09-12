const mongoose = require('mongoose');
const Challenge = require('../models/Challenge');
const User = require('../models/User');
const { dispatchNotification } = require('../services/notificationDispatcher');
const { uploadToCloudinary } = require('../services/cloudinaryService');
const { getIO } = require('../services/socketService');
const { successResponse, errorResponse } = require('../utils/responseHandler');

let aiService;
try {
  aiService = require('../services/aiService');
} catch (e) {
  aiService = null;
}

const VALID_CATEGORIES = [
  'Education',
  'Healthcare',
  'Agriculture',
  'Water Management',
  'Sanitation',
  'Environment',
  'Energy',
  'Urban Infrastructure',
  'Accessibility',
  'Public Services',
  'Rural Livelihoods',
  'Other'
];

const VALID_DISTRICTS = [
  'Central Delhi',
  'East Delhi',
  'New Delhi',
  'North Delhi',
  'North East Delhi',
  'North West Delhi',
  'Shahdara',
  'South Delhi',
  'South East Delhi',
  'South West Delhi',
  'West Delhi'
];

const DISTRICT_COORDINATES = {
  'Central Delhi': { lat: 28.6448, lng: 77.2167 },
  'East Delhi': { lat: 28.6280, lng: 77.2950 },
  'New Delhi': { lat: 28.6139, lng: 77.2090 },
  'North Delhi': { lat: 28.7041, lng: 77.1025 },
  'North East Delhi': { lat: 28.7180, lng: 77.2750 },
  'North West Delhi': { lat: 28.7500, lng: 77.1200 },
  'Shahdara': { lat: 28.6738, lng: 77.2882 },
  'South Delhi': { lat: 28.5355, lng: 77.2250 },
  'South East Delhi': { lat: 28.5500, lng: 77.2700 },
  'South West Delhi': { lat: 28.5921, lng: 77.0460 },
  'West Delhi': { lat: 28.6667, lng: 77.0667 }
};

/**
 * Helper to generate unique Challenge ID format DEL-YYYY-XXXXXX
 */
const generateChallengeCode = async () => {
  const year = new Date().getFullYear();
  let code = '';
  let isUnique = false;
  let attempts = 0;

  while (!isUnique && attempts < 10) {
    attempts++;
    const rand = Math.floor(100000 + Math.random() * 900000);
    code = `DEL-${year}-${rand}`;
    const existing = await Challenge.findOne({ code });
    if (!existing) {
      isUnique = true;
    }
  }
  return code || `DEL-${year}-${Date.now().toString().slice(-6)}`;
};

/**
 * Submit a new civic problem / challenge
 * POST /api/problems
 */
const createProblem = async (req, res, next) => {
  try {
    const userId = req.user.id;
    let {
      title,
      description,
      category,
      subcategory,
      expectedOutcome,
      district,
      location,
      impact,
      citizenUrgency,
      citizenSeverity,
      evidence,
      tags
    } = req.body;

    // Handle stringified JSON from multipart forms if sent that way
    if (typeof location === 'string') {
      try {
        location = JSON.parse(location);
      } catch (e) {}
    }
    if (typeof impact === 'string' && impact.startsWith('{')) {
      try {
        impact = JSON.parse(impact);
      } catch (e) {}
    }
    if (typeof tags === 'string') {
      try {
        tags = JSON.parse(tags);
      } catch (e) {
        tags = tags.split(',').map((t) => t.trim());
      }
    }
    if (typeof evidence === 'string') {
      try {
        evidence = JSON.parse(evidence);
      } catch (e) {
        evidence = [];
      }
    }

    // Validation
    if (!title || typeof title !== 'string' || title.trim().length < 3) {
      return errorResponse(res, 'Challenge title is required (at least 3 characters)', null, 400);
    }
    if (title.length > 250) {
      return errorResponse(res, 'Challenge title cannot exceed 250 characters', null, 400);
    }
    if (!description || typeof description !== 'string' || description.trim().length < 10) {
      return errorResponse(res, 'Detailed description is required (at least 10 characters)', null, 400);
    }
    if (!category || !VALID_CATEGORIES.includes(category)) {
      return errorResponse(res, `Valid category is required. Allowed: ${VALID_CATEGORIES.join(', ')}`, null, 400);
    }
    if (!district || !VALID_DISTRICTS.includes(district)) {
      return errorResponse(res, `Valid Delhi district is required. Allowed: ${VALID_DISTRICTS.join(', ')}`, null, 400);
    }

    // 5-minute duplicate submission check
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const existingDuplicate = await Challenge.findOne({
      submittedBy: userId,
      title: title.trim(),
      createdAt: { $gte: fiveMinutesAgo }
    });
    if (existingDuplicate) {
      return errorResponse(
        res,
        'Duplicate challenge submission detected. A challenge with this title was recently submitted.',
        null,
        429
      );
    }

    // Coordinates fallback
    const defaultCoords = DISTRICT_COORDINATES[district] || { lat: 28.6139, lng: 77.2090 };
    const finalCoordinates = {
      lat: Number(location?.coordinates?.lat) || defaultCoords.lat,
      lng: Number(location?.coordinates?.lng) || defaultCoords.lng
    };

    const finalLocation = {
      area: location?.area ? String(location.area).trim() : '',
      landmark: location?.landmark ? String(location.landmark).trim() : '',
      coordinates: finalCoordinates
    };

    // Attachments / Evidence processing (Multer files + JSON evidence)
    const processedEvidence = Array.isArray(evidence) ? [...evidence] : [];
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      for (const file of req.files) {
        const uploadResult = await uploadToCloudinary(
          file.buffer,
          file.originalname,
          'delhi_portal_evidence'
        );
        processedEvidence.push({
          title: file.originalname,
          url: uploadResult.url,
          fileType: file.mimetype,
          uploadedAt: new Date()
        });
      }
    }

    const uniqueCode = await generateChallengeCode();
    const cleanUrgency = ['low', 'medium', 'high', 'immediate'].includes(citizenUrgency)
      ? citizenUrgency
      : 'medium';
    const cleanSeverity = ['minor', 'moderate', 'severe', 'critical'].includes(citizenSeverity)
      ? citizenSeverity
      : 'moderate';

    // System priority derived from submitter urgency/severity flags
    let derivedPriority = 'medium';
    if (cleanUrgency === 'immediate' || cleanSeverity === 'critical') {
      derivedPriority = 'high';
    } else if (cleanUrgency === 'low' && cleanSeverity === 'minor') {
      derivedPriority = 'low';
    }

    const initialHistory = [
      {
        status: 'SUBMITTED',
        label: 'Challenge Submitted',
        publicMessage: 'Your community challenge has been registered and is queued for verification.',
        comment: 'Challenge registered by citizen in municipal portal.',
        changedAt: new Date()
      }
    ];

    const challenge = await Challenge.create({
      code: uniqueCode,
      title: title.trim(),
      description: description.trim(),
      category,
      subcategory: subcategory ? String(subcategory).trim() : '',
      expectedOutcome: expectedOutcome ? String(expectedOutcome).trim() : '',
      district,
      location: finalLocation,
      submittedBy: userId,
      status: 'SUBMITTED',
      priority: derivedPriority,
      citizenUrgency: cleanUrgency,
      citizenSeverity: cleanSeverity,
      urgency: cleanUrgency,
      severity: cleanSeverity,
      impact: impact || 'Estimated 5,000+ local citizens and commuters affected',
      evidence: processedEvidence,
      statusHistory: initialHistory,
      timeline: [
        {
          status: 'SUBMITTED',
          label: 'Challenge Submitted',
          comment: 'Your community challenge has been registered and is queued for verification.',
          date: new Date()
        }
      ],
      milestones: [
        { title: 'Community Problem Verification', completed: false },
        { title: 'University Research & Team Assignment', completed: false },
        { title: 'Functional Prototype Development', completed: false },
        { title: 'Pilot Field Testing in Delhi Ward', completed: false }
      ],
      tags: Array.isArray(tags) ? tags : [category.toLowerCase().replace(/\s+/g, '-'), district.toLowerCase().replace(/\s+/g, '-')]
    });

    const populated = await Challenge.findById(challenge._id)
      .populate('submittedBy', 'name email organization role district')
      .select('-internalNotes');

    // Citizen confirmation notification
    try {
      await dispatchNotification({
        recipient: userId,
        sender: null,
        senderName: 'Delhi Societal Innovation Council',
        type: 'CHALLENGE_SUBMITTED',
        title: 'Challenge Registered Successfully',
        message: `Your challenge [${challenge.code}] "${challenge.title}" has been registered and is awaiting municipal vetting.`,
        relatedEntity: 'Challenge',
        relatedEntityId: challenge._id
      });

      // Admin notification
      const admins = await User.find({ role: 'ADMIN' });
      for (const admin of admins) {
        await dispatchNotification({
          recipient: admin._id,
          sender: userId,
          senderName: req.user.name,
          type: 'CHALLENGE_SUBMITTED',
          title: 'New Societal Challenge Submitted',
          message: `Citizen [${req.user.name}] submitted challenge [${challenge.code}] "${challenge.title}" in ${challenge.district}.`,
          relatedEntity: 'Challenge',
          relatedEntityId: challenge._id
        });
      }
    } catch (notifErr) {
      console.warn('[Notification Notice]', notifErr.message);
    }

    // Real-time notification emission via Socket.IO
    try {
      const io = getIO();
      if (io) {
        io.to(`user_${userId}`).emit('challenge_created', { challenge: populated });
        io.to('admin_channel').emit('new_challenge', { challenge: populated });
      }
    } catch (sockErr) {
      console.warn('[Socket Notice]', sockErr.message);
    }

    // Asynchronous AI enrichment in background (non-blocking)
    if (aiService) {
      (async () => {
        try {
          const classResult = await aiService.classify(challenge.title, challenge.description);
          const priorityResult = await aiService.recommendPriority({
            title: challenge.title,
            description: challenge.description,
            urgency: cleanUrgency,
            severity: cleanSeverity,
            affectedPopulation: challenge.impact?.estimatedPeopleAffected || 5000
          });

          const updates = {};
          if (classResult) {
            updates.aiClassification = {
              category: classResult.category,
              subcategory: classResult.subcategory,
              confidence: classResult.confidence,
              requiresHumanReview: classResult.requiresHumanReview,
              explanation: classResult.explanation
            };
          }
          if (priorityResult && priorityResult.recommendation) {
            updates.aiPriority = {
              recommendedPriority: priorityResult.recommendation.toLowerCase(),
              confidence: priorityResult.confidence || 0.8,
              reasoning: priorityResult.reasoning || ''
            };
          }

          if (Object.keys(updates).length > 0) {
            await Challenge.findByIdAndUpdate(challenge._id, updates);
          }
        } catch (aiErr) {
          console.warn('[Background AI Enrichment Notice]', aiErr.message);
        }
      })();
    }

    return successResponse(
      res,
      'Challenge submitted successfully for government verification',
      { challenge: populated },
      201
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get challenges submitted by the authenticated citizen with search, filter, pagination
 * GET /api/problems/my
 */
const getMyProblems = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const {
      search,
      category,
      status,
      sort = 'newest',
      page = 1,
      limit = 20
    } = req.query;

    const query = { submittedBy: userId };

    // Search by title, code, or description
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { code: searchRegex },
        { title: searchRegex },
        { description: searchRegex }
      ];
    }

    // Category filter
    if (category && category !== 'All Categories') {
      query.category = category;
    }

    // Status filter
    if (status && status !== 'All Statuses') {
      query.status = status.toUpperCase();
    }

    // Sorting
    let sortOptions = { createdAt: -1 };
    if (sort === 'oldest') sortOptions = { createdAt: 1 };
    if (sort === 'updated') sortOptions = { updatedAt: -1 };
    if (sort === 'priority') sortOptions = { priority: -1, createdAt: -1 };

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    // Fetch user's matching challenges and total count
    const [problems, totalMatching, allUserProblems] = await Promise.all([
      Challenge.find(query)
        .populate('submittedBy', 'name email organization phone district')
        .populate('assignedUniversity', 'name email organization')
        .populate('assignedStudents', 'name email organization')
        .populate('industryPartner', 'name email organization')
        .select('-internalNotes')
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum),
      Challenge.countDocuments(query),
      Challenge.find({ submittedBy: userId }).select('status')
    ]);

    // Calculate aggregated citizen metrics for dashboard cards
    const total = allUserProblems.length;
    const submitted = allUserProblems.filter((p) => p.status === 'SUBMITTED').length;
    const underReview = allUserProblems.filter((p) =>
      ['UNDER_REVIEW', 'VALIDATED'].includes(p.status)
    ).length;
    const inProgress = allUserProblems.filter((p) =>
      ['ASSIGNED', 'IN_PROGRESS', 'SOLUTION_PROPOSED', 'PILOT_TESTING'].includes(p.status)
    ).length;
    const resolved = allUserProblems.filter((p) => p.status === 'RESOLVED').length;
    const needsInfo = allUserProblems.filter((p) => p.status === 'NEEDS_INFORMATION').length;

    return successResponse(res, 'Citizen challenges retrieved successfully', {
      stats: {
        total,
        submitted,
        underReview,
        inProgress,
        resolved,
        needsInfo
      },
      count: problems.length,
      problems,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalMatching,
        totalPages: Math.ceil(totalMatching / limitNum) || 1
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single problem details by ID with IDOR protection
 * GET /api/problems/:id
 */
const getProblemById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Support lookup by either ObjectId or DEL code
    let problem;
    if (mongoose.Types.ObjectId.isValid(id)) {
      problem = await Challenge.findById(id);
    } else {
      problem = await Challenge.findOne({ code: id });
    }

    if (!problem) {
      return errorResponse(res, 'Societal challenge record not found', null, 404);
    }

    // IDOR Enforcement: If user is CLIENT, they must either own the problem or have saved it
    const isOwner =
      problem.submittedBy && problem.submittedBy.toString() === req.user.id.toString();
    const isSaved =
      Array.isArray(problem.savedBy) &&
      problem.savedBy.some((savedId) => savedId.toString() === req.user.id.toString());

    if (req.user.role === 'CLIENT' && !isOwner && !isSaved) {
      return errorResponse(
        res,
        'Access denied. You are only authorized to inspect your own challenge submissions or bookmarks.',
        null,
        403
      );
    }

    // Populate relations
    const populated = await Challenge.findById(problem._id)
      .populate('submittedBy', 'name email organization phone district')
      .populate('assignedUniversity', 'name email organization phone district')
      .populate('assignedStudents', 'name email organization phone')
      .populate('industryPartner', 'name email organization')
      .populate('assignedProject', 'title status overallProgress timeline');

    // Never leak internal notes to citizen role
    const problemObj = populated.toObject();
    if (req.user.role === 'CLIENT') {
      delete problemObj.internalNotes;
    }

    return successResponse(res, 'Societal challenge retrieved successfully', {
      problem: problemObj,
      isSaved
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update challenge details (only allowed in SUBMITTED or NEEDS_INFORMATION state)
 * PUT /api/problems/:id
 */
const updateProblem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const problem = await Challenge.findById(id);

    if (!problem) {
      return errorResponse(res, 'Challenge not found', null, 404);
    }

    // Ownership check
    if (problem.submittedBy.toString() !== req.user.id.toString()) {
      return errorResponse(res, 'You are only authorized to modify challenges you submitted', null, 403);
    }

    // Stage permission check: allow editing ONLY in SUBMITTED or NEEDS_INFORMATION
    if (!['SUBMITTED', 'NEEDS_INFORMATION'].includes(problem.status)) {
      return errorResponse(
        res,
        `Editing is disabled because this challenge has transitioned into '${problem.status}' stage.`,
        null,
        403
      );
    }

    const {
      title,
      description,
      category,
      subcategory,
      expectedOutcome,
      district,
      location,
      impact,
      citizenUrgency,
      citizenSeverity,
      tags
    } = req.body;

    if (title && title.trim()) problem.title = title.trim();
    if (description && description.trim()) problem.description = description.trim();
    if (category && VALID_CATEGORIES.includes(category)) problem.category = category;
    if (subcategory !== undefined) problem.subcategory = String(subcategory).trim();
    if (expectedOutcome !== undefined) problem.expectedOutcome = String(expectedOutcome).trim();
    if (district && VALID_DISTRICTS.includes(district)) problem.district = district;
    if (location) {
      problem.location = {
        area: location.area ? String(location.area).trim() : problem.location?.area || '',
        landmark: location.landmark ? String(location.landmark).trim() : problem.location?.landmark || '',
        coordinates: {
          lat: Number(location.coordinates?.lat) || problem.location?.coordinates?.lat || 28.6139,
          lng: Number(location.coordinates?.lng) || problem.location?.coordinates?.lng || 77.2090
        }
      };
    }
    if (impact !== undefined) problem.impact = impact;
    if (citizenUrgency && ['low', 'medium', 'high', 'immediate'].includes(citizenUrgency)) {
      problem.citizenUrgency = citizenUrgency;
      problem.urgency = citizenUrgency;
    }
    if (citizenSeverity && ['minor', 'moderate', 'severe', 'critical'].includes(citizenSeverity)) {
      problem.citizenSeverity = citizenSeverity;
      problem.severity = citizenSeverity;
    }
    if (Array.isArray(tags)) problem.tags = tags;

    // If challenge was in NEEDS_INFORMATION, transition back to UNDER_REVIEW
    if (problem.status === 'NEEDS_INFORMATION') {
      problem.status = 'UNDER_REVIEW';
    }

    // Append update event to history
    const updateEvent = {
      status: problem.status,
      label: 'Challenge Details Updated',
      publicMessage: 'Citizen submitter revised the problem specification and supplementary notes.',
      comment: 'Details updated by citizen.',
      changedAt: new Date()
    };
    problem.statusHistory.push(updateEvent);
    problem.timeline.push({
      status: problem.status,
      label: 'Challenge Details Updated',
      comment: 'Details updated by citizen.',
      date: new Date()
    });

    await problem.save();

    const sanitized = await Challenge.findById(problem._id)
      .populate('submittedBy', 'name email organization district')
      .select('-internalNotes');

    return successResponse(res, 'Challenge updated successfully', { problem: sanitized });
  } catch (error) {
    next(error);
  }
};

/**
 * Provide additional information in response to administrative request
 * POST /api/problems/:id/information
 */
const provideAdditionalInfo = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { notes, additionalEvidence } = req.body;

    const problem = await Challenge.findById(id);
    if (!problem) {
      return errorResponse(res, 'Challenge not found', null, 404);
    }

    // Ownership check
    if (problem.submittedBy.toString() !== req.user.id.toString()) {
      return errorResponse(res, 'Unauthorized. You may only provide details for your own submissions.', null, 403);
    }

    // Append notes
    if (notes && typeof notes === 'string') {
      if (typeof problem.impact === 'object' && problem.impact !== null) {
        problem.impact.additionalInformation = notes.trim();
        problem.markModified('impact');
      } else {
        problem.solutionNotes = notes.trim();
      }
    }

    // Append supplementary evidence if provided
    if (Array.isArray(additionalEvidence)) {
      problem.evidence.push(...additionalEvidence);
    }

    // Transition status to UNDER_REVIEW
    problem.status = 'UNDER_REVIEW';

    const infoEvent = {
      status: 'UNDER_REVIEW',
      label: 'Supplementary Information Submitted',
      publicMessage: 'Citizen submitter provided the requested additional details.',
      comment: notes ? notes.trim() : 'Supplementary information provided.',
      changedAt: new Date()
    };
    problem.statusHistory.push(infoEvent);
    problem.timeline.push({
      status: 'UNDER_REVIEW',
      label: 'Supplementary Information Submitted',
      comment: notes ? notes.trim() : 'Supplementary information provided.',
      date: new Date()
    });

    await problem.save();

    // Notify admins of citizen update
    try {
      const admins = await User.find({ role: 'ADMIN' });
      for (const admin of admins) {
        await dispatchNotification({
          recipient: admin._id,
          sender: req.user.id,
          senderName: req.user.name,
          type: 'STAGE_TRANSITION',
          title: 'Citizen Provided Requested Information',
          message: `Citizen [${req.user.name}] submitted supplementary information for challenge [${problem.code}].`,
          relatedEntity: 'Challenge',
          relatedEntityId: problem._id
        });
      }
    } catch (e) {}

    const sanitized = await Challenge.findById(problem._id)
      .populate('submittedBy', 'name email organization district')
      .select('-internalNotes');

    return successResponse(res, 'Supplementary information submitted successfully', {
      problem: sanitized
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Save / Bookmark a challenge
 * POST /api/problems/:id/save
 */
const saveProblem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const problem = await Challenge.findById(id);
    if (!problem) {
      return errorResponse(res, 'Challenge not found', null, 404);
    }

    if (!problem.savedBy.some((uId) => uId.toString() === userId.toString())) {
      problem.savedBy.push(userId);
      await problem.save();
    }

    return successResponse(res, 'Challenge bookmarked successfully', { isSaved: true });
  } catch (error) {
    next(error);
  }
};

/**
 * Remove saved / bookmark from a challenge
 * DELETE /api/problems/:id/save
 */
const unsaveProblem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const problem = await Challenge.findById(id);
    if (!problem) {
      return errorResponse(res, 'Challenge not found', null, 404);
    }

    problem.savedBy = problem.savedBy.filter(
      (uId) => uId.toString() !== userId.toString()
    );
    await problem.save();

    return successResponse(res, 'Challenge removed from bookmarks', { isSaved: false });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all saved challenges for authenticated citizen
 * GET /api/problems/saved
 */
const getSavedProblems = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const problems = await Challenge.find({ savedBy: userId })
      .populate('submittedBy', 'name email organization district')
      .populate('assignedUniversity', 'name email organization')
      .select('-internalNotes')
      .sort({ createdAt: -1 });

    return successResponse(res, 'Saved challenges retrieved successfully', {
      count: problems.length,
      problems
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createProblem,
  getMyProblems,
  getProblemById,
  updateProblem,
  provideAdditionalInfo,
  saveProblem,
  unsaveProblem,
  getSavedProblems
};
