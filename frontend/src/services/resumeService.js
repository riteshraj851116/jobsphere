import api from "./api";

// Upload and analyze resume
export const analyzeResume = async (formData) => {
  try {
    const response = await api.post("/resume/analyze", formData, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get all previous analyses for logged-in user
export const getResumeAnalyses = async () => {
  try {
    const response = await api.get("/resume/analyses");
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get single analysis by ID
export const getResumeAnalysisById = async (id) => {
  try {
    const response = await api.get(`/resume/analysis/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Delete single analysis
export const deleteResumeAnalysis = async (id) => {
  try {
    const response = await api.delete(`/resume/analysis/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export default {
  analyzeResume,
  getResumeAnalyses,
  getResumeAnalysisById,
  deleteResumeAnalysis
};
