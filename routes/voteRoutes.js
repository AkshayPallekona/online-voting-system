const express = require('express');
const router = express.Router();
const { castVote, getMyStatus, getResults } = require('../controllers/voteController');
const { isAuthenticated, isVoter } = require('../middleware/auth');
const { validateCsrf } = require('../middleware/csrf');

router.post('/elections/:id/vote', isAuthenticated, isVoter, validateCsrf, castVote);
router.get('/elections/:id/my-status', isAuthenticated, getMyStatus);
router.get('/elections/:id/results', isAuthenticated, getResults);

module.exports = router;
