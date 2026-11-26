import ApiError from "../utils/ApiError.js";

const errorHandler = (err, req, res, next) => {
  // Invalid MongoDB IDs
  if (err.name === "CastError") {
    err = new ApiError(400, "Invalid ID");
  }

  // Duplicate values, such as an item already in cart or wishlist
  if (err.code === 11000) {
    err = new ApiError(409, "This item already exists");
  }

  // Mongoose schema validation
  if (err.name === "ValidationError") {
    err = new ApiError(400, "Please provide valid details");
  }

  if (!(err instanceof ApiError)) {
    console.error(err);
    err = new ApiError(500, "Internal Server Error");
  }

  return res.status(err.statusCode).json({
    success: false,
    message: err.message,
    errors: err.errors || [],
  });
};

export default errorHandler;
