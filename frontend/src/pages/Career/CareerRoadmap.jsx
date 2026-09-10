import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Map,
  CheckCircle2,
  Sparkles,
  Layers,
  ArrowRight,
  TrendingUp,
  Award,
  BookOpen,
  Search,
  Filter,
  Check,
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
  RotateCcw,
  Download,
  Plus,
  Trash2,
  RefreshCw,
  Printer,
  X
} from "lucide-react";
import CareerSubNav from "../../components/career/CareerSubNav";
import {
  getCareerRoadmap,
  toggleRoadmapSkill,
  getLocalRoadmap,
  saveLocalRoadmap,
  resetLocalRoadmap
} from "../../services/careerService";
import "./CareerRoadmap.css";

const ROLE_METADATA = [
  { id: "MERN Stack Developer", name: "MERN Stack Developer", icon: Layers, estWeeks: "16-20 wks", level: "Full Stack" },
  { id: "Frontend Developer", name: "Frontend Developer", icon: Code2, estWeeks: "12-16 wks", level: "UI & Client" },
  { id: "Backend Developer", name: "Backend Developer", icon: Server, estWeeks: "14-18 wks", level: "Systems & APIs" },
  { id: "Full Stack Developer", name: "Full Stack Developer", icon: Cpu, estWeeks: "18-24 wks", level: "End-to-End" },
  { id: "Cloud & DevOps", name: "Cloud & DevOps", icon: Cloud, estWeeks: "16-20 wks", level: "Infrastructure" },
  { id: "AI & ML Engineer", name: "AI & ML Engineer", icon: BrainCircuit, estWeeks: "20-26 wks", level: "ML & Generative AI" },
];

const CareerRoadmap = () => {
  const [selectedRole, setSelectedRole] = useState("MERN Stack Developer");
  // Initialize immediately with saved local data for zero latency
  const [roadmap, setRoadmap] = useState(() => getLocalRoadmap("MERN Stack Developer"));
  const [updatingId, setUpdatingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMode, setFilterMode] = useState("all"); // 'all' | 'pending' | 'completed' | 'high-priority' | 'medium-priority'
  const [collapsedPhases, setCollapsedPhases] = useState({});
  const [allCollapsed, setAllCollapsed] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Custom skill modal state
  const [addModalPhaseId, setAddModalPhaseId] = useState(null);
  const [newSkillName, setNewSkillName] = useState("");
  const [newSkillDesc, setNewSkillDesc] = useState("");
  const [newSkillPriority, setNewSkillPriority] = useState("high");

  // Sync state to local storage whenever roadmap updates
  useEffect(() => {
    if (roadmap && selectedRole) {
      saveLocalRoadmap(selectedRole, roadmap);
    }
  }, [roadmap, selectedRole]);

  // Background sync with API
  useEffect(() => {
    let isMounted = true;

    const fetchRoadmap = async () => {
      try {
        const data = await getCareerRoadmap(selectedRole);
        if (isMounted && data?.roadmap) {
          setRoadmap(data.roadmap);
        }
      } catch (err) {
        console.warn("Background roadmap sync note:", err);
      }
    };

    fetchRoadmap();

    return () => {
      isMounted = false;
    };
  }, [selectedRole]);

  const handleRoleChange = (roleId) => {
    setSelectedRole(roleId);
    const localData = getLocalRoadmap(roleId);
    setRoadmap(localData);
    setSearchQuery("");
    setFilterMode("all");
    setCollapsedPhases({});
    setAllCollapsed(false);
  };

  const handleToggle = async (phaseId, skillId) => {
    setUpdatingId(skillId);

    // Optimistic local state update
    setRoadmap((prev) => {
      if (!prev?.phases) return prev;
      const updatedPhases = prev.phases.map((phase) => {
        if (phase._id === phaseId || phase.id === phaseId || phase.phaseNumber === phaseId) {
          return {
            ...phase,
            skills: phase.skills.map((s) =>
              s._id === skillId || s.id === skillId || s.name === skillId
                ? { ...s, completed: !s.completed }
                : s
            )
          };
        }
        return phase;
      });
      const updated = { ...prev, phases: updatedPhases };
      saveLocalRoadmap(selectedRole, updated);
      return updated;
    });

    if (roadmap?._id) {
      try {
        await toggleRoadmapSkill(roadmap._id, phaseId, skillId);
      } catch (err) {
        console.error("Failed to sync toggle with API:", err);
      }
    }
    setUpdatingId(null);
  };

  const handleTogglePhaseAll = (phaseId, markComplete) => {
    setRoadmap((prev) => {
      if (!prev?.phases) return prev;
      const updatedPhases = prev.phases.map((phase) => {
        if (phase._id === phaseId || phase.id === phaseId || phase.phaseNumber === phaseId) {
          return {
            ...phase,
            skills: (phase.skills || []).map((s) => ({
              ...s,
              completed: markComplete
            }))
          };
        }
        return phase;
      });
      const updated = { ...prev, phases: updatedPhases };
      saveLocalRoadmap(selectedRole, updated);
      return updated;
    });
  };

  const handleResetProgress = () => {
    if (window.confirm(`Are you sure you want to reset all checklist progress for ${selectedRole}?`)) {
      const resetData = resetLocalRoadmap(selectedRole);
      setRoadmap(resetData);
    }
  };

  const togglePhaseCollapse = (phaseId) => {
    setCollapsedPhases((prev) => ({
      ...prev,
      [phaseId]: !prev[phaseId]
    }));
  };

  const toggleExpandCollapseAll = () => {
    const nextState = !allCollapsed;
    setAllCollapsed(nextState);
    const newCollapsedMap = {};
    if (roadmap?.phases) {
      roadmap.phases.forEach((p, idx) => {
        const key = p._id || p.id || idx;
        newCollapsedMap[key] = nextState;
      });
    }
    setCollapsedPhases(newCollapsedMap);
  };

  // Add Custom Skill
  const handleAddSkillSubmit = (e) => {
    e.preventDefault();
    if (!newSkillName.trim() || !addModalPhaseId) return;

    const newSkill = {
      _id: `custom-${Date.now()}`,
      name: newSkillName.trim(),
      description: newSkillDesc.trim(),
      priority: newSkillPriority,
      completed: false,
      resources: []
    };

    setRoadmap((prev) => {
      if (!prev?.phases) return prev;
      const updatedPhases = prev.phases.map((p) => {
        if (p._id === addModalPhaseId || p.id === addModalPhaseId || p.phaseNumber === addModalPhaseId) {
          return {
            ...p,
            skills: [...(p.skills || []), newSkill]
          };
        }
        return p;
      });
      const updated = { ...prev, phases: updatedPhases };
      saveLocalRoadmap(selectedRole, updated);
      return updated;
    });

    setAddModalPhaseId(null);
    setNewSkillName("");
    setNewSkillDesc("");
    setNewSkillPriority("high");
  };

  // Delete Custom Skill
  const handleDeleteSkill = (phaseId, skillId) => {
    setRoadmap((prev) => {
      if (!prev?.phases) return prev;
      const updatedPhases = prev.phases.map((p) => {
        if (p._id === phaseId || p.id === phaseId || p.phaseNumber === phaseId) {
          return {
            ...p,
            skills: (p.skills || []).filter((s) => s._id !== skillId && s.id !== skillId && s.name !== skillId)
          };
        }
        return p;
      });
      const updated = { ...prev, phases: updatedPhases };
      saveLocalRoadmap(selectedRole, updated);
      return updated;
    });
  };

  // Dynamic calculations
  const { totalSkills, completedCount, percentage, highPriorityCount } = useMemo(() => {
    if (!roadmap?.phases || !Array.isArray(roadmap.phases)) {
      return { totalSkills: 0, completedCount: 0, percentage: 0, highPriorityCount: 0 };
    }
    let total = 0;
    let completed = 0;
    let highPrio = 0;
    roadmap.phases.forEach((p) => {
      p.skills?.forEach((s) => {
        total++;
        if (s.completed) completed++;
        if (s.priority === "high") highPrio++;
      });
    });
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { totalSkills: total, completedCount: completed, percentage: pct, highPriorityCount: highPrio };
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
        if (filterMode === "medium-priority") return skill.priority === "medium";

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

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(roadmap, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `jobsphere_roadmap_${selectedRole.replace(/\s+/g, "_").toLowerCase()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handlePrint = () => {
    window.print();
  };

  const formatResourceUrl = (res, skillName) => {
    if (res.startsWith("http://") || res.startsWith("https://")) {
      return res;
    }
    if (res.includes(".") && !res.includes(" ")) {
      return `https://${res}`;
    }
    return `https://www.google.com/search?q=${encodeURIComponent(`${skillName} ${res} tutorial documentation`)}`;
  };

  return (
    <div className="interview-page roadmap-page-override">
      <div className="interview-container roadmap-container-override">
        {/* Secondary SubNav matching platform navbar style */}
        <CareerSubNav />

        {/* Header Hero */}
        <div className="interview-header">
          <div className="interview-badge">
            <Sparkles size={14} />
            <span>AI-Guided Technical Curriculum</span>
          </div>

          <h1 className="interview-title">Interactive Career Roadmap</h1>
          <p className="interview-subtitle">
            A battle-tested, structured curriculum aligned with top industry hiring standards.
            Track your mastery milestone-by-milestone and accelerate your career progression.
          </p>

          <div className="interview-header-actions">
            <button
              type="button"
              onClick={handleShare}
              className="btn-session secondary"
              title="Copy shareable link"
            >
              {copiedLink ? <Check size={16} color="#16a34a" /> : <Share2 size={16} />}
              <span>{copiedLink ? "Link Copied!" : "Share Curriculum"}</span>
            </button>

            <button
              type="button"
              onClick={handleExportJSON}
              className="btn-session secondary"
              title="Export Roadmap JSON"
            >
              <Download size={16} />
              <span>Export JSON</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="btn-session secondary"
              title="Print Curriculum / Save PDF"
            >
              <Printer size={16} />
              <span>Print PDF</span>
            </button>

            <Link to="/career" className="btn-session secondary">
              <Sparkles size={16} />
              <span>Command Center</span>
            </Link>
          </div>
        </div>

        {/* Setup Card: Role Selector */}
        <div className="interview-setup-card roadmap-setup-card">
          <div className="setup-section">
            <label className="setup-section-label">
              <Code2 size={16} />
              <span>1. Select Target Engineering Role</span>
            </label>

            <div className="role-grid">
              {ROLE_METADATA.map((r) => {
                const Icon = r.icon;
                const isSelected = selectedRole === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    className={`role-card ${isSelected ? "active" : ""}`}
                    onClick={() => handleRoleChange(r.id)}
                  >
                    <div className="role-card-icon">
                      <Icon size={18} />
                    </div>
                    <div>
                      <div className="role-card-title">{r.name}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-secondary, #71717a)", marginTop: "2px" }}>
                        {r.level} • {r.estWeeks}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Overall Progress Widget */}
        <div className="roadmap-progress-card">
          <div className="progress-info-left">
            <div className="progress-role-tag">
              <activeRoleMeta.icon size={15} />
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
            <div className="metric-icon">
              <Layers size={18} />
            </div>
            <div>
              <div className="metric-val">{roadmap?.phases?.length || 0}</div>
              <div className="metric-lbl">Curriculum Phases</div>
            </div>
          </div>

          <div className="metric-strip-card">
            <div className="metric-icon">
              <CheckCircle2 size={18} />
            </div>
            <div>
              <div className="metric-val">{completedCount} / {totalSkills}</div>
              <div className="metric-lbl">Skills Mastered</div>
            </div>
          </div>

          <div className="metric-strip-card">
            <div className="metric-icon">
              <TrendingUp size={18} />
            </div>
            <div>
              <div className="metric-val">+{Math.round(percentage * 0.4)}%</div>
              <div className="metric-lbl">Interview Readiness</div>
            </div>
          </div>

          <div className="metric-strip-card">
            <div className="metric-icon">
              <Award size={18} />
            </div>
            <div>
              <div className="metric-val">{totalSkills - completedCount} Left</div>
              <div className="metric-lbl">Remaining to Learn</div>
            </div>
          </div>
        </div>

        {/* Toolbar: Search, Filters & Controls */}
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
                title="Clear Search"
              >
                <X size={14} />
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
              Mastered ({completedCount})
            </button>
            <button
              type="button"
              className={`filter-chip ${filterMode === "high-priority" ? "active" : ""}`}
              onClick={() => setFilterMode("high-priority")}
            >
              High Priority ({highPriorityCount})
            </button>
          </div>

          {/* Quick Toolbar Action Buttons */}
          <div className="roadmap-toolbar-actions">
            <button
              type="button"
              onClick={toggleExpandCollapseAll}
              className="toolbar-action-btn"
              title={allCollapsed ? "Expand All Phases" : "Collapse All Phases"}
            >
              {allCollapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
              <span>{allCollapsed ? "Expand All" : "Collapse All"}</span>
            </button>

            <button
              type="button"
              onClick={handleResetProgress}
              className="toolbar-action-btn danger"
              title="Reset Progress for this Role"
            >
              <RotateCcw size={14} />
              <span>Reset Progress</span>
            </button>
          </div>
        </div>

        {/* Phase-by-Phase Interactive Accordion Cards */}
        <div className="roadmap-phases-container">
          {(filteredPhases || []).map((phase, pIdx) => {
            const phaseKey = phase._id || phase.id || pIdx;
            const isCollapsed = !!collapsedPhases[phaseKey];
            const phaseSkills = phase.skills || [];
            const phaseCompleted = phaseSkills.filter((s) => s.completed).length;
            const phaseTotal = phaseSkills.length;
            const phasePct = phaseTotal > 0 ? Math.round((phaseCompleted / phaseTotal) * 100) : 0;
            const isPhaseDone = phaseTotal > 0 && phaseCompleted === phaseTotal;

            return (
              <div
                key={phaseKey}
                className={`roadmap-phase-card ${isPhaseDone ? "phase-completed" : ""}`}
              >
                {/* Phase Header */}
                <div
                  className="phase-card-header"
                  onClick={() => togglePhaseCollapse(phaseKey)}
                >
                  <div className="phase-header-left">
                    <div className={`phase-index-badge ${isPhaseDone ? "done" : ""}`}>
                      {isPhaseDone ? <Check size={14} /> : `0${phase.phaseNumber || pIdx + 1}`}
                    </div>

                    <div>
                      <div className="phase-title-row">
                        <h3>{phase.title}</h3>
                        {isPhaseDone && (
                          <span className="phase-tag-complete">Completed</span>
                        )}
                      </div>
                      <p className="phase-desc">{phase.description}</p>
                    </div>
                  </div>

                  <div className="phase-header-right">
                    {/* Phase Batch Actions */}
                    <div
                      className="phase-batch-actions"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {phaseCompleted < phaseTotal ? (
                        <button
                          type="button"
                          className="phase-action-link"
                          onClick={() => handleTogglePhaseAll(phase._id || phase.id || phase.phaseNumber, true)}
                          title="Mark all skills in this phase as mastered"
                        >
                          <CheckCircle2 size={13} />
                          <span>Mark Phase Done</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="phase-action-link undo"
                          onClick={() => handleTogglePhaseAll(phase._id || phase.id || phase.phaseNumber, false)}
                          title="Reset all skills in this phase"
                        >
                          <RotateCcw size={13} />
                          <span>Reset Phase</span>
                        </button>
                      )}

                      <button
                        type="button"
                        className="phase-action-link add-skill"
                        onClick={() => setAddModalPhaseId(phase._id || phase.id || phase.phaseNumber)}
                        title="Add custom skill milestone to this phase"
                      >
                        <Plus size={13} />
                        <span>Add Skill</span>
                      </button>
                    </div>

                    <div className="phase-progress-mini">
                      <div className="phase-progress-track">
                        <div
                          className="phase-progress-fill"
                          style={{ width: `${phasePct}%` }}
                        />
                      </div>
                      <span className="phase-progress-txt">
                        {phaseCompleted}/{phaseTotal} Skills
                      </span>
                    </div>

                    <button
                      type="button"
                      className="phase-collapse-btn"
                      aria-label="Toggle Phase"
                    >
                      {isCollapsed ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
                    </button>
                  </div>
                </div>

                {/* Phase Skills Checklist (Collapsible) */}
                {!isCollapsed && (
                  <div className="phase-skills-list">
                    {(phase.filteredSkills || []).length === 0 ? (
                      <div className="no-skills-matched">
                        No skills match your current search or filter in this phase.
                      </div>
                    ) : (
                      phase.filteredSkills.map((skill) => {
                        const skillKey = skill._id || skill.id || skill.name;
                        const isDone = !!skill.completed;
                        const isToggling = updatingId === skillKey;

                        return (
                          <div
                            key={skillKey}
                            className={`skill-checklist-item ${isDone ? "is-mastered" : ""}`}
                          >
                            <button
                              type="button"
                              className={`skill-check-box ${isDone ? "checked" : ""}`}
                              onClick={() => handleToggle(phase._id || phase.id || phase.phaseNumber, skillKey)}
                              disabled={isToggling}
                              title={isDone ? "Mark as Incomplete" : "Mark as Mastered"}
                            >
                              {isDone ? <Check size={14} /> : null}
                            </button>

                            <div className="skill-content-wrap">
                              <div className="skill-title-row">
                                <span className="skill-title">{skill.name}</span>
                                {skill.priority && (
                                  <span className={`priority-badge ${skill.priority}`}>
                                    {skill.priority} priority
                                  </span>
                                )}
                                {String(skillKey).startsWith("custom-") && (
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteSkill(phase._id || phase.id || phase.phaseNumber, skillKey)}
                                    className="delete-custom-skill-btn"
                                    title="Delete custom skill"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                )}
                              </div>

                              {skill.description && (
                                <p className="skill-description">{skill.description}</p>
                              )}

                              {/* Resources / Recommended Documentation */}
                              {skill.resources && skill.resources.length > 0 && (
                                <div className="skill-resources-row">
                                  <BookOpen size={13} className="resource-icon" />
                                  <span className="resource-label">Resources:</span>
                                  {skill.resources.map((res, rIdx) => {
                                    const targetUrl = formatResourceUrl(res, skill.name);
                                    return (
                                      <a
                                        key={rIdx}
                                        href={targetUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="resource-pill-link"
                                        title={`Open documentation or guide for ${res}`}
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

        {/* Modal for Adding Custom Skill */}
        {addModalPhaseId !== null && (
          <div className="modal-backdrop" onClick={() => setAddModalPhaseId(null)}>
            <div className="modal-card roadmap-add-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Add Custom Skill Milestone</h3>
                <button
                  type="button"
                  className="modal-close-btn"
                  onClick={() => setAddModalPhaseId(null)}
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleAddSkillSubmit} className="add-skill-form">
                <div className="form-group">
                  <label className="input-label">Skill Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Zustand State Store, WebGL 3D, GraphQL Subscriptions"
                    value={newSkillName}
                    onChange={(e) => setNewSkillName(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="input-label">Description (Optional)</label>
                  <textarea
                    placeholder="Brief description of key concepts or topics to master..."
                    value={newSkillDesc}
                    onChange={(e) => setNewSkillDesc(e.target.value)}
                    className="form-textarea"
                    rows={3}
                  />
                </div>

                <div className="form-group">
                  <label className="input-label">Priority Level</label>
                  <select
                    value={newSkillPriority}
                    onChange={(e) => setNewSkillPriority(e.target.value)}
                    className="form-select"
                  >
                    <option value="high">High Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="optional">Optional / Low Priority</option>
                  </select>
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="btn btn--outline"
                    onClick={() => setAddModalPhaseId(null)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn--primary">
                    Add Skill Milestone
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

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
            <Link to="/interview-practice" className="btn-session primary">
              <span>Start Mock Interview</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        )}

        {/* Footer Navigation CTAs */}
        <div className="roadmap-next-steps-grid">
          <div className="next-step-card">
            <div className="next-step-icon">
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
            <div className="next-step-icon">
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
            <div className="next-step-icon">
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
      </div>
    </div>
  );
};

export default CareerRoadmap;
