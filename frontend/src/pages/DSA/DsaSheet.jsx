import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, CheckCircle2, Clock, Circle, ArrowRight } from "lucide-react";
import DsaSubNav from "../../components/dsa/DsaSubNav";
import dsaService from "../../services/dsaService";
import { useAuth } from "../../hooks/useAuth";
import "./dsa.css";

const DsaSheet = () => {
  const { user } = useAuth();
  const [tiers, setTiers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dsaService
      .getDsaSheet()
      .then((res) => {
        if (res.success) {
          setTiers(res.data || []);
        }
      })
      .catch((err) => console.error("Error loading DSA sheet:", err))
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <div className="dsa-container">
      <div className="dsa-content-limit">
        {/* Navigation */}
        <DsaSubNav />

        {/* Header */}
        <div style={{ marginBottom: "2rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
            <BookOpen size={24} color="var(--dsa-accent)" />
            <h1 style={{ margin: 0, fontSize: "1.75rem", color: "var(--dsa-text-primary)" }}>
              JobSphere Curated DSA Sheet
            </h1>
          </div>
          <p style={{ margin: 0, color: "var(--dsa-text-secondary)", fontSize: "0.925rem", maxWidth: "800px" }}>
            A structured roadmap organized into 3 developmental tiers: Beginner, Intermediate, and Advanced.
            Progress through each tier to systematically prepare for technical interviews at top engineering companies.
          </p>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "3rem", color: "var(--dsa-text-secondary)" }}>
            Loading DSA Sheet roadmap...
          </div>
        ) : (
          <div>
            {tiers.map((tier, idx) => {
              const pct = tier.total > 0 ? Math.round((tier.solved / tier.total) * 100) : 0;

              return (
                <div key={idx} className="sheet-tier-card">
                  {/* Tier Header */}
                  <div className="sheet-tier-header">
                    <div>
                      <h2 style={{ margin: "0 0 0.25rem", fontSize: "1.3rem", color: "var(--dsa-text-primary)" }}>
                        {tier.name}
                      </h2>
                      <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--dsa-text-secondary)" }}>
                        {tier.description}
                      </p>
                    </div>

                    <div style={{ textAlign: "right", minWidth: 140 }}>
                      <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--dsa-text-primary)", marginBottom: 4 }}>
                        {tier.solved} / {tier.total} Solved ({pct}%)
                      </div>
                      <div
                        style={{
                          height: 6,
                          width: "100%",
                          background: "var(--dsa-border, #e4e4e7)",
                          borderRadius: 4,
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            height: "100%",
                            width: `${pct}%`,
                            background: "var(--dsa-easy)",
                            transition: "width 0.4s ease",
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Covered Topics Bar */}
                  <div style={{ marginBottom: "1.25rem" }}>
                    <span style={{ fontSize: "0.775rem", color: "var(--dsa-text-muted)", marginRight: 8 }}>
                      Key Patterns:
                    </span>
                    {tier.topics?.map((t, tIdx) => (
                      <span key={tIdx} className="dsa-topic-pill">
                        {t}
                      </span>
                    ))}
                  </div>

                  {/* Problem Table */}
                  <table className="dsa-table">
                    <thead>
                      <tr>
                        <th style={{ width: 45 }}>Status</th>
                        <th style={{ width: 60 }}>#</th>
                        <th>Problem Title</th>
                        <th style={{ width: 110 }}>Difficulty</th>
                        <th>Topics</th>
                        <th style={{ width: 90, textAlign: "right" }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tier.problems?.map((p) => (
                        <tr key={p._id}>
                          <td style={{ textAlign: "center" }}>
                            {p.isSolved ? (
                              <span title="Solved" className="dsa-status-icon-solved">
                                <CheckCircle2 size={17} />
                              </span>
                            ) : (
                              <span title="Unsolved" style={{ color: "var(--dsa-text-muted)" }}>
                                <Circle size={15} strokeWidth={1.5} />
                              </span>
                            )}
                          </td>
                          <td style={{ color: "var(--dsa-text-muted)" }}>{p.problemNumber}</td>
                          <td>
                            <Link to={`/dsa/problems/${p.slug}`} className="dsa-problem-link">
                              {p.title}
                            </Link>
                          </td>
                          <td>
                            <span
                              className={
                                p.difficulty === "Easy"
                                  ? "dsa-badge-easy"
                                  : p.difficulty === "Medium"
                                  ? "dsa-badge-medium"
                                  : "dsa-badge-hard"
                              }
                            >
                              {p.difficulty}
                            </span>
                          </td>
                          <td>
                            {p.topics?.slice(0, 2).map((t, tIdx) => (
                              <span key={tIdx} className="dsa-topic-pill">
                                {t}
                              </span>
                            ))}
                          </td>
                          <td style={{ textAlign: "right" }}>
                            <Link
                              to={`/dsa/problems/${p.slug}`}
                              className="dsa-page-btn"
                              style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 3 }}
                            >
                              <span>{p.isSolved ? "Review" : "Solve"}</span>
                              <ArrowRight size={12} />
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default DsaSheet;
