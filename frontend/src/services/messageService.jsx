import api from "./api";

export const getConversations = async () => {
  const response = await api.get("/messages/conversations");
  return response.data;
};

export const getMessages = async (conversationId) => {
  const response = await api.get(`/messages/${conversationId}`);
  return response.data;
};

export const sendMessage = async ({ receiverId, text = "", image = null }) => {
  const cleanText = typeof text === "string" ? text.trim() : "";
  if (!cleanText && !image) {
    throw new Error("Message cannot be empty");
  }

  if (image) {
    const formData = new FormData();
    formData.append("receiverId", String(receiverId));
    if (cleanText) formData.append("text", cleanText);
    formData.append("image", image);
    const response = await api.post("/messages", formData);
    return response.data;
  }

  const response = await api.post("/messages", {
    receiverId: String(receiverId),
    text: cleanText,
  });
  return response.data;
};

export const markMessagesAsRead = async (conversationId) => {
  try {
    const response = await api.put(`/messages/${conversationId}/read`);
    return response.data;
  } catch (error) {
    return { success: true };
  }
};

export const getUnreadMessageCount = async () => {
  try {
    const response = await api.get("/messages/unread-count");
    return response.data;
  } catch (error) {
    return { success: true, data: { count: 0 }, count: 0 };
  }
};

const messageService = {
  getConversations,
  getMessages,
  sendMessage,
  markMessagesAsRead,
  getUnreadMessageCount,
};

export default messageService;