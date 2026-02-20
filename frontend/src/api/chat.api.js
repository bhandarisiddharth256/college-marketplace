import api from "./axios";

// Get my conversations
export const getMyConversations = async () => {
  const res = await api.get("/api/chat");
  return res.data;
};

// Get messages of a conversation
export const getMessages = async (conversationId) => {
  const res = await api.get(`/api/chat/${conversationId}/messages`);
  return res.data;
};

// Send message (REST fallback – socket primary)
export const sendMessage = async (conversationId, text, listingId) => {
  if (!listingId && (!conversationId || conversationId === "null")) {
    throw new ApiError(400, "listingId required");
  }
  const id =
    conversationId && conversationId !== "null" ? conversationId : "new";

  const res = await api.post(`/api/chat/${id}/messages`, {
    text,
    listingId,
  });

  return res.data;
};

// 🚩 Report message
export const reportMessage = async (messageId, reason) => {
  const res = await api.post(`/api/chat/message/${messageId}/report`, {
    reason,
  });

  return res.data;
};

// 🗑 Delete message (REST fallback – socket primary)
export const deleteMessage = async (messageId) => {
  const res = await api.delete(`/api/chat/message/${messageId}`);
  return res.data;
};
