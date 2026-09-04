const { errorResponse } = require('../utils/responseHandler');

/**
 * Global Error Handler Middleware
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  console.error('[Unhandled Error]', err.stack || err);

  // Mongoose Bad ObjectId
  if (err.name === 'CastError') {
    return errorResponse(res, 'Invalid resource identifier format', null, 400);
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return errorResponse(res, `Duplicate field value entered: '${field}'. Please use another value.`, null, 400);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((val) => val.message);
    return errorResponse(res, 'Validation error', messages, 400);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return errorResponse(res, 'Invalid authorization token', null, 401);
  }

  if (err.name === 'TokenExpiredError') {
    return errorResponse(res, 'Authorization token has expired', null, 401);
  }

  // Multer upload errors
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return errorResponse(res, 'File size exceeds maximum allowable limit of 10MB', null, 400);
    }
    return errorResponse(res, `File upload error: ${err.message}`, null, 400);
  }

  // Standard custom upload error message
  if (err.message && err.message.includes('Only images')) {
    return errorResponse(res, err.message, null, 400);
  }

  return errorResponse(
    res,
    error.message || 'Internal Server Error',
    process.env.NODE_ENV === 'development' ? err.stack : null,
    err.statusCode || 500
  );
};

module.exports = errorHandler;
