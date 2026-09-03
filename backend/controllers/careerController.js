const mongoose = require("mongoose");
const Job = require("../models/Job");
const User = require("../models/User");
const Company = require("../models/Company");
const Application = require("../models/Application");
const CareerRoadmap = require("../models/CareerRoadmap");
const InterviewSession = require("../models/InterviewSession");
const InterviewBookmark = require("../models/InterviewBookmark");
const InterviewQuestion = require("../models/InterviewQuestion");
const ResumeAnalysis = require("../models/ResumeAnalysis");
const JobAlert = require("../models/JobAlert");
const SavedSearch = require("../models/SavedSearch");
const {
  ROADMAP_TEMPLATES,
  calculateProfileCompletion,
  calculateJobMatch
} = require("../services/careerService");

// ==========================================
// 1. PERSONALIZED JOB RECOMMENDATIONS
// ==========================================
const getRecommendedJobs = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select(
      "skills categorizedSkills headline location experience savedJobs"
    );

    const jobs = await Job.find({ status: "active" })
      .populate("company", "name logo location isVerified")
      .limit(30)
      .lean();

    const recommended = jobs
      .map((job) => {
        const match = calculateJobMatch(user, job);
        return {
          ...job,
          matchScore: match.score,
          matchedSkills: match.matchedSkills,
          missingSkills: match.missingSkills,
          recommendationReason: match.explanation
        };
      })
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 12);

    res.status(200).json({
      success: true,
      data: {
        recommendedJobs: recommended,
        count: recommended.length
      }
    });
  } catch (error) {
    console.error("Get Recommended Jobs Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while generating job recommendations"
    });
  }
};

// ==========================================
// 2. SPECIFIC JOB MATCH SCORE
// ==========================================
const getJobMatchScore = async (req, res) => {
  try {
    const { jobId } = req.params;
    const job = await Job.findById(jobId).populate("company", "name logo location");

    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    const user = await User.findById(req.user._id).select(
      "skills categorizedSkills headline experience education"
    );

    const match = calculateJobMatch(user, job);

    res.status(200).json({
      success: true,
      data: {
        jobId: job._id,
        jobTitle: job.title,
        company: job.company?.name || "Company",
        matchScore: match.score,
        matchedSkills: match.matchedSkills,
        missingSkills: match.missingSkills,
        breakdown: match.breakdown,
        explanation: match.explanation
      }
    });
  } catch (error) {
    console.error("Get Job Match Score Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while calculating job match score"
    });
  }
};

// ==========================================
// 3. CAREER ROADMAP & PROGRESS
// ==========================================
const getCareerRoadmap = async (req, res) => {
  try {
    const { role = "MERN Stack Developer" } = req.query;

    let roadmap = await CareerRoadmap.findOne({
      user: req.user._id,
      targetRole: role
    });

    if (!roadmap) {
      const template = ROADMAP_TEMPLATES[role] || ROADMAP_TEMPLATES["MERN Stack Developer"];
      roadmap = new CareerRoadmap({
        user: req.user._id,
        targetRole: role,
        phases: template
      });
      roadmap.recalculateProgress();
      await roadmap.save();
    }

    res.status(200).json({
      success: true,
      data: {
        roadmap,
        availableRoles: Object.keys(ROADMAP_TEMPLATES)
      }
    });
  } catch (error) {
    console.error("Get Career Roadmap Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while retrieving career roadmap"
    });
  }
};

const toggleRoadmapSkill = async (req, res) => {
  try {
    const { roadmapId, phaseId, skillId } = req.body;

    const roadmap = await CareerRoadmap.findOne({
      _id: roadmapId,
      user: req.user._id
    });

    if (!roadmap) {
      return res.status(404).json({ success: false, message: "Roadmap not found" });
    }

    const phase = roadmap.phases.id(phaseId);
    if (!phase) {
      return res.status(404).json({ success: false, message: "Phase not found" });
    }

    const skill = phase.skills.id(skillId);
    if (!skill) {
      return res.status(404).json({ success: false, message: "Skill not found" });
    }

    skill.completed = !skill.completed;
    skill.completedAt = skill.completed ? new Date() : null;

    roadmap.recalculateProgress();
    await roadmap.save();

    res.status(200).json({
      success: true,
      message: skill.completed ? "Skill marked as completed!" : "Skill marked as in-progress",
      data: {
        roadmap,
        completionPercentage: roadmap.completionPercentage
      }
    });
  } catch (error) {
    console.error("Toggle Roadmap Skill Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating roadmap skill"
    });
  }
};

// ==========================================
// 4. SKILL GAP ANALYZER
// ==========================================
const getSkillGap = async (req, res) => {
  try {
    const { role = "MERN Stack Developer", jobId } = req.query;

    const user = await User.findById(req.user._id).select("skills categorizedSkills");
    const userSkillsSet = new Set((user?.skills || []).map((s) => s.trim().toLowerCase()));

    let targetSkills = [];

    if (jobId) {
      const job = await Job.findById(jobId).select("skills title");
      if (job && Array.isArray(job.skills)) {
        targetSkills = job.skills.map((s) => ({ name: s, priority: "high" }));
      }
    }

    if (targetSkills.length === 0) {
      const template = ROADMAP_TEMPLATES[role] || ROADMAP_TEMPLATES["MERN Stack Developer"];
      template.forEach((phase) => {
        phase.skills.forEach((s) => {
          targetSkills.push({ name: s.name, priority: s.priority || "high" });
        });
      });
    }

    const skillsYouHave = [];
    const highPriority = [];
    const mediumPriority = [];
    const optional = [];

    targetSkills.forEach((item) => {
      const norm = item.name.toLowerCase();
      const hasSkill =
        userSkillsSet.has(norm) ||
        Array.from(userSkillsSet).some((us) => us.includes(norm) || norm.includes(us));

      if (hasSkill) {
        skillsYouHave.push(item.name);
      } else {
        if (item.priority === "high") highPriority.push(item.name);
        else if (item.priority === "medium") mediumPriority.push(item.name);
        else optional.push(item.name);
      }
    });

    res.status(200).json({
      success: true,
      data: {
        targetRole: role,
        skillsYouHave,
        skillsToLearn: {
          highPriority,
          mediumPriority,
          optional
        },
        readinessScore: Math.round(
          (skillsYouHave.length / Math.max(1, targetSkills.length)) * 100
        )
      }
    });
  } catch (error) {
    console.error("Get Skill Gap Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while analyzing skill gaps"
    });
  }
};

// ==========================================
// 5. UNIFIED DASHBOARD ANALYTICS
// ==========================================
const getDashboardAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;

    const [
      user,
      applications,
      savedJobsCount,
      interviewSessions,
      latestResume,
      activeRoadmaps,
      alerts
    ] = await Promise.all([
      User.findById(userId).select("name username headline bio skills education experience resume"),
      Application.find({ applicant: userId }).populate("job", "title company location").sort({ createdAt: -1 }),
      Job.countDocuments({ _id: { $in: req.user.savedJobs || [] } }),
      InterviewSession.find({ user: userId }).sort({ createdAt: -1 }),
      ResumeAnalysis.findOne({ user: userId }).sort({ createdAt: -1 }),
      CareerRoadmap.find({ user: userId }),
      JobAlert.find({ user: userId, isActive: true })
    ]);

    // Profile strength
    const profileStrength = calculateProfileCompletion(user);

    // Application stats
    const appStats = {
      total: applications.length,
      applied: applications.filter((a) => (a.stage || a.status) === "Applied").length,
      underReview: applications.filter((a) => ["Reviewing", "Under Review", "Shortlisted"].includes(a.stage || a.status)).length,
      interviews: applications.filter((a) => ["Interview", "Technical Round"].includes(a.stage || a.status)).length,
      offers: applications.filter((a) => ["Hired", "Offer"].includes(a.stage || a.status)).length,
      rejected: applications.filter((a) => (a.stage || a.status) === "Rejected").length
    };

    // Interview practice stats
    const completedSessions = interviewSessions.filter((s) => s.status === "completed");
    const totalQuestionsAttempted = interviewSessions.reduce(
      (acc, s) => acc + (s.answers?.length || 0),
      0
    );

    // Reminders
    const upcomingReminders = [];
    applications.forEach((app) => {
      if (Array.isArray(app.reminders)) {
        app.reminders.forEach((r) => {
          if (!r.isCompleted) {
            upcomingReminders.push({
              applicationId: app._id,
              jobTitle: app.job?.title || "Job Application",
              title: r.title,
              dueDate: r.dueDate
            });
          }
        });
      }
    });

    // Recent Activity Feed
    const activityTimeline = [];
    applications.slice(0, 5).forEach((app) => {
      activityTimeline.push({
        type: "application",
        title: `Applied to ${app.job?.title || "Position"}`,
        date: app.createdAt
      });
    });

    completedSessions.slice(0, 5).forEach((sess) => {
      activityTimeline.push({
        type: "interview",
        title: `Completed ${sess.role} practice (${sess.difficulty})`,
        date: sess.completedAt || sess.createdAt
      });
    });

    if (latestResume) {
      activityTimeline.push({
        type: "resume",
        title: `Scanned resume against ${latestResume.jobTitle} (Score: ${latestResume.atsScore}/100)`,
        date: latestResume.createdAt
      });
    }

    activityTimeline.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Roadmap overview
    const mainRoadmap = activeRoadmaps[0] || null;

    res.status(200).json({
      success: true,
      data: {
        profileStrength,
        applicationStats: appStats,
        savedJobsCount,
        interviewStats: {
          totalSessions: interviewSessions.length,
          completedSessions: completedSessions.length,
          questionsAttempted: totalQuestionsAttempted
        },
        latestAtsScore: latestResume ? latestResume.atsScore : null,
        roadmapProgress: mainRoadmap
          ? {
              targetRole: mainRoadmap.targetRole,
              percentage: mainRoadmap.completionPercentage,
              totalSkills: mainRoadmap.totalSkills,
              completedSkillsCount: mainRoadmap.completedSkillsCount
            }
          : null,
        upcomingReminders: upcomingReminders.slice(0, 5),
        activityTimeline: activityTimeline.slice(0, 8),
        activeAlertsCount: alerts.length
      }
    });
  } catch (error) {
    console.error("Get Dashboard Analytics Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while aggregating dashboard analytics"
    });
  }
};

// ==========================================
// 6. INTERVIEW QUESTION BOOKMARKS
// ==========================================
const getBookmarks = async (req, res) => {
  try {
    const bookmarks = await InterviewBookmark.find({ user: req.user._id })
      .populate("question")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        bookmarks,
        count: bookmarks.length
      }
    });
  } catch (error) {
    console.error("Get Bookmarks Error:", error);
    res.status(500).json({ success: false, message: "Server error while fetching bookmarks" });
  }
};

const toggleBookmark = async (req, res) => {
  try {
    const { questionId, notes = "", tags = [] } = req.body;

    const existing = await InterviewBookmark.findOne({
      user: req.user._id,
      question: questionId
    });

    if (existing) {
      await existing.deleteOne();
      return res.status(200).json({
        success: true,
        bookmarked: false,
        message: "Bookmark removed"
      });
    }

    const bookmark = await InterviewBookmark.create({
      user: req.user._id,
      question: questionId,
      notes,
      tags
    });

    res.status(201).json({
      success: true,
      bookmarked: true,
      message: "Question bookmarked successfully",
      data: bookmark
    });
  } catch (error) {
    console.error("Toggle Bookmark Error:", error);
    res.status(500).json({ success: false, message: "Server error while toggling bookmark" });
  }
};

// ==========================================
// 7. INTERVIEW PERFORMANCE ANALYTICS
// ==========================================
const getInterviewAnalytics = async (req, res) => {
  try {
    const sessions = await InterviewSession.find({
      user: req.user._id,
      status: "completed"
    }).populate("questions");

    let totalQuestions = 0;
    let totalAnswered = 0;
    let totalSkipped = 0;
    let totalDuration = 0;

    const categoryPerformance = {};

    sessions.forEach((s) => {
      totalDuration += s.duration || 0;
      (s.answers || []).forEach((ans) => {
        totalQuestions += 1;
        if (ans.skipped) {
          totalSkipped += 1;
        } else {
          totalAnswered += 1;
        }
      });

      const cat = s.role || "General";
      if (!categoryPerformance[cat]) {
        categoryPerformance[cat] = { sessions: 0, questions: 0, answered: 0 };
      }
      categoryPerformance[cat].sessions += 1;
      categoryPerformance[cat].questions += s.answers?.length || 0;
      categoryPerformance[cat].answered += (s.answers || []).filter((a) => !a.skipped).length;
    });

    const completionRate =
      totalQuestions > 0 ? Math.round((totalAnswered / totalQuestions) * 100) : 0;

    const strongAreas = Object.keys(categoryPerformance).filter(
      (cat) =>
        categoryPerformance[cat].questions > 0 &&
        categoryPerformance[cat].answered / categoryPerformance[cat].questions >= 0.75
    );

    const areasToImprove = Object.keys(categoryPerformance).filter(
      (cat) =>
        categoryPerformance[cat].questions > 0 &&
        categoryPerformance[cat].answered / categoryPerformance[cat].questions < 0.75
    );

    res.status(200).json({
      success: true,
      data: {
        totalSessions: sessions.length,
        totalQuestions,
        totalAnswered,
        totalSkipped,
        completionRate,
        averageDurationSec: sessions.length > 0 ? Math.round(totalDuration / sessions.length) : 0,
        categoryPerformance,
        strongAreas,
        areasToImprove
      }
    });
  } catch (error) {
    console.error("Get Interview Analytics Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while calculating interview analytics"
    });
  }
};

// ==========================================
// 8. JOB ALERTS
// ==========================================
const getJobAlerts = async (req, res) => {
  try {
    const alerts = await JobAlert.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: { alerts, count: alerts.length } });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching job alerts" });
  }
};

const createJobAlert = async (req, res) => {
  try {
    const { title, role, location, keywords, jobType, frequency } = req.body;
    const alert = await JobAlert.create({
      user: req.user._id,
      title: title || role || "Job Alert",
      role,
      location,
      keywords: Array.isArray(keywords) ? keywords : (keywords || "").split(",").map((k) => k.trim()),
      jobType: jobType || "Any",
      frequency: frequency || "daily"
    });

    res.status(201).json({ success: true, message: "Job alert created", data: alert });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error creating job alert" });
  }
};

const toggleJobAlert = async (req, res) => {
  try {
    const alert = await JobAlert.findOne({ _id: req.params.id, user: req.user._id });
    if (!alert) return res.status(404).json({ success: false, message: "Alert not found" });

    alert.isActive = !alert.isActive;
    await alert.save();

    res.status(200).json({ success: true, message: `Alert ${alert.isActive ? "activated" : "paused"}`, data: alert });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating job alert" });
  }
};

const deleteJobAlert = async (req, res) => {
  try {
    await JobAlert.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.status(200).json({ success: true, message: "Job alert deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error deleting job alert" });
  }
};

// ==========================================
// 9. SAVED SEARCHES
// ==========================================
const getSavedSearches = async (req, res) => {
  try {
    const searches = await SavedSearch.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: { searches, count: searches.length } });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching saved searches" });
  }
};

const createSavedSearch = async (req, res) => {
  try {
    const { title, query, filters } = req.body;
    const saved = await SavedSearch.create({
      user: req.user._id,
      title: title || query || "Saved Search",
      query: query || "",
      filters: filters || {}
    });

    res.status(201).json({ success: true, message: "Search saved", data: saved });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error saving search" });
  }
};

const deleteSavedSearch = async (req, res) => {
  try {
    await SavedSearch.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.status(200).json({ success: true, message: "Saved search deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error deleting saved search" });
  }
};

// ==========================================
// 10. COMPANY FOLLOW SYSTEM
// ==========================================
const toggleFollowCompany = async (req, res) => {
  try {
    const { companyId } = req.params;
    const user = await User.findById(req.user._id);

    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const company = await Company.findById(companyId);
    if (!company) return res.status(404).json({ success: false, message: "Company not found" });

    user.followedCompanies = user.followedCompanies || [];
    const idx = user.followedCompanies.findIndex((id) => id.toString() === companyId.toString());

    let isFollowing = false;
    if (idx === -1) {
      user.followedCompanies.push(company._id);
      isFollowing = true;
    } else {
      user.followedCompanies.splice(idx, 1);
      isFollowing = false;
    }

    await user.save();

    res.status(200).json({
      success: true,
      isFollowing,
      message: isFollowing ? `Now following ${company.name}` : `Unfollowed ${company.name}`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error following company" });
  }
};

const getFollowedCompanies = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: "followedCompanies",
      select: "name logo location industry description activeJobsCount isVerified"
    });

    res.status(200).json({
      success: true,
      data: {
        companies: user?.followedCompanies || [],
        count: user?.followedCompanies?.length || 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching followed companies" });
  }
};

// ==========================================
// 11. JOB COMPARISON (UP TO 4 JOBS)
// ==========================================
const compareJobs = async (req, res) => {
  try {
    const { jobIds } = req.body;
    if (!Array.isArray(jobIds) || jobIds.length === 0) {
      return res.status(400).json({ success: false, message: "Please provide job IDs to compare" });
    }

    const jobs = await Job.find({ _id: { $in: jobIds.slice(0, 4) } }).populate("company", "name logo location isVerified");
    const user = await User.findById(req.user._id).select("skills categorizedSkills headline experience");

    const comparison = jobs.map((job) => {
      const match = calculateJobMatch(user, job);
      return {
        _id: job._id,
        title: job.title,
        company: job.company?.name || "Company",
        companyLogo: job.company?.logo,
        location: job.location,
        jobType: job.jobType,
        salary: job.salary,
        experienceLevel: job.experienceLevel,
        skills: job.skills,
        matchScore: match.score,
        matchedSkills: match.matchedSkills,
        missingSkills: match.missingSkills
      };
    });

    res.status(200).json({ success: true, data: { comparison } });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error comparing jobs" });
  }
};

// ==========================================
// 12. APPLICATION TRACKER ACTIONS
// ==========================================
const updateApplicationStage = async (req, res) => {
  try {
    const { stage } = req.body;
    const app = await Application.findOne({
      _id: req.params.id,
      applicant: req.user._id
    });

    if (!app) return res.status(404).json({ success: false, message: "Application not found" });

    app.stage = stage;
    app.timeline = app.timeline || [];
    app.timeline.push({
      status: stage,
      note: `Moved to ${stage} on Kanban board`,
      date: new Date()
    });

    await app.save();

    res.status(200).json({ success: true, message: `Application moved to ${stage}`, data: app });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating application stage" });
  }
};

const addApplicationNote = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || text.trim().length === 0) {
      return res.status(400).json({ success: false, message: "Note text is required" });
    }

    const app = await Application.findOne({
      _id: req.params.id,
      applicant: req.user._id
    });

    if (!app) return res.status(404).json({ success: false, message: "Application not found" });

    app.candidateNotes = app.candidateNotes || [];
    app.candidateNotes.push({ text: text.trim(), createdAt: new Date() });
    await app.save();

    res.status(201).json({ success: true, message: "Note added", data: app.candidateNotes });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error adding note" });
  }
};

const addApplicationReminder = async (req, res) => {
  try {
    const { title, dueDate } = req.body;
    if (!title || !dueDate) {
      return res.status(400).json({ success: false, message: "Title and dueDate are required" });
    }

    const app = await Application.findOne({
      _id: req.params.id,
      applicant: req.user._id
    });

    if (!app) return res.status(404).json({ success: false, message: "Application not found" });

    app.reminders = app.reminders || [];
    app.reminders.push({ title: title.trim(), dueDate: new Date(dueDate), isCompleted: false });
    await app.save();

    res.status(201).json({ success: true, message: "Reminder set", data: app.reminders });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error adding reminder" });
  }
};

const toggleApplicationReminder = async (req, res) => {
  try {
    const { reminderId } = req.params;
    const app = await Application.findOne({
      _id: req.params.id,
      applicant: req.user._id
    });

    if (!app) return res.status(404).json({ success: false, message: "Application not found" });

    const reminder = (app.reminders || []).id(reminderId);
    if (!reminder) return res.status(404).json({ success: false, message: "Reminder not found" });

    reminder.isCompleted = !reminder.isCompleted;
    await app.save();

    res.status(200).json({ success: true, message: "Reminder updated", data: app.reminders });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating reminder" });
  }
};

// ==========================================
// 13. USER CAREER DATA EXPORT
// ==========================================
const exportUserData = async (req, res) => {
  try {
    const userId = req.user._id;

    const [user, applications, interviewSessions, resumeAnalyses, roadmaps] =
      await Promise.all([
        User.findById(userId).select("-password"),
        Application.find({ applicant: userId }).populate("job", "title company"),
        InterviewSession.find({ user: userId }),
        ResumeAnalysis.find({ user: userId }),
        CareerRoadmap.find({ user: userId })
      ]);

    const exportBundle = {
      user: {
        name: user?.name,
        email: user?.email,
        headline: user?.headline,
        skills: user?.skills,
        experience: user?.experience,
        education: user?.education
      },
      applications: applications.map((a) => ({
        jobTitle: a.job?.title,
        status: a.status,
        stage: a.stage,
        appliedAt: a.createdAt,
        notes: a.candidateNotes
      })),
      interviewPractice: interviewSessions.map((i) => ({
        role: i.role,
        difficulty: i.difficulty,
        totalQuestions: i.totalQuestions,
        status: i.status,
        duration: i.duration,
        completedAt: i.completedAt
      })),
      resumeAnalyses: resumeAnalyses.map((r) => ({
        jobTitle: r.jobTitle,
        atsScore: r.atsScore,
        createdAt: r.createdAt
      })),
      careerRoadmaps: roadmaps.map((rm) => ({
        targetRole: rm.targetRole,
        completionPercentage: rm.completionPercentage,
        completedSkillsCount: rm.completedSkillsCount
      })),
      exportedAt: new Date()
    };

    res.setHeader("Content-Disposition", 'attachment; filename="jobsphere-career-data.json"');
    res.setHeader("Content-Type", "application/json");
    res.status(200).send(JSON.stringify(exportBundle, null, 2));
  } catch (error) {
    res.status(500).json({ success: false, message: "Error exporting career data" });
  }
};

module.exports = {
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
};
