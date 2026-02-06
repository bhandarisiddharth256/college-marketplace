import Conversation from "../models/Conversation.model.js";
import Message from "../models/Message.model.js";
import Listing from "../models/Listing.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

/* 💬 Start or get conversation for a listing */
export const startConversation = asyncHandler(async (req, res) => {
  const { listingId } = req.body;

  const listing = await Listing.findById(listingId);
  if (!listing) {
    throw new ApiError(404, "Listing not found");
  }

  // Buyer cannot chat with own listing
  if (listing.owner.toString() === req.user._id.toString()) {
    throw new ApiError(400, "You cannot chat on your own listing");
  }

  // Check existing conversation
  let conversation = await Conversation.findOne({
    listing: listingId,
    participants: { $all: [req.user._id, listing.owner] },
  });

  // Create if not exists
  if (!conversation) {
    conversation = await Conversation.create({
    listing: listingId,
    participants: [req.user._id, listing.owner],
    unreadCount: {
      [req.user._id.toString()]: 0,
      [listing.owner.toString()]: 0,
    },
  });
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      conversation,
      "Conversation ready"
    )
  );
});

/* 💬 Get my conversations */
export const getMyConversations = asyncHandler(async (req, res) => {
  const conversations = await Conversation.find({
    participants: req.user._id,
  })
    .populate("listing", "title price status owner")
    .sort({ updatedAt: -1 });

  return res.status(200).json(
    new ApiResponse(
      200,
      conversations,
      "Conversations fetched"
    )
  );
});

/* 💬 Get messages of a conversation */
export const getMessages = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;

  const conversation = await Conversation.findById(conversationId);
  if (!conversation) {
    throw new ApiError(404, "Conversation not found");
  }

  // ✅ Correct authorization check
  const isParticipant = conversation.participants.some(
    (id) => id.toString() === req.user._id.toString()
  );

  if (!isParticipant) {
    throw new ApiError(403, "Not allowed to access this chat");
  }

  // ✅ Reset unread count for this user
  conversation.unreadCount.set(
    req.user._id.toString(),
    0
  );
  await conversation.save();

  const messages = await Message.find({
    conversation: conversationId,
  }).sort({ createdAt: 1 });

  return res.status(200).json(
    new ApiResponse(
      200,
      messages,
      "Messages fetched"
    )
  );
});

/* 💬 Send message */
export const sendMessage = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;
  const { text } = req.body;

  if (!text || !text.trim()) {
    throw new ApiError(400, "Message cannot be empty");
  }

  const conversation = await Conversation.findById(conversationId);
  if (!conversation) {
    throw new ApiError(404, "Conversation not found");
  }

  // Authorization
  if (!conversation.participants.includes(req.user._id)) {
    throw new ApiError(403, "Not allowed to send message");
  }

  const message = await Message.create({
    conversation: conversationId,
    sender: req.user._id,
    text,
  });

  // Update last message
  conversation.lastMessage = text;

  // Increase unread count for OTHER participant
  conversation.participants.forEach((participantId) => {
    const pid = participantId.toString();
    const senderId = req.user._id.toString();

    if (pid !== senderId) {
      const current = conversation.unreadCount.get(pid) || 0;
      conversation.unreadCount.set(pid, current + 1);
    }
  });
   
  conversation.markModified("unreadCount");
  await conversation.save();

  return res.status(201).json(
    new ApiResponse(
      201,
      message,
      "Message sent"
    )
  );
});
