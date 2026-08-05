export const notFound = (req, res) =>
  res.status(404).json({ message: 'Route not found: ' + req.originalUrl });

export const errorHandler = (err, req, res, next) => { // eslint-disable-line no-unused-vars
  const status = err.status || (err.name === 'ValidationError' ? 422 : 500);
  if (status >= 500) console.error(err);
  res.status(status).json({
    message: err.message || 'Server error',
    ...(err.errors ? { errors: Object.keys(err.errors) } : {})
  });
};

export const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
