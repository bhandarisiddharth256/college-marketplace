import mongoose from "mongoose";

const purchaseSchema = new mongoose.Schema(
  {
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Listing",
      required: true,
    },

    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    price: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["completed", "cancelled"],
      default: "completed",
    }
  },
  
  { timestamps: true }
);

purchaseSchema.index({ buyer: 1 });
purchaseSchema.index({ seller: 1 });

const Purchase = mongoose.model("Purchase", purchaseSchema);
export default Purchase;
