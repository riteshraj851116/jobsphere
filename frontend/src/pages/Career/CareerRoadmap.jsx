import React, { useState, useEffect } from "react";
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
  BookOpen
} from "lucide-react";
import { getCareerRoadmap, toggleRoadmapSkill } from "../../services/careerService";
import "./CareerRoadmap.css";

const ROLES = [
  "MERN Stack Developer",
  "Frontend Developer",
  "Backend Developer"
];

const CareerRoadmap = () => {
  const [selectedRole, setSelectedRole] = useState("MERN Stack Developer");
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchRoadmap = async () => {
      try {
        setLoading(true);
        const data = await getCareerRoadmap(selectedRole);
        if (isMounted) {
          setRoadmap(data.roadmap);
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

  const percentage = roadmap?.completionPercentage || 0;
  const completedCount = roadmap?.completedSkillsCount || 0;
  const totalCount = roadmap?.totalSkills || 0;

  return (
    <div className="roadmap-page">
      <div className="roadmap-container">
        {/* Header */}
        <div className="roadmap-header">
          <div className="roadmap-badge">
            <Sparkles size={14} />
            <span>AI Guided Learning Curriculum</span>
          </div>
          <h1 className="roadmap-title">AI Career Roadmap</h1>
          <p className="roadmap-subtitle">
            Follow a structured step-by-step curriculum to master high-demand skills, track your progress in real-time, and become job-ready for top tech roles.
          </p>

          {/* Role selector tabs */}
          <div className="role-selector-tabs">
            {ROLES.map((role) => (
              <button
                key={role}
                type="button"
                className={`role-tab-btn ${selectedRole === role ? "active" : ""}`}
                onClick={() => setSelectedRole(role)}
              >
                <Layers size={16} />
                <span>{role}</span>
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "4rem 0" }}>
            <Loader2 size={36} style={{ animation: "spin 1s linear infinite", margin: "0 auto 1rem" }} />
            <h3>Generating Curriculum & Syncing Progress...</h3>
          </div>
        ) : (
          <>
            {/* Overall Progress Widget */}
            <div className="roadmap-progress-card">
              <div className="progress-info-left">
                <h2>{selectedRole} Progress</h2>
                <p>
                  {completedCount} of {totalCount} key technical skills mastered
                </p>
                <div className="progress-bar-container">
                  <div className="progress-bar-fill" style={{ width: `${percentage}%` }} />
                </div>
              </div>

              <div style={{ textAlign: "right" }}>
                <div className="progress-stat-pill">{percentage}%</div>
                <div style={{ fontSize: "0.875rem", color: "#94a3b8", marginTop: "4px" }}>
                  {percentage >= 80 ? "🎉 Job Ready!" : percentage >= 50 ? "⚡ Intermediate" : "🌱 Getting Started"}
                </div>
              </div>
            </div>

            {/* Curriculum Phases */}
            {roadmap?.phases?.map((phase) => {
              const phaseCompleted = phase.skills.filter((s) => s.completed).length;
              const phaseTotal = phase.skills.length;

              return (
                <div key={phase._id} className="phase-card">
                  <div className="phase-header">
                    <div className="phase-title-row">
                      <div className="phase-badge-num">{phase.phaseNumber}</div>
                      <div>
                        <h3 className="phase-title">{phase.title}</h3>
                        <p className="phase-desc">{phase.description}</p>
                      </div>
                    </div>

                    <div style={{ fontSize: "0.875rem", fontWeight: "700", color: "#64748b" }}>
                      {phaseCompleted} / {phaseTotal} Completed
                    </div>
                  </div>

                  <div className="skills-checklist">
                    {phase.skills.map((skill) => (
                      <div
                        key={skill._id}
                        className={`skill-check-item ${skill.completed ? "completed" : ""}`}
                        onClick={() => handleToggle(phase._id, skill._id)}
                      >
                        <div className="custom-checkbox">
                          {updatingId === skill._id ? (
                            <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} />
                          ) : skill.completed ? (
                            <CheckCircle2 size={16} />
                          ) : null}
                        </div>

                        <div className="skill-text-col">
                          <div className="skill-name">{skill.name}</div>
                          {skill.description && <div className="skill-desc">{skill.description}</div>}
                          <span className={`priority-tag ${skill.priority || "high"}`}>
                            {skill.priority || "High"} Priority
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {/* Footer Navigation CTAs */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "1rem",
                marginTop: "2.5rem",
                padding: "1.5rem",
                background: "var(--card-bg, #ffffff)",
                borderRadius: "16px",
                border: "1px solid var(--border-light, #e2e8f0)"
              }}
            >
              <div>
                <h4 style={{ margin: "0 0 4px", fontSize: "1.0625rem", fontWeight: "700" }}>
                  Ready to test your knowledge?
                </h4>
                <p style={{ margin: 0, fontSize: "0.875rem", color: "#64748b" }}>
                  Practice real technical interview questions tailored for {selectedRole}.
                </p>
              </div>

              <Link to="/interview-practice" className="btn-session primary">
                <span>Start Practice Interview</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CareerRoadmap;
