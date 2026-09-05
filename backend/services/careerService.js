const mongoose = require("mongoose");
const Job = require("../models/Job");
const User = require("../models/User");
const CareerRoadmap = require("../models/CareerRoadmap");
const InterviewSession = require("../models/InterviewSession");
const ResumeAnalysis = require("../models/ResumeAnalysis");
const Application = require("../models/Application");

// Comprehensive role curriculums for Career Roadmaps
const ROADMAP_TEMPLATES = {
  "MERN Stack Developer": [
    {
      phaseNumber: 1,
      title: "Phase 1: JavaScript & Web Foundations",
      description: "Master asynchronous JavaScript, modern ES6+ syntax, and web fundamentals.",
      skills: [
        { name: "JavaScript ES6+ & Scopes", description: "Closures, hoisting, destructuring, modules", priority: "high" },
        { name: "Asynchronous JS & Promises", description: "Event loop, Promises, async/await, error handling", priority: "high" },
        { name: "DOM Manipulation & Events", description: "Event delegation, bubbling, web storage APIs", priority: "medium" },
        { name: "Fetch API & Axios", description: "HTTP methods, headers, status codes, REST concepts", priority: "high" }
      ]
    },
    {
      phaseNumber: 2,
      title: "Phase 2: Modern Frontend with React",
      description: "Build reactive, scalable single-page applications.",
      skills: [
        { name: "React Components & JSX", description: "Functional components, props, conditional rendering", priority: "high" },
        { name: "Hooks & State Management", description: "useState, useEffect, useMemo, useCallback, custom hooks", priority: "high" },
        { name: "React Router & Navigation", description: "Dynamic routes, protected routes, URL params", priority: "high" },
        { name: "Global State (Redux Toolkit / Context)", description: "Store setup, reducers, async thunks", priority: "medium" },
        { name: "Tailwind CSS & Styling", description: "Utility classes, responsive layouts, dark mode", priority: "medium" }
      ]
    },
    {
      phaseNumber: 3,
      title: "Phase 3: Backend with Node.js & Express",
      description: "Engineer secure, high-throughput RESTful microservices.",
      skills: [
        { name: "Node.js Core & Event Loop", description: "Buffer, Streams, File System, module systems", priority: "high" },
        { name: "Express.js Routing & Middleware", description: "Custom middleware, CORS, body-parser, rate limiting", priority: "high" },
        { name: "JWT Authentication & Security", description: "Token generation, password hashing (bcrypt), cookie security", priority: "high" },
        { name: "Error Handling & Validation", description: "Centralized error handler, request schemas", priority: "medium" }
      ]
    },
    {
      phaseNumber: 4,
      title: "Phase 4: Database Architecture with MongoDB",
      description: "Design efficient NoSQL schemas and aggregations.",
      skills: [
        { name: "MongoDB Schema Design & Mongoose", description: "Models, validation, virtuals, middleware hooks", priority: "high" },
        { name: "Aggregation Pipelines", description: "$match, $group, $lookup, $unwind operators", priority: "high" },
        { name: "Indexing & Query Optimization", description: "Compound indexes, explain plans, performance tuning", priority: "medium" },
        { name: "Redis Caching", description: "Key-value caching, session stores, pub/sub", priority: "optional" }
      ]
    },
    {
      phaseNumber: 5,
      title: "Phase 5: Production & DevOps",
      description: "Containerization, automated testing, and CI/CD.",
      skills: [
        { name: "Docker Containerization", description: "Dockerfiles, docker-compose for full-stack apps", priority: "medium" },
        { name: "Automated Testing (Jest & RTL)", description: "Unit tests, integration tests, mock APIs", priority: "medium" },
        { name: "CI/CD & Cloud Deployment", description: "GitHub Actions, Vercel, AWS/Render deployment", priority: "high" },
        { name: "WebSockets & Real-Time Comms", description: "Socket.IO for live chat and notifications", priority: "medium" }
      ]
    }
  ],
  "Frontend Developer": [
    {
      phaseNumber: 1,
      title: "Phase 1: HTML5, CSS3 & Responsive Design",
      description: "Semantic HTML, flexbox, grid, and accessibility standards.",
      skills: [
        { name: "Semantic HTML & SEO", description: "Accessible markup, Open Graph, meta tags", priority: "high" },
        { name: "CSS Flexbox & CSS Grid", description: "Complex responsive multi-column layouts", priority: "high" },
        { name: "Tailwind CSS & CSS Modules", description: "Modern modular styling and design systems", priority: "high" },
        { name: "Web Accessibility (a11y)", description: "ARIA roles, keyboard navigation, screen reader support", priority: "medium" }
      ]
    },
    {
      phaseNumber: 2,
      title: "Phase 2: Core JavaScript & TypeScript",
      description: "Type safety, functional programming, and asynchronous flows.",
      skills: [
        { name: "Modern JavaScript (ES6+)", description: "Promises, async/await, closures, prototypes", priority: "high" },
        { name: "TypeScript Fundamentals", description: "Interfaces, generics, type unions, utility types", priority: "high" },
        { name: "Browser APIs & Storage", description: "LocalStorage, SessionStorage, IntersectionObserver", priority: "medium" }
      ]
    },
    {
      phaseNumber: 3,
      title: "Phase 3: React & Next.js Ecosystem",
      description: "Modern component-driven UI architecture and SSR.",
      skills: [
        { name: "React 19 & Component Architecture", description: "Hooks, server components, Suspense", priority: "high" },
        { name: "Next.js App Router & SSR", description: "Server-side rendering, static generation, SEO", priority: "high" },
        { name: "State Management (Zustand / Redux)", description: "Predictable state containers and persistence", priority: "medium" },
        { name: "Performance Optimization", description: "Code splitting, lazy loading, Core Web Vitals", priority: "high" }
      ]
    },
    {
      phaseNumber: 4,
      title: "Phase 4: Testing & Deployment",
      description: "Testing frameworks, build tools, and modern hosting.",
      skills: [
        { name: "Jest & React Testing Library", description: "Component testing, user interactions", priority: "high" },
        { name: "Vite & Build Tooling", description: "Bundling, minification, tree-shaking", priority: "medium" },
        { name: "Vercel & Cloud Deployment", description: "Preview deployments, environment configuration", priority: "high" }
      ]
    }
  ],
  "Backend Developer": [
    {
      phaseNumber: 1,
      title: "Phase 1: Node.js & Server Architecture",
      description: "Server lifecycle, streams, and modular architectures.",
      skills: [
        { name: "Node.js Core Architecture", description: "Event loop, libuv, cluster module, child processes", priority: "high" },
        { name: "TypeScript for Backend", description: "Type-safe controllers, DTOs, interfaces", priority: "high" },
        { name: "REST API Design Standards", description: "Status codes, pagination, filtering, idempotency", priority: "high" }
      ]
    },
    {
      phaseNumber: 2,
      title: "Phase 2: Databases & ORM/ODM",
      description: "SQL, NoSQL, query tuning, and transactions.",
      skills: [
        { name: "PostgreSQL & Relational SQL", description: "Foreign keys, joins, indexes, ACID transactions", priority: "high" },
        { name: "MongoDB & Aggregations", description: "Document schemas, pipelines, replication", priority: "high" },
        { name: "Prisma / Mongoose ORM", description: "Schema migrations, type generation, hooks", priority: "medium" },
        { name: "Redis Caching Strategies", description: "TTL, cache invalidation, rate limiting", priority: "high" }
      ]
    },
    {
      phaseNumber: 3,
      title: "Phase 3: Security & Microservices",
      description: "Authentication, authorization, and scalable systems.",
      skills: [
        { name: "OAuth2 & JWT Auth", description: "Refresh tokens, RBAC permissions, session management", priority: "high" },
        { name: "System Design & Scaling", description: "Load balancing, horizontal scaling, message queues", priority: "high" },
        { name: "Docker & Kubernetes Basics", description: "Container orchestration, microservice networks", priority: "medium" }
      ]
    }
  ],
  "Full Stack Developer": [
    {
      phaseNumber: 1,
      title: "Phase 1: End-to-End Web Architecture",
      description: "Full stack protocols, modern responsive UI, and state management.",
      skills: [
        { name: "React 19 & Next.js", description: "SSR, SSG, component lifecycles, hooks", priority: "high" },
        { name: "TypeScript & Modular JS", description: "Type safety, generics, interfaces across client and server", priority: "high" },
        { name: "RESTful & GraphQL APIs", description: "API design principles, status codes, query resolvers", priority: "high" }
      ]
    },
    {
      phaseNumber: 2,
      title: "Phase 2: Scalable Backend Services",
      description: "Node.js, Express, middleware, caching, and databases.",
      skills: [
        { name: "Node.js & Express.js", description: "Event loop, streams, routing, rate limiting", priority: "high" },
        { name: "PostgreSQL & MongoDB", description: "ACID transactions, document models, indexing", priority: "high" },
        { name: "Redis Caching", description: "Key-value cache, session storage, performance tuning", priority: "medium" }
      ]
    },
    {
      phaseNumber: 3,
      title: "Phase 3: Deployment & Cloud Infrastructure",
      description: "Docker, CI/CD, cloud deployment, and system security.",
      skills: [
        { name: "Docker & Containerization", description: "Dockerfiles, compose, multi-stage builds", priority: "high" },
        { name: "CI/CD & Cloud Hosting", description: "GitHub Actions, AWS/Vercel production setups", priority: "high" },
        { name: "Web Security & JWT", description: "CORS, CSRF, sanitized inputs, token auth", priority: "high" }
      ]
    }
  ],
  "Cloud & DevOps": [
    {
      phaseNumber: 1,
      title: "Phase 1: Linux, Networking & Scripting",
      description: "Core operating system fundamentals, shell scripting, and network topologies.",
      skills: [
        { name: "Linux Administration & Bash", description: "Permissions, shell scripting, systemd, process management", priority: "high" },
        { name: "Networking & DNS", description: "TCP/IP, HTTP/HTTPS, SSL/TLS certificates, load balancing", priority: "high" },
        { name: "Git & Version Control", description: "Branching strategies, git rebase, tag management", priority: "high" }
      ]
    },
    {
      phaseNumber: 2,
      title: "Phase 2: Cloud & Containers",
      description: "AWS/GCP infrastructure, Docker containers, and Kubernetes orchestration.",
      skills: [
        { name: "Docker Containers", description: "Container image optimization, networks, volumes", priority: "high" },
        { name: "Kubernetes Orchestration", description: "Pods, Deployments, Services, Ingress, Helm charts", priority: "high" },
        { name: "AWS Cloud Services", description: "EC2, S3, IAM, VPC, RDS, Lambda functions", priority: "high" }
      ]
    },
    {
      phaseNumber: 3,
      title: "Phase 3: Infrastructure as Code & CI/CD",
      description: "Automated pipelines, Terraform provisioning, and observability.",
      skills: [
        { name: "Terraform IaC", description: "HCL syntax, state management, module design", priority: "high" },
        { name: "CI/CD Pipelines", description: "GitHub Actions, automated tests, blue-green deployments", priority: "high" },
        { name: "Monitoring & Logging", description: "Prometheus, Grafana, CloudWatch, structured logs", priority: "medium" }
      ]
    }
  ],
  "AI & ML Engineer": [
    {
      phaseNumber: 1,
      title: "Phase 1: Python, Math & Data Pipelines",
      description: "Vector mathematics, NumPy, Pandas, and exploratory data analysis.",
      skills: [
        { name: "Python for AI/ML", description: "Data structures, generators, OOP, async python", priority: "high" },
        { name: "NumPy & Pandas", description: "Array operations, matrix manipulation, data wrangling", priority: "high" },
        { name: "Linear Algebra & Statistics", description: "Probability, matrix decomposition, loss functions", priority: "medium" }
      ]
    },
    {
      phaseNumber: 2,
      title: "Phase 2: Machine Learning & Deep Learning",
      description: "Classical algorithms, PyTorch, model training, and evaluation.",
      skills: [
        { name: "Scikit-Learn Algorithms", description: "Regression, classification, clustering, cross-validation", priority: "high" },
        { name: "PyTorch & Neural Networks", description: "Tensors, autograd, CNNs, Transformers", priority: "high" },
        { name: "Model Evaluation & Metrics", description: "Precision, recall, F1, ROC-AUC, overfitting control", priority: "high" }
      ]
    },
    {
      phaseNumber: 3,
      title: "Phase 3: LLMs, RAG & AI Engineering",
      description: "Prompt engineering, Vector DBs, LangChain, and API deployment.",
      skills: [
        { name: "LLM APIs & Prompt Engineering", description: "Gemini API, OpenAI, structured outputs, token limits", priority: "high" },
        { name: "RAG & Vector Databases", description: "Embeddings, Pinecone, Chroma, retrieval augmented generation", priority: "high" },
        { name: "AI Model Serving & FastAPI", description: "Model deployment, async endpoints, caching", priority: "high" }
      ]
    }
  ]
};

// Calculate profile completion percentage deterministically
const calculateProfileCompletion = (user) => {
  if (!user) return { score: 0, missingSections: [] };

  const checks = [
    { name: "Full Name", weight: 10, passed: Boolean(user.name && user.name.trim().length >= 2) },
    { name: "Professional Headline", weight: 15, passed: Boolean(user.headline && user.headline.trim().length >= 5) },
    { name: "Bio / Summary", weight: 10, passed: Boolean(user.bio && user.bio.trim().length >= 10) },
    { name: "Technical Skills (at least 3)", weight: 20, passed: Array.isArray(user.skills) && user.skills.length >= 3 },
    { name: "Work Experience", weight: 15, passed: Array.isArray(user.experience) && user.experience.length > 0 },
    { name: "Education", weight: 10, passed: Array.isArray(user.education) && user.education.length > 0 },
    { name: "Projects / Portfolio", weight: 10, passed: Array.isArray(user.projects) && user.projects.length > 0 },
    { name: "Resume Uploaded", weight: 10, passed: Boolean(user.resume && user.resume.trim().length > 0) }
  ];

  let totalScore = 0;
  const missingSections = [];

  checks.forEach((check) => {
    if (check.passed) {
      totalScore += check.weight;
    } else {
      missingSections.push(check.name);
    }
  });

  return {
    score: totalScore,
    missingSections,
    checks
  };
};

// Calculate job match score between user and job
const calculateJobMatch = (user, job) => {
  if (!job) return { score: 0, matchedSkills: [], missingSkills: [], explanation: "" };

  const userSkills = new Set(
    (user?.skills || []).concat(
      (user?.categorizedSkills || []).map((s) => s.name)
    ).map((s) => s.trim().toLowerCase())
  );

  const jobSkills = (job.skills || []).map((s) => s.trim());
  const matchedSkills = [];
  const missingSkills = [];

  jobSkills.forEach((skill) => {
    const norm = skill.toLowerCase();
    if (userSkills.has(norm) || Array.from(userSkills).some((us) => us.includes(norm) || norm.includes(us))) {
      matchedSkills.push(skill);
    } else {
      missingSkills.push(skill);
    }
  });

  const skillsMatchRate = jobSkills.length > 0 ? (matchedSkills.length / jobSkills.length) : 0.8;
  const skillsScore = Math.round(skillsMatchRate * 50); // max 50 pts

  // Experience match
  const userExpYears = (user?.experience || []).length * 1.5;
  const expScore = userExpYears >= 2 ? 25 : userExpYears >= 1 ? 15 : 10; // max 25 pts

  // Title / Headline relevance
  const userHeadline = (user?.headline || "").toLowerCase();
  const jobTitle = (job.title || "").toLowerCase();
  const titleScore = jobTitle.split(" ").some((w) => w.length > 3 && userHeadline.includes(w)) ? 15 : 8; // max 15 pts

  // Profile readiness
  const profileScore = user?.skills?.length >= 3 ? 10 : 5; // max 10 pts

  const totalScore = Math.min(100, Math.max(10, skillsScore + expScore + titleScore + profileScore));

  let explanation = "";
  if (matchedSkills.length > 0) {
    explanation = `Recommended because your profile matches ${matchedSkills.slice(0, 3).join(", ")}.`;
  } else {
    explanation = `Matches your career trajectory in ${job.category || "software engineering"}.`;
  }

  return {
    score: totalScore,
    matchedSkills,
    missingSkills,
    breakdown: {
      skillsMatch: skillsScore,
      experienceRelevance: expScore,
      titleRelevance: titleScore,
      profileReadiness: profileScore
    },
    explanation
  };
};

module.exports = {
  ROADMAP_TEMPLATES,
  calculateProfileCompletion,
  calculateJobMatch
};
