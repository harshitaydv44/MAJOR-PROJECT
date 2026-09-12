const mongoose = require('mongoose');
const Challenge = require('../models/Challenge');
const User = require('../models/User');
const { successResponse, errorResponse } = require('../utils/responseHandler');

/**
 * Get dynamic citizen dashboard statistics and recent challenges
 * GET /api/client/dashboard
 */
const getClientDashboard = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const userObjId = new mongoose.Types.ObjectId(userId);

    // Aggregate status counts dynamically from MongoDB
    const [
      totalChallenges,
      submitted,
      underReview,
      inProgress,
      resolved,
      needsInfo,
      savedChallenges,
      recentChallenges,
      categoryStats
    ] = await Promise.all([
      Challenge.countDocuments({ submittedBy: userObjId }),
      Challenge.countDocuments({ submittedBy: userObjId, status: 'SUBMITTED' }),
      Challenge.countDocuments({
        submittedBy: userObjId,
        status: { $in: ['UNDER_REVIEW', 'VALIDATED'] }
      }),
      Challenge.countDocuments({
        submittedBy: userObjId,
        status: { $in: ['ASSIGNED', 'IN_PROGRESS', 'SOLUTION_PROPOSED', 'PILOT_TESTING'] }
      }),
      Challenge.countDocuments({ submittedBy: userObjId, status: 'RESOLVED' }),
      Challenge.countDocuments({ submittedBy: userObjId, status: 'NEEDS_INFORMATION' }),
      Challenge.countDocuments({ savedBy: userObjId }),
      Challenge.find({ submittedBy: userObjId })
        .populate('submittedBy', 'name email organization phone district')
        .populate('assignedUniversity', 'name email organization')
        .sort({ createdAt: -1 })
        .limit(5),
      Challenge.aggregate([
        { $match: { submittedBy: userObjId } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ])
    ]);

    return successResponse(res, 'Citizen dashboard metrics retrieved successfully', {
      totalChallenges,
      submitted,
      underReview,
      inProgress,
      resolved,
      needsInfo,
      savedChallenges,
      categoryStats,
      recentChallenges
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get authenticated citizen profile
 * GET /api/client/profile
 */
const getClientProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return errorResponse(res, 'Citizen user profile not found', null, 404);
    }

    return successResponse(res, 'Citizen profile retrieved successfully', { user });
  } catch (error) {
    next(error);
  }
};

/**
 * Update authenticated citizen profile
 * PUT /api/client/profile
 */
const updateClientProfile = async (req, res, next) => {
  try {
    const { name, phone, organization, district, profileImage } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return errorResponse(res, 'Citizen user profile not found', null, 404);
    }

    // Role-tampering protection: NEVER allow modifying role via profile update
    if (req.body.role && req.body.role !== user.role) {
      return errorResponse(res, 'Unauthorized attempt to modify role identity', null, 403);
    }

    if (name && typeof name === 'string' && name.trim().length > 0) {
      user.name = name.trim();
    }
    if (phone !== undefined) {
      user.phone = typeof phone === 'string' ? phone.trim() : '';
    }
    if (organization !== undefined) {
      user.organization = typeof organization === 'string' ? organization.trim() : '';
    }
    if (district && typeof district === 'string' && district.trim().length > 0) {
      user.district = district.trim();
    }
    if (profileImage && typeof profileImage === 'string') {
      user.profileImage = profileImage.trim();
    }

    await user.save();

    const sanitized = await User.findById(user._id).select('-password');

    return successResponse(res, 'Citizen profile updated successfully', {
      user: sanitized
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getClientDashboard,
  getClientProfile,
  updateClientProfile
};
