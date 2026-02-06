import mongoose from "mongoose";

const wishlistItemSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Listing",
      required: true,
    },
  },
  { timestamps: true }
);

wishlistItemSchema.index({ user: 1, listing: 1 }, { unique: true });

const WishlistItem = mongoose.model("WishlistItem", wishlistItemSchema);
export default WishlistItem;
