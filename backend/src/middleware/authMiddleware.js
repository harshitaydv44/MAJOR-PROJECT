const jwt = require('jsonwebtoken');
const config = require('../config/env');
const User = require('../models/User');
const { errorResponse } = require('../utils/responseHandler');

/**
 * Protect route middleware - validates JWT Bearer token
 */
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, config.jwtSecret);

      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return errorResponse(res, 'User session invalid. Account no longer exists.', null, 401);
      }

      if (!req.user.isActive) {
        return errorResponse(res, 'User account is deactivated. Please contact portal administration.', null, 403);
      }

      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return errorResponse(res, 'Session token expired. Please log in again.', null, 401);
      }
      return errorResponse(res, 'Not authorized. Invalid session token.', null, 401);
    }
  }

  if (!token) {
    return errorResponse(res, 'Not authorized. No session token provided.', null, 401);
  }
};

/**
 * Authorize specific user roles (case-insensitive)
 * @param  {...string} roles Allowed roles ('CLIENT', 'ADMIN', 'UNIVERSITY', 'INDUSTRY', 'FACULTY', 'STUDENT')
 */
const authorize = (...roles) => {
  const normalizedAllowed = roles.map((r) => r.toUpperCase());

  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 'Authentication required before role verification', null, 401);
    }

    const userRole = (req.user.role || '').toUpperCase();

    if (!normalizedAllowed.includes(userRole)) {
      return errorResponse(
        res,
        `Access denied. Role '${userRole}' is not authorized to access this resource. Required: [${normalizedAllowed.join(', ')}]`,
        null,
        403
      );
    }

    next();
  };
};

module.exports = {
  protect,
  authorize
};
