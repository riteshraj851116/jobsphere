// Lazy loaded inside extractTextFromBuffer to avoid serverless module load crashes


// Comprehensive skills dictionary
const SKILL_DICTIONARY = [
  "javascript", "typescript", "python", "java", "c++", "c#", "ruby", "php", "go", "golang", "rust", "scala", "swift", "kotlin",
  "react", "react.js", "reactjs", "next.js", "nextjs", "vue", "vue.js", "angular", "svelte", "redux", "zustand", "mobx",
  "html", "html5", "css", "css3", "sass", "scss", "tailwind", "tailwindcss", "bootstrap", "material-ui", "chakra-ui",
  "node.js", "nodejs", "express", "express.js", "nest.js", "nestjs", "fastify", "django", "flask", "fastapi", "spring", "spring boot",
  "mongodb", "mongoose", "sql", "mysql", "postgresql", "postgres", "sqlite", "redis", "cassandra", "dynamodb", "prisma", "sequelize",
  "rest", "rest api", "restful", "graphql", "grpc", "soap", "websockets", "socket.io", "jwt", "oauth",
  "docker", "kubernetes", "k8s", "aws", "amazon web services", "azure", "gcp", "google cloud", "ci/cd", "github actions", "jenkins", "terraform",
  "git", "github", "gitlab", "bitbucket", "jira", "agile", "scrum", "kanban",
  "jest", "mocha", "chai", "cypress", "playwright", "selenium", "unit testing", "tdd", "bdd",
  "linux", "bash", "shell scripting", "nginx", "apache", "serverless", "microservices", "system design", "data structures", "algorithms"
];

// Aliases mapping to standardize names
const SKILL_ALIASES = {
  "reactjs": "react",
  "react.js": "react",
  "nodejs": "node.js",
  "nextjs": "next.js",
  "expressjs": "express.js",
  "vuejs": "vue",
  "tailwindcss": "tailwind css",
  "postgres": "postgresql",
  "k8s": "kubernetes",
  "golang": "go",
  "ts": "typescript",
  "js": "javascript",
  "aws": "amazon web services"
};

// Common English stopwords to ignore in keyword extraction
const STOP_WORDS = new Set([
  "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are", "aren't",
  "as", "at", "be", "because", "been", "before", "being", "below", "between", "both", "but", "by", "can",
  "cannot", "could", "couldn't", "did", "didn't", "do", "does", "doesn't", "doing", "don't", "down", "during",
  "each", "few", "for", "from", "further", "had", "hadn't", "has", "hasn't", "have", "haven't", "having",
  "he", "he'd", "he'll", "he's", "her", "here", "here's", "hers", "herself", "him", "himself", "his", "how",
  "how's", "i", "i'd", "i'll", "i'm", "i've", "if", "in", "into", "is", "isn't", "it", "it's", "its", "itself",
  "let's", "me", "more", "most", "mustn't", "my", "myself", "no", "nor", "not", "of", "off", "on", "once",
  "only", "or", "other", "ought", "our", "ours", "ourselves", "out", "over", "own", "same", "shan't", "she",
  "she'd", "she'll", "she's", "should", "shouldn't", "so", "some", "such", "than", "that", "that's", "the",
  "their", "theirs", "them", "themselves", "then", "there", "there's", "these", "they", "they'd", "they'll",
  "they're", "they've", "this", "those", "through", "to", "too", "under", "until", "up", "very", "was", "wasn't",
  "we", "we'd", "we'll", "we're", "we've", "were", "weren't", "what", "what's", "when", "when's", "where",
  "where's", "which", "while", "who", "who's", "whom", "why", "why's", "with", "won't", "would", "wouldn't",
  "you", "you'd", "you'll", "you're", "you've", "your", "yours", "yourself", "yourselves", "will", "shall",
  "looking", "responsible", "join", "team", "work", "candidate", "role", "years", "experience", "required",
  "requirements", "responsibilities", "job", "ability", "strong", "good", "knowledge", "must", "plus"
]);

/**
 * Extract text from file buffer based on MIME type or filename
 */
const extractTextFromBuffer = async (buffer, mimetype, originalname = "") => {
  const isPdf =
    mimetype === "application/pdf" || originalname.toLowerCase().endsWith(".pdf");
  const isDocx =
    mimetype ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    mimetype === "application/msword" ||
    originalname.toLowerCase().endsWith(".docx") ||
    originalname.toLowerCase().endsWith(".doc");

  if (isPdf) {
    try {
      const pdfParse = require("pdf-parse");
      if (typeof pdfParse === "function") {
        const data = await pdfParse(buffer);
        if (data && data.text && data.text.trim().length > 0) {
          return data.text;
        }
      } else if (pdfParse && pdfParse.PDFParse) {
        const parser = new pdfParse.PDFParse({ data: buffer });
        const res = await parser.getText();
        const extracted = typeof res === "string" ? res : res?.text || "";
        if (extracted && extracted.trim().length > 0) {
          return extracted;
        }
      }
    } catch (err) {
      console.warn("pdf-parse notice:", err.message);
    }
    return buffer.toString("utf-8");
  } else if (isDocx) {
    try {
      const mammoth = require("mammoth");
      const result = await mammoth.extractRawText({ buffer });
      if (result && result.value && result.value.trim().length > 0) {
        return result.value;
      }
    } catch (err) {
      console.warn("mammoth notice:", err.message);
    }
    return buffer.toString("utf-8");
  } else {
    // Plain text decoding as fallback
    return buffer.toString("utf-8");
  }
};

/**
 * Clean & normalize text for analysis
 */
const normalizeText = (text) => {
  if (!text || typeof text !== "string") return "";
  return text
    .toLowerCase()
    .replace(/[^\w\s.#+-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

/**
 * Check if a skill or phrase is in text
 */
const hasKeyword = (text, keyword) => {
  const normalizedKeyword = keyword.toLowerCase().trim();
  const escaped = normalizedKeyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(^|[^a-zA-Z0-9_#+-])${escaped}([^a-zA-Z0-9_#+-]|$)`, "i");
  return regex.test(text);
};

/**
 * Extract technical skills present in text
 */
const extractSkills = (text) => {
  const normalized = normalizeText(text);
  const found = new Set();

  SKILL_DICTIONARY.forEach((skill) => {
    if (hasKeyword(normalized, skill)) {
      const canonical = SKILL_ALIASES[skill] || skill;
      found.add(canonical.toUpperCase());
    }
  });

  return Array.from(found);
};

/**
 * Extract significant keywords from job description
 */
const extractJobKeywords = (jobDescText, jobTitle = "") => {
  const fullText = `${jobTitle} ${jobDescText}`;
  const normalized = normalizeText(fullText);

  // 1. First get all technical skills
  const skills = extractSkills(normalized);

  // 2. Extract 2-word domain phrases & high-frequency nouns
  const words = normalized.split(/\s+/).filter((w) => w.length > 2 && !STOP_WORDS.has(w));
  const wordFreq = {};
  words.forEach((w) => {
    wordFreq[w] = (wordFreq[w] || 0) + 1;
  });

  const topWords = Object.entries(wordFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 25)
    .map(([w]) => w.toUpperCase());

  const combined = Array.from(new Set([...skills, ...topWords]));
  return combined.slice(0, 25);
};

/**
 * Detect presence of standard resume sections
 */
const detectSections = (resumeRawText) => {
  const text = resumeRawText.toLowerCase();

  const contactInfo =
    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(text) ||
    /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/.test(text) ||
    /linkedin\.com|github\.com/.test(text);

  const summary =
    /\b(summary|profile|about me|objective|professional summary|executive summary)\b/.test(
      text
    );

  const skills =
    /\b(skills|technical skills|technologies|proficiencies|tools|core competencies|expertise)\b/.test(
      text
    );

  const experience =
    /\b(experience|work experience|employment history|work history|professional experience|career)\b/.test(
      text
    );

  const education =
    /\b(education|academic background|academics|university|college|b\.?tech|b\.?e|b\.?s|m\.?s|degree|diploma)\b/.test(
      text
    );

  const projects =
    /\b(projects|personal projects|academic projects|key projects|open source|portfolio)\b/.test(
      text
    );

  return {
    contactInfo,
    summary,
    skills,
    experience,
    education,
    projects
  };
};

/**
 * Main ATS Scoring & Analysis Engine
 */
const analyzeResume = (resumeText, jobDescription, explicitRequiredSkills = [], jobTitle = "") => {
  const cleanResume = normalizeText(resumeText);
  const cleanJobDesc = normalizeText(jobDescription);

  // 1. Keyword & Skills Detection
  const jobKeywords = extractJobKeywords(jobDescription, jobTitle);
  const detectedResumeSkills = extractSkills(cleanResume);

  // Required skills: use explicit list if provided, otherwise extract from job description
  let requiredSkillsList = [];
  if (Array.isArray(explicitRequiredSkills) && explicitRequiredSkills.length > 0) {
    requiredSkillsList = explicitRequiredSkills.map((s) => s.trim().toUpperCase());
  } else {
    requiredSkillsList = extractSkills(cleanJobDesc);
  }

  // Deduplicate and fallback
  if (requiredSkillsList.length === 0) {
    requiredSkillsList = jobKeywords.slice(0, 8);
  }

  const matchedKeywords = [];
  const missingKeywords = [];

  jobKeywords.forEach((kw) => {
    if (hasKeyword(cleanResume, kw)) {
      matchedKeywords.push(kw);
    } else {
      missingKeywords.push(kw);
    }
  });

  const missingSkills = [];
  const matchedSkills = [];

  requiredSkillsList.forEach((skill) => {
    if (hasKeyword(cleanResume, skill) || detectedResumeSkills.includes(skill)) {
      matchedSkills.push(skill);
    } else {
      missingSkills.push(skill);
    }
  });

  // 2. Sections Analysis
  const sectionAnalysis = detectSections(resumeText);

  // =========================================================
  // SCORING CALCULATION (Total = 100)
  // =========================================================

  // 1. Keyword Match (Weight: 35)
  const kwMatchRatio = jobKeywords.length > 0 ? matchedKeywords.length / jobKeywords.length : 0.8;
  const keywordScore = Math.min(35, Math.round(kwMatchRatio * 35));

  // 2. Skills Match (Weight: 25)
  const skillsMatchRatio = requiredSkillsList.length > 0 ? matchedSkills.length / requiredSkillsList.length : 0.8;
  const skillsScore = Math.min(25, Math.round(skillsMatchRatio * 25));

  // 3. Experience Relevance (Weight: 20)
  let relevancePoints = 0;
  // Check if job title keywords appear in resume
  if (jobTitle) {
    const titleWords = jobTitle.toLowerCase().split(/\s+/).filter((w) => !STOP_WORDS.has(w));
    const titleMatchCount = titleWords.filter((w) => hasKeyword(cleanResume, w)).length;
    if (titleWords.length > 0) {
      relevancePoints += Math.round((titleMatchCount / titleWords.length) * 8);
    }
  } else {
    relevancePoints += 6;
  }

  // Action verbs (impact indicators)
  const actionVerbs = ["developed", "built", "engineered", "implemented", "designed", "created", "optimized", "managed", "led", "delivered", "deployed", "scaled", "automated"];
  const foundVerbs = actionVerbs.filter((v) => hasKeyword(cleanResume, v)).length;
  relevancePoints += Math.min(8, Math.round((foundVerbs / 5) * 8));

  // Metrics / Numbers (quantifiable achievements)
  const hasMetrics = /\b\d+(%|k|\+|ms|s|x|users|clients|requests|dollars|hours)\b/i.test(resumeText);
  if (hasMetrics) relevancePoints += 4;

  const experienceScore = Math.min(20, Math.max(0, relevancePoints));

  // 4. Resume Structure (Weight: 10)
  let structurePoints = 0;
  if (sectionAnalysis.contactInfo) structurePoints += 2;
  if (sectionAnalysis.summary) structurePoints += 1.5;
  if (sectionAnalysis.skills) structurePoints += 2;
  if (sectionAnalysis.experience) structurePoints += 2;
  if (sectionAnalysis.education) structurePoints += 1.5;
  if (sectionAnalysis.projects) structurePoints += 1;
  const structureScore = Math.min(10, Math.round(structurePoints));

  // 5. ATS Readability & Formatting (Weight: 10)
  let readabilityPoints = 0;
  const wordCount = resumeText.split(/\s+/).filter(Boolean).length;
  if (wordCount >= 250 && wordCount <= 1800) {
    readabilityPoints += 5;
  } else if (wordCount > 100) {
    readabilityPoints += 3;
  }

  // Clean formatting / clear lines / paragraphs
  const lineCount = resumeText.split("\n").filter((l) => l.trim().length > 0).length;
  if (lineCount >= 15) readabilityPoints += 3;
  if (readabilityPoints < 8 && resumeText.length > 300) readabilityPoints += 2;
  const atsReadabilityScore = Math.min(10, Math.max(0, readabilityPoints + 2));

  // Total Score (0 - 100)
  const totalScore = Math.min(
    100,
    Math.max(0, keywordScore + skillsScore + experienceScore + structureScore + atsReadabilityScore)
  );

  // =========================================================
  // ACTIONABLE IMPROVEMENT SUGGESTIONS
  // =========================================================
  const suggestions = [];

  if (missingSkills.length > 0) {
    const topMissing = missingSkills.slice(0, 3).join(", ");
    suggestions.push(
      `Consider incorporating experience with ${topMissing} if you have worked with these technologies, as they are central to the job requirements.`
    );
  }

  if (missingKeywords.length > 3) {
    suggestions.push(
      `Align your project and role bullet points to naturally reference keywords like "${missingKeywords.slice(0, 3).join('", "')}".`
    );
  }

  if (!sectionAnalysis.summary) {
    suggestions.push(
      "Add a 2-3 sentence Professional Summary at the top of your resume highlighting your core stack and key accomplishments."
    );
  }

  if (!sectionAnalysis.projects) {
    suggestions.push(
      "Include a dedicated 'Projects' section showcasing real-world applications, tools used, and links to live demos or GitHub repositories."
    );
  }

  if (!hasMetrics) {
    suggestions.push(
      "Quantify your accomplishments with measurable metrics (e.g., 'Improved API response time by 35%' or 'Handled 5,000+ daily active users')."
    );
  }

  if (wordCount < 300) {
    suggestions.push(
      "Your resume content is relatively brief. Provide more specific technical details regarding your responsibilities and architecture decisions."
    );
  } else if (wordCount > 1500) {
    suggestions.push(
      "Your resume is quite lengthy. Consider condensing earlier experiences to maintain a focused 1 to 2-page format."
    );
  }

  if (suggestions.length === 0) {
    suggestions.push(
      "Great job! Your resume demonstrates strong alignment with the job description. Ensure your contact details and portfolio links are up-to-date."
    );
  }

  return {
    atsScore: totalScore,
    scoreBreakdown: {
      keywordMatch: keywordScore,
      skillsMatch: skillsScore,
      experienceRelevance: experienceScore,
      resumeStructure: structureScore,
      atsReadability: atsReadabilityScore,
      total: totalScore
    },
    matchedKeywords,
    missingKeywords,
    detectedSkills: detectedResumeSkills,
    requiredSkills: requiredSkillsList,
    missingSkills,
    sectionAnalysis,
    suggestions
  };
};

module.exports = {
  extractTextFromBuffer,
  analyzeResume,
  normalizeText,
  extractSkills
};
