import { useEffect, useState } from "react";
import { useRef } from "react";
import { useSearchParams } from "react-router-dom";
import {
  getMyConversations,
  getMessages,
  deleteConversation,
  reportMessage,
} from "../api/chat.api";
import { useAuth } from "../context/AuthContext";
import { socket, connectSocket } from "../socket";
function Messages() {
  const [searchParams] = useSearchParams();
  const listingId = searchParams.get("listingId");
  const listingTitle = searchParams.get("title");
  const listingHandled = useRef(false);
  const { user } = useAuth();
  const userId = user?._id;
  const [selectedImages, setSelectedImages] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [startingListingId, setStartingListingId] = useState(null);
  const [selectedMsg, setSelectedMsg] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConversationModal, setShowDeleteConversationModal] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [sendingMessageId, setSendingMessageId] = useState(null);
  const messagesContainerRef = useRef(null);
  const messagesEndRef = useRef(null);

  /* ---------------- SOCKET CONNECT & ERROR HANDLING -------- */

  useEffect(() => {
    connectSocket();

    socket.on("connect", () => {
      console.log("✅ Socket connected:", socket.id);
    });

    socket.on("connect_error", (err) => {
      console.error("❌ Socket error:", err.message);
    });

    // Handle error messages from server
    socket.on("errorMessage", (message) => {
      console.error("❌ Server error:", message);
      alert("Chat error: " + message);
    });

    socket.on("messageSent", ({ messageId }) => {
      console.log("✅ Message confirmed sent:", messageId);
    });

    return () => {
      socket.off("connect");
      socket.off("connect_error");
      socket.off("errorMessage");
      socket.off("messageSent");
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

    joinConversationRoom(activeConversation._id);

    return () => {
      socket.emit("leaveConversation", activeConversation._id);
    };
  }, [activeConversation]);

  /* ---------------- REAL-TIME MESSAGE LISTENER ---------------- */
  useEffect(() => {
    socket.on("newMessage", (message) => {
      console.log("🔔 New message received:", message._id);
      setMessages((prev) => {
        const exists = prev.some((m) => m._id === message._id);
        if (exists) {
          console.log("⚠️ Message already exists, skipping");
          return prev;
        }

        const filtered = prev.filter((m) => m._id !== sendingMessageId);
        return [...filtered, message];
      });
      setSendingMessageId(null);
    });

    return () => {
      socket.off("newMessage");
    };
  }, [sendingMessageId]);

  /* ---------------- LOAD CONVERSATIONS & JOIN ROOMS -------- */
  useEffect(() => {
    const loadConversations = async () => {
      try {
        const res = await getMyConversations();
        setConversations(res.data || []);

        // 🔥 JOIN ALL CONVERSATION ROOMS SO WE GET REAL-TIME UPDATES
        res.data?.forEach((conv) => {
          joinConversationRoom(conv._id);
        });
      } catch {
        console.error("Failed to load conversations");
      }
    };

    loadConversations();
  }, []);

  /* ---------------- START CONVERSATION FROM LISTING -------- */
  useEffect(() => {
    if (!listingId) return;

    // Only auto-select listing conversation if no conversation is currently active
    // or if the active conversation is also from the same listing
    if (
      activeConversation &&
      activeConversation._id !== null &&
      activeConversation.listing?._id !== listingId
    ) {
      // User is viewing a different conversation, don't override
      return;
    }

    const existing = conversations.find(
      (c) =>
        c.listing?._id === listingId &&
        c.participants?.some((id) => id === userId),
    );

    if (existing) {
      setActiveConversation(existing);
    } else if (!activeConversation || activeConversation.listing?._id === listingId) {
      // Only create temp if we're not viewing another listing's chat
      setActiveConversation({
        _id: null,
        listing: {
          _id: listingId,
          title: "Loading...",
        },
        participants: [],
        unreadCount: {},
      });
      setMessages([]);
    }
  }, [listingId, conversations, userId]);

  /* ---------------- LOAD MESSAGES ---------------- */
  useEffect(() => {
    if (!activeConversation?._id) return;

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
  const handleSend = () => {
    const trimmedText = text.trim();

    if (!userId) return;
    if (activeConversation?.listing?.status === "sold") return;
    if (selectedImages.length > 0) {
      alert("Image messaging is not supported yet.");
      return;
    }
    if (!trimmedText) return;

    const tempId = "temp-" + Date.now();
    const tempMessage = {
      _id: tempId,
      sender: userId,
      text: trimmedText,
    };

    console.log("📤 Sending message:", tempId);
    setSendingMessageId(tempId);
    setMessages((prev) => [...prev, tempMessage]);
    setText("");

    const payload = {
      conversationId: activeConversation?._id || "new",
      text: tempMessage.text,
    };

    if (!activeConversation?._id) {
      payload.listingId = listingId;
    }

    socket.emit("sendMessage", payload, (response) => {
      if (!response) {
        const error = "No acknowledgement from server";
        console.error("❌", error);
        alert(error);
        setMessages((prev) => prev.filter((m) => m._id !== tempId));
        setSendingMessageId(null);
        return;
      }

      if (response.error) {
        console.error("❌ Send error:", response.error);
        alert("Failed to send message: " + response.error);
        setMessages((prev) => prev.filter((m) => m._id !== tempId));
        setSendingMessageId(null);
        return;
      }

      if (response.success) {
        const { conversation: createdConversation } = response;

        if (
          createdConversation &&
          createdConversation._id &&
          activeConversation?._id !== createdConversation._id
        ) {
          setActiveConversation(createdConversation);
          setConversations((prev) => {
            const exists = prev.find((c) => c._id === createdConversation._id);
            if (exists) {
              return prev.map((c) =>
                c._id === createdConversation._id ? createdConversation : c
              );
            }
            return [createdConversation, ...prev];
          });
          joinConversationRoom(createdConversation._id);
        }
      }

      setTimeout(() => {
        setMessages((prev) => {
          const stillHasTemp = prev.some((m) => m._id === tempId);
          if (stillHasTemp) {
            console.log("⚠️ Real message didn't arrive, removing temp");
            return prev.filter((m) => m._id !== tempId);
          }
          return prev;
        });
        setSendingMessageId(null);
      }, 3000);
    });
  };

  const handleDeleteConversation = async () => {
    if (!activeConversation?._id) return;

    try {
      await deleteConversation(activeConversation._id);
      socket.emit("leaveConversation", activeConversation._id);
      setConversations((prev) =>
        prev.filter((conv) => conv._id !== activeConversation._id)
      );
      setActiveConversation(null);
      setMessages([]);
      setShowDeleteConversationModal(false);
    } catch (err) {
      console.error("❌ Delete conversation error:", err);
      alert(
        "Failed to delete conversation: " + (err.message || "Unknown error")
      );
    }
  };

  /* -------- MESSAGE DELETE REALTIME -------- */
  useEffect(() => {
    socket.on("messageDeleted", ({ messageId }) => {
      setMessages((prev) =>
        prev.map((m) =>
          m._id === messageId
            ? { ...m, text: "This message was deleted", isDeleted: true }
            : m,
        ),
      );

      setConversations((prev) =>
        prev.map((c) => {
          if (c._id !== activeConversation?._id) return c;

          return {
            ...c,
            lastMessage: "This message was deleted",
          };
        }),
      );
    });
    return () => socket.off("messageDeleted");
  }, [activeConversation?._id]);

  /* -------- CONVERSATION UPDATE REALTIME (SIDEBAR) -------- */
  useEffect(() => {
    socket.on("conversationUpdated", ({ conversation }) => {
      setConversations((prev) => {
        // Remove from current position and add to top (most recent first)
        const filtered = prev.filter((c) => c._id !== conversation._id);
        return [conversation, ...filtered];
      });

      setActiveConversation((prev) =>
        prev && prev._id === conversation._id ? conversation : prev
      );
    });

    socket.on("conversationDeleted", ({ conversationId }) => {
      setConversations((prev) =>
        prev.filter((conv) => conv._id !== conversationId)
      );

      if (activeConversation?._id === conversationId) {
        setActiveConversation(null);
        setMessages([]);
      }
    });

    return () => {
      socket.off("conversationUpdated");
      socket.off("conversationDeleted");
    };
  }, [activeConversation]);

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

  const handleMessageClick = (msg) => {
    setSelectedMsg(msg);
    setShowModal(true);
  };

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
      return;
    }

    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  };

  const getOtherUserId = (conv) =>
    conv.participants.find((id) => id !== userId);

  const joinConversationRoom = (conversationId) => {
    if (!conversationId) return;

    if (socket.connected) {
      socket.emit("joinConversation", conversationId);
      return;
    }

    const onConnect = () => {
      socket.emit("joinConversation", conversationId);
      socket.off("connect", onConnect);
    };

    socket.on("connect", onConnect);
  };

  /* ================= RENDER ================= */
  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="card max-w-7xl mx-auto grid gap-6 lg:grid-cols-[1.1fr_1.9fr] h-[80vh] overflow-hidden">
        {/* ================= LEFT PANEL ================= */}
        <div className="border-r border-slate-200 p-4 overflow-y-auto bg-white">
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
                onClick={async () => {
                  const currentScrollY = window.scrollY;
                  setActiveConversation(conv);
                  setMessages([]);

                  // Optimistically reset unread count UI
                  setConversations((prev) =>
                    prev.map((c) =>
                      c._id === conv._id
                        ? {
                            ...c,
                            unreadCount: {
                              ...c.unreadCount,
                              [userId]: 0,
                            },
                          }
                        : c,
                    ),
                  );

                  window.requestAnimationFrame(() => {
                    window.scrollTo(0, currentScrollY);
                  });

                }}
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

                <p
                  className={`text-xs mt-1 truncate ${
                    conv.lastMessage === "This message was deleted"
                      ? "italic text-gray-400"
                      : "text-gray-500"
                  }`}
                >
                  {conv.lastMessage || "No messages yet"}
                </p>
              </div>
            );
          })
        )}
        </div>

        {/* ================= RIGHT PANEL ================= */}
        <div className="p-4 flex flex-col bg-white">
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
                    <button
                      onClick={() => setShowDeleteConversationModal(true)}
                      className="text-sm text-red-600 hover:text-red-800 border border-red-200 px-3 py-1 rounded"
                    >
                      Delete chat
                    </button>
                  </div>

                  {/* SOLD INFO BANNER */}
                  {isItemSold && (
                    <div className="mb-3 p-3 rounded bg-red-50 border border-red-300 text-red-700 text-sm text-center">
                      🚫 This item has been sold. You can no longer send
                      messages.
                    </div>
                  )}
                </>
              );
            })()}

            {/* MESSAGES */}
            <div
              ref={messagesContainerRef}
              className="flex-1 overflow-y-auto space-y-2 mb-3"
            >
              {messages.map((msg) => {
                const isMine = msg.sender === userId;

                return (
                  <div
                    key={msg._id}
                    onClick={() => !msg.isDeleted && handleMessageClick(msg)}
                    className={`max-w-[70%] px-3 py-2 rounded text-sm whitespace-pre-wrap break-words ${
                      msg.isDeleted
                        ? "opacity-60 cursor-not-allowed"
                        : "cursor-pointer"
                    } ${
                      msg.sender === userId
                        ? "ml-auto bg-blue-600 text-white"
                        : "mr-auto bg-gray-200 text-gray-800"
                    }`}
                  >
                    {msg.isDeleted ? <i>This message was deleted</i> : msg.text}
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
            {selectedImages.length > 0 && (
              <div className="flex gap-2 mb-2 flex-wrap">
                {selectedImages.map((img, i) => (
                  <div key={i} className="relative">
                    <img
                      src={URL.createObjectURL(img)}
                      className="h-20 w-20 object-cover rounded cursor-pointer"
                      onClick={() => setPreviewImage(URL.createObjectURL(img))}
                    />

                    <span
                      onClick={() =>
                        setSelectedImages(
                          selectedImages.filter((_, x) => x !== i),
                        )
                      }
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full px-1 cursor-pointer"
                    >
                      ✕
                    </span>
                  </div>
                ))}
              </div>
            )}
            {/* INPUT */}
            <div className="flex gap-2 border-t pt-3">
              {/* Hidden file input */}
              <input
                type="file"
                multiple
                accept="image/*"
                id="imagePicker"
                hidden
                onChange={(e) =>
                  setSelectedImages([
                    ...selectedImages,
                    ...Array.from(e.target.files),
                  ])
                }
                disabled={activeConversation?.listing?.status === "sold"}
              />

              {/* Add Image Button */}
              <button
                onClick={() => document.getElementById("imagePicker").click()}
                disabled={activeConversation?.listing?.status === "sold"}
                className="px-3 border rounded"
              >
                📎
              </button>

              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                disabled={activeConversation?.listing?.status === "sold"}
                className="flex-1 border p-2 rounded"
                placeholder="Type message..."
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

      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
        >
          <img src={previewImage} className="max-h-[90%]" />
        </div>
      )}

      {showDeleteConversationModal && activeConversation?._id && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded p-5 w-96">
            <p className="font-semibold mb-3">Delete conversation</p>
            <p className="mb-4 text-sm text-gray-600">
              Are you sure you want to delete this conversation? This will
              permanently remove all messages and you will no longer be able to
              access it.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowDeleteConversationModal(false)}
                className="flex-1 py-2 border rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConversation}
                className="flex-1 py-2 bg-red-600 text-white rounded"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {showModal && selectedMsg && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded p-5 w-80">
            <p className="font-semibold mb-3">Message options</p>

            {/* DELETE (ONLY SENDER) */}
            {selectedMsg.sender === userId && (
              <button
                onClick={() => {
                  socket.emit("deleteMessage", { messageId: selectedMsg._id });
                  setShowModal(false);
                }}
                className="w-full mb-3 py-2 bg-red-500 text-white rounded"
              >
                🗑 Delete Message
              </button>
            )}

            {/* REPORT (ONLY RECEIVER) */}
            {selectedMsg.sender !== userId && (
              <>
                <textarea
                  placeholder="Enter report reason..."
                  className="w-full border p-2 rounded mb-2"
                  rows={3}
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                />

                <button
                  onClick={async () => {
                    if (!reportReason.trim()) return alert("Enter reason");

                    await reportMessage(selectedMsg._id, reportReason);
                    setReportReason("");
                    setShowModal(false);
                  }}
                  className="w-full mb-2 py-2 bg-yellow-500 text-white rounded"
                >
                  🚩 Report Message
                </button>
              </>
            )}

            <button
              onClick={() => setShowModal(false)}
              className="w-full py-2 border rounded"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Messages;
