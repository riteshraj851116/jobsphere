import React, { useState } from "react";
import { Link } from "react-router-dom";
import { 
  Sparkles, CheckCircle, HelpCircle, Code2, Users, 
  Layers, ArrowRight, Play, BookOpen, CheckSquare, Square 
} from "lucide-react";
import CareerSubNav from "../../components/career/CareerSubNav";
import AIExplanationBanner from "../../components/career/AIExplanationBanner";
import { getInterviewPlan } from "../../services/careerService";
import "../Career/career.css";

export default function InterviewPrepare() {
  const [role, setRole] = useState("Full Stack Developer");
  const [company, setCompany] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("Mid-Level");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [plan, setPlan] = useState(null);
  const [checkedItems, setCheckedItems] = useState({});

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await getInterviewPlan({ role, company, experienceLevel });
      if (res.success && res.data) {
        setPlan(res.data);
        setCheckedItems({});
      } else {
        setError("Failed to generate preparation plan. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Interview plan generation failed.");
    } finally {
      setLoading(false);
    }
  };

  const toggleItem = (key) => {
    setCheckedItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Calculate completion percentage
  const totalTopics = plan ? (
    (plan.technicalTopics?.length || 0) +
    (plan.dsaTopics?.length || 0) +
    (plan.behavioralTopics?.length || 0) +
    (plan.systemDesignTopics?.length || 0) +
    (plan.projectQuestions?.length || 0)
  ) : 0;

  const completedTopics = Object.values(checkedItems).filter(Boolean).length;
  const progressPercent = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

  return (
    <div className="career-os-container">
      <CareerSubNav />

      <div className="career-header-row">
        <div>
          <h1 className="career-os-title" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Sparkles size={28} className="text-primary" /> AI Interview Preparation Intelligence
          </h1>
          <p className="career-os-subtitle">
            Targeted interview blueprint covering Technical, Data Structures, System Architecture, and Behavioral competencies tailored to your specific role and company.
          </p>
        </div>
        <Link to="/interview" className="career-btn-primary" style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <Play size={16} /> Launch Live Mock Interview
        </Link>
      </div>

      {/* Generator Form */}
      <div className="career-card" style={{ marginBottom: "2rem" }}>
        <form onSubmit={handleGenerate} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr)) 160px", gap: "1rem", alignItems: "flex-end" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.35rem" }}>
              Target Role *
            </label>
            <input 
              type="text"
              className="career-input"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. Full Stack Developer"
              required
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.35rem" }}>
              Target Company (Optional)
            </label>
            <input 
              type="text"
              className="career-input"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="e.g. Amazon, Google, Startup"
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.35rem" }}>
              Experience Level
            </label>
            <select
              className="career-input"
              value={experienceLevel}
              onChange={(e) => setExperienceLevel(e.target.value)}
            >
              <option value="Entry / Fresher">Entry / Fresher (0-1 yrs)</option>
              <option value="Junior">Junior (1-2 yrs)</option>
              <option value="Mid-Level">Mid-Level (2-5 yrs)</option>
              <option value="Senior">Senior (5-8 yrs)</option>
              <option value="Lead / Staff">Lead / Staff (8+ yrs)</option>
            </select>
          </div>

          <div>
            <button type="submit" className="career-btn-primary" disabled={loading} style={{ width: "100%", height: "42px", justifyContent: "center" }}>
              {loading ? (
                <div className="career-spinner" style={{ width: "16px", height: "16px", borderWidth: "2px" }} />
              ) : (
                <>Generate Plan</>
              )}
            </button>
          </div>
        </form>

        {error && (
          <div style={{ marginTop: "1rem", padding: "0.75rem", background: "rgba(239, 68, 68, 0.1)", border: "1px solid #ef4444", borderRadius: "8px", color: "#ef4444", fontSize: "0.85rem" }}>
            {error}
          </div>
        )}
      </div>

      {plan && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {/* Progress Overview Header */}
          <div className="career-card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <span className="career-badge-verified" style={{ fontSize: "0.75rem", marginBottom: "0.3rem", display: "inline-block" }}>
                {plan.role} &bull; {plan.experienceLevel} {plan.company ? `@ ${plan.company}` : ""}
              </span>
              <h2 style={{ fontSize: "1.3rem", fontWeight: 700, margin: 0 }}>
                Preparation Readiness Tracker
              </h2>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--accent, #2563eb)" }}>
                  {progressPercent}%
                </div>
                <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                  {completedTopics} / {totalTopics} Completed
                </div>
              </div>
              <div className="career-progress-track" style={{ width: "120px", height: "10px" }}>
                <div className="career-progress-fill" style={{ width: `${progressPercent}%` }} />
              </div>
            </div>
          </div>

          {plan.rationale && (
            <AIExplanationBanner 
              title="Targeted Strategy & Grounding"
              reason={plan.rationale}
            />
          )}

          {/* Topics Grid */}
          <div className="career-grid-2">
            {/* Technical Topics */}
            <div className="career-card">
              <h3 style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Code2 size={18} className="text-primary" /> Technical Core Topics
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                {(plan.technicalTopics || []).map((t, idx) => {
                  const key = `tech-${idx}`;
                  const isDone = checkedItems[key];
                  return (
                    <div 
                      key={key} 
                      onClick={() => toggleItem(key)} 
                      style={{ 
                        display: "flex", 
                        alignItems: "center", 
                        gap: "0.5rem", 
                        padding: "0.5rem", 
                        background: isDone ? "rgba(16, 185, 129, 0.05)" : "var(--bg-secondary, #f8fafc)", 
                        borderRadius: "6px", 
                        cursor: "pointer" 
                      }}
                    >
                      {isDone ? <CheckSquare size={16} style={{ color: "#10b981" }} /> : <Square size={16} style={{ color: "var(--text-secondary)" }} />}
                      <span style={{ fontSize: "0.875rem", textDecoration: isDone ? "line-through" : "none" }}>{t}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* DSA Patterns */}
            <div className="career-card">
              <h3 style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Layers size={18} className="text-primary" /> DSA & Algorithmic Patterns
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                {(plan.dsaTopics || []).map((t, idx) => {
                  const key = `dsa-${idx}`;
                  const isDone = checkedItems[key];
                  return (
                    <div 
                      key={key} 
                      onClick={() => toggleItem(key)} 
                      style={{ 
                        display: "flex", 
                        alignItems: "center", 
                        gap: "0.5rem", 
                        padding: "0.5rem", 
                        background: isDone ? "rgba(16, 185, 129, 0.05)" : "var(--bg-secondary, #f8fafc)", 
                        borderRadius: "6px", 
                        cursor: "pointer" 
                      }}
                    >
                      {isDone ? <CheckSquare size={16} style={{ color: "#10b981" }} /> : <Square size={16} style={{ color: "var(--text-secondary)" }} />}
                      <span style={{ fontSize: "0.875rem", textDecoration: isDone ? "line-through" : "none" }}>{t}</span>
                    </div>
                  );
                })}
              </div>
              <div style={{ marginTop: "1rem" }}>
                <Link to="/dsa" className="career-btn-secondary" style={{ fontSize: "0.8rem", width: "100%", justifyContent: "center" }}>
                  Practice on JobSphere DSA Platform
                </Link>
              </div>
            </div>

            {/* System Design Topics */}
            <div className="career-card">
              <h3 style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Layers size={18} className="text-primary" /> System Architecture & Scalability
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                {(plan.systemDesignTopics || []).map((t, idx) => {
                  const key = `sys-${idx}`;
                  const isDone = checkedItems[key];
                  return (
                    <div 
                      key={key} 
                      onClick={() => toggleItem(key)} 
                      style={{ 
                        display: "flex", 
                        alignItems: "center", 
                        gap: "0.5rem", 
                        padding: "0.5rem", 
                        background: isDone ? "rgba(16, 185, 129, 0.05)" : "var(--bg-secondary, #f8fafc)", 
                        borderRadius: "6px", 
                        cursor: "pointer" 
                      }}
                    >
                      {isDone ? <CheckSquare size={16} style={{ color: "#10b981" }} /> : <Square size={16} style={{ color: "var(--text-secondary)" }} />}
                      <span style={{ fontSize: "0.875rem", textDecoration: isDone ? "line-through" : "none" }}>{t}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Behavioral & Project Deep Dives */}
            <div className="career-card">
              <h3 style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Users size={18} className="text-primary" /> Behavioral & STAR Stories
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                {(plan.behavioralTopics || []).map((t, idx) => {
                  const key = `beh-${idx}`;
                  const isDone = checkedItems[key];
                  return (
                    <div 
                      key={key} 
                      onClick={() => toggleItem(key)} 
                      style={{ 
                        display: "flex", 
                        alignItems: "center", 
                        gap: "0.5rem", 
                        padding: "0.5rem", 
                        background: isDone ? "rgba(16, 185, 129, 0.05)" : "var(--bg-secondary, #f8fafc)", 
                        borderRadius: "6px", 
                        cursor: "pointer" 
                      }}
                    >
                      {isDone ? <CheckSquare size={16} style={{ color: "#10b981" }} /> : <Square size={16} style={{ color: "var(--text-secondary)" }} />}
                      <span style={{ fontSize: "0.875rem", textDecoration: isDone ? "line-through" : "none" }}>{t}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
