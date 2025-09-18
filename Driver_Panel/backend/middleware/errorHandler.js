export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  let error = {
    success: false,
    error: 'Internal server error'
  };

  if (err.name === 'ValidationError') {
    error.error = 'Validation error';
  } else if (err.name === 'CastError') {
    error.error = 'Invalid data format';
  } else if (err.code === 11000) {
    error.error = 'Duplicate data error';
  }

  res.status(err.statusCode || 500).json(error);
};

export const notFound = (req, res, next) => {
  const error = new Error(`Route not found - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};