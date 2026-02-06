import mongoose from "mongoose";

const listingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    price: {
      type: Number,
      required: true,
    },

    category: {
      type: String,
      enum: ["books", "electronics", "furniture", "others"],
      required: true,
    },

    condition: {
      type: String,
      enum: ["new", "like-new", "used"],
      required: true,
    },

    images: [
      {
        type: String, // later: Cloudinary URLs
      },
    ],

    status: {
      type: String,
      enum: ["available", "sold"],
      default: "available",
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const Listing = mongoose.model("Listing", listingSchema);

listingSchema.index({ status: 1 });
listingSchema.index({ category: 1 });
listingSchema.index({ price: 1 });
listingSchema.index({ owner: 1 });

export default Listing;
