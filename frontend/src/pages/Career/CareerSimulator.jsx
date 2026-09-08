import React, { useState } from "react";
import { Cpu, ArrowRight, Check, Plus, X, Sparkles, TrendingUp, ShieldAlert } from "lucide-react";
import CareerSubNav from "../../components/career/CareerSubNav";
import AIExplanationBanner from "../../components/career/AIExplanationBanner";
import { simulateScenario } from "../../services/careerService";
import "./career.css";

const PRESET_SKILLS = [
  "TypeScript",
  "Docker",
  "AWS",
  "Redis",
  "Kubernetes",
  "GraphQL",
  "Next.js",
  "System Design",
  "Python",
  "PostgreSQL",
];

const CareerSimulator = () => {
  const [targetRole, setTargetRole] = useState("Full Stack Developer");
  const [selectedSkills, setSelectedSkills] = useState(["TypeScript", "Docker", "AWS"]);
  const [customInput, setCustomInput] = useState("");
  const [simulation, setSimulation] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const handleAddSkill = (skill) => {
    if (!selectedSkills.includes(skill)) {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const handleRemoveSkill = (skill) => {
    setSelectedSkills(selectedSkills.filter((s) => s !== skill));
  };

  const handleCustomAdd = (e) => {
    e.preventDefault();
    if (customInput.trim() && !selectedSkills.includes(customInput.trim())) {
      setSelectedSkills([...selectedSkills, customInput.trim()]);
      setCustomInput("");
    }
  };

  const runSimulation = async () => {
    setIsSimulating(true);
    try {
      const res = await simulateScenario({
        addedSkills: selectedSkills,
        targetRole,
      });
      if (res.success) {
        setSimulation(res.data);
      }
    } catch (err) {
      console.error("Simulation error:", err);
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="career-container">
      <div className="career-content-limit">
        <CareerSubNav />

        {/* Header */}
        <div className="career-header">
          <div className="career-badge">
            <Cpu size={13} />
            <span>Scenario Simulator</span>
          </div>
          <h1 className="career-title">Career Scenario Simulator</h1>
          <p className="career-subtitle">
            Test hypothetical career moves without risk. Project how mastering new technologies
            and frameworks shifts your skill coverage, interview readiness, and candidate competitiveness.
          </p>
        </div>

        {/* Setup Card */}
        <div className="career-card">
          <div className="career-card-header">
            <h3 className="career-card-title">
              <Sparkles size={18} color="var(--accent, #000000)" />
              Configure Hypothetical Scenario
            </h3>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "1.5rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.825rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: 6 }}>
                Target Role
              </label>
              <select
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.65rem 0.85rem",
                  borderRadius: "8px",
                  border: "1px solid var(--border)",
                  background: "#ffffff",
                  fontSize: "0.875rem",
                }}
              >
                <option value="Full Stack Developer">Full Stack Developer</option>
                <option value="Frontend Developer">Frontend Developer</option>
                <option value="Backend Developer">Backend Developer</option>
                <option value="DevOps Engineer">DevOps Engineer</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.825rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: 6 }}>
                Add Custom Skill to Test
              </label>
              <form onSubmit={handleCustomAdd} style={{ display: "flex", gap: "0.5rem" }}>
                <input
                  type="text"
                  placeholder="e.g. Terraform, GraphQL..."
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  style={{
                    flex: 1,
                    padding: "0.65rem 0.85rem",
                    borderRadius: "8px",
                    border: "1px solid var(--border)",
                    fontSize: "0.875rem",
                  }}
                />
                <button type="submit" className="career-btn-secondary" style={{ padding: "0.65rem 1rem" }}>
                  <Plus size={15} />
                </button>
              </form>
            </div>
          </div>

          {/* Quick Preset Buttons */}
          <div style={{ marginBottom: "1.5rem" }}>
            <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: 8 }}>
              Click to toggle hypothetical skills:
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {PRESET_SKILLS.map((skill) => {
                const isSelected = selectedSkills.includes(skill);
                return (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => (isSelected ? handleRemoveSkill(skill) : handleAddSkill(skill))}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      padding: "0.4rem 0.85rem",
                      borderRadius: "20px",
                      fontSize: "0.8rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      border: isSelected ? "1.5px solid var(--accent, #000000)" : "1px solid var(--border, #e4e4e7)",
                      background: isSelected ? "var(--accent-light, #F5F5F5)" : "var(--surface, #ffffff)",
                      color: isSelected ? "var(--accent, #000000)" : "var(--text-secondary)",
                      transition: "all 0.15s ease",
                    }}
                  >
                    {isSelected ? <Check size={13} /> : <Plus size={13} />}
                    <span>{skill}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Skills Pills */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
            <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
              Testing addition of: <strong>{selectedSkills.join(", ") || "None"}</strong>
            </div>

            <button
              type="button"
              className="career-btn-primary"
              onClick={runSimulation}
              disabled={isSimulating || selectedSkills.length === 0}
            >
              <Cpu size={16} />
              <span>{isSimulating ? "Running Simulation..." : "Simulate Career Impact"}</span>
            </button>
          </div>
        </div>

        {/* Simulation Results (Current vs Projected) */}
        {simulation && (
          <div className="career-card" style={{ background: "linear-gradient(145deg, #ffffff, #FAFAFA)", border: "1.5px solid #DDDDDD" }}>
            <div className="career-card-header">
              <h3 className="career-card-title">
                <TrendingUp size={18} color="var(--accent, #000000)" />
                Scenario Impact: Current State vs. Projected State
              </h3>
            </div>

            {/* Comparison Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "1.5rem" }}>
              {/* CURRENT */}
              <div style={{ background: "var(--surface-soft, #FAFAFA)", border: "1px solid var(--border)", borderRadius: "12px", padding: "1.25rem" }}>
                <div style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 8 }}>
                  CURRENT BASELINE
                </div>
                <div style={{ fontSize: "2rem", fontWeight: 900, color: "var(--text-primary)", marginBottom: 4 }}>
                  {simulation.currentState.careerScore}
                </div>
                <div style={{ fontSize: "0.825rem", color: "var(--text-secondary)", marginBottom: 12 }}>
                  Baseline Career Readiness
                </div>

                <div className="readiness-label-row">
                  <span>Skill Coverage</span>
                  <span>{simulation.currentState.skillCoverage}%</span>
                </div>
                <div className="readiness-track">
                  <div className="readiness-fill" style={{ width: `${simulation.currentState.skillCoverage}%` }} />
                </div>
              </div>

              {/* PROJECTED */}
              <div style={{ background: "#FAFAFA", border: "1.5px solid #86efac", borderRadius: "12px", padding: "1.25rem" }}>
                <div style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", color: "#111111", marginBottom: 8 }}>
                  PROJECTED STATE (+{simulation.addedSkills.length} SKILLS)
                </div>
                <div style={{ fontSize: "2rem", fontWeight: 900, color: "#000000", marginBottom: 4 }}>
                  {simulation.projectedState.projectedCareerScore}
                </div>
                <div style={{ fontSize: "0.825rem", color: "#111111", marginBottom: 12 }}>
                  Potential Career Readiness (+{simulation.projectedState.projectedCareerScore - simulation.currentState.careerScore} pts)
                </div>

                <div className="readiness-label-row" style={{ color: "#000000" }}>
                  <span>Projected Skill Coverage</span>
                  <span>{simulation.projectedState.projectedSkillCoverage}%</span>
                </div>
                <div className="readiness-track">
                  <div className="readiness-fill" style={{ width: `${simulation.projectedState.projectedSkillCoverage}%`, background: "#111111" }} />
                </div>
              </div>
            </div>

            {/* Grounded Bullet Points */}
            <div style={{ marginBottom: "1.25rem" }}>
              <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: 6 }}>
                Key Projected Signals:
              </div>
              <ul style={{ margin: 0, paddingLeft: "1.2rem", fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                {simulation.insights.map((ins, idx) => (
                  <li key={idx} style={{ marginBottom: 4 }}>{ins}</li>
                ))}
              </ul>
            </div>

            {/* Disclaimer Alert */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.775rem", color: "var(--text-muted)", background: "#ffffff", padding: "0.65rem 1rem", borderRadius: "8px", border: "1px solid var(--border)" }}>
              <ShieldAlert size={15} color="#888888" />
              <span>{simulation.disclaimer}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CareerSimulator;
