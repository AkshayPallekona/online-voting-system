const { pool } = require('../config/db');
const { validationResult } = require('express-validator');

async function getCandidates(req, res, next) {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM candidates WHERE election_id = ? ORDER BY name',
      [req.params.id]
    );
    res.json({ success: true, candidates: rows });
  } catch (error) {
    next(error);
  }
}

async function createCandidate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: errors.array()[0].msg });
  }

  const { name, party_name, description } = req.body;
  let photo = null;

  if (req.file) {
    photo = `/uploads/${req.file.filename}`;
  }

  try {
    const [election] = await pool.query('SELECT id FROM elections WHERE id = ?', [req.params.id]);
    if (election.length === 0) {
      return res.status(404).json({ success: false, message: 'Election not found' });
    }

    const [result] = await pool.query(
      'INSERT INTO candidates (election_id, name, party_name, description, photo) VALUES (?, ?, ?, ?, ?)',
      [req.params.id, name, party_name, description, photo]
    );
    res.status(201).json({ success: true, message: 'Candidate created', id: result.insertId });
  } catch (error) {
    next(error);
  }
}

async function updateCandidate(req, res, next) {
  const { name, party_name, description } = req.body;
  let photo = undefined;

  if (req.file) {
    photo = `/uploads/${req.file.filename}`;
  }

  try {
    const fields = [];
    const values = [];
    if (name) { fields.push('name = ?'); values.push(name); }
    if (party_name !== undefined) { fields.push('party_name = ?'); values.push(party_name); }
    if (description !== undefined) { fields.push('description = ?'); values.push(description); }
    if (photo) { fields.push('photo = ?'); values.push(photo); }

    if (fields.length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update' });
    }

    values.push(req.params.id);
    const [result] = await pool.query(
      `UPDATE candidates SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Candidate not found' });
    }
    res.json({ success: true, message: 'Candidate updated' });
  } catch (error) {
    next(error);
  }
}

async function deleteCandidate(req, res, next) {
  try {
    const [result] = await pool.query('DELETE FROM candidates WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Candidate not found' });
    }
    res.json({ success: true, message: 'Candidate deleted' });
  } catch (error) {
    next(error);
  }
}

module.exports = { getCandidates, createCandidate, updateCandidate, deleteCandidate };
