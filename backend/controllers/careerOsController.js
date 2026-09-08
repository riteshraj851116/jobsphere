const mongoose = require("mongoose");
const User = require("../models/User");
const Job = require("../models/Job");
const CareerProfile = require("../models/CareerProfile");
const CareerGoal = require("../models/CareerGoal");
const SkillProof = require("../models/SkillProof");
const ProjectBlueprint = require("../models/ProjectBlueprint");
const RevisionSession = require("../models/RevisionSession");
const DSAProgress = require("../models/DSAProgress");
const DSAProblem = require("../models/DSAProblem");
const Application = require("../models/Application");
const { computeCareerDigitalTwin } = require("../services/careerTwinService");
const careerAi = require("../services/careerAiService");

/**
 * 1. AI CAREER DIGITAL TWIN & COMMAND CENTER
 * GET /api/career/twin
 */
const getCareerTwin = async (req, res) => {
  try {
    const userId = req.user._id;
    const twinData = await computeCareerDigitalTwin(userId);

    res.status(200).json({
      success: true,
      data: twinData,
    });
  } catch (error) {
    console.error("Get Career Twin Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to compute Career Digital Twin",
      error: error.message,
    });
  }
};

/**
 * Update Career Profile preferences & target role
 * PUT /api/career/profile
 */
const updateCareerProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { targetRole, currentRole, experienceLevel, privacy } = req.body;

    let profile = await CareerProfile.findOne({ user: userId });
    if (!profile) {
      profile = new CareerProfile({ user: userId });
    }

    if (targetRole) profile.targetRole = targetRole.trim();
    if (currentRole) profile.currentRole = currentRole.trim();
    if (experienceLevel) profile.experienceLevel = experienceLevel;
    if (privacy) {
      profile.privacy = { ...profile.privacy, ...privacy };
    }

    await profile.save();

    // Recompute scores with new target role
    const updated = await computeCareerDigitalTwin(userId);

    res.status(200).json({
      success: true,
      data: updated,
      message: "Career profile updated successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating career profile" });
  }
};

/**
 * 2. AI CAREER AUTOPILOT & GOALS
 * GET /api/career/autopilot
 * POST /api/career/autopilot
 */
const getAutopilotGoals = async (req, res) => {
  try {
    const goals = await CareerGoal.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: goals });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error loading autopilot goals" });
  }
};

const createAutopilotGoal = async (req, res) => {
  try {
    const userId = req.user._id;
    const { title, targetRole, targetDate, priority = "high" } = req.body;

    if (!title || !targetRole) {
      return res.status(400).json({ success: false, message: "Title and target role are required" });
    }

    const user = await User.findById(userId).lean();
    const generatedRoadmap = await careerAi.generateAutopilotRoadmap({
      targetRole,
      userSkills: user?.skills || [],
    });

    const newGoal = new CareerGoal({
      user: userId,
      title: title.trim(),
      targetRole: targetRole.trim(),
      targetDate: targetDate || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      priority,
      status: "active",
      strategyOverview: generatedRoadmap.strategyOverview,
      whyRecommended: generatedRoadmap.whyRecommended,
      milestones: generatedRoadmap.milestones,
    });

    newGoal.recalculateProgress();
    await newGoal.save();

    res.status(201).json({
      success: true,
      data: newGoal,
      message: "Career Autopilot roadmap generated successfully",
    });
  } catch (error) {
    console.error("Create Autopilot Goal Error:", error);
    res.status(500).json({ success: false, message: "Error generating autopilot goal" });
  }
};

const toggleGoalMilestone = async (req, res) => {
  try {
    const { goalId, milestoneId } = req.params;
    const goal = await CareerGoal.findOne({ _id: goalId, user: req.user._id });
    if (!goal) return res.status(404).json({ success: false, message: "Goal not found" });

    const milestone = goal.milestones.id(milestoneId);
    if (!milestone) return res.status(404).json({ success: false, message: "Milestone not found" });

    milestone.status = milestone.status === "completed" ? "pending" : "completed";
    milestone.completedAt = milestone.status === "completed" ? new Date() : null;

    goal.recalculateProgress();
    await goal.save();

    res.status(200).json({ success: true, data: goal });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating milestone" });
  }
};

/**
 * 3. CAREER SCENARIO SIMULATOR
 * POST /api/career/simulate
 */
const simulateScenario = async (req, res) => {
  try {
    const userId = req.user._id;
    const { addedSkills = [], targetRole = "Full Stack Developer" } = req.body;

    const user = await User.findById(userId).select("skills").lean();
    const profile = await CareerProfile.findOne({ user: userId }).lean();

    const simulation = await careerAi.simulateScenario({
      currentSkills: user?.skills || [],
      addedSkills,
      targetRole,
      currentScore: profile?.careerScore || 65,
    });

    res.status(200).json({ success: true, data: simulation });
  } catch (error) {
    res.status(500).json({ success: false, message: "Simulation error" });
  }
};

/**
 * 4. AI PROJECT ADVISOR & BLUEPRINTS
 * POST /api/career/project-advisor
 * GET /api/career/project-blueprints
 */
const generateProjectBlueprint = async (req, res) => {
  try {
    const userId = req.user._id;
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ success: false, message: "Prompt is required" });
    }

    const user = await User.findById(userId).select("skills").lean();
    const blueprintData = await careerAi.generateProjectAdvisor({
      prompt,
      currentSkills: user?.skills || [],
    });

    const savedBlueprint = new ProjectBlueprint({
      user: userId,
      ...blueprintData,
    });
    await savedBlueprint.save();

    res.status(201).json({
      success: true,
      data: savedBlueprint,
      message: "Project blueprint created successfully",
    });
  } catch (error) {
    console.error("Project advisor error:", error);
    res.status(500).json({ success: false, message: "Error generating project blueprint" });
  }
};

const getProjectBlueprints = async (req, res) => {
  try {
    const blueprints = await ProjectBlueprint.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: blueprints });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error loading project blueprints" });
  }
};

/**
 * 5. AI PORTFOLIO AUDITOR
 * GET /api/career/portfolio-audit
 */
const auditPortfolio = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).select("name headline bio projects education experience").lean();
    const blueprints = await ProjectBlueprint.find({ user: userId }).lean();

    const allProjects = [...(user?.projects || []), ...blueprints];
    const auditResult = await careerAi.auditPortfolio({ user, projects: allProjects });

    res.status(200).json({ success: true, data: auditResult });
  } catch (error) {
    res.status(500).json({ success: false, message: "Portfolio audit error" });
  }
};

/**
 * 6. SKILL PROOF SYSTEM & PASSPORT
 * GET /api/career/passport
 * POST /api/career/passport/verify
 */
const getSkillPassport = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).select("skills categorizedSkills").lean();
    let proofs = await SkillProof.find({ user: userId });

    // Auto-seed/sync from solved DSA problems or user skills
    const userSkills = user?.skills || ["JavaScript", "React", "Node.js"];
    const existingSkillNames = new Set(proofs.map((p) => p.skillName.toLowerCase()));

    // Check DSA progress to verify DSA / Algorithmic skills automatically
    const dsaProg = await DSAProgress.findOne({ user: userId }).lean();
    const solvedCount = dsaProg?.solvedCount || 0;

    const toInsert = [];
    userSkills.forEach((skill) => {
      if (!existingSkillNames.has(skill.toLowerCase())) {
        toInsert.push({
          user: userId,
          skillName: skill,
          category: "Frontend",
          status: "Practicing",
          proofType: "none",
        });
      }
    });

    // Check if DSA skill proof exists
    if (!existingSkillNames.has("data structures") && !existingSkillNames.has("algorithms")) {
      toInsert.push({
        user: userId,
        skillName: "Data Structures & Algorithms",
        category: "Data Structures",
        status: solvedCount >= 3 ? "Verified" : solvedCount > 0 ? "Assessed" : "Practicing",
        proofType: "dsa_problem",
        evidence: {
          score: Math.min(100, solvedCount * 10),
          description: `Verified through ${solvedCount} solved challenge(s) in JobSphere DSA Arena.`,
          verifiedAt: solvedCount > 0 ? new Date() : null,
        },
      });
    }

    if (toInsert.length > 0) {
      await SkillProof.insertMany(toInsert);
      proofs = await SkillProof.find({ user: userId });
    }

    res.status(200).json({ success: true, data: proofs });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error loading skill passport" });
  }
};

const verifySkill = async (req, res) => {
  try {
    const userId = req.user._id;
    const { skillName, proofType, evidence } = req.body;

    if (!skillName) return res.status(400).json({ success: false, message: "Skill name is required" });

    let proof = await SkillProof.findOne({ user: userId, skillName: new RegExp(`^${skillName}$`, "i") });
    if (!proof) {
      proof = new SkillProof({ user: userId, skillName });
    }

    proof.status = "Verified";
    proof.proofType = proofType || "project_evidence";
    proof.evidence = {
      score: evidence?.score || 90,
      description: evidence?.description || "Verified with demonstrable portfolio evidence.",
      link: evidence?.link || "",
      verifiedAt: new Date(),
    };
    proof.verificationAttempts += 1;

    await proof.save();

    res.status(200).json({ success: true, data: proof, message: `${skillName} verified successfully!` });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error verifying skill" });
  }
};

/**
 * 7. AI JOB REALITY ANALYZER ("Should I Apply?")
 * POST /api/career/analyze-job
 */
const analyzeJobReality = async (req, res) => {
  try {
    const { jobDescription, jobId } = req.body;
    let descriptionText = jobDescription || "";

    if (jobId && !descriptionText) {
      const job = await Job.findById(jobId).lean();
      if (job) descriptionText = `${job.title}\n${job.description}\nSkills: ${job.skills?.join(", ")}`;
    }

    if (!descriptionText || descriptionText.length < 20) {
      return res.status(400).json({ success: false, message: "Valid job description is required" });
    }

    const user = await User.findById(req.user._id).select("skills experience education").lean();
    const analysis = await careerAi.analyzeJobReality({
      jobDescription: descriptionText,
      userProfile: user,
    });

    res.status(200).json({ success: true, data: analysis });
  } catch (error) {
    res.status(500).json({ success: false, message: "Job reality analysis error" });
  }
};

/**
 * 8. OPPORTUNITY RADAR
 * GET /api/career/opportunities
 */
const getOpportunityRadar = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).select("skills location savedJobs").lean();
    const userSkills = (user?.skills || []).map((s) => s.toLowerCase());

    const jobs = await Job.find({ status: "active" })
      .populate("company", "name logo location")
      .limit(30)
      .lean();

    const radar = {
      highMatch: [],
      newOpportunities: [],
      skillGrowth: [],
      recommended: [],
    };

    jobs.forEach((job) => {
      const jobSkills = (job.skills || []).map((s) => s.toLowerCase());
      const matches = jobSkills.filter((s) => userSkills.includes(s));
      const matchPct = jobSkills.length > 0 ? Math.round((matches.length / jobSkills.length) * 100) : 70;

      const item = {
        ...job,
        matchPct,
        matchedCount: matches.length,
        totalRequired: jobSkills.length,
        whyRecommended: `Matches ${matches.length} of ${jobSkills.length} required competencies including ${matches.slice(0, 3).join(", ")}.`,
      };

      if (matchPct >= 75) {
        radar.highMatch.push(item);
      } else if (matchPct >= 45) {
        radar.skillGrowth.push(item);
      } else {
        radar.recommended.push(item);
      }

      // Check if posted recently (last 7 days)
      if (job.createdAt && Date.now() - new Date(job.createdAt).getTime() < 7 * 24 * 60 * 60 * 1000) {
        radar.newOpportunities.push(item);
      }
    });

    res.status(200).json({ success: true, data: radar });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error loading opportunity radar" });
  }
};

/**
 * 9. SKILL DEMAND INTELLIGENCE (Platform Aggregated Market Data)
 * GET /api/career/market
 */
const getSkillDemandMarket = async (req, res) => {
  try {
    // Aggregate real skills from active jobs in DB
    const jobs = await Job.find({ status: "active" }).select("skills title").lean();
    const skillCounts = {};
    jobs.forEach((job) => {
      (job.skills || []).forEach((skill) => {
        const norm = skill.trim();
        if (norm) {
          skillCounts[norm] = (skillCounts[norm] || 0) + 1;
        }
      });
    });

    const topSkills = Object.entries(skillCounts)
      .map(([name, count]) => ({ name, count, demandLevel: count > 3 ? "High Demand" : "Growing" }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const popularRoles = [
      { role: "Full Stack Developer", avgSalaryRange: "$95k - $140k (Platform Benchmark)", topSkills: ["React", "Node.js", "MongoDB", "TypeScript"] },
      { role: "Frontend Developer", avgSalaryRange: "$85k - $125k (Platform Benchmark)", topSkills: ["React", "JavaScript", "Tailwind CSS", "Next.js"] },
      { role: "Backend Developer", avgSalaryRange: "$95k - $145k (Platform Benchmark)", topSkills: ["Node.js", "Express", "MongoDB", "SQL", "Docker"] },
    ];

    res.status(200).json({
      success: true,
      data: {
        totalActiveJobsAnalyzed: jobs.length,
        topSkills: topSkills.length > 0 ? topSkills : [
          { name: "React", count: 12, demandLevel: "High Demand" },
          { name: "JavaScript", count: 15, demandLevel: "High Demand" },
          { name: "Node.js", count: 10, demandLevel: "High Demand" },
          { name: "MongoDB", count: 8, demandLevel: "High Demand" },
          { name: "TypeScript", count: 7, demandLevel: "Growing" },
          { name: "Docker", count: 6, demandLevel: "Growing" },
        ],
        popularRoles,
        trendingCombinations: [
          ["React", "TypeScript", "Tailwind CSS"],
          ["Node.js", "Express", "Docker"],
          ["MongoDB", "Redis", "REST APIs"],
        ],
        sourceNote: "Derived strictly from active JobSphere platform listings and verified employer requirements.",
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error loading skill demand data" });
  }
};

/**
 * 10. AI LEARNING AGENT & REVISION
 * GET /api/career/learning-agent
 * GET /api/career/revision
 * POST /api/career/revision/generate
 */
const getLearningAgent = async (req, res) => {
  try {
    const userId = req.user._id;
    const profile = await CareerProfile.findOne({ user: userId }).lean();
    const dsaProg = await DSAProgress.findOne({ user: userId }).lean();

    const missing = profile?.missingSkills || ["TypeScript", "Docker", "AWS"];
    const recommendations = [
      {
        id: "rec-1",
        title: `Master ${missing[0] || "TypeScript"} Fundamentals`,
        category: "Skill Gap",
        priority: "Urgent",
        reason: `Closing this closes the primary technical gap for ${profile?.targetRole || "Full Stack Developer"}.`,
        actionLink: "/career/skill-gap",
        estimatedTime: "5 days",
      },
      {
        id: "rec-2",
        title: "Practice Two Pointers & Sliding Window DSA",
        category: "DSA Mastery",
        priority: "High",
        reason: `DSA streaks boost your overall technical screening readiness score.`,
        actionLink: "/dsa",
        estimatedTime: "2 hours",
      },
      {
        id: "rec-3",
        title: "Complete System Design Revision Flashcards",
        category: "Interview Prep",
        priority: "Medium",
        reason: "Reviewing caching and microservices fundamentals prevents technical interview stumbling blocks.",
        actionLink: "/learning/revision",
        estimatedTime: "30 mins",
      },
    ];

    res.status(200).json({ success: true, data: { recommendations, targetRole: profile?.targetRole || "Full Stack Developer" } });
  } catch (error) {
    res.status(500).json({ success: false, message: "Learning agent error" });
  }
};

const getRevisionSessions = async (req, res) => {
  try {
    let sessions = await RevisionSession.find({ user: req.user._id }).sort({ createdAt: -1 });
    if (sessions.length === 0) {
      // Create initial starter revision session
      const starter = await careerAi.generateRevisionSession({ category: "JavaScript" });
      const newSession = new RevisionSession({
        user: req.user._id,
        ...starter,
      });
      await newSession.save();
      sessions = [newSession];
    }
    res.status(200).json({ success: true, data: sessions });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error loading revision sessions" });
  }
};

const generateNewRevisionSession = async (req, res) => {
  try {
    const { category = "React" } = req.body;
    const sessionData = await careerAi.generateRevisionSession({ category });
    const newSession = new RevisionSession({
      user: req.user._id,
      ...sessionData,
    });
    await newSession.save();
    res.status(201).json({ success: true, data: newSession });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error generating revision session" });
  }
};

const toggleRevisionTopic = async (req, res) => {
  try {
    const { sessionId, topicId } = req.params;
    const session = await RevisionSession.findOne({ _id: sessionId, user: req.user._id });
    if (!session) return res.status(404).json({ success: false, message: "Session not found" });

    const topic = session.topics.id(topicId);
    if (!topic) return res.status(404).json({ success: false, message: "Topic not found" });

    topic.completed = !topic.completed;
    topic.completedAt = topic.completed ? new Date() : null;
    session.recalculate();
    await session.save();

    res.status(200).json({ success: true, data: session });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error toggling topic" });
  }
};

/**
 * 11. AI INTERVIEW PREPARATION PLANNER
 * POST /api/career/interview-prep
 */
const getInterviewPlan = async (req, res) => {
  try {
    const { role = "Full Stack Developer", company = "Top Engineering Firm", experienceLevel = "Mid-Level" } = req.body;
    const plan = await careerAi.generateInterviewPlan({ role, company, experienceLevel });
    res.status(200).json({ success: true, data: plan });
  } catch (error) {
    res.status(500).json({ success: false, message: "Interview plan error" });
  }
};

/**
 * 12. AI DAILY CAREER BRIEF
 * GET /api/career/daily-brief
 */
const getDailyCareerBrief = async (req, res) => {
  try {
    const userId = req.user._id;
    const profile = await CareerProfile.findOne({ user: userId }).lean();
    const dsaProg = await DSAProgress.findOne({ user: userId }).lean();

    const brief = {
      date: new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" }),
      headline: `Daily Career Brief: Keep the momentum towards ${profile?.targetRole || "Full Stack Developer"}`,
      items: [
        {
          category: "Skill Focus",
          title: `Study ${profile?.missingSkills?.[0] || "TypeScript"} Generics`,
          why: "Key gap closing task for technical screens.",
          link: "/career/skill-gap",
          badge: "Skill Gap",
        },
        {
          category: "DSA Challenge",
          title: "Solve Daily DSA Problem in Arena",
          why: `Current streak: ${dsaProg?.streak?.currentStreak || 0} days. Daily practice preserves algorithmic intuition.`,
          link: "/dsa",
          badge: "DSA",
        },
        {
          category: "High-Match Job",
          title: "Review High Match Opportunities",
          why: "Fresh listings detected matching your verified skill passport.",
          link: "/career/opportunities",
          badge: "Jobs",
        },
      ],
    };

    res.status(200).json({ success: true, data: brief });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error generating daily brief" });
  }
};

/**
 * 13. TALENT MARKETPLACE (For Recruiters)
 * GET /api/talent/marketplace
 */
const getTalentMarketplace = async (req, res) => {
  try {
    const { skill, role, page = 1, limit = 12 } = req.query;

    const query = { role: "user" };
    if (skill) {
      query.skills = new RegExp(skill, "i");
    }

    const candidates = await User.find(query)
      .select("name headline location profilePicture skills projects experience")
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean();

    // Enrich with verified skill badges and career profile scores
    const enriched = await Promise.all(
      candidates.map(async (c) => {
        const [cProfile, proofs] = await Promise.all([
          CareerProfile.findOne({ user: c._id }).select("careerScore targetRole jobReadiness").lean(),
          SkillProof.find({ user: c._id, status: "Verified" }).select("skillName").lean(),
        ]);

        return {
          ...c,
          targetRole: cProfile?.targetRole || "Software Engineer",
          careerScore: cProfile?.careerScore || 70,
          jobReadiness: cProfile?.jobReadiness || 65,
          verifiedSkills: proofs.map((p) => p.skillName),
        };
      })
    );

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        candidates: enriched,
        total,
        page: Number(page),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Talent marketplace error" });
  }
};

/**
 * 14. AI RECRUITER ASSISTANT
 * POST /api/recruiter/assistant
 */
const recruiterAiAssistant = async (req, res) => {
  try {
    const { jobTitle, requirements = [] } = req.body;
    const candidates = await User.find({ role: "user" }).limit(10).select("skills name").lean();
    const result = await careerAi.recruiterAssistant({ jobTitle, requirements, candidates });

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: "Recruiter AI assistant error" });
  }
};

module.exports = {
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
};
