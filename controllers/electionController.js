const { pool } = require('../config/db');
const { validationResult } = require('express-validator');

async function getElections(req, res, next) {
  try {
    const [rows] = await pool.query(
      'SELECT id, title, description, start_time, end_time, status, results_visible FROM elections ORDER BY start_time DESC'
    );
    res.json({ success: true, elections: rows });
  } catch (error) {
    next(error);
  }
}

async function getElection(req, res, next) {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM elections WHERE id = ?',
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Election not found' });
    }
    res.json({ success: true, election: rows[0] });
  } catch (error) {
    next(error);
  }
}

async function createElection(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: errors.array()[0].msg });
  }

  const { title, description, start_time, end_time, status, results_visible } = req.body;

  try {
    const [result] = await pool.query(
      'INSERT INTO elections (title, description, start_time, end_time, status, results_visible) VALUES (?, ?, ?, ?, ?, ?)',
      [title, description, start_time, end_time, status || 'draft', results_visible || false]
    );
    res.status(201).json({ success: true, message: 'Election created', id: result.insertId });
  } catch (error) {
    next(error);
  }
}

async function updateElection(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: errors.array()[0].msg });
  }

  const { title, description, start_time, end_time, status, results_visible } = req.body;

  try {
    const [result] = await pool.query(
      'UPDATE elections SET title = ?, description = ?, start_time = ?, end_time = ?, status = ?, results_visible = ? WHERE id = ?',
      [title, description, start_time, end_time, status, results_visible, req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Election not found' });
    }
    res.json({ success: true, message: 'Election updated' });
  } catch (error) {
    next(error);
  }
}

async function updateElectionStatus(req, res, next) {
  const { status } = req.body;
  if (!['draft', 'published', 'closed'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status' });
  }

  try {
    const [result] = await pool.query(
      'UPDATE elections SET status = ? WHERE id = ?',
      [status, req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Election not found' });
    }
    res.json({ success: true, message: 'Status updated' });
  } catch (error) {
    next(error);
  }
}

async function deleteElection(req, res, next) {
  try {
    const [result] = await pool.query('DELETE FROM elections WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Election not found' });
    }
    res.json({ success: true, message: 'Election deleted' });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getElections,
  getElection,
  createElection,
  updateElection,
  updateElectionStatus,
  deleteElection
};
