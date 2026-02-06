import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema(
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

// Prevent same item twice in cart
cartItemSchema.index({ user: 1, listing: 1 }, { unique: true });

const CartItem = mongoose.model("CartItem", cartItemSchema);
export default CartItem;
