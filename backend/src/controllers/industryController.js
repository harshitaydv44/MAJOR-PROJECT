const Industry = require('../models/Industry');
const User = require('../models/User');
const Project = require('../models/Project');
const Challenge = require('../models/Challenge');
const Partnership = require('../models/Partnership');
const Notification = require('../models/Notification');
const { dispatchNotification } = require('../services/notificationDispatcher');
const { successResponse, errorResponse } = require('../utils/responseHandler');

/**
 * Get or Provision Industry Profile
 * GET /api/industry/profile
 */
const getProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    let industry = await Industry.findOne({ user: userId });

    if (!industry) {
      const user = await User.findById(userId);
      industry = await Industry.create({
        user: userId,
        name: user.name || user.organization || 'Delhi Corporate Innovation Partner',
        organizationType: 'Industry',
        industrySector: 'Clean Energy, Smart Grids & Utilities',
        location: 'Netaji Subhash Place, Pitampura, Delhi',
        district: user.district || 'North West Delhi',
        website: 'https://www.tatapower-ddl.com',
        expertise: [
          'Clean Energy & Microgrids',
          'IoT Sensor Telemetry',
          'Environmental Engineering',
          'Smart Metering Infrastructure'
        ],
        technologies: ['LoRaWAN', 'SCADA', 'Python Data Analytics', 'Solar Inverters'],
        resources: [
          'High-voltage testing bench',
          'Smart grid telemetry testing facility',
          'Rapid electronics prototype assembly'
        ],
        fundingCapability: {
          maxGrantAmount: 2500000,
          csrBudgetAllocated: 10000000,
          fundingTypes: ['CSR Grant', 'Prototyping Co-Sponsorship', 'Equipment Loan']
        },
        mentorshipCapability: {
          availableMentorsCount: 6,
          domains: ['Embedded Engineering', 'Utility Scaling', 'Product Certification'],
          guidelines: 'Quarterly field trials and sprint architectural guidance.'
        },
        implementationCapability: {
          fieldTrialSites: ['North Delhi Distribution Circles', 'Ghazipur Substation'],
          pilotSupportLocations: ['Bawana Industrial Area', 'Narela Substation'],
          manufacturingCapacity: 'Electronics rapid assembly and pilot telemetry testing.'
        }
      });
    }

    return successResponse(res, 'Industry profile retrieved successfully', { industry });
  } catch (error) {
    next(error);
  }
};

/**
 * Update Industry Profile
 * PUT /api/industry/profile
 */
const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const {
      name,
      organizationType,
      industrySector,
      location,
      district,
      website,
      expertise,
      technologies,
      resources,
      fundingCapability,
      mentorshipCapability,
      implementationCapability
    } = req.body;

    let industry = await Industry.findOne({ user: userId });
    if (!industry) {
      industry = new Industry({ user: userId, name: req.user.name || 'Industry Partner' });
    }

    if (name) industry.name = name.trim();
    if (organizationType) industry.organizationType = organizationType;
    if (industrySector) industry.industrySector = industrySector.trim();
    if (location) industry.location = location.trim();
    if (district) industry.district = district;
    if (website) industry.website = website.trim();
    if (Array.isArray(expertise)) industry.expertise = expertise;
    if (Array.isArray(technologies)) industry.technologies = technologies;
    if (Array.isArray(resources)) industry.resources = resources;
    if (fundingCapability) industry.fundingCapability = fundingCapability;
    if (mentorshipCapability) industry.mentorshipCapability = mentorshipCapability;
    if (implementationCapability) industry.implementationCapability = implementationCapability;

    await industry.save();

    // Sync User organization name
    if (name) {
      await User.findByIdAndUpdate(userId, { organization: name.trim(), name: name.trim() });
    }

    return successResponse(res, 'Industry profile updated successfully', { industry });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Innovation Opportunities (University Projects for Industry Participation)
 * GET /api/industry/opportunities
 */
const getOpportunities = async (req, res, next) => {
  try {
    const { domain, technology, district, stage, search } = req.query;

    const filter = {};
    // Projects active in development or created
    filter.status = { $in: ['PROJECT_CREATED', 'TEAM_FORMED', 'PROPOSAL_SUBMITTED', 'DEVELOPMENT', 'APPROVED'] };

    if (stage) filter.status = stage;

    let query = Project.find(filter)
      .populate('challengeId', 'code title category district priority impact description')
      .populate('universityId', 'name email organization district')
      .populate('mentor', 'name department specialization')
      .sort({ updatedAt: -1 });

    let projects = await query;

    // Apply domain (category), district, technology, search filters on populated challenge
    if (domain && domain !== 'all') {
      projects = projects.filter((p) => p.challengeId?.category === domain);
    }
    if (district && district !== 'all') {
      projects = projects.filter((p) => p.challengeId?.district === district || p.universityId?.district === district);
    }
    if (technology && technology !== 'all') {
      projects = projects.filter((p) =>
        (p.technologies || []).some((t) => t.toLowerCase().includes(technology.toLowerCase()))
      );
    }
    if (search) {
      const s = search.toLowerCase();
      projects = projects.filter(
        (p) =>
          p.title.toLowerCase().includes(s) ||
          p.description.toLowerCase().includes(s) ||
          p.challengeId?.title?.toLowerCase().includes(s) ||
          p.universityId?.name?.toLowerCase().includes(s)
      );
    }

    // Format opportunities
    const opportunities = projects.map((p) => ({
      _id: p._id,
      projectTitle: p.title,
      university: p.universityId?.name || 'Delhi Technical University Partner',
      universityId: p.universityId?._id,
      challengeCode: p.challengeId?.code || 'DEL-CIVIC',
      challengeTitle: p.challengeId?.title || p.title,
      category: p.challengeId?.category || 'Urban Infrastructure',
      district: p.challengeId?.district || 'Delhi',
      problem: p.description,
      proposedSolution: p.proposedSolution,
      technologies: p.technologies || [],
      expectedImpact: p.outcomes?.join('. ') || p.challengeId?.impact || 'Direct municipal benefit',
      currentStage: p.status,
      supportRequired: p.teamRequirements || 'Mentorship, field prototyping, and pilot testing sponsorship',
      timeline: p.timeline,
      estimatedBudget: p.budget?.estimatedAmount || 0,
      mentor: p.mentor ? `${p.mentor.name} (${p.mentor.department})` : 'Designated Academic Faculty'
    }));

    return successResponse(res, 'Innovation opportunities retrieved successfully', {
      opportunities,
      total: opportunities.length
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Partnerships for authenticated Industry user
 * GET /api/industry/partnerships
 */
const getPartnerships = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const partnerships = await Partnership.find({ industry: userId })
      .populate({
        path: 'project',
        select: 'title status challengeId timeline budget',
        populate: { path: 'challengeId', select: 'code title category district' }
      })
      .populate('university', 'name email organization district')
      .sort({ createdAt: -1 });

    return successResponse(res, 'Partnerships retrieved successfully', { partnerships });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a Partnership Request
 * POST /api/industry/partnerships
 */
const createPartnership = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const {
      projectId,
      supportType,
      description,
      resourcesOffered,
      expectedInvolvement,
      fundingAmount
    } = req.body;

    if (!projectId || !supportType || !description) {
      return errorResponse(res, 'Project ID, support type, and description are required', null, 400);
    }

    const [project, industryProfile] = await Promise.all([
      Project.findById(projectId).populate('universityId'),
      Industry.findOne({ user: userId })
    ]);

    if (!project) {
      return errorResponse(res, 'Project not found', null, 404);
    }

    const universityId = project.universityId?._id || project.universityId;
    const industryName = industryProfile?.name || req.user.organization || req.user.name || 'Industry Partner';

    const partnership = await Partnership.create({
      project: projectId,
      industry: userId,
      industryProfile: industryProfile?._id,
      university: universityId,
      supportType,
      description: description.trim(),
      resourcesOffered: Array.isArray(resourcesOffered) ? resourcesOffered : [],
      expectedInvolvement: expectedInvolvement || 'Co-development, technical mentorship, and pilot validation.',
      fundingAmount: Number(fundingAmount) || 0,
      status: 'SUBMITTED'
    });

    // Add Industry to Project's industryPartners array
    await Project.findByIdAndUpdate(projectId, {
      $addToSet: { industryPartners: userId }
    });

    // Determine notification event type
    let notifType = 'PARTNERSHIP_REQUEST';
    if (supportType === 'MENTORSHIP') notifType = 'MENTORSHIP_OFFER';
    else if (supportType === 'FUNDING') notifType = 'FUNDING_OFFER';
    else if (supportType === 'EXPRESS_INTEREST') notifType = 'INDUSTRY_INTEREST';

    // 1. Notify University Nodal Officer
    await dispatchNotification({
      recipient: universityId,
      sender: userId,
      senderName: industryName,
      title: 'New Industry Partnership Proposal',
      message: `${industryName} has submitted a [${supportType}] partnership proposal for project "${project.title}".`,
      type: notifType,
      relatedEntity: 'Partnership',
      relatedEntityId: partnership._id
    });

    // 2. Notify Government Innovation Council (Admin)
    const adminUser = await User.findOne({ role: 'ADMIN' });
    if (adminUser) {
      await dispatchNotification({
        recipient: adminUser._id,
        sender: userId,
        senderName: industryName,
        title: 'Industry Collaboration Registered',
        message: `${industryName} offered [${supportType}] for project "${project.title}" under ${project.universityId?.name || 'accredited university'}.`,
        type: notifType,
        relatedEntity: 'Partnership',
        relatedEntityId: partnership._id
      });
    }

    const populated = await Partnership.findById(partnership._id)
      .populate('project', 'title challengeId status')
      .populate('university', 'name email organization');

    return successResponse(res, `Partnership proposal submitted successfully to ${populated.university?.name}`, {
      partnership: populated
    }, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Get Industry Dashboard Stats
 * GET /api/industry/stats
 */
const getDashboardStats = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // 1. Available Opportunities (active projects)
    const availableOpportunities = await Project.countDocuments({
      status: { $in: ['PROJECT_CREATED', 'TEAM_FORMED', 'PROPOSAL_SUBMITTED', 'DEVELOPMENT', 'APPROVED'] }
    });

    // 2. Partnerships by this industry
    const allPartnerships = await Partnership.find({ industry: userId });

    const activePartnerships = allPartnerships.filter((p) => ['ACCEPTED', 'ACTIVE'].includes(p.status)).length;

    // Distinct projects supported
    const distinctProjectIds = new Set(allPartnerships.map((p) => p.project.toString()));
    const projectsSupported = distinctProjectIds.size;

    // Mentorship requests
    const mentorshipRequests = allPartnerships.filter((p) => p.supportType === 'MENTORSHIP').length;

    // Funding commitments sum
    const fundingCommitments = allPartnerships
      .filter((p) => p.supportType === 'FUNDING' || (p.fundingAmount && p.fundingAmount > 0))
      .reduce((sum, p) => sum + (p.fundingAmount || 0), 0);

    // Pilot projects
    const pilotProjects = allPartnerships.filter((p) => p.supportType === 'PILOT_SUPPORT').length;

    return successResponse(res, 'Industry dashboard statistics retrieved successfully', {
      stats: {
        availableOpportunities,
        activePartnerships,
        projectsSupported,
        mentorshipRequests,
        fundingCommitments,
        pilotProjects
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getOpportunities,
  getPartnerships,
  createPartnership,
  getDashboardStats
};
