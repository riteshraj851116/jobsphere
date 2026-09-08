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

            <h3 style={{ margin: "0 0 0.35rem", fontSize: "1.2rem", fontWeight: 700, color: "#f1f5f9" }}>
              Career Readiness
            </h3>
            <p style={{ margin: "0 0 1rem", fontSize: "0.825rem", color: "#94a3b8" }}>
              Holistic score evaluated across 5 core competency pillars.
            </p>

            <div style={{ width: "100%", textAlign: "left", fontSize: "0.8rem", color: "#94a3b8" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span>Target Role:</span>
                <strong style={{ color: "#a78bfa" }}>{profile.targetRole || "Full Stack Developer"}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Experience Level:</span>
                <strong style={{ color: "#22d3ee" }}>{profile.experienceLevel || "Junior"}</strong>
              </div>
            </div>
          </div>

          {/* Right: Readiness Gauges */}
          <div className="career-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <div className="career-card-header">
                <h3 className="career-card-title">
                  <Cpu size={18} color="#a78bfa" />
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
                    <span style={{ color: "#34d399" }}>{profile.jobReadiness || 65}%</span>
                  </div>
                  <div className="readiness-track">
                    <div className="readiness-fill fill-emerald" style={{ width: `${profile.jobReadiness || 65}%` }} />
                  </div>
                </div>

                {/* Interview Readiness */}
                <div className="readiness-item">
                  <div className="readiness-label-row">
                    <span>Interview Readiness</span>
                    <span style={{ color: "#a78bfa" }}>{profile.interviewReadiness || 50}%</span>
                  </div>
                  <div className="readiness-track">
                    <div className="readiness-fill fill-violet" style={{ width: `${profile.interviewReadiness || 50}%` }} />
                  </div>
                </div>

                {/* DSA Readiness */}
                <div className="readiness-item">
                  <div className="readiness-label-row">
                    <span>DSA Arena Readiness</span>
                    <span style={{ color: "#22d3ee" }}>{profile.dsaReadiness || 45}%</span>
                  </div>
                  <div className="readiness-track">
                    <div className="readiness-fill fill-cyan" style={{ width: `${profile.dsaReadiness || 45}%` }} />
                  </div>
                </div>

                {/* Project Strength */}
                <div className="readiness-item">
                  <div className="readiness-label-row">
                    <span>Project Strength</span>
                    <span style={{ color: "#fbbf24" }}>{profile.projectStrength || 70}%</span>
                  </div>
                  <div className="readiness-track">
                    <div className="readiness-fill fill-amber" style={{ width: `${profile.projectStrength || 70}%` }} />
                  </div>
                </div>

                {/* Resume Strength */}
                <div className="readiness-item">
                  <div className="readiness-label-row">
                    <span>Resume ATS Score</span>
                    <span style={{ color: "#fb7185" }}>{profile.resumeStrength || 60}%</span>
                  </div>
                  <div className="readiness-track">
                    <div className="readiness-fill fill-rose" style={{ width: `${profile.resumeStrength || 60}%` }} />
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
        <div className="career-dashboard-brief-grid">
          {/* Today's Recommended Actions */}
          <div className="career-card">
            <div className="career-card-header">
              <h3 className="career-card-title">
                <Target size={18} color="#34d399" />
                Today's High-Yield Actions
              </h3>
              <span style={{ fontSize: "0.775rem", color: "#64748b" }}>Prioritized by Impact</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <Link
                to="/career/skill-gap"
                className="milestone-item"
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <div style={{
                  background: "linear-gradient(135deg, rgba(244, 63, 94, 0.15), rgba(244, 63, 94, 0.08))",
                  padding: "0.55rem",
                  borderRadius: "10px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                  <Target size={18} color="#fb7185" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: "0.9rem", color: "#f1f5f9" }}>
                    1. Close Key Skill Gap ({profile.missingSkills?.[0] || "TypeScript"})
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "#94a3b8" }}>
                    Eliminating this requirement yields immediate +8% job match boost.
                  </div>
                </div>
                <ArrowRight size={16} color="#64748b" />
              </Link>

              <Link
                to="/dsa"
                className="milestone-item"
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <div style={{
                  background: "linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(245, 158, 11, 0.08))",
                  padding: "0.55rem",
                  borderRadius: "10px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                  <Zap size={18} color="#fbbf24" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: "0.9rem", color: "#f1f5f9" }}>
                    2. Solve Daily DSA Challenge
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "#94a3b8" }}>
                    Maintain your practice streak and strengthen algorithmic intuition.
                  </div>
                </div>
                <ArrowRight size={16} color="#64748b" />
              </Link>

              <Link
                to="/career/opportunities"
                className="milestone-item"
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <div style={{
                  background: "linear-gradient(135deg, rgba(6, 182, 212, 0.15), rgba(6, 182, 212, 0.08))",
                  padding: "0.55rem",
                  borderRadius: "10px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                  <Briefcase size={18} color="#22d3ee" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: "0.9rem", color: "#f1f5f9" }}>
                    3. Review Opportunity Radar Listings
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "#94a3b8" }}>
                    Apply to verified listings with tailored match score breakdowns.
                  </div>
                </div>
                <ArrowRight size={16} color="#64748b" />
              </Link>
            </div>
          </div>

          {/* AI Daily Career Brief */}
          <div className="career-card" style={{ background: "rgba(30, 27, 75, 0.5)", border: "1px solid rgba(139, 92, 246, 0.2)" }}>
            <div className="career-card-header">
              <h3 className="career-card-title">
                <Sparkles size={18} color="#a78bfa" />
                AI Daily Career Brief
              </h3>
              <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#a78bfa" }}>
                {dailyBrief?.date || "Today"}
              </span>
            </div>

            <p style={{ fontSize: "0.875rem", color: "#94a3b8", lineHeight: 1.55, marginBottom: "1.25rem" }}>
              {dailyBrief?.headline || "Welcome to your personal Career Command Center."}
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {dailyBrief?.items?.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    background: "rgba(15, 23, 42, 0.5)",
                    border: "1px solid rgba(148, 163, 184, 0.08)",
                    borderRadius: "12px",
                    padding: "0.75rem 1rem",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", color: "#a78bfa", letterSpacing: "0.05em" }}>
                      {item.badge}
                    </span>
                  </div>
                  <div style={{ fontWeight: 600, fontSize: "0.875rem", color: "#f1f5f9" }}>
                    {item.title}
                  </div>
                  <div style={{ fontSize: "0.775rem", color: "#94a3b8", marginTop: 2 }}>
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
              <Layers size={18} color="#22d3ee" />
              Skill Diagnostic Breakdown
            </h3>
            <Link to="/career/skill-gap" style={{ fontSize: "0.825rem", color: "#a78bfa", textDecoration: "none", fontWeight: 600 }}>
              Detailed Gap Analysis &rarr;
            </Link>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.25rem" }}>
            {/* Strong Skills */}
            <div style={{
              background: "rgba(16, 185, 129, 0.06)",
              border: "1px solid rgba(16, 185, 129, 0.15)",
              borderRadius: "14px",
              padding: "1.15rem",
            }}>
              <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#34d399", textTransform: "uppercase", marginBottom: "0.75rem", letterSpacing: "0.04em" }}>
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
                  <span style={{ fontSize: "0.8rem", color: "#64748b" }}>Add verified skills</span>
                )}
              </div>
            </div>

            {/* Weak / Practicing Skills */}
            <div style={{
              background: "rgba(245, 158, 11, 0.06)",
              border: "1px solid rgba(245, 158, 11, 0.15)",
              borderRadius: "14px",
              padding: "1.15rem",
            }}>
              <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#fbbf24", textTransform: "uppercase", marginBottom: "0.75rem", letterSpacing: "0.04em" }}>
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
                  <span style={{ fontSize: "0.8rem", color: "#64748b" }}>No critical weaknesses</span>
                )}
              </div>
            </div>

            {/* Missing Core Skills */}
            <div style={{
              background: "rgba(244, 63, 94, 0.06)",
              border: "1px solid rgba(244, 63, 94, 0.15)",
              borderRadius: "14px",
              padding: "1.15rem",
            }}>
              <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#fb7185", textTransform: "uppercase", marginBottom: "0.75rem", letterSpacing: "0.04em" }}>
                ✕ Missing for {profile.targetRole || "Role"} ({profile.missingSkills?.length || 0})
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {profile.missingSkills?.length > 0 ? (
                  profile.missingSkills.map((s, idx) => (
                    <span key={idx} style={{
                      background: "rgba(244, 63, 94, 0.1)",
                      border: "1px solid rgba(244, 63, 94, 0.2)",
                      color: "#fb7185",
                      padding: "3px 10px",
                      borderRadius: "999px",
                      fontSize: "0.7rem",
                      fontWeight: 700,
                    }}>
                      {s}
                    </span>
                  ))
                ) : (
                  <span style={{ fontSize: "0.8rem", color: "#64748b" }}>All requirements covered!</span>
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
