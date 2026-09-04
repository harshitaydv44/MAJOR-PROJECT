const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config/env');
const { successResponse, errorResponse } = require('../utils/responseHandler');

const generateToken = (id, rememberMe = false) => {
  return jwt.sign({ id }, config.jwtSecret, {
    expiresIn: rememberMe ? '30d' : config.jwtExpiresIn
  });
};

/**
 * Register user
 * POST /api/auth/register
 */
const register = async (req, res, next) => {
  try {
    const {
      name,
      email,
      phone,
      password,
      confirmPassword,
      role,
      organization,
      district,
      terms
    } = req.body;

    // 1. Basic required fields validation
    if (!name || !email || !password || !role || typeof email !== 'string' || typeof password !== 'string') {
      return errorResponse(res, 'Please provide valid full name, email, password, and role', null, 400);
    }

    // 2. Email format validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return errorResponse(res, 'Please provide a valid email address format (e.g. name@domain.in)', null, 400);
    }

    // 3. Confirm password validation
    if (confirmPassword && password !== confirmPassword) {
      return errorResponse(res, 'Password and confirmation password do not match', null, 400);
    }

    // 4. Password strength minimum
    if (password.length < 6) {
      return errorResponse(res, 'Password must be at least 6 characters long', null, 400);
    }

    // 5. Terms acceptance validation
    if (terms !== undefined && terms !== true && terms !== 'true') {
      return errorResponse(res, 'You must accept the Delhi Public Sector Portal terms and guidelines to register', null, 400);
    }

    // 6. Normalize role and enforce admin lock
    const normalizedRole = (role || '').toUpperCase();
    if (normalizedRole === 'ADMIN') {
      return errorResponse(
        res,
        'Self-registration as Administrator / Government Authority is not permitted. Access must be provisioned by the nodal state authority.',
        null,
        403
      );
    }

    const validRoles = ['CLIENT', 'UNIVERSITY', 'INDUSTRY', 'FACULTY', 'STUDENT'];
    if (!validRoles.includes(normalizedRole)) {
      return errorResponse(
        res,
        `Invalid role '${role}'. Allowed registration roles are: ${validRoles.join(', ')}`,
        null,
        400
      );
    }

    // 7. Prevent duplicate email registration
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return errorResponse(
        res,
        'An account with this email address already exists. Please sign in or use another email.',
        null,
        400
      );
    }

    // 8. Organization guidance for institutional roles
    if (['UNIVERSITY', 'FACULTY', 'STUDENT', 'INDUSTRY'].includes(normalizedRole) && !organization) {
      return errorResponse(
        res,
        `Organization / Institution name is required for ${normalizedRole} registration`,
        null,
        400
      );
    }

    // 9. Create user record
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone ? phone.trim() : '',
      password,
      role: normalizedRole,
      organization: organization ? organization.trim() : '',
      district: district || 'Central Delhi',
      profileImage: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=7a1113&color=fff&font-size=0.4`
    });

    const token = generateToken(user._id);

    return successResponse(
      res,
      'Stakeholder account registered successfully',
      {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          organization: user.organization,
          phone: user.phone,
          district: user.district,
          profileImage: user.profileImage,
          isActive: user.isActive,
          approvalStatus: user.approvalStatus,
          createdAt: user.createdAt
        },
        token
      },
      201
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Login user
 * POST /api/auth/login
 */
const login = async (req, res, next) => {
  try {
    const { email, password, rememberMe, role } = req.body;

    if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
      return errorResponse(res, 'Please provide valid email address and password', null, 400);
    }

    // Explicitly include password for verification
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return errorResponse(res, 'Invalid email or password', null, 401);
    }

    // Verify password hash
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return errorResponse(res, 'Invalid email or password', null, 401);
    }

    // Verify account active status
    if (!user.isActive) {
      return errorResponse(
        res,
        'Your account has been deactivated. Please contact the portal administrator.',
        null,
        403
      );
    }

    // If a specific role was targeted during login, verify match
    if (role && user.role.toUpperCase() !== role.toUpperCase()) {
      return errorResponse(
        res,
        `Account role is '${user.role}', but login was attempted for '${role.toUpperCase()}'. Please log in with the correct role.`,
        null,
        403
      );
    }

    const token = generateToken(user._id, !!rememberMe);

    return successResponse(res, 'Login successful', {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        organization: user.organization,
        phone: user.phone,
        district: user.district,
        profileImage: user.profileImage,
        isActive: user.isActive,
        approvalStatus: user.approvalStatus,
        createdAt: user.createdAt
      },
      token
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Logout user
 * POST /api/auth/logout
 */
const logout = async (req, res) => {
  return successResponse(res, 'Logged out successfully');
};

/**
 * Get current authenticated user profile
 * GET /api/auth/me
 */
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return errorResponse(res, 'User profile not found', null, 404);
    }

    return successResponse(res, 'Current user profile retrieved successfully', { user });
  } catch (error) {
    next(error);
  }
};

/**
 * Update authenticated user profile
 * PUT /api/auth/profile
 */
const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, organization, district } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return errorResponse(res, 'User profile not found', null, 404);
    }

    if (name) user.name = name.trim();
    if (phone !== undefined) user.phone = phone.trim();
    if (organization !== undefined) user.organization = organization.trim();
    if (district) user.district = district;

    await user.save();

    return successResponse(res, 'Profile updated successfully', { user });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  logout,
  getMe,
  updateProfile
};

