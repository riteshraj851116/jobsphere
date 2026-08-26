import React from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowUpRight,
  Briefcase,
  Building2,
  CheckCircle2,
  Clock3,
  MapPin,
  Share2,
  Bookmark,
} from "lucide-react";
import CareerGraph from "../../components/three/CareerGraph";
import CareerPath from "../../components/three/CareerPath";
import ThreeScene from "../../components/three/ThreeScene";
import "./JobDetails.css";

const JOBS = [
  {
    id: "1",
    title: "Frontend React Developer",
    company: "TechNova",
    location: "Bangalore, India",
    type: "Full Time",
    mode: "Remote",
    experience: "Mid Level",
    salary: "₹8L – ₹14L",
    posted: "2 days ago",
    category: "Software Development",
    skills: ["React", "JavaScript", "CSS", "Git"],
    description:
      "We are looking for a frontend developer who enjoys building fast, accessible and polished web experiences using React.",
    responsibilities: [
      "Build reusable React components and frontend features.",
      "Work closely with designers and backend developers.",
      "Write clean, maintainable and responsive code.",
      "Improve application performance and user experience.",
    ],
    requirements: [
      "Strong knowledge of React and JavaScript.",
      "Understanding of HTML, CSS and responsive design.",
      "Experience working with REST APIs.",
      "Good Git and debugging skills.",
    ],
  },
  {
    id: "2",
    title: "MERN Stack Developer",
    company: "PixelForge",
    location: "Hyderabad, India",
    type: "Full Time",
    mode: "Hybrid",
    experience: "Entry Level",
    salary: "₹5L – ₹9L",
    posted: "1 day ago",
    category: "Software Development",
    skills: ["MongoDB", "Express", "React", "Node.js"],
    description:
      "Join our engineering team and help build modern full-stack applications using the MERN stack.",
    responsibilities: [
      "Develop frontend and backend application features.",
      "Create and integrate REST APIs.",
      "Work with MongoDB data models.",
      "Collaborate with the product and engineering teams.",
    ],
    requirements: [
      "Basic knowledge of MongoDB, Express, React and Node.js.",
      "Understanding of REST APIs.",
      "Good problem-solving ability.",
      "Willingness to learn and work with a team.",
    ],
  },
  {
    id: "3",
    title: "UI/UX Designer",
    company: "Northstar Studio",
    location: "Delhi, India",
    type: "Full Time",
    mode: "On-site",
    experience: "Mid Level",
    salary: "₹6L – ₹11L",
    posted: "3 days ago",
    category: "Design",
    skills: ["Figma", "UI Design", "UX Research"],
    description:
      "Design thoughtful digital experiences and turn complex product requirements into simple interfaces.",
    responsibilities: [
      "Create wireframes and high-fidelity designs.",
      "Work with product and engineering teams.",
      "Maintain design systems and reusable components.",
      "Conduct user research and usability testing.",
    ],
    requirements: [
      "Strong Figma skills.",
      "Good understanding of UX principles.",
      "Strong visual and interaction design sense.",
      "Ability to communicate design decisions clearly.",
    ],
  },
  {
    id: "4",
    title: "Product Manager",
    company: "Orbit Labs",
    location: "Mumbai, India",
    type: "Full Time",
    mode: "Hybrid",
    experience: "Senior Level",
    salary: "₹14L – ₹22L",
    posted: "4 days ago",
    category: "Product",
    skills: ["Product Strategy", "Agile", "Analytics"],
    description:
      "Own product initiatives from discovery to launch and work with cross-functional teams to create meaningful products.",
    responsibilities: [
      "Define product priorities and roadmap.",
      "Work with engineering and design teams.",
      "Analyze product performance.",
      "Translate user needs into product requirements.",
    ],
    requirements: [
      "Strong product management experience.",
      "Excellent communication skills.",
      "Experience with Agile methodologies.",
      "Strong analytical and strategic thinking.",
    ],
  },
  {
    id: "5",
    title: "Backend Node.js Developer",
    company: "CloudPeak",
    location: "Pune, India",
    type: "Full Time",
    mode: "Remote",
    experience: "Mid Level",
    salary: "₹9L – ₹16L",
    posted: "5 days ago",
    category: "Software Development",
    skills: ["Node.js", "Express", "MongoDB"],
    description:
      "Build scalable backend services and APIs for products used by thousands of customers.",
    responsibilities: [
      "Develop secure REST APIs.",
      "Design MongoDB schemas.",
      "Improve backend performance.",
      "Write tests and maintain backend services.",
    ],
    requirements: [
      "Strong Node.js knowledge.",
      "Experience with Express.",
      "MongoDB experience.",
      "Understanding of authentication and APIs.",
    ],
  },
  {
    id: "6",
    title: "Digital Marketing Specialist",
    company: "GrowthGrid",
    location: "Gurgaon, India",
    type: "Full Time",
    mode: "Hybrid",
    experience: "Entry Level",
    salary: "₹4L – ₹7L",
    posted: "6 days ago",
    category: "Marketing",
    skills: ["SEO", "Google Ads", "Analytics"],
    description:
      "Help grow our digital presence through performance marketing, content and search optimization.",
    responsibilities: [
      "Manage digital marketing campaigns.",
      "Track campaign performance.",
      "Improve organic search visibility.",
      "Prepare marketing performance reports.",
    ],
    requirements: [
      "Understanding of digital marketing.",
      "Basic SEO knowledge.",
      "Analytical mindset.",
      "Strong communication skills.",
    ],
  },
  {
    id: "7",
    title: "Data Analyst",
    company: "InsightWorks",
    location: "Chennai, India",
    type: "Full Time",
    mode: "On-site",
    experience: "Mid Level",
    salary: "₹7L – ₹12L",
    posted: "1 week ago",
    category: "Data",
    skills: ["SQL", "Python", "Power BI"],
    description:
      "Turn business data into useful insights that help teams make better decisions.",
    responsibilities: [
      "Analyze large datasets.",
      "Build dashboards and reports.",
      "Identify business trends.",
      "Work with stakeholders to understand data requirements.",
    ],
    requirements: [
      "Strong SQL skills.",
      "Knowledge of data visualization.",
      "Analytical thinking.",
      "Basic Python knowledge.",
    ],
  },
  {
    id: "8",
    title: "HR Business Partner",
    company: "PeopleFirst",
    location: "Noida, India",
    type: "Full Time",
    mode: "Hybrid",
    experience: "Senior Level",
    salary: "₹10L – ₹17L",
    posted: "1 week ago",
    category: "Human Resources",
    skills: ["Recruitment", "HR", "People Ops"],
    description:
      "Partner with teams to build a strong employee experience and support people-focused business initiatives.",
    responsibilities: [
      "Partner with business leaders.",
      "Support employee engagement programs.",
      "Improve people operations.",
      "Help develop HR processes.",
    ],
    requirements: [
      "Strong HR experience.",
      "Excellent communication skills.",
      "Knowledge of people operations.",
      "Strong stakeholder management.",
    ],
  },
];

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const job = JOBS.find((item) => item.id === id);

  if (!job) {
    return (
      <main className="job-details-page">
        <div className="container job-not-found">
          <div className="not-found-icon">
            <Briefcase size={28} />
          </div>

          <h1>Job not found.</h1>

          <p>
            This position may have been removed or is no longer
            available.
          </p>

          <button onClick={() => navigate("/jobs")}>
            <ArrowLeft size={16} />
            Back to Jobs
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="job-details-page">
      <section className="job-details-hero">
        <div className="container">
          <Link to="/jobs" className="back-link">
            <ArrowLeft size={16} />
            Back to jobs
          </Link>

          <div className="job-hero-grid">
            <div>
              <div className="job-detail-eyebrow">
                {job.category}
              </div>

              <h1>{job.title}</h1>

              <div className="job-detail-company">
                <div className="company-mark">
                  <Building2 size={25} />
                </div>

                <div>
                  <strong>{job.company}</strong>
                  <span>Hiring now</span>
                </div>
              </div>

              <div className="detail-meta">
                <span>
                  <MapPin size={16} />
                  {job.location}
                </span>

                <span>
                  <Briefcase size={16} />
                  {job.type}
                </span>

                <span>
                  <Clock3 size={16} />
                  {job.posted}
                </span>
              </div>
            </div>

            <div className="job-hero-actions">
              <div className="hero-salary">
                <span>COMPENSATION</span>
                <strong>{job.salary}</strong>
                <small>per year</small>
              </div>

              <button
                className="apply-button"
                onClick={() => navigate("/login")}
              >
                Apply Now
                <ArrowUpRight size={18} />
              </button>

              <div className="secondary-actions">
                <button type="button">
                  <Bookmark size={17} />
                  Save Job
                </button>

                <button type="button">
                  <Share2 size={17} />
                  Share
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="job-details-content">
        <div className="container details-layout">
          <article className="job-description">
            <div className="detail-block">
              <span className="block-number">01</span>

              <div>
                <h2>About the role</h2>
                <p>{job.description}</p>
              </div>
            </div>

            <div className="detail-block">
              <span className="block-number">02</span>

              <div>
                <h2>Responsibilities</h2>

                <ul>
                  {job.responsibilities.map((item) => (
                    <li key={item}>
                      <CheckCircle2 size={17} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="detail-block">
              <span className="block-number">03</span>

              <div>
                <h2>Requirements</h2>

                <ul>
                  {job.requirements.map((item) => (
                    <li key={item}>
                      <CheckCircle2 size={17} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="detail-block">
              <span className="block-number">04</span>

              <div>
                <h2>Where this role can take you</h2>
                <p style={{ marginBottom: "1rem", fontSize: "0.875rem", color: "var(--text-secondary)" }}>
                  Skill graph & 3D career progression pathway for this position.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <SceneCanvas minHeight="260px">
                    <CareerGraph skills={job.skills} />
                  </SceneCanvas>
                  <SceneCanvas minHeight="260px">
                    <CareerPath />
                  </SceneCanvas>
                </div>
              </div>
            </div>
          </article>

          <aside className="job-detail-sidebar">
            <div className="side-card">
              <span className="side-label">
                JOB INFORMATION
              </span>

              <div className="info-row">
                <span>Experience</span>
                <strong>{job.experience}</strong>
              </div>

              <div className="info-row">
                <span>Work mode</span>
                <strong>{job.mode}</strong>
              </div>

              <div className="info-row">
                <span>Job type</span>
                <strong>{job.type}</strong>
              </div>

              <div className="info-row">
                <span>Category</span>
                <strong>{job.category}</strong>
              </div>
            </div>

            <div className="side-card skills-card">
              <span className="side-label">SKILLS</span>

              <div className="detail-skills">
                {job.skills.map((skill) => (
                  <span key={skill}>{skill}</span>
                ))}
              </div>
            </div>

            <div className="company-card">
              <div className="company-card-icon">
                <Building2 size={22} />
              </div>

              <span>ABOUT COMPANY</span>

              <h3>{job.company}</h3>

              <p>
                Learn more about the company, culture and
                opportunities.
              </p>

              <button type="button">
                View Company
                <ArrowUpRight size={15} />
              </button>
            </div>
          </aside>
        </div>
      </section>

      <section className="job-apply-banner">
        <div className="container">
          <div>
            <span>READY TO APPLY?</span>
            <h2>
              Make your
              <br />
              <em>next move.</em>
            </h2>
          </div>

          <button onClick={() => navigate("/login")}>
            Apply for this role
            <ArrowUpRight size={18} />
          </button>
        </div>
      </section>
    </main>
  );
};

export default JobDetails;