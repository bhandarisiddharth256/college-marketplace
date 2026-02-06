import Listing from "../models/Listing.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import cleanupSoldListing from "../utils/cleanupSoldListing.js";
import cleanupListingReferences from "../utils/cleanupListingReferences.js";
import uploadToCloudinary from "../utils/uploadToCloudinary.js";
import deleteFromCloudinary from "../utils/deleteFromCloudinary.js";
import Notification from "../models/Notification.model.js";
import Cart from "../models/CartItem.model.js";
import Wishlist from "../models/WishlistItem.model.js";

/* 🆕 Create new listing */
export const createListing = asyncHandler(async (req, res) => {
  const { title, description, category, condition } = req.body;
  const price = Number(req.body.price);

  if (
    !title ||
    !description ||
    isNaN(price) ||
    price <= 0 ||
    !category ||
    !condition
  ) {
    throw new ApiError(400, "Invalid or missing listing fields");
  }

  let imageUrls = [];

  // Case 1: files uploaded
  if (req.files && req.files.length > 0) {
    imageUrls = await uploadToCloudinary(req.files);
  }

  // Case 2: image URLs sent directly
  if (req.body.images && Array.isArray(req.body.images)) {
    imageUrls = req.body.images.slice(0, 5);
  }

  const listing = await Listing.create({
    title,
    description,
    price,
    category,
    condition,
    images: imageUrls,
    owner: req.user._id,
  });

  return res.status(201).json(
    new ApiResponse(201, listing, "Listing created successfully")
  );
});

/* 🛒 Get all available listings (Marketplace) */
export const getAllListings = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const filter = { status: "available" };

  // Optional filters
  if (req.query.category) {
    filter.category = req.query.category;
  }

  if (req.query.minPrice || req.query.maxPrice) {
    filter.price = {};
    if (req.query.minPrice) {
      filter.price.$gte = Number(req.query.minPrice);
    }
    if (req.query.maxPrice) {
      filter.price.$lte = Number(req.query.maxPrice);
    }
  }

  const listings = await Listing.find(filter)
    .populate("owner", "name college")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Listing.countDocuments(filter);

  return res.status(200).json(
    new ApiResponse(200, {
      listings,
      page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
    }, "Marketplace listings fetched")
  );
});

/* 👤 Get my listings (dashboard) */
export const getMyListings = asyncHandler(async (req, res) => {
  const listings = await Listing.find({
    owner: req.user._id,
  }).sort({ createdAt: -1 });

  return res.status(200).json(
    new ApiResponse(
      200,
      listings,
      "My listings fetched successfully"
    )
  );
});

/* ✅ Mark listing as sold + create notifications */
export const markListingAsSold = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const listing = await Listing.findById(id);

  if (!listing) {
    throw new ApiError(404, "Listing not found");
  }

  // 🔒 Ownership check
  if (listing.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not allowed to update this listing");
  }

  // 🔁 Already sold guard
  if (listing.status === "sold") {
    throw new ApiError(400, "Listing already marked as sold");
  }

  /* ---------------- MARK AS SOLD ---------------- */
  listing.status = "sold";
  await listing.save();

  /* ---------------- FIND AFFECTED USERS ---------------- */
  const cartUsers = await Cart.find({ listing: listing._id }).distinct("user");
  const wishlistUsers = await Wishlist.find({ listing: listing._id }).distinct("user");

  /* ---------------- CREATE NOTIFICATIONS ---------------- */
  const notifications = [];

  // 🛒 Cart notifications
  for (const userId of cartUsers) {
    if (userId.toString() === listing.owner.toString()) continue;

    notifications.push({
      user: userId,
      type: "cart_sold",
      message: "An item in your cart has been sold",
      listing: listing._id,
    });
  }

  // ❤️ Wishlist notifications
  for (const userId of wishlistUsers) {
    if (userId.toString() === listing.owner.toString()) continue;

    notifications.push({
      user: userId,
      type: "wishlist_sold",
      message: "An item from your wishlist has been sold",
      listing: listing._id,
    });
  }

  if (notifications.length > 0) {
    await Notification.insertMany(notifications);
  }

  /* ---------------- CLEANUP ---------------- */
  // 🧹 Remove from all carts & wishlists (your existing logic)
  await cleanupSoldListing(listing._id);

  return res.status(200).json(
    new ApiResponse(
      200,
      listing,
      "Listing marked as sold successfully"
    )
  );
});


/* ✏️ Edit listing (owner or admin) */
export const updateListing = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const listing = await Listing.findById(id);

  if (!listing) {
    throw new ApiError(404, "Listing not found");
  }

  // Prevent editing sold items
  if (listing.status === "sold") {
    throw new ApiError(400, "Sold listings cannot be edited");
  }

  // Authorization: owner or admin
  const isOwner =
    listing.owner.toString() === req.user._id.toString();
  const isAdmin = req.user.role === "admin";

  if (!isOwner && !isAdmin) {
    throw new ApiError(403, "You are not allowed to edit this listing");
  }

  // Allowed fields only
  const allowedFields = [
    "title",
    "description",
    "price",
    "category",
    "condition",
    "images",
  ];

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      listing[field] = req.body[field];
    }
  });
  if (req.files && req.files.length > 0) {
    const newImages = await uploadToCloudinary(req.files);

    // append new images (max 5 total)
    listing.images = [...listing.images, ...newImages].slice(0, 5);
  }

  await listing.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      listing,
      "Listing updated successfully"
    )
  );
});

/* 🗑️ Delete listing (owner or admin) */
export const deleteListing = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const listing = await Listing.findById(id);

  if (!listing) {
    throw new ApiError(404, "Listing not found");
  }

  // Authorization
  const isOwner =
    listing.owner.toString() === req.user._id.toString();
  const isAdmin = req.user.role === "admin";

  if (!isOwner && !isAdmin) {
    throw new ApiError(403, "You are not allowed to delete this listing");
  }

  // Cleanup references
  await cleanupListingReferences(listing._id);

  // Delete listing
  await listing.deleteOne();

  return res.status(200).json(
    new ApiResponse(
      200,
      null,
      "Listing deleted successfully"
    )
  );
});

/* ❌ Remove image from listing */
export const removeListingImage = asyncHandler(async (req, res) => {
  const { id } = req.params; // listingId
  const { imageUrl } = req.body;

  const listing = await Listing.findById(id);
  if (!listing) {
    throw new ApiError(404, "Listing not found");
  }

  // Owner or admin only
  const isOwner =
    listing.owner.toString() === req.user._id.toString();
  const isAdmin = req.user.role === "admin";

  if (!isOwner && !isAdmin) {
    throw new ApiError(403, "Not allowed to modify this listing");
  }

  if (!listing.images.includes(imageUrl)) {
    throw new ApiError(400, "Image not found in listing");
  }

  // Remove from Cloudinary
  await deleteFromCloudinary(imageUrl);

  // Remove from DB
  listing.images = listing.images.filter(
    (img) => img !== imageUrl
  );

  await listing.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      listing.images,
      "Image removed successfully"
    )
  );
});

/* 🔃 Reorder listing images */
export const reorderListingImages = asyncHandler(async (req, res) => {
  const { id } = req.params; // listingId
  const { images } = req.body; // new ordered array

  if (!Array.isArray(images)) {
    throw new ApiError(400, "Images must be an array");
  }

  const listing = await Listing.findById(id);
  if (!listing) {
    throw new ApiError(404, "Listing not found");
  }

  // Owner or admin check
  const isOwner =
    listing.owner.toString() === req.user._id.toString();
  const isAdmin = req.user.role === "admin";

  if (!isOwner && !isAdmin) {
    throw new ApiError(403, "Not allowed to reorder images");
  }

  // Validate image count
  if (images.length > 5) {
    throw new ApiError(400, "Maximum 5 images allowed");
  }

  // Validate that same images are used
  const existingImages = listing.images;

  const sameImages =
    images.length === existingImages.length &&
    images.every((img) => existingImages.includes(img));

  if (!sameImages) {
    throw new ApiError(
      400,
      "Image list must contain the same images"
    );
  }

  // Reorder
  listing.images = images;
  await listing.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      listing.images,
      "Images reordered successfully"
    )
  );
});

/* 🔍 Get single listing by ID */
export const getListingById = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: "Listing not found",
      });
    }

    res.status(200).json({
      success: true,
      data: listing,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching listing",
    });
  }
};

