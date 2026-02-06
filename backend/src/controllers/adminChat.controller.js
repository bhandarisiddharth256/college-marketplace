import Conversation from "../models/Conversation.model.js";
import Message from "../models/Message.model.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

/* 👮 Get all conversations */
export const getAllConversationsAdmin = asyncHandler(async (req, res) => {
  const conversations = await Conversation.find()
    .populate("listing", "title")
    .populate("participants", "name email")
    .sort({ updatedAt: -1 });

  return res.status(200).json(
    new ApiResponse(
      200,
      conversations,
      "All conversations fetched"
    )
  );
});

/* 👮 Get messages of any conversation */
export const getConversationMessagesAdmin = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;

  const messages = await Message.find({
    conversation: conversationId,
  })
    .populate("sender", "name email")
    .sort({ createdAt: 1 });

  return res.status(200).json(
    new ApiResponse(
      200,
      messages,
      "Conversation messages fetched"
    )
  );
});

/* 🚫 Delete abusive message (soft delete) */
export const deleteMessageAdmin = asyncHandler(async (req, res) => {
  const { messageId } = req.params;

  const message = await Message.findById(messageId);

  if (!message) {
    throw new ApiError(404, "Message not found");
  }

  message.isDeleted = true;
  message.text = "[Message removed by admin]";
  await message.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      null,
      "Message removed by admin"
    )
  );
});
