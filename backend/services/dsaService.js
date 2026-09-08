const DSAProblem = require("../models/DSAProblem");
const DSASubmission = require("../models/DSASubmission");
const DSAProgress = require("../models/DSAProgress");
const DSABookmark = require("../models/DSABookmark");
const DailyChallenge = require("../models/DailyChallenge");
const Job = require("../models/Job");
const User = require("../models/User");

// All official DSA Topic categories
const DSA_TOPICS = [
  "Arrays",
  "Strings",
  "Hashing",
  "Two Pointers",
  "Sliding Window",
  "Stack",
  "Queue",
  "Linked List",
  "Binary Search",
  "Trees",
  "BST",
  "Heap",
  "Graph",
  "Greedy",
  "Recursion",
  "Backtracking",
  "Dynamic Programming",
  "Bit Manipulation",
  "Sorting",
];

/**
 * Returns today's date string in "YYYY-MM-DD"
 */
function getTodayDateString() {
  const d = new Date();
  return d.toISOString().split("T")[0];
}

/**
 * Returns yesterday's date string in "YYYY-MM-DD"
 */
function getYesterdayDateString() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split("T")[0];
}

/**
 * Get or initialize user's DSAProgress record
 */
async function getOrCreateProgress(userId) {
  let progress = await DSAProgress.findOne({ user: userId });
  if (!progress) {
    progress = await DSAProgress.create({
      user: userId,
      solvedProblems: [],
      attemptedProblems: [],
      streak: {
        currentStreak: 0,
        longestStreak: 0,
        lastActiveDate: null,
        activityDates: [],
      },
      difficultyStats: { easy: 0, medium: 0, hard: 0 },
      topicStats: new Map(),
      totalSubmissions: 0,
      acceptedSubmissions: 0,
    });
  }
  return progress;
}

/**
 * Updates streak upon real practice activity (run or submit)
 */
function updateStreakOnActivity(progress) {
  const today = getTodayDateString();
  const yesterday = getYesterdayDateString();
  const streak = progress.streak || {
    currentStreak: 0,
    longestStreak: 0,
    lastActiveDate: null,
    activityDates: [],
  };

  // If already active today, do not increase streak
  if (streak.lastActiveDate === today) {
    return streak;
  }

  if (streak.lastActiveDate === yesterday) {
    // Continued streak from yesterday
    streak.currentStreak = (streak.currentStreak || 0) + 1;
  } else {
    // Broken or new streak
    streak.currentStreak = 1;
  }

  if (streak.currentStreak > (streak.longestStreak || 0)) {
    streak.longestStreak = streak.currentStreak;
  }

  streak.lastActiveDate = today;
  if (!streak.activityDates.includes(today)) {
    streak.activityDates.push(today);
  }

  progress.streak = streak;
  return streak;
}

/**
 * Retrieve paginated problem list with status and bookmark indicators for user
 */
async function getProblems({
  userId,
  search = "",
  difficulty = "",
  topic = "",
  status = "",
  sheetCategory = "",
  page = 1,
  limit = 20,
}) {
  const query = {};

  if (search && search.trim()) {
    const s = search.trim();
    query.$or = [
      { title: { $regex: s, $options: "i" } },
      { topics: { $regex: s, $options: "i" } },
    ];
    if (!isNaN(s)) {
      query.$or.push({ problemNumber: Number(s) });
    }
  }

  if (difficulty && ["Easy", "Medium", "Hard"].includes(difficulty)) {
    query.difficulty = difficulty;
  }

  if (topic && topic !== "All") {
    query.topics = topic;
  }

  if (sheetCategory) {
    query.sheetCategory = sheetCategory;
  }

  // Get user's solved, attempted, and bookmarked IDs if logged in
  let solvedSet = new Set();
  let attemptedSet = new Set();
  let bookmarkSet = new Set();

  if (userId) {
    const [progress, bookmarks] = await Promise.all([
      DSAProgress.findOne({ user: userId }).lean(),
      DSABookmark.find({ user: userId }).lean(),
    ]);

    if (progress) {
      (progress.solvedProblems || []).forEach((id) => solvedSet.add(id.toString()));
      (progress.attemptedProblems || []).forEach((id) => attemptedSet.add(id.toString()));
    }

    if (bookmarks) {
      bookmarks.forEach((b) => bookmarkSet.add(b.problem.toString()));
    }
  }

  // Apply status filter if specified
  if (status && userId) {
    if (status === "Solved") {
      query._id = { $in: Array.from(solvedSet) };
    } else if (status === "Attempted") {
      const attemptedOnly = Array.from(attemptedSet).filter((id) => !solvedSet.has(id));
      query._id = { $in: attemptedOnly };
    } else if (status === "Unsolved") {
      query._id = { $nin: Array.from(solvedSet) };
    } else if (status === "Bookmarked") {
      query._id = { $in: Array.from(bookmarkSet) };
    }
  }

  const skip = (Math.max(1, Number(page)) - 1) * Number(limit);
  const total = await DSAProblem.countDocuments(query);

  const problems = await DSAProblem.find(query)
    .sort({ problemNumber: 1 })
    .skip(skip)
    .limit(Number(limit))
    .lean();

  const enrichedProblems = problems.map((p) => {
    const pid = p._id.toString();
    const isSolved = solvedSet.has(pid);
    const isAttempted = attemptedSet.has(pid);
    const isBookmarked = bookmarkSet.has(pid);

    let userStatus = "Unsolved";
    if (isSolved) userStatus = "Solved";
    else if (isAttempted) userStatus = "Attempted";

    return {
      ...p,
      userStatus,
      isBookmarked,
    };
  });

  return {
    problems: enrichedProblems,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)) || 1,
    },
  };
}

/**
 * Get problem details with user status and bookmarks
 */
async function getProblemDetails(idOrSlug, userId) {
  const isObjectId = /^[0-9a-fA-F]{24}$/.test(idOrSlug);
  const query = isObjectId ? { _id: idOrSlug } : { slug: idOrSlug.toLowerCase() };

  const problem = await DSAProblem.findOne(query).lean();
  if (!problem) return null;

  let userStatus = "Unsolved";
  let isBookmarked = false;

  if (userId) {
    const [progress, bookmark] = await Promise.all([
      DSAProgress.findOne({ user: userId }).lean(),
      DSABookmark.findOne({ user: userId, problem: problem._id }).lean(),
    ]);

    if (progress) {
      const pid = problem._id.toString();
      const solved = (progress.solvedProblems || []).some((id) => id.toString() === pid);
      const attempted = (progress.attemptedProblems || []).some((id) => id.toString() === pid);
      if (solved) userStatus = "Solved";
      else if (attempted) userStatus = "Attempted";
    }

    if (bookmark) {
      isBookmarked = true;
    }
  }

  return {
    ...problem,
    userStatus,
    isBookmarked,
  };
}

/**
 * Record submission and update progress, streak, and stats
 */
async function recordSubmission({ userId, problemId, language, code, executionResult }) {
  const submission = await DSASubmission.create({
    user: userId,
    problem: problemId,
    language,
    code,
    status: executionResult.status,
    runtime: executionResult.runtime || 0,
    memory: executionResult.memory || 0,
    passedCount: executionResult.passedCount || 0,
    totalTestCases: executionResult.totalTestCases || 0,
    failedTestCase: executionResult.failedTestCase || null,
    errorMessage: executionResult.errorMessage || "",
  });

  // Update Problem counts
  await DSAProblem.findByIdAndUpdate(problemId, {
    $inc: {
      totalSubmissions: 1,
      totalAccepted: executionResult.status === "Accepted" ? 1 : 0,
    },
  });

  // Update User Progress
  const progress = await getOrCreateProgress(userId);
  progress.totalSubmissions += 1;
  if (executionResult.status === "Accepted") {
    progress.acceptedSubmissions += 1;
  }

  // Update Streak
  updateStreakOnActivity(progress);

  const pidStr = problemId.toString();
  const problem = await DSAProblem.findById(problemId).lean();

  // Update Attempted list
  const isAlreadyAttempted = (progress.attemptedProblems || []).some(
    (id) => id.toString() === pidStr
  );
  if (!isAlreadyAttempted) {
    progress.attemptedProblems.push(problemId);
  }

  // If Accepted, update Solved list and difficulty/topic counters
  if (executionResult.status === "Accepted") {
    const isAlreadySolved = (progress.solvedProblems || []).some(
      (id) => id.toString() === pidStr
    );

    if (!isAlreadySolved) {
      progress.solvedProblems.push(problemId);

      // Difficulty count increment
      const diff = (problem?.difficulty || "Easy").toLowerCase();
      if (diff === "easy") progress.difficultyStats.easy += 1;
      else if (diff === "medium") progress.difficultyStats.medium += 1;
      else if (diff === "hard") progress.difficultyStats.hard += 1;

      // Mark Daily Challenge complete if problem matches today's challenge
      const today = getTodayDateString();
      await DailyChallenge.findOneAndUpdate(
        { date: today, problem: problemId },
        { $addToSet: { completedBy: userId } }
      );
    }
  }

  // Update Topic stats
  if (problem?.topics && Array.isArray(problem.topics)) {
    if (!progress.topicStats) progress.topicStats = new Map();

    for (const topic of problem.topics) {
      const current = progress.topicStats.get(topic) || {
        solved: 0,
        attempted: 0,
        failed: 0,
      };
      current.attempted += 1;
      if (executionResult.status === "Accepted") {
        current.solved += 1;
      } else {
        current.failed += 1;
      }
      progress.topicStats.set(topic, current);
    }
  }

  await progress.save();

  return submission;
}

/**
 * Get or rotate Daily Challenge
 */
async function getDailyChallenge(userId) {
  const today = getTodayDateString();
  let challenge = await DailyChallenge.findOne({ date: today }).populate("problem");

  if (!challenge) {
    // Pick an active problem for today's challenge (deterministic rotation based on day of year)
    const totalProblems = await DSAProblem.countDocuments();
    if (totalProblems > 0) {
      const dayOfYear = Math.floor(
        (new Date() - new Date(new Date().getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24
      );
      const skipIndex = dayOfYear % totalProblems;
      const problem = await DSAProblem.findOne().skip(skipIndex);

      if (problem) {
        challenge = await DailyChallenge.create({
          date: today,
          problem: problem._id,
          estimatedMinutes: problem.difficulty === "Hard" ? 45 : problem.difficulty === "Medium" ? 30 : 20,
          completedBy: [],
        });
        challenge.problem = problem;
      }
    }
  }

  const isCompleted = challenge?.completedBy?.some((id) => id.toString() === userId?.toString()) || false;

  return {
    date: challenge?.date || today,
    problem: challenge?.problem || null,
    estimatedMinutes: challenge?.estimatedMinutes || 25,
    isCompleted,
    participantsCount: challenge?.completedBy?.length || 0,
  };
}

/**
 * Get topic-wise summary across entire platform with user's completion progress
 */
async function getTopicsSummary(userId) {
  const [allProblems, progress] = await Promise.all([
    DSAProblem.find({}, "topics difficulty _id").lean(),
    userId ? DSAProgress.findOne({ user: userId }).lean() : null,
  ]);

  const solvedSet = new Set((progress?.solvedProblems || []).map((id) => id.toString()));

  const topicMap = {};
  for (const topic of DSA_TOPICS) {
    topicMap[topic] = {
      name: topic,
      totalProblems: 0,
      solvedCount: 0,
      easyCount: 0,
      mediumCount: 0,
      hardCount: 0,
    };
  }

  for (const p of allProblems) {
    const isSolved = solvedSet.has(p._id.toString());
    for (const t of p.topics || []) {
      if (topicMap[t]) {
        topicMap[t].totalProblems += 1;
        if (isSolved) topicMap[t].solvedCount += 1;
        if (p.difficulty === "Easy") topicMap[t].easyCount += 1;
        else if (p.difficulty === "Medium") topicMap[t].mediumCount += 1;
        else if (p.difficulty === "Hard") topicMap[t].hardCount += 1;
      }
    }
  }

  return Object.values(topicMap);
}

/**
 * Get DSA Sheet structured roadmap (Beginner, Intermediate, Advanced)
 */
async function getDsaSheetRoadmap(userId) {
  const problems = await DSAProblem.find()
    .sort({ sheetCategory: 1, order: 1, problemNumber: 1 })
    .lean();

  let solvedSet = new Set();
  if (userId) {
    const progress = await DSAProgress.findOne({ user: userId }).lean();
    if (progress?.solvedProblems) {
      solvedSet = new Set(progress.solvedProblems.map((id) => id.toString()));
    }
  }

  const tiers = {
    Beginner: {
      name: "Beginner Tier",
      description: "Master foundational data structures: Arrays, Strings, Hashing, Sorting & Binary Search.",
      topics: ["Arrays", "Strings", "Hashing", "Sorting", "Binary Search"],
      problems: [],
      total: 0,
      solved: 0,
    },
    Intermediate: {
      name: "Intermediate Tier",
      description: "Level up with Linked Lists, Stacks, Queues, Binary Trees, Heaps & Graphs.",
      topics: ["Linked List", "Stack", "Queue", "Trees", "BST", "Heap", "Graph"],
      problems: [],
      total: 0,
      solved: 0,
    },
    Advanced: {
      name: "Advanced Tier",
      description: "Tackle competitive patterns: Greedy, Backtracking, Dynamic Programming & Bit Manipulation.",
      topics: ["Greedy", "Backtracking", "Dynamic Programming", "Bit Manipulation", "Two Pointers", "Sliding Window"],
      problems: [],
      total: 0,
      solved: 0,
    },
  };

  for (const p of problems) {
    const tierKey = p.sheetCategory || "Beginner";
    if (tiers[tierKey]) {
      const isSolved = solvedSet.has(p._id.toString());
      tiers[tierKey].problems.push({
        ...p,
        isSolved,
      });
      tiers[tierKey].total += 1;
      if (isSolved) tiers[tierKey].solved += 1;
    }
  }

  return Object.values(tiers);
}

/**
 * Compute Job Readiness score and Job-specific DSA practice recommendations
 */
async function getJobDsaPreparation(jobId, userId) {
  const job = await Job.findById(jobId).lean();
  if (!job) return null;

  // Extract skills required from job
  const jobSkills = Array.isArray(job.skills) ? job.skills : [];
  const title = job.title || "";
  const desc = job.description || "";

  // Map job keywords to DSA topics
  const relevantTopics = new Set(["Arrays", "Hashing"]); // base
  const combinedText = `${title} ${jobSkills.join(" ")} ${desc}`.toLowerCase();

  if (combinedText.includes("react") || combinedText.includes("frontend") || combinedText.includes("javascript")) {
    relevantTopics.add("Strings");
    relevantTopics.add("Two Pointers");
    relevantTopics.add("Stack");
  }
  if (combinedText.includes("backend") || combinedText.includes("node") || combinedText.includes("python") || combinedText.includes("java")) {
    relevantTopics.add("Trees");
    relevantTopics.add("Graph");
    relevantTopics.add("Dynamic Programming");
    relevantTopics.add("Binary Search");
  }
  if (combinedText.includes("full stack") || combinedText.includes("senior") || combinedText.includes("engineer")) {
    relevantTopics.add("Linked List");
    relevantTopics.add("Heap");
  }

  const topicList = Array.from(relevantTopics).slice(0, 4);

  // Fetch recommended problems for these topics
  const recommendedProblems = await DSAProblem.find({
    topics: { $in: topicList },
  })
    .limit(6)
    .lean();

  // User readiness metric
  let userSolvedCount = 0;
  let readinessScore = 45; // baseline readiness
  if (userId) {
    const progress = await DSAProgress.findOne({ user: userId }).lean();
    if (progress) {
      userSolvedCount = progress.solvedProblems?.length || 0;
      // Calculate score out of 100
      readinessScore = Math.min(95, Math.max(30, 40 + userSolvedCount * 5));
    }
  }

  return {
    jobId,
    jobTitle: job.title,
    company: job.company?.name || job.companyName || "",
    relevantTopics: topicList,
    recommendedProblems,
    readinessScore,
    userSolvedCount,
  };
}

module.exports = {
  DSA_TOPICS,
  getTodayDateString,
  getOrCreateProgress,
  updateStreakOnActivity,
  getProblems,
  getProblemDetails,
  recordSubmission,
  getDailyChallenge,
  getTopicsSummary,
  getDsaSheetRoadmap,
  getJobDsaPreparation,
};
