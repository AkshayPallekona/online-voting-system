const { pool } = require('../config/db');

async function castVote(req, res, next) {
  const { candidate_id } = req.body;
  const election_id = req.params.id;
  const voter_id = req.user.id;

  if (!candidate_id) {
    return res.status(400).json({ success: false, message: 'Candidate ID required' });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [elections] = await connection.query(
      'SELECT status, start_time, end_time FROM elections WHERE id = ? FOR UPDATE',
      [election_id]
    );
    if (elections.length === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: 'Election not found' });
    }
    const election = elections[0];
    const now = new Date();
    if (election.status !== 'published' || now < new Date(election.start_time) || now > new Date(election.end_time)) {
      await connection.rollback();
      return res.status(400).json({ success: false, message: 'Voting is not open for this election' });
    }

    const [candidates] = await connection.query(
      'SELECT id FROM candidates WHERE id = ? AND election_id = ?',
      [candidate_id, election_id]
    );
    if (candidates.length === 0) {
      await connection.rollback();
      return res.status(400).json({ success: false, message: 'Invalid candidate for this election' });
    }

    const [existing] = await connection.query(
      'SELECT id FROM votes WHERE election_id = ? AND voter_id = ?',
      [election_id, voter_id]
    );
    if (existing.length > 0) {
      await connection.rollback();
      return res.status(409).json({ success: false, message: 'You have already voted in this election' });
    }

    await connection.query(
      'INSERT INTO votes (election_id, voter_id, candidate_id) VALUES (?, ?, ?)',
      [election_id, voter_id, candidate_id]
    );

    await connection.commit();
    res.json({ success: true, message: 'Vote recorded successfully' });
  } catch (error) {
    await connection.rollback();
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ success: false, message: 'You have already voted in this election' });
    }
    next(error);
  } finally {
    connection.release();
  }
}

async function getMyStatus(req, res, next) {
  try {
    const [rows] = await pool.query(
      'SELECT id FROM votes WHERE election_id = ? AND voter_id = ?',
      [req.params.id, req.user.id]
    );
    res.json({ success: true, hasVoted: rows.length > 0 });
  } catch (error) {
    next(error);
  }
}

async function getResults(req, res, next) {
  try {
    const [election] = await pool.query(
      'SELECT results_visible, status FROM elections WHERE id = ?',
      [req.params.id]
    );
    if (election.length === 0) {
      return res.status(404).json({ success: false, message: 'Election not found' });
    }
    if (!election[0].results_visible && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Results are not visible yet' });
    }

    const [results] = await pool.query(`
      SELECT c.id, c.name, c.party_name, COUNT(v.id) as votes,
             ROUND(COUNT(v.id) * 100.0 / NULLIF((SELECT COUNT(*) FROM votes WHERE election_id = ?), 0), 2) as percentage
      FROM candidates c
      LEFT JOIN votes v ON c.id = v.candidate_id AND v.election_id = ?
      WHERE c.election_id = ?
      GROUP BY c.id
      ORDER BY votes DESC
    `, [req.params.id, req.params.id, req.params.id]);

    const [total] = await pool.query('SELECT COUNT(*) as total FROM votes WHERE election_id = ?', [req.params.id]);

    res.json({ success: true, results, totalVotes: total[0].total });
  } catch (error) {
    next(error);
  }
}

module.exports = { castVote, getMyStatus, getResults };
