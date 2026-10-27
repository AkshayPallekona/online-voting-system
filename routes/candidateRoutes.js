const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { body } = require('express-validator');
const {
  getCandidates,
  createCandidate,
  updateCandidate,
  deleteCandidate
} = require('../controllers/candidateController');
const { isAuthenticated } = require('../middleware/auth');
const { isAdmin } = require('../middleware/admin');
const { validateCsrf } = require('../middleware/csrf');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'public/uploads'),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, unique + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext && mime) return cb(null, true);
    cb(new Error('Only images allowed'));
  }
});

router.get('/elections/:id/candidates', getCandidates);

router.post('/elections/:id/candidates',
  isAuthenticated,
  isAdmin,
  validateCsrf,
  upload.single('photo'),
  [
    body('name').trim().notEmpty().withMessage('Name required')
  ],
  createCandidate
);

router.put('/candidates/:id',
  isAuthenticated,
  isAdmin,
  validateCsrf,
  upload.single('photo'),
  updateCandidate
);

router.delete('/candidates/:id', isAuthenticated, isAdmin, validateCsrf, deleteCandidate);

module.exports = router;
