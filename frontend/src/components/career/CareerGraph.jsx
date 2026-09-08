import React, { useState } from "react";
import { ArrowRight, CheckCircle2, Circle, Sparkles, BookOpen, Layers, Target, Briefcase } from "lucide-react";

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
        <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 700, color: "var(--text-primary)" }}>
          Interactive Career Progression Graph
        </h3>
        <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
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
          return (
            <React.Fragment key={step.id}>
              <div
                onClick={() => setActiveStep(idx)}
                style={{
                  minWidth: "160px",
                  padding: "1rem",
                  borderRadius: "12px",
                  background: isActive ? "var(--accent-light, #F5F5F5)" : "var(--surface-soft, #FAFAFA)",
                  border: isActive ? "1.5px solid var(--accent, #000000)" : "1px solid var(--border, #e4e4e7)",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  textAlign: "center",
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    background: isActive ? "var(--accent, #000000)" : "#DDDDDD",
                    color: isActive ? "#ffffff" : "var(--text-secondary)",
                    marginBottom: "0.5rem",
                  }}
                >
                  {step.icon}
                </div>
                <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: 2 }}>
                  {step.label}
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginBottom: 6 }}>
                  {step.details}
                </div>
                <span
                  style={{
                    display: "inline-block",
                    fontSize: "0.68rem",
                    fontWeight: 600,
                    padding: "2px 8px",
                    borderRadius: "999px",
                    background: isActive ? "var(--accent, #000000)" : "#ffffff",
                    color: isActive ? "#ffffff" : "var(--text-secondary)",
                    border: "1px solid var(--border)",
                  }}
                >
                  {step.badge}
                </span>
              </div>

              {idx < steps.length - 1 && (
                <ArrowRight size={18} color="#888888" style={{ flexShrink: 0 }} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default CareerGraph;
