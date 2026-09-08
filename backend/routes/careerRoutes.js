const express = require("express");
const {
  getRecommendedJobs,
  getJobMatchScore,
  getCareerRoadmap,
  toggleRoadmapSkill,
  getSkillGap,
  getDashboardAnalytics,
  getBookmarks,
  toggleBookmark,
  getInterviewAnalytics,
  getJobAlerts,
  createJobAlert,
  toggleJobAlert,
  deleteJobAlert,
  getSavedSearches,
  createSavedSearch,
  deleteSavedSearch,
  toggleFollowCompany,
  getFollowedCompanies,
  compareJobs,
  updateApplicationStage,
  addApplicationNote,
  addApplicationReminder,
  toggleApplicationReminder,
  exportUserData
} = require("../controllers/careerController");
const { protect, optionalAuth } = require("../middleware/authMiddleware");

const router = express.Router();

// 1. Recommendations & Match Scores
router.get("/recommendations", optionalAuth, getRecommendedJobs);
router.get("/match-score/:jobId", optionalAuth, getJobMatchScore);

// 2. Career Roadmap (GET & POST supported)
router.get("/roadmap", optionalAuth, getCareerRoadmap);
router.post("/roadmap", optionalAuth, getCareerRoadmap);
router.put("/roadmap/toggle-skill", optionalAuth, toggleRoadmapSkill);

// 3. Skill Gap Analyzer (GET & POST supported)
router.get("/skill-gap", optionalAuth, getSkillGap);
router.post("/skill-gap", optionalAuth, getSkillGap);

// 4. Unified Dashboard Analytics
router.get("/dashboard-analytics", optionalAuth, getDashboardAnalytics);

// 5. Bookmarks & Interview Analytics
router.get("/interview/bookmarks", optionalAuth, getBookmarks);
router.post("/interview/bookmarks", optionalAuth, toggleBookmark);
router.get("/interview/analytics", optionalAuth, getInterviewAnalytics);

// 6. Job Alerts (both /alerts and /job-alerts aliases)
router.get("/alerts", protect, getJobAlerts);
router.post("/alerts", protect, createJobAlert);
router.patch("/alerts/:id/toggle", protect, toggleJobAlert);
router.delete("/alerts/:id", protect, deleteJobAlert);

router.get("/job-alerts", protect, getJobAlerts);
router.post("/job-alerts", protect, createJobAlert);
router.delete("/job-alerts/:id", protect, deleteJobAlert);

// 7. Saved Searches
router.get("/saved-searches", protect, getSavedSearches);
router.post("/saved-searches", protect, createSavedSearch);
router.delete("/saved-searches/:id", protect, deleteSavedSearch);

// 8. Company Follows
router.post("/companies/:companyId/follow", protect, toggleFollowCompany);
router.get("/companies/followed", protect, getFollowedCompanies);

// 9. Job Comparison (both /jobs/compare and /job-compare aliases)
router.post("/jobs/compare", protect, compareJobs);
router.post("/job-compare", protect, compareJobs);

// 10. Application Tracker Actions
router.patch("/applications/:id/stage", protect, updateApplicationStage);
router.post("/applications/:id/notes", protect, addApplicationNote);
router.post("/applications/:id/reminders", protect, addApplicationReminder);
router.patch("/applications/:id/reminders/:reminderId", protect, toggleApplicationReminder);

// 11. Export Data
router.get("/export", protect, exportUserData);

// ==========================================
// 12. AI CAREER OS & NEXT-GEN PLATFORM
// ==========================================
const {
  getCareerTwin,
  updateCareerProfile,
  getAutopilotGoals,
  createAutopilotGoal,
  toggleGoalMilestone,
  simulateScenario,
  generateProjectBlueprint,
  getProjectBlueprints,
  auditPortfolio,
  getSkillPassport,
  verifySkill,
  analyzeJobReality,
  getOpportunityRadar,
  getSkillDemandMarket,
  getLearningAgent,
  getRevisionSessions,
  generateNewRevisionSession,
  toggleRevisionTopic,
  getInterviewPlan,
  getDailyCareerBrief,
  getTalentMarketplace,
  recruiterAiAssistant,
} = require("../controllers/careerOsController");

// Digital Twin & Career Command Center
router.get("/twin", protect, getCareerTwin);
router.get("/profile", protect, getCareerTwin);
router.put("/profile", protect, updateCareerProfile);

// AI Career Autopilot & Goals
router.get("/autopilot", protect, getAutopilotGoals);
router.post("/autopilot", protect, createAutopilotGoal);
router.get("/goals", protect, getAutopilotGoals);
router.post("/goals", protect, createAutopilotGoal);
router.patch("/autopilot/:goalId/milestones/:milestoneId", protect, toggleGoalMilestone);
router.patch("/goals/:goalId/milestones/:milestoneId", protect, toggleGoalMilestone);

// Career Scenario Simulator
router.post("/simulate", protect, simulateScenario);

// AI Project Advisor & Blueprints
router.post("/project-advisor", protect, generateProjectBlueprint);
router.get("/project-blueprints", protect, getProjectBlueprints);

// AI Portfolio Auditor
router.get("/portfolio-audit", protect, auditPortfolio);
router.post("/portfolio-audit", protect, auditPortfolio);

// Skill Proof System & Passport
router.get("/passport", protect, getSkillPassport);
router.post("/passport/verify", protect, verifySkill);

// AI Job Reality Analyzer ("Should I Apply?")
router.post("/analyze-job", protect, analyzeJobReality);

// Opportunity Radar
router.get("/opportunities", protect, getOpportunityRadar);

// Skill Demand Intelligence (Platform Aggregated Market Data)
router.get("/market", getSkillDemandMarket);

// AI Learning Agent & Revision Sessions
router.get("/learning-agent", protect, getLearningAgent);
router.get("/revision", protect, getRevisionSessions);
router.post("/revision/generate", protect, generateNewRevisionSession);
router.patch("/revision/:sessionId/topics/:topicId", protect, toggleRevisionTopic);

// AI Interview Preparation
router.post("/interview-prep", protect, getInterviewPlan);

// AI Daily Career Brief
router.get("/daily-brief", protect, getDailyCareerBrief);

// Talent Marketplace & Recruiter Assistant
router.get("/talent/marketplace", protect, getTalentMarketplace);
router.get("/marketplace", protect, getTalentMarketplace);
router.get("/talent", protect, getTalentMarketplace);
router.post("/recruiter/assistant", protect, recruiterAiAssistant);

module.exports = router;

