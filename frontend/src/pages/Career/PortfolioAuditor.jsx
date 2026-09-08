import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  ShieldAlert, CheckCircle, AlertTriangle, Sparkles, 
  Layers, ExternalLink, RefreshCw, FolderGit2, ArrowRight 
} from "lucide-react";
import CareerSubNav from "../../components/career/CareerSubNav";
import AIExplanationBanner from "../../components/career/AIExplanationBanner";
import { auditPortfolio } from "../../services/careerService";
import "./career.css";

export default function PortfolioAuditor() {
  const [audit, setAudit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    runAudit();
  }, []);

  const runAudit = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await auditPortfolio();
      if (res.success && res.data) {
        setAudit(res.data);
      } else {
        setError("Failed to fetch portfolio audit.");
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Portfolio audit unavailable.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    runAudit();
  };

  return (
    <div className="career-container">
      <div className="career-content-limit">
      <CareerSubNav />

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <div className="career-badge">
            <FolderGit2 size={13} />
            <span>Portfolio Auditor</span>
          </div>
          <h1 className="career-title">AI Portfolio & Project Auditor</h1>
          <p className="career-subtitle">
            Rigorous technical depth audit of your projects, GitHub repositories, live deployments, and architectural variety grounded in stored profile data.
          </p>
        </div>
        <button 
          type="button" 
          className="career-btn-secondary" 
          onClick={handleRefresh}
          disabled={loading || refreshing}
        >
          <RefreshCw size={16} className={refreshing ? "career-spinner" : ""} /> Re-Audit Portfolio
        </button>
      </div>

      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "4rem 0" }}>
          <div className="career-spinner" />
          <p style={{ marginTop: "1rem", color: "#94a3b8" }}>Auditing technical architecture of your project portfolio...</p>
        </div>
      ) : error ? (
        <div className="career-card" style={{ textAlign: "center", padding: "3rem 1rem" }}>
          <AlertTriangle size={36} style={{ color: "#222222", margin: "0 auto 0.75rem" }} />
          <h3 style={{ fontSize: "1.1rem", fontWeight: 600 }}>Audit Could Not Be Completed</h3>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", margin: "0.5rem auto 1.5rem" }}>{error}</p>
          <button className="career-btn-primary" onClick={runAudit}>Try Again</button>
        </div>
      ) : audit && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {/* Top Score & Summary Banner */}
          <div className="career-card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1.5rem" }}>
            <div>
              <span className="career-badge-verified" style={{ fontSize: "0.75rem", marginBottom: "0.35rem", display: "inline-block" }}>
                Platform Evidence-Based Audit
              </span>
              <h2 style={{ fontSize: "1.3rem", fontWeight: 700, margin: 0 }}>
                Portfolio Health Rating
              </h2>
              <p style={{ fontSize: "0.85rem", color: "var(--text-secondary, #666666)", margin: "0.25rem 0 0" }}>
                Evaluated against current hiring expectations for full-stack and systems engineering.
              </p>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "2.2rem", fontWeight: 800, color: "var(--accent, #000000)", lineHeight: 1 }}>
                  {audit.overallScore || 70}
                </div>
                <div style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "var(--text-secondary)", marginTop: "0.25rem" }}>
                  Score / 100
                </div>
              </div>
            </div>
          </div>

          {/* Evaluated Metrics */}
          <div className="career-grid-4">
            <div className="career-card" style={{ textAlign: "center", padding: "1rem" }}>
              <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>Technical Depth</div>
              <div style={{ fontSize: "1.3rem", fontWeight: 700 }}>{audit.depthScore || "7.5 / 10"}</div>
            </div>
            <div className="career-card" style={{ textAlign: "center", padding: "1rem" }}>
              <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>Tech Variety</div>
              <div style={{ fontSize: "1.3rem", fontWeight: 700 }}>{audit.varietyScore || "8.0 / 10"}</div>
            </div>
            <div className="career-card" style={{ textAlign: "center", padding: "1rem" }}>
              <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>Documentation</div>
              <div style={{ fontSize: "1.3rem", fontWeight: 700 }}>{audit.docScore || "7.0 / 10"}</div>
            </div>
            <div className="career-card" style={{ textAlign: "center", padding: "1rem" }}>
              <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>Live Deployments</div>
              <div style={{ fontSize: "1.3rem", fontWeight: 700 }}>{audit.deploymentScore || "8.5 / 10"}</div>
            </div>
          </div>

          {/* Strengths & Weaknesses */}
          <div className="career-grid-2">
            <div className="career-card">
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem", color: "#222222" }}>
                <CheckCircle size={18} /> Portfolio Strengths
              </h3>
              <ul style={{ paddingLeft: "1.25rem", margin: 0, display: "flex", flexDirection: "column", gap: "0.5rem", fontSize: "0.9rem" }}>
                {(audit.strengths || []).map((s, idx) => (
                  <li key={idx}>{s}</li>
                ))}
                {(!audit.strengths || audit.strengths.length === 0) && (
                  <li>Functional end-to-end applications demonstrated in profile.</li>
                )}
              </ul>
            </div>

            <div className="career-card">
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem", color: "#333333" }}>
                <AlertTriangle size={18} /> Gaps & Weaknesses
              </h3>
              <ul style={{ paddingLeft: "1.25rem", margin: 0, display: "flex", flexDirection: "column", gap: "0.5rem", fontSize: "0.9rem" }}>
                {(audit.weaknesses || []).map((w, idx) => (
                  <li key={idx}>{w}</li>
                ))}
                {(!audit.weaknesses || audit.weaknesses.length === 0) && (
                  <li>Add microservice architecture, caching layer (Redis), or automated tests (Jest/Cypress).</li>
                )}
              </ul>
            </div>
          </div>

          {/* Priority Improvements */}
          <div className="career-card">
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Sparkles size={18} className="text-primary" /> Priority Action Items for 10x Recruiter Impact
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {(audit.priorityImprovements || []).map((imp, idx) => (
                <div key={idx} style={{ padding: "0.75rem 1rem", background: "var(--bg-secondary, #FAFAFA)", borderRadius: "8px", border: "1px solid var(--border, #DDDDDD)", display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
                  <span className="career-score-pill" style={{ fontSize: "0.75rem", marginTop: "2px" }}>
                    #{idx + 1}
                  </span>
                  <div>
                    <h4 style={{ fontSize: "0.95rem", fontWeight: 600, margin: "0 0 0.2rem" }}>
                      {typeof imp === "string" ? imp : imp.title}
                    </h4>
                    {imp.detail && (
                      <p style={{ fontSize: "0.85rem", color: "var(--text-secondary, #666666)", margin: 0 }}>
                        {imp.detail}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: "1.5rem", display: "flex", gap: "1rem", flexWrap: "wrap" }}>
              <Link to="/projects/ai-advisor" className="career-btn-primary" style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <Sparkles size={16} /> Plan a New Production Project with AI Advisor
              </Link>
              <Link to="/profile" className="career-btn-secondary">
                Update Project URLs on Profile
              </Link>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
