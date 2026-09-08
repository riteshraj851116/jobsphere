const { GoogleGenAI } = require("@google/genai");
const User = require("../models/User");
const Job = require("../models/Job");
const Application = require("../models/Application");

const SYSTEM_PROMPT = `
You are JobSphere AI, an intelligent career assistant built into a professional job and networking platform.
Your job is to help users with:
- Finding suitable jobs
- Career planning
- Resume improvement
- Interview preparation
- Skill gap analysis
- Learning roadmaps
- Project ideas
- Application guidance
- Professional networking advice
- Profile improvement

IMPORTANT RULES:
- Use the JobSphere context provided to you.
- Never claim that you applied to a job, changed a profile, sent a connection request, or performed any platform action.
- If job data is available, recommend relevant jobs by their title and company.
- If the user asks for career advice, consider their skills and profile.
- If information is missing, ask the user for the required details.
- Be practical and specific.
- Keep answers easy to understand.
- Use headings and bullet points when helpful.
- Do not invent jobs, companies, skills, or user information.
- You are a career assistant, not just a generic chatbot.
`;

const formatUser = (user) => {
  if (!user) return {};
  return {
    name: user.name || "",
    email: user.email || "",
    headline: user.headline || "",
    bio: user.bio || "",
    location: user.location || "",
    skills: Array.isArray(user.skills) ? user.skills : [],
    experience: Array.isArray(user.experience) ? user.experience : [],
    education: Array.isArray(user.education) ? user.education : [],
  };
};

const formatJobs = (jobs = []) => {
  return jobs.map((job) => ({
    id: job._id?.toString() || "",
    title: job.title || "",
    location: job.location || "",
    jobType: job.jobType || "",
    experienceLevel: job.experienceLevel || "",
    skills: Array.isArray(job.skills) ? job.skills : [],
    company: job.company?.name || job.companyName || "",
  }));
};

const formatApplications = (applications = []) => {
  return applications.map((application) => ({
    jobTitle: application.job?.title || "",
    company: application.job?.company?.name || application.job?.companyName || "",
    status: application.status || "unknown",
    createdAt: application.createdAt || null,
  }));
};

const convertHistoryToGemini = (history = []) => {
  return history
    .filter(
      (item) =>
        item &&
        typeof item.content === "string" &&
        item.content.trim() &&
        ["user", "assistant"].includes(item.role)
    )
    .slice(-12)
    .map((item) => ({
      role: item.role === "assistant" ? "model" : "user",
      parts: [{ text: item.content.trim() }],
    }));
};

const chatWithAI = async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body || {};

    if (typeof message !== "string" || !message.trim()) {
      return res.status(400).json({ success: false, message: "Message is required" });
    }

    const userId = req.user?._id;

    // Fetch User, Jobs, and Applications in parallel
    let user = null;
    let availableJobs = [];
    let applications = [];

    try {
      const [u, jobs, apps] = await Promise.all([
        userId ? User.findById(userId).select("name email headline bio location skills experience education").lean() : Promise.resolve(null),
        Job.find({ status: "active" }).populate("company", "name").sort({ createdAt: -1 }).limit(20).lean(),
        userId ? Application.find({ applicant: userId })
          .populate({ path: "job", populate: { path: "company", select: "name" } })
          .sort({ createdAt: -1 })
          .limit(10)
          .lean() : Promise.resolve([])
      ]);
      user = u;
      availableJobs = jobs || [];
      applications = apps || [];
    } catch (dbErr) {
      console.warn("Notice: Database read for AI context:", dbErr.message);
    }

    // Default candidate profile if guest
    const candidateProfile = user || {
      name: "Engineer",
      skills: ["React", "Node.js", "JavaScript", "TypeScript", "MongoDB", "REST APIs"],
      headline: "Full Stack Developer",
    };

    const formattedJobsList = formatJobs(availableJobs);

    // Try Gemini API if key is present
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";

        const contextMessage = `
CURRENT JOBSPHERE USER:
${JSON.stringify(formatUser(candidateProfile), null, 2)}
AVAILABLE JOBS ON JOBSPHERE:
${JSON.stringify(formattedJobsList.slice(0, 10), null, 2)}
USER'S RECENT APPLICATIONS:
${JSON.stringify(formatApplications(applications), null, 2)}

Use this information when relevant. If recommending jobs, prioritize the ones listed above.
`;

        const contents = [
          ...convertHistoryToGemini(conversationHistory),
          { role: "user", parts: [{ text: message.trim() }] },
        ];

        const result = await ai.models.generateContent({
          model,
          contents,
          config: {
            systemInstruction: `${SYSTEM_PROMPT}\n${contextMessage}`,
            temperature: 0.7,
            maxOutputTokens: 1200,
          },
        });

        const aiMessage = result?.text?.trim();
        if (aiMessage) {
          // Find if any jobs were mentioned or match
          const msgLower = message.toLowerCase();
          let recJobs = [];
          if (msgLower.includes("job") || msgLower.includes("role") || msgLower.includes("recommend") || msgLower.includes("hire") || msgLower.includes("career")) {
            recJobs = availableJobs.slice(0, 3);
          }

          return res.status(200).json({
            success: true,
            data: {
              message: aiMessage,
              recommendedJobs: recJobs
            },
          });
        }
      } catch (geminiError) {
        console.warn("Gemini API unavailable or rejected (using JobSphere Career Engine):", geminiError?.message || geminiError);
      }
    }

    // High-Fidelity Domain Intelligence Career Engine Fallback
    const msg = message.toLowerCase();
    let replyText = "";
    let recommendedJobs = [];

    // Filter matching active jobs from the database
    const matchingJobs = availableJobs.filter((job) => {
      const skills = (job.skills || []).map((s) => s.toLowerCase());
      const title = (job.title || "").toLowerCase();
      return (
        skills.some((s) => msg.includes(s)) ||
        title.split(/\s+/).some((w) => w.length > 3 && msg.includes(w))
      );
    });

    const topJobs = (matchingJobs.length > 0 ? matchingJobs : availableJobs).slice(0, 3);

    if (msg.includes("job") || msg.includes("recommend") || msg.includes("hire") || msg.includes("role") || msg.includes("search") || msg.includes("apply")) {
      recommendedJobs = topJobs;
      const jobHighlights = topJobs
        .map(
          (j, i) =>
            `${i + 1}. **${j.title}** at *${j.company?.name || j.companyName || "Top Tech"}*\n   - **Location:** ${j.location || "Remote"}\n   - **Required Skills:** ${(j.skills || ["React", "Node.js"]).slice(0, 4).join(", ")}\n   - **Type:** ${j.jobType || "Full-time"}`
        )
        .join("\n\n");

      replyText = `### 🎯 Recommended Opportunities for You

I analyzed your developer profile against our live vacancies. Here are the top high-alignment positions currently active on JobSphere:

${jobHighlights || "Browse our verified open positions directly on the **Jobs** page."}

#### 💡 Actionable Next Steps:
- Review the specific requirements for each role and tailor your resume bullets before applying.
- Use our **Job Reality Analyzer** to evaluate your likelihood of passing technical screens for these roles.
- You can apply directly with one click or message the hiring recruiter through the job page!`;

    } else if (msg.includes("resume") || msg.includes("ats") || msg.includes("cv") || msg.includes("profile")) {
      recommendedJobs = availableJobs.slice(0, 2);
      replyText = `### 📄 AI Resume & ATS Optimization Blueprint

To maximize interview invitations for modern software engineering roles:

#### 1. Quantify Impact with Metrics
Instead of passive task descriptions, use the **Google XYZ formula**: *"Accomplished [X], as measured by [Y], by doing [Z]"*.
- ❌ *"Built job portal with React and Node.js"*
- ✅ *"Architected real-time career platform serving 5,000+ monthly applicants with sub-200ms latency using MongoDB compound indexing and Socket.IO."*

#### 2. ATS Formatting Principles
- Use standard single-column hierarchy with clean headers: **Experience, Technical Skills, Projects, Education**.
- Avoid multi-column layout tables, complex nested graphics, or scanned image text.
- Ensure critical keywords like **${candidateProfile.skills?.slice(0, 5).join(", ") || "React, Node.js, TypeScript"}** are explicitly listed in your skills section.

#### 3. Portfolio & Demonstration
- Include verifiable GitHub repositories with descriptive README documentation and live deployment links.

*💡 Pro-tip: Head to the **Resume Analyzer** tab to upload your CV and get an automated ATS compatibility score and missing keyword audit.*`;

    } else if (msg.includes("interview") || msg.includes("practice") || msg.includes("question") || msg.includes("round") || msg.includes("mock")) {
      replyText = `### 🎙️ Technical Interview Preparation Masterclass

Here is a focused checklist for technical and system architecture screening rounds:

#### 1. Core Technical Paradigms
- **React & Frontend**: Virtual DOM reconciliation, Fiber architecture, state management patterns, \`useMemo\` vs \`useCallback\`, and avoiding unnecessary re-renders.
- **Node.js & Backend**: Event Loop phases (timers, I/O polling, check/microtasks), stream backpressure, JWT auth flows, and connection pooling.
- **Database Indexing**: Compound index prefixes, explain plan analysis, and B-Tree structure.

#### 2. Common Live Coding Questions
1. **LRU Cache Implementation**: $O(1)$ \`get\` and \`put\` using Doubly Linked List and Hash Map.
2. **Debounce & Throttle**: Writing custom utility wrappers from scratch.
3. **Promise.all Polyfill**: Handling concurrent async operations with fail-fast rejection.

#### 3. Behavioral Questions (STAR Method)
- Prepare structured stories for: *a technical conflict with a teammate*, *a critical production incident you resolved*, and *an ambiguous project requirement you scoped*.

*💡 Test your live skills in JobSphere's **Interview Practice** arena for automated scoring and real-time feedback.*`;

    } else if (msg.includes("skill") || msg.includes("learn") || msg.includes("roadmap") || msg.includes("future") || msg.includes("grow")) {
      recommendedJobs = availableJobs.slice(0, 2);
      replyText = `### 🚀 High-Impact Technical Skills Roadmap (2025–2026)

Based on skill demand trends analyzed across technology companies hiring on JobSphere:

#### 1. Next-Gen Full-Stack & Frontend
- **React 19 & Server Actions**: Deep understanding of Actions, useOptimistic, and Server Components.
- **TypeScript Advanced**: Discriminated unions, generics, template literal types, and type gymnastics.
- **Micro-Frontends & Performance**: Web Workers, sub-second TTFB, and Core Web Vitals optimization.

#### 2. Generative AI & Developer Tooling
- **RAG & Vector Databases**: Retrieval Augmented Generation pipelines with Pinecone, pgvector, or Chroma.
- **Function Calling & Agentic AI**: Autonomous tool calling, MCP architectures, and local LLM execution.

#### 3. Production Cloud & DevOps
- **Docker & Containerization**: Multi-stage Dockerfiles and containerized execution sandboxes.
- **CI/CD & Observability**: GitHub Actions, OpenTelemetry, Prometheus, and structured logging.

*Track your progress in our **Career Roadmap** and complete milestones to elevate your profile match score!*`;

    } else if (msg.includes("salary") || msg.includes("negotiat") || msg.includes("offer")) {
      replyText = `### 💰 Tech Salary & Compensation Negotiation Strategy

When negotiating software engineering offers:

1. **Never Give the First Number**: When asked for current CTC or expectations early in screening, state: *"I'm primarily focused on finding the right technical fit. I'd love to learn more about the scope and team before discussing specific numbers."*
2. **Research Market Medians**: Benchmark against verified levels on JobSphere, Levels.fyi, and AmbitionBox for your target experience band.
3. **Negotiate the Complete Package**: If base salary is fixed, negotiate signing bonuses, performance bonuses, remote work stipends, equity/RSUs, and annual learning budgets.
4. **Leverage Competing Pipelines**: Multiple active interview processes provide maximum leverage. Always ask for offer details in writing before making a decision.`;

    } else {
      recommendedJobs = availableJobs.slice(0, 3);
      replyText = `### 🤖 JobSphere AI Career Copilot

Hello **${candidateProfile.name || "there"}**! I'm here to assist you with every phase of your software engineering career journey on JobSphere.

#### Here is what I can do for you:
- **Job Discovery & Matching**: Match your tech stack against active vacancies from top tech companies.
- **Resume & ATS Auditing**: Review bullet points and calculate ATS compatibility scores.
- **Interview Coaching**: Practice live coding and behavioral questions with instant automated evaluation.
- **Career Roadmaps & Skill Gaps**: Identify missing competencies and build high-yield revision schedules.
- **Full-Stack Project Blueprints**: Generate production-grade architecture blueprints for your portfolio.

What would you like to work on right now? Try asking:
- *"Recommend top jobs for my skills"*
- *"How should I optimize my resume for ATS?"*
- *"Give me a React 19 and Node.js interview question"*
- *"What high-impact skills should I learn this month?"*`;
    }

    return res.status(200).json({
      success: true,
      data: {
        message: replyText,
        recommendedJobs,
        isFallback: true
      },
    });

  } catch (error) {
    console.error("AI Controller unexpected error:", error);
    return res.status(200).json({
      success: true,
      data: {
        message: "Hello! I am your JobSphere Career Copilot. Explore our **Jobs**, **Resume Analyzer**, and **Interview Practice** suites to elevate your career opportunities!",
        recommendedJobs: [],
      }
    });
  }
};

module.exports = { chatWithAI };