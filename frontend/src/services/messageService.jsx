import api from "./api";
import { isValidObjectId } from "../utils/validation";

// =========================================================
// GET ALL CONVERSATIONS
// =========================================================

export const getConversations = async () => {
  try {
    const response = await api.get("/messages/conversations");

    return response.data;
  } catch (error) {
    throw error;
  }
};

// =========================================================
// GET MESSAGES
// =========================================================

export const getMessages = async (conversationId) => {
  if (!conversationId) {
    throw new Error("Conversation ID is required");
  }

  if (!isValidObjectId(conversationId)) {
    throw new Error("Invalid conversation ID");
  }

  try {
    const response = await api.get(
      `/messages/${conversationId}`
    );

    return response.data;
  } catch (error) {
    throw error;
  }
};

// =========================================================
// SEND MESSAGE
// =========================================================

export const sendMessage = async ({
  receiverId,
  text = "",
  image = null,
}) => {
  // -------------------------------------------------------
  // VALIDATE RECEIVER
  // -------------------------------------------------------

  if (!receiverId) {
    throw new Error("Receiver ID is required");
  }

  if (!isValidObjectId(receiverId)) {
    throw new Error("Invalid receiver ID");
  }

  const cleanText =
    typeof text === "string"
      ? text.trim()
      : "";

  // -------------------------------------------------------
  // VALIDATE MESSAGE
  // -------------------------------------------------------

  if (!cleanText && !image) {
    throw new Error("Message cannot be empty");
  }

  try {
    // -----------------------------------------------------
    // IMAGE MESSAGE
    // -----------------------------------------------------

    if (image) {
      const formData = new FormData();

      formData.append(
        "receiverId",
        String(receiverId)
      );

      if (cleanText) {
        formData.append(
          "text",
          cleanText
        );
      }

      formData.append(
        "image",
        image
      );

      const response = await api.post(
        "/messages",
        formData
      );

      return response.data;
    }

    // -----------------------------------------------------
    // NORMAL TEXT MESSAGE
    // -----------------------------------------------------

    const response = await api.post(
      "/messages",
      {
        receiverId: String(receiverId),
        text: cleanText,
      }
    );

    return response.data;
  } catch (error) {
    throw error;
  }
};

// =========================================================
// MARK MESSAGES AS READ
// =========================================================

export const markMessagesAsRead = async (
  conversationId
) => {
  if (!conversationId) {
    throw new Error(
      "Conversation ID is required"
    );
  }

  if (!isValidObjectId(conversationId)) {
    throw new Error("Invalid conversation ID");
  }

  try {
    const response = await api.put(
      `/messages/${conversationId}/read`
    );

    return response.data;
  } catch (error) {
    throw error;
  }
};

// =========================================================
// GET UNREAD MESSAGE COUNT
// =========================================================

export const getUnreadMessageCount = async () => {
  try {
    const response = await api.get(
      "/messages/unread-count"
    );

    return response.data;
  } catch (error) {
    throw error;
  }
};

// =========================================================
// DEFAULT EXPORT
// =========================================================

const messageService = {
  getConversations,
  getMessages,
  sendMessage,
  markMessagesAsRead,
  getUnreadMessageCount,
};

export default messageService;