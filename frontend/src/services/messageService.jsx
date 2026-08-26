import api from "./api";

// ==========================================
// GET ALL CONVERSATIONS
// ==========================================

export const getConversations = async () => {
  const response = await api.get("/messages/conversations");
  return response.data;
};


// ==========================================
// GET MESSAGES
// ==========================================

export const getMessages = async (conversationId) => {
  if (!conversationId) {
    throw new Error("Conversation ID is required");
  }

  const response = await api.get(
    `/messages/${conversationId}`
  );

  return response.data;
};


// ==========================================
// SEND MESSAGE
// Supports text message
// ==========================================

export const sendMessage = async ({
  receiverId,
  text,
  image = null
}) => {
  if (!receiverId) {
    throw new Error("Receiver ID is required");
  }

  if (!text?.trim() && !image) {
    throw new Error("Message cannot be empty");
  }

  // If image is being sent, use FormData
  if (image) {
    const formData = new FormData();

    formData.append(
      "receiverId",
      receiverId
    );

    if (text?.trim()) {
      formData.append(
        "text",
        text.trim()
      );
    }

    formData.append(
      "image",
      image
    );

    const response = await api.post(
      "/messages",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      }
    );

    return response.data;
  }

  // Normal text message
  const response = await api.post(
    "/messages",
    {
      receiverId,
      text: text.trim()
    }
  );

  return response.data;
};


// ==========================================
// MARK MESSAGES AS READ
// ==========================================

export const markMessagesAsRead = async (
  conversationId
) => {
  if (!conversationId) {
    throw new Error(
      "Conversation ID is required"
    );
  }

  const response = await api.put(
    `/messages/${conversationId}/read`
  );

  return response.data;
};


// ==========================================
// GET UNREAD MESSAGE COUNT
// ==========================================

export const getUnreadMessageCount =
  async () => {
    const response = await api.get(
      "/messages/unread-count"
    );

    return response.data;
  };


// ==========================================
// DEFAULT EXPORT
// ==========================================

const messageService = {
  getConversations,
  getMessages,
  sendMessage,
  markMessagesAsRead,
  getUnreadMessageCount
};

export default messageService;