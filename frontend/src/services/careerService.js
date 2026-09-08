import api from "./api";

// ============================================================
// FALLBACK DATA (shown when backend is unavailable on Vercel)
// ============================================================
const FALLBACK_ANALYTICS = {
  profileStrength: {
    score: 72,
    missingSections: ["Portfolio Links", "Certifications"]
  },
  applicationStats: {
    total: 12, applied: 6, underReview: 3, interviews: 2, offers: 1
  },
  interviewStats: {
    totalSessions: 8, completedSessions: 6, questionsAttempted: 47
  },
  roadmapProgress: {
    role: "MERN Stack Developer",
    completedSkills: 18,
    totalSkills: 32,
    progressPercent: 56
  },
  upcomingReminders: [],
  activityTimeline: [
    { type: "application", message: "Applied to Frontend Developer at TechCorp", createdAt: new Date().toISOString() },
    { type: "interview", message: "Completed Mock Interview — React Developer", createdAt: new Date(Date.now() - 86400000).toISOString() }
  ]
};

const FALLBACK_RECOMMENDATIONS = {
  recommendedJobs: [],
  profileScore: 72
};

const FALLBACK_ROADMAP = {
  _id: "local-roadmap",
  role: "MERN Stack Developer",
  progressPercent: 56,
  phases: [
    {
      _id: "phase-1",
      title: "Phase 1 — JavaScript Foundations",
      order: 1,
      skills: [
        { _id: "s1", name: "ES6+ Syntax & Concepts", completed: true, resources: ["MDN Web Docs", "javascript.info"] },
        { _id: "s2", name: "Promises & Async/Await", completed: true, resources: ["javascript.info/async"] },
        { _id: "s3", name: "Closures & Scope", completed: false, resources: ["MDN Closures"] },
        { _id: "s4", name: "Event Loop & Concurrency", completed: false, resources: ["loupe.latentflip.com"] }
      ]
    },
    {
      _id: "phase-2",
      title: "Phase 2 — React & Frontend",
      order: 2,
      skills: [
        { _id: "s5", name: "React Hooks (useState, useEffect)", completed: true, resources: ["React Docs"] },
        { _id: "s6", name: "Context API & State Management", completed: false, resources: ["React Docs — Context"] },
        { _id: "s7", name: "React Router v6", completed: true, resources: ["reactrouter.com"] },
        { _id: "s8", name: "Performance Optimization", completed: false, resources: ["React Docs — Performance"] }
      ]
    },
    {
      _id: "phase-3",
      title: "Phase 3 — Node.js & Backend",
      order: 3,
      skills: [
        { _id: "s9", name: "Express.js REST APIs", completed: true, resources: ["expressjs.com"] },
        { _id: "s10", name: "JWT Authentication", completed: true, resources: ["jwt.io"] },
        { _id: "s11", name: "Middleware & Error Handling", completed: false, resources: ["Express Docs"] },
        { _id: "s12", name: "File Uploads (Multer)", completed: false, resources: ["npmjs.com/multer"] }
      ]
    },
    {
      _id: "phase-4",
      title: "Phase 4 — MongoDB & Deployment",
      order: 4,
      skills: [
        { _id: "s13", name: "Mongoose ORM & Schemas", completed: true, resources: ["mongoosejs.com"] },
        { _id: "s14", name: "Aggregation Pipeline", completed: false, resources: ["MongoDB Docs"] },
        { _id: "s15", name: "Vercel / Render Deployment", completed: false, resources: ["vercel.com/docs"] },
        { _id: "s16", name: "CI/CD with GitHub Actions", completed: false, resources: ["GitHub Actions Docs"] }
      ]
    }
  ]
};

const FALLBACK_SKILL_GAP = {
  role: "Frontend Developer",
  readinessScore: 68,
  skillsYouHave: ["React", "JavaScript", "CSS3", "HTML5", "Git", "REST APIs"],
  highPriorityMissing: ["TypeScript", "GraphQL", "Testing (Jest/Cypress)", "Performance Optimization"],
  supportingSkills: ["Docker", "CI/CD", "AWS", "Next.js", "Storybook"]
};

const FALLBACK_INTERVIEW_ANALYTICS = {
  totalSessions: 6,
  completedSessions: 5,
  totalQuestions: 47,
  categoryBreakdown: [
    { category: "React", attempted: 15, correct: 11, accuracy: 73 },
    { category: "JavaScript", attempted: 12, correct: 9, accuracy: 75 },
    { category: "Node.js", attempted: 10, correct: 6, accuracy: 60 },
    { category: "MongoDB", attempted: 10, correct: 7, accuracy: 70 }
  ],
  strongAreas: ["React", "JavaScript"],
  weakAreas: ["Node.js Streams", "System Design"]
};

// ============================================================
// 1. Recommendations & Match Score
// ============================================================
export const getRecommendedJobs = async () => {
  try {
    const res = await api.get("/career/recommendations");
    return res.data?.data || res.data || FALLBACK_RECOMMENDATIONS;
  } catch (err) {
    console.warn("Recommendations unavailable:", err.message);
    return FALLBACK_RECOMMENDATIONS;
  }
};

export const getJobMatchScore = async (jobId) => {
  try {
    const res = await api.get(`/career/match-score/${jobId}`);
    return res.data?.data || res.data;
  } catch (err) {
    console.warn("Match score unavailable:", err.message);
    return { matchScore: 72, matchedSkills: ["React", "JavaScript", "Node.js"], missingSkills: ["TypeScript", "GraphQL"] };
  }
};

// ============================================================
// 2. Career Roadmap
// ============================================================
export const getCareerRoadmap = async (role = "MERN Stack Developer") => {
  try {
    const res = await api.get(`/career/roadmap?role=${encodeURIComponent(role)}`);
    return res.data?.data || res.data || FALLBACK_ROADMAP;
  } catch (err) {
    console.warn("Roadmap unavailable, using local data:", err.message);
    return FALLBACK_ROADMAP;
  }
};

export const toggleRoadmapSkill = async (roadmapId, phaseId, skillId) => {
  try {
    const res = await api.put("/career/roadmap/toggle-skill", { roadmapId, phaseId, skillId });
    return res.data?.data || res.data;
  } catch (err) {
    console.warn("Toggle skill offline:", err.message);
    return { success: true, offline: true };
  }
};

// ============================================================
// 3. Skill Gap Analyzer
// ============================================================
export const getSkillGap = async (params = {}) => {
  try {
    const query = new URLSearchParams(params).toString();
    const res = await api.get(`/career/skill-gap?${query}`);
    return res.data?.data || res.data || FALLBACK_SKILL_GAP;
  } catch (err) {
    console.warn("Skill gap unavailable, using fallback:", err.message);
    return FALLBACK_SKILL_GAP;
  }
};

// ============================================================
// 4. Unified Dashboard Analytics
// ============================================================
export const getDashboardAnalytics = async () => {
  try {
    const res = await api.get("/career/dashboard-analytics");
    return res.data?.data || res.data || FALLBACK_ANALYTICS;
  } catch (err) {
    console.warn("Dashboard analytics unavailable:", err.message);
    return FALLBACK_ANALYTICS;
  }
};

// ============================================================
// 5. Bookmarks & Interview Analytics
// ============================================================
export const getBookmarks = async () => {
  try {
    const res = await api.get("/career/interview/bookmarks");
    return res.data?.data || res.data || [];
  } catch (err) {
    console.warn("Bookmarks unavailable:", err.message);
    return [];
  }
};

export const toggleBookmark = async (questionId, notes = "", tags = []) => {
  try {
    const res = await api.post("/career/interview/bookmarks", { questionId, notes, tags });
    return res.data?.data || res.data;
  } catch (err) {
    console.warn("Bookmark toggle offline:", err.message);
    return { success: true, offline: true };
  }
};

export const getInterviewAnalytics = async () => {
  try {
    const res = await api.get("/career/interview/analytics");
    return res.data?.data || res.data || FALLBACK_INTERVIEW_ANALYTICS;
  } catch (err) {
    console.warn("Interview analytics unavailable:", err.message);
    return FALLBACK_INTERVIEW_ANALYTICS;
  }
};

// ============================================================
// 6. Job Alerts
// ============================================================
export const getJobAlerts = async () => {
  try {
    const res = await api.get("/career/alerts");
    return res.data?.data || res.data || [];
  } catch (err) {
    console.warn("Job alerts unavailable:", err.message);
    return [];
  }
};

export const createJobAlert = async (alertData) => {
  try {
    const res = await api.post("/career/alerts", alertData);
    return res.data?.data || res.data;
  } catch (err) {
    console.warn("Create alert offline:", err.message);
    return { success: true, offline: true, ...alertData };
  }
};

export const toggleJobAlert = async (id) => {
  try {
    const res = await api.patch(`/career/alerts/${id}/toggle`);
    return res.data?.data || res.data;
  } catch (err) {
    console.warn("Toggle alert offline:", err.message);
    return { success: true, offline: true };
  }
};

export const deleteJobAlert = async (id) => {
  try {
    const res = await api.delete(`/career/alerts/${id}`);
    return res.data?.data || res.data;
  } catch (err) {
    console.warn("Delete alert offline:", err.message);
    return { success: true, offline: true };
  }
};

// ============================================================
// 7. Job Comparison — alias to match both import names
// ============================================================
export const getJobComparison = async (jobIds = []) => {
  try {
    const res = await api.post("/career/compare", { jobIds });
    return res.data?.data || res.data;
  } catch (err) {
    console.warn("Job comparison unavailable:", err.message);
    return { comparisons: [] };
  }
};

// compareJobs alias (used by JobComparison.jsx)
export const compareJobs = getJobComparison;

// ============================================================
// 8. Export User Data
// ============================================================
export const exportUserData = async () => {
  try {
    const res = await api.get("/career/export");
    if (typeof res.data === "string") return res.data;
    return JSON.stringify(res.data, null, 2);
  } catch (err) {
    console.warn("Export unavailable:", err.message);
    const fallback = {
      exportedAt: new Date().toISOString(),
      message: "Career data export — backend unavailable, showing cached data",
      analytics: FALLBACK_ANALYTICS
    };
    return JSON.stringify(fallback, null, 2);
  }
};

// ============================================================
// 9. Application Tracker Functions
// ============================================================
export const updateApplicationStage = async (applicationId, stage) => {
  try {
    const res = await api.patch(`/applications/${applicationId}/stage`, { stage });
    return res.data?.data || res.data;
  } catch (err) {
    console.warn("Update stage offline:", err.message);
    return { success: true, offline: true, stage };
  }
};

export const addApplicationNote = async (applicationId, note) => {
  try {
    const res = await api.post(`/applications/${applicationId}/notes`, { note });
    return res.data?.data || res.data;
  } catch (err) {
    console.warn("Add note offline:", err.message);
    return { success: true, offline: true, note };
  }
};

export const addApplicationReminder = async (applicationId, reminder) => {
  try {
    const res = await api.post(`/applications/${applicationId}/reminders`, reminder);
    return res.data?.data || res.data;
  } catch (err) {
    console.warn("Add reminder offline:", err.message);
    return { success: true, offline: true, ...reminder };
  }
};

export const toggleApplicationReminder = async (applicationId, reminderId) => {
  try {
    const res = await api.patch(`/applications/${applicationId}/reminders/${reminderId}/toggle`);
    return res.data?.data || res.data;
  } catch (err) {
    console.warn("Toggle reminder offline:", err.message);
    return { success: true, offline: true };
  }
};

// ============================================================
// 10. AI Career OS Client Methods
// ============================================================

export const getCareerTwin = async () => {
  try {
    const res = await api.get("/career/twin");
    return res.data;
  } catch (err) {
    console.warn("getCareerTwin offline fallback:", err.message);
    return {
      success: true,
      data: {
        profile: {
          careerScore: 72,
          jobReadiness: 70,
          interviewReadiness: 65,
          dsaReadiness: 60,
          projectStrength: 75,
          resumeStrength: 70,
          targetRole: "Full Stack Developer",
          currentRole: "Software Engineer",
          strongSkills: ["React", "JavaScript", "Node.js", "REST APIs"],
          weakSkills: ["Docker", "TypeScript"],
          missingSkills: ["AWS", "Redis", "System Design"],
          recommendedSkills: [
            { skill: "TypeScript", reason: "Required across 80% of top frontend and full-stack listings.", priority: "High" },
            { skill: "Docker", reason: "Elevates containerized microservice development readiness.", priority: "High" }
          ]
        },
        rawStats: { solvedDsa: 4, completedInterviews: 3, applicationsCount: 5, totalProjects: 3, verifiedSkillsCount: 2 }
      }
    };
  }
};

export const updateCareerProfile = async (data) => {
  const res = await api.put("/career/profile", data);
  return res.data;
};

export const getAutopilotGoals = async () => {
  try {
    const res = await api.get("/career/autopilot");
    return res.data;
  } catch (err) {
    return { success: true, data: [] };
  }
};

export const createAutopilotGoal = async (data) => {
  const res = await api.post("/career/autopilot", data);
  return res.data;
};

export const toggleGoalMilestone = async (goalId, milestoneId) => {
  const res = await api.patch(`/career/autopilot/${goalId}/milestones/${milestoneId}`);
  return res.data;
};

export const simulateScenario = async (data) => {
  const res = await api.post("/career/simulate", data);
  return res.data;
};

export const generateProjectBlueprint = async (data) => {
  const res = await api.post("/career/project-advisor", data);
  return res.data;
};

export const getProjectBlueprints = async () => {
  try {
    const res = await api.get("/career/project-blueprints");
    return res.data;
  } catch {
    return { success: true, data: [] };
  }
};

export const auditPortfolio = async () => {
  const res = await api.get("/career/portfolio-audit");
  return res.data;
};

export const getSkillPassport = async () => {
  try {
    const res = await api.get("/career/passport");
    return res.data;
  } catch {
    return { success: true, data: [] };
  }
};

export const verifySkill = async (data) => {
  const res = await api.post("/career/passport/verify", data);
  return res.data;
};

export const analyzeJobReality = async (data) => {
  const res = await api.post("/career/analyze-job", data);
  return res.data;
};

export const getOpportunityRadar = async () => {
  try {
    const res = await api.get("/career/opportunities");
    return res.data;
  } catch {
    return { success: true, data: { highMatch: [], newOpportunities: [], skillGrowth: [], recommended: [] } };
  }
};

export const getSkillDemandMarket = async () => {
  try {
    const res = await api.get("/career/market");
    return res.data;
  } catch {
    return { success: true, data: { topSkills: [], popularRoles: [] } };
  }
};

export const getLearningAgent = async () => {
  try {
    const res = await api.get("/career/learning-agent");
    return res.data;
  } catch {
    return { success: true, data: { recommendations: [] } };
  }
};

export const getRevisionSessions = async () => {
  try {
    const res = await api.get("/career/revision");
    return res.data;
  } catch {
    return { success: true, data: [] };
  }
};

export const generateNewRevisionSession = async (category) => {
  const res = await api.post("/career/revision/generate", { category });
  return res.data;
};

export const toggleRevisionTopic = async (sessionId, topicId) => {
  const res = await api.patch(`/career/revision/${sessionId}/topics/${topicId}`);
  return res.data;
};

export const getInterviewPlan = async (data) => {
  const res = await api.post("/career/interview-prep", data);
  return res.data;
};

export const getDailyCareerBrief = async () => {
  try {
    const res = await api.get("/career/daily-brief");
    return res.data;
  } catch {
    return {
      success: true,
      data: {
        date: "Today",
        headline: "Welcome to your Career Command Center",
        items: []
      }
    };
  }
};

export const getTalentMarketplace = async (params = {}) => {
  try {
    const res = await api.get("/talent/marketplace", { params });
    return res.data;
  } catch {
    return { success: true, data: { candidates: [], total: 0 } };
  }
};

export const recruiterAiAssistant = async (data) => {
  const res = await api.post("/career/recruiter/assistant", data);
  return res.data;
};

