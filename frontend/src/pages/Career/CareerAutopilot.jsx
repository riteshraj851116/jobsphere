import React, { useEffect, useState } from "react";
import {
  Zap,
  CheckCircle2,
  Circle,
  Plus,
  ArrowRight,
  Sparkles,
  Calendar,
  Layers,
  Clock,
  Target,
  AlertCircle,
} from "lucide-react";
import CareerSubNav from "../../components/career/CareerSubNav";
import AIExplanationBanner from "../../components/career/AIExplanationBanner";
import { getAutopilotGoals, createAutopilotGoal, toggleGoalMilestone } from "../../services/careerService";
import "./career.css";

const CareerAutopilot = () => {
  const [goals, setGoals] = useState([]);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newTargetRole, setNewTargetRole] = useState("Full Stack Developer");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchGoals = async () => {
    setLoading(true);
    try {
      const res = await getAutopilotGoals();
      if (res?.success && res.data) {
        setGoals(res.data);
        if (res.data.length > 0 && !selectedGoal) {
          setSelectedGoal(res.data[0]);
        }
      }
    } catch (err) {
      console.error("Error loading goals:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await createAutopilotGoal({
        title: newTitle.trim(),
        targetRole: newTargetRole,
      });
      if (res.success) {
        setShowCreateModal(false);
        setNewTitle("");
        await fetchGoals();
        setSelectedGoal(res.data);
      }
    } catch (err) {
      console.error("Failed to create autopilot goal:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleMilestone = async (goalId, milestoneId) => {
    try {
      const res = await toggleGoalMilestone(goalId, milestoneId);
      if (res.success) {
        setSelectedGoal(res.data);
        setGoals((prev) => prev.map((g) => (g._id === goalId ? res.data : g)));
      }
    } catch (err) {
      console.error("Toggle milestone error:", err);
    }
  };

  return (
    <div className="career-container">
      <div className="career-content-limit">
        <CareerSubNav />

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <div className="career-badge">
              <Zap size={13} />
              <span>AI Career Autopilot</span>
            </div>
            <h1 className="career-title">Autonomous Career Roadmaps & Goals</h1>
            <p className="career-subtitle">
              Set your target career trajectory. AI analyzes your profile, diagnoses skill gaps,
              and sequences a progressive roadmap of milestones.
            </p>
          </div>

          <button
            type="button"
            className="career-btn-primary"
            onClick={() => setShowCreateModal(true)}
          >
            <Plus size={16} />
            <span>New Autopilot Goal</span>
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "4rem", color: "#94a3b8" }}>
            <div className="career-spinner" style={{ margin: "0 auto 1rem" }} />
            Loading Career Autopilot roadmaps...
          </div>
        ) : goals.length === 0 ? (
          <div className="career-card" style={{ textAlign: "center", padding: "3rem" }}>
            <Zap size={36} color="#a78bfa" style={{ margin: "0 auto 1rem" }} />
            <h3 style={{ margin: "0 0 0.5rem", color: "#f1f5f9" }}>No Active Autopilot Goals</h3>
            <p style={{ color: "#94a3b8", maxWidth: 500, margin: "0 auto 1.5rem" }}>
              Define a goal like "Become a Senior Full Stack Engineer" to let AI generate your personalized roadmap.
            </p>
            <button
              type="button"
              className="career-btn-primary"
              onClick={() => setShowCreateModal(true)}
            >
              <Plus size={16} />
              <span>Set First Career Goal</span>
            </button>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: "1.5rem" }}>
            {/* Left Goals List */}
            <div>
              <div style={{ fontSize: "0.825rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: "0.75rem", letterSpacing: "0.05em" }}>
                Active Trajectories ({goals.length})
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {goals.map((g) => {
                  const isSelected = selectedGoal?._id === g._id;
                  return (
                    <div
                      key={g._id}
                      onClick={() => setSelectedGoal(g)}
                      style={{
                        padding: "1rem 1.25rem",
                        borderRadius: "14px",
                        background: isSelected ? "rgba(139, 92, 246, 0.1)" : "rgba(30, 41, 59, 0.5)",
                        border: isSelected ? "1.5px solid rgba(139, 92, 246, 0.4)" : "1px solid rgba(148, 163, 184, 0.08)",
                        cursor: "pointer",
                        boxShadow: isSelected ? "0 4px 16px rgba(139, 92, 246, 0.15)" : "none",
                        transition: "all 0.25s ease",
                        backdropFilter: "blur(8px)",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                        <span style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", color: "#a78bfa", letterSpacing: "0.05em" }}>
                          {g.targetRole}
                        </span>
                        <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#34d399" }}>
                          {g.overallProgress}%
                        </span>
                      </div>
                      <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "#f1f5f9", marginBottom: 8 }}>
                        {g.title}
                      </div>
                      <div className="readiness-track">
                        <div className="readiness-fill fill-violet" style={{ width: `${g.overallProgress}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: Selected Goal Roadmap */}
            {selectedGoal && (
              <div className="career-card">
                <div className="career-card-header">
                  <div>
                    <h2 style={{ margin: "0 0 0.25rem", fontSize: "1.3rem", fontWeight: 800, color: "#f1f5f9" }}>
                      {selectedGoal.title}
                    </h2>
                    <span style={{ fontSize: "0.85rem", color: "#94a3b8" }}>
                      Target: {selectedGoal.targetRole} &bull; Status: <strong style={{ color: "#a78bfa" }}>{selectedGoal.status}</strong>
                    </span>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <div style={{
                      fontSize: "1.5rem",
                      fontWeight: 900,
                      background: "linear-gradient(135deg, #a78bfa, #06b6d4)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}>
                      {selectedGoal.overallProgress}%
                    </div>
                    <span style={{ fontSize: "0.75rem", color: "#64748b" }}>Overall Progress</span>
                  </div>
                </div>

                {/* Strategy Overview */}
                <p style={{ fontSize: "0.9rem", color: "#94a3b8", lineHeight: 1.6, marginBottom: "1.25rem" }}>
                  {selectedGoal.strategyOverview}
                </p>

                {/* Milestones Progression */}
                <div style={{ marginBottom: "1.5rem" }}>
                  <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#f1f5f9", marginBottom: "1rem" }}>
                    Milestone Progression Path
                  </h3>

                  <div className="milestones-list">
                    {selectedGoal.milestones?.map((m) => {
                      const isDone = m.status === "completed";
                      return (
                        <div
                          key={m._id}
                          className={`milestone-item ${isDone ? "completed" : ""}`}
                          onClick={() => handleToggleMilestone(selectedGoal._id, m._id)}
                          style={{ cursor: "pointer" }}
                        >
                          {isDone ? (
                            <CheckCircle2 size={22} color="#34d399" style={{ flexShrink: 0, marginTop: 2 }} />
                          ) : (
                            <Circle size={22} color="#64748b" style={{ flexShrink: 0, marginTop: 2 }} />
                          )}

                          <div style={{ flex: 1 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: 2 }}>
                              <span
                                style={{
                                  fontSize: "0.68rem",
                                  fontWeight: 700,
                                  textTransform: "uppercase",
                                  padding: "2px 8px",
                                  borderRadius: "6px",
                                  background: "rgba(139, 92, 246, 0.12)",
                                  color: "#a78bfa",
                                  letterSpacing: "0.03em",
                                }}
                              >
                                {m.category}
                              </span>
                              <strong
                                style={{
                                  fontSize: "0.925rem",
                                  color: isDone ? "#64748b" : "#f1f5f9",
                                  textDecoration: isDone ? "line-through" : "none",
                                }}
                              >
                                {m.title}
                              </strong>
                            </div>
                            <div style={{ fontSize: "0.825rem", color: "#94a3b8" }}>
                              {m.explanation}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Grounded AI Rationale */}
                <AIExplanationBanner
                  title="Why was this sequence recommended?"
                  text={selectedGoal.whyRecommended}
                />
              </div>
            )}
          </div>
        )}

        {/* Create Goal Modal */}
        {showCreateModal && (
          <div className="celebration-overlay" onClick={() => setShowCreateModal(false)}>
            <div className="celebration-modal" style={{ maxWidth: 520, textAlign: "left" }} onClick={(e) => e.stopPropagation()}>
              <h3 style={{ margin: "0 0 0.5rem" }}>Create AI Autopilot Goal</h3>
              <p style={{ fontSize: "0.85rem", marginBottom: "1.25rem" }}>
                Specify your ambition. JobSphere AI will analyze your stored profile to construct an optimal milestone sequence.
              </p>

              <form onSubmit={handleCreate}>
                <div style={{ marginBottom: "1rem" }}>
                  <label style={{ display: "block", fontSize: "0.825rem", fontWeight: 600, color: "#cbd5e1", marginBottom: 6 }}>
                    Goal Title
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Become a Full Stack Engineer at a Product Company"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                  />
                </div>

                <div style={{ marginBottom: "1.5rem" }}>
                  <label style={{ display: "block", fontSize: "0.825rem", fontWeight: 600, color: "#cbd5e1", marginBottom: 6 }}>
                    Target Role
                  </label>
                  <select
                    value={newTargetRole}
                    onChange={(e) => setNewTargetRole(e.target.value)}
                  >
                    <option value="Full Stack Developer">Full Stack Developer</option>
                    <option value="Frontend Developer">Frontend Developer</option>
                    <option value="Backend Developer">Backend Developer</option>
                    <option value="DevOps Engineer">DevOps Engineer</option>
                  </select>
                </div>

                <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
                  <button
                    type="button"
                    className="career-btn-secondary"
                    onClick={() => setShowCreateModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="career-btn-primary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Generating Roadmap..." : "Launch Autopilot"}
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

export default CareerAutopilot;
