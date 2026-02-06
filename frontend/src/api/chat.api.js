import api from './axios';

// Start or get conversation (by listing)
export const startConversation = async (listingId) => {
  const res = await api.post('/api/chat/start', { listingId });
  return res.data;
};

// Get my conversations
export const getMyConversations = async () => {
  const res = await api.get('/api/chat');
  return res.data;
};

// Get messages of a conversation
export const getMessages = async (conversationId) => {
  const res = await api.get(
    `/api/chat/${conversationId}/messages`
  );
  return res.data;
};

// Send message
export const sendMessage = async (conversationId, text) => {
  const res = await api.post(
    `/api/chat/${conversationId}/messages`,
    { text } // 🔥 IMPORTANT: text, not content
  );
  return res.data;
};

