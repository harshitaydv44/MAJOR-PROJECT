const Challenge = require('../models/Challenge');
const { successResponse, errorResponse } = require('../utils/responseHandler');

/**
 * Get challenges submitted by the authenticated citizen
 * GET /api/problems/my
 */
const getMyProblems = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Fetch citizen's problems
    const problems = await Challenge.find({ submittedBy: userId })
      .populate('submittedBy', 'name email organization phone district')
      .populate('assignedUniversity', 'name email organization')
      .populate('assignedStudents', 'name email organization')
      .populate('industryPartner', 'name email organization')
      .sort({ createdAt: -1 });

    // Calculate real dynamic dashboard stats
    const total = problems.length;
    const underReview = problems.filter((p) =>
      ['UNDER_REVIEW', 'VALIDATED'].includes(p.status)
    ).length;
    const inProgress = problems.filter((p) =>
      ['ASSIGNED', 'IN_PROGRESS', 'SOLUTION_PROPOSED', 'PILOT_TESTING'].includes(p.status)
    ).length;
    const resolved = problems.filter((p) => p.status === 'RESOLVED').length;
    const submitted = problems.filter((p) => p.status === 'SUBMITTED').length;

    return successResponse(res, 'Citizen challenges retrieved successfully', {
      stats: {
        total,
        submitted,
        underReview,
        inProgress,
        resolved
      },
      count: problems.length,
      problems
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single problem details by ID
 * GET /api/problems/:id
 */
const getProblemById = async (req, res, next) => {
  try {
    const problem = await Challenge.findById(req.params.id)
      .populate('submittedBy', 'name email organization phone district')
      .populate('assignedUniversity', 'name email organization phone district')
      .populate('assignedStudents', 'name email organization phone')
      .populate('industryPartner', 'name email organization')
      .populate('assignedProject', 'title status overallProgress timeline');

    if (!problem) {
      return errorResponse(res, 'Societal challenge not found', null, 404);
    }

    // IDOR Check: Ensure CLIENT users can only access their own submissions
    if (req.user.role === 'CLIENT') {
      const submitterId = problem.submittedBy?._id || problem.submittedBy;
      if (submitterId && submitterId.toString() !== req.user.id.toString()) {
        return errorResponse(
          res,
          'Access denied. You are only authorized to inspect your own challenge submissions.',
          null,
          403
        );
      }
    }

    return successResponse(res, 'Societal challenge retrieved successfully', {
      problem
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyProblems,
  getProblemById
};
