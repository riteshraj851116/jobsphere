import api from "./api";

// ============================================================
// OFFLINE FALLBACK QUESTIONS
// ============================================================
const OFFLINE_QUESTIONS = {
  "MERN Stack Developer": {
    easy: [
      { _id: "mern-e1", text: "What does MERN stand for?", category: "MERN Stack", difficulty: "easy", role: "MERN Stack Developer", sampleAnswer: "MongoDB, Express.js, React.js, Node.js" },
      { _id: "mern-e2", text: "What is MongoDB and when would you use it?", category: "MongoDB", difficulty: "easy", role: "MERN Stack Developer", sampleAnswer: "MongoDB is a NoSQL database that stores data in flexible, JSON-like documents." },
      { _id: "mern-e3", text: "What is Express.js used for in a MERN application?", category: "Node.js", difficulty: "easy", role: "MERN Stack Developer", sampleAnswer: "Express.js is a minimal web framework for Node.js used to build REST APIs." },
      { _id: "mern-e4", text: "What is JSX in React?", category: "React", difficulty: "easy", role: "MERN Stack Developer", sampleAnswer: "JSX is a syntax extension that allows writing HTML-like markup inside JavaScript." },
      { _id: "mern-e5", text: "What is npm and how do you use it?", category: "MERN Stack", difficulty: "easy", role: "MERN Stack Developer", sampleAnswer: "npm is the Node Package Manager for installing and managing JavaScript libraries." }
    ],
    medium: [
      { _id: "mern-m1", text: "Explain the React component lifecycle and when to use useEffect.", category: "React", difficulty: "medium", role: "MERN Stack Developer", sampleAnswer: "useEffect runs after render and is used for side effects like API calls, subscriptions, and DOM mutations." },
      { _id: "mern-m2", text: "How does JWT authentication work in a MERN app?", category: "Node.js", difficulty: "medium", role: "MERN Stack Developer", sampleAnswer: "JWT tokens are signed by the server and sent to the client. The client sends the token in headers for protected routes." },
      { _id: "mern-m3", text: "What are React hooks and why were they introduced?", category: "React", difficulty: "medium", role: "MERN Stack Developer", sampleAnswer: "Hooks let you use state and lifecycle features without writing class components." },
      { _id: "mern-m4", text: "Explain RESTful API design principles.", category: "Node.js", difficulty: "medium", role: "MERN Stack Developer", sampleAnswer: "REST uses HTTP methods (GET, POST, PUT, DELETE), stateless communication, and resource-based URLs." },
      { _id: "mern-m5", text: "What is the difference between SQL and NoSQL databases?", category: "MongoDB", difficulty: "medium", role: "MERN Stack Developer", sampleAnswer: "SQL uses structured tables with fixed schemas, while NoSQL uses flexible document/key-value/graph structures." },
      { _id: "mern-m6", text: "How does React's virtual DOM work?", category: "React", difficulty: "medium", role: "MERN Stack Developer", sampleAnswer: "React creates a virtual representation of the DOM and uses diffing to minimize expensive DOM updates." },
      { _id: "mern-m7", text: "Explain middleware in Express.js.", category: "Node.js", difficulty: "medium", role: "MERN Stack Developer", sampleAnswer: "Middleware functions execute during request-response cycle and have access to req, res, and next()." },
      { _id: "mern-m8", text: "What is the useState hook and how does it differ from a class component's this.state?", category: "React", difficulty: "medium", role: "MERN Stack Developer", sampleAnswer: "useState is a hook that returns a state value and setter function; class components use this.state." },
      { _id: "mern-m9", text: "How do you handle errors in async/await Node.js functions?", category: "Node.js", difficulty: "medium", role: "MERN Stack Developer", sampleAnswer: "Wrap async calls in try/catch blocks and use global error middleware in Express." },
      { _id: "mern-m10", text: "What is Mongoose and what problems does it solve?", category: "MongoDB", difficulty: "medium", role: "MERN Stack Developer", sampleAnswer: "Mongoose provides schema validation, middleware, and query helpers for MongoDB in Node.js." }
    ],
    hard: [
      { _id: "mern-h1", text: "How would you optimize MongoDB queries for large datasets?", category: "MongoDB", difficulty: "hard", role: "MERN Stack Developer", sampleAnswer: "Use indexes, aggregation pipelines, projection to limit fields, and avoid $where queries." },
      { _id: "mern-h2", text: "Explain React's reconciliation algorithm and how it affects performance.", category: "React", difficulty: "hard", role: "MERN Stack Developer", sampleAnswer: "React uses a diffing algorithm that compares virtual DOM trees to minimize DOM updates using key props." },
      { _id: "mern-h3", text: "How would you implement real-time features in a MERN app?", category: "MERN Stack", difficulty: "hard", role: "MERN Stack Developer", sampleAnswer: "Use Socket.IO for bidirectional communication or Server-Sent Events for one-way real-time updates." },
      { _id: "mern-h4", text: "Describe a strategy for scaling a MERN application.", category: "MERN Stack", difficulty: "hard", role: "MERN Stack Developer", sampleAnswer: "Use load balancers, horizontal scaling, Redis for caching, MongoDB Atlas for managed scaling, and microservices." },
      { _id: "mern-h5", text: "How do you prevent common security vulnerabilities in a Node.js API?", category: "Node.js", difficulty: "hard", role: "MERN Stack Developer", sampleAnswer: "Use helmet.js, rate limiting, input sanitization, parameterized queries, and HTTPS." }
    ]
  },
  "Frontend Developer": {
    easy: [
      { _id: "fe-e1", text: "What is the difference between HTML and HTML5?", category: "Frontend", difficulty: "easy", role: "Frontend Developer", sampleAnswer: "HTML5 added semantic elements, audio/video support, Canvas API, Web Storage, and removed deprecated tags." },
      { _id: "fe-e2", text: "What is the CSS box model?", category: "Frontend", difficulty: "easy", role: "Frontend Developer", sampleAnswer: "The box model includes content, padding, border, and margin around every element." },
      { _id: "fe-e3", text: "What is responsive design?", category: "Frontend", difficulty: "easy", role: "Frontend Developer", sampleAnswer: "Responsive design adapts layouts to different screen sizes using media queries and flexible grids." },
      { _id: "fe-e4", text: "What is the difference between inline and block elements?", category: "Frontend", difficulty: "easy", role: "Frontend Developer", sampleAnswer: "Block elements start on a new line and take full width; inline elements flow within text." },
      { _id: "fe-e5", text: "What are semantic HTML elements?", category: "Frontend", difficulty: "easy", role: "Frontend Developer", sampleAnswer: "Semantic elements like header, nav, main, article, and footer describe content meaning." }
    ],
    medium: [
      { _id: "fe-m1", text: "Explain CSS Flexbox and its main properties.", category: "Frontend", difficulty: "medium", role: "Frontend Developer", sampleAnswer: "Flexbox is a 1D layout model with properties like flex-direction, justify-content, align-items, and flex-wrap." },
      { _id: "fe-m2", text: "What is the event delegation pattern in JavaScript?", category: "Frontend", difficulty: "medium", role: "Frontend Developer", sampleAnswer: "Event delegation attaches a single listener to a parent element to handle events from child elements using bubbling." },
      { _id: "fe-m3", text: "Explain closures in JavaScript.", category: "Frontend", difficulty: "medium", role: "Frontend Developer", sampleAnswer: "A closure is a function that retains access to its outer scope variables even after the outer function returns." },
      { _id: "fe-m4", text: "What are CSS Grid and how does it differ from Flexbox?", category: "Frontend", difficulty: "medium", role: "Frontend Developer", sampleAnswer: "CSS Grid is a 2D layout system; Flexbox is 1D. Grid controls both rows and columns simultaneously." },
      { _id: "fe-m5", text: "What is the difference between == and === in JavaScript?", category: "Frontend", difficulty: "medium", role: "Frontend Developer", sampleAnswer: "== does type coercion before comparison; === compares both value and type strictly." }
    ],
    hard: [
      { _id: "fe-h1", text: "How do you optimize a website's Core Web Vitals?", category: "Frontend", difficulty: "hard", role: "Frontend Developer", sampleAnswer: "Optimize LCP with image preloading, FID by reducing JavaScript blocking, and CLS by reserving space for images." },
      { _id: "fe-h2", text: "Explain the Critical Rendering Path and how to optimize it.", category: "Frontend", difficulty: "hard", role: "Frontend Developer", sampleAnswer: "Minimize render-blocking resources, defer non-critical JS, inline critical CSS, and use resource hints." },
      { _id: "fe-h3", text: "How would you implement lazy loading for a long list of items?", category: "Frontend", difficulty: "hard", role: "Frontend Developer", sampleAnswer: "Use Intersection Observer API or virtualization libraries like react-window to render only visible items." }
    ]
  },
  "React Developer": {
    easy: [
      { _id: "rd-e1", text: "What is the purpose of key prop in React lists?", category: "React", difficulty: "easy", role: "React Developer", sampleAnswer: "Keys help React identify which items have changed, are added, or are removed for efficient rendering." },
      { _id: "rd-e2", text: "What are React props?", category: "React", difficulty: "easy", role: "React Developer", sampleAnswer: "Props are read-only data passed from parent to child components to configure their behavior." },
      { _id: "rd-e3", text: "What is the difference between controlled and uncontrolled components?", category: "React", difficulty: "easy", role: "React Developer", sampleAnswer: "Controlled components have their state managed by React; uncontrolled components rely on DOM refs." }
    ],
    medium: [
      { _id: "rd-m1", text: "When would you use useCallback vs useMemo?", category: "React", difficulty: "medium", role: "React Developer", sampleAnswer: "useCallback memoizes functions; useMemo memoizes computed values. Both prevent unnecessary re-renders." },
      { _id: "rd-m2", text: "Explain the React Context API and when to use it.", category: "React", difficulty: "medium", role: "React Developer", sampleAnswer: "Context API provides global state without prop drilling, ideal for themes, auth, and language settings." },
      { _id: "rd-m3", text: "How do you handle side effects in React?", category: "React", difficulty: "medium", role: "React Developer", sampleAnswer: "Use useEffect for API calls, subscriptions, and DOM mutations, with proper cleanup in the return function." },
      { _id: "rd-m4", text: "What is React.memo and when should you use it?", category: "React", difficulty: "medium", role: "React Developer", sampleAnswer: "React.memo is a HOC that prevents re-renders if props haven't changed, useful for expensive pure components." },
      { _id: "rd-m5", text: "Explain code splitting in React.", category: "React", difficulty: "medium", role: "React Developer", sampleAnswer: "Use React.lazy and Suspense with dynamic import() to split bundles and load components on demand." }
    ],
    hard: [
      { _id: "rd-h1", text: "Explain React's Fiber architecture.", category: "React", difficulty: "hard", role: "React Developer", sampleAnswer: "Fiber is React's reconciliation engine that supports incremental rendering and prioritizes urgent updates." },
      { _id: "rd-h2", text: "How would you build a custom hooks library?", category: "React", difficulty: "hard", role: "React Developer", sampleAnswer: "Extract reusable logic into functions starting with 'use', compose built-in hooks, and expose clean APIs." }
    ]
  },
  "Backend Developer": {
    easy: [
      { _id: "be-e1", text: "What is REST and what are its principles?", category: "Backend", difficulty: "easy", role: "Backend Developer", sampleAnswer: "REST uses stateless communication, resource-based URLs, HTTP methods, and uniform interfaces." },
      { _id: "be-e2", text: "What is the difference between GET and POST HTTP methods?", category: "Backend", difficulty: "easy", role: "Backend Developer", sampleAnswer: "GET retrieves data and is idempotent; POST sends data to create resources and may have side effects." }
    ],
    medium: [
      { _id: "be-m1", text: "How do you implement authentication vs authorization?", category: "Backend", difficulty: "medium", role: "Backend Developer", sampleAnswer: "Authentication verifies identity (who you are); authorization determines permissions (what you can do)." },
      { _id: "be-m2", text: "Explain database indexing and its trade-offs.", category: "Backend", difficulty: "medium", role: "Backend Developer", sampleAnswer: "Indexes speed up reads but slow down writes and use storage. Index columns used in WHERE, JOIN, and ORDER BY." },
      { _id: "be-m3", text: "What is rate limiting and why is it important?", category: "Backend", difficulty: "medium", role: "Backend Developer", sampleAnswer: "Rate limiting controls request frequency to prevent abuse, DDoS attacks, and fair resource allocation." }
    ],
    hard: [
      { _id: "be-h1", text: "Explain microservices architecture vs monolithic architecture.", category: "Backend", difficulty: "hard", role: "Backend Developer", sampleAnswer: "Microservices split application into independent deployable services; monoliths are single deployments easier to develop initially." },
      { _id: "be-h2", text: "How would you design a caching strategy for a high-traffic API?", category: "Backend", difficulty: "hard", role: "Backend Developer", sampleAnswer: "Use Redis for server-side caching, CDN for static assets, HTTP Cache-Control headers, and cache invalidation strategies." }
    ]
  },
  "JavaScript Developer": {
    easy: [
      { _id: "js-e1", text: "What is hoisting in JavaScript?", category: "JavaScript", difficulty: "easy", role: "JavaScript Developer", sampleAnswer: "Hoisting moves variable and function declarations to the top of their scope before execution." },
      { _id: "js-e2", text: "What is the difference between let, const, and var?", category: "JavaScript", difficulty: "easy", role: "JavaScript Developer", sampleAnswer: "var is function-scoped and hoisted; let and const are block-scoped. const cannot be reassigned." }
    ],
    medium: [
      { _id: "js-m1", text: "Explain the event loop in JavaScript.", category: "JavaScript", difficulty: "medium", role: "JavaScript Developer", sampleAnswer: "The event loop handles asynchronous operations by continuously checking the call stack and task queue." },
      { _id: "js-m2", text: "What is prototypal inheritance?", category: "JavaScript", difficulty: "medium", role: "JavaScript Developer", sampleAnswer: "Objects inherit from other objects via the prototype chain, giving access to shared methods and properties." },
      { _id: "js-m3", text: "What are Promises and how do they work?", category: "JavaScript", difficulty: "medium", role: "JavaScript Developer", sampleAnswer: "Promises represent eventual completion/failure of async operations with then(), catch(), and finally() handlers." }
    ],
    hard: [
      { _id: "js-h1", text: "Explain memory management and garbage collection in JavaScript.", category: "JavaScript", difficulty: "hard", role: "JavaScript Developer", sampleAnswer: "JS uses mark-and-sweep GC; avoid memory leaks by clearing intervals, removing listeners, and avoiding circular refs." },
      { _id: "js-h2", text: "What are generators and iterators in JavaScript?", category: "JavaScript", difficulty: "hard", role: "JavaScript Developer", sampleAnswer: "Generators are functions that yield values one at a time using function* and yield, enabling lazy evaluation." }
    ]
  },
  "HR Interview": {
    easy: [
      { _id: "hr-e1", text: "Tell me about yourself.", category: "HR", difficulty: "easy", role: "HR Interview", sampleAnswer: "Briefly mention your background, key skills, major projects, and why you're interested in this role." },
      { _id: "hr-e2", text: "Why do you want to work here?", category: "HR", difficulty: "easy", role: "HR Interview", sampleAnswer: "Research the company's mission, products, and culture. Align your goals with their vision." }
    ],
    medium: [
      { _id: "hr-m1", text: "Describe a challenging project you worked on and how you overcame obstacles.", category: "HR", difficulty: "medium", role: "HR Interview", sampleAnswer: "Use the STAR method: Situation, Task, Action, Result. Focus on what you learned." },
      { _id: "hr-m2", text: "How do you handle conflicts with teammates?", category: "HR", difficulty: "medium", role: "HR Interview", sampleAnswer: "Describe listening actively, finding common ground, and resolving professionally with empathy." },
      { _id: "hr-m3", text: "Where do you see yourself in 5 years?", category: "HR", difficulty: "medium", role: "HR Interview", sampleAnswer: "Show ambition aligned with the role. Mention growing technically, leading projects, and contributing to the company." }
    ],
    hard: [
      { _id: "hr-h1", text: "Tell me about a time you failed and what you learned.", category: "HR", difficulty: "hard", role: "HR Interview", sampleAnswer: "Be honest and specific. Show self-awareness and emphasize what you changed as a result." },
      { _id: "hr-h2", text: "How do you prioritize when you have multiple competing deadlines?", category: "HR", difficulty: "hard", role: "HR Interview", sampleAnswer: "Explain your framework: urgency vs importance, communication with stakeholders, and breaking tasks into milestones." }
    ]
  }
};

// Get questions for a given role (with fallback matching)
const getOfflineQuestions = (role, difficulty, count) => {
  const roleKey = Object.keys(OFFLINE_QUESTIONS).find(
    k => k.toLowerCase() === role.toLowerCase()
  ) || "MERN Stack Developer";

  const diffKey = difficulty.toLowerCase();
  const allForRole = [
    ...(OFFLINE_QUESTIONS[roleKey]?.medium || []),
    ...(OFFLINE_QUESTIONS[roleKey]?.[diffKey] || []),
    ...(OFFLINE_QUESTIONS[roleKey]?.easy || []),
    ...(OFFLINE_QUESTIONS[roleKey]?.hard || [])
  ];

  const unique = [...new Map(allForRole.map(q => [q._id, q])).values()];
  return unique.slice(0, count);
};

// ============================================================
// INTERVIEW SERVICE
// ============================================================

export const startInterview = async (role, difficulty, questionCount) => {
  try {
    const res = await api.post(
      "/interview/start",
      { role, difficulty, questionCount },
      { timeout: 3500 }
    );
    return res.data;
  } catch (err) {
    console.warn("Backend interview start failed, creating offline session:", err.message);

    const questions = getOfflineQuestions(role, difficulty, questionCount);
    if (questions.length === 0) {
      throw new Error("No questions available. Please try again.");
    }

    const sessionId = `offline-${Date.now()}`;
    const session = {
      _id: sessionId,
      id: sessionId,
      role,
      difficulty,
      status: "active",
      startedAt: new Date().toISOString(),
      questions: questions.map((q) => ({
        ...q,
        _id: q._id || q.id,
        question: q.question || q.text,
        text: q.question || q.text,
        expectedAnswer: q.expectedAnswer || q.sampleAnswer,
        sampleAnswer: q.sampleAnswer || q.expectedAnswer,
        questionId: q
      })),
      answers: [],
      offline: true
    };

    sessionStorage.setItem(`interview_session_${sessionId}`, JSON.stringify(session));
    localStorage.setItem(`interview_session_${sessionId}`, JSON.stringify(session));
    return { session };
  }
};

export const getInterviewSession = async (sessionId) => {
  const isLocalId = sessionId?.startsWith("offline-") || sessionId?.startsWith("mock-");
  if (isLocalId) {
    const cached = sessionStorage.getItem(`interview_session_${sessionId}`) || localStorage.getItem(`interview_session_${sessionId}`);
    if (cached) return JSON.parse(cached);
  }

  try {
    const res = await api.get(`/interview/${sessionId}`, { timeout: 3500 });
    return res.data;
  } catch (err) {
    console.warn("Session fetch failed:", err.message);
    const cached = sessionStorage.getItem(`interview_session_${sessionId}`) || localStorage.getItem(`interview_session_${sessionId}`);
    if (cached) return JSON.parse(cached);

    // Create resilient fallback session
    const questions = getOfflineQuestions("MERN Stack Developer", "medium", 10);
    const fallbackSession = {
      _id: sessionId,
      id: sessionId,
      role: "MERN Stack Developer",
      difficulty: "medium",
      status: "active",
      startedAt: new Date().toISOString(),
      questions: questions.map((q) => ({
        ...q,
        _id: q._id || q.id,
        question: q.question || q.text,
        text: q.question || q.text,
        expectedAnswer: q.expectedAnswer || q.sampleAnswer,
        sampleAnswer: q.sampleAnswer || q.expectedAnswer,
        questionId: q
      })),
      answers: [],
      offline: true
    };
    sessionStorage.setItem(`interview_session_${sessionId}`, JSON.stringify(fallbackSession));
    localStorage.setItem(`interview_session_${sessionId}`, JSON.stringify(fallbackSession));
    return { session: fallbackSession, data: fallbackSession };
  }
};

export const saveInterviewAnswer = async (sessionId, questionId, answer, skipped = false) => {
  const cachedRaw = sessionStorage.getItem(`interview_session_${sessionId}`) || localStorage.getItem(`interview_session_${sessionId}`);
  if (cachedRaw) {
    try {
      const session = JSON.parse(cachedRaw);
      session.answers = session.answers || [];
      const existingIdx = session.answers.findIndex(a =>
        (a.questionId?._id || a.questionId) === questionId
      );
      if (existingIdx >= 0) {
        session.answers[existingIdx] = { questionId, answer, skipped };
      } else {
        session.answers.push({ questionId, answer, skipped });
      }
      sessionStorage.setItem(`interview_session_${sessionId}`, JSON.stringify(session));
      localStorage.setItem(`interview_session_${sessionId}`, JSON.stringify(session));
    } catch (e) {
      console.warn("Error updating cached answers:", e);
    }
  }

  if (sessionId?.startsWith("offline-") || sessionId?.startsWith("mock-")) {
    return { success: true, offline: true };
  }

  try {
    const res = await api.put(`/interview/${sessionId}/answer`, { questionId, answer, skipped }, { timeout: 3500 });
    return res.data;
  } catch (err) {
    console.warn("Save answer offline fallback:", err.message);
    return { success: true, offline: true };
  }
};

export const completeInterviewSession = async (sessionId, duration) => {
  const cachedRaw = sessionStorage.getItem(`interview_session_${sessionId}`) || localStorage.getItem(`interview_session_${sessionId}`);
  let completedSession = null;
  if (cachedRaw) {
    try {
      const session = JSON.parse(cachedRaw);
      session.status = "completed";
      session.duration = duration;
      session.completedAt = new Date().toISOString();

      const answered = (session.answers || []).filter(a => !a.skipped && a.answer?.trim());
      const total = (session.questions || []).length || 1;
      session.score = Math.round((answered.length / total) * 100);
      session.totalQuestions = total;
      session.answeredCount = answered.length;
      session.skippedCount = (session.answers || []).filter(a => a.skipped).length;

      sessionStorage.setItem(`interview_session_${sessionId}`, JSON.stringify(session));
      localStorage.setItem(`interview_result_${sessionId}`, JSON.stringify(session));
      localStorage.setItem(`interview_session_${sessionId}`, JSON.stringify(session));
      completedSession = session;
    } catch (e) {
      console.warn("Error updating completion cache:", e);
    }
  }

  if (sessionId?.startsWith("offline-") || sessionId?.startsWith("mock-")) {
    return { session: completedSession, data: completedSession, success: true };
  }

  try {
    const res = await api.post(`/interview/${sessionId}/complete`, { duration }, { timeout: 3500 });
    return res.data;
  } catch (err) {
    console.warn("Complete interview offline fallback:", err.message);
    return { session: completedSession, data: completedSession, success: true, offline: true };
  }
};

export const evaluateInterviewAnswer = async ({ question, expectedAnswer, answer, role, difficulty }) => {
  try {
    const res = await api.post("/interview/evaluate-answer", {
      question,
      expectedAnswer,
      answer,
      role,
      difficulty
    }, { timeout: 8000 });
    return res.data;
  } catch (err) {
    console.warn("Backend evaluateAnswer fallback:", err.message);
    const userAns = String(answer || "").trim();
    const words = userAns.toLowerCase().split(/\s+/).filter(Boolean);
    const wordCount = words.length;

    const stopWords = new Set(["the", "and", "that", "this", "with", "from", "for", "are", "was", "were", "what", "which", "how", "used", "using", "can"]);
    const modelTokens = String(expectedAnswer || "")
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 3 && !stopWords.has(w));

    const matchedTokens = modelTokens.filter((token) => words.includes(token));
    const uniqueMatches = [...new Set(matchedTokens)];
    const uniqueTotal = [...new Set(modelTokens)].length || 1;
    const matchRatio = Math.min(uniqueMatches.length / uniqueTotal, 1);

    let score = Math.round(matchRatio * 55 + Math.min(wordCount / 35, 1) * 35 + 10);
    score = Math.min(Math.max(score, 45), 98);

    let rating = score >= 85 ? "Excellent" : score >= 70 ? "Solid" : "Good";

    return {
      success: true,
      data: {
        score,
        rating,
        feedback: `Your response shows ${rating.toLowerCase()} understanding of this technical topic. ${score >= 75 ? "You clearly hit the primary conceptual points." : "Try incorporating more specific architectural terminology and real-world trade-offs."}`,
        strengths: [
          wordCount > 20 ? "Clear technical structure and articulation." : "Direct answer to the interview question.",
          uniqueMatches.length > 0 ? `Covered core concepts: ${uniqueMatches.slice(0, 3).join(", ")}.` : "Relevant technical explanation."
        ],
        improvements: [
          "Expand on real-world production metrics and error handling scenarios.",
          "Highlight system scalability trade-offs when discussing this approach."
        ],
        sampleAnswer: expectedAnswer
      }
    };
  }
};

export const getInterviewHistory = async () => {
  try {
    const res = await api.get("/interview/history", { timeout: 6000 });
    const raw = res?.data || res;
    const historyList = Array.isArray(raw?.data) ? raw.data : Array.isArray(raw?.sessions) ? raw.sessions : Array.isArray(raw) ? raw : [];
    return {
      success: true,
      sessions: historyList,
      data: historyList
    };
  } catch (err) {
    console.warn("Interview history unavailable from backend, gathering local history:", err.message);
    const cached = [];
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith("interview_result_") || key.startsWith("interview_session_"))) {
          const item = JSON.parse(localStorage.getItem(key));
          if (item && item.status === "completed") {
            cached.push(item);
          }
        }
      }
    } catch (e) {}
    return { success: true, sessions: cached, data: cached };
  }
};

export const getQuestions = async (params = {}) => {
  try {
    const res = await api.get("/interview/questions", { params, timeout: 6000 });
    return res.data;
  } catch (err) {
    console.warn("Questions unavailable from API, using offline questions:", err.message);
    const role = params.role || "MERN Stack Developer";
    const difficulty = params.difficulty || "medium";
    const limit = params.limit || 50;
    return { data: getOfflineQuestions(role, difficulty, limit), count: limit };
  }
};

export default {
  startInterview,
  getInterviewSession,
  saveInterviewAnswer,
  completeInterviewSession,
  getInterviewHistory,
  getQuestions,
  evaluateInterviewAnswer
};
