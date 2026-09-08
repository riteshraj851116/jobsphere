import api from "./api";

const dsaService = {
  // Get problems list with filters and pagination
  async getProblems(params = {}) {
    const response = await api.get("/dsa/problems", { params });
    return response.data;
  },

  // Get single problem by ID or slug
  async getProblem(idOrSlug) {
    const response = await api.get(`/dsa/problems/${idOrSlug}`);
    return response.data;
  },

  // Get all topics with user completion stats
  async getTopics() {
    const response = await api.get("/dsa/topics");
    return response.data;
  },

  // Get DSA Sheet roadmap (Beginner, Intermediate, Advanced)
  async getDsaSheet() {
    const response = await api.get("/dsa/sheet");
    return response.data;
  },

  // Get today's daily challenge
  async getDailyChallenge() {
    const response = await api.get("/dsa/daily-challenge");
    return response.data;
  },

  // Run code against visible sample test cases
  async runCode({ problemId, language, code }) {
    const response = await api.post("/dsa/run", { problemId, language, code });
    return response.data;
  },

  // Submit code against all test cases (recorded in DB)
  async submitCode({ problemId, language, code }) {
    const response = await api.post("/dsa/submit", { problemId, language, code });
    return response.data;
  },

  // Get submissions history for a problem
  async getSubmissions(problemId) {
    const response = await api.get(`/dsa/submissions/${problemId}`);
    return response.data;
  },

  // Get logged-in user's DSA progress, streak, and AI recommendations
  async getUserProgress() {
    const response = await api.get("/dsa/progress");
    return response.data;
  },

  // Toggle bookmark on a problem
  async toggleBookmark(problemId) {
    const response = await api.post(`/dsa/bookmark/${problemId}`);
    return response.data;
  },

  // Get all bookmarked problems
  async getBookmarks() {
    const response = await api.get("/dsa/bookmarks");
    return response.data;
  },

  // AI DSA Coach interaction: hint, explain, complexity, review, debug, solution
  async askAiCoach(action, payload) {
    const response = await api.post(`/dsa/ai/${action}`, payload);
    return response.data;
  },

  // Get Job-specific DSA preparation recommendations
  async getJobDsaPrep(jobId) {
    const response = await api.get(`/dsa/job-prep/${jobId}`);
    return response.data;
  },
};

export default dsaService;
