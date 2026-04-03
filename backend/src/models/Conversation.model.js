import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Listing",
      required: true,
    },

    // 🔥 Explicit roles (VERY IMPORTANT)
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

    // Optional but useful for queries
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    lastMessage: {
      type: String,
    },

    // 🔔 Unread message count per user
    unreadCount: {
      type: Map,
      of: Number,
      default: {},
    },
  },
  { timestamps: true }
);

//
// 🔥 CORRECT UNIQUE INDEX
// Same buyer cannot create multiple chats for same listing
//
conversationSchema.index(
  { listing: 1, buyer: 1 },
  { unique: true }
);

const Conversation = mongoose.model("Conversation", conversationSchema);

export default Conversation;