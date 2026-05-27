import Conversation from "../models/Conversation.model.js";
import Message from "../models/Message.model.js";
import Listing from "../models/Listing.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { io } from "../app.js";

/* 💬 Start or get conversation for a listing */
export const startConversation = asyncHandler(async (req, res) => {
  const { listingId } = req.body;

  const listing = await Listing.findOne({
    _id: listingId,
    isDeleted: false,
  });

  if (!listing) throw new ApiError(404, "Listing not found");

  if (listing.owner.toString() === req.user._id.toString()) {
    throw new ApiError(400, "You cannot chat on your own listing");
  }

  // 🔥 Atomic create or get (best practice)
  const conversation = await Conversation.findOneAndUpdate(
    {
      listing: listingId,
      buyer: req.user._id,
    },
    {
      $setOnInsert: {
        seller: listing.owner,
        participants: [req.user._id, listing.owner],
      },
    },
    { new: true, upsert: true }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, conversation, "Conversation ready"));
});

/* 💬 Get my conversations */
export const getMyConversations = asyncHandler(async (req, res) => {
  const conversations = await Conversation.find({
    participants: req.user._id,
  })
    .populate("listing", "title price status owner")
    .sort({ updatedAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, conversations, "Conversations fetched"));
});

/* 💬 Get messages of a conversation */
export const getMessages = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;

  const conversation = await Conversation.findById(conversationId);
  if (!conversation) {
    throw new ApiError(404, "Conversation not found");
  }

  // 🔒 Authorization check
  const isParticipant = conversation.participants.some(
    (id) => id.toString() === req.user._id.toString()
  );

  if (!isParticipant) {
    throw new ApiError(403, "Not allowed to access this chat");
  }

  // 🔔 Reset unread count
  conversation.unreadCount.set(req.user._id.toString(), 0);
  await conversation.save();

  const messages = await Message.find({
    conversation: conversationId,
  }).sort({ createdAt: 1 });

  return res
    .status(200)
    .json(new ApiResponse(200, messages, "Messages fetched"));
});

/* 💬 Send message */
export const sendMessage = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;
  const { text, listingId, image } = req.body;

  if (!text?.trim() && !image) {
    throw new ApiError(400, "Message cannot be empty");
  }

  let conversation = null;

  // 🔍 Try existing conversation
  if (conversationId && conversationId !== "null" && conversationId !== "new") {
    conversation = await Conversation.findById(conversationId);
  }

  // 🔥 Create conversation if not exists
  if (!conversation) {
    if (!listingId) {
      throw new ApiError(400, "ListingId required");
    }

    const listing = await Listing.findOne({
      _id: listingId,
      isDeleted: false,
    });

    if (!listing) throw new ApiError(404, "Listing not found");

    conversation = await Conversation.create({
      listing: listingId,
      buyer: req.user._id,
      seller: listing.owner,
      participants: [req.user._id, listing.owner],
      unreadCount: {
        [listing.owner.toString()]: 1,
      },
    });
  }

  // 🔒 Authorization check
  const isParticipant = conversation.participants.some(
    (id) => id.toString() === req.user._id.toString()
  );

  if (!isParticipant) {
    throw new ApiError(403, "Not allowed");
  }

  // 🔥 Check if item is sold
  const listingDoc = await Listing.findById(conversation.listing);

  if (listingDoc.status === "sold") {
    throw new ApiError(400, "Item is sold. Chat disabled.");
  }

  // 💬 Create message
  const message = await Message.create({
    conversation: conversation._id,
    sender: req.user._id,
    text,
    image,
  });

  // 📝 Update last message
  conversation.lastMessage = text;

  // 🔔 Update unread count
  conversation.participants.forEach((id) => {
    if (id.toString() !== req.user._id.toString()) {
      const curr = conversation.unreadCount.get(id.toString()) || 0;
      conversation.unreadCount.set(id.toString(), curr + 1);
    }
  });

  conversation.markModified("unreadCount");
  await conversation.save();

  // 🔥 EMIT SOCKET EVENT TO BROADCAST MESSAGE
  if (io) {
    const messageData = {
      _id: message._id,
      conversation: conversation._id.toString(),
      sender: req.user._id.toString(),
      text,
      image,
      createdAt: message.createdAt,
      isDeleted: false,
    };

    // ✅ Emit to all participants in the conversation room
    io.to(conversation._id.toString()).emit("newMessage", messageData);

    // ✅ Also emit conversation update for sidebar
    const updatedConversation = await Conversation.findById(
      conversation._id
    ).populate("listing", "title price status owner");

    io.to(conversation._id.toString()).emit("conversationUpdated", {
      conversation: updatedConversation,
    });
  }

  return res
    .status(201)
    .json(new ApiResponse(201, message, "Sent"));
});

/* 🗑 Delete message */
export const deleteMessage = asyncHandler(async (req, res) => {
  const { messageId } = req.params;

  const message = await Message.findById(messageId);
  if (!message) throw new ApiError(404, "Message not found");

  if (message.sender.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Not allowed to delete this message");
  }

  message.isDeleted = true;
  message.text = "This message was deleted";
  message.image = null;

  await message.save();

  // 🔥 EMIT SOCKET EVENT
  if (io) {
    io.to(message.conversation.toString()).emit("messageDeleted", {
      messageId: message._id,
    });
  }

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Message deleted"));
});

/* 🚩 Report message */
export const reportMessage = asyncHandler(async (req, res) => {
  const { messageId } = req.params;
  const { reason } = req.body;

  if (!reason) throw new ApiError(400, "Reason required");

  const message = await Message.findById(messageId);
  if (!message) throw new ApiError(404, "Message not found");

  message.reported = true;

  message.reports.push({
    user: req.user._id,
    reason,
  });

  await message.save();

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Reported"));
});