function errorHandler(err, req, res, next) {
  console.error(err.stack);

  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ success: false, message: 'Duplicate entry detected' });
  }

  if (process.env.NODE_ENV === 'production') {
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
}

module.exports = errorHandler;
