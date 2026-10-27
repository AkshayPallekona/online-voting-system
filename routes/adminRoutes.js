const express = require('express');
const router = express.Router();
const { getDashboard, getVoters, updateVoterStatus } = require('../controllers/adminController');
const { isAuthenticated } = require('../middleware/auth');
const { isAdmin } = require('../middleware/admin');
const { validateCsrf } = require('../middleware/csrf');

router.get('/dashboard', isAuthenticated, isAdmin, getDashboard);
router.get('/voters', isAuthenticated, isAdmin, getVoters);
router.patch('/voters/:id/status', isAuthenticated, isAdmin, validateCsrf, updateVoterStatus);

module.exports = router;
