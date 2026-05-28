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

// Delete conversation
export const deleteConversation = async (conversationId) => {
  const res = await api.delete(`/api/chat/${conversationId}`);
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