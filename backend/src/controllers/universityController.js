const University = require('../models/University');
const User = require('../models/User');
const Challenge = require('../models/Challenge');
const Project = require('../models/Project');
const Team = require('../models/Team');
const Faculty = require('../models/Faculty');
const AuditLog = require('../models/AuditLog');
const Notification = require('../models/Notification');
const { successResponse, errorResponse } = require('../utils/responseHandler');
const { validateTransition } = require('../utils/validationWorkflow');

const DEFAULT_EXPERTISE_TAGS = [
  'AI/ML',
  'Computer Vision',
  'IoT',
  'Agriculture',
  'Water Management',
  'Healthcare Technology',
  'Education Technology',
  'Renewable Energy',
  'Urban Planning',
  'Environmental Engineering',
  'Accessibility',
  'Public Administration'
];

const CATEGORY_EXPERTISE_MAP = {
  'Sanitation': ['Environmental Engineering', 'IoT', 'Urban Planning'],
  'Water Management': ['Water Management', 'IoT', 'Environmental Engineering'],
  'Environment': ['Environmental Engineering', 'AI/ML', 'Renewable Energy'],
  'Urban Infrastructure': ['Urban Planning', 'Computer Vision', 'IoT'],
  'Accessibility': ['Accessibility', 'IoT', 'AI/ML'],
  'Healthcare': ['Healthcare Technology', 'AI/ML', 'IoT'],
  'Energy': ['Renewable Energy', 'IoT', 'Urban Planning'],
  'Education': ['Education Technology', 'AI/ML'],
  'Agriculture': ['Agriculture', 'IoT', 'Water Management'],
  'Public Services': ['Public Administration', 'AI/ML'],
  'Rural Livelihoods': ['Agriculture', 'Public Administration']
};

/**
 * Get or create profile for authenticated University
 * GET /api/universities/profile
 */
const getProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    let university = await University.findOne({ user: userId });

    if (!university) {
      // Auto-provision initial institutional profile using User record
      const user = await User.findById(userId);
      university = await University.create({
        user: userId,
        name: user.name || 'Delhi Higher Education Research Partner',
        campus: 'Main Technical Campus, Delhi',
        district: user.district || 'North West Delhi',
        departments: [
          'Department of Computer Science & Engineering',
          'Department of Environmental Engineering',
          'Department of Electrical & Electronics',
          'Department of Civil & Urban Planning'
        ],
        researchAreas: [
          'Municipal IoT Telemetry & Environmental Sensors',
          'Autonomous Water Filtration & Leachate Treatment',
          'Clean Energy & Micro-grid Solar Harvesting',
          'Accessibility Technologies for Transit Commuters'
        ],
        expertise: [
          'AI/ML',
          'IoT',
          'Environmental Engineering',
          'Water Management',
          'Renewable Energy',
          'Accessibility'
        ],
        labsAndFacilities: [
          'Centre for Environmental Biotechnology & Biogas Lab',
          'Autonomous Smart Sensing & IoT Systems Lab',
          'Solar Photovoltaic Testing Facility',
          'Rapid Prototyping & Fabrication Workshop (FabLab)'
        ],
        innovationCentre: 'Delhi Technological University Innovation Council (DTU-IC)',
        incubationFacilities: 'TBI Delhi Innovation Incubation Centre (DST Supported)',
        facultySpecializations: [
          {
            facultyName: 'Prof. S. K. Sharma',
            department: 'Environmental Engineering',
            specialization: 'Biomethanation & Anaerobic Digestion',
            email: 'sksharma@dtu.ac.in'
          },
          {
            facultyName: 'Dr. Radhika Sen',
            department: 'Computer Science',
            specialization: 'Computer Vision & Commuter Telemetry',
            email: 'radhika.sen@dtu.ac.in'
          }
        ],
        studentTeamsCount: 14,
        facultyMentorsCount: 8
      });
    }

    return successResponse(res, 'University profile retrieved successfully', {
      university,
      availableExpertiseTags: DEFAULT_EXPERTISE_TAGS
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update authenticated University profile
 * PUT /api/universities/profile
 */
const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const {
      name,
      campus,
      district,
      departments,
      researchAreas,
      expertise,
      labsAndFacilities,
      innovationCentre,
      incubationFacilities,
      facultySpecializations,
      studentTeamsCount,
      facultyMentorsCount
    } = req.body;

    let university = await University.findOne({ user: userId });
    if (!university) {
      university = new University({ user: userId, name: req.user.name || 'University' });
    }

    if (name) university.name = name.trim();
    if (campus) university.campus = campus.trim();
    if (district) university.district = district;
    if (Array.isArray(departments)) university.departments = departments;
    if (Array.isArray(researchAreas)) university.researchAreas = researchAreas;
    if (Array.isArray(expertise)) university.expertise = expertise;
    if (Array.isArray(labsAndFacilities)) university.labsAndFacilities = labsAndFacilities;
    if (innovationCentre) university.innovationCentre = innovationCentre.trim();
    if (incubationFacilities) university.incubationFacilities = incubationFacilities.trim();
    if (Array.isArray(facultySpecializations)) university.facultySpecializations = facultySpecializations;
    if (studentTeamsCount !== undefined) university.studentTeamsCount = Number(studentTeamsCount);
    if (facultyMentorsCount !== undefined) university.facultyMentorsCount = Number(facultyMentorsCount);

    await university.save();

    // Also synchronize user organization if name changed
    if (name) {
      await User.findByIdAndUpdate(userId, { name: name.trim(), organization: name.trim() });
    }

    return successResponse(res, 'University profile updated successfully', {
      university
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Marketplace & Assigned Challenges for University
 * GET /api/universities/challenges
 */
const getChallenges = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const university = await University.findOne({ user: userId });
    const uniExpertise = university?.expertise || [];

    // 1. Available Challenges in Marketplace: VALIDATED & Unassigned
    const availableRaw = await Challenge.find({
      status: { $in: ['VALIDATED', 'validated'] },
      $or: [
        { assignedUniversity: null },
        { assignedUniversity: { $exists: false } }
      ]
    })
      .populate('submittedBy', 'name email organization district')
      .sort({ createdAt: -1 });

    // Enrich with AI recommended expertise tags
    const availableChallenges = availableRaw.map((c) => {
      const obj = c.toObject();
      if (!obj.aiRecommendedExpertise || obj.aiRecommendedExpertise.length === 0) {
        obj.aiRecommendedExpertise = CATEGORY_EXPERTISE_MAP[c.category] || ['Urban Planning', 'Public Administration'];
      }
      // Calculate relevance flag based on university expertise overlap
      obj.isRelevant = obj.aiRecommendedExpertise.some((tag) => uniExpertise.includes(tag));
      return obj;
    });

    // 2. Assigned Challenges (Under this university's care)
    const universityIds = [userId];
    if (university?._id) {
      universityIds.push(university._id);
    }

    const assignedChallenges = await Challenge.find({
      assignedUniversity: { $in: universityIds }
    })
      .populate('submittedBy', 'name email organization district')
      .populate('industryPartner', 'name organization email')
      .sort({ updatedAt: -1 });

    // 3. Dynamic metrics directly queried from database models
    const [
      activeProjects,
      completedProjects,
      studentTeams,
      facultyMentors
    ] = await Promise.all([
      Project.countDocuments({ universityId: userId, status: { $ne: 'COMPLETED' } }),
      Project.countDocuments({ universityId: userId, status: 'COMPLETED' }),
      Team.countDocuments({ university: userId }),
      Faculty.countDocuments({ university: userId, isActive: { $ne: false } })
    ]);

    const stats = {
      availableChallenges: availableChallenges.length,
      assignedChallenges: assignedChallenges.length,
      activeProjects,
      completedProjects,
      studentTeams,
      facultyMentors
    };

    return successResponse(res, 'University challenges & marketplace retrieved successfully', {
      stats,
      availableChallenges,
      assignedChallenges,
      universityExpertise: uniExpertise
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Express interest in a challenge
 * POST /api/universities/challenges/:id/interest
 */
const expressInterest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { notes = 'University research lab is evaluating technical feasibility for this statement.' } = req.body;
    const userId = req.user.id;

    const [challenge, university] = await Promise.all([
      Challenge.findById(id),
      University.findOne({ user: userId })
    ]);

    if (!challenge) {
      return errorResponse(res, 'Challenge not found', null, 404);
    }

    const uniName = university?.name || req.user.name || 'University Research Lab';

    // Check if already expressed interest
    const already = challenge.interestedUniversities.some(
      (u) => u.university.toString() === userId.toString()
    );

    if (!already) {
      challenge.interestedUniversities.push({
        university: userId,
        universityName: uniName,
        expressedAt: new Date(),
        notes: notes.trim()
      });
      await challenge.save();
    }

    if (university) {
      const uAlready = university.interestedChallenges.some(
        (ic) => ic.challenge.toString() === id.toString()
      );
      if (!uAlready) {
        university.interestedChallenges.push({
          challenge: id,
          expressedAt: new Date(),
          notes: notes.trim()
        });
        await university.save();
      }
    }

    // Create Notification for Citizen Submitter
    await Notification.create({
      recipient: challenge.submittedBy,
      title: 'University Expressed Interest',
      message: `${uniName} has expressed research interest in your challenge [${challenge.code}] "${challenge.title}".`,
      type: 'GENERAL',
      challenge: id
    });

    return successResponse(res, `Expression of interest registered for ${uniName}`, {
      challenge
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Accept Challenge for Institutional Adoption
 * POST /api/universities/challenges/:id/accept
 */
const acceptChallenge = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { facultyLeadName, facultyLeadDepartment, comment } = req.body;
    const userId = req.user.id;

    const [challenge, university] = await Promise.all([
      Challenge.findById(id),
      University.findOne({ user: userId })
    ]);

    if (!challenge) {
      return errorResponse(res, 'Challenge not found', null, 404);
    }

    if (challenge.assignedUniversity && challenge.assignedUniversity.toString() !== userId.toString()) {
      return errorResponse(res, 'Challenge is already assigned to another accredited university lab', null, 400);
    }

    const previousStatus = challenge.status;
    // Validate workflow transition to ASSIGNED
    validateTransition(previousStatus, 'ASSIGNED');

    const uniName = university?.name || req.user.name || 'Accredited Higher Education Institution';

    challenge.assignedUniversity = userId;
    challenge.status = 'ASSIGNED';

    if (facultyLeadName) {
      challenge.facultyLead = {
        name: facultyLeadName.trim(),
        department: (facultyLeadDepartment || 'Engineering & Applied Research').trim()
      };
    }

    const adoptionComment = comment || `Formally accepted and adopted for research prototyping by ${uniName}`;
    challenge.timeline.push({
      status: 'ASSIGNED',
      label: `Adopted by ${uniName}`,
      comment: adoptionComment,
      date: new Date()
    });

    await challenge.save();

    // 1. Create Audit Record
    await AuditLog.create({
      challenge: id,
      user: userId,
      userName: uniName,
      userRole: 'UNIVERSITY',
      action: 'ASSIGN_UNIVERSITY',
      previousStatus,
      newStatus: 'ASSIGNED',
      comment: adoptionComment,
      metadata: { universityId: userId, universityName: uniName, facultyLead: challenge.facultyLead }
    });

    // 2. Create Citizen Notification
    await Notification.create({
      recipient: challenge.submittedBy,
      title: 'Challenge Adopted by University Research Lab',
      message: `Your challenge [${challenge.code}] has been adopted by ${uniName} for solution engineering and student cohort prototyping.`,
      type: 'ASSIGNED',
      challenge: id
    });

    const populated = await Challenge.findById(id)
      .populate('submittedBy', 'name email organization phone district')
      .populate('assignedUniversity', 'name email organization');

    return successResponse(res, `Challenge successfully adopted by ${uniName}`, {
      challenge: populated
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getChallenges,
  expressInterest,
  acceptChallenge
};
