import User from "../models/User.model.js";
import Listing from "../models/Listing.model.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

/* 👑 Get all users */
export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select("-password");

  return res.status(200).json(
    new ApiResponse(200, users, "All users fetched")
  );
});

/* 👑 Get all listings */
export const getAllListingsAdmin = asyncHandler(async (req, res) => {
  const listings = await Listing.find()
    .populate("owner", "name email college");

  return res.status(200).json(
    new ApiResponse(200, listings, "All listings fetched")
  );
});

/* ❌ Delete listing */
export const deleteListingAdmin = asyncHandler(async (req, res) => {
  const listing = await Listing.findById(req.params.id);

  if (!listing) {
    throw new ApiError(404, "Listing not found");
  }

  await listing.deleteOne();

  return res.status(200).json(
    new ApiResponse(200, null, "Listing deleted by admin")
  );
});
