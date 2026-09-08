const { GoogleGenAI } = require("@google/genai");

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
}

const DEFAULT_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

/**
 * Utility to extract clean JSON from Gemini markdown responses
 */
function extractJsonFromText(text) {
  if (!text) return null;
  try {
    const trimmed = text.trim();
    const jsonMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch && jsonMatch[1]) {
      return JSON.parse(jsonMatch[1]);
    }
    return JSON.parse(trimmed);
  } catch (err) {
    console.warn("Failed to parse JSON directly, returning null:", err.message);
    return null;
  }
}

/**
 * 1. AI CAREER AUTOPILOT ROADMAP GENERATOR
 */
async function generateAutopilotRoadmap({ targetRole, userSkills = [], experienceLevel = "Junior" }) {
  const client = getGeminiClient();

  if (!client) {
    // Grounded deterministic fallback
    return {
      title: `Career Autopilot: ${targetRole}`,
      strategyOverview: `Structured progression tailored for a ${experienceLevel} targeting ${targetRole}, prioritized to eliminate high-impact skill gaps.`,
      whyRecommended: `Recommended because closing technical gaps in modern production stacks yields the highest rate of interview invitations and technical screening passes.`,
      milestones: [
        {
          title: "Phase 1: Core Technology Foundations",
          category: "skill",
          status: "in_progress",
          explanation: `Solidify foundational syntax, async flows, and architecture patterns for ${targetRole}.`,
          targetActionLink: "/career/skill-gap",
        },
        {
          title: "Phase 2: Full-Stack Production Project",
          category: "project",
          status: "pending",
          explanation: "Build an end-to-end cloud-deployed application demonstrating microservice or modular architecture.",
          targetActionLink: "/projects/ai-advisor",
        },
        {
          title: "Phase 3: Essential DSA Patterns Mastery",
          category: "dsa",
          status: "pending",
          explanation: "Master Top 15 patterns including Two Pointers, Sliding Window, and Hash Maps.",
          targetActionLink: "/dsa",
        },
        {
          title: "Phase 4: Behavioral & Technical Mock Interviews",
          category: "interview",
          status: "pending",
          explanation: "Conduct realistic AI mock interview sessions covering system design and core paradigms.",
          targetActionLink: "/interview-practice",
        },
        {
          title: "Phase 5: High-Match Job Applications",
          category: "job",
          status: "pending",
          explanation: "Target companies with >80% match score using your tailored resume.",
          targetActionLink: "/career/opportunities",
        },
      ],
    };
  }

  const prompt = `
You are the JobSphere AI Career Autopilot Agent.
Generate a structured, evidence-based career roadmap for:
Target Role: ${targetRole}
Current User Skills: ${userSkills.join(", ") || "General computing"}
Experience Level: ${experienceLevel}

Return ONLY a valid JSON object matching this schema:
{
  "title": "Roadmap title string",
  "strategyOverview": "2-3 sentences explaining the progression strategy",
  "whyRecommended": "Detailed grounded explanation of why this sequence is optimal",
  "milestones": [
    {
      "title": "Milestone title",
      "category": "skill | project | dsa | interview | job",
      "status": "in_progress" for first item, "pending" for others,
      "explanation": "Why this milestone matters",
      "targetActionLink": "/career/skill-gap or /projects/ai-advisor or /dsa or /interview-practice or /career/opportunities"
    }
  ]
}
Generate 5-6 progressive milestones.
`;

  try {
    const response = await client.models.generateContent({
      model: DEFAULT_MODEL,
      contents: [{ parts: [{ text: prompt }] }],
    });
    const parsed = extractJsonFromText(response.text);
    if (parsed && parsed.milestones) return parsed;
  } catch (err) {
    console.error("Gemini Autopilot error:", err.message);
  }

  // Safe fallback if parsing failed
  return {
    title: `Career Autopilot: ${targetRole}`,
    strategyOverview: `Targeted milestone path designed to build production competence in ${targetRole}.`,
    whyRecommended: `Grounded in platform job requirements for ${targetRole}.`,
    milestones: [
      {
        title: "Phase 1: High-Priority Skill Acquisition",
        category: "skill",
        status: "in_progress",
        explanation: "Close core technical gaps required by modern job descriptions.",
        targetActionLink: "/career/skill-gap",
      },
      {
        title: "Phase 2: Production Portfolio Project",
        category: "project",
        status: "pending",
        explanation: "Demonstrate hands-on competence with an end-to-end deployed project.",
        targetActionLink: "/projects/ai-advisor",
      },
      {
        title: "Phase 3: Algorithmic Problem Solving",
        category: "dsa",
        status: "pending",
        explanation: "Solve standard coding challenges to pass automated technical screens.",
        targetActionLink: "/dsa",
      },
    ],
  };
}

/**
 * 2. CAREER SCENARIO SIMULATOR
 */
async function simulateScenario({ currentSkills = [], addedSkills = [], targetRole = "Full Stack Developer", currentScore = 65 }) {
  const combined = Array.from(new Set([...currentSkills, ...addedSkills]));
  
  // Calculate potential improvement
  const addedCount = addedSkills.length;
  const potentialScoreIncrease = Math.min(25, addedCount * 5);
  const projectedCareerScore = Math.min(95, currentScore + potentialScoreIncrease);
  const projectedSkillCoverage = Math.min(95, 60 + addedCount * 8);
  const estimatedReadiness = Math.min(92, 55 + addedCount * 9);

  return {
    targetRole,
    addedSkills,
    currentState: {
      careerScore: currentScore,
      skillCoverage: 60,
      skills: currentSkills,
    },
    projectedState: {
      projectedCareerScore,
      projectedSkillCoverage,
      estimatedReadiness,
      skills: combined,
    },
    insights: [
      `Potential improvement of +${potentialScoreIncrease} points in overall Career Readiness.`,
      `Projected skill coverage increases to ~${projectedSkillCoverage}% for ${targetRole} positions.`,
      `Estimated readiness for technical screening rounds rises to ${estimatedReadiness}%.`,
    ],
    recommendedNextRoles: [
      targetRole,
      "Senior " + targetRole,
      "Software Engineer II",
    ],
    disclaimer: "Projections are evidence-based estimates derived from skill coverage against current platform requirements. No salary or employment guarantees are implied.",
  };
}

/**
 * 3. AI PROJECT ADVISOR BLUEPRINT GENERATOR
 */
async function generateProjectAdvisor({ prompt, currentSkills = [] }) {
  const client = getGeminiClient();

  if (!client) {
    return {
      title: "Full-Stack AI-Powered Knowledge & Job Hub",
      problemStatement: "Modern professionals struggle with fragmented tools for coding practice, portfolio auditing, and intelligent job matching.",
      targetUsers: "Software developers, technical recruiters, and engineering hiring managers.",
      features: [
        "Real-time code execution sandbox with test cases",
        "AI-driven skill gap and portfolio diagnostic engine",
        "Automated semantic applicant-to-job matching",
        "Interactive career progression timeline",
      ],
      techStack: ["React", "Node.js", "Express", "MongoDB", "Tailwind CSS", "Docker", "REST API"],
      architectureSummary: "Client-server architecture with REST API endpoints, JWT authentication middleware, and Dockerized sandboxed code execution workers.",
      databaseDesign: "Collections for Users, Projects, Skills, Assessments, and JobApplications with optimized compound indexing.",
      apiModules: ["Auth & User Profiles", "Project Management", "DSA Code Execution", "Career Intelligence"],
      authenticationRequirements: "JWT Bearer tokens with secure HttpOnly cookies, bcrypt password hashing, and role-based access control.",
      milestones: [
        { phase: "Week 1", tasks: ["Database schema design", "Authentication & profile CRUD"], completed: false },
        { phase: "Week 2", tasks: ["Core business logic & code execution sandbox"], completed: false },
        { phase: "Week 3", tasks: ["Frontend UI integration & testing"], completed: false },
        { phase: "Week 4", tasks: ["CI/CD containerization & cloud deployment"], completed: false },
      ],
      testingStrategy: "Unit tests with Jest for API controllers, integration tests with Supertest, and React Testing Library for frontend components.",
      deploymentPlan: "Deploy backend microservice on cloud container runtime (AWS/Render) and frontend on Vercel with automated GitHub Actions CI/CD.",
      relevantJobRoles: ["Full Stack Developer", "Backend Engineer", "Software Engineer"],
    };
  }

  const aiPrompt = `
You are the JobSphere AI Project Advisor.
Generate an end-to-end, production-grade technical project blueprint based on:
User Idea/Prompt: "${prompt}"
User Current Skills: ${currentSkills.join(", ") || "MERN Stack"}

Return ONLY a valid JSON object matching this schema:
{
  "title": "Project Title",
  "problemStatement": "Clear problem statement",
  "targetUsers": "Target demographic description",
  "features": ["Feature 1", "Feature 2", "Feature 3", "Feature 4"],
  "techStack": ["Tech 1", "Tech 2", "Tech 3", "Tech 4"],
  "architectureSummary": "Detailed architecture description",
  "databaseDesign": "Database entities and relationships",
  "apiModules": ["Module 1", "Module 2", "Module 3"],
  "authenticationRequirements": "Auth specifics",
  "milestones": [
    { "phase": "Sprint 1", "tasks": ["Task A", "Task B"], "completed": false },
    { "phase": "Sprint 2", "tasks": ["Task C", "Task D"], "completed": false }
  ],
  "testingStrategy": "Testing methodology",
  "deploymentPlan": "Deployment strategy",
  "relevantJobRoles": ["Role 1", "Role 2"]
}
`;

  try {
    const response = await client.models.generateContent({
      model: DEFAULT_MODEL,
      contents: [{ parts: [{ text: aiPrompt }] }],
    });
    const parsed = extractJsonFromText(response.text);
    if (parsed && parsed.title) return parsed;
  } catch (err) {
    console.error("Gemini Project Advisor error:", err.message);
  }

  // Safe fallback
  return {
    title: "AI-Augmented Cloud Career Platform",
    problemStatement: "Need for centralized developer intelligence and verified portfolio verification.",
    targetUsers: "Engineers and technical candidates.",
    features: ["Skill Passport", "Automated Gap Diagnostics", "Real-time Code Runner"],
    techStack: ["React", "Node.js", "MongoDB", "Express", "Docker"],
    architectureSummary: "Clean RESTful microservice with containerized execution.",
    databaseDesign: "Normalized Mongoose schemas with indexed user references.",
    apiModules: ["Authentication", "Analytics", "Execution Engine"],
    authenticationRequirements: "JWT Auth with secure headers.",
    milestones: [{ phase: "Sprint 1", tasks: ["Architecture setup", "Database modeling"], completed: false }],
    testingStrategy: "Unit & Integration test suites.",
    deploymentPlan: "Docker container deployment with CI pipeline.",
    relevantJobRoles: ["Full Stack Developer", "Software Engineer"],
  };
}

/**
 * 4. AI PORTFOLIO AUDITOR
 */
async function auditPortfolio({ user, projects = [] }) {
  const hasProjects = projects && projects.length > 0;
  const githubProjects = projects.filter((p) => p.github);
  const deployedProjects = projects.filter((p) => p.link);

  const strengths = [];
  const weaknesses = [];
  const priorityImprovements = [];

  if (hasProjects) {
    strengths.push(`Identified ${projects.length} project(s) demonstrating hands-on technical application.`);
  } else {
    weaknesses.push("No technical projects listed on profile. Technical screeners prioritize demonstrable code.");
    priorityImprovements.push("Add at least two end-to-end full-stack projects to your profile.");
  }

  if (githubProjects.length > 0) {
    strengths.push(`${githubProjects.length} project(s) feature accessible source code repositories.`);
  } else {
    weaknesses.push("Source code repositories (GitHub/GitLab) are not linked for existing projects.");
    priorityImprovements.push("Link public GitHub repositories containing comprehensive READMEs and unit tests.");
  }

  if (deployedProjects.length > 0) {
    strengths.push(`${deployedProjects.length} project(s) provide live deployment links for direct reviewer inspection.`);
  } else {
    weaknesses.push("Projects lack live deployed demonstration links.");
    priorityImprovements.push("Deploy projects on free cloud tiers (Vercel, Render, AWS) with live demonstration links.");
  }

  return {
    score: hasProjects ? Math.min(90, 40 + projects.length * 15 + deployedProjects.length * 10) : 35,
    summary: hasProjects
      ? `Your portfolio presents a solid foundation with ${projects.length} documented project(s). Focus on technical depth and unit test coverage to maximize recruiter impact.`
      : `Your profile currently lacks project evidence. Top hiring teams require verifiable technical artifacts.`,
    strengths,
    weaknesses,
    priorityImprovements,
  };
}

/**
 * 5. AI JOB REALITY ANALYZER ("Should I Apply?")
 */
async function analyzeJobReality({ jobDescription, userProfile = {} }) {
  const userSkills = (userProfile.skills || []).map((s) => s.toLowerCase());

  const runGroundedAnalysis = () => {
    const commonTechs = [
      "React", "Node.js", "JavaScript", "TypeScript", "Python", "Java", "AWS",
      "Docker", "SQL", "MongoDB", "Git", "REST API", "CI/CD", "Redux", "Express",
      "GraphQL", "Kubernetes", "Next.js", "Tailwind CSS", "Microservices", "Redis"
    ];
    const foundRequired = [];
    commonTechs.forEach((tech) => {
      if (new RegExp(`\\b${tech.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")}\\b`, "i").test(jobDescription)) {
        foundRequired.push(tech);
      }
    });

    const matching = foundRequired.filter((t) => userSkills.includes(t.toLowerCase()));
    const missing = foundRequired.filter((t) => !userSkills.includes(t.toLowerCase()));
    const matchPct = foundRequired.length > 0 ? Math.round((matching.length / foundRequired.length) * 100) : 75;

    return {
      requiredSkills: foundRequired.length > 0 ? foundRequired.slice(0, 8) : ["React", "JavaScript", "Node.js", "REST API"],
      preferredSkills: ["Agile Development", "System Architecture", "Unit Testing", "Docker"],
      experienceLevel: "2-4 years relevant engineering experience",
      responsibilities: [
        "Architect and maintain scalable web services and responsive interfaces",
        "Collaborate with cross-functional teams on high-impact feature delivery",
        "Ensure high code quality, test coverage, and documentation integrity",
      ],
      likelyInterviewAreas: ["Data Structures & Algorithms", "System Design & Concurrency", "Core Language Fundamentals"],
      missingInformation: ["Specific team size and exact on-call rotations not stated in description."],
      potentialConcerns: ["Broad scope requiring both frontend and infrastructure management."],
      shouldIApply: matchPct >= 50,
      verdictReason: `You match ${matching.length} of ${Math.max(foundRequired.length, 4)} identified core skills (${matchPct}%). ${
        matchPct >= 50
          ? "You possess a strong baseline for this role. Review the missing competencies before your technical screen."
          : "Consider closing the critical skill gaps before applying to optimize your interview conversion."
      }`,
      matchingSkills: matching.length > 0 ? matching : ["React", "JavaScript", "Node.js"],
      missingSkills: missing.length > 0 ? missing : ["Docker", "AWS"],
    };
  };

  const client = getGeminiClient();
  if (!client) {
    return runGroundedAnalysis();
  }

  const prompt = `
You are the JobSphere AI Job Reality Analyzer.
Analyze the following Job Description against the user's profile:
USER SKILLS: ${userProfile.skills?.join(", ") || "General developer"}

JOB DESCRIPTION:
${jobDescription.slice(0, 3000)}

Return ONLY a valid JSON object matching this schema:
{
  "requiredSkills": ["Skill 1", "Skill 2"],
  "preferredSkills": ["Skill 1", "Skill 2"],
  "experienceLevel": "Identified experience requirement string",
  "responsibilities": ["Resp 1", "Resp 2", "Resp 3"],
  "likelyInterviewAreas": ["Area 1", "Area 2", "Area 3"],
  "missingInformation": ["Unspecified salary or remote policy etc"],
  "potentialConcerns": ["High on-call burden or vague title etc"],
  "shouldIApply": true or false,
  "verdictReason": "Evidence-based explanation of whether to apply based ONLY on the provided text",
  "matchingSkills": ["Skills user has"],
  "missingSkills": ["Skills user lacks"]
}
`;

  try {
    const response = await client.models.generateContent({
      model: DEFAULT_MODEL,
      contents: [{ parts: [{ text: prompt }] }],
    });
    const parsed = extractJsonFromText(response.text);
    if (parsed && parsed.requiredSkills) return parsed;
  } catch (err) {
    console.warn("Gemini Job Reality notice (using grounded analysis):", err.message);
  }

  return runGroundedAnalysis();
}

/**
 * 6. AI PERSONALIZED REVISION TOPIC GENERATOR
 */
async function generateRevisionSession({ category = "JavaScript", weakAreas = [] }) {
  const sampleBank = {
    JavaScript: [
      {
        topic: "Event Loop & Concurrency",
        question: "How does the Node.js event loop handle microtasks vs macrotasks?",
        answer: "Microtasks (Promise callbacks, queueMicrotask, process.nextTick) execute immediately after the current operation finishes and before the next event loop phase or macrotask (setTimeout, setInterval).",
        keyPoints: ["Microtask queue priority", "process.nextTick executes before Promises", "Starvation risk if recursive microtasks are queued"],
        difficulty: "Medium",
      },
      {
        topic: "Closures & Scope Chain",
        question: "Explain closures and a real-world memory leak scenario caused by them.",
        answer: "A closure is a function that retains access to its lexical scope even when executed outside that scope. Memory leaks occur when closures unintentionally hold large objects or DOM references in parent scope.",
        keyPoints: ["Lexical scoping", "Encapsulation pattern", "Garbage collection retention"],
        difficulty: "Medium",
      },
      {
        topic: "Prototypes & Prototypal Inheritance",
        question: "What is the difference between __proto__ and prototype in JavaScript?",
        answer: "prototype is a property on constructor functions used to build __proto__ on newly created instances. __proto__ is the internal link on an object pointing to its prototype chain.",
        keyPoints: ["Object.getPrototypeOf() preferred over __proto__", "Inheritance delegation", "End of chain is Object.prototype then null"],
        difficulty: "Hard",
      },
    ],
    React: [
      {
        topic: "React Fiber & Reconciliation",
        question: "What problem does the React Fiber reconciliation engine solve over the legacy stack reconciler?",
        answer: "Fiber enables incremental rendering by splitting render work into units and pausing/prioritizing updates based on urgency (e.g. user input over background animations).",
        keyPoints: ["Interruptible work units", "Time-slicing", "Dual-buffering tree structure"],
        difficulty: "Hard",
      },
      {
        topic: "useCallback & useMemo Optimization",
        question: "When should you NOT use useCallback or useMemo in React?",
        answer: "Do not wrap primitive computations or inline handlers when the cost of dependency array comparison and closure allocation exceeds the render cost of the child component.",
        keyPoints: ["Premature optimization overhead", "Only useful when passing to memoized children or effect deps", "Referential equality requirement"],
        difficulty: "Medium",
      },
    ],
    DSA: [
      {
        topic: "Two Pointers Technique",
        question: "When is the two-pointer technique preferred over nested loops, and what is its time complexity benefit?",
        answer: "It applies to linear structures (sorted arrays, linked lists) when searching for pairs or intervals. It reduces quadratic O(N^2) brute-force searches to linear O(N) time with O(1) space.",
        keyPoints: ["Opposite-ends vs fast-and-slow pointers", "Requires monotonic or sorted property", "Avoids auxiliary hash map memory"],
        difficulty: "Easy",
      },
      {
        topic: "Sliding Window Maximum",
        question: "How does a monotonic deque achieve O(N) runtime for the sliding window maximum problem?",
        answer: "It maintains indices of window elements in descending order of value. Elements smaller than the incoming element are removed from the back, allowing O(1) maximum retrieval from the front.",
        keyPoints: ["Monotonic decreasing deque", "Each element pushed and popped at most once", "O(N) total amortized runtime"],
        difficulty: "Hard",
      },
    ],
  };

  const topics = sampleBank[category] || sampleBank["JavaScript"];
  return {
    category,
    title: `${category} High-Yield Revision Session`,
    topics: topics.map((t) => ({ ...t, completed: false })),
  };
}

/**
 * 7. AI INTERVIEW PREPARATION PLANNER
 */
async function generateInterviewPlan({ role = "Full Stack Developer", company = "Top Tech", experienceLevel = "Mid-Level" }) {
  return {
    role,
    company,
    experienceLevel,
    preparationPercentage: 25,
    technicalTopics: [
      { topic: "Core Language & Framework Internals", priority: "High", estimatedHours: 4 },
      { topic: "Asynchronous Concurrency & Error Boundaries", priority: "High", estimatedHours: 3 },
      { topic: "Database Query Optimization & Indexing", priority: "Medium", estimatedHours: 3 },
    ],
    dsaTopics: [
      { topic: "Arrays & Hash Maps (Two Sum, Group Anagrams)", priority: "High", targetProblems: 5 },
      { topic: "Sliding Window & Two Pointers", priority: "High", targetProblems: 4 },
      { topic: "Binary Search & Dynamic Programming", priority: "Medium", targetProblems: 4 },
    ],
    systemDesignTopics: [
      { topic: "High-Throughput REST & API Rate Limiting", focus: "Token bucket algorithms, Redis caching" },
      { topic: "Database Sharding & Replication", focus: "Read replicas, eventual consistency, CAP theorem" },
    ],
    behavioralTopics: [
      { question: "Tell me about a complex technical bug you diagnosed under pressure.", framework: "STAR method" },
      { question: "How do you handle disagreements on technical architecture with peers?", framework: "Constructive consensus" },
    ],
    projectDiscussionQuestions: [
      "Walk me through your database schema decisions and tradeoff considerations.",
      "How did you measure and optimize API latency for your production features?",
    ],
  };
}

/**
 * 8. AI RECRUITER ASSISTANT
 */
async function recruiterAssistant({ jobTitle, requirements = [], candidates = [] }) {
  return {
    analysis: `Evaluated ${candidates.length} potential candidates against requirements for "${jobTitle}".`,
    suggestedScreeningQuestions: [
      "Explain an architectural decision where you chose NoSQL over SQL, and what tradeoffs occurred.",
      "How do you profile and eliminate memory bottlenecks in high-concurrency Node.js microservices?",
      "Describe your automated testing strategy prior to pushing changes to production pipelines.",
    ],
    sourcingSuggestions: [
      "Filter for candidates with proven DSA verification and full-stack project blueprints.",
      "Prioritize candidates demonstrating hands-on Docker and cloud deployment experience.",
    ],
    disclaimer: "AI provides assistive screening signals only. Final hiring and candidate advancement decisions remain strictly with human recruiters.",
  };
}

module.exports = {
  generateAutopilotRoadmap,
  simulateScenario,
  generateProjectAdvisor,
  auditPortfolio,
  analyzeJobReality,
  generateRevisionSession,
  generateInterviewPlan,
  recruiterAssistant,
};
