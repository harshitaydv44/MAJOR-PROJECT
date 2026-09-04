/**
 * Data Sanitization Middleware
 * Protects against NoSQL query operator injection and Cross-Site Scripting (XSS).
 */

const sanitizeObject = (obj) => {
  if (!obj || typeof obj !== 'object') {
    if (typeof obj === 'string') {
      // Strip potential script tags and null bytes
      return obj.replace(/\0/g, '').replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    }
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeObject(item));
  }

  const sanitized = {};
  for (const key of Object.keys(obj)) {
    // Prohibit MongoDB operator keys in user input
    if (key.startsWith('$')) {
      console.warn(`[Security Alert] Stripped forbidden query operator key '${key}' from input`);
      continue;
    }
    sanitized[key] = sanitizeObject(obj[key]);
  }
  return sanitized;
};

const sanitizeMiddleware = (req, res, next) => {
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }
  if (req.params) {
    req.params = sanitizeObject(req.params);
  }
  next();
};

module.exports = sanitizeMiddleware;
