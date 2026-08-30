/**
 * JobSphere - Production Mock Dataset & Fallback Store
 * Used for GitHub Pages Live Demo & Offline Resiliency
 */

export const DEMO_CANDIDATE = {
  _id: "demo-candidate-001",
  id: "demo-candidate-001",
  name: "Ritesh Raj",
  username: "riteshraj",
  email: "ritesh.raj@example.com",
  role: "user",
  headline: "Full Stack Engineer & Generative AI Builder",
  bio: "Passionate software engineer experienced in MERN stack, React 19, Node.js, Three.js 3D web interfaces, and LLM integrations. Always eager to solve real-world problems and deliver high-performance user experiences.",
  location: "Bengaluru, India (Remote & Hybrid)",
  skills: [
    "React",
    "Node.js",
    "Express.js",
    "MongoDB",
    "JavaScript (ES6+)",
    "TypeScript",
    "Three.js",
    "Tailwind CSS",
    "REST APIs",
    "Socket.IO",
    "Git",
    "Next.js",
    "Python",
    "Docker"
  ],
  experience: [
    {
      title: "Senior Frontend & Full Stack Developer",
      company: "TechNova Solutions",
      location: "Bengaluru, India",
      startDate: "2023-01-01",
      endDate: "Present",
      current: true,
      description: "Architected high-throughput React dashboards, micro-frontends, and integrated AI assistant chat interfaces reducing candidate search time by 40%."
    },
    {
      title: "Software Engineer",
      company: "CodeCraft Labs",
      location: "Remote",
      startDate: "2021-06-01",
      endDate: "2022-12-31",
      current: false,
      description: "Developed RESTful APIs with Node.js and MongoDB, implemented real-time Socket.IO notification systems, and boosted web app lighthouse scores from 62 to 98."
    }
  ],
  education: [
    {
      degree: "B.Tech in Computer Science & Engineering",
      institution: "Technological Institute",
      startYear: "2018",
      endYear: "2022"
    }
  ],
  portfolio: "https://riteshraj851116.github.io/jobsphere/",
  github: "https://github.com/riteshraj851116",
  linkedin: "https://linkedin.com/in/ritesh-raj",
  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
};

export const DEMO_RECRUITER = {
  _id: "demo-recruiter-001",
  id: "demo-recruiter-001",
  name: "Sarah Jenkins",
  username: "sarahrecruiter",
  email: "recruiter@jobsphere.io",
  role: "recruiter",
  headline: "Lead Technical Talent Partner @ JobSphere Global",
  bio: "Connecting world-class engineering and design talent with top tier hyper-growth technology companies.",
  location: "San Francisco, CA / London / Bengaluru",
  company: "JobSphere Technologies",
  avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80"
};

export const MOCK_COMPANIES = [
  {
    _id: "comp-001",
    id: "comp-001",
    name: "JobSphere Technologies",
    tagline: "Building the future of talent mobility and AI-driven hiring",
    industry: "Enterprise Software & AI",
    location: "Bengaluru, India / Remote",
    website: "https://jobsphere.io",
    logo: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80",
    coverImage: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&auto=format&fit=crop&q=80",
    size: "250-500 employees",
    founded: "2021",
    description: "JobSphere Technologies is a high-growth tech platform revolutionizing professional recruitment, skill matching, and AI career coaching across global markets.",
    openJobsCount: 8,
    rating: 4.8,
    benefits: ["Remote First", "Health Coverage", "Learning Stipend", "Equity Options", "Annual Retreats"]
  },
  {
    _id: "comp-002",
    id: "comp-002",
    name: "Stripe",
    tagline: "Financial infrastructure for the internet",
    industry: "FinTech & Payments",
    location: "San Francisco, CA / Remote",
    website: "https://stripe.com",
    logo: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=120&auto=format&fit=crop&q=80",
    coverImage: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&auto=format&fit=crop&q=80",
    size: "5000+ employees",
    founded: "2010",
    description: "Stripe builds economic infrastructure for the internet. Businesses of every size use our software to accept payments and manage their businesses online.",
    openJobsCount: 14,
    rating: 4.9,
    benefits: ["Comprehensive Medical", "401(k) Match", "Flexible PTO", "Home Office Budget", "Parental Leave"]
  },
  {
    _id: "comp-003",
    id: "comp-003",
    name: "OpenAI",
    tagline: "Creating safe artificial general intelligence",
    industry: "Artificial Intelligence",
    location: "San Francisco, CA / Remote",
    website: "https://openai.com",
    logo: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=120&auto=format&fit=crop&q=80",
    coverImage: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop&q=80",
    size: "1000+ employees",
    founded: "2015",
    description: "OpenAI is an AI research and deployment company. Our mission is to ensure that artificial general intelligence benefits all of humanity.",
    openJobsCount: 12,
    rating: 4.9,
    benefits: ["Top Tier Compensation", "Unlimited Computing Power", "Comprehensive Benefits", "Wellness Stipends"]
  },
  {
    _id: "comp-004",
    id: "comp-004",
    name: "Linear",
    tagline: "The issue tracker built for high-performance software teams",
    industry: "Productivity Software",
    location: "San Francisco / Remote",
    website: "https://linear.app",
    logo: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80",
    coverImage: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&auto=format&fit=crop&q=80",
    size: "50-100 employees",
    founded: "2019",
    description: "Linear helps streamline software projects, sprints, tasks, and bug tracking. Built for high-performance teams that care about speed and craft.",
    openJobsCount: 6,
    rating: 4.9,
    benefits: ["Fully Remote", "Competitive Equity", "Top-of-the-line Hardware", "Co-working Allowance"]
  },
  {
    _id: "comp-005",
    id: "comp-005",
    name: "Figma",
    tagline: "Where teams design, prototype, and build together",
    industry: "Design & Collaboration",
    location: "San Francisco / New York / Remote",
    website: "https://figma.com",
    logo: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=120&auto=format&fit=crop&q=80",
    coverImage: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=1200&auto=format&fit=crop&q=80",
    size: "1500+ employees",
    founded: "2012",
    description: "Figma connects everyone in the design process so teams can deliver better products, faster.",
    openJobsCount: 10,
    rating: 4.8,
    benefits: ["Design Stipend", "Full Healthcare", "Flexible Sabbatical", "Generous Equity"]
  },
  {
    _id: "comp-006",
    id: "comp-006",
    name: "Vercel",
    tagline: "Develop. Preview. Ship.",
    industry: "Cloud & Developer Tools",
    location: "San Francisco, CA / Remote",
    website: "https://vercel.com",
    logo: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=120&auto=format&fit=crop&q=80",
    coverImage: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&auto=format&fit=crop&q=80",
    size: "500-1000 employees",
    founded: "2015",
    description: "Vercel is the platform for frontend developers, providing the speed and reliability innovators need to create at the moment of inspiration.",
    openJobsCount: 9,
    rating: 4.7,
    benefits: ["Remote-First", "Annual Tech Allowance", "Comprehensive Insurance", "Unlimited PTO"]
  }
];

export const MOCK_JOBS = [
  {
    _id: "job-001",
    id: "job-001",
    title: "Senior Full Stack Engineer (MERN & Next.js)",
    company: MOCK_COMPANIES[0],
    companyName: "JobSphere Technologies",
    location: "Bengaluru, India (Remote Available)",
    jobType: "Full-time",
    experienceLevel: "Mid-Senior Level",
    salaryMin: 2200000,
    salaryMax: 3600000,
    salaryCurrency: "INR",
    category: "Software Development",
    skills: ["React", "Node.js", "Express.js", "MongoDB", "TypeScript", "REST APIs", "Socket.IO"],
    description: "We are seeking a seasoned Senior Full Stack Engineer to lead core feature development across our job search, real-time messaging, and candidate matchmaking engines.",
    responsibilities: [
      "Design and maintain scalable microservices in Node.js and Express",
      "Build fluid, high-performance web applications in React and TypeScript",
      "Architect MongoDB data models with robust indexes and aggregation pipelines",
      "Implement real-time WebSocket capabilities for notifications and messaging",
      "Mentor junior team members and champion clean code practices"
    ],
    requirements: [
      "3+ years of professional full-stack web development experience",
      "Deep expertise in modern React (Hooks, Context, State Management)",
      "Strong proficiency with Node.js async architecture and RESTful design",
      "Experience with MongoDB database performance tuning",
      "Familiarity with containerization (Docker) and CI/CD pipelines"
    ],
    benefits: ["Flexible Remote Work", "Stock Options", "Health & Wellness Coverage", "Annual Learning Budget"],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    status: "active"
  },
  {
    _id: "job-002",
    id: "job-002",
    title: "Generative AI Application Developer",
    company: MOCK_COMPANIES[2],
    companyName: "OpenAI",
    location: "San Francisco, CA / Remote",
    jobType: "Full-time",
    experienceLevel: "Senior Level",
    salaryMin: 140000,
    salaryMax: 220000,
    salaryCurrency: "USD",
    category: "Artificial Intelligence",
    skills: ["Python", "PyTorch", "LLMs", "LangChain", "React", "Vector DBs", "FastAPI"],
    description: "Join OpenAI to create delightful user interfaces and developer toolchains powered by frontier artificial intelligence models.",
    responsibilities: [
      "Develop innovative user-facing features using cutting-edge LLMs and multimodality",
      "Integrate vector embeddings, RAG pipelines, and semantic search systems",
      "Optimize inference latency and streaming response pipelines in client applications",
      "Collaborate with safety and alignment researchers"
    ],
    requirements: [
      "Proven track record building AI-powered web applications",
      "Strong grasp of prompt engineering, fine-tuning, and RAG architectures",
      "Proficiency in Python and JavaScript/TypeScript ecosystems",
      "Passionate about shaping the future of human-AI collaboration"
    ],
    benefits: ["Tier-1 Silicon Valley Salary & Equity", "Full Family Health & Dental", "Relocation Support", "Unlimited AI Compute"],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
    status: "active"
  },
  {
    _id: "job-003",
    id: "job-003",
    title: "Frontend Architect (React & 3D WebGL)",
    company: MOCK_COMPANIES[3],
    companyName: "Linear",
    location: "Remote (Global)",
    jobType: "Full-time",
    experienceLevel: "Lead / Architect",
    salaryMin: 130000,
    salaryMax: 195000,
    salaryCurrency: "USD",
    category: "Frontend Development",
    skills: ["React", "Three.js", "WebGL", "TypeScript", "GSAP", "CSS Architecture", "Web Performance"],
    description: "Linear is searching for a visionary Frontend Engineer who lives at the intersection of aesthetic perfection, silky-smooth 60fps animations, and deep technical rigor.",
    responsibilities: [
      "Craft world-class interactive 3D visualizations and graph network representations",
      "Maintain sub-16ms render loops and ultra-responsive keyboard-first navigation",
      "Design design-system components used by hundreds of thousands of engineering teams"
    ],
    requirements: [
      "Extensive experience with React, Three.js / React Three Fiber, and WebGL",
      "Obsession with micro-interactions, spring physics, and typography",
      "Strong command of TypeScript and modern browser graphics APIs"
    ],
    benefits: ["100% Remote Anywhere", "Generous Equity", "Top-spec MacBook Pro", "Annual Team Offsites in Europe & US"],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
    status: "active"
  },
  {
    _id: "job-004",
    id: "job-004",
    title: "Backend Platform Engineer",
    company: MOCK_COMPANIES[1],
    companyName: "Stripe",
    location: "Bengaluru, India / Hybrid",
    jobType: "Full-time",
    experienceLevel: "Mid-Senior Level",
    salaryMin: 2800000,
    salaryMax: 4500000,
    salaryCurrency: "INR",
    category: "Software Development",
    skills: ["Node.js", "Go", "Distributed Systems", "MongoDB", "PostgreSQL", "Kafka", "Redis"],
    description: "Help scale the backbone of internet commerce. Build ultra-reliable billing engines, payout systems, and fraud prevention pipelines processing millions of transactions per second.",
    responsibilities: [
      "Architect high-availability distributed services with 99.999% uptime guarantees",
      "Design idempotent transaction flows and financial reconciliation pipelines",
      "Implement multi-region database replication and caching strategies"
    ],
    requirements: [
      "4+ years building distributed backend services",
      "Deep understanding of concurrency, data consistency, and database isolation levels",
      "Strong background in API design and developer experience"
    ],
    benefits: ["Comprehensive Medical + Life Insurance", "Competitive Equity", "Annual Wellness Stipend", "Continuous Learning Grants"],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    status: "active"
  },
  {
    _id: "job-005",
    id: "job-005",
    title: "Product Designer (UI/UX & Design Systems)",
    company: MOCK_COMPANIES[4],
    companyName: "Figma",
    location: "Remote / Hybrid",
    jobType: "Full-time",
    experienceLevel: "Mid-Level",
    salaryMin: 1800000,
    salaryMax: 2800000,
    salaryCurrency: "INR",
    category: "Design & UX",
    skills: ["Figma", "Design Systems", "UI Design", "Prototyping", "User Research", "Interaction Design"],
    description: "Design tools for designers. Shape the next generation of collaborative canvas tools, layout engines, and interactive prototyping features.",
    responsibilities: [
      "Design intuitive end-to-end user workflows for complex creative tools",
      "Contribute to and maintain our global design system tokens and component specs",
      "Conduct qualitative user interviews and translate feedback into polished UI iterations"
    ],
    requirements: [
      "Portfolio showcasing exceptional craft in digital product UI and interaction design",
      "Mastery of Figma, auto-layout, component variants, and interactive prototyping",
      "Experience partnering closely with frontend engineers"
    ],
    benefits: ["Home Studio Budget", "Conference Travel Fund", "Health & Dental", "Stock Purchase Plan"],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    status: "active"
  },
  {
    _id: "job-006",
    id: "job-006",
    title: "DevOps & Cloud Infrastructure Engineer",
    company: MOCK_COMPANIES[5],
    companyName: "Vercel",
    location: "Bengaluru, India / Remote",
    jobType: "Full-time",
    experienceLevel: "Senior Level",
    salaryMin: 2400000,
    salaryMax: 4000000,
    salaryCurrency: "INR",
    category: "DevOps & Cloud",
    skills: ["AWS", "Docker", "Kubernetes", "Terraform", "CI/CD", "Linux", "Prometheus", "Nginx"],
    description: "Design and operate the edge network and serverless infrastructure powering millions of web applications globally.",
    responsibilities: [
      "Automate multi-cloud infrastructure with Terraform and Ansible",
      "Build zero-downtime deployment pipelines with GitHub Actions",
      "Monitor global cluster health, latency metrics, and incident response"
    ],
    requirements: [
      "3+ years managing production cloud infrastructure (AWS/GCP)",
      "Strong hands-on experience with Kubernetes, Docker, and service meshes",
      "Deep understanding of networking protocols (DNS, TLS, HTTP/3)"
    ],
    benefits: ["Fully Remote", "Equipment Stipend", "Generous Health Coverage", "Unlimited Paid Time Off"],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString(),
    status: "active"
  }
];

export const MOCK_APPLICATIONS = [
  {
    _id: "app-001",
    id: "app-001",
    job: MOCK_JOBS[0],
    applicant: DEMO_CANDIDATE,
    status: "interview",
    coverLetter: "I am passionate about full-stack engineering and building responsive high-performance platforms like JobSphere.",
    resumeUrl: "https://riteshraj851116.github.io/jobsphere/resume.pdf",
    appliedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    matchScore: 96,
    feedback: "Strong background in React 19, Node.js, and real-time Socket systems. Technical round scheduled."
  },
  {
    _id: "app-002",
    id: "app-002",
    job: MOCK_JOBS[2],
    applicant: DEMO_CANDIDATE,
    status: "reviewed",
    coverLetter: "Excited about bringing 3D graphics and responsive design together to create magical web experiences.",
    resumeUrl: "https://riteshraj851116.github.io/jobsphere/resume.pdf",
    appliedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    matchScore: 92,
    feedback: "Impressive Three.js portfolio and clean UI component craftsmanship."
  },
  {
    _id: "app-003",
    id: "app-003",
    job: MOCK_JOBS[1],
    applicant: DEMO_CANDIDATE,
    status: "applied",
    coverLetter: "Keen interest in building generative AI applications and integrating modern LLMs with high-speed frontends.",
    resumeUrl: "https://riteshraj851116.github.io/jobsphere/resume.pdf",
    appliedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
    matchScore: 88,
    feedback: "Application submitted and queued for recruiter screening."
  }
];

export const MOCK_NOTIFICATIONS = [
  {
    _id: "notif-001",
    id: "notif-001",
    title: "Interview Scheduled!",
    message: "JobSphere Technologies has shortlisted your application for Senior Full Stack Engineer. Check your messages for details.",
    type: "application",
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    link: "/applications"
  },
  {
    _id: "notif-002",
    id: "notif-002",
    title: "New Job Match: AI Engineer",
    message: "OpenAI posted a new job matching your skills in Python, React, and LLMs.",
    type: "job",
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    link: "/jobs/job-002"
  },
  {
    _id: "notif-003",
    id: "notif-003",
    title: "Profile Viewed",
    message: "Sarah Jenkins (Lead Recruiter @ JobSphere) viewed your candidate profile.",
    type: "system",
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    link: "/profile"
  }
];

export const MOCK_MESSAGES = [
  {
    _id: "msg-001",
    sender: DEMO_RECRUITER,
    recipient: DEMO_CANDIDATE,
    conversationId: "conv-001",
    text: "Hello Ritesh! We reviewed your profile and projects on JobSphere. We are super impressed by your full-stack & 3D web work. Would you be open for a brief technical discussion this week?",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
  },
  {
    _id: "msg-002",
    sender: DEMO_CANDIDATE,
    recipient: DEMO_RECRUITER,
    conversationId: "conv-001",
    text: "Hi Sarah! Thank you so much for reaching out. Yes, I would love to discuss the role and how I can contribute to the engineering team. I'm available anytime Thursday or Friday afternoon.",
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString()
  }
];

/**
 * Intelligent In-Browser Career AI Engine
 * Generates rich markdown responses for career guidance, resume review, and interview prep
 */
export const generateLocalAIResponse = (userPrompt, userContext = {}) => {
  const prompt = userPrompt.toLowerCase();
  const candidateSkills = userContext?.skills || DEMO_CANDIDATE.skills;

  if (prompt.includes("interview") || prompt.includes("prepare")) {
    return {
      message: `### 🎯 JobSphere AI Interview Preparation Guide

Here is a focused preparation strategy for full-stack and modern software engineering roles:

#### 1. Core Technical Foundations
- **React & Frontend**: Component lifecycles, Hooks optimization (\`useMemo\`, \`useCallback\`), state management, Virtual DOM reconciliation, and SSR vs CSR.
- **Node.js & Backend**: Event loop phases, asynchronous execution, non-blocking I/O, middleware patterns in Express, and RESTful API standards.
- **Database & Architecture**: MongoDB schema indexing, aggregation pipelines, normalization vs embedding, and Redis caching.

#### 2. Frequently Asked Live Coding Questions
1. **Debounce / Throttle Implementation**: Build a custom debounce utility with immediate invocation support.
2. **LRU Cache**: Implement a Least-Recently-Used Cache with $O(1)$ \`get\` and \`put\` using a Map and Doubly-Linked List.
3. **Promise.all Polyfill**: Write a function that resolves an array of asynchronous promises with fail-fast error handling.

#### 3. Behavioral / STAR Framework
- Prepare 2 stories highlighting technical leadership, resolving difficult system bugs, and handling cross-functional deadlines.

*💡 Tip: Use JobSphere's interactive Job Matcher to simulate job-specific requirements!*`,
      recommendedJobs: [MOCK_JOBS[0], MOCK_JOBS[2]]
    };
  }

  if (prompt.includes("skill") || prompt.includes("learn") || prompt.includes("roadmap")) {
    return {
      message: `### 🚀 Recommended High-Impact Skills Roadmap (2025–2026)

Based on industry hiring trends across high-growth tech firms on JobSphere:

1. **Frontier Full Stack & Next-Gen Frameworks**
   - React 19 Actions, Server Components & Suspense
   - TypeScript strict mode & Type gymnastics
   - WebGL & 3D Web Experiences (Three.js / React Three Fiber)

2. **Generative AI & LLM Systems**
   - Retrieval Augmented Generation (RAG) with Vector Databases (Pinecone / Chroma)
   - Function Calling & Autonomous Tool Execution
   - Local LLM deployment with LangChain & FastAPI

3. **Cloud & Production Reliability**
   - Docker containerization & Kubernetes basics
   - Serverless architectures & Edge Workers (Vercel / Cloudflare)
   - Observability: OpenTelemetry, Prometheus & Grafana

*Your current profile already has a strong base in **${candidateSkills.slice(0, 4).join(", ")}**!*`,
      recommendedJobs: [MOCK_JOBS[1], MOCK_JOBS[0]]
    };
  }

  if (prompt.includes("resume") || prompt.includes("profile") || prompt.includes("cv")) {
    return {
      message: `### 📄 AI Resume & Profile Optimization Analysis

Here are tailored recommendations to make your resume stand out to top engineering hiring managers:

#### ✅ High-Impact Strengths Detected:
- Clean project hierarchy with end-to-end full-stack demonstration (MERN + AI + 3D).
- Live deployment link and active open-source repository on GitHub.
- Modern frontend stack with React 19, Socket.IO, and Three.js.

#### ⚡ Actionable Improvements:
1. **Quantify Measurable Impact**: Instead of *"Built job portal"*, write: *"Engineered real-time JobSphere portal supporting 60+ active job pipelines with sub-200ms query response times using MongoDB indexing and Socket.IO."*
2. **Highlight AI Capabilities**: Feature Gemini API integration, automated resume-to-job matching, and prompt engineering toolchains.
3. **Add Live Demo Badges**: Ensure GitHub README contains direct clickable badges for Live Demo, Swagger API documentation, and Architecture diagrams.`,
      recommendedJobs: [MOCK_JOBS[0], MOCK_JOBS[3]]
    };
  }

  // Default Career & Job Matching Response
  return {
    message: `### 💼 JobSphere AI Career Insights

Hello **${userContext?.name || "there"}**! I analyzed our active job database against your software development profile.

#### 🌟 Top Matched Opportunities For You:
1. **Senior Full Stack Engineer** @ *JobSphere Technologies* — **96% Match**
   - High alignment with your **React, Node.js, Express & MongoDB** expertise.
2. **Frontend Architect (3D & WebGL)** @ *Linear* — **92% Match**
   - Perfect fit for dynamic 3D web interfaces, smooth animations, and design craft.
3. **Generative AI Application Developer** @ *OpenAI* — **88% Match**
   - Exciting role integrating LLM agents, vector search, and modern web applications.

Would you like me to analyze your skills for a specific job, give you interview tips, or review your resume bullet points?`,
    recommendedJobs: [MOCK_JOBS[0], MOCK_JOBS[2], MOCK_JOBS[1]]
  };
};
