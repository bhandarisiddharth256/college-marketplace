import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import {
  startConversation,
  getMyConversations,
  getMessages,
  sendMessage,
} from "../controllers/chat.controller.js";

const router = express.Router();

// Start / get conversation
router.post("/start", protect, startConversation);

// My chat list
router.get("/", protect, getMyConversations);

// Messages
router.get("/:conversationId/messages", protect, getMessages);

// Send message
router.post("/:conversationId/messages", protect, sendMessage);

export default router;
