const Project = require('../models/Project');
const Challenge = require('../models/Challenge');
const Faculty = require('../models/Faculty');
const Student = require('../models/Student');
const Team = require('../models/Team');
const AuditLog = require('../models/AuditLog');
const Notification = require('../models/Notification');
const User = require('../models/User');
const Industry = require('../models/Industry');
const aiService = require('../services/aiService');
const { dispatchNotification } = require('../services/notificationDispatcher');
const { sendRealtimeProjectMessage, sendRealtimeProjectUpdate } = require('../services/socketService');
const { uploadToCloudinary } = require('../services/cloudinaryService');
const { successResponse, errorResponse } = require('../utils/responseHandler');

/**
 * Valid stage transition mapping for the 11-stage project lifecycle
 */
const VALID_TRANSITIONS = {
  CHALLENGE_ACCEPTED: ['PROJECT_CREATED'],
  PROJECT_CREATED: ['PROPOSAL_SUBMITTED'],
  PROPOSAL_SUBMITTED: ['APPROVED', 'PROJECT_CREATED'],
  APPROVED: ['RESEARCH', 'PROTOTYPE'],
  RESEARCH: ['PROTOTYPE'],
  PROTOTYPE: ['TESTING', 'RESEARCH'],
  TESTING: ['PILOT', 'PROTOTYPE'],
  PILOT: ['VALIDATION', 'TESTING'],
  VALIDATION: ['DEPLOYMENT', 'PILOT'],
  DEPLOYMENT: ['COMPLETED', 'VALIDATION'],
  COMPLETED: []
};

/**
 * Stage weight fallbacks if milestones are not yet populated
 */
const STAGE_PROGRESS_MAP = {
  CHALLENGE_ACCEPTED: 5,
  PROJECT_CREATED: 10,
  PROPOSAL_SUBMITTED: 20,
  APPROVED: 25,
  RESEARCH: 35,
  PROTOTYPE: 50,
  TESTING: 65,
  PILOT: 80,
  VALIDATION: 90,
  DEPLOYMENT: 95,
  COMPLETED: 100
};

/**
 * Calculate overall project progress from milestone completion
 */
const recalculateProjectProgress = (project) => {
  if (project.status === 'COMPLETED') return 100;

  if (!project.milestones || project.milestones.length === 0) {
    return STAGE_PROGRESS_MAP[project.status] || 0;
  }

  const total = project.milestones.reduce((acc, m) => {
    if (m.status === 'COMPLETED') return acc + 100;
    if (m.status === 'NOT_STARTED') return acc + 0;
    return acc + (Number(m.progress) || 0);
  }, 0);

  return Math.min(100, Math.round(total / project.milestones.length));
};

/**
 * Access Control Helper: Validates whether user is authorized to inspect or modify a project
 */
const checkProjectAccess = async (project, user, allowedRoles = []) => {
  if (!project || !user) return false;
  if (user.role === 'ADMIN') return true;
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) return false;

  const userId = user.id || user._id;

  if (user.role === 'UNIVERSITY') {
    const pUniId = project.universityId?._id || project.universityId;
    return pUniId && pUniId.toString() === userId.toString();
  }

  if (user.role === 'FACULTY') {
    const faculty = await Faculty.findOne({ user: userId });
    if (!faculty || !project.mentor) return false;
    const pMentorId = project.mentor?._id || project.mentor;
    return pMentorId && pMentorId.toString() === faculty._id.toString();
  }

  if (user.role === 'STUDENT') {
    const student = await Student.findOne({ user: userId });
    if (!student || !project.team) return false;
    const team = await Team.findById(project.team);
    if (!team) return false;
    return team.members.some((m) => m.student?.toString() === student._id.toString());
  }

  if (user.role === 'INDUSTRY') {
    return (project.industryPartners || []).some(
      (p) => (p._id || p).toString() === userId.toString()
    );
  }

  if (user.role === 'CLIENT') {
    // Client can inspect public verified projects or projects originating from challenges they filed
    const challenge = await Challenge.findById(project.challengeId);
    if (challenge && challenge.submittedBy?.toString() === userId.toString()) {
      return true;
    }
    return ['APPROVED', 'RESEARCH', 'PROTOTYPE', 'TESTING', 'PILOT', 'VALIDATION', 'DEPLOYMENT', 'COMPLETED'].includes(
      project.status
    );
  }

  return false;
};

/**
 * Get projects based on stakeholder role
 * GET /api/projects
 */
const getProjects = async (req, res, next) => {
  try {
    const role = req.user.role;
    const filter = {};

    if (role === 'UNIVERSITY') {
      filter.universityId = req.user.id;
    } else if (role === 'FACULTY') {
      const faculty = await Faculty.findOne({ user: req.user.id });
      if (faculty) {
        filter.mentor = faculty._id;
      } else {
        return successResponse(res, 'No assigned projects found', { projects: [] });
      }
    } else if (role === 'STUDENT') {
      const student = await Student.findOne({ user: req.user.id });
      if (student) {
        const teams = await Team.find({ 'members.student': student._id });
        const teamIds = teams.map((t) => t._id);
        filter.team = { $in: teamIds };
      } else {
        return successResponse(res, 'No assigned student projects found', { projects: [] });
      }
    } else if (role === 'INDUSTRY') {
      filter.industryPartners = req.user.id;
    } else if (role === 'CLIENT') {
      // Clients only see public approved / in-progress societal projects
      filter.status = {
        $in: ['APPROVED', 'RESEARCH', 'PROTOTYPE', 'TESTING', 'PILOT', 'VALIDATION', 'DEPLOYMENT', 'COMPLETED']
      };
    }

    const projects = await Project.find(filter)
      .populate('challengeId', 'code title category district priority status impact')
      .populate('universityId', 'name email organization district')
      .populate('mentor', 'name department specialization email')
      .populate('industryPartners', 'name email organization')
      .populate('team', 'name members')
      .sort({ updatedAt: -1 });

    return successResponse(res, 'Projects retrieved successfully', { projects });
  } catch (error) {
    next(error);
  }
};

/**
 * Get project by ID
 * GET /api/projects/:id
 */
const getProjectById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const project = await Project.findById(id)
      .populate('challengeId')
      .populate('universityId', 'name email organization district phone')
      .populate('mentor')
      .populate('industryPartners', 'name email organization district website')
      .populate({
        path: 'team',
        populate: [
          {
            path: 'members.student',
            select: 'name email department year skills expertise'
          },
          {
            path: 'facultyMentor',
            select: 'name email department specialization'
          }
        ]
      });

    if (!project) {
      return errorResponse(res, 'Project not found', null, 404);
    }

    // Role-based visibility and IDOR protection
    const hasAccess = await checkProjectAccess(
      project,
      req.user,
      ['UNIVERSITY', 'FACULTY', 'STUDENT', 'INDUSTRY', 'ADMIN', 'CLIENT']
    );
    if (!hasAccess) {
      return errorResponse(res, 'Access denied. You are not authorized to inspect this project.', null, 403);
    }

    // Privacy Redaction for CLIENT / Public viewers: Hide internal budgets, proposal reviews, student contact phones
    if (req.user.role === 'CLIENT') {
      project.budget = undefined;
      project.aiRecommendedIndustries = undefined;
      if (project.proposal) {
        project.proposal.reviewNotes = undefined;
      }
    }

    // Dynamic progress update check
    project.overallProgress = recalculateProjectProgress(project);

    return successResponse(res, 'Project details retrieved successfully', { project });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new project linked to an accepted challenge
 * POST /api/projects
 */
const createProject = async (req, res, next) => {
  try {
    if (req.user.role !== 'UNIVERSITY' && req.user.role !== 'ADMIN') {
      return errorResponse(res, 'Only university administrators can create projects', null, 403);
    }

    const {
      challengeId,
      title,
      description,
      proposedSolution,
      objectives,
      technologies,
      timeline,
      budget,
      teamRequirements,
      mentor
    } = req.body;

    const challenge = await Challenge.findById(challengeId);
    if (!challenge) {
      return errorResponse(res, 'Associated challenge not found', null, 404);
    }

    const universityId = req.user.role === 'UNIVERSITY' ? req.user.id : req.body.universityId;
    if (!universityId) {
      return errorResponse(res, 'University ID is required', null, 400);
    }

    const defaultMilestones = [
      {
        title: 'Municipal Baseline Survey & Technical Feasibility',
        description: 'Site reconnaissance, citizen input verification, and preliminary system design.',
        status: 'IN_PROGRESS',
        progress: 30,
        startDate: new Date(),
        dueDate: new Date(Date.now() + 30 * 86400000),
        deliverables: ['Baseline site survey report', 'Sensor specification document']
      },
      {
        title: 'Laboratory Hardware & Software Prototype Fabrication',
        description: 'Assembly of core electronics and firmware test bench.',
        status: 'NOT_STARTED',
        progress: 0,
        dueDate: new Date(Date.now() + 90 * 86400000),
        deliverables: ['Working benchtop prototype', 'Firmware repository']
      },
      {
        title: 'Field Pilot Testing & Citizen Validation',
        description: 'On-site installation at Delhi field site and municipal verification.',
        status: 'NOT_STARTED',
        progress: 0,
        dueDate: new Date(Date.now() + 180 * 86400000),
        deliverables: ['Ward performance certification', 'PWD/MCD handover document']
      }
    ];

    const project = new Project({
      challengeId,
      universityId,
      title,
      description,
      proposedSolution,
      objectives: Array.isArray(objectives) ? objectives : [],
      technologies: Array.isArray(technologies) ? technologies : [],
      timeline: timeline || '6 Months',
      budget: budget || { estimatedAmount: 0, breakdown: '' },
      teamRequirements: teamRequirements || '',
      mentor: mentor || undefined,
      milestones: defaultMilestones,
      status: 'PROJECT_CREATED',
      overallProgress: 10,
      updates: [
        {
          user: req.user.id,
          userName: req.user.name || 'University Administrator',
          userRole: req.user.role,
          title: 'Project Initiated',
          content: `University innovation project "${title}" was created from challenge [${challenge.code}].`,
          type: 'STAGE_TRANSITION',
          createdAt: new Date()
        }
      ]
    });

    project.overallProgress = recalculateProjectProgress(project);
    await project.save();

    // Link project back to Challenge
    await Challenge.findByIdAndUpdate(challengeId, {
      assignedProject: project._id,
      status: 'IN_PROGRESS'
    });

    // Log in AuditLog
    await AuditLog.create({
      challenge: challengeId,
      user: req.user.id,
      userName: req.user.name || 'University Administrator',
      userRole: req.user.role,
      action: 'CREATE_PROJECT',
      previousStatus: challenge.status,
      newStatus: 'IN_PROGRESS',
      comment: `Project created: "${title}"`
    });

    // Notify citizen submitter if linked
    if (challenge.submittedBy) {
      await dispatchNotification({
        recipient: challenge.submittedBy,
        sender: req.user.id,
        senderName: req.user.name,
        type: 'PROJECT_CREATED',
        title: 'Innovation Project Initiated',
        message: `University team has initiated innovation project "${title}" for your challenge [${challenge.code}].`,
        relatedEntity: 'Project',
        relatedEntityId: project._id
      });
    }

    return successResponse(res, 'Project created successfully', { project }, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Transition Project Lifecycle Stage
 * POST /api/projects/:id/transition
 */
const transitionStage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { targetStage, notes } = req.body;

    if (!targetStage) {
      return errorResponse(res, 'Target stage is required', null, 400);
    }

    const project = await Project.findById(id).populate('challengeId universityId mentor');
    if (!project) {
      return errorResponse(res, 'Project not found', null, 404);
    }

    const hasAccess = await checkProjectAccess(project, req.user, ['UNIVERSITY', 'FACULTY', 'ADMIN']);
    if (!hasAccess) {
      return errorResponse(res, 'Unauthorized to transition this project lifecycle stage', null, 403);
    }

    const currentStage = project.status;
    const allowedNext = VALID_TRANSITIONS[currentStage] || [];

    // Admin can override or perform intervention; otherwise enforce transition state machine
    if (req.user.role !== 'ADMIN' && !allowedNext.includes(targetStage)) {
      return errorResponse(
        res,
        `Invalid stage transition from "${currentStage}" to "${targetStage}". Allowed next stage(s): [${allowedNext.join(', ')}]`,
        null,
        400
      );
    }

    // Role-based restrictions
    if (targetStage === 'APPROVED' && req.user.role !== 'ADMIN') {
      return errorResponse(res, 'Only government administrators can approve project proposals', null, 403);
    }

    // Update status
    project.status = targetStage;
    project.overallProgress = recalculateProjectProgress(project);

    // Record activity timeline update
    project.updates.unshift({
      user: req.user.id,
      userName: req.user.name || 'Authorized Lead',
      userRole: req.user.role,
      title: `Stage Advanced: ${targetStage}`,
      content: notes || `Project lifecycle successfully transitioned from ${currentStage} to ${targetStage}.`,
      type: 'STAGE_TRANSITION',
      createdAt: new Date()
    });

    await project.save();

    // Broadcast real-time update to project room
    sendRealtimeProjectUpdate(id, project.updates[0]);

    const notifType = targetStage === 'COMPLETED' ? 'PROJECT_COMPLETED' : 'STAGE_TRANSITION';

    // 1. Notify Citizen Submitter
    if (project.challengeId?.submittedBy) {
      await dispatchNotification({
        recipient: project.challengeId.submittedBy,
        sender: req.user.id,
        senderName: req.user.name,
        title: `Project Update: [${project.challengeId.code || 'DEL'}]`,
        message: `The engineering project for your challenge has advanced to the "${targetStage}" stage.`,
        type: notifType,
        relatedEntity: 'Project',
        relatedEntityId: project._id
      });
    }

    // 2. Notify University
    if (project.universityId?._id && req.user.id !== project.universityId._id.toString()) {
      await dispatchNotification({
        recipient: project.universityId._id,
        sender: req.user.id,
        senderName: req.user.name,
        title: `Stage Advanced: ${project.title}`,
        message: `Project stage transitioned to "${targetStage}".`,
        type: notifType,
        relatedEntity: 'Project',
        relatedEntityId: project._id
      });
    }

    return successResponse(res, `Project successfully transitioned to ${targetStage}`, { project });
  } catch (error) {
    next(error);
  }
};

/**
 * Add Milestone to Project
 * POST /api/projects/:id/milestones
 */
const addMilestone = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, startDate, dueDate, deliverables, assignedMembers } = req.body;

    if (!title) {
      return errorResponse(res, 'Milestone title is required', null, 400);
    }

    const project = await Project.findById(id);
    if (!project) {
      return errorResponse(res, 'Project not found', null, 404);
    }

    const hasAccess = await checkProjectAccess(project, req.user, ['UNIVERSITY', 'FACULTY', 'ADMIN']);
    if (!hasAccess) {
      return errorResponse(res, 'Unauthorized to add milestone to this project', null, 403);
    }

    project.milestones.push({
      title: title.trim(),
      description: description || '',
      startDate: startDate || new Date(),
      dueDate: dueDate || undefined,
      status: 'NOT_STARTED',
      progress: 0,
      deliverables: Array.isArray(deliverables) ? deliverables : [],
      assignedMembers: Array.isArray(assignedMembers) ? assignedMembers : []
    });

    project.overallProgress = recalculateProjectProgress(project);

    project.updates.unshift({
      user: req.user.id,
      userName: req.user.name,
      userRole: req.user.role,
      title: 'Milestone Added',
      content: `New milestone "${title}" created.`,
      type: 'UPDATE',
      createdAt: new Date()
    });

    await project.save();

    return successResponse(res, 'Milestone added successfully', { project }, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Update Milestone
 * PUT /api/projects/:id/milestones/:milestoneId
 */
const updateMilestone = async (req, res, next) => {
  try {
    const { id, milestoneId } = req.params;
    const { title, description, startDate, dueDate, status, progress, deliverables } = req.body;

    const project = await Project.findById(id);
    if (!project) {
      return errorResponse(res, 'Project not found', null, 404);
    }

    const hasAccess = await checkProjectAccess(project, req.user, ['UNIVERSITY', 'FACULTY', 'STUDENT', 'ADMIN']);
    if (!hasAccess) {
      return errorResponse(res, 'Unauthorized to update milestone for this project', null, 403);
    }

    const milestone = project.milestones.id(milestoneId);
    if (!milestone) {
      return errorResponse(res, 'Milestone not found', null, 404);
    }

    if (title) milestone.title = title.trim();
    if (description !== undefined) milestone.description = description.trim();
    if (startDate) milestone.startDate = startDate;
    if (dueDate) milestone.dueDate = dueDate;
    if (deliverables && Array.isArray(deliverables)) milestone.deliverables = deliverables;

    if (status) {
      milestone.status = status;
      if (status === 'COMPLETED') {
        milestone.progress = 100;
        milestone.completedDate = new Date();
      }
    }

    if (progress !== undefined && milestone.status !== 'COMPLETED') {
      milestone.progress = Math.min(100, Math.max(0, Number(progress) || 0));
      if (milestone.progress === 100) {
        milestone.status = 'COMPLETED';
        milestone.completedDate = new Date();
      }
    }

    project.overallProgress = recalculateProjectProgress(project);

    // If milestone completed or delayed, log update and notify
    if (status === 'COMPLETED') {
      project.updates.unshift({
        user: req.user.id,
        userName: req.user.name,
        userRole: req.user.role,
        title: 'Milestone Completed',
        content: `Milestone "${milestone.title}" was marked 100% complete.`,
        type: 'MILESTONE_COMPLETION',
        createdAt: new Date()
      });
      sendRealtimeProjectUpdate(id, project.updates[0]);

      if (project.universityId) {
        await dispatchNotification({
          recipient: project.universityId,
          sender: req.user.id,
          senderName: req.user.name,
          title: 'Milestone Completed',
          message: `Milestone "${milestone.title}" in project "${project.title}" was completed.`,
          type: 'MILESTONE_COMPLETED',
          relatedEntity: 'Project',
          relatedEntityId: project._id
        });
      }
    } else if (status === 'DELAYED') {
      if (project.universityId) {
        await dispatchNotification({
          recipient: project.universityId,
          sender: req.user.id,
          senderName: req.user.name,
          title: 'Milestone Schedule Delayed',
          message: `Milestone "${milestone.title}" in project "${project.title}" has been flagged as delayed.`,
          type: 'PROJECT_DELAYED',
          relatedEntity: 'Project',
          relatedEntityId: project._id
        });
      }
    } else {
      sendRealtimeProjectUpdate(id, {
        type: 'MILESTONE_UPDATED',
        milestoneId,
        progress: milestone.progress,
        status: milestone.status,
        overallProgress: project.overallProgress
      });
    }

    await project.save();

    return successResponse(res, 'Milestone updated successfully', { project, milestone });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete Milestone
 * DELETE /api/projects/:id/milestones/:milestoneId
 */
const deleteMilestone = async (req, res, next) => {
  try {
    const { id, milestoneId } = req.params;
    const project = await Project.findById(id);
    if (!project) {
      return errorResponse(res, 'Project not found', null, 404);
    }

    const hasAccess = await checkProjectAccess(project, req.user, ['UNIVERSITY', 'FACULTY', 'ADMIN']);
    if (!hasAccess) {
      return errorResponse(res, 'Unauthorized to delete milestone from this project', null, 403);
    }

    project.milestones.pull({ _id: milestoneId });
    project.overallProgress = recalculateProjectProgress(project);
    await project.save();

    return successResponse(res, 'Milestone deleted successfully', { project });
  } catch (error) {
    next(error);
  }
};

/**
 * Add Comment to Milestone
 * POST /api/projects/:id/milestones/:milestoneId/comments
 */
const addMilestoneComment = async (req, res, next) => {
  try {
    const { id, milestoneId } = req.params;
    const { comment } = req.body;

    if (!comment || !comment.trim()) {
      return errorResponse(res, 'Comment text is required', null, 400);
    }

    const project = await Project.findById(id);
    if (!project) {
      return errorResponse(res, 'Project not found', null, 404);
    }

    const milestone = project.milestones.id(milestoneId);
    if (!milestone) {
      return errorResponse(res, 'Milestone not found', null, 404);
    }

    milestone.comments.push({
      user: req.user.id,
      userName: req.user.name || 'Collaborator',
      userRole: req.user.role,
      comment: comment.trim(),
      createdAt: new Date()
    });

    await project.save();

    return successResponse(res, 'Comment added to milestone', { milestone });
  } catch (error) {
    next(error);
  }
};

/**
 * Upload Project Deliverable / Document via Cloudinary
 * POST /api/projects/:id/documents
 */
const uploadProjectDocument = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, milestoneId } = req.body;

    if (!req.file) {
      return errorResponse(res, 'File attachment is required', null, 400);
    }

    const project = await Project.findById(id);
    if (!project) {
      return errorResponse(res, 'Project not found', null, 404);
    }

    const hasAccess = await checkProjectAccess(project, req.user, ['UNIVERSITY', 'FACULTY', 'STUDENT', 'ADMIN', 'INDUSTRY']);
    if (!hasAccess) {
      return errorResponse(res, 'Unauthorized to upload documents to this project', null, 403);
    }

    const uploadResult = await uploadToCloudinary(
      req.file.buffer,
      req.file.originalname,
      'delhi_project_deliverables'
    );

    const docEntry = {
      title: title || req.file.originalname,
      url: uploadResult.url,
      publicId: uploadResult.publicId || '',
      fileType: req.file.mimetype || 'application/pdf',
      milestoneId: milestoneId || undefined,
      uploadedBy: req.user.id,
      uploaderName: req.user.name || 'Stakeholder',
      uploaderRole: req.user.role,
      uploadedAt: new Date()
    };

    project.documents.push(docEntry);

    // If tied to milestone, also add to milestone.documents
    if (milestoneId) {
      const ms = project.milestones.id(milestoneId);
      if (ms) {
        ms.documents.push({
          title: docEntry.title,
          url: docEntry.url,
          publicId: docEntry.publicId,
          fileType: docEntry.fileType,
          uploadedBy: req.user.id,
          uploadedAt: new Date()
        });
      }
    }

    project.updates.unshift({
      user: req.user.id,
      userName: req.user.name || 'Stakeholder',
      userRole: req.user.role,
      title: 'Deliverable Uploaded',
      content: `Uploaded deliverable document: "${docEntry.title}".`,
      type: 'DOCUMENT_UPLOAD',
      createdAt: new Date()
    });

    await project.save();

    return successResponse(res, 'Document uploaded successfully', {
      document: docEntry,
      project
    }, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Add Project Update (Activity Timeline)
 * POST /api/projects/:id/updates
 */
const addProjectUpdate = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, content, type } = req.body;

    if (!title || !content) {
      return errorResponse(res, 'Title and content are required', null, 400);
    }

    const project = await Project.findById(id);
    if (!project) {
      return errorResponse(res, 'Project not found', null, 404);
    }

    const hasAccess = await checkProjectAccess(project, req.user, ['UNIVERSITY', 'FACULTY', 'STUDENT', 'ADMIN', 'INDUSTRY']);
    if (!hasAccess) {
      return errorResponse(res, 'Unauthorized to post updates to this project', null, 403);
    }

    project.updates.unshift({
      user: req.user.id,
      userName: req.user.name || 'Project Lead',
      userRole: req.user.role,
      title: title.trim(),
      content: content.trim(),
      type: type || 'UPDATE',
      createdAt: new Date()
    });

    await project.save();

    return successResponse(res, 'Update recorded successfully', { project }, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Add General Project Collaboration Comment
 * POST /api/projects/:id/comments
 */
const addProjectComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { comment } = req.body;

    if (!comment || !comment.trim()) {
      return errorResponse(res, 'Comment is required', null, 400);
    }

    const project = await Project.findById(id).populate('challengeId');
    if (!project) {
      return errorResponse(res, 'Project not found', null, 404);
    }

    const hasAccess = await checkProjectAccess(project, req.user, ['UNIVERSITY', 'FACULTY', 'STUDENT', 'ADMIN', 'INDUSTRY', 'CLIENT']);
    if (!hasAccess) {
      return errorResponse(res, 'Unauthorized to post comments in this project', null, 403);
    }

    // Participant Authorization Check
    const isCitizen = project.challengeId?.submittedBy?.toString() === req.user.id;
    const isUniversity = project.universityId?.toString() === req.user.id;
    const isMentor = project.mentor?.toString() === req.user.id;
    const isIndustry = (project.industryPartners || []).some(
      (ip) => ip.toString() === req.user.id
    );
    const isAdmin = req.user.role === 'ADMIN';
    const isStudent = req.user.role === 'STUDENT';

    if (!isAdmin && !isUniversity && !isMentor && !isIndustry && !isCitizen && !isStudent) {
      return errorResponse(
        res,
        'You are not an authorized participant in this project communication',
        null,
        403
      );
    }

    const commentObj = {
      user: req.user.id,
      userName: req.user.name || 'Collaborator',
      userRole: req.user.role,
      comment: comment.trim(),
      createdAt: new Date()
    };

    project.comments.push(commentObj);
    await project.save();

    // Broadcast in real-time to project room via Socket.IO
    sendRealtimeProjectMessage(id, commentObj);

    return successResponse(res, 'Comment posted successfully', { project, comment: commentObj }, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Submit Verified Societal Impact / Outcome
 * POST /api/projects/:id/impact
 */
const submitImpactOutcome = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      solutionDescription,
      deploymentLocation,
      peopleBenefited,
      communitiesCovered,
      cost,
      outcome,
      technologyTransferred,
      patentIpInfo,
      startupCreated,
      scalabilityPotential
    } = req.body;

    const project = await Project.findById(id);
    if (!project) {
      return errorResponse(res, 'Project not found', null, 404);
    }

    // Permission: Only University lead or Admin
    const hasAccess = await checkProjectAccess(project, req.user, ['UNIVERSITY', 'ADMIN']);
    if (!hasAccess) {
      return errorResponse(res, 'Unauthorized: You can only register impact for your own university project or as administrator', null, 403);
    }

    // Verify stage requirement
    if (!['DEPLOYMENT', 'COMPLETED', 'VALIDATION'].includes(project.status)) {
      return errorResponse(
        res,
        'Impact metrics can only be registered when project reaches Validation, Deployment, or Completion',
        null,
        400
      );
    }

    project.impactOutcome = {
      solutionDescription: solutionDescription || project.proposedSolution,
      deploymentLocation: deploymentLocation || project.description,
      peopleBenefited: Number(peopleBenefited) || 0,
      communitiesCovered: communitiesCovered || '',
      cost: Number(cost) || project.budget?.estimatedAmount || 0,
      outcome: outcome || '',
      technologyTransferred: technologyTransferred || '',
      patentIpInfo: patentIpInfo || '',
      startupCreated: startupCreated || '',
      scalabilityPotential: scalabilityPotential || '',
      verifiedBy: req.user.id,
      verifiedAt: new Date(),
      isClaimed: true
    };

    project.updates.unshift({
      user: req.user.id,
      userName: req.user.name,
      userRole: req.user.role,
      title: 'Societal Impact Verified',
      content: `Registered verified societal impact: ${peopleBenefited || 'Thousands of'} citizens benefited at ${deploymentLocation || 'Delhi'}.`,
      type: 'UPDATE',
      createdAt: new Date()
    });

    await project.save();

    return successResponse(res, 'Verified societal impact registered successfully', {
      impactOutcome: project.impactOutcome,
      project
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin Workflow Intervention
 * POST /api/projects/:id/admin-intervene
 */
const adminIntervene = async (req, res, next) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return errorResponse(res, 'Only administrators can perform administrative workflow interventions', null, 403);
    }

    const { id } = req.params;
    const { targetStage, interventionNotes, action } = req.body;

    if (!interventionNotes) {
      return errorResponse(res, 'Intervention justification notes are required', null, 400);
    }

    const project = await Project.findById(id).populate('challengeId universityId');
    if (!project) {
      return errorResponse(res, 'Project not found', null, 404);
    }

    const prev = project.status;
    if (targetStage) {
      project.status = targetStage;
      project.overallProgress = recalculateProjectProgress(project);
    }

    project.updates.unshift({
      user: req.user.id,
      userName: req.user.name || 'State Innovation Council Admin',
      userRole: 'ADMIN',
      title: `Admin Workflow Intervention: ${action || 'Status Override'}`,
      content: interventionNotes,
      type: 'ADMIN_INTERVENTION',
      createdAt: new Date()
    });

    await project.save();

    // Log in AuditLog
    if (project.challengeId) {
      await AuditLog.create({
        challenge: project.challengeId._id,
        user: req.user.id,
        userName: req.user.name,
        userRole: 'ADMIN',
        action: 'STATUS_CHANGE',
        previousStatus: prev,
        newStatus: targetStage || prev,
        comment: `Admin Project Intervention: ${interventionNotes}`
      });
    }

    // Notify University
    if (project.universityId?._id) {
      await Notification.create({
        recipient: project.universityId._id,
        title: 'State Administrative Workflow Intervention',
        message: `Delhi State Innovation Council intervened on project "${project.title}": ${interventionNotes}`,
        type: 'GENERAL'
      });
    }

    return successResponse(res, 'Admin intervention executed and recorded', { project });
  } catch (error) {
    next(error);
  }
};

/**
 * Submit Formal Project Proposal
 * POST /api/projects/:id/proposal
 */
const submitProposal = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      problemUnderstanding,
      proposedSolution,
      methodology,
      technology,
      timeline,
      expectedImpact
    } = req.body;

    const project = await Project.findById(id).populate('challengeId');
    if (!project) {
      return errorResponse(res, 'Project not found', null, 404);
    }

    const hasAccess = await checkProjectAccess(project, req.user, ['UNIVERSITY', 'ADMIN']);
    if (!hasAccess) {
      return errorResponse(res, 'Unauthorized: Only the assigned university lead or administrator can submit project proposals', null, 403);
    }

    project.proposal = {
      problemUnderstanding,
      proposedSolution,
      methodology,
      technology: Array.isArray(technology) ? technology : [technology],
      timeline,
      expectedImpact,
      submittedAt: new Date(),
      approvalStatus: 'SUBMITTED'
    };

    project.status = 'PROPOSAL_SUBMITTED';
    project.overallProgress = recalculateProjectProgress(project);

    project.updates.unshift({
      user: req.user.id,
      userName: req.user.name,
      userRole: req.user.role,
      title: 'Formal Proposal Submitted',
      content: 'Technical solution proposal submitted to Delhi State Innovation Council.',
      type: 'STAGE_TRANSITION',
      createdAt: new Date()
    });

    await project.save();

    // Notify admins of proposal submission
    try {
      const admins = await User.find({ role: 'ADMIN' });
      for (const admin of admins) {
        await dispatchNotification({
          recipient: admin._id,
          sender: req.user.id,
          senderName: req.user.name,
          type: 'PROPOSAL_SUBMITTED',
          title: 'Formal Project Proposal Submitted',
          message: `University submitted technical proposal for "${project.title}".`,
          relatedEntity: 'Project',
          relatedEntityId: project._id
        });
      }
    } catch (notifErr) {
      console.warn('[Notification Warning]', notifErr.message);
    }

    return successResponse(res, 'Proposal submitted successfully', { project });
  } catch (error) {
    next(error);
  }
};

/**
 * Review Project Proposal (Admin)
 * PUT /api/projects/:id/proposal/review
 */
const reviewProposal = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { approvalStatus, reviewNotes } = req.body;

    if (req.user.role !== 'ADMIN') {
      return errorResponse(res, 'Only government administrators can review proposals', null, 403);
    }

    const project = await Project.findById(id);
    if (!project) {
      return errorResponse(res, 'Project not found', null, 404);
    }

    if (!project.proposal) {
      project.proposal = {};
    }

    project.proposal.approvalStatus = approvalStatus;
    project.proposal.reviewNotes = reviewNotes || '';
    project.proposal.reviewedAt = new Date();

    if (approvalStatus === 'APPROVED') {
      project.status = 'APPROVED';
    }

    project.overallProgress = recalculateProjectProgress(project);

    project.updates.unshift({
      user: req.user.id,
      userName: req.user.name,
      userRole: 'ADMIN',
      title: `Proposal ${approvalStatus}`,
      content: reviewNotes || `Proposal reviewed with status: ${approvalStatus}.`,
      type: 'STAGE_TRANSITION',
      createdAt: new Date()
    });

    await project.save();

    // Notify university of proposal review outcome
    if (project.universityId) {
      const notifType = approvalStatus === 'APPROVED' ? 'PROPOSAL_APPROVED' : 'STAGE_TRANSITION';
      await dispatchNotification({
        recipient: project.universityId,
        sender: req.user.id,
        senderName: req.user.name,
        title: `Project Proposal ${approvalStatus}`,
        message: `Delhi State Innovation Council reviewed proposal for "${project.title}": ${approvalStatus}.`,
        type: notifType,
        relatedEntity: 'Project',
        relatedEntityId: project._id
      });
    }

    return successResponse(res, `Proposal review status updated to ${approvalStatus}`, { project });
  } catch (error) {
    next(error);
  }
};

/**
 * Assign Faculty Mentor
 * POST /api/projects/:id/assign-mentor
 */
const assignMentor = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { facultyId } = req.body;

    const [project, faculty] = await Promise.all([
      Project.findById(id),
      Faculty.findById(facultyId)
    ]);

    if (!project || !faculty) {
      return errorResponse(res, 'Project or Faculty not found', null, 404);
    }

    const hasAccess = await checkProjectAccess(project, req.user, ['UNIVERSITY', 'ADMIN']);
    if (!hasAccess) {
      return errorResponse(res, 'Unauthorized: Only the assigned university or administrator can assign faculty mentors', null, 403);
    }

    project.mentor = facultyId;
    await project.save();

    await faculty.updateOne({ $addToSet: { assignedProjects: project._id } });

    return successResponse(res, 'Faculty mentor assigned to project', { project });
  } catch (error) {
    next(error);
  }
};

/**
 * Request AI-Assisted Industry Co-Development Recommendations for a Project
 * POST /api/projects/:id/recommend-industries
 */
const recommendIndustriesForProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const project = await Project.findById(id);
    if (!project) return errorResponse(res, 'Project not found', null, 404);

    const hasAccess = await checkProjectAccess(project, req.user, ['UNIVERSITY', 'ADMIN', 'FACULTY']);
    if (!hasAccess) {
      return errorResponse(res, 'Unauthorized to view industry recommendations for this project', null, 403);
    }

    const industries = await Industry.find({}).lean();
    if (!industries || industries.length === 0) {
      return successResponse(res, 'No registered corporate partners available for matching', {
        recommendations: [],
        disclaimer: 'Manual corporate partnership invitations available.'
      });
    }

    const recommendations = await aiService.matchIndustries(project, industries);
    project.aiRecommendedIndustries = recommendations.map((rec) => ({
      ...rec,
      status: 'PENDING',
      matchedAt: new Date()
    }));
    await project.save();

    return successResponse(res, 'AI industry recommendations generated successfully', {
      recommendations: project.aiRecommendedIndustries,
      disclaimer: 'Recommended based on technical capability, CSR alignment and pilot testing infrastructure.'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Accept an AI Industry Recommendation (Human Decision)
 * POST /api/projects/:id/recommend-industries/accept
 */
const acceptIndustryRecommendation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { industryId, notes } = req.body;

    if (!industryId) {
      return errorResponse(res, 'Industry ID is required', null, 400);
    }

    const project = await Project.findById(id);
    if (!project) return errorResponse(res, 'Project not found', null, 404);

    const hasAccess = await checkProjectAccess(project, req.user, ['UNIVERSITY', 'ADMIN']);
    if (!hasAccess) {
      return errorResponse(res, 'Unauthorized: Only the assigned university lead or administrator can onboard industry partners', null, 403);
    }

    const targetInd = (await User.findById(industryId)) || (await Industry.findOne({ user: industryId }));
    const indName = targetInd?.name || 'Selected Industry Partner';
    const assignedUserId = targetInd?.user || targetInd?._id || industryId;

    // 1. Update AI Recommendation status
    if (project.aiRecommendedIndustries && project.aiRecommendedIndustries.length > 0) {
      project.aiRecommendedIndustries = project.aiRecommendedIndustries.map((rec) => {
        const isMatch = rec.industryId?.toString() === industryId.toString() ||
                        rec.industryId?.toString() === assignedUserId.toString();
        return {
          ...rec.toObject(),
          status: isMatch ? 'ACCEPTED' : rec.status
        };
      });
    }

    // 2. Add to project's industry partners if not present
    if (!project.industryPartners) project.industryPartners = [];
    if (!project.industryPartners.some((p) => p.toString() === assignedUserId.toString())) {
      project.industryPartners.push(assignedUserId);
    }

    project.updates.unshift({
      title: `Industry Partner Onboarded: ${indName}`,
      content: notes || 'Accepted AI recommended industry partner based on technology & pilot testing alignment.',
      author: req.user.id,
      userName: req.user.name || 'Project Lead',
      userRole: req.user.role || 'ADMIN',
      type: 'UPDATE',
      createdAt: new Date()
    });

    await project.save();

    // 3. Notify Industry Partner
    await dispatchNotification({
      recipient: assignedUserId,
      sender: req.user.id,
      senderName: req.user.name,
      title: 'Project Partnership Invitation Accepted',
      message: `Your organization has been invited and onboarded as a co-development partner for project "${project.title}".`,
      type: 'PARTNERSHIP_REQUEST',
      relatedEntity: 'Project',
      relatedEntityId: id
    });

    return successResponse(res, `Industry partner ${indName} accepted successfully`, {
      project,
      assignedPartner: indName
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Ignore an AI Industry Recommendation (Human Decision)
 * POST /api/projects/:id/recommend-industries/ignore
 */
const ignoreIndustryRecommendation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { industryId } = req.body;

    const project = await Project.findById(id);
    if (!project) return errorResponse(res, 'Project not found', null, 404);

    const hasAccess = await checkProjectAccess(project, req.user, ['UNIVERSITY', 'ADMIN']);
    if (!hasAccess) {
      return errorResponse(res, 'Unauthorized: Only the assigned university lead or administrator can manage recommendations', null, 403);
    }

    if (project.aiRecommendedIndustries) {
      project.aiRecommendedIndustries = project.aiRecommendedIndustries.map((rec) => {
        if (!industryId || rec.industryId?.toString() === industryId.toString()) {
          return { ...rec.toObject(), status: 'IGNORED' };
        }
        return rec;
      });
      await project.save();
    }

    return successResponse(res, 'Recommendation marked as ignored', {
      recommendations: project.aiRecommendedIndustries
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
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
};
