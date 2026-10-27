const { pool } = require('../config/db');

async function isAuthenticated(req, res, next) {
  if (req.session && req.session.userId) {
    try {
      const [rows] = await pool.query(
        'SELECT id, full_name, email, role, is_active FROM users WHERE id = ?',
        [req.session.userId]
      );
      if (rows.length === 0 || !rows[0].is_active) {
        req.session.destroy();
        return res.status(401).json({ success: false, message: 'Session invalid or account disabled' });
      }
      req.user = rows[0];
      return next();
    } catch (error) {
      return next(error);
    }
  }
  return res.status(401).json({ success: false, message: 'Authentication required' });
}

function isVoter(req, res, next) {
  if (req.user && req.user.role === 'voter') {
    return next();
  }
  return res.status(403).json({ success: false, message: 'Voter access required' });
}

module.exports = { isAuthenticated, isVoter };
