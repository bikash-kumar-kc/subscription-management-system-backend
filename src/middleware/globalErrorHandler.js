const globalErrorHandler = (err, req, res) => {
  let error = { ...err };

  // Mongoose bad ObjectId
  if (err.name === "CastError") {
    const message = "Resource not found";
    error = new Error(message);
    error.statusCode = 404;
  }

  // Mongoose Duplicate key
  if (err.code === 11000) {
    const message = "Duplicate field value entered";
    error = new Error(message);
    error.statusCode = 400;
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors).map((val) => val.message);
    error = new Error(message.join(","));
    error.statusCode = 400;
  }

  return res.status(error.statusCode || 500).json({
    success: false,
    error: error.message,
    err_stack: error.stack,
    errors: error.errors || "undefined",
  });
};

export default globalErrorHandler;
