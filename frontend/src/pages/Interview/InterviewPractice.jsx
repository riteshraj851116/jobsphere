import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Sparkles,
  Code2,
  Atom,
  Server,
  Layers,
  FileCode,
  Users2,
  Globe,
  Clock,
  ArrowRight,
  History,
  CheckCircle2,
  HelpCircle
} from "lucide-react";
import { startInterview } from "../../services/interviewService";
import "./Interview.css";

const ROLES = [
  { id: "Frontend Developer", label: "Frontend Developer", icon: Globe, desc: "HTML, CSS, JS, Web Vitals" },
  { id: "React Developer", label: "React Developer", icon: Atom, desc: "Hooks, VDOM, Performance" },
  { id: "Backend Developer", label: "Backend Developer", icon: Server, desc: "APIs, Auth, Database, Security" },
  { id: "Node.js Developer", label: "Node.js Developer", icon: Code2, desc: "Event Loop, Streams, Express" },
  { id: "MERN Stack Developer", label: "MERN Stack Developer", icon: Layers, desc: "MongoDB, Express, React, Node" },
  { id: "Full Stack Developer", label: "Full Stack Developer", icon: FileCode, desc: "Architecture, Caching, REST" },
  { id: "JavaScript Developer", label: "JavaScript Developer", icon: Code2, desc: "Closures, Promises, ES6+" },
  { id: "HR Interview", label: "HR Interview", icon: Users2, desc: "Behavioral, STAR, Culture Fit" }
];

const DIFFICULTIES = [
  { id: "easy", label: "Easy", desc: "Core concepts & fundamentals" },
  { id: "medium", label: "Medium", desc: "Practical problem solving" },
  { id: "hard", label: "Hard", desc: "Architecture & deep internals" }
];

const QUESTION_COUNTS = [
  { id: 5, label: "5 Questions", timeEstimate: "~10 mins" },
  { id: 10, label: "10 Questions", timeEstimate: "~20 mins" },
  { id: 15, label: "15 Questions", timeEstimate: "~30 mins" }
];

const InterviewPractice = () => {
  const navigate = useNavigate();

  const [selectedRole, setSelectedRole] = useState("MERN Stack Developer");
  const [selectedDifficulty, setSelectedDifficulty] = useState("medium");
  const [selectedCount, setSelectedCount] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleStart = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await startInterview(
        selectedRole,
        selectedDifficulty,
        selectedCount
      );

      const session = response?.data || response?.session || response;
      const sessionId = session?._id || session?.id;

      if (sessionId) {
        navigate(`/interview-practice/session/${sessionId}`);
      } else {
        throw new Error("Could not initialize interview session ID");
      }
    } catch (err) {
      console.error("Failed to start interview:", err);
      setError(
        err?.message || "Failed to start interview session. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="interview-page">
      <div className="interview-container">
        {/* Header */}
        <div className="interview-header">
          <div className="interview-badge">
            <Sparkles size={14} />
            <span>AI-Powered Prep & Self-Assessment</span>
          </div>

          <h1 className="interview-title">Mock Interview Practice</h1>
          <p className="interview-subtitle">
            Practice realistic technical and behavioral interview questions tailored to your target job role. Test your knowledge, refine your answers, and track your progress.
          </p>

          <div className="interview-header-actions">
            <Link to="/interview-practice/history" className="btn-session secondary">
              <History size={16} />
              <span>View Past Interviews</span>
            </Link>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div
            style={{
              background: "#fef2f2",
              border: "1px solid #fecaca",
              color: "#dc2626",
              padding: "12px 16px",
              borderRadius: "12px",
              marginBottom: "1.5rem",
              fontSize: "0.9375rem"
            }}
          >
            {error}
          </div>
        )}

        {/* Setup Form Card */}
        <div className="interview-setup-card">
          <form onSubmit={handleStart}>
            {/* 1. ROLE SELECTION */}
            <div className="setup-section">
              <label className="setup-section-label">
                <Code2 size={16} />
                <span>1. Select Job Role</span>
              </label>

              <div className="role-grid">
                {ROLES.map((role) => {
                  const Icon = role.icon;
                  const isActive = selectedRole === role.id;
                  return (
                    <button
                      type="button"
                      key={role.id}
                      className={`role-card ${isActive ? "active" : ""}`}
                      onClick={() => setSelectedRole(role.id)}
                    >
                      <div className="role-card-icon">
                        <Icon size={18} />
                      </div>
                      <div>
                        <div className="role-card-title">{role.label}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. DIFFICULTY SELECTION */}
            <div className="setup-section">
              <label className="setup-section-label">
                <CheckCircle2 size={16} />
                <span>2. Select Difficulty Level</span>
              </label>

              <div className="pill-grid">
                {DIFFICULTIES.map((diff) => {
                  const isActive = selectedDifficulty === diff.id;
                  return (
                    <button
                      type="button"
                      key={diff.id}
                      className={`pill-button ${isActive ? "active" : ""}`}
                      onClick={() => setSelectedDifficulty(diff.id)}
                    >
                      <span className="pill-button-text">{diff.label}</span>
                      <span className="pill-button-desc">{diff.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. QUESTION COUNT */}
            <div className="setup-section">
              <label className="setup-section-label">
                <HelpCircle size={16} />
                <span>3. Number of Questions</span>
              </label>

              <div className="pill-grid">
                {QUESTION_COUNTS.map((cnt) => {
                  const isActive = selectedCount === cnt.id;
                  return (
                    <button
                      type="button"
                      key={cnt.id}
                      className={`pill-button ${isActive ? "active" : ""}`}
                      onClick={() => setSelectedCount(cnt.id)}
                    >
                      <span className="pill-button-text">{cnt.label}</span>
                      <span className="pill-button-desc">{cnt.timeEstimate}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* SUBMIT BUTTON */}
            <div className="setup-cta-wrapper">
              <button
                type="submit"
                className="btn-start-interview"
                disabled={loading}
              >
                {loading ? (
                  <span>Preparing Your Questions...</span>
                ) : (
                  <>
                    <span>Start Practice Interview</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
              <span className="setup-note">
                Questions are randomized for realistic practice. You can end anytime to review answers.
              </span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default InterviewPractice;
