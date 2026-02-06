import jwt from "jsonwebtoken";
import User from "../models/User.model.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

export const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Expect token in Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    throw new ApiError(401, "Not authorized, token missing");
  }

  // Verify token
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  // Get user from DB
  const user = await User.findById(decoded.id).select("-password");

  if (!user) {
    throw new ApiError(401, "User no longer exists");
  }

  // Attach user to request
  req.user = user;

  next();
});
