import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/admin.middleware.js";
import {
  getAllConversationsAdmin,
  getConversationMessagesAdmin,
  deleteMessageAdmin,
} from "../controllers/adminChat.controller.js";

const router = express.Router();

router.use(protect, isAdmin);

router.get("/conversations", getAllConversationsAdmin);
router.get("/conversations/:conversationId", getConversationMessagesAdmin);
router.delete("/messages/:messageId", deleteMessageAdmin);

export default router;
