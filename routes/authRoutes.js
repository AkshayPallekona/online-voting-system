const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { register, login, logout, me } = require('../controllers/authController');
const { isAuthenticated } = require('../middleware/auth');
const { validateCsrf, generateCsrfToken } = require('../middleware/csrf');

const loginLimiter = require('express-rate-limit')({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many login attempts, try again later' }
});

router.post('/register',
  validateCsrf,
  [
    body('full_name').trim().isLength({ min: 2 }).withMessage('Full name must be at least 2 characters'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
  ],
  register
);

router.post('/login',
  loginLimiter,
  validateCsrf,
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty()
  ],
  login
);

router.post('/logout', isAuthenticated, validateCsrf, logout);

router.get('/me', isAuthenticated, me);

router.get('/csrf', (req, res) => {
  res.json({ csrfToken: generateCsrfToken(req) });
});

module.exports = router;
