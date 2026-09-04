import api from "./api";
import { generateLocalAIResponse } from "../utils/mockData";

export const sendAIMessage = async (
  message,
  conversationHistory = []
) => {
  try {
    const response = await api.post("/ai/chat", {
      message: message.trim(),
      conversationHistory,
    });

    return response.data;

  } catch (error) {
    console.warn("AI Backend unreachable or offline, using local intelligent AI model:", error?.message);
    const storedUser = JSON.parse(localStorage.getItem("user") || "null");
    const localResult = generateLocalAIResponse(message, storedUser);
    
    return {
      success: true,
      data: {
        message: localResult.message,
        recommendedJobs: localResult.recommendedJobs,
      },
    };
  }
};

export default {
  sendAIMessage,
};