import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },

    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    text: {
      type: String,
      trim: true,
    },

    image: {
      type: String,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },

    reported: {
      type: Boolean,
      default: false,
    },

    reports: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        reason: String,
        reportedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true },
);

messageSchema.index({ conversation: 1 });

const Message = mongoose.model("Message", messageSchema);
export default Message;
