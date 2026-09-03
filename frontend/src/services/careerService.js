import api from "./api";

// 1. Recommendations & Match Score
export const getRecommendedJobs = async () => {
  const res = await api.get("/career/recommendations");
  return res.data?.data || res.data;
};

export const getJobMatchScore = async (jobId) => {
  const res = await api.get(`/career/match-score/${jobId}`);
  return res.data?.data || res.data;
};

// 2. Career Roadmap
export const getCareerRoadmap = async (role = "MERN Stack Developer") => {
  const res = await api.get(`/career/roadmap?role=${encodeURIComponent(role)}`);
  return res.data?.data || res.data;
};

export const toggleRoadmapSkill = async (roadmapId, phaseId, skillId) => {
  const res = await api.put("/career/roadmap/toggle-skill", {
    roadmapId,
    phaseId,
    skillId
  });
  return res.data?.data || res.data;
};

// 3. Skill Gap Analyzer
export const getSkillGap = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const res = await api.get(`/career/skill-gap?${query}`);
  return res.data?.data || res.data;
};

// 4. Unified Dashboard Analytics
export const getDashboardAnalytics = async () => {
  const res = await api.get("/career/dashboard-analytics");
  return res.data?.data || res.data;
};

// 5. Bookmarks & Interview Analytics
export const getBookmarks = async () => {
  const res = await api.get("/career/interview/bookmarks");
  return res.data?.data || res.data;
};

export const toggleBookmark = async (questionId, notes = "", tags = []) => {
  const res = await api.post("/career/interview/bookmarks", {
    questionId,
    notes,
    tags
  });
  return res.data?.data || res.data;
};

export const getInterviewAnalytics = async () => {
  const res = await api.get("/career/interview/analytics");
  return res.data?.data || res.data;
};

// 6. Job Alerts
export const getJobAlerts = async () => {
  const res = await api.get("/career/alerts");
  return res.data?.data || res.data;
};

export const createJobAlert = async (alertData) => {
  const res = await api.post("/career/alerts", alertData);
  return res.data?.data || res.data;
};

export const toggleJobAlert = async (id) => {
  const res = await api.patch(`/career/alerts/${id}/toggle`);
  return res.data?.data || res.data;
};

export const deleteJobAlert = async (id) => {
  const res = await api.delete(`/career/alerts/${id}`);
  return res.data?.data || res.data;
};

// 7. Saved Searches
export const getSavedSearches = async () => {
  const res = await api.get("/career/saved-searches");
  return res.data?.data || res.data;
};

export const createSavedSearch = async (searchData) => {
  const res = await api.post("/career/saved-searches", searchData);
  return res.data?.data || res.data;
};

export const deleteSavedSearch = async (id) => {
  const res = await api.delete(`/career/saved-searches/${id}`);
  return res.data?.data || res.data;
};

// 8. Followed Companies
export const toggleFollowCompany = async (companyId) => {
  const res = await api.post(`/career/companies/${companyId}/follow`);
  return res.data?.data || res.data;
};

export const getFollowedCompanies = async () => {
  const res = await api.get("/career/companies/followed");
  return res.data?.data || res.data;
};

// 9. Job Comparison
export const compareJobs = async (jobIds) => {
  const res = await api.post("/career/jobs/compare", { jobIds });
  return res.data?.data || res.data;
};

// 10. Application Tracker Actions
export const updateApplicationStage = async (id, stage) => {
  const res = await api.patch(`/career/applications/${id}/stage`, { stage });
  return res.data?.data || res.data;
};

export const addApplicationNote = async (id, text) => {
  const res = await api.post(`/career/applications/${id}/notes`, { text });
  return res.data?.data || res.data;
};

export const addApplicationReminder = async (id, title, dueDate) => {
  const res = await api.post(`/career/applications/${id}/reminders`, {
    title,
    dueDate
  });
  return res.data?.data || res.data;
};

export const toggleApplicationReminder = async (id, reminderId) => {
  const res = await api.patch(`/career/applications/${id}/reminders/${reminderId}`);
  return res.data?.data || res.data;
};

// 11. Export User Career Data
export const exportUserData = async () => {
  const res = await api.get("/career/export", { responseType: "blob" });
  return res.data;
};
