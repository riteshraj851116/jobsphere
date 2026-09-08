import React, { useState } from "react";
import { ArrowRight, CheckCircle2, Circle, Sparkles, BookOpen, Layers, Target, Briefcase } from "lucide-react";

const STEP_COLORS = [
  { bg: "rgba(139, 92, 246, 0.12)", border: "rgba(139, 92, 246, 0.35)", icon: "#a78bfa", glow: "rgba(139, 92, 246, 0.2)" },
  { bg: "rgba(6, 182, 212, 0.12)", border: "rgba(6, 182, 212, 0.35)", icon: "#22d3ee", glow: "rgba(6, 182, 212, 0.2)" },
  { bg: "rgba(16, 185, 129, 0.12)", border: "rgba(16, 185, 129, 0.35)", icon: "#34d399", glow: "rgba(16, 185, 129, 0.2)" },
  { bg: "rgba(244, 63, 94, 0.12)", border: "rgba(244, 63, 94, 0.35)", icon: "#fb7185", glow: "rgba(244, 63, 94, 0.2)" },
  { bg: "rgba(245, 158, 11, 0.12)", border: "rgba(245, 158, 11, 0.35)", icon: "#fbbf24", glow: "rgba(245, 158, 11, 0.2)" },
  { bg: "rgba(99, 102, 241, 0.12)", border: "rgba(99, 102, 241, 0.35)", icon: "#818cf8", glow: "rgba(99, 102, 241, 0.2)" },
];

const CareerGraph = ({
  currentSkills = [],
  currentRole = "Developer",
  targetRole = "Full Stack Developer",
  missingSkills = [],
}) => {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      id: "skills",
      label: "Current Skills",
      icon: <Layers size={16} />,
      details: currentSkills.slice(0, 5).join(", ") || "Foundational skills",
      badge: `${currentSkills.length} Verified`,
    },
    {
      id: "current",
      label: "Current Level",
      icon: <Circle size={16} />,
      details: currentRole,
      badge: "Baseline",
    },
    {
      id: "target",
      label: "Target Role",
      icon: <Target size={16} />,
      details: targetRole,
      badge: "Goal",
    },
    {
      id: "gap",
      label: "Skill Gaps",
      icon: <Sparkles size={16} />,
      details: missingSkills.slice(0, 3).join(", ") || "None pending",
      badge: `${missingSkills.length} to learn`,
    },
    {
      id: "learning",
      label: "Learning & Projects",
      icon: <BookOpen size={16} />,
      details: "Hands-on projects & DSA",
      badge: "In Progress",
    },
    {
      id: "jobs",
      label: "Target Opportunities",
      icon: <Briefcase size={16} />,
      details: "Top engineering listings",
      badge: "High Match",
    },
  ];

  return (
    <div className="career-graph-wrapper">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
        <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 700, color: "#f1f5f9" }}>
          Interactive Career Progression Graph
        </h3>
        <span style={{ fontSize: "0.8rem", color: "#64748b" }}>
          Click any phase to inspect details
        </span>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "0.5rem",
          overflowX: "auto",
          paddingBottom: "0.5rem",
        }}
      >
        {steps.map((step, idx) => {
          const isActive = activeStep === idx;
          const color = STEP_COLORS[idx % STEP_COLORS.length];
          return (
            <React.Fragment key={step.id}>
              <div
                onClick={() => setActiveStep(idx)}
                style={{
                  minWidth: "160px",
                  padding: "1.15rem",
                  borderRadius: "14px",
                  background: isActive ? color.bg : "rgba(15, 23, 42, 0.4)",
                  border: isActive
                    ? `1.5px solid ${color.border}`
                    : "1px solid rgba(148, 163, 184, 0.08)",
                  cursor: "pointer",
                  transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
                  textAlign: "center",
                  flexShrink: 0,
                  boxShadow: isActive ? `0 4px 20px ${color.glow}` : "none",
                  transform: isActive ? "translateY(-2px)" : "none",
                }}
              >
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    background: isActive
                      ? `linear-gradient(135deg, ${color.icon}, ${color.border})`
                      : "rgba(51, 65, 85, 0.5)",
                    color: isActive ? "#ffffff" : "#94a3b8",
                    marginBottom: "0.6rem",
                    boxShadow: isActive ? `0 4px 12px ${color.glow}` : "none",
                    transition: "all 0.3s ease",
                  }}
                >
                  {step.icon}
                </div>
                <div style={{ fontSize: "0.85rem", fontWeight: 700, color: isActive ? "#f1f5f9" : "#cbd5e1", marginBottom: 3 }}>
                  {step.label}
                </div>
                <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginBottom: 8 }}>
                  {step.details}
                </div>
                <span
                  style={{
                    display: "inline-block",
                    fontSize: "0.68rem",
                    fontWeight: 700,
                    padding: "3px 10px",
                    borderRadius: "999px",
                    background: isActive
                      ? `linear-gradient(135deg, ${color.icon}, ${color.border})`
                      : "rgba(51, 65, 85, 0.4)",
                    color: isActive ? "#ffffff" : "#94a3b8",
                    border: isActive ? "none" : "1px solid rgba(148, 163, 184, 0.1)",
                    textTransform: "uppercase",
                    letterSpacing: "0.03em",
                  }}
                >
                  {step.badge}
                </span>
              </div>

              {idx < steps.length - 1 && (
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  flexShrink: 0,
                }}>
                  <div style={{
                    width: "20px",
                    height: "2px",
                    background: "linear-gradient(90deg, rgba(139, 92, 246, 0.3), rgba(6, 182, 212, 0.3))",
                    borderRadius: "1px",
                  }} />
                  <ArrowRight size={16} color="#64748b" style={{ flexShrink: 0 }} />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default CareerGraph;
