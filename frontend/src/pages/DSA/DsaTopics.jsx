import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layers, ArrowRight, CheckCircle2 } from "lucide-react";
import DsaSubNav from "../../components/dsa/DsaSubNav";
import dsaService from "../../services/dsaService";
import { useAuth } from "../../hooks/useAuth";
import "./dsa.css";

const DsaTopics = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dsaService
      .getTopics()
      .then((res) => {
        if (res.success) {
          setTopics(res.data || []);
        }
      })
      .catch((err) => console.error("Error loading topics:", err))
      .finally(() => setLoading(false));
  }, [user]);

  const handleTopicClick = (topicName) => {
    navigate(`/dsa/problems?topic=${encodeURIComponent(topicName)}`);
  };

  return (
    <div className="dsa-container">
      <div className="dsa-content-limit">
        {/* Navigation */}
        <DsaSubNav />

        {/* Page Title */}
        <div style={{ marginBottom: "2rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
            <Layers size={24} color="var(--dsa-easy)" />
            <h1 style={{ margin: 0, fontSize: "1.75rem", color: "var(--dsa-text-primary)" }}>
              DSA Topics Catalog
            </h1>
          </div>
          <p style={{ margin: 0, color: "var(--dsa-text-secondary)", fontSize: "0.925rem" }}>
            Explore interview problems grouped by core data structures and algorithmic paradigms.
            Click any topic to practice its challenges.
          </p>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "3rem", color: "var(--dsa-text-secondary)" }}>
            Loading DSA topics...
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "1.25rem",
            }}
          >
            {topics.map((t, idx) => {
              const pct = t.totalProblems > 0 ? Math.round((t.solvedCount / t.totalProblems) * 100) : 0;

              return (
                <div
                  key={idx}
                  className="dsa-stat-box"
                  style={{
                    textAlign: "left",
                    cursor: "pointer",
                    padding: "1.25rem",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                  onClick={() => handleTopicClick(t.name)}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                      <h3 style={{ margin: 0, fontSize: "1.1rem", color: "var(--dsa-text-primary)" }}>
                        {t.name}
                      </h3>
                      <span style={{ fontSize: "0.8rem", color: "var(--dsa-text-muted)" }}>
                        {t.totalProblems} {t.totalProblems === 1 ? "problem" : "problems"}
                      </span>
                    </div>

                    {/* Progress details */}
                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.8rem", color: "var(--dsa-text-secondary)", marginBottom: "0.85rem" }}>
                      <CheckCircle2 size={14} color={t.solvedCount > 0 ? "#222222" : "var(--dsa-text-muted)"} />
                      <span>
                        {t.solvedCount} of {t.totalProblems} Solved
                      </span>
                    </div>

                    {/* Difficulty breakdown tags */}
                    <div style={{ display: "flex", gap: "0.4rem", marginBottom: "1rem" }}>
                      {t.easyCount > 0 && (
                        <span className="dsa-badge-easy" style={{ fontSize: "0.7rem", padding: "0.15rem 0.45rem" }}>
                          {t.easyCount} Easy
                        </span>
                      )}
                      {t.mediumCount > 0 && (
                        <span className="dsa-badge-medium" style={{ fontSize: "0.7rem", padding: "0.15rem 0.45rem" }}>
                          {t.mediumCount} Med
                        </span>
                      )}
                      {t.hardCount > 0 && (
                        <span className="dsa-badge-hard" style={{ fontSize: "0.7rem", padding: "0.15rem 0.45rem" }}>
                          {t.hardCount} Hard
                        </span>
                      )}
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      borderTop: "1px solid var(--dsa-border-light)",
                      paddingTop: "0.75rem",
                      fontSize: "0.8rem",
                      color: "#444444",
                      fontWeight: 600,
                    }}
                  >
                    <span>Practice {t.name}</span>
                    <ArrowRight size={14} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default DsaTopics;
