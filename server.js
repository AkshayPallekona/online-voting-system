require('dotenv').config();
const express = require('express');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const helmet = require('helmet');
const path = require('path');
const { pool, testConnection } = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const electionRoutes = require('./routes/electionRoutes');
const candidateRoutes = require('./routes/candidateRoutes');
const voteRoutes = require('./routes/voteRoutes');
const adminRoutes = require('./routes/adminRoutes');

const requiredEnv = ['DB_HOST', 'DB_USER', 'DB_NAME', 'SESSION_SECRET'];
const missingEnv = requiredEnv.filter(e => !process.env[e]);
if (missingEnv.length > 0) {
  console.error(`Missing required environment variables: ${missingEnv.join(', ')}`);
  // Do not process.exit on Vercel — let the function load and return JSON errors
}

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet({
  contentSecurityPolicy: false // Allow Chart.js and Bootstrap CDN for demo
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Return clear JSON if critical config is missing (helps Vercel debugging)
app.use((req, res, next) => {
  if (missingEnv && missingEnv.length > 0 && req.path.startsWith('/api')) {
    return res.status(500).json({
      success: false,
      message: `Server configuration error: missing environment variables (${missingEnv.join(', ')}). Set them in Vercel dashboard.`
    });
  }
  next();
});

const sessionStore = new MySQLStore({
  clearExpired: true,
  checkExpirationInterval: 900000,
  expiration: 86400000,
  createDatabaseTable: true
}, pool);

app.use(session({
  secret: process.env.SESSION_SECRET,
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000
  }
}));

app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/auth', authRoutes);
app.use('/api/elections', electionRoutes);
app.use('/api', candidateRoutes);
app.use('/api', voteRoutes);
app.use('/api/admin', adminRoutes);

app.use(errorHandler);

async function start() {
  await testConnection();
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

// Only start listening when run directly (not when imported by Vercel)
if (require.main === module) {
  start();
}

module.exports = app;
