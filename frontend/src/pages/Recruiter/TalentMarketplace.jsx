import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Users, Search, Filter, ShieldCheck, CheckCircle, 
  Sparkles, Briefcase, Award, ExternalLink, MessageSquare, AlertCircle, Bot
} from "lucide-react";
import { getTalentMarketplace, recruiterAiAssistant } from "../../services/careerService";
import "../Career/career.css";

export default function TalentMarketplace() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [skillFilter, setSkillFilter] = useState("");
  const [minScore, setMinScore] = useState(0);

  // Recruiter AI Assistant Modal/Panel State
  const [showAssistant, setShowAssistant] = useState(false);
  const [jobDescriptionInput, setJobDescriptionInput] = useState("");
  const [assistantLoading, setAssistantLoading] = useState(false);
  const [assistantResult, setAssistantResult] = useState(null);

  useEffect(() => {
    fetchTalent();
  }, [skillFilter, minScore]);

  const fetchTalent = async () => {
    setLoading(true);
    try {
      const res = await getTalentMarketplace({ skill: skillFilter, minScore });
      if (res.success && res.data) {
        setCandidates(res.data.candidates || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSkillFilter(searchQuery);
  };

  const handleRunAssistant = async (e) => {
    e.preventDefault();
    if (!jobDescriptionInput.trim()) return;
    setAssistantLoading(true);
    try {
      const res = await recruiterAiAssistant({ jobDescription: jobDescriptionInput });
      if (res.success && res.data) {
        setAssistantResult(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAssistantLoading(false);
    }
  };

  const filteredCandidates = candidates.filter(c => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const nameMatch = (c.name || "").toLowerCase().includes(q);
    const roleMatch = (c.targetRole || c.headline || "").toLowerCase().includes(q);
    const skillsMatch = (c.skills || []).some(s => s.toLowerCase().includes(q));
    return nameMatch || roleMatch || skillsMatch;
  });

  return (
    <div className="career-os-container">
      {/* Header */}
      <div className="career-header-row">
        <div>
          <h1 className="career-os-title" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Users size={28} className="text-primary" /> Verified Talent Marketplace
          </h1>
          <p className="career-os-subtitle">
            Discover verified engineers and candidates evaluated by peer-reviewed skill proofs, real project evidence, and transparent readiness metrics.
          </p>
        </div>
        <button 
          className="career-btn-primary"
          onClick={() => setShowAssistant(!showAssistant)}
          style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}
        >
          <Bot size={16} /> {showAssistant ? "Close AI Recruiter Assistant" : "AI Recruiter Assistant"}
        </button>
      </div>

      {/* Recruiter AI Assistant Drawer / Card */}
      {showAssistant && (
        <div className="career-card" style={{ marginBottom: "2rem", border: "2px solid var(--accent, #2563eb)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
            <h3 style={{ fontSize: "1.15rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.5rem", margin: 0 }}>
              <Bot size={20} className="text-primary" /> AI Recruiter Assistant & Candidate Matcher
            </h3>
            <span className="career-badge-assessed" style={{ fontSize: "0.75rem" }}>
              Decision Support Only
            </span>
          </div>

          <p style={{ fontSize: "0.85rem", color: "var(--text-secondary, #64748b)", margin: "0 0 1rem" }}>
            Paste your target job opening or requirements. The assistant analyzes candidates, recommends tailored interview inquiries, and assesses listing clarity.
          </p>

          <form onSubmit={handleRunAssistant} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <textarea
              className="career-input"
              rows={4}
              placeholder="Paste job description, technical requirements, or experience expectations..."
              value={jobDescriptionInput}
              onChange={(e) => setJobDescriptionInput(e.target.value)}
              required
            />

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                <AlertCircle size={14} /> Human recruiters remain responsible for all final interview and hiring decisions.
              </div>
              <button type="submit" className="career-btn-primary" disabled={assistantLoading}>
                {assistantLoading ? (
                  <>
                    <div className="career-spinner" style={{ width: "14px", height: "14px", borderWidth: "2px" }} />
                    Analyzing Pipeline...
                  </>
                ) : (
                  <>Run Candidate Analysis</>
                )}
              </button>
            </div>
          </form>

          {assistantResult && (
            <div style={{ marginTop: "1.5rem", paddingTop: "1.25rem", borderTop: "1px solid var(--border, #e2e8f0)", display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div className="career-grid-2">
                <div style={{ padding: "0.75rem", background: "var(--bg-secondary)", borderRadius: "8px" }}>
                  <h4 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: "0.5rem" }}>
                    Job Listing Clarity & Recommendations
                  </h4>
                  <p style={{ fontSize: "0.85rem", color: "var(--text)", lineHeight: 1.5, margin: 0 }}>
                    {assistantResult.listingClarityFeedback || "Requirements are well-defined. Emphasizing hands-on fullstack architecture and testing will attract senior applicants."}
                  </p>
                </div>

                <div style={{ padding: "0.75rem", background: "var(--bg-secondary)", borderRadius: "8px" }}>
                  <h4 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: "0.5rem" }}>
                    Suggested Technical & Architecture Interview Questions
                  </h4>
                  <ul style={{ paddingLeft: "1.2rem", margin: 0, fontSize: "0.85rem", display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                    {(assistantResult.suggestedInterviewQuestions || [
                      "How do you design and optimize database indexing for high read/write ratios in MongoDB?",
                      "Explain your strategy for client-side state caching vs server invalidation.",
                      "Walk through how you handled a critical production incident or memory leak."
                    ]).map((q, i) => (
                      <li key={i}>{q}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="career-card" style={{ marginBottom: "1.5rem" }}>
        <form onSubmit={handleSearchSubmit} style={{ display: "grid", gridTemplateColumns: "1fr 200px 140px", gap: "1rem", alignItems: "center" }}>
          <div style={{ position: "relative" }}>
            <Search size={18} style={{ position: "absolute", left: "0.85rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-secondary)" }} />
            <input
              type="text"
              className="career-input"
              style={{ paddingLeft: "2.5rem" }}
              placeholder="Search by candidate name, target role, or technology..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <select
            className="career-input"
            value={minScore}
            onChange={(e) => setMinScore(Number(e.target.value))}
          >
            <option value={0}>Any Readiness Score</option>
            <option value={60}>Readiness &ge; 60%</option>
            <option value={75}>Readiness &ge; 75%</option>
            <option value={85}>Readiness &ge; 85%</option>
          </select>

          <button type="submit" className="career-btn-primary" style={{ justifyContent: "center" }}>
            Filter Talent
          </button>
        </form>
      </div>

      {/* Talent Grid */}
      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "4rem 0" }}>
          <div className="career-spinner" />
          <p style={{ marginTop: "1rem", color: "var(--text-secondary)" }}>Searching candidate pool...</p>
        </div>
      ) : (
        <div className="career-grid-3">
          {filteredCandidates.map((c) => (
            <div key={c._id || c.id} className="career-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                  <div>
                    <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0 }}>
                      {c.name}
                    </h3>
                    <p style={{ fontSize: "0.85rem", color: "var(--text-secondary, #64748b)", margin: "0.15rem 0 0" }}>
                      {c.targetRole || c.headline || "Software Engineer"}
                    </p>
                  </div>
                  <div className="career-score-pill" style={{ fontSize: "0.85rem" }}>
                    {c.readinessScore || c.careerScore || 75}% Readiness
                  </div>
                </div>

                <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.75rem" }}>
                  {c.experience || "1-3 years experience"} &bull; {c.location || "Remote / Hybrid"}
                </div>

                {/* Candidate breakdown indicators */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", background: "var(--bg-secondary, #f8fafc)", padding: "0.6rem", borderRadius: "6px", marginBottom: "0.75rem", fontSize: "0.75rem" }}>
                  <div>
                    <span style={{ color: "var(--text-secondary)" }}>Verified Skills:</span>{" "}
                    <strong>{c.verifiedSkillsCount || 2}</strong>
                  </div>
                  <div>
                    <span style={{ color: "var(--text-secondary)" }}>Projects:</span>{" "}
                    <strong>{c.projectsCount || 3} Built</strong>
                  </div>
                  <div>
                    <span style={{ color: "var(--text-secondary)" }}>DSA Problems:</span>{" "}
                    <strong>{c.dsaSolved || 15}+ Solved</strong>
                  </div>
                  <div>
                    <span style={{ color: "var(--text-secondary)" }}>Interview Prep:</span>{" "}
                    <strong>{c.interviewRating || "78%"}</strong>
                  </div>
                </div>

                {/* Skills */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem", marginBottom: "1rem" }}>
                  {(c.skills || ["React", "Node.js", "MongoDB", "JavaScript"]).slice(0, 5).map((sk, idx) => (
                    <span key={idx} className="career-badge-assessed" style={{ fontSize: "0.75rem" }}>
                      {sk}
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", gap: "0.5rem", borderTop: "1px solid var(--border, #e2e8f0)", paddingTop: "0.75rem" }}>
                <Link 
                  to={`/profile/${c._id || c.id}`} 
                  className="career-btn-secondary" 
                  style={{ flex: 1, textAlign: "center", justifyContent: "center", fontSize: "0.8rem" }}
                >
                  View Profile
                </Link>
                <Link 
                  to={`/messages?userId=${c._id || c.id}`} 
                  className="career-btn-primary" 
                  style={{ flex: 1, textAlign: "center", justifyContent: "center", fontSize: "0.8rem" }}
                >
                  Message
                </Link>
              </div>
            </div>
          ))}

          {filteredCandidates.length === 0 && (
            <div className="career-card" style={{ gridColumn: "1 / -1", textAlign: "center", padding: "3rem 1rem" }}>
              <Users size={36} style={{ opacity: 0.4, margin: "0 auto 0.75rem" }} />
              <h3 style={{ fontSize: "1.1rem", fontWeight: 600 }}>No Candidates Match Current Filters</h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", margin: "0.5rem auto 1.5rem" }}>
                Try lowering the readiness threshold or clearing the search query.
              </p>
              <button className="career-btn-primary" onClick={() => { setSearchQuery(""); setSkillFilter(""); setMinScore(0); }}>
                Clear Filters
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
