import api from "./api";
import { MOCK_MESSAGES, DEMO_RECRUITER, DEMO_CANDIDATE } from "../utils/mockData";

const STORAGE_MESSAGES_KEY = "jobsphere_local_messages";

const getLocalMessages = () => {
  try {
    const raw = localStorage.getItem(STORAGE_MESSAGES_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  return MOCK_MESSAGES;
};

const saveLocalMessages = (list) => {
  try {
    localStorage.setItem(STORAGE_MESSAGES_KEY, JSON.stringify(list));
  } catch (e) {
    console.error(e);
  }
};

export const getConversations = async () => {
  try {
    const response = await api.get("/messages/conversations");
    return response.data;
  } catch (error) {
    const msgs = getLocalMessages();
    const storedUser = JSON.parse(localStorage.getItem("user") || "null");
    const isRecruiter = storedUser?.role === "recruiter";

    const defaultPartner = isRecruiter ? DEMO_CANDIDATE : DEMO_RECRUITER;
    const conv = [
      {
        _id: "conv-001",
        participant: defaultPartner,
        lastMessage: msgs[msgs.length - 1] || msgs[0],
        unreadCount: 1,
        updatedAt: new Date().toISOString(),
      },
    ];
    return { success: true, data: { conversations: conv }, conversations: conv };
  }
};

export const getMessages = async (conversationId) => {
  try {
    const response = await api.get(`/messages/${conversationId}`);
    return response.data;
  } catch (error) {
    const msgs = getLocalMessages();
    return { success: true, data: { messages: msgs }, messages: msgs };
  }
};

export const sendMessage = async ({ receiverId, text = "", image = null }) => {
  const cleanText = typeof text === "string" ? text.trim() : "";
  if (!cleanText && !image) {
    throw new Error("Message cannot be empty");
  }

  try {
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
  } catch (error) {
    const msgs = getLocalMessages();
    const storedUser = JSON.parse(localStorage.getItem("user") || "null") || DEMO_CANDIDATE;
    const newMsg = {
      _id: "msg-" + Date.now(),
      sender: storedUser,
      receiver: { _id: receiverId },
      conversationId: "conv-001",
      text: cleanText,
      createdAt: new Date().toISOString(),
    };
    msgs.push(newMsg);
    saveLocalMessages(msgs);
    return { success: true, data: newMsg, message: newMsg };
  }
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
    return { success: true, data: { count: 1 }, count: 1 };
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