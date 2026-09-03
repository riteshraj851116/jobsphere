import api from "./api";

// Start a new practice interview session
export const startInterview = async (role, difficulty, questionCount) => {
  try {
    const response = await api.post("/interview/start", {
      role,
      difficulty,
      questionCount
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get a specific interview session
export const getInterviewSession = async (sessionId) => {
  try {
    const response = await api.get(`/interview/${sessionId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Save or update an answer (or skip)
export const saveInterviewAnswer = async (sessionId, questionId, answer, skipped = false) => {
  try {
    const response = await api.put(`/interview/${sessionId}/answer`, {
      questionId,
      answer,
      skipped
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Complete an interview session
export const completeInterviewSession = async (sessionId, duration) => {
  try {
    const response = await api.post(`/interview/${sessionId}/complete`, {
      duration
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get user's interview history
export const getInterviewHistory = async () => {
  try {
    const response = await api.get("/interview/history");
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get question bank with optional filters
export const getQuestions = async (params = {}) => {
  try {
    const response = await api.get("/interview/questions", { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export default {
  startInterview,
  getInterviewSession,
  saveInterviewAnswer,
  completeInterviewSession,
  getInterviewHistory,
  getQuestions
};
