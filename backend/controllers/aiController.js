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

    if (!req.user?._id) {
      return res.status(401).json({ success: false, message: "Authentication required. Please login first." });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.error("GEMINI_API_KEY is missing from backend .env");
      return res.status(500).json({
        success: false,
        message: "AI service is not configured. Please configure GEMINI_API_KEY in the backend .env file.",
      });
    }

    const userId = req.user._id;

    // Fetch User, Jobs, and Applications in parallel
    const [user, availableJobs, applications] = await Promise.all([
      User.findById(userId).select("name email headline bio location skills experience education").lean(),
      Job.find({ status: "active" }).populate("company", "name").sort({ createdAt: -1 }).limit(20).lean(),
      Application.find({ applicant: userId })
        .populate({ path: "job", populate: { path: "company", select: "name" } })
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
    ]);

    const contextMessage = `
CURRENT JOBSPHERE USER:
${JSON.stringify(formatUser(user), null, 2)}
AVAILABLE JOBS ON JOBSPHERE:
${JSON.stringify(formatJobs(availableJobs), null, 2)}
USER'S RECENT APPLICATIONS:
${JSON.stringify(formatApplications(applications), null, 2)}

Use this information only when relevant. If no suitable job exists in the available jobs, say that clearly instead of inventing one.
`;

    const ai = new GoogleGenAI({ apiKey });
    const model = process.env.GEMINI_MODEL || "gemini-3.6-flash";

    // ✅ Contents ab sirf valid User aur Model history carry karega
    const contents = [
      ...convertHistoryToGemini(conversationHistory),
      { role: "user", parts: [{ text: message.trim() }] },
    ];

    console.log(`Gemini request started | model=${model} | user=${userId}`);

    const result = await ai.models.generateContent({
      model,
      contents,
      config: {
        systemInstruction: `${SYSTEM_PROMPT}\n${contextMessage}`, // ✅ System prompt sahi jagah place kiya
        temperature: 0.7,
        maxOutputTokens: 1200,
      },
    });

    const aiMessage = result?.text?.trim() || "Sorry, I could not generate a response right now.";

    console.log(`Gemini request completed | user=${userId}`);

    return res.status(200).json({
      success: true,
      data: { message: aiMessage },
    });

  } catch (error) {
    console.warn("Gemini AI API notice (providing intelligent fallback):", error?.message || error);

    const msg = String(req.body?.message || "").toLowerCase();
    let fallbackText = "Hello! I am your JobSphere Career Assistant. I can help you discover matching jobs, prepare for interviews, and optimize your profile for top tech roles.";

    if (msg.includes("job") || msg.includes("recommend") || msg.includes("role") || msg.includes("search")) {
      fallbackText = "Looking for your next role? Browse our curated positions on the **Jobs** page! You can filter by experience level and tech stack, and check your real-time **Match Score** on each job card.";
    } else if (msg.includes("interview") || msg.includes("practice") || msg.includes("question")) {
      fallbackText = "Head over to our **Interview Practice** suite! You can choose your role (Frontend, Backend, MERN, HR), practice answering live questions, and receive automated evaluation scores and tips.";
    } else if (msg.includes("resume") || msg.includes("ats") || msg.includes("cv")) {
      fallbackText = "Upload or paste your CV into our **Resume Analyzer** to get instant ATS compatibility scoring, keyword analysis, and actionable bullet-point enhancements.";
    } else if (msg.includes("skill") || msg.includes("roadmap") || msg.includes("learn")) {
      fallbackText = "Visit the **Career Roadmap** and **Skill Gap Analyzer** tools to track required competencies for Junior, Mid, and Senior engineers, and track your milestone completions.";
    }

    return res.status(200).json({
      success: true,
      data: {
        message: fallbackText,
        isFallback: true
      }
    });
  }
};

module.exports = { chatWithAI };