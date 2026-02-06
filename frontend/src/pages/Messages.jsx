import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  startConversation,
  getMyConversations,
  getMessages,
  sendMessage,
} from "../api/chat.api";
import { socket } from "../socket";
import { useAuth } from "../context/AuthContext";

function Messages() {
  const [searchParams] = useSearchParams();
  const listingId = searchParams.get("listingId");

  const { user } = useAuth();
  const userId = user?._id;

  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [onlineUsers, setOnlineUsers] = useState(new Set());

  /* ---------------- SOCKET CONNECT ---------------- */
  useEffect(() => {
    socket.connect();

    socket.on("connect", () => {
      console.log("✅ Socket connected:", socket.id);
    });

    socket.on("connect_error", (err) => {
      console.error("❌ Socket error:", err.message);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  /* ---------------- ONLINE / OFFLINE ---------------- */
  useEffect(() => {
    socket.on("userOnline", (uid) => {
      setOnlineUsers((prev) => new Set(prev).add(uid));
    });

    socket.on("userOffline", (uid) => {
      setOnlineUsers((prev) => {
        const copy = new Set(prev);
        copy.delete(uid);
        return copy;
      });
    });

    return () => {
      socket.off("userOnline");
      socket.off("userOffline");
    };
  }, []);

  /* ---------------- JOIN / LEAVE ROOM ---------------- */
  useEffect(() => {
    if (!activeConversation) return;

    socket.emit("joinConversation", activeConversation._id);

    return () => {
      socket.emit("leaveConversation", activeConversation._id);
    };
  }, [activeConversation]);

  /* ---------------- REAL-TIME MESSAGE LISTENER ---------------- */
  useEffect(() => {
    socket.on("newMessage", (message) => {
      setMessages((prev) => {
        const exists = prev.some((m) => m._id === message._id);
        return exists ? prev : [...prev, message];
      });
    });

    return () => {
      socket.off("newMessage");
    };
  }, []);

  /* ---------------- LOAD CONVERSATIONS ---------------- */
  useEffect(() => {
    const loadConversations = async () => {
      try {
        const res = await getMyConversations();
        setConversations(res.data || []);
      } catch {
        console.error("Failed to load conversations");
      }
    };

    loadConversations();
  }, []);

  /* ---------------- START CONVERSATION FROM LISTING ---------------- */
  useEffect(() => {
    if (!listingId) return;

    const initConversation = async () => {
      try {
        const res = await startConversation(listingId);
        setActiveConversation(res.data);
      } catch {
        console.error("Failed to start conversation");
      }
    };

    initConversation();
  }, [listingId]);

  /* ---------------- LOAD MESSAGES ---------------- */
  useEffect(() => {
    if (!activeConversation) return;

    const loadMessages = async () => {
      try {
        const res = await getMessages(activeConversation._id);
        setMessages(res.data || []);
      } catch {
        console.error("Failed to load messages");
      }
    };

    loadMessages();
  }, [activeConversation]);

  /* ---------------- SEND MESSAGE (OPTIMISTIC) ---------------- */
  const handleSend = async () => {
    if (
      !text.trim() ||
      !activeConversation ||
      !userId ||
      activeConversation.listing?.status === "sold"
    ) {
      return;
    }

    const tempMessage = {
      _id: "temp-" + Date.now(),
      sender: userId,
      text,
    };

    setMessages((prev) => [...prev, tempMessage]);
    setText("");

    try {
      await sendMessage(activeConversation._id, text);
    } catch {
      alert("Failed to send message");
      setMessages((prev) => prev.filter((m) => m._id !== tempMessage._id));
    }
  };

  const getOtherUserId = (conv) =>
    conv.participants.find((id) => id !== userId);

  /* ================= RENDER ================= */
  return (
    <div className="flex h-[80vh] border">
      {/* ================= LEFT PANEL ================= */}
      <div className="w-1/3 border-r p-4 overflow-y-auto">
        <h2 className="font-semibold mb-4">Chats</h2>

        {!userId ? (
          <p className="text-sm text-gray-500">Loading chats...</p>
        ) : conversations.length === 0 ? (
          <p className="text-sm text-gray-500">No conversations yet</p>
        ) : (
          conversations.map((conv) => {
            const isSeller = conv.listing?.owner === userId;
            const otherUserId = getOtherUserId(conv);
            const isOnline = onlineUsers.has(otherUserId);
            const unread = conv.unreadCount?.[userId] || 0;
            const isActive = activeConversation?._id === conv._id;
            return (
              <div
                key={conv._id}
                onClick={() => setActiveConversation(conv)}
                className={`p-3 rounded cursor-pointer mb-2 border ${
                  isActive
                    ? "bg-gray-100"
                    : unread > 0
                      ? "bg-blue-50 border-blue-300"
                      : "hover:bg-gray-50"
                }`}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span
                      className={`h-2 w-2 rounded-full ${
                        isOnline ? "bg-green-500" : "bg-gray-400"
                      }`}
                    />
                    <p className="font-medium">
                      {conv.listing?.title || "Listing"}
                    </p>
                  </div>

                  <span
                    className={`text-xs px-2 py-0.5 rounded ${
                      isSeller
                        ? "bg-green-100 text-green-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {isSeller ? "Selling" : "Buying"}
                  </span>

                  {unread > 0 && !isActive && (
                    <span className="ml-2 text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">
                      {unread}
                    </span>
                  )}
                </div>

                <p className="text-xs text-gray-500 mt-1 truncate">
                  {conv.lastMessage || "No messages yet"}
                </p>
              </div>
            );
          })
        )}
      </div>

      {/* ================= RIGHT PANEL ================= */}
      <div className="w-2/3 p-4 flex flex-col">
        {!activeConversation ? (
          <p className="text-gray-500">
            Select a conversation to start chatting
          </p>
        ) : (
          <>
            {/* HEADER */}
            {(() => {
              const otherUserId = getOtherUserId(activeConversation);
              const isOnline = onlineUsers.has(otherUserId);
              const isItemSold = activeConversation?.listing?.status === "sold";

              return (
                <>
                  <div className="border-b pb-2 mb-3 flex justify-between items-center">
                    <div>
                      <p className="font-semibold">
                        {activeConversation.listing?.title}
                      </p>
                      <p className="text-sm text-gray-500">
                        You are{" "}
                        {activeConversation.listing?.owner === userId
                          ? "selling this item"
                          : "buying this item"}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`h-2 w-2 rounded-full ${
                          isOnline ? "bg-green-500" : "bg-gray-400"
                        }`}
                      />
                      <span className="text-sm text-gray-600">
                        {isOnline ? "Online" : "Offline"}
                      </span>
                    </div>
                  </div>

                  {/* SOLD INFO BANNER */}
                  {isItemSold && (
                    <div className="mb-3 p-3 rounded bg-red-50 border border-red-300 text-red-700 text-sm">
                      This item has been sold. Chat is no longer available.
                    </div>
                  )}
                </>
              );
            })()}

            {/* MESSAGES */}
            <div className="flex-1 overflow-y-auto space-y-2 mb-3">
              {messages.map((msg) => {
                const isMine = msg.sender === userId;

                return (
                  <div
                    key={msg._id}
                    className={`max-w-[70%] px-3 py-2 rounded text-sm whitespace-pre-wrap break-words ${
                      isMine
                        ? "ml-auto bg-blue-600 text-white"
                        : "mr-auto bg-gray-200 text-gray-800"
                    }`}
                  >
                    {msg.text}
                  </div>
                );
              })}
            </div>

            {/* INPUT */}
            <div className="flex gap-2 border-t pt-3">
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                disabled={activeConversation?.listing?.status === "sold"}
                className={`flex-1 border p-2 rounded ${
                  activeConversation?.listing?.status === "sold"
                    ? "bg-gray-100 cursor-not-allowed"
                    : ""
                }`}
                placeholder={
                  activeConversation?.listing?.status === "sold"
                    ? "Chat disabled — item sold"
                    : "Type a message..."
                }
              />

              <button
                onClick={handleSend}
                disabled={activeConversation?.listing?.status === "sold"}
                className={`px-4 rounded text-white ${
                  activeConversation?.listing?.status === "sold"
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700"
                }`}
              >
                Send
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Messages;
