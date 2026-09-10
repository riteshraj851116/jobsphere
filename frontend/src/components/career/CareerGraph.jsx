import React, { useState } from "react";
import { ArrowRight, Circle, Sparkles, BookOpen, Layers, Target, Briefcase } from "lucide-react";

const STEP_COLORS = [
  { bg: "#f4f4f5", border: "#e4e4e7", icon: "#18181b", activeBorder: "#000000" },
  { bg: "#f4f4f5", border: "#e4e4e7", icon: "#18181b", activeBorder: "#000000" },
  { bg: "#f4f4f5", border: "#e4e4e7", icon: "#18181b", activeBorder: "#000000" },
  { bg: "#f4f4f5", border: "#e4e4e7", icon: "#18181b", activeBorder: "#000000" },
  { bg: "#f4f4f5", border: "#e4e4e7", icon: "#18181b", activeBorder: "#000000" },
  { bg: "#f4f4f5", border: "#e4e4e7", icon: "#18181b", activeBorder: "#000000" },
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
        <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 800, color: "#18181b" }}>
          Interactive Career Progression Graph
        </h3>
        <span style={{ fontSize: "0.8rem", color: "#71717a" }}>
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
                  background: isActive ? "#ffffff" : "#fafafa",
                  border: isActive
                    ? `1.5px solid ${color.activeBorder}`
                    : "1px solid #e4e4e7",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  textAlign: "center",
                  flexShrink: 0,
                  boxShadow: isActive ? "0 4px 14px rgba(0,0,0,0.08)" : "0 1px 2px rgba(0,0,0,0.03)",
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
                    borderRadius: "10px",
                    background: isActive ? "#000000" : "#f4f4f5",
                    color: isActive ? "#ffffff" : "#52525b",
                    marginBottom: "0.6rem",
                    transition: "all 0.2s ease",
                  }}
                >
                  {step.icon}
                </div>
                <div style={{ fontSize: "0.85rem", fontWeight: 700, color: isActive ? "#09090b" : "#52525b", marginBottom: 3 }}>
                  {step.label}
                </div>
                <div style={{ fontSize: "0.75rem", color: "#71717a", marginBottom: 8 }}>
                  {step.details}
                </div>
                <span
                  style={{
                    display: "inline-block",
                    fontSize: "0.68rem",
                    fontWeight: 700,
                    padding: "3px 10px",
                    borderRadius: "999px",
                    background: isActive ? "#000000" : "#f4f4f5",
                    color: isActive ? "#ffffff" : "#71717a",
                    border: isActive ? "none" : "1px solid #e4e4e7",
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
                    background: "#e4e4e7",
                    borderRadius: "1px",
                  }} />
                  <ArrowRight size={16} color="#a1a1aa" style={{ flexShrink: 0 }} />
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
