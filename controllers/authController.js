const bcrypt = require('bcrypt');
const { pool } = require('../config/db');
const { validationResult } = require('express-validator');

async function register(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: errors.array()[0].msg });
  }

  const { full_name, email, password } = req.body;
  const normalizedEmail = email.toLowerCase().trim();

  try {
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [normalizedEmail]);
    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO users (full_name, email, password_hash, role) VALUES (?, ?, ?, "voter")',
      [full_name, normalizedEmail, password_hash]
    );

    res.status(201).json({ success: true, message: 'Registration successful', userId: result.insertId });
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: errors.array()[0].msg });
  }

  const { email, password } = req.body;
  const normalizedEmail = email.toLowerCase().trim();

  try {
    const [rows] = await pool.query(
      'SELECT id, full_name, email, password_hash, role, is_active FROM users WHERE email = ?',
      [normalizedEmail]
    );

    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const user = rows[0];
    if (!user.is_active) {
      return res.status(403).json({ success: false, message: 'Account is disabled' });
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    req.session.regenerate((err) => {
      if (err) return next(err);
      req.session.userId = user.id;
      req.session.role = user.role;
      res.json({
        success: true,
        message: 'Login successful',
        user: { id: user.id, full_name: user.full_name, email: user.email, role: user.role }
      });
    });
  } catch (error) {
    next(error);
  }
}

async function logout(req, res, next) {
  req.session.destroy((err) => {
    if (err) return next(err);
    res.clearCookie('connect.sid');
    res.json({ success: true, message: 'Logged out successfully' });
  });
}

async function me(req, res) {
  res.json({
    success: true,
    user: {
      id: req.user.id,
      full_name: req.user.full_name,
      email: req.user.email,
      role: req.user.role
    }
  });
}

module.exports = { register, login, logout, me };
