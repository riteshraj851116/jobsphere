import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Sparkles,
  ArrowRight,
  RotateCcw,
  History,
  FileText,
  Briefcase,
  Layers,
  Loader2,
  Check,
  X,
  Lightbulb
} from "lucide-react";
import { getResumeAnalysisById } from "../../services/resumeService";
import "./ResumeAnalyzer.css";

const ResumeAnalysisResult = () => {
  const { analysisId } = useParams();
  const navigate = useNavigate();

  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;
    const fetchResult = async () => {
      try {
        setLoading(true);
        const res = await getResumeAnalysisById(analysisId);
        const data = res?.data || res?.analysis || res;
        if (isMounted) {
          setAnalysis(data);
        }
      } catch (err) {
        console.error("Failed to load analysis result:", err);
        if (isMounted) {
          setError(err?.message || "Failed to load resume analysis.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchResult();

    return () => {
      isMounted = false;
    };
  }, [analysisId]);

  if (loading) {
    return (
      <div className="resume-page">
        <div className="resume-container" style={{ textAlign: "center", padding: "4rem 0" }}>
          <Loader2 size={36} style={{ margin: "0 auto 1rem", animation: "spin 1s linear infinite" }} />
          <h3>Generating ATS Compatibility Report...</h3>
        </div>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="resume-page">
        <div className="resume-container">
          <div className="resume-card" style={{ textAlign: "center", padding: "3rem" }}>
            <AlertCircle size={48} color="#dc2626" style={{ margin: "0 auto 1rem" }} />
            <h2>Analysis Report Not Found</h2>
            <p style={{ color: "#71717a", margin: "1rem 0" }}>{error || "Unable to load analysis."}</p>
            <Link to="/resume-analyzer" className="btn-session primary">
              Back to Resume Analyzer
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const score = analysis.atsScore || 0;
  let statusClass = "poor";
  let statusText = "Needs Improvement";

  if (score >= 80) {
    statusClass = "excellent";
    statusText = "Excellent Match";
  } else if (score >= 65) {
    statusClass = "good";
    statusText = "Good Match";
  } else if (score >= 45) {
    statusClass = "moderate";
    statusText = "Moderate Match";
  }

  const breakdown = analysis.scoreBreakdown || {
    keywordMatch: 0,
    skillsMatch: 0,
    experienceRelevance: 0,
    resumeStructure: 0,
    atsReadability: 0
  };

  const sections = analysis.sectionAnalysis || {};

  return (
    <div className="resume-page">
      <div className="resume-container">
        {/* ATS HERO SCORE CARD */}
        <div className="ats-hero">
          <div className="ats-score-display">
            <div className={`score-circle-wrapper ${statusClass}`}>
              <span className="score-big-num">{score}</span>
              <span className="score-max-num">/ 100</span>
            </div>

            <div>
              <div className={`ats-status-badge ${statusClass}`}>
                <Sparkles size={14} />
                <span>{statusText}</span>
              </div>
              <h1 style={{ fontSize: "1.5rem", fontWeight: "800", color: "var(--text-primary, #18181b)", margin: "4px 0" }}>
                {analysis.jobTitle || "Job Position"}
              </h1>
              <p style={{ fontSize: "0.875rem", color: "#52525b", margin: 0 }}>
                File: <strong>{analysis.resumeFileName}</strong> &bull; Analyzed on{" "}
                {new Date(analysis.createdAt).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric"
                })}
              </p>
            </div>
          </div>

          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <Link to="/resume-analyzer" className="btn-session primary">
              <RotateCcw size={15} />
              <span>Scan Another Resume</span>
            </Link>

            <Link to="/resume-analyzer/history" className="btn-session secondary">
              <History size={15} />
              <span>View Past Scans</span>
            </Link>

            {analysis.jobId && (
              <Link to={`/jobs/${analysis.jobId}`} className="btn-session secondary">
                <Briefcase size={15} />
                <span>View Job Details</span>
              </Link>
            )}
          </div>
        </div>

        {/* 1. SCORE BREAKDOWN METRICS */}
        <div className="breakdown-card">
          <h2 style={{ fontSize: "1.25rem", fontWeight: "700", marginBottom: "1.5rem" }}>
            ATS Compatibility Breakdown
          </h2>

          <div className="breakdown-row">
            <div className="breakdown-label-row">
              <span>1. Keyword Match (35%)</span>
              <span>{breakdown.keywordMatch} / 35 pts</span>
            </div>
            <div className="breakdown-bar-track">
              <div
                className="breakdown-bar-fill"
                style={{
                  width: `${(breakdown.keywordMatch / 35) * 100}%`,
                  background: breakdown.keywordMatch >= 25 ? "#16a34a" : "#2563eb"
                }}
              />
            </div>
          </div>

          <div className="breakdown-row">
            <div className="breakdown-label-row">
              <span>2. Required Skills Match (25%)</span>
              <span>{breakdown.skillsMatch} / 25 pts</span>
            </div>
            <div className="breakdown-bar-track">
              <div
                className="breakdown-bar-fill"
                style={{
                  width: `${(breakdown.skillsMatch / 25) * 100}%`,
                  background: breakdown.skillsMatch >= 18 ? "#16a34a" : "#2563eb"
                }}
              />
            </div>
          </div>

          <div className="breakdown-row">
            <div className="breakdown-label-row">
              <span>3. Experience Relevance & Action Verbs (20%)</span>
              <span>{breakdown.experienceRelevance} / 20 pts</span>
            </div>
            <div className="breakdown-bar-track">
              <div
                className="breakdown-bar-fill"
                style={{
                  width: `${(breakdown.experienceRelevance / 20) * 100}%`,
                  background: breakdown.experienceRelevance >= 14 ? "#16a34a" : "#2563eb"
                }}
              />
            </div>
          </div>

          <div className="breakdown-row">
            <div className="breakdown-label-row">
              <span>4. Resume Structure & Key Sections (10%)</span>
              <span>{breakdown.resumeStructure} / 10 pts</span>
            </div>
            <div className="breakdown-bar-track">
              <div
                className="breakdown-bar-fill"
                style={{
                  width: `${(breakdown.resumeStructure / 10) * 100}%`,
                  background: breakdown.resumeStructure >= 8 ? "#16a34a" : "#d97706"
                }}
              />
            </div>
          </div>

          <div className="breakdown-row">
            <div className="breakdown-label-row">
              <span>5. ATS Readability & Formatting (10%)</span>
              <span>{breakdown.atsReadability} / 10 pts</span>
            </div>
            <div className="breakdown-bar-track">
              <div
                className="breakdown-bar-fill"
                style={{
                  width: `${(breakdown.atsReadability / 10) * 100}%`,
                  background: breakdown.atsReadability >= 8 ? "#16a34a" : "#16a34a"
                }}
              />
            </div>
          </div>
        </div>

        {/* 2. KEYWORDS & SKILLS MATCH */}
        <div className="analysis-grid-2col">
          {/* Matched Keywords */}
          <div className="resume-card" style={{ margin: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "0.5rem" }}>
              <CheckCircle2 size={18} color="#16a34a" />
              <h3 style={{ fontSize: "1.125rem", fontWeight: "700", margin: 0 }}>
                Matched Keywords ({analysis.matchedKeywords?.length || 0})
              </h3>
            </div>
            <p style={{ fontSize: "0.8125rem", color: "#71717a" }}>
              Important terms from the job description detected in your resume:
            </p>

            <div className="keywords-tag-container">
              {analysis.matchedKeywords && analysis.matchedKeywords.length > 0 ? (
                analysis.matchedKeywords.map((kw, idx) => (
                  <span key={idx} className="tag-matched">
                    <Check size={13} />
                    <span>{kw}</span>
                  </span>
                ))
              ) : (
                <span style={{ fontSize: "0.875rem", color: "#71717a", fontStyle: "italic" }}>
                  No significant keywords matched.
                </span>
              )}
            </div>
          </div>

          {/* Missing Keywords */}
          <div className="resume-card" style={{ margin: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "0.5rem" }}>
              <XCircle size={18} color="#dc2626" />
              <h3 style={{ fontSize: "1.125rem", fontWeight: "700", margin: 0 }}>
                Missing Keywords ({analysis.missingKeywords?.length || 0})
              </h3>
            </div>
            <p style={{ fontSize: "0.8125rem", color: "#71717a" }}>
              Keywords present in the job description that were not detected:
            </p>

            <div className="keywords-tag-container">
              {analysis.missingKeywords && analysis.missingKeywords.length > 0 ? (
                analysis.missingKeywords.map((kw, idx) => (
                  <span key={idx} className="tag-missing">
                    <X size={13} />
                    <span>{kw}</span>
                  </span>
                ))
              ) : (
                <span style={{ fontSize: "0.875rem", color: "#16a34a", fontWeight: "600" }}>
                  Outstanding! All primary keywords found.
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 3. RESUME SECTION ANALYSIS */}
        <div className="resume-card">
          <h3 style={{ fontSize: "1.125rem", fontWeight: "700", margin: "0 0 0.5rem" }}>
            Resume Section Structure Analysis
          </h3>
          <p style={{ fontSize: "0.8125rem", color: "#71717a" }}>
            ATS parsers require standard headings to accurately index your background and contact info:
          </p>

          <div className="section-checks-grid">
            <div className={`section-check-item ${sections.contactInfo ? "found" : "missing"}`}>
              {sections.contactInfo ? <CheckCircle2 size={16} color="#16a34a" /> : <XCircle size={16} color="#dc2626" />}
              <span>Contact Information</span>
            </div>

            <div className={`section-check-item ${sections.summary ? "found" : "missing"}`}>
              {sections.summary ? <CheckCircle2 size={16} color="#16a34a" /> : <XCircle size={16} color="#dc2626" />}
              <span>Professional Summary</span>
            </div>

            <div className={`section-check-item ${sections.skills ? "found" : "missing"}`}>
              {sections.skills ? <CheckCircle2 size={16} color="#16a34a" /> : <XCircle size={16} color="#dc2626" />}
              <span>Technical Skills</span>
            </div>

            <div className={`section-check-item ${sections.experience ? "found" : "missing"}`}>
              {sections.experience ? <CheckCircle2 size={16} color="#16a34a" /> : <XCircle size={16} color="#dc2626" />}
              <span>Work Experience</span>
            </div>

            <div className={`section-check-item ${sections.education ? "found" : "missing"}`}>
              {sections.education ? <CheckCircle2 size={16} color="#16a34a" /> : <XCircle size={16} color="#dc2626" />}
              <span>Education</span>
            </div>

            <div className={`section-check-item ${sections.projects ? "found" : "missing"}`}>
              {sections.projects ? <CheckCircle2 size={16} color="#16a34a" /> : <XCircle size={16} color="#dc2626" />}
              <span>Projects / Portfolio</span>
            </div>
          </div>
        </div>

        {/* 4. ACTIONABLE SUGGESTIONS */}
        <div className="resume-card">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Lightbulb size={20} color="var(--accent, #2563eb)" />
            <h3 style={{ fontSize: "1.125rem", fontWeight: "700", margin: 0 }}>
              Actionable Improvement Suggestions
            </h3>
          </div>

          <ul className="suggestion-list">
            {analysis.suggestions && analysis.suggestions.length > 0 ? (
              analysis.suggestions.map((sug, idx) => (
                <li key={idx} className="suggestion-item">
                  <Sparkles size={16} style={{ flexShrink: 0, marginTop: "2px" }} />
                  <span>{sug}</span>
                </li>
              ))
            ) : (
              <li className="suggestion-item">
                Your resume is well aligned with the requirements.
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ResumeAnalysisResult;
