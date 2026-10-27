const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  getElections,
  getElection,
  createElection,
  updateElection,
  updateElectionStatus,
  deleteElection
} = require('../controllers/electionController');
const { isAuthenticated } = require('../middleware/auth');
const { isAdmin } = require('../middleware/admin');
const { validateCsrf } = require('../middleware/csrf');

router.get('/', getElections);
router.get('/:id', getElection);

router.post('/',
  isAuthenticated,
  isAdmin,
  validateCsrf,
  [
    body('title').trim().notEmpty().withMessage('Title required'),
    body('start_time').isISO8601().withMessage('Valid start time required'),
    body('end_time').isISO8601().withMessage('Valid end time required')
  ],
  createElection
);

router.put('/:id',
  isAuthenticated,
  isAdmin,
  validateCsrf,
  [
    body('title').optional().trim().notEmpty(),
    body('start_time').optional().isISO8601(),
    body('end_time').optional().isISO8601()
  ],
  updateElection
);

router.patch('/:id/status', isAuthenticated, isAdmin, validateCsrf, updateElectionStatus);

router.delete('/:id', isAuthenticated, isAdmin, validateCsrf, deleteElection);

module.exports = router;
