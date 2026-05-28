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
    socket.join(`user:${userId}`);
    console.log(`🟢 ${socket.user.name} is online`);
    io.emit("userOnline", userId);

    /* -------- JOIN CONVERSATION -------- */
    socket.on("joinConversation", async (conversationId) => {
      try {
        const conversation = await Conversation.findById(conversationId);

        if (
          conversation &&
          conversation.participants.some((p) => p.toString() === userId) &&
          !conversation.deletedFor?.includes(userId)
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
    socket.on(
      "sendMessage",
      async ({ conversationId, text, image, listingId }, callback) => {
        try {
          // Check for empty message
          if ((!text || !text.trim()) && !image) {
            const error = "Message cannot be empty";
            if (callback) return callback({ error });
            socket.emit("errorMessage", error);
            return;
          }

          let conversation = null;
          if (
            conversationId &&
            conversationId !== "null" &&
            conversationId !== "new"
          ) {
            conversation = await Conversation.findById(conversationId);
          }

          if (!conversation) {
            if (!listingId) {
              const error = "Listing ID is required to start a chat";
              if (callback) return callback({ error });
              socket.emit("errorMessage", error);
              return;
            }

            const listing = await Listing.findOne({
              _id: listingId,
              isDeleted: false,
            });

            if (!listing) {
              const error = "Listing not found";
              if (callback) return callback({ error });
              socket.emit("errorMessage", error);
              return;
            }

            if (listing.owner.toString() === userId) {
              const error = "You cannot chat on your own listing";
              if (callback) return callback({ error });
              socket.emit("errorMessage", error);
              return;
            }

            conversation = await Conversation.findOneAndUpdate(
              {
                listing: listingId,
                buyer: socket.user._id,
              },
              {
                $setOnInsert: {
                  seller: listing.owner,
                  participants: [socket.user._id, listing.owner],
                  buyer: socket.user._id,
                  unreadCount: {
                    [socket.user._id.toString()]: 0,
                    [listing.owner.toString()]: 1,
                  },
                },
              },
              { new: true, upsert: true }
            );
          }

          const isParticipant = conversation.participants.some(
            (p) => p.toString() === userId
          );
          if (!isParticipant) {
            const error = "Not authorized";
            if (callback) return callback({ error });
            socket.emit("errorMessage", error);
            return;
          }

          const listing = await Listing.findById(conversation.listing);
          if (!listing || listing.status === "sold") {
            const error = "Item is no longer available";
            if (callback) return callback({ error });
            socket.emit("errorMessage", error);
            return;
          }

          socket.join(conversation._id.toString());

          const message = await Message.create({
            conversation: conversation._id,
            sender: socket.user._id,
            text,
            image,
          });

          conversation.lastMessage = text || "📷 Image";
          if (conversation.deletedFor?.length) {
            conversation.deletedFor = [];
          }

          conversation.participants.forEach((participantId) => {
            const pid = participantId.toString();
            if (pid !== userId) {
              const currentUnread = conversation.unreadCount?.get(pid) || 0;
              conversation.unreadCount.set(pid, currentUnread + 1);
            }
          });

          conversation.markModified("unreadCount");
          if (conversation.deletedFor) {
            conversation.markModified("deletedFor");
          }
          await conversation.save();

          const messageData = {
            _id: message._id,
            conversation: conversation._id.toString(),
            sender: socket.user._id.toString(),
            text,
            image,
            createdAt: message.createdAt,
            isDeleted: false,
          };

          const updatedConversation = await Conversation.findById(
            conversation._id
          ).populate("listing", "title price status owner");

          io.to(conversation._id.toString()).emit("newMessage", messageData);
          io.to(conversation._id.toString()).emit("conversationUpdated", {
            conversation: updatedConversation,
          });

          conversation.participants.forEach((participantId) => {
            const pid = participantId.toString();
            if (conversation.deletedFor?.includes(pid)) return;

            io.to(`user:${pid}`).emit("newMessage", messageData);
            io.to(`user:${pid}`).emit("conversationUpdated", {
              conversation: updatedConversation,
            });
          });

          if (callback)
            callback({
              success: true,
              conversation: updatedConversation,
              message: messageData,
            });

          socket.emit("messageSent", { messageId: message._id });
        } catch (err) {
          console.error("Send message error:", err);
          const error = "Failed to send message";
          if (callback) return callback({ error });
          socket.emit("errorMessage", error);
        }
      }
    );

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