import User from "../models/User.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

/* 👤 Get my profile */
export const getMyProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res.status(200).json(
    new ApiResponse(200, user, "Profile fetched successfully")
  );
});

/* ✏️ Update my profile */
export const updateMyProfile = asyncHandler(async (req, res) => {
  const { name, college } = req.body;

  const user = await User.findById(req.user._id);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (name) user.name = name;
  if (college) user.college = college;

  await user.save();

  return res.status(200).json(
    new ApiResponse(200, {
      id: user._id,
      name: user.name,
      email: user.email,
      college: user.college,
    }, "Profile updated successfully")
  );
});
