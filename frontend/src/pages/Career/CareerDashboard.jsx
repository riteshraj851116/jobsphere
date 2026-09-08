import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Compass,
  Sparkles,
  Zap,
  Target,
  Award,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  Cpu,
  Layers,
  FileText,
  Briefcase,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import CareerSubNav from "../../components/career/CareerSubNav";
import CareerGraph from "../../components/career/CareerGraph";
import AIExplanationBanner from "../../components/career/AIExplanationBanner";
import { getCareerTwin, getDailyCareerBrief, updateCareerProfile } from "../../services/careerService";
import { useAuth } from "../../hooks/useAuth";
import "./career.css";

const CareerDashboard = () => {
  const { user } = useAuth();
  const [twinData, setTwinData] = useState(null);
  const [dailyBrief, setDailyBrief] = useState(null);
  const [loading, setLoading] = useState(true);
  const [targetRoleInput, setTargetRoleInput] = useState("");
  const [isEditingRole, setIsEditingRole] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [twinRes, briefRes] = await Promise.all([
        getCareerTwin().catch(() => null),
        getDailyCareerBrief().catch(() => null),
      ]);
      if (twinRes?.success) {
        setTwinData(twinRes.data);
        setTargetRoleInput(twinRes.data.profile?.targetRole || "Full Stack Developer");
      }
      if (briefRes?.success) {
        setDailyBrief(briefRes.data);
      }
    } catch (err) {
      console.error("Error loading career twin:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleUpdateRole = async (e) => {
    e.preventDefault();
    if (!targetRoleInput.trim()) return;
    try {
      const res = await updateCareerProfile({ targetRole: targetRoleInput.trim() });
      if (res.success) {
        setTwinData(res.data);
        setIsEditingRole(false);
      }
    } catch (err) {
      console.error("Error updating role:", err);
    }
  };

  const profile = twinData?.profile || {};
  const rawStats = twinData?.rawStats || {};
  const careerScore = profile.careerScore || 68;

  return (
    <div className="career-container">
      <div className="career-content-limit">
        {/* Sub Navigation Bar */}
        <CareerSubNav />

        {/* Page Header */}
        <div className="career-header">
          <div className="career-badge">
            <Sparkles size={13} />
            <span>AI Career Operating System</span>
          </div>
          <h1 className="career-title">Career Command Center & Digital Twin</h1>
          <p className="career-subtitle">
            Your real-time, evidence-based career profile derived continuously from your skills,
            projects, DSA practice, interview ratings, and resume analytics.
          </p>
        </div>

        {/* Hero Section: Score Ring + Key Metrics */}
        <div className="career-twin-hero">
          {/* Left: Overall Score Card */}
          <div className="career-score-ring-card">
            <div
              className="score-circle-outer"
              style={{ "--score-pct": careerScore }}
            >
              <div className="score-circle-inner">
                <span className="score-number">{careerScore}</span>
                <span className="score-total">Score</span>
              </div>
            </div>

            <h3 style={{ margin: "0 0 0.35rem", fontSize: "1.2rem", fontWeight: 700, color: "var(--text-primary)" }}>
              Career Readiness
            </h3>
            <p style={{ margin: "0 0 1rem", fontSize: "0.825rem", color: "var(--text-secondary)" }}>
              Holistic score evaluated across 5 core competency pillars.
            </p>

            <div style={{ width: "100%", textAlign: "left", fontSize: "0.8rem", color: "var(--text-secondary)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span>Target Role:</span>
                <strong>{profile.targetRole || "Full Stack Developer"}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Experience Level:</span>
                <strong>{profile.experienceLevel || "Junior"}</strong>
              </div>
            </div>
          </div>

          {/* Right: Readiness Gauges */}
          <div className="career-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <div className="career-card-header">
                <h3 className="career-card-title">
                  <Cpu size={18} color="var(--accent, #2563eb)" />
                  Core Competency Gauges
                </h3>
                <button
                  type="button"
                  onClick={loadData}
                  className="career-btn-secondary"
                  style={{ padding: "0.3rem 0.65rem", fontSize: "0.775rem" }}
                  title="Recalculate metrics"
                >
                  <RefreshCw size={13} />
                  <span>Recalculate</span>
                </button>
              </div>

              <div className="readiness-grid">
                {/* Job Readiness */}
                <div className="readiness-item">
                  <div className="readiness-label-row">
                    <span>Job Readiness</span>
                    <span>{profile.jobReadiness || 65}%</span>
                  </div>
                  <div className="readiness-track">
                    <div className="readiness-fill" style={{ width: `${profile.jobReadiness || 65}%` }} />
                  </div>
                </div>

                {/* Interview Readiness */}
                <div className="readiness-item">
                  <div className="readiness-label-row">
                    <span>Interview Readiness</span>
                    <span>{profile.interviewReadiness || 50}%</span>
                  </div>
                  <div className="readiness-track">
                    <div className="readiness-fill" style={{ width: `${profile.interviewReadiness || 50}%`, background: "#3b82f6" }} />
                  </div>
                </div>

                {/* DSA Readiness */}
                <div className="readiness-item">
                  <div className="readiness-label-row">
                    <span>DSA Arena Readiness</span>
                    <span>{profile.dsaReadiness || 45}%</span>
                  </div>
                  <div className="readiness-track">
                    <div className="readiness-fill" style={{ width: `${profile.dsaReadiness || 45}%`, background: "#10b981" }} />
                  </div>
                </div>

                {/* Project Strength */}
                <div className="readiness-item">
                  <div className="readiness-label-row">
                    <span>Project Strength</span>
                    <span>{profile.projectStrength || 70}%</span>
                  </div>
                  <div className="readiness-track">
                    <div className="readiness-fill" style={{ width: `${profile.projectStrength || 70}%`, background: "#8b5cf6" }} />
                  </div>
                </div>

                {/* Resume Strength */}
                <div className="readiness-item">
                  <div className="readiness-label-row">
                    <span>Resume ATS Score</span>
                    <span>{profile.resumeStrength || 60}%</span>
                  </div>
                  <div className="readiness-track">
                    <div className="readiness-fill" style={{ width: `${profile.resumeStrength || 60}%`, background: "#f59e0b" }} />
                  </div>
                </div>
              </div>
            </div>

            {/* AI Explanation First banner */}
            <AIExplanationBanner
              title="How is this score computed?"
              text={`Grounded in actual platform activity: ${rawStats.solvedDsa || 0} solved DSA problems, ${
                rawStats.completedInterviews || 0
              } mock interview sessions, and ${rawStats.totalProjects || 0} documented project(s).`}
            />
          </div>
        </div>

        {/* Interactive Career Flow Graph */}
        <CareerGraph
          currentSkills={profile.strongSkills || []}
          currentRole={profile.currentRole || "Developer"}
          targetRole={profile.targetRole || "Full Stack Developer"}
          missingSkills={profile.missingSkills || []}
        />

        {/* Daily Career Brief & Today's Actions */}
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "1.5rem", marginBottom: "2rem" }}>
          {/* Today's Recommended Actions */}
          <div className="career-card">
            <div className="career-card-header">
              <h3 className="career-card-title">
                <Target size={18} color="var(--accent, #2563eb)" />
                Today's High-Yield Actions
              </h3>
              <span style={{ fontSize: "0.775rem", color: "var(--text-muted)" }}>Prioritized by Impact</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <Link
                to="/career/skill-gap"
                className="milestone-item"
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <div style={{ background: "rgba(37, 99, 235, 0.1)", padding: "0.5rem", borderRadius: "8px" }}>
                  <Target size={18} color="var(--accent, #2563eb)" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--text-primary)" }}>
                    1. Close Key Skill Gap ({profile.missingSkills?.[0] || "TypeScript"})
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                    Eliminating this requirement yields immediate +8% job match boost.
                  </div>
                </div>
                <ArrowRight size={16} color="#94a3b8" />
              </Link>

              <Link
                to="/dsa"
                className="milestone-item"
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <div style={{ background: "rgba(16, 185, 129, 0.1)", padding: "0.5rem", borderRadius: "8px" }}>
                  <Zap size={18} color="#10b981" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--text-primary)" }}>
                    2. Solve Daily DSA Challenge
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                    Maintain your practice streak and strengthen algorithmic intuition.
                  </div>
                </div>
                <ArrowRight size={16} color="#94a3b8" />
              </Link>

              <Link
                to="/career/opportunities"
                className="milestone-item"
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <div style={{ background: "rgba(245, 158, 11, 0.1)", padding: "0.5rem", borderRadius: "8px" }}>
                  <Briefcase size={18} color="#f59e0b" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--text-primary)" }}>
                    3. Review Opportunity Radar Listings
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                    Apply to verified listings with tailored match score breakdowns.
                  </div>
                </div>
                <ArrowRight size={16} color="#94a3b8" />
              </Link>
            </div>
          </div>

          {/* AI Daily Career Brief */}
          <div className="career-card" style={{ background: "linear-gradient(145deg, #ffffff, #f8fafc)", border: "1.5px solid #bfdbfe" }}>
            <div className="career-card-header">
              <h3 className="career-card-title">
                <Sparkles size={18} color="var(--accent, #2563eb)" />
                AI Daily Career Brief
              </h3>
              <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--accent)" }}>
                {dailyBrief?.date || "Today"}
              </span>
            </div>

            <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.55, marginBottom: "1.25rem" }}>
              {dailyBrief?.headline || "Welcome to your personal Career Command Center."}
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {dailyBrief?.items?.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    background: "#ffffff",
                    border: "1px solid var(--border)",
                    borderRadius: "10px",
                    padding: "0.75rem 1rem",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", color: "var(--accent)" }}>
                      {item.badge}
                    </span>
                  </div>
                  <div style={{ fontWeight: 600, fontSize: "0.875rem", color: "var(--text-primary)" }}>
                    {item.title}
                  </div>
                  <div style={{ fontSize: "0.775rem", color: "var(--text-secondary)", marginTop: 2 }}>
                    {item.why}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Skill Diagnosis Breakdown Matrix */}
        <div className="career-card">
          <div className="career-card-header">
            <h3 className="career-card-title">
              <Layers size={18} color="var(--accent, #2563eb)" />
              Skill Diagnostic Breakdown
            </h3>
            <Link to="/career/skill-gap" style={{ fontSize: "0.825rem", color: "var(--accent)", textDecoration: "none", fontWeight: 600 }}>
              Detailed Gap Analysis &rarr;
            </Link>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.25rem" }}>
            {/* Strong Skills */}
            <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "12px", padding: "1rem" }}>
              <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#15803d", textTransform: "uppercase", marginBottom: "0.75rem" }}>
                ✓ Strong / Verified Skills ({profile.strongSkills?.length || 0})
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {profile.strongSkills?.length > 0 ? (
                  profile.strongSkills.map((s, idx) => (
                    <span key={idx} className="passport-badge-verified" style={{ fontSize: "0.7rem" }}>
                      {s}
                    </span>
                  ))
                ) : (
                  <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Add verified skills</span>
                )}
              </div>
            </div>

            {/* Weak / Practicing Skills */}
            <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: "12px", padding: "1rem" }}>
              <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#b45309", textTransform: "uppercase", marginBottom: "0.75rem" }}>
                ⚡ Needs Practice ({profile.weakSkills?.length || 0})
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {profile.weakSkills?.length > 0 ? (
                  profile.weakSkills.map((s, idx) => (
                    <span key={idx} className="passport-badge-practicing" style={{ fontSize: "0.7rem" }}>
                      {s}
                    </span>
                  ))
                ) : (
                  <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>No critical weaknesses</span>
                )}
              </div>
            </div>

            {/* Missing Core Skills */}
            <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "12px", padding: "1rem" }}>
              <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#b91c1c", textTransform: "uppercase", marginBottom: "0.75rem" }}>
                ✕ Missing for {profile.targetRole || "Role"} ({profile.missingSkills?.length || 0})
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {profile.missingSkills?.length > 0 ? (
                  profile.missingSkills.map((s, idx) => (
                    <span key={idx} style={{ background: "#ffffff", border: "1px solid #fca5a5", color: "#b91c1c", padding: "2px 8px", borderRadius: "999px", fontSize: "0.7rem", fontWeight: 600 }}>
                      {s}
                    </span>
                  ))
                ) : (
                  <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>All requirements covered!</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CareerDashboard;
