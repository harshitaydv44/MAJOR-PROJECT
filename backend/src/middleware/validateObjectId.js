const mongoose = require('mongoose');
const { errorResponse } = require('../utils/responseHandler');

/**
 * Middleware factory to validate MongoDB ObjectId parameters
 * @param  {...string} paramNames Names of route parameters to validate (defaults to ['id'])
 */
const validateObjectId = (...paramNames) => {
  const params = paramNames.length > 0 ? paramNames : ['id'];

  return (req, res, next) => {
    for (const param of params) {
      const val = req.params[param];
      if (val && !mongoose.Types.ObjectId.isValid(val)) {
        return errorResponse(
          res,
          `Invalid resource identifier format for parameter '${param}': '${val}'`,
          null,
          400
        );
      }
    }
    next();
  };
};

module.exports = validateObjectId;
