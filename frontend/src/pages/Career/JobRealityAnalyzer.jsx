import React, { useState } from "react";
import { Link } from "react-router-dom";
import { 
  FileSearch, CheckCircle, AlertTriangle, AlertCircle, 
  HelpCircle, ArrowRight, ShieldCheck, Sparkles, BookOpen 
} from "lucide-react";
import CareerSubNav from "../../components/career/CareerSubNav";
import AIExplanationBanner from "../../components/career/AIExplanationBanner";
import { analyzeJobReality } from "../../services/careerService";
import "./career.css";

export default function JobRealityAnalyzer() {
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [rawText, setRawText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [analysis, setAnalysis] = useState(null);

  const sampleJob = () => {
    setJobTitle("Senior Full Stack Engineer (MERN)");
    setCompany("CloudScale Technologies");
    setRawText(`About the Role:
We are looking for a Senior Full Stack Engineer to scale our real-time collaboration suite.
Requirements:
- 3+ years experience with React, TypeScript, Node.js, and Express.
- Deep expertise in MongoDB, Redis caching, and REST/WebSocket architectures.
- Experience with Docker containerization and AWS (ECS, S3).
- Strong computer science fundamentals: Data Structures, Algorithms, and System Design.
- Excellent communication and team mentorship skills.

Nice to Have:
- Knowledge of GraphQL and Microservices.
- Familiarity with CI/CD pipelines (GitHub Actions).`);
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!rawText.trim() || rawText.trim().length < 20) {
      setError("Please paste a comprehensive job description (at least 20 characters).");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await analyzeJobReality({ jobTitle, company, rawText });
      if (res.success && res.data) {
        setAnalysis(res.data);
      } else {
        setError("Unable to complete analysis. Please check the text and try again.");
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to analyze job description.");
    } finally {
      setLoading(false);
    }
  };

  const getVerdictBadge = (verdict) => {
    const v = (verdict || "").toLowerCase();
    if (v.includes("highly recommended") || v.includes("strong fit") || v.includes("apply")) {
      return { class: "career-badge-verified", icon: CheckCircle, label: verdict || "Recommended to Apply" };
    }
    if (v.includes("caution") || v.includes("gap") || v.includes("prepare")) {
      return { class: "career-badge-assessed", icon: AlertTriangle, label: verdict || "Prepare Before Applying" };
    }
    return { class: "career-badge-practicing", icon: AlertCircle, label: verdict || "Evaluated" };
  };

  return (
    <div className="career-os-container">
      <CareerSubNav />

      <div className="career-header-row">
        <div>
          <h1 className="career-os-title" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <FileSearch size={28} className="text-primary" /> AI Job Reality Analyzer
          </h1>
          <p className="career-os-subtitle">
            Paste any job posting. The AI extracts unvarnished reality, highlights interview focus areas, and delivers an evidence-grounded &ldquo;Should I apply?&rdquo; verdict.
          </p>
        </div>
        <button type="button" className="career-btn-secondary" onClick={sampleJob}>
          Load Sample Job
        </button>
      </div>

      <div className="career-card" style={{ marginBottom: "2rem" }}>
        <form onSubmit={handleAnalyze} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.35rem" }}>
                Target Role / Job Title (Optional)
              </label>
              <input
                type="text"
                className="career-input"
                placeholder="e.g. Full Stack Developer"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.35rem" }}>
                Company Name (Optional)
              </label>
              <input
                type="text"
                className="career-input"
                placeholder="e.g. Stripe, TechCorp"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.35rem" }}>
              Job Description or Raw Posting Text *
            </label>
            <textarea
              className="career-input"
              rows={8}
              placeholder="Paste responsibilities, requirements, qualifications, tech stack..."
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              required
            />
          </div>

          {error && (
            <div style={{ padding: "0.75rem 1rem", background: "rgba(239, 68, 68, 0.1)", border: "1px solid #ef4444", borderRadius: "8px", color: "#ef4444", fontSize: "0.875rem" }}>
              {error}
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button type="submit" className="career-btn-primary" disabled={loading} style={{ minWidth: "180px" }}>
              {loading ? (
                <>
                  <div className="career-spinner" style={{ width: "16px", height: "16px", borderWidth: "2px" }} />
                  Analyzing Job...
                </>
              ) : (
                <>
                  <Sparkles size={16} /> Analyze Job Reality
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {analysis && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {/* Verdict Banner */}
          <div className="career-card" style={{ borderLeft: "4px solid var(--accent, #2563eb)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem", marginBottom: "0.75rem" }}>
              <div>
                <span style={{ fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-secondary, #64748b)" }}>
                  Application Verdict
                </span>
                <h2 style={{ fontSize: "1.5rem", fontWeight: 700, margin: "0.25rem 0 0" }}>
                  {analysis.shouldApplyVerdict || "Should You Apply?"}
                </h2>
              </div>
              <div className="career-score-pill" style={{ fontSize: "1rem", padding: "0.4rem 1rem" }}>
                Match Confidence: {analysis.matchScoreEstimate ? `${analysis.matchScoreEstimate}%` : "Grounded"}
              </div>
            </div>

            <p style={{ fontSize: "0.95rem", lineHeight: 1.6, color: "var(--text, #1e293b)", marginBottom: "1rem" }}>
              {analysis.verdictExplanation}
            </p>

            {analysis.evidenceExplanation && (
              <AIExplanationBanner 
                title="Evidence Behind This Verdict"
                reason={analysis.evidenceExplanation}
              />
            )}
          </div>

          {/* Breakdown Grid */}
          <div className="career-grid-2">
            {/* Required vs Preferred Skills */}
            <div className="career-card">
              <h3 style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <CheckCircle size={18} className="text-primary" /> Required & Preferred Skills
              </h3>
              <div style={{ marginBottom: "1rem" }}>
                <h4 style={{ fontSize: "0.85rem", color: "var(--text-secondary, #64748b)", marginBottom: "0.5rem", textTransform: "uppercase" }}>
                  Must-Have Skills
                </h4>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                  {(analysis.extractedSkills?.required || []).map((sk, i) => (
                    <span key={i} className="career-badge-verified">
                      {sk}
                    </span>
                  ))}
                  {(!analysis.extractedSkills?.required || analysis.extractedSkills.required.length === 0) && (
                    <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>None explicitly detected</span>
                  )}
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: "0.85rem", color: "var(--text-secondary, #64748b)", marginBottom: "0.5rem", textTransform: "uppercase" }}>
                  Preferred / Nice-to-Have
                </h4>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                  {(analysis.extractedSkills?.preferred || []).map((sk, i) => (
                    <span key={i} className="career-badge-assessed">
                      {sk}
                    </span>
                  ))}
                  {(!analysis.extractedSkills?.preferred || analysis.extractedSkills.preferred.length === 0) && (
                    <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>None listed</span>
                  )}
                </div>
              </div>
            </div>

            {/* Likely Interview Questions & Topics */}
            <div className="career-card">
              <h3 style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <HelpCircle size={18} className="text-primary" /> Likely Interview Focus Areas
              </h3>
              <ul style={{ paddingLeft: "1.25rem", margin: 0, display: "flex", flexDirection: "column", gap: "0.5rem", fontSize: "0.9rem" }}>
                {(analysis.likelyInterviewAreas || []).map((topic, i) => (
                  <li key={i}>{topic}</li>
                ))}
                {(!analysis.likelyInterviewAreas || analysis.likelyInterviewAreas.length === 0) && (
                  <li style={{ color: "var(--text-secondary)" }}>Core data structures, frameworks, and architecture.</li>
                )}
              </ul>
              <div style={{ marginTop: "1.25rem" }}>
                <Link to="/interview/prepare" className="career-btn-secondary" style={{ display: "inline-flex", fontSize: "0.85rem" }}>
                  <BookOpen size={14} /> Open Targeted Interview Prep
                </Link>
              </div>
            </div>
          </div>

          {/* Potential Concerns / Missing Details */}
          <div className="career-grid-2">
            <div className="career-card">
              <h3 style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem", color: "#f59e0b" }}>
                <AlertTriangle size={18} /> Potential Concerns / Red Flags
              </h3>
              <ul style={{ paddingLeft: "1.25rem", margin: 0, display: "flex", flexDirection: "column", gap: "0.5rem", fontSize: "0.9rem" }}>
                {(analysis.potentialConcerns || []).map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
                {(!analysis.potentialConcerns || analysis.potentialConcerns.length === 0) && (
                  <li style={{ color: "var(--text-secondary)" }}>No major red flags detected in description.</li>
                )}
              </ul>
            </div>

            <div className="career-card">
              <h3 style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <ShieldCheck size={18} className="text-primary" /> Missing Information in Job Ad
              </h3>
              <ul style={{ paddingLeft: "1.25rem", margin: 0, display: "flex", flexDirection: "column", gap: "0.5rem", fontSize: "0.9rem" }}>
                {(analysis.missingInformation || []).map((m, i) => (
                  <li key={i}>{m}</li>
                ))}
                {(!analysis.missingInformation || analysis.missingInformation.length === 0) && (
                  <li style={{ color: "var(--text-secondary)" }}>Posting is reasonably transparent.</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
