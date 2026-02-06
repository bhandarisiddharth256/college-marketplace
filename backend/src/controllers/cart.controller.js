import CartItem from "../models/CartItem.model.js";
import Listing from "../models/Listing.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

/* ➕ Add to cart */
export const addToCart = asyncHandler(async (req, res) => {
  const { listingId } = req.body;

  const listing = await Listing.findById(listingId);
  if (!listing || listing.status === "sold") {
    throw new ApiError(404, "Listing not available");
  }

  const cartItem = await CartItem.create({
    user: req.user._id,
    listing: listingId,
  });

  return res.status(201).json(
    new ApiResponse(201, cartItem, "Item added to cart")
  );
});

/* 🛒 Get my cart */
export const getMyCart = asyncHandler(async (req, res) => {
  const cartItems = await CartItem.find({
    user: req.user._id,
  })
    .populate("listing", "title price category status")
    .sort({ createdAt: -1 });

  return res.status(200).json(
    new ApiResponse(200, cartItems, "Cart fetched successfully")
  );
});

/* ❌ Remove from cart */
export const removeFromCart = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const item = await CartItem.findOneAndDelete({
    _id: id,
    user: req.user._id,
  });

  if (!item) {
    throw new ApiError(404, "Cart item not found");
  }

  return res.status(200).json(
    new ApiResponse(200, null, "Item removed from cart")
  );
});
