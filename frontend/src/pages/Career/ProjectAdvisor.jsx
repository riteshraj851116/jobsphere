import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FolderGit2, Sparkles, Layers, Database, Server, ArrowRight } from "lucide-react";
import CareerSubNav from "../../components/career/CareerSubNav";
import { generateProjectBlueprint, getProjectBlueprints } from "../../services/careerService";
import "./career.css";

const ProjectAdvisor = () => {
  const [promptInput, setPromptInput] = useState("Build an advanced MERN + AI portfolio project with automated code execution and ATS parsing.");
  const [activeBlueprint, setActiveBlueprint] = useState(null);
  const [savedBlueprints, setSavedBlueprints] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getProjectBlueprints()
      .then((res) => {
        if (res?.success && res.data?.length > 0) {
          setSavedBlueprints(res.data);
          setActiveBlueprint(res.data[0]);
        }
      })
      .catch(() => {});
  }, []);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!promptInput.trim()) return;
    setLoading(true);
    try {
      const res = await generateProjectBlueprint({ prompt: promptInput.trim() });
      if (res.success) {
        setActiveBlueprint(res.data);
        setSavedBlueprints((prev) => [res.data, ...prev]);
      }
    } catch (err) {
      console.error("Blueprint generation error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="career-container">
      <div className="career-content-limit">
        <CareerSubNav />

        {/* Header */}
        <div className="career-header">
          <div className="career-badge">
            <FolderGit2 size={13} />
            <span>AI Project Advisor</span>
          </div>
          <h1 className="career-title">Full-Stack Project Architecture Advisor</h1>
          <p className="career-subtitle">
            Generate production-grade portfolio blueprints complete with database schemas, API modules,
            testing strategies, and connected job opportunities.
          </p>
        </div>

        {/* Generator Form Card */}
        <div className="career-card">
          <div className="career-card-header">
            <h3 className="career-card-title">
              <Sparkles size={18} color="var(--accent, #000000)" />
              Specify Your Project Vision
            </h3>
          </div>

          <form onSubmit={handleGenerate}>
            <div style={{ marginBottom: "1rem" }}>
              <textarea
                rows={3}
                required
                placeholder="e.g. I want an advanced full-stack SaaS project using React, Node.js, Docker, and WebSockets..."
                value={promptInput}
                onChange={(e) => setPromptInput(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.85rem",
                  borderRadius: "10px",
                  border: "1px solid var(--border)",
                  fontSize: "0.9rem",
                  lineHeight: 1.5,
                  boxSizing: "border-box",
                  outline: "none",
                }}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                type="submit"
                className="career-btn-primary"
                disabled={loading}
              >
                <Sparkles size={16} />
                <span>{loading ? "Architecting Blueprint..." : "Generate Technical Blueprint"}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Blueprint Display */}
        {activeBlueprint && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "1.5rem" }}>
            {/* Main Blueprint details */}
            <div className="career-card">
              <div className="career-card-header">
                <div>
                  <h2 style={{ margin: "0 0 0.35rem", fontSize: "1.4rem", fontWeight: 800, color: "var(--text-primary)" }}>
                    {activeBlueprint.title}
                  </h2>
                  <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                    Target Demographic: {activeBlueprint.targetUsers}
                  </span>
                </div>
              </div>

              {/* Problem Statement */}
              <div style={{ marginBottom: "1.25rem" }}>
                <h4 style={{ margin: "0 0 0.35rem", fontSize: "0.9rem", color: "var(--text-primary)" }}>Problem Statement</h4>
                <p style={{ margin: 0, fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                  {activeBlueprint.problemStatement}
                </p>
              </div>

              {/* Features & Architecture Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
                <div style={{ background: "var(--surface-soft, #FAFAFA)", border: "1px solid var(--border)", borderRadius: "10px", padding: "1rem" }}>
                  <h4 style={{ margin: "0 0 0.5rem", fontSize: "0.85rem", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: 4 }}>
                    <Layers size={15} color="var(--accent)" /> Core Features
                  </h4>
                  <ul style={{ margin: 0, paddingLeft: "1.2rem", fontSize: "0.825rem", color: "var(--text-secondary)", lineHeight: 1.55 }}>
                    {activeBlueprint.features?.map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                </div>

                <div style={{ background: "var(--surface-soft, #FAFAFA)", border: "1px solid var(--border)", borderRadius: "10px", padding: "1rem" }}>
                  <h4 style={{ margin: "0 0 0.5rem", fontSize: "0.85rem", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: 4 }}>
                    <Server size={15} color="#222222" /> Architecture & APIs
                  </h4>
                  <p style={{ margin: "0 0 0.5rem", fontSize: "0.825rem", color: "var(--text-secondary)" }}>
                    {activeBlueprint.architectureSummary}
                  </p>
                  <div style={{ fontSize: "0.775rem", color: "var(--text-muted)" }}>
                    Modules: {activeBlueprint.apiModules?.join(", ")}
                  </div>
                </div>
              </div>

              {/* Database & Deployment */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
                <div style={{ background: "var(--surface-soft, #FAFAFA)", border: "1px solid var(--border)", borderRadius: "10px", padding: "1rem" }}>
                  <h4 style={{ margin: "0 0 0.35rem", fontSize: "0.85rem", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: 4 }}>
                    <Database size={15} color="#333333" /> Database Architecture
                  </h4>
                  <p style={{ margin: 0, fontSize: "0.825rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                    {activeBlueprint.databaseDesign}
                  </p>
                </div>

                <div style={{ background: "var(--surface-soft, #FAFAFA)", border: "1px solid var(--border)", borderRadius: "10px", padding: "1rem" }}>
                  <h4 style={{ margin: "0 0 0.35rem", fontSize: "0.85rem", color: "var(--text-primary)" }}>
                    Testing & Deployment Strategy
                  </h4>
                  <p style={{ margin: 0, fontSize: "0.825rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                    {activeBlueprint.deploymentPlan}
                  </p>
                </div>
              </div>

              {/* Connected Job Roles */}
              {activeBlueprint.relevantJobRoles?.length > 0 && (
                <div style={{ background: "#FAFAFA", border: "1px solid #DDDDDD", borderRadius: "10px", padding: "1rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <strong style={{ fontSize: "0.85rem", color: "#000000" }}>Project &rarr; Job Intelligence:</strong>
                    <span style={{ fontSize: "0.825rem", color: "#111111", marginLeft: 8 }}>
                      Demonstrates core competencies for {activeBlueprint.relevantJobRoles.join(", ")}.
                    </span>
                  </div>
                  <Link to="/career/opportunities" className="career-btn-secondary" style={{ padding: "0.35rem 0.75rem", fontSize: "0.775rem" }}>
                    <span>Find Matching Jobs</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              )}
            </div>

            {/* Right: Tech Stack & Saved Blueprints Sidebar */}
            <div>
              {/* Tech Stack Card */}
              <div className="career-card" style={{ marginBottom: "1rem" }}>
                <h4 style={{ margin: "0 0 0.75rem", fontSize: "0.9rem", color: "var(--text-primary)" }}>
                  Required Tech Stack
                </h4>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {activeBlueprint.techStack?.map((t, idx) => (
                    <span
                      key={idx}
                      style={{
                        background: "var(--surface-soft)",
                        border: "1px solid var(--border)",
                        padding: "3px 8px",
                        borderRadius: "6px",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        color: "var(--text-primary)",
                      }}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Saved Blueprints */}
              <div className="career-card">
                <h4 style={{ margin: "0 0 0.75rem", fontSize: "0.9rem", color: "var(--text-primary)" }}>
                  Saved Blueprints ({savedBlueprints.length})
                </h4>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {savedBlueprints.map((b) => (
                    <div
                      key={b._id}
                      onClick={() => setActiveBlueprint(b)}
                      style={{
                        padding: "0.65rem 0.85rem",
                        borderRadius: "8px",
                        background: activeBlueprint._id === b._id ? "var(--accent-light)" : "var(--surface-soft)",
                        border: activeBlueprint._id === b._id ? "1px solid var(--accent)" : "1px solid var(--border)",
                        fontSize: "0.825rem",
                        cursor: "pointer",
                        fontWeight: 600,
                        color: "var(--text-primary)",
                      }}
                    >
                      {b.title}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectAdvisor;
