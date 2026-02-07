import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import http from "http";
import { Server } from "socket.io";

import app from "./app.js";
import connectDB from "./config/db.js";
import socketAuth from "./socket/auth.socket.js";

import Message from "./models/Message.model.js";
import Conversation from "./models/Conversation.model.js";

/* ---------------- ES MODULE DIR FIX ---------------- */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* ---------------- LOAD ENV ---------------- */
dotenv.config();

/* ---------------- CONNECT DB ---------------- */
connectDB();

/* ---------------- CREATE SERVER ---------------- */
const server = http.createServer(app);

/* ---------------- SOCKET.IO SETUP ---------------- */
const io = new Server(server, {
  cors: {
    origin: "*",
    credentials: true,
  },
});


/* ---------------- SOCKET AUTH MIDDLEWARE ---------------- */
io.use(socketAuth);

/* ---------------- ONLINE USERS ---------------- */
const onlineUsers = new Map();

/* ---------------- SOCKET CONNECTION ---------------- */
io.on("connection", (socket) => {
  try {
    const userId = socket.user._id.toString();

    // Mark user online
    onlineUsers.set(userId, socket.id);
    console.log(`🟢 ${socket.user.name} is online`);

    io.emit("userOnline", userId);

    /* -------- JOIN CONVERSATION -------- */
    socket.on("joinConversation", async (conversationId) => {
      try {
        const conversation = await Conversation.findById(conversationId);

        if (
          conversation &&
          conversation.participants.some(
            (p) => p.toString() === userId
          )
        ) {
          socket.join(conversationId);
        }
      } catch (err) {
        console.error("Join conversation error:", err);
      }
    });

    /* -------- TYPING INDICATOR -------- */
    socket.on("typing", ({ conversationId }) => {
      socket.to(conversationId).emit("userTyping", {
        userId,
        conversationId,
      });
    });

    socket.on("stopTyping", ({ conversationId }) => {
      socket.to(conversationId).emit("userStopTyping", {
        userId,
        conversationId,
      });
    });

    /* -------- SEND MESSAGE -------- */
    socket.on("sendMessage", async ({ conversationId, text }) => {
      try {
        if (!text || !text.trim()) return;

        const conversation = await Conversation.findById(conversationId);
        if (!conversation) return;

        // Authorization check
        const isParticipant = conversation.participants.some(
          (p) => p.toString() === userId
        );
        if (!isParticipant) return;

        // Ensure sender is in room
        socket.join(conversationId);

        // Save message
        const message = await Message.create({
          conversation: conversationId,
          sender: socket.user._id,
          text,
        });

        // Update last message
        conversation.lastMessage = text;

        // Update unread count for other participants
        conversation.participants.forEach((participantId) => {
          const pid = participantId.toString();
          if (pid !== userId) {
            const currentUnread =
              conversation.unreadCount?.get(pid) || 0;
            conversation.unreadCount.set(pid, currentUnread + 1);
          }
        });

        conversation.markModified("unreadCount");
        await conversation.save();

        // Emit message
        io.to(conversationId).emit("newMessage", {
          _id: message._id,
          conversation: conversationId,
          sender: socket.user._id,
          text,
          createdAt: message.createdAt,
        });
      } catch (err) {
        console.error("Send message error:", err);
      }
    });

    /* -------- DISCONNECT -------- */
    socket.on("disconnect", () => {
      onlineUsers.delete(userId);
      console.log(`🔴 ${socket.user.name} is offline`);
      io.emit("userOffline", userId);
    });
  } catch (err) {
    console.error("Socket connection error:", err);
  }
});

/* ---------------- START SERVER ---------------- */
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});