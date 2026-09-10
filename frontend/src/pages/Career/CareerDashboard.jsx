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
  Edit3,
  X,
  Check,
  Code2,
  Server,
  Cloud,
  BrainCircuit,
  Map,
  ChevronRight,
  ShieldCheck,
  Sliders,
  Plus
} from "lucide-react";
import CareerSubNav from "../../components/career/CareerSubNav";
import CareerGraph from "../../components/career/CareerGraph";
import AIExplanationBanner from "../../components/career/AIExplanationBanner";
import { getCareerTwin, getDailyCareerBrief, updateCareerProfile } from "../../services/careerService";
import { useAuth } from "../../hooks/useAuth";
import "./career.css";

const PRESET_ROLES = [
  "Full Stack Developer",
  "Frontend Developer",
  "Backend Developer",
  "MERN Stack Developer",
  "Cloud & DevOps",
  "AI & ML Engineer",
  "Software Development Engineer"
];

const PRESET_LEVELS = ["Entry Level", "Junior", "Mid-Level", "Senior", "Lead"];

const CareerDashboard = () => {
  const { user } = useAuth();
  const [twinData, setTwinData] = useState(null);
  const [dailyBrief, setDailyBrief] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);

  // Role & Level Edit State
  const [isEditingRole, setIsEditingRole] = useState(false);
  const [targetRoleInput, setTargetRoleInput] = useState("");
  const [experienceLevelInput, setExperienceLevelInput] = useState("Junior");
  const [updatingRole, setUpdatingRole] = useState(false);

  // Skill matrix filter tab
  const [skillTab, setSkillTab] = useState("all"); // 'all' | 'strong' | 'weak' | 'missing'
  const [newSkillInput, setNewSkillInput] = useState("");
  const [isAddingSkill, setIsAddingSkill] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [twinRes, briefRes] = await Promise.all([
        getCareerTwin().catch(() => null),
        getDailyCareerBrief().catch(() => null),
      ]);
      if (twinRes?.success && twinRes.data) {
        setTwinData(twinRes.data);
        setTargetRoleInput(twinRes.data.profile?.targetRole || "Full Stack Developer");
        setExperienceLevelInput(twinRes.data.profile?.experienceLevel || "Junior");
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

  const handleRecalculate = async () => {
    setRecalculating(true);
    try {
      await loadData();
    } finally {
      setTimeout(() => setRecalculating(false), 500);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!targetRoleInput.trim()) return;
    setUpdatingRole(true);
    try {
      const res = await updateCareerProfile({
        targetRole: targetRoleInput.trim(),
        experienceLevel: experienceLevelInput
      });
      if (res?.success && res.data) {
        setTwinData(res.data);
        setIsEditingRole(false);
      } else {
        // Optimistic update
        setTwinData((prev) => ({
          ...prev,
          profile: {
            ...prev?.profile,
            targetRole: targetRoleInput.trim(),
            experienceLevel: experienceLevelInput
          }
        }));
        setIsEditingRole(false);
      }
    } catch (err) {
      console.error("Error updating role:", err);
    } finally {
      setUpdatingRole(false);
    }
  };

  const handleAddSkill = async (e) => {
    e.preventDefault();
    if (!newSkillInput.trim()) return;
    const skillName = newSkillInput.trim();
    const currentStrong = profile.strongSkills || [];
    if (currentStrong.includes(skillName)) {
      setNewSkillInput("");
      setIsAddingSkill(false);
      return;
    }

    try {
      const updatedSkills = [...currentStrong, skillName];
      const res = await updateCareerProfile({ strongSkills: updatedSkills });
      if (res?.success && res.data) {
        setTwinData(res.data);
      } else {
        setTwinData((prev) => ({
          ...prev,
          profile: {
            ...prev?.profile,
            strongSkills: updatedSkills
          }
        }));
      }
      setNewSkillInput("");
      setIsAddingSkill(false);
    } catch (err) {
      console.error("Failed to add skill:", err);
    }
  };

  const profile = twinData?.profile || {};
  const rawStats = twinData?.rawStats || {};
  const careerScore = profile.careerScore || 68;

  // Tier classification based on careerScore
  const tierInfo = careerScore >= 85
    ? { name: "Diamond Tier", percentile: "Top 5%", color: "#38bdf8", badge: "Elite Ready" }
    : careerScore >= 75
    ? { name: "Platinum Tier", percentile: "Top 15%", color: "#a78bfa", badge: "High Match" }
    : careerScore >= 60
    ? { name: "Gold Tier", percentile: "Top 30%", color: "#fbbf24", badge: "Competitive" }
    : { name: "Silver Tier", percentile: "Top 55%", color: "#94a3b8", badge: "Rising Talent" };

  return (
    <div className="career-container">
      <div className="career-content-limit">
        {/* Sub Navigation Bar */}
        <CareerSubNav />

        {/* Page Header */}
        <div className="career-header">
          <div className="career-header-row">
            <div>
              <div className="career-badge">
                <Sparkles size={14} />
                <span>AI Career Operating System</span>
              </div>
              <h1 className="career-title">Career Command Center & Digital Twin</h1>
              <p className="career-subtitle">
                Your evidence-based real-time career profile derived continuously from solved DSA problems,
                mock interview ratings, ATS resume metrics, and verified skill passport badges.
              </p>
            </div>

            <div className="career-header-actions">
              <button
                type="button"
                onClick={() => setIsEditingRole(true)}
                className="career-btn-secondary"
                title="Change target role and level"
              >
                <Edit3 size={14} />
                <span>Edit Target Role</span>
              </button>
              <button
                type="button"
                onClick={handleRecalculate}
                className="career-btn-secondary"
                disabled={recalculating}
                title="Recalculate career readiness scores"
              >
                <RefreshCw size={14} className={recalculating ? "spin-fast" : ""} />
                <span>{recalculating ? "Syncing..." : "Sync Scores"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Hero Section: Score Ring + Key Competency Metrics */}
        <div className="career-twin-hero">
          {/* Left: Overall Score Card with SVG Radial Ring */}
          <div className="career-score-ring-card">
            <div className="tier-pill" style={{ "--tier-color": tierInfo.color }}>
              <ShieldCheck size={13} color={tierInfo.color} />
              <span>{tierInfo.percentile} Candidate • {tierInfo.name}</span>
            </div>

            {/* SVG Animated Radial Score Ring */}
            <div className="score-circle-outer" style={{ "--score-pct": careerScore }}>
              <div className="score-circle-inner">
                <span className="score-number">{careerScore}</span>
                <span className="score-total">Readiness</span>
              </div>
            </div>

            <h3 className="score-card-heading">
              Career Readiness Index
            </h3>
            <p className="score-card-subtext">
              Holistic benchmark evaluated dynamically across platform activity.
            </p>

            {/* Target Role & Level details */}
            <div className="score-meta-panel">
              <div className="score-meta-row">
                <span className="meta-label">Target Role:</span>
                <strong className="meta-val role-highlight">{profile.targetRole || "Full Stack Developer"}</strong>
              </div>
              <div className="score-meta-row">
                <span className="meta-label">Experience Tier:</span>
                <strong className="meta-val level-highlight">{profile.experienceLevel || "Junior"}</strong>
              </div>
              <div className="score-meta-row">
                <span className="meta-label">Match Probability:</span>
                <strong className="meta-val match-highlight">{(careerScore * 1.1).toFixed(0)}% to Interviews</strong>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsEditingRole(true)}
              className="quick-edit-role-btn"
            >
              <Sliders size={13} />
              <span>Customize Trajectory</span>
            </button>
          </div>

          {/* Right: Readiness Gauges */}
          <div className="career-card gauges-card">
            <div>
              <div className="career-card-header">
                <h3 className="career-card-title">
                  <Cpu size={18} color="#a78bfa" />
                  Core Competency Pillars
                </h3>
                <span className="industry-bench-tag">
                  Industry Benchmark: 65%
                </span>
              </div>

              <div className="readiness-grid">
                {/* 1. Job Market Match */}
                <div className="readiness-item">
                  <div className="readiness-label-row">
                    <span className="gauge-name">
                      <Briefcase size={14} color="#34d399" />
                      Job Market Fit
                    </span>
                    <span className="gauge-val" style={{ color: "#34d399" }}>
                      {profile.jobReadiness || 65}%
                    </span>
                  </div>
                  <div className="readiness-track">
                    <div className="readiness-fill fill-emerald" style={{ width: `${profile.jobReadiness || 65}%` }} />
                  </div>
                  <div className="gauge-footer-row">
                    <span className="gauge-status-badge high">Competitive</span>
                    <Link to="/career/opportunities" className="gauge-boost-link">
                      Radar &rarr;
                    </Link>
                  </div>
                </div>

                {/* 2. Technical Interview Readiness */}
                <div className="readiness-item">
                  <div className="readiness-label-row">
                    <span className="gauge-name">
                      <Sparkles size={14} color="#a78bfa" />
                      Interview Readiness
                    </span>
                    <span className="gauge-val" style={{ color: "#a78bfa" }}>
                      {profile.interviewReadiness || 50}%
                    </span>
                  </div>
                  <div className="readiness-track">
                    <div className="readiness-fill fill-violet" style={{ width: `${profile.interviewReadiness || 50}%` }} />
                  </div>
                  <div className="gauge-footer-row">
                    <span className="gauge-status-badge mid">
                      {rawStats.completedInterviews || 0} Sessions
                    </span>
                    <Link to="/interview-practice" className="gauge-boost-link">
                      Practice &rarr;
                    </Link>
                  </div>
                </div>

                {/* 3. DSA Arena Readiness */}
                <div className="readiness-item">
                  <div className="readiness-label-row">
                    <span className="gauge-name">
                      <Code2 size={14} color="#22d3ee" />
                      DSA Arena
                    </span>
                    <span className="gauge-val" style={{ color: "#22d3ee" }}>
                      {profile.dsaReadiness || 45}%
                    </span>
                  </div>
                  <div className="readiness-track">
                    <div className="readiness-fill fill-cyan" style={{ width: `${profile.dsaReadiness || 45}%` }} />
                  </div>
                  <div className="gauge-footer-row">
                    <span className="gauge-status-badge mid">
                      {rawStats.solvedDsa || 0} Solved
                    </span>
                    <Link to="/dsa" className="gauge-boost-link">
                      Solve DSA &rarr;
                    </Link>
                  </div>
                </div>

                {/* 4. Project Portfolio Strength */}
                <div className="readiness-item">
                  <div className="readiness-label-row">
                    <span className="gauge-name">
                      <Layers size={14} color="#fbbf24" />
                      Project Strength
                    </span>
                    <span className="gauge-val" style={{ color: "#fbbf24" }}>
                      {profile.projectStrength || 70}%
                    </span>
                  </div>
                  <div className="readiness-track">
                    <div className="readiness-fill fill-amber" style={{ width: `${profile.projectStrength || 70}%` }} />
                  </div>
                  <div className="gauge-footer-row">
                    <span className="gauge-status-badge high">
                      {rawStats.totalProjects || 0} Projects
                    </span>
                    <Link to="/projects/ai-advisor" className="gauge-boost-link">
                      Advisor &rarr;
                    </Link>
                  </div>
                </div>

                {/* 5. Resume ATS Score */}
                <div className="readiness-item">
                  <div className="readiness-label-row">
                    <span className="gauge-name">
                      <FileText size={14} color="#fb7185" />
                      Resume ATS Score
                    </span>
                    <span className="gauge-val" style={{ color: "#fb7185" }}>
                      {profile.resumeStrength || 60}%
                    </span>
                  </div>
                  <div className="readiness-track">
                    <div className="readiness-fill fill-rose" style={{ width: `${profile.resumeStrength || 60}%` }} />
                  </div>
                  <div className="gauge-footer-row">
                    <span className="gauge-status-badge mid">Needs Audit</span>
                    <Link to="/resume-analyzer" className="gauge-boost-link">
                      Scan Resume &rarr;
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Explanation First banner */}
            <AIExplanationBanner
              title="How is this score computed?"
              text={`Grounded directly in active platform telemetry: ${rawStats.solvedDsa || 0} solved DSA problems, ${
                rawStats.completedInterviews || 0
              } completed mock interviews, and ${rawStats.totalProjects || 0} documented project architecture(s).`}
            />
          </div>
        </div>

        {/* AI Career OS Quick Launchpad / Ecosystem Dock */}
        <div className="career-ecosystem-strip">
          <div className="ecosystem-header">
            <div className="ecosystem-title">
              <Sparkles size={16} color="#a78bfa" />
              <span>Career OS Suite Tools</span>
            </div>
            <span className="ecosystem-sub">Connected AI modules optimizing your path</span>
          </div>

          <div className="ecosystem-grid">
            <Link to="/career-roadmap" className="ecosystem-card">
              <div className="eco-icon" style={{ background: "rgba(139, 92, 246, 0.15)", color: "#a78bfa" }}>
                <Map size={18} />
              </div>
              <div className="eco-content">
                <div className="eco-name">Career Roadmap</div>
                <div className="eco-desc">Step-by-step role curriculum</div>
              </div>
              <ChevronRight size={14} className="eco-arrow" />
            </Link>

            <Link to="/career/autopilot" className="ecosystem-card">
              <div className="eco-icon" style={{ background: "rgba(6, 182, 212, 0.15)", color: "#22d3ee" }}>
                <Zap size={18} />
              </div>
              <div className="eco-content">
                <div className="eco-name">AI Autopilot</div>
                <div className="eco-desc">Autonomous goal roadmaps</div>
              </div>
              <ChevronRight size={14} className="eco-arrow" />
            </Link>

            <Link to="/career/skill-gap" className="ecosystem-card">
              <div className="eco-icon" style={{ background: "rgba(244, 63, 94, 0.15)", color: "#fb7185" }}>
                <Target size={18} />
              </div>
              <div className="eco-content">
                <div className="eco-name">Skill Gap Analyzer</div>
                <div className="eco-desc">Pinpoint missing requirements</div>
              </div>
              <ChevronRight size={14} className="eco-arrow" />
            </Link>

            <Link to="/career/simulator" className="ecosystem-card">
              <div className="eco-icon" style={{ background: "rgba(245, 158, 11, 0.15)", color: "#fbbf24" }}>
                <Cpu size={18} />
              </div>
              <div className="eco-content">
                <div className="eco-name">Career Simulator</div>
                <div className="eco-desc">Simulate salary & trajectory</div>
              </div>
              <ChevronRight size={14} className="eco-arrow" />
            </Link>

            <Link to="/projects/ai-advisor" className="ecosystem-card">
              <div className="eco-icon" style={{ background: "rgba(16, 185, 129, 0.15)", color: "#34d399" }}>
                <Layers size={18} />
              </div>
              <div className="eco-content">
                <div className="eco-name">Project Advisor</div>
                <div className="eco-desc">Architecture & resume builders</div>
              </div>
              <ChevronRight size={14} className="eco-arrow" />
            </Link>

            <Link to="/career/opportunities" className="ecosystem-card">
              <div className="eco-icon" style={{ background: "rgba(99, 102, 241, 0.15)", color: "#818cf8" }}>
                <Briefcase size={18} />
              </div>
              <div className="eco-content">
                <div className="eco-name">Opportunity Radar</div>
                <div className="eco-desc">Ranked high-match openings</div>
              </div>
              <ChevronRight size={14} className="eco-arrow" />
            </Link>
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

            <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
              <Link
                to="/career/skill-gap"
                className="milestone-item-box"
              >
                <div className="milestone-icon-wrap" style={{ background: "rgba(244, 63, 94, 0.12)", color: "#fb7185" }}>
                  <Target size={18} />
                </div>
                <div style={{ flex: 1 }}>
                  <div className="milestone-title">
                    1. Close Key Skill Gap ({profile.missingSkills?.[0] || "TypeScript"})
                  </div>
                  <div className="milestone-desc">
                    Mastering this high-priority requirement yields immediate +8% job match boost.
                  </div>
                </div>
                <div className="milestone-badge-impact">+8% Match</div>
                <ArrowRight size={16} color="#64748b" />
              </Link>

              <Link
                to="/dsa"
                className="milestone-item-box"
              >
                <div className="milestone-icon-wrap" style={{ background: "rgba(245, 158, 11, 0.12)", color: "#fbbf24" }}>
                  <Zap size={18} />
                </div>
                <div style={{ flex: 1 }}>
                  <div className="milestone-title">
                    2. Solve Daily DSA Arena Challenge
                  </div>
                  <div className="milestone-desc">
                    Maintain your practice streak and strengthen algorithmic problem solving.
                  </div>
                </div>
                <div className="milestone-badge-impact" style={{ color: "#fbbf24", borderColor: "rgba(245, 158, 11, 0.3)" }}>+1 Streak</div>
                <ArrowRight size={16} color="#64748b" />
              </Link>

              <Link
                to="/career-roadmap"
                className="milestone-item-box"
              >
                <div className="milestone-icon-wrap" style={{ background: "rgba(139, 92, 246, 0.12)", color: "#a78bfa" }}>
                  <Map size={18} />
                </div>
                <div style={{ flex: 1 }}>
                  <div className="milestone-title">
                    3. Check Off Roadmap Milestones
                  </div>
                  <div className="milestone-desc">
                    Review your {profile.targetRole || "Full Stack"} curriculum and check off mastered competencies.
                  </div>
                </div>
                <div className="milestone-badge-impact" style={{ color: "#a78bfa", borderColor: "rgba(139, 92, 246, 0.3)" }}>Curriculum</div>
                <ArrowRight size={16} color="#64748b" />
              </Link>
            </div>
          </div>

          {/* AI Daily Career Brief */}
          <div className="career-card ai-brief-card">
            <div className="career-card-header">
              <h3 className="career-card-title">
                <Sparkles size={18} color="#a78bfa" />
                AI Daily Career Intelligence Brief
              </h3>
              <span className="daily-brief-date">
                {dailyBrief?.date || "Today"}
              </span>
            </div>

            <p className="daily-brief-headline">
              {dailyBrief?.headline || "Your career trajectory is primed for significant velocity. Focusing on targeted gaps will yield maximum hiring conversion."}
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {dailyBrief?.items?.map((item, idx) => (
                <div key={idx} className="brief-item-row">
                  <div className="brief-item-top">
                    <span className="brief-badge">{item.badge}</span>
                  </div>
                  <div className="brief-title">{item.title}</div>
                  <div className="brief-why">{item.why}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Skill Diagnostic Breakdown Matrix */}
        <div className="career-card">
          <div className="career-card-header">
            <div>
              <h3 className="career-card-title">
                <Layers size={18} color="#22d3ee" />
                Skill Diagnostic Matrix
              </h3>
              <p style={{ margin: "4px 0 0", fontSize: "0.8rem", color: "#94a3b8" }}>
                Continuous audit across verified strengths, items requiring practice, and target role requisites.
              </p>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <button
                type="button"
                onClick={() => setIsAddingSkill(true)}
                className="career-btn-secondary"
                style={{ padding: "0.4rem 0.8rem", fontSize: "0.78rem" }}
              >
                <Plus size={13} />
                <span>Add Skill</span>
              </button>
              <Link to="/career/skill-gap" className="skill-gap-detail-link">
                Detailed Gap Analysis &rarr;
              </Link>
            </div>
          </div>

          {/* Add Skill Form Modal */}
          {isAddingSkill && (
            <form onSubmit={handleAddSkill} className="add-skill-bar">
              <input
                type="text"
                placeholder="Enter skill name (e.g. Next.js, Docker, Redux, PostgreSQL)..."
                value={newSkillInput}
                onChange={(e) => setNewSkillInput(e.target.value)}
                className="add-skill-input"
                autoFocus
              />
              <button type="submit" className="add-skill-btn">
                <Check size={14} />
                <span>Save</span>
              </button>
              <button
                type="button"
                onClick={() => { setIsAddingSkill(false); setNewSkillInput(""); }}
                className="cancel-skill-btn"
              >
                <X size={14} />
              </button>
            </form>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1.25rem", marginTop: "1rem" }}>
            {/* Strong Skills */}
            <div className="diagnostic-col verified">
              <div className="diagnostic-col-title">
                ✓ Strong / Verified Skills ({profile.strongSkills?.length || 0})
              </div>
              <div className="diagnostic-badge-wrap">
                {profile.strongSkills?.length > 0 ? (
                  profile.strongSkills.map((s, idx) => (
                    <span key={idx} className="passport-badge-verified">
                      {s}
                    </span>
                  ))
                ) : (
                  <span className="no-skills-ph">Click "Add Skill" to record verified strengths</span>
                )}
              </div>
            </div>

            {/* Weak / Practicing Skills */}
            <div className="diagnostic-col practicing">
              <div className="diagnostic-col-title" style={{ color: "#fbbf24" }}>
                ⚡ Needs Practice ({profile.weakSkills?.length || 0})
              </div>
              <div className="diagnostic-badge-wrap">
                {profile.weakSkills?.length > 0 ? (
                  profile.weakSkills.map((s, idx) => (
                    <span key={idx} className="passport-badge-practicing">
                      {s}
                    </span>
                  ))
                ) : (
                  <span className="no-skills-ph">No critical weaknesses detected</span>
                )}
              </div>
            </div>

            {/* Missing Core Skills */}
            <div className="diagnostic-col missing">
              <div className="diagnostic-col-title" style={{ color: "#fb7185" }}>
                ✕ Missing for {profile.targetRole || "Role"} ({profile.missingSkills?.length || 0})
              </div>
              <div className="diagnostic-badge-wrap">
                {profile.missingSkills?.length > 0 ? (
                  profile.missingSkills.map((s, idx) => (
                    <span key={idx} className="passport-badge-missing">
                      {s}
                    </span>
                  ))
                ) : (
                  <span className="no-skills-ph" style={{ color: "#34d399" }}>All role requirements covered!</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Role & Experience Level Customizer Modal */}
        {isEditingRole && (
          <div className="career-modal-backdrop" onClick={() => setIsEditingRole(false)}>
            <div className="career-modal-card" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Sliders size={18} color="#a78bfa" />
                  <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 800, color: "#f8fafc" }}>
                    Customize Target Career Trajectory
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditingRole(false)}
                  className="modal-close-btn"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveProfile} className="modal-form">
                <div className="form-group">
                  <label className="form-label">Target Role</label>
                  <input
                    type="text"
                    value={targetRoleInput}
                    onChange={(e) => setTargetRoleInput(e.target.value)}
                    placeholder="e.g. Full Stack Developer"
                    className="modal-input"
                    required
                  />

                  {/* Preset quick buttons */}
                  <div className="preset-pills-wrap">
                    <span className="preset-label">Quick select:</span>
                    {PRESET_ROLES.map((r) => (
                      <button
                        key={r}
                        type="button"
                        className={`preset-pill ${targetRoleInput === r ? "selected" : ""}`}
                        onClick={() => setTargetRoleInput(r)}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Experience Level</label>
                  <div className="level-select-grid">
                    {PRESET_LEVELS.map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        className={`level-btn ${experienceLevelInput === lvl ? "selected" : ""}`}
                        onClick={() => setExperienceLevelInput(lvl)}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    onClick={() => setIsEditingRole(false)}
                    className="modal-btn-cancel"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updatingRole}
                    className="modal-btn-submit"
                  >
                    {updatingRole ? "Saving..." : "Save Trajectory & Recalculate"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CareerDashboard;
