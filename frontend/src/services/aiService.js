import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5002/api";

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
      getAuthConfig()
    );

    return response.data;
  } catch (error) {
    console.error(
      "AI Service Error:",
      error.response?.data || error.message
    );

    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Unable to connect to JobSphere AI";

    throw new Error(errorMessage);
  }
};

export default {
  sendAIMessage,
};