import api from "./axios";

// Get my conversations
export const getMyConversations = async () => {
  const res = await api.get("/api/chat");
  return res.data;
};

// Get messages
export const getMessages = async (conversationId) => {
  const res = await api.get(`/api/chat/${conversationId}/messages`);
  return res.data;
};

// Send message
export const sendMessage = async (conversationId, text, listingId) => {
  // ❌ Fix: frontend cannot use ApiError
  if (!listingId && (!conversationId || conversationId === "null")) {
    throw new Error("listingId required");
  }

  const id =
    conversationId && conversationId !== "null"
      ? conversationId
      : "new";

  const res = await api.post(`/api/chat/${id}/messages`, {
    text,
    listingId,
  });

  return res.data;
};

// Report message
export const reportMessage = async (messageId, reason) => {
  const res = await api.post(`/api/chat/message/${messageId}/report`, {
    reason,
  });
  return res.data;
};

// Delete message
export const deleteMessage = async (messageId) => {
  const res = await api.delete(`/api/chat/message/${messageId}`);
  return res.data;
};