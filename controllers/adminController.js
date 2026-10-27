const { pool } = require('../config/db');

async function getDashboard(req, res, next) {
  try {
    const [[voters]] = await pool.query('SELECT COUNT(*) as count FROM users WHERE role = "voter"');
    const [[elections]] = await pool.query('SELECT COUNT(*) as count FROM elections');
    const [[active]] = await pool.query('SELECT COUNT(*) as count FROM elections WHERE status = "published" AND start_time <= UTC_TIMESTAMP() AND end_time >= UTC_TIMESTAMP()');
    const [[completed]] = await pool.query('SELECT COUNT(*) as count FROM elections WHERE status = "closed" OR end_time < UTC_TIMESTAMP()');
    const [[votes]] = await pool.query('SELECT COUNT(*) as count FROM votes');

    res.json({
      success: true,
      stats: {
        voters: voters.count,
        elections: elections.count,
        activeElections: active.count,
        completedElections: completed.count,
        totalVotes: votes.count
      }
    });
  } catch (error) {
    next(error);
  }
}

async function getVoters(req, res, next) {
  try {
    const [rows] = await pool.query(
      'SELECT id, full_name, email, is_active, created_at FROM users WHERE role = "voter" ORDER BY created_at DESC'
    );
    res.json({ success: true, voters: rows });
  } catch (error) {
    next(error);
  }
}

async function updateVoterStatus(req, res, next) {
  const { is_active } = req.body;
  if (typeof is_active !== 'boolean') {
    return res.status(400).json({ success: false, message: 'is_active must be boolean' });
  }

  try {
    const [result] = await pool.query(
      'UPDATE users SET is_active = ? WHERE id = ? AND role = "voter"',
      [is_active, req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Voter not found' });
    }
    res.json({ success: true, message: 'Voter status updated' });
  } catch (error) {
    next(error);
  }
}

module.exports = { getDashboard, getVoters, updateVoterStatus };
