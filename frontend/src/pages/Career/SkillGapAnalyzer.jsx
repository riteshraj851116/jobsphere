import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  Layers,
  Loader2,
  Map,
  BookOpen
} from "lucide-react";
import { getSkillGap } from "../../services/careerService";
import "./SkillGap.css";

const ROLES = [
  "MERN Stack Developer",
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "Cloud & DevOps",
  "AI & ML Engineer"
];

const SkillGapAnalyzer = () => {
  const [selectedRole, setSelectedRole] = useState("MERN Stack Developer");
  const [gapData, setGapData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchGap = async () => {
      try {
        setLoading(true);
        const data = await getSkillGap({ role: selectedRole });
        if (isMounted) {
          setGapData(data);
        }
      } catch (err) {
        console.error("Failed to load skill gap analysis:", err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchGap();

    return () => {
      isMounted = false;
    };
  }, [selectedRole]);

  const score = gapData?.readinessScore || 0;

  return (
    <div className="skillgap-page">
      <div className="skillgap-container">
        {/* Header */}
        <div className="skillgap-header">
          <div className="roadmap-badge">
            <Sparkles size={14} />
            <span>AI Skill Gap Intelligence</span>
          </div>
          <h1 className="roadmap-title">Skill Gap Analyzer</h1>
          <p className="roadmap-subtitle">
            Benchmark your current profile skills against industry requirements for top engineering positions and discover what you need to learn next.
          </p>

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
            <h3>Evaluating Skill Match & Calculating Gaps...</h3>
          </div>
        ) : (
          <>
            {/* Readiness Summary Banner */}
            <div className="readiness-hero">
              <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                <div className="readiness-circle">
                  <span>{score}%</span>
                </div>
                <div>
                  <h2 style={{ margin: "0 0 4px", fontSize: "1.375rem", fontWeight: "800" }}>
                    {selectedRole} Readiness
                  </h2>
                  <p style={{ margin: 0, color: "#64748b", fontSize: "0.9375rem" }}>
                    You have mastered {gapData?.skillsYouHave?.length || 0} essential skills. Focus on the high-priority skills below to boost your job match score.
                  </p>
                </div>
              </div>

              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <Link to="/career-roadmap" className="btn-session primary">
                  <Map size={16} />
                  <span>Open Learning Roadmap</span>
                </Link>
                <Link to="/resume-analyzer" className="btn-session secondary">
                  <Sparkles size={16} />
                  <span>Scan Resume</span>
                </Link>
              </div>
            </div>

            {/* 3 Columns Breakdown */}
            <div className="skill-columns-grid">
              {/* Column 1: Skills You Have */}
              <div className="skill-column-card">
                <div className="column-header">
                  <CheckCircle2 size={20} color="#16a34a" />
                  <h3>Skills You Have ({gapData?.skillsYouHave?.length || 0})</h3>
                </div>
                <div>
                  {gapData?.skillsYouHave?.length > 0 ? (
                    gapData.skillsYouHave.map((skill, idx) => (
                      <div key={idx} className="skill-item-tag have">
                        <CheckCircle2 size={15} />
                        <span>{skill}</span>
                      </div>
                    ))
                  ) : (
                    <p style={{ color: "#94a3b8", fontSize: "0.875rem", fontStyle: "italic" }}>
                      No matching skills found on your profile.
                    </p>
                  )}
                </div>
              </div>

              {/* Column 2: High Priority To Learn */}
              <div className="skill-column-card">
                <div className="column-header">
                  <XCircle size={20} color="#dc2626" />
                  <h3>High Priority ({gapData?.skillsToLearn?.highPriority?.length || 0})</h3>
                </div>
                <div>
                  {gapData?.skillsToLearn?.highPriority?.length > 0 ? (
                    gapData.skillsToLearn.highPriority.map((skill, idx) => (
                      <div key={idx} className="skill-item-tag high">
                        <XCircle size={15} />
                        <span>{skill}</span>
                      </div>
                    ))
                  ) : (
                    <p style={{ color: "#16a34a", fontSize: "0.875rem", fontWeight: "600" }}>
                      Awesome! All high priority skills mastered.
                    </p>
                  )}
                </div>
              </div>

              {/* Column 3: Medium & Optional Skills */}
              <div className="skill-column-card">
                <div className="column-header">
                  <AlertTriangle size={20} color="#d97706" />
                  <h3>Supporting Skills ({gapData?.skillsToLearn?.mediumPriority?.length || 0})</h3>
                </div>
                <div>
                  {gapData?.skillsToLearn?.mediumPriority?.length > 0 ? (
                    gapData.skillsToLearn.mediumPriority.map((skill, idx) => (
                      <div key={idx} className="skill-item-tag medium">
                        <AlertTriangle size={15} />
                        <span>{skill}</span>
                      </div>
                    ))
                  ) : (
                    <p style={{ color: "#94a3b8", fontSize: "0.875rem" }}>
                      No pending supporting skills.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SkillGapAnalyzer;
