import WishlistItem from "../models/WishlistItem.model.js";
import Listing from "../models/Listing.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import CartItem from "../models/CartItem.model.js";

/* ❤️ Add to wishlist */
export const addToWishlist = asyncHandler(async (req, res) => {
  const { listingId } = req.body;

  const listing = await Listing.findById(listingId);
  if (!listing) {
    throw new ApiError(404, "Listing not found");
  }

  const item = await WishlistItem.create({
    user: req.user._id,
    listing: listingId,
  });

  return res.status(201).json(
    new ApiResponse(201, item, "Item added to wishlist")
  );
});

/* ❤️ Get wishlist */
export const getMyWishlist = asyncHandler(async (req, res) => {
  const items = await WishlistItem.find({
    user: req.user._id,
  })
    .populate("listing", "title price category status")
    .sort({ createdAt: -1 });

  return res.status(200).json(
    new ApiResponse(200, items, "Wishlist fetched successfully")
  );
});

/* ❌ Remove from wishlist */
export const removeFromWishlist = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const item = await WishlistItem.findOneAndDelete({
    _id: id,
    user: req.user._id,
  });

  if (!item) {
    throw new ApiError(404, "Wishlist item not found");
  }

  return res.status(200).json(
    new ApiResponse(200, null, "Item removed from wishlist")
  );
});

/* 🔁 Move wishlist item to cart */
export const moveWishlistToCart = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Find wishlist item
  const wishlistItem = await WishlistItem.findOne({
    _id: id,
    user: req.user._id,
  });

  if (!wishlistItem) {
    throw new ApiError(404, "Wishlist item not found");
  }

  // Check listing availability
  const listing = await Listing.findById(wishlistItem.listing);

  if (!listing || listing.status === "sold") {
    throw new ApiError(400, "Listing is no longer available");
  }

  // Add to cart (safe because of unique index)
  await CartItem.create({
    user: req.user._id,
    listing: wishlistItem.listing,
  });

  // Remove from wishlist
  await wishlistItem.deleteOne();

  return res.status(200).json(
    new ApiResponse(
      200,
      null,
      "Item moved from wishlist to cart"
    )
  );
});


