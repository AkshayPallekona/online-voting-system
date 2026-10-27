function errorHandler(err, req, res, next) {
  console.error(err.stack || err);

  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ success: false, message: 'Duplicate entry detected' });
  }

  // Always return JSON so the frontend never receives plain text
  const status = err.status || 500;
  const message = process.env.NODE_ENV === 'production'
    ? 'Internal server error'
    : (err.message || 'Internal server error');

  res.status(status).json({
    success: false,
    message
  });
}

module.exports = errorHandler;
