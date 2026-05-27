import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import http from "http";
import { Server } from "socket.io";

import app, { setIO } from "./app.js";
import connectDB from "./config/db.js";
import socketAuth from "./socket/auth.socket.js";

import Message from "./models/Message.model.js";
import Conversation from "./models/Conversation.model.js";
import Listing from "./models/Listing.model.js";

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
    origin: [
      "http://localhost:5173",
      "https://college-marketplace-eight.vercel.app",
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
});
// 🔥 Inject io into app
setIO(io);
/* ---------------- SOCKET AUTH ---------------- */
io.use(socketAuth);

/* ---------------- ONLINE USERS ---------------- */
const onlineUsers = new Map();

/* ---------------- SOCKET CONNECTION ---------------- */
io.on("connection", (socket) => {
  try {
    const userId = socket.user._id.toString();

    /* -------- USER ONLINE -------- */
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

    /* -------- LEAVE CONVERSATION (FIX ADDED) -------- */
    socket.on("leaveConversation", (conversationId) => {
      socket.leave(conversationId);
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
    socket.on("sendMessage", async ({ conversationId, text, image }) => {
      try {
        // Check for empty message
        if ((!text || !text.trim()) && !image) {
          socket.emit("errorMessage", "Message cannot be empty");
          return;
        }

        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
          socket.emit("errorMessage", "Conversation not found");
          return;
        }

        // Authorization check
        const isParticipant = conversation.participants.some(
          (p) => p.toString() === userId
        );
        if (!isParticipant) {
          socket.emit("errorMessage", "Not authorized");
          return;
        }

        // Check if item is sold
        const listing = await Listing.findById(conversation.listing);
        if (!listing || listing?.status === "sold") {
          socket.emit("errorMessage", "Item is no longer available");
          return;
        }

        // Ensure sender is in room
        socket.join(conversationId);

        // Save message
        const message = await Message.create({
          conversation: conversationId,
          sender: socket.user._id,
          text,
          image,
        });

        // Update last message
        conversation.lastMessage = text || "📷 Image";

        // Update unread count
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

        // Emit to all participants in the room
        const messageData = {
          _id: message._id,
          conversation: conversationId,
          sender: socket.user._id.toString(),
          text,
          image,
          createdAt: message.createdAt,
          isDeleted: false,
        };

        io.to(conversationId).emit("newMessage", messageData);
        
        // Emit conversation update for sidebar
        const updatedConversation = await Conversation.findById(
          conversationId
        ).populate("listing", "title price status owner");
        
        io.to(conversationId).emit("conversationUpdated", {
          conversation: updatedConversation,
        });
        
        socket.emit("messageSent", { messageId: message._id });
      } catch (err) {
        console.error("Send message error:", err);
        socket.emit("errorMessage", "Failed to send message");
      }
    });

    /* -------- DELETE MESSAGE -------- */
    socket.on("deleteMessage", async ({ messageId }) => {
      try {
        const message = await Message.findById(messageId);
        if (!message) return;

        if (
          message.sender.toString() !== socket.user._id.toString()
        )
          return;

        const oldText = message.text;

        message.isDeleted = true;
        message.text = "This message was deleted";
        message.image = null;

        await message.save();

        const convo = await Conversation.findById(message.conversation);

        // Update sidebar last message
        if (convo && convo.lastMessage === oldText) {
          convo.lastMessage = "This message was deleted";
          await convo.save();
        }

        io.to(message.conversation.toString()).emit(
          "messageDeleted",
          { messageId }
        );
      } catch (err) {
        console.error("Delete message error:", err);
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