const User = require("../models/User");
const CareerProfile = require("../models/CareerProfile");
const DSAProgress = require("../models/DSAProgress");
const InterviewSession = require("../models/InterviewSession");
const ResumeAnalysis = require("../models/ResumeAnalysis");
const Application = require("../models/Application");
const SkillProof = require("../models/SkillProof");
const ProjectBlueprint = require("../models/ProjectBlueprint");

// Standard target role requirements for deterministic skill gap & readiness comparison
const ROLE_SKILL_BENCHMARKS = {
  "Full Stack Developer": {
    coreSkills: ["JavaScript", "React", "Node.js", "MongoDB", "Express", "REST API", "Git"],
    advancedSkills: ["TypeScript", "Docker", "AWS", "Redis", "CI/CD", "System Design"],
    minProjects: 2,
    targetDsaSolved: 15,
  },
  "Frontend Developer": {
    coreSkills: ["HTML", "CSS", "JavaScript", "React", "Tailwind CSS", "REST API", "Git"],
    advancedSkills: ["TypeScript", "Next.js", "Redux", "Web Performance", "Testing (Jest)"],
    minProjects: 2,
    targetDsaSolved: 10,
  },
  "Backend Developer": {
    coreSkills: ["JavaScript", "Node.js", "Express", "MongoDB", "SQL", "REST API", "Git"],
    advancedSkills: ["Docker", "Redis", "Microservices", "AWS", "Kafka", "System Design"],
    minProjects: 2,
    targetDsaSolved: 20,
  },
  "DevOps Engineer": {
    coreSkills: ["Linux", "Git", "Docker", "CI/CD", "Bash", "Networking"],
    advancedSkills: ["Kubernetes", "AWS", "Terraform", "Ansible", "Prometheus", "Grafana"],
    minProjects: 2,
    targetDsaSolved: 5,
  },
};

/**
 * Calculates deterministic, evidence-based scores for the user's AI Career Digital Twin.
 */
async function computeCareerDigitalTwin(userId) {
  const user = await User.findById(userId).lean();
  if (!user) throw new Error("User not found");

  // Fetch or create profile
  let profile = await CareerProfile.findOne({ user: userId });
  if (!profile) {
    profile = new CareerProfile({ user: userId });
  }

  const targetRole = profile.targetRole || "Full Stack Developer";
  const benchmark = ROLE_SKILL_BENCHMARKS[targetRole] || ROLE_SKILL_BENCHMARKS["Full Stack Developer"];

  // 1. Gather User's Stored Activity Data
  const [dsaProg, interviewSessions, resumeAnalyses, applications, skillProofs, blueprints] =
    await Promise.all([
      DSAProgress.findOne({ user: userId }).lean().catch(() => null),
      InterviewSession.find({ user: userId, status: "completed" })
        .sort({ createdAt: -1 })
        .limit(10)
        .lean()
        .catch(() => []),
      ResumeAnalysis.find({ user: userId })
        .sort({ createdAt: -1 })
        .limit(1)
        .lean()
        .catch(() => []),
      Application.find({ user: userId }).lean().catch(() => []),
      SkillProof.find({ user: userId }).lean().catch(() => []),
      ProjectBlueprint.find({ user: userId }).lean().catch(() => []),
    ]);

  // Extract user skills (normalized lowercase for matching)
  const userSkills = (user.skills || []).map((s) => (typeof s === "string" ? s.trim() : ""));
  const userSkillsLower = new Set(userSkills.map((s) => s.toLowerCase()));

  // 2. Compute DSA Readiness (0-100)
  const solvedCount = dsaProg?.solvedCount || 0;
  const targetSolved = benchmark.targetDsaSolved;
  const dsaBaseScore = Math.min(100, Math.round((solvedCount / targetSolved) * 80));
  const streakBonus = Math.min(20, (dsaProg?.streak?.currentStreak || 0) * 4);
  const dsaReadiness = Math.min(100, dsaBaseScore + streakBonus);

  // 3. Compute Interview Readiness (0-100)
  let interviewReadiness = 40; // baseline if no sessions yet
  if (interviewSessions && interviewSessions.length > 0) {
    const totalScore = interviewSessions.reduce((acc, curr) => acc + (curr.overallScore || 60), 0);
    interviewReadiness = Math.round(totalScore / interviewSessions.length);
  } else {
    // estimate from experience and education
    const expCount = user.experience?.length || 0;
    interviewReadiness = Math.min(65, 40 + expCount * 10);
  }

  // 4. Compute Resume Strength (0-100)
  let resumeStrength = 50;
  if (resumeAnalyses && resumeAnalyses.length > 0) {
    resumeStrength = Math.round(resumeAnalyses[0].overallScore || 70);
  } else {
    // Derive from profile completeness
    let comp = 30;
    if (user.headline) comp += 15;
    if (user.bio) comp += 15;
    if (user.experience?.length) comp += 20;
    if (user.education?.length) comp += 10;
    if (user.resume) comp += 10;
    resumeStrength = Math.min(100, comp);
  }

  // 5. Compute Project Strength (0-100)
  const totalProjects = (user.projects?.length || 0) + (blueprints?.length || 0);
  let projectStrength = Math.min(100, Math.round((totalProjects / benchmark.minProjects) * 60));
  // check if projects have GitHub or live link
  const validLinks = (user.projects || []).filter((p) => p.github || p.link).length;
  projectStrength = Math.min(100, projectStrength + validLinks * 15);
  if (projectStrength === 0) projectStrength = 35; // baseline

  // 6. Compute Job Readiness (0-100)
  // Coverage of core skills and advanced skills
  let coreMatches = 0;
  benchmark.coreSkills.forEach((req) => {
    if (userSkillsLower.has(req.toLowerCase())) coreMatches++;
  });
  let advMatches = 0;
  benchmark.advancedSkills.forEach((req) => {
    if (userSkillsLower.has(req.toLowerCase())) advMatches++;
  });

  const coreCoverage = (coreMatches / benchmark.coreSkills.length) * 60;
  const advCoverage = (advMatches / benchmark.advancedSkills.length) * 30;
  const expFactor = Math.min(10, (user.experience?.length || 0) * 5);
  const jobReadiness = Math.min(100, Math.round(coreCoverage + advCoverage + expFactor));

  // 7. Overall Career Score (0-100)
  const careerScore = Math.round(
    jobReadiness * 0.25 +
      interviewReadiness * 0.2 +
      dsaReadiness * 0.2 +
      projectStrength * 0.2 +
      resumeStrength * 0.15
  );

  // 8. Skill Categorization
  const strongSkills = [];
  const weakSkills = [];
  const missingSkills = [];
  const recommendedSkills = [];

  // Check verified skills from SkillProof
  const verifiedMap = new Map();
  skillProofs.forEach((sp) => {
    verifiedMap.set(sp.skillName.toLowerCase(), sp.status);
  });

  // Categorize known skills
  userSkills.forEach((skill) => {
    const st = verifiedMap.get(skill.toLowerCase());
    if (st === "Verified") {
      strongSkills.push(skill);
    } else if (st === "Practicing" || st === "Unverified") {
      weakSkills.push(skill);
    } else {
      strongSkills.push(skill);
    }
  });

  // Check missing skills from target role benchmark
  [...benchmark.coreSkills, ...benchmark.advancedSkills].forEach((req) => {
    if (!userSkillsLower.has(req.toLowerCase())) {
      missingSkills.push(req);
      recommendedSkills.push({
        skill: req,
        reason: benchmark.coreSkills.includes(req)
          ? `Essential core competency for ${targetRole}.`
          : `High-impact differentiator to elevate you into top-tier candidate brackets.`,
        priority: benchmark.coreSkills.includes(req) ? "High" : "Medium",
      });
    }
  });

  // Update profile
  profile.careerScore = careerScore;
  profile.jobReadiness = jobReadiness;
  profile.interviewReadiness = interviewReadiness;
  profile.dsaReadiness = dsaReadiness;
  profile.projectStrength = projectStrength;
  profile.resumeStrength = resumeStrength;
  profile.strongSkills = strongSkills.slice(0, 8);
  profile.weakSkills = weakSkills.slice(0, 8);
  profile.missingSkills = missingSkills.slice(0, 8);
  profile.recommendedSkills = recommendedSkills.slice(0, 6);
  profile.careerMemory.lastActiveDate = new Date();

  await profile.save();

  return {
    profile,
    rawStats: {
      solvedDsa: solvedCount,
      completedInterviews: interviewSessions.length,
      applicationsCount: applications.length,
      totalProjects,
      verifiedSkillsCount: skillProofs.filter((s) => s.status === "Verified").length,
    },
  };
}

module.exports = {
  computeCareerDigitalTwin,
  ROLE_SKILL_BENCHMARKS,
};
