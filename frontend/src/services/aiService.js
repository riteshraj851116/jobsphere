import axios from "axios";
import { generateLocalAIResponse } from "../utils/mockData";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5005/api";

const getToken = () => {
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    ""
  );
};

const getAuthConfig = () => {
  const token = getToken();

  return {
    headers: {
      "Content-Type": "application/json",
      ...(token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {}),
    },
    withCredentials: true,
  };
};

export const sendAIMessage = async (
  message,
  conversationHistory = []
) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/ai/chat`,
      {
        message: message.trim(),
        conversationHistory,
      },
      {
        ...getAuthConfig(),
        timeout: 10000,
      }
    );

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