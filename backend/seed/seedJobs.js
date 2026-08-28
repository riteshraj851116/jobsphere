require("dotenv").config();

const mongoose = require("mongoose");

const Job = require("../models/Job");
const Company = require("../models/Company");
const User = require("../models/User");

const MONGODB_URI = process.env.MONGODB_URI;

const jobTemplates = [
  {
    title: "Frontend Developer",
    category: "Technology",
    skills: ["react", "javascript", "html", "css", "redux"],
    description:
      "We are looking for a talented Frontend Developer to build modern, responsive and high-quality user interfaces.",
    responsibilities: [
      "Build responsive web applications",
      "Write clean and reusable React code",
      "Collaborate with backend developers",
      "Fix bugs and improve performance"
    ],
    requirements: [
      "Good knowledge of React and JavaScript",
      "Understanding of HTML and CSS",
      "Knowledge of REST APIs"
    ]
  },
  {
    title: "Backend Developer",
    category: "Technology",
    skills: ["node.js", "express", "mongodb", "api", "javascript"],
    description:
      "Join our engineering team to build scalable backend services and REST APIs.",
    responsibilities: [
      "Develop REST APIs",
      "Design database models",
      "Maintain backend services",
      "Improve application performance"
    ],
    requirements: [
      "Experience with Node.js",
      "Knowledge of Express",
      "Understanding of MongoDB"
    ]
  },
  {
    title: "Full Stack Developer",
    category: "Technology",
    skills: ["react", "node.js", "mongodb", "express", "javascript"],
    description:
      "We are looking for a Full Stack Developer who can work across frontend and backend systems.",
    responsibilities: [
      "Develop frontend features",
      "Build backend APIs",
      "Work with databases",
      "Collaborate with product teams"
    ],
    requirements: [
      "Knowledge of MERN stack",
      "Understanding of REST APIs",
      "Good problem-solving skills"
    ]
  },
  {
    title: "React Developer",
    category: "Technology",
    skills: ["react", "javascript", "redux", "html", "css"],
    description:
      "Build fast and modern web applications using React and modern frontend tools.",
    responsibilities: [
      "Develop React components",
      "Manage application state",
      "Optimize frontend performance"
    ],
    requirements: [
      "Strong React knowledge",
      "JavaScript fundamentals",
      "Responsive design knowledge"
    ]
  },
  {
    title: "Node.js Developer",
    category: "Technology",
    skills: ["node.js", "express", "mongodb", "javascript"],
    description:
      "Develop secure and scalable backend applications using Node.js.",
    responsibilities: [
      "Create APIs",
      "Work with databases",
      "Implement authentication",
      "Maintain backend services"
    ],
    requirements: [
      "Node.js experience",
      "Express knowledge",
      "MongoDB knowledge"
    ]
  },
  {
    title: "MERN Stack Developer",
    category: "Technology",
    skills: ["mongodb", "express", "react", "node.js"],
    description:
      "Work on complete web applications using the MERN stack.",
    responsibilities: [
      "Build frontend interfaces",
      "Develop APIs",
      "Design MongoDB databases",
      "Deploy applications"
    ],
    requirements: [
      "Knowledge of MERN stack",
      "Git knowledge",
      "Problem-solving ability"
    ]
  },
  {
    title: "Software Engineer",
    category: "Technology",
    skills: ["javascript", "python", "java", "algorithms"],
    description:
      "Join our engineering team to build reliable software products.",
    responsibilities: [
      "Develop software features",
      "Write clean code",
      "Review code",
      "Solve technical problems"
    ],
    requirements: [
      "Strong programming fundamentals",
      "Data structures knowledge",
      "Good communication skills"
    ]
  },
  {
    title: "Java Developer",
    category: "Technology",
    skills: ["java", "spring", "sql", "mysql"],
    description:
      "Build enterprise applications using Java and modern backend technologies.",
    responsibilities: [
      "Develop Java applications",
      "Build backend services",
      "Work with SQL databases"
    ],
    requirements: [
      "Java fundamentals",
      "Spring knowledge",
      "SQL knowledge"
    ]
  },
  {
    title: "Python Developer",
    category: "Technology",
    skills: ["python", "django", "flask", "sql"],
    description:
      "Develop backend systems and automation tools using Python.",
    responsibilities: [
      "Write Python applications",
      "Develop APIs",
      "Work with databases"
    ],
    requirements: [
      "Python programming",
      "Django or Flask knowledge",
      "Problem-solving skills"
    ]
  },
  {
    title: "DevOps Engineer",
    category: "Technology",
    skills: ["docker", "aws", "linux", "ci/cd"],
    description:
      "Help us automate deployments and maintain reliable cloud infrastructure.",
    responsibilities: [
      "Manage cloud infrastructure",
      "Build CI/CD pipelines",
      "Monitor applications"
    ],
    requirements: [
      "Docker knowledge",
      "Linux fundamentals",
      "Cloud experience"
    ]
  },
  {
    title: "Cloud Engineer",
    category: "Technology",
    skills: ["aws", "azure", "docker", "kubernetes"],
    description:
      "Design and maintain scalable cloud infrastructure.",
    responsibilities: [
      "Manage cloud services",
      "Deploy applications",
      "Improve infrastructure reliability"
    ],
    requirements: [
      "Cloud platform knowledge",
      "Docker experience",
      "Networking fundamentals"
    ]
  },
  {
    title: "Data Analyst",
    category: "Data",
    skills: ["excel", "sql", "python", "power bi"],
    description:
      "Analyze business data and create meaningful reports and dashboards.",
    responsibilities: [
      "Analyze datasets",
      "Create dashboards",
      "Prepare business reports"
    ],
    requirements: [
      "SQL knowledge",
      "Excel skills",
      "Data visualization knowledge"
    ]
  },
  {
    title: "Data Scientist",
    category: "Data",
    skills: ["python", "machine learning", "sql", "pandas"],
    description:
      "Build data-driven models and extract insights from large datasets.",
    responsibilities: [
      "Analyze data",
      "Build machine learning models",
      "Present insights"
    ],
    requirements: [
      "Python knowledge",
      "Machine learning basics",
      "Statistics knowledge"
    ]
  },
  {
    title: "Machine Learning Engineer",
    category: "Artificial Intelligence",
    skills: ["python", "machine learning", "tensorflow", "pytorch"],
    description:
      "Develop and deploy machine learning solutions.",
    responsibilities: [
      "Build ML models",
      "Prepare datasets",
      "Deploy ML systems"
    ],
    requirements: [
      "Python programming",
      "Machine learning knowledge",
      "Data processing experience"
    ]
  },
  {
    title: "AI Engineer",
    category: "Artificial Intelligence",
    skills: ["python", "llm", "machine learning", "api"],
    description:
      "Build AI-powered features and intelligent applications.",
    responsibilities: [
      "Develop AI features",
      "Integrate AI APIs",
      "Evaluate model outputs"
    ],
    requirements: [
      "Python knowledge",
      "Understanding of AI concepts",
      "API integration experience"
    ]
  },
  {
    title: "UI UX Designer",
    category: "Design",
    skills: ["figma", "ui design", "ux research", "prototyping"],
    description:
      "Design intuitive and visually appealing digital products.",
    responsibilities: [
      "Create wireframes",
      "Design interfaces",
      "Build prototypes",
      "Conduct user research"
    ],
    requirements: [
      "Figma proficiency",
      "UI design understanding",
      "UX fundamentals"
    ]
  },
  {
    title: "Product Designer",
    category: "Design",
    skills: ["figma", "prototyping", "design systems"],
    description:
      "Design end-to-end product experiences for web and mobile.",
    responsibilities: [
      "Create product designs",
      "Maintain design systems",
      "Collaborate with engineers"
    ],
    requirements: [
      "Product design experience",
      "Figma knowledge",
      "Strong portfolio"
    ]
  },
  {
    title: "Graphic Designer",
    category: "Design",
    skills: ["photoshop", "illustrator", "branding"],
    description:
      "Create visual content for digital products and marketing campaigns.",
    responsibilities: [
      "Create graphics",
      "Design marketing materials",
      "Maintain brand consistency"
    ],
    requirements: [
      "Adobe tools knowledge",
      "Creative thinking",
      "Design portfolio"
    ]
  },
  {
    title: "Product Manager",
    category: "Product",
    skills: ["product management", "agile", "analytics"],
    description:
      "Lead product development from idea to launch.",
    responsibilities: [
      "Define product requirements",
      "Work with engineering teams",
      "Analyze product performance"
    ],
    requirements: [
      "Product management knowledge",
      "Communication skills",
      "Analytical thinking"
    ]
  },
  {
    title: "Project Manager",
    category: "Management",
    skills: ["project management", "agile", "scrum"],
    description:
      "Plan and manage software projects and delivery timelines.",
    responsibilities: [
      "Manage project timelines",
      "Coordinate teams",
      "Track project progress"
    ],
    requirements: [
      "Project management knowledge",
      "Communication skills",
      "Leadership ability"
    ]
  },
  {
    title: "Business Analyst",
    category: "Business",
    skills: ["business analysis", "sql", "excel"],
    description:
      "Analyze business requirements and help teams build effective solutions.",
    responsibilities: [
      "Gather requirements",
      "Analyze business processes",
      "Prepare documentation"
    ],
    requirements: [
      "Analytical skills",
      "Communication skills",
      "Documentation experience"
    ]
  },
  {
    title: "QA Engineer",
    category: "Technology",
    skills: ["testing", "selenium", "api testing", "jira"],
    description:
      "Ensure software quality through manual and automated testing.",
    responsibilities: [
      "Test applications",
      "Report bugs",
      "Create test cases"
    ],
    requirements: [
      "Testing fundamentals",
      "Attention to detail",
      "API testing knowledge"
    ]
  },
  {
    title: "Automation Test Engineer",
    category: "Technology",
    skills: ["selenium", "javascript", "automation", "api testing"],
    description:
      "Develop automated testing solutions for modern web applications.",
    responsibilities: [
      "Write automation tests",
      "Maintain test suites",
      "Identify software defects"
    ],
    requirements: [
      "Automation testing knowledge",
      "Programming basics",
      "Testing experience"
    ]
  },
  {
    title: "Cyber Security Analyst",
    category: "Security",
    skills: ["cybersecurity", "networking", "linux", "security"],
    description:
      "Help protect systems and applications from security threats.",
    responsibilities: [
      "Monitor security systems",
      "Investigate incidents",
      "Improve security practices"
    ],
    requirements: [
      "Networking knowledge",
      "Security fundamentals",
      "Linux knowledge"
    ]
  },
  {
    title: "Network Engineer",
    category: "Technology",
    skills: ["networking", "tcp/ip", "linux", "routers"],
    description:
      "Maintain and improve network infrastructure.",
    responsibilities: [
      "Configure networks",
      "Troubleshoot issues",
      "Monitor network performance"
    ],
    requirements: [
      "Networking fundamentals",
      "TCP/IP knowledge",
      "Troubleshooting skills"
    ]
  },
  {
    title: "Mobile App Developer",
    category: "Technology",
    skills: ["react native", "javascript", "android", "ios"],
    description:
      "Build modern mobile applications for Android and iOS.",
    responsibilities: [
      "Develop mobile applications",
      "Integrate APIs",
      "Improve application performance"
    ],
    requirements: [
      "Mobile development knowledge",
      "JavaScript knowledge",
      "API integration skills"
    ]
  },
  {
    title: "Android Developer",
    category: "Technology",
    skills: ["kotlin", "android", "java"],
    description:
      "Build high-quality Android applications.",
    responsibilities: [
      "Develop Android apps",
      "Integrate APIs",
      "Fix application bugs"
    ],
    requirements: [
      "Kotlin or Java",
      "Android knowledge",
      "Mobile development basics"
    ]
  },
  {
    title: "iOS Developer",
    category: "Technology",
    skills: ["swift", "ios", "xcode"],
    description:
      "Build reliable and high-performance iOS applications.",
    responsibilities: [
      "Develop iOS applications",
      "Integrate backend APIs",
      "Maintain app performance"
    ],
    requirements: [
      "Swift knowledge",
      "iOS development experience",
      "API integration knowledge"
    ]
  },
  {
    title: "Blockchain Developer",
    category: "Technology",
    skills: ["solidity", "ethereum", "javascript", "web3"],
    description:
      "Develop decentralized applications and blockchain solutions.",
    responsibilities: [
      "Build smart contracts",
      "Develop blockchain applications",
      "Test decentralized systems"
    ],
    requirements: [
      "Blockchain fundamentals",
      "Programming knowledge",
      "Smart contract knowledge"
    ]
  },
  {
    title: "Digital Marketing Executive",
    category: "Marketing",
    skills: ["seo", "social media", "google ads", "marketing"],
    description:
      "Plan and execute digital marketing campaigns.",
    responsibilities: [
      "Manage campaigns",
      "Analyze marketing performance",
      "Improve online presence"
    ],
    requirements: [
      "Digital marketing knowledge",
      "SEO basics",
      "Analytical skills"
    ]
  }
];

const locations = [
  "Bangalore, India",
  "Mumbai, India",
  "Delhi, India",
  "Noida, India",
  "Gurgaon, India",
  "Hyderabad, India",
  "Pune, India",
  "Chennai, India",
  "Kolkata, India",
  "Ahmedabad, India",
  "Remote, India"
];

const jobTypes = [
  "Full Time",
  "Full Time",
  "Full Time",
  "Internship",
  "Contract",
  "Part Time"
];

const experienceLevels = [
  "Entry Level",
  "Entry Level",
  "Mid Level",
  "Mid Level",
  "Senior Level",
  "Lead"
];

const generateJobs = (company, recruiter) => {
  const jobs = [];

  for (let i = 0; i < 60; i++) {
    const template =
      jobTemplates[i % jobTemplates.length];

    const location =
      locations[i % locations.length];

    const isRemote =
      location === "Remote, India" || i % 5 === 0;

    const salaryMin =
      300000 + i * 25000;

    const salaryMax =
      salaryMin + 400000 + (i % 5) * 50000;

    const deadline = new Date();
    deadline.setDate(
      deadline.getDate() + 30 + (i % 60)
    );

    jobs.push({
      title: template.title,
      description: template.description,
      responsibilities:
        template.responsibilities,
      requirements:
        template.requirements,
      skills: template.skills,
      company: company._id,
      recruiter: recruiter._id,
      location,
      isRemote,
      jobType:
        jobTypes[i % jobTypes.length],
      experienceLevel:
        experienceLevels[
          i % experienceLevels.length
        ],
      category: template.category,
      salaryMin,
      salaryMax,
      openings: (i % 8) + 1,
      deadline,
      status: "active",
      views: Math.floor(
        Math.random() * 500
      )
    });
  }

  return jobs;
};

const seedJobs = async () => {
  try {
    if (!MONGODB_URI) {
      throw new Error(
        "MONGODB_URI is missing in .env"
      );
    }

    console.log(
      "Connecting to MongoDB..."
    );

    await mongoose.connect(MONGODB_URI);

    console.log(
      "MongoDB connected successfully"
    );

    let recruiter = await User.findOne({
      role: "recruiter"
    });

    if (!recruiter) {
      recruiter = await User.findOne();
    }

    if (!recruiter) {
      throw new Error(
        "No user found. Please create a user first."
      );
    }

    console.log(
      `Using recruiter: ${recruiter.name}`
    );

    let company = await Company.findOne({
      recruiter: recruiter._id
    });

    if (!company) {
      company = await Company.create({
        name: "JobSphere Technologies",
        description:
          "A modern technology company focused on building innovative digital products and career opportunities.",
        website: "https://jobsphere.example.com",
        industry: "Technology",
        location: "Bangalore, India",
        companySize: "51-200",
        foundedYear: 2024,
        recruiter: recruiter._id
      });

      console.log(
        "New company created successfully"
      );
    }

    console.log(
      `Using company: ${company.name}`
    );

    const existingJobs =
      await Job.countDocuments({
        company: company._id
      });

    console.log(
      `Existing jobs for this company: ${existingJobs}`
    );

    if (existingJobs > 0) {
      await Job.deleteMany({
        company: company._id
      });

      console.log(
        "Old seeded jobs removed"
      );
    }

    const jobs = generateJobs(
      company,
      recruiter
    );

    await Job.insertMany(jobs);

    console.log("");
    console.log(
      "================================="
    );
    console.log(
      "SUCCESS! 60 JOBS SEEDED"
    );
    console.log(
      "================================="
    );
    console.log(
      `Company: ${company.name}`
    );
    console.log(
      `Recruiter: ${recruiter.name}`
    );
    console.log(
      `Jobs created: ${jobs.length}`
    );
    console.log(
      "================================="
    );

    process.exit(0);
  } catch (error) {
    console.error("");
    console.error(
      "SEED JOBS ERROR:"
    );
    console.error(error);

    process.exit(1);
  }
};

seedJobs();