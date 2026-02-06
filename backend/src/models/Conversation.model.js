import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Listing",
      required: true,
    },

    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
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

// 🔒 One conversation per listing per buyer
conversationSchema.index(
  { listing: 1, participants: 1 },
  { unique: true }
);

const Conversation = mongoose.model("Conversation", conversationSchema);

export default Conversation;
