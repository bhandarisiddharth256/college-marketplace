import CartItem from "../models/CartItem.model.js";
import WishlistItem from "../models/WishlistItem.model.js";
import Notification from "../models/Notification.model.js";
import Listing from "../models/Listing.model.js";

const cleanupSoldListing = async (listingId) => {
  const listing = await Listing.findById(listingId).select("title");

  // Find affected cart users
  const cartItems = await CartItem.find({ listing: listingId });
  const wishlistItems = await WishlistItem.find({ listing: listingId });

  // Create notifications for cart users
  for (const item of cartItems) {
    await Notification.create({
      user: item.user,
      type: "ITEM_SOLD_CART",
      listing: listingId,
      message: `Item "${listing.title}" in your cart has been sold.`,
    });
  }

  // Create notifications for wishlist users
  for (const item of wishlistItems) {
    await Notification.create({
      user: item.user,
      type: "ITEM_SOLD_WISHLIST",
      listing: listingId,
      message: `Item "${listing.title}" in your wishlist has been sold.`,
    });
  }

  // Cleanup
  await CartItem.deleteMany({ listing: listingId });
  await WishlistItem.deleteMany({ listing: listingId });
};

export default cleanupSoldListing;
