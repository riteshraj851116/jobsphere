import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Map,
  CheckCircle2,
  Sparkles,
  Layers,
  ArrowRight,
  Loader2,
  TrendingUp,
  Award,
  BookOpen,
  Search,
  Filter,
  Check,
  Compass,
  Code2,
  Server,
  Cpu,
  Cloud,
  BrainCircuit,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Clock,
  Zap,
  Target,
  Share2,
  RotateCcw
} from "lucide-react";
import CareerSubNav from "../../components/career/CareerSubNav";
import { getCareerRoadmap, toggleRoadmapSkill } from "../../services/careerService";
import "./CareerRoadmap.css";

const ROLE_METADATA = [
  { id: "MERN Stack Developer", name: "MERN Stack Developer", icon: Layers, color: "#8b5cf6", estWeeks: "16-20 wks", level: "Full Stack" },
  { id: "Frontend Developer", name: "Frontend Developer", icon: Code2, color: "#06b6d4", estWeeks: "12-16 wks", level: "UI & Client" },
  { id: "Backend Developer", name: "Backend Developer", icon: Server, color: "#10b981", estWeeks: "14-18 wks", level: "Systems & APIs" },
  { id: "Full Stack Developer", name: "Full Stack Developer", icon: Cpu, color: "#f59e0b", estWeeks: "18-24 wks", level: "End-to-End" },
  { id: "Cloud & DevOps", name: "Cloud & DevOps", icon: Cloud, color: "#3b82f6", estWeeks: "16-20 wks", level: "Infrastructure" },
  { id: "AI & ML Engineer", name: "AI & ML Engineer", icon: BrainCircuit, color: "#ec4899", estWeeks: "20-26 wks", level: "ML & Generative AI" },
];

const CareerRoadmap = () => {
  const [selectedRole, setSelectedRole] = useState("MERN Stack Developer");
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMode, setFilterMode] = useState("all"); // 'all' | 'pending' | 'completed' | 'high-priority'
  const [collapsedPhases, setCollapsedPhases] = useState({});
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchRoadmap = async () => {
      try {
        setLoading(true);
        const data = await getCareerRoadmap(selectedRole);
        if (isMounted) {
          const resolvedRoadmap = data?.roadmap || data;
          setRoadmap(resolvedRoadmap);
        }
      } catch (err) {
        console.error("Failed to load roadmap:", err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchRoadmap();

    return () => {
      isMounted = false;
    };
  }, [selectedRole]);

  const handleToggle = async (phaseId, skillId) => {
    if (!roadmap?._id) return;
    setUpdatingId(skillId);

    // Optimistic local state update for instantaneous feedback
    setRoadmap((prev) => {
      if (!prev?.phases) return prev;
      const updatedPhases = prev.phases.map((phase) => {
        if (phase._id === phaseId || phase.id === phaseId) {
          return {
            ...phase,
            skills: phase.skills.map((s) =>
              (s._id === skillId || s.id === skillId) ? { ...s, completed: !s.completed } : s
            )
          };
        }
        return phase;
      });
      return { ...prev, phases: updatedPhases };
    });

    try {
      const res = await toggleRoadmapSkill(roadmap._id, phaseId, skillId);
      if (res?.roadmap) {
        setRoadmap(res.roadmap);
      }
    } catch (err) {
      console.error("Failed to toggle skill:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  const togglePhaseCollapse = (phaseId) => {
    setCollapsedPhases((prev) => ({
      ...prev,
      [phaseId]: !prev[phaseId]
    }));
  };

  // Dynamic calculations across all phases
  const { totalSkills, completedCount, percentage } = useMemo(() => {
    if (!roadmap?.phases || !Array.isArray(roadmap.phases)) {
      return { totalSkills: 0, completedCount: 0, percentage: 0 };
    }
    let total = 0;
    let completed = 0;
    roadmap.phases.forEach((p) => {
      p.skills?.forEach((s) => {
        total++;
        if (s.completed) completed++;
      });
    });
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { totalSkills: total, completedCount: completed, percentage: pct };
  }, [roadmap]);

  const activeRoleMeta = useMemo(() => {
    return ROLE_METADATA.find((r) => r.id === selectedRole) || ROLE_METADATA[0];
  }, [selectedRole]);

  // Filter skills per phase based on search & filter mode
  const filteredPhases = useMemo(() => {
    if (!roadmap?.phases) return [];
    return roadmap.phases.map((phase) => {
      const filteredSkills = (phase.skills || []).filter((skill) => {
        // Search filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesName = skill.name?.toLowerCase().includes(q);
          const matchesDesc = skill.description?.toLowerCase().includes(q);
          if (!matchesName && !matchesDesc) return false;
        }

        // Status filter
        if (filterMode === "pending") return !skill.completed;
        if (filterMode === "completed") return skill.completed;
        if (filterMode === "high-priority") return skill.priority === "high";

        return true;
      });

      return {
        ...phase,
        filteredSkills
      };
    });
  }, [roadmap, searchQuery, filterMode]);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  return (
    <div className="roadmap-page">
      <div className="roadmap-container">
        {/* Navigation Breadcrumb & SubNav */}
        <CareerSubNav />

        {/* Header Hero */}
        <div className="roadmap-header">
          <div className="roadmap-badge">
            <Sparkles size={14} />
            <span>AI Guided Technical Curriculum</span>
          </div>

          <h1 className="roadmap-title">Interactive Career Roadmap</h1>
          <p className="roadmap-subtitle">
            A battle-tested, structured curriculum aligned with top industry hiring standards.
            Track your mastery milestone-by-milestone and accelerate your career progression.
          </p>

          {/* Role selector tabs with icons */}
          <div className="role-selector-tabs">
            {ROLE_METADATA.map((r) => {
              const Icon = r.icon;
              const isSelected = selectedRole === r.id;
              return (
                <button
                  key={r.id}
                  type="button"
                  className={`role-tab-btn ${isSelected ? "active" : ""}`}
                  onClick={() => setSelectedRole(r.id)}
                  style={{
                    "--role-accent": r.color
                  }}
                >
                  <Icon size={16} />
                  <span>{r.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {loading ? (
          <div className="roadmap-loading-box">
            <Loader2 size={40} className="roadmap-spinner" />
            <h3>Generating Real-time Curriculum for {selectedRole}...</h3>
            <p>Syncing verification badges, learning milestones, and skill dependencies.</p>
          </div>
        ) : (
          <>
            {/* Overall Progress Widget — Glassmorphic Dashboard */}
            <div className="roadmap-progress-card">
              <div className="progress-info-left">
                <div className="progress-role-tag">
                  <activeRoleMeta.icon size={15} color={activeRoleMeta.color} />
                  <span>{activeRoleMeta.name}</span>
                  <span className="progress-level-badge">{activeRoleMeta.level}</span>
                </div>

                <h2>Curriculum Progress Overview</h2>
                <p>
                  You have mastered <strong>{completedCount}</strong> of <strong>{totalSkills}</strong> essential technical competencies.
                </p>

                {/* Animated Progress Bar */}
                <div className="progress-bar-container">
                  <div
                    className="progress-bar-fill"
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                <div className="progress-benchmarks">
                  <span>Foundations (0%)</span>
                  <span>Core Stack (50%)</span>
                  <span>Production Ready (100%)</span>
                </div>
              </div>

              {/* Right Side Stat Ring & Badges */}
              <div className="progress-info-right">
                <div className="progress-stat-pill">{percentage}%</div>
                <div className="progress-status-chip">
                  {percentage >= 85
                    ? "🎉 Job Ready!"
                    : percentage >= 65
                    ? "🔥 Advanced Tier"
                    : percentage >= 35
                    ? "⚡ Intermediate"
                    : "🌱 Getting Started"}
                </div>
                <div className="progress-est-time">
                  <Clock size={13} />
                  <span>Est. Duration: {activeRoleMeta.estWeeks}</span>
                </div>
              </div>
            </div>

            {/* Quick Metrics Strip */}
            <div className="roadmap-metrics-strip">
              <div className="metric-strip-card">
                <div className="metric-icon" style={{ background: "rgba(139, 92, 246, 0.15)", color: "#a78bfa" }}>
                  <Layers size={18} />
                </div>
                <div>
                  <div className="metric-val">{roadmap?.phases?.length || 0}</div>
                  <div className="metric-lbl">Curriculum Phases</div>
                </div>
              </div>

              <div className="metric-strip-card">
                <div className="metric-icon" style={{ background: "rgba(16, 185, 129, 0.15)", color: "#34d399" }}>
                  <CheckCircle2 size={18} />
                </div>
                <div>
                  <div className="metric-val">{completedCount} / {totalSkills}</div>
                  <div className="metric-lbl">Skills Mastered</div>
                </div>
              </div>

              <div className="metric-strip-card">
                <div className="metric-icon" style={{ background: "rgba(6, 182, 212, 0.15)", color: "#22d3ee" }}>
                  <TrendingUp size={18} />
                </div>
                <div>
                  <div className="metric-val">+{Math.round(percentage * 0.4)}%</div>
                  <div className="metric-lbl">Interview Readiness</div>
                </div>
              </div>

              <div className="metric-strip-card">
                <div className="metric-icon" style={{ background: "rgba(245, 158, 11, 0.15)", color: "#fbbf24" }}>
                  <Award size={18} />
                </div>
                <div>
                  <div className="metric-val">{totalSkills - completedCount} Left</div>
                  <div className="metric-lbl">Remaining to Learn</div>
                </div>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="roadmap-toolbar">
              <div className="roadmap-search-wrap">
                <Search size={16} className="search-icon" />
                <input
                  type="text"
                  placeholder="Search skills (e.g. React, Docker, MongoDB, TypeScript)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="roadmap-search-input"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="clear-search-btn"
                  >
                    ✕
                  </button>
                )}
              </div>

              <div className="roadmap-filter-chips">
                <button
                  type="button"
                  className={`filter-chip ${filterMode === "all" ? "active" : ""}`}
                  onClick={() => setFilterMode("all")}
                >
                  All Skills ({totalSkills})
                </button>
                <button
                  type="button"
                  className={`filter-chip ${filterMode === "pending" ? "active" : ""}`}
                  onClick={() => setFilterMode("pending")}
                >
                  Pending ({totalSkills - completedCount})
                </button>
                <button
                  type="button"
                  className={`filter-chip ${filterMode === "completed" ? "active" : ""}`}
                  onClick={() => setFilterMode("completed")}
                >
                  Completed ({completedCount})
                </button>
                <button
                  type="button"
                  className={`filter-chip ${filterMode === "high-priority" ? "active" : ""}`}
                  onClick={() => setFilterMode("high-priority")}
                >
                  High Priority
                </button>
              </div>

              <button
                type="button"
                className="roadmap-action-icon-btn"
                onClick={handleShare}
                title="Share or copy roadmap link"
              >
                <Share2 size={16} />
                <span>{copiedLink ? "Copied!" : "Share"}</span>
              </button>
            </div>

            {/* Curriculum Timeline & Phases */}
            <div className="roadmap-timeline-wrapper">
              <div className="roadmap-timeline-line" />

              {filteredPhases.map((phase, idx) => {
                const phaseSkills = phase.skills || [];
                const phaseCompleted = phaseSkills.filter((s) => s.completed).length;
                const phaseTotal = phaseSkills.length;
                const phasePct = phaseTotal > 0 ? Math.round((phaseCompleted / phaseTotal) * 100) : 0;
                const isAllDone = phaseCompleted === phaseTotal && phaseTotal > 0;
                const isCollapsed = collapsedPhases[phase._id || phase.id || idx];
                const phaseNum = phase.phaseNumber || idx + 1;

                return (
                  <div
                    key={phase._id || phase.id || idx}
                    className={`phase-card ${isAllDone ? "phase-completed" : ""}`}
                  >
                    {/* Phase Timeline Connector Node */}
                    <div className="phase-timeline-node">
                      <div className={`node-circle ${isAllDone ? "done" : phasePct > 0 ? "active" : ""}`}>
                        {isAllDone ? <Check size={16} /> : phaseNum}
                      </div>
                    </div>

                    {/* Phase Header */}
                    <div className="phase-header" onClick={() => togglePhaseCollapse(phase._id || phase.id || idx)}>
                      <div className="phase-title-row">
                        <div>
                          <div className="phase-meta-top">
                            <span className="phase-step-badge">Phase {phaseNum}</span>
                            {isAllDone && (
                              <span className="phase-status-tag completed">
                                <Check size={12} /> Completed
                              </span>
                            )}
                            {!isAllDone && phasePct > 0 && (
                              <span className="phase-status-tag in-progress">
                                In Progress ({phasePct}%)
                              </span>
                            )}
                          </div>
                          <h3 className="phase-title">{phase.title}</h3>
                          <p className="phase-desc">{phase.description}</p>
                        </div>
                      </div>

                      <div className="phase-header-right">
                        <div className="phase-progress-mini">
                          <div className="phase-count-text">
                            <strong>{phaseCompleted}</strong> of {phaseTotal} mastered
                          </div>
                          <div className="phase-mini-track">
                            <div className="phase-mini-fill" style={{ width: `${phasePct}%` }} />
                          </div>
                        </div>

                        <button
                          type="button"
                          className="collapse-toggle-btn"
                          aria-label="Toggle Phase"
                          onClick={(e) => {
                            e.stopPropagation();
                            togglePhaseCollapse(phase._id || phase.id || idx);
                          }}
                        >
                          {isCollapsed ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
                        </button>
                      </div>
                    </div>

                    {/* Phase Body: Skills Checklist */}
                    {!isCollapsed && (
                      <div className="skills-checklist">
                        {phase.filteredSkills?.length === 0 ? (
                          <div className="no-skills-matched">
                            <span>No skills match the current filter or search criteria.</span>
                          </div>
                        ) : (
                          phase.filteredSkills?.map((skill) => {
                            const isUpdating = updatingId === (skill._id || skill.id);
                            return (
                              <div
                                key={skill._id || skill.id}
                                className={`skill-check-item ${skill.completed ? "completed" : ""}`}
                                onClick={() => handleToggle(phase._id || phase.id, skill._id || skill.id)}
                              >
                                <div className="custom-checkbox">
                                  {isUpdating ? (
                                    <Loader2 size={13} className="spin-fast" />
                                  ) : skill.completed ? (
                                    <CheckCircle2 size={17} />
                                  ) : null}
                                </div>

                                <div className="skill-text-col">
                                  <div className="skill-name-row">
                                    <span className="skill-name">{skill.name}</span>
                                    <span className={`priority-tag ${skill.priority || "high"}`}>
                                      {skill.priority || "High"}
                                    </span>
                                  </div>

                                  {skill.description && (
                                    <div className="skill-desc">{skill.description}</div>
                                  )}

                                  {/* Learning Resources Pills */}
                                  {skill.resources && skill.resources.length > 0 && (
                                    <div className="skill-resources-row" onClick={(e) => e.stopPropagation()}>
                                      <span className="resources-lbl">Study:</span>
                                      {skill.resources.map((res, rIdx) => {
                                        const queryUrl = `https://www.google.com/search?q=${encodeURIComponent(
                                          `${skill.name} ${res} tutorial documentation`
                                        )}`;
                                        return (
                                          <a
                                            key={rIdx}
                                            href={res.startsWith("http") ? res : queryUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="resource-pill-link"
                                            title={`Search guide on ${res}`}
                                          >
                                            <span>{res}</span>
                                            <ExternalLink size={10} />
                                          </a>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Milestone Celebration Banner when 80%+ */}
            {percentage >= 80 && (
              <div className="roadmap-celebration-card">
                <div className="celebration-icon">
                  <Award size={32} color="#fbbf24" />
                </div>
                <div>
                  <h3>🎉 Impressive! You have reached Job-Ready Milestone!</h3>
                  <p>
                    Your competency in {selectedRole} matches senior entry benchmarks.
                    Test your knowledge with simulated technical interviews to cement your skills.
                  </p>
                </div>
                <Link to="/interview-practice" className="btn-session primary glow">
                  <span>Start Mock Interview</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
            )}

            {/* Footer Navigation CTAs */}
            <div className="roadmap-next-steps-grid">
              <div className="next-step-card">
                <div className="next-step-icon" style={{ background: "rgba(139, 92, 246, 0.15)", color: "#a78bfa" }}>
                  <Sparkles size={20} />
                </div>
                <div className="next-step-info">
                  <h4>Career OS Command Center</h4>
                  <p>Inspect your Digital Twin readiness score, DSA streak, and gap diagnostics.</p>
                </div>
                <Link to="/career" className="btn-step-action">
                  <span>Go to Command Center</span>
                  <ArrowRight size={14} />
                </Link>
              </div>

              <div className="next-step-card">
                <div className="next-step-icon" style={{ background: "rgba(6, 182, 212, 0.15)", color: "#22d3ee" }}>
                  <Zap size={20} />
                </div>
                <div className="next-step-info">
                  <h4>Technical Interview Arena</h4>
                  <p>Practice live AI interview questions tailored for {selectedRole}.</p>
                </div>
                <Link to="/interview-practice" className="btn-step-action">
                  <span>Start Interview Practice</span>
                  <ArrowRight size={14} />
                </Link>
              </div>

              <div className="next-step-card">
                <div className="next-step-icon" style={{ background: "rgba(16, 185, 129, 0.15)", color: "#34d399" }}>
                  <Target size={20} />
                </div>
                <div className="next-step-info">
                  <h4>Skill Gap & Reality Analyzer</h4>
                  <p>Compare your current resume and skills against active market job descriptions.</p>
                </div>
                <Link to="/career/skill-gap" className="btn-step-action">
                  <span>Analyze Skill Gap</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CareerRoadmap;
