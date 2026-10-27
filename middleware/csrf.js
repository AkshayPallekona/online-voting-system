function generateCsrfToken(req) {
  if (!req.session.csrfToken) {
    req.session.csrfToken = require('crypto').randomBytes(32).toString('hex');
  }
  return req.session.csrfToken;
}

function validateCsrf(req, res, next) {
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    const token = req.headers['x-csrf-token'] || req.body._csrf;
    if (!token || token !== req.session.csrfToken) {
      return res.status(403).json({ success: false, message: 'Invalid CSRF token' });
    }
  }
  next();
}

module.exports = { generateCsrfToken, validateCsrf };
