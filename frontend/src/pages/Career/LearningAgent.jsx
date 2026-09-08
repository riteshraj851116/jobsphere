import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { 
  GraduationCap, RefreshCw, CheckCircle, 
  BrainCircuit, CheckSquare, Square, Plus
} from "lucide-react";
import CareerSubNav from "../../components/career/CareerSubNav";
import AIExplanationBanner from "../../components/career/AIExplanationBanner";
import { 
  getLearningAgent, getRevisionSessions, 
  generateNewRevisionSession, toggleRevisionTopic 
} from "../../services/careerService";
import "./career.css";

export default function LearningAgent() {
  const [activeTab, setActiveTab] = useState("recommendations"); // 'recommendations' | 'revision'
  const [learningData, setLearningData] = useState({ recommendations: [] });
  const [revisionSessions, setRevisionSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generatingCategory, setGeneratingCategory] = useState(null);

  const categories = [
    "JavaScript", "React", "Node.js", "MongoDB", 
    "DSA", "System Design", "Concepts", "Interview Questions"
  ];

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [learnRes, revRes] = await Promise.all([
        getLearningAgent(),
        getRevisionSessions()
      ]);
      if (learnRes.success && learnRes.data) {
        setLearningData(learnRes.data);
      }
      if (revRes.success && revRes.data) {
        setRevisionSessions(revRes.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);


  const handleGenerateRevision = async (cat) => {
    setGeneratingCategory(cat);
    try {
      const res = await generateNewRevisionSession(cat);
      if (res.success && res.data) {
        setRevisionSessions([res.data, ...revisionSessions]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setGeneratingCategory(null);
    }
  };

  const handleToggleTopic = async (sessionId, topicId) => {
    try {
      const res = await toggleRevisionTopic(sessionId, topicId);
      if (res.success && res.data) {
        setRevisionSessions(prev => prev.map(s => s._id === sessionId ? res.data : s));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="career-container">
      <div className="career-content-limit">
        <CareerSubNav />

        <div className="career-header">
          <div className="career-badge">
            <GraduationCap size={13} />
            <span>AI Learning Agent</span>
          </div>
          <h1 className="career-title" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            AI Learning Agent & Personalized Revision
          </h1>
          <p className="career-subtitle">
            Dynamic curriculum optimization derived from your weak assessment spots, missed DSA patterns, and target role skill gaps with grounded rationale.
          </p>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
          <button 
            className={activeTab === "recommendations" ? "career-btn-primary" : "career-btn-secondary"}
            onClick={() => setActiveTab("recommendations")}
            style={{ fontSize: "0.85rem" }}
          >
            <BrainCircuit size={16} /> Recommended Learning Paths
          </button>
          <button 
            className={activeTab === "revision" ? "career-btn-primary" : "career-btn-secondary"}
            onClick={() => setActiveTab("revision")}
            style={{ fontSize: "0.85rem" }}
          >
            <RefreshCw size={16} /> Weak-Area Revision Deck ({revisionSessions.length})
          </button>
        </div>

        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "4rem 0" }}>
            <div className="career-spinner" />
            <p style={{ marginTop: "1rem", color: "#94a3b8" }}>Synthesizing learning diagnostics...</p>
          </div>
        ) : activeTab === "recommendations" ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <div className="career-card" style={{ background: "rgba(139, 92, 246, 0.06)", border: "1px solid rgba(139, 92, 246, 0.15)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
                <div>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: "0 0 0.25rem", color: "#f1f5f9" }}>
                    Autonomous Curriculum Sequencing
                  </h3>
                  <p style={{ fontSize: "0.85rem", color: "#94a3b8", margin: 0 }}>
                    High-leverage next steps prioritized to maximize career score and interview readiness.
                  </p>
                </div>
                <Link to="/career/autopilot" className="career-btn-primary" style={{ fontSize: "0.85rem" }}>
                  Open Career Autopilot Roadmap
                </Link>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {(learningData.recommendations || []).map((rec, idx) => (
                <div key={idx} className="career-card" style={{ borderLeft: `4px solid ${rec.priority === "High" ? "#fb7185" : "#a78bfa"}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.5rem", marginBottom: "0.5rem" }}>
                    <div>
                      <span className={rec.priority === "High" ? "passport-badge-practicing" : "passport-badge-assessed"} style={{ fontSize: "0.75rem", marginBottom: "0.25rem", display: "inline-block" }}>
                        {rec.priority || "Medium"} Priority
                      </span>
                      <h3 style={{ fontSize: "1.15rem", fontWeight: 700, margin: 0, color: "#f1f5f9" }}>
                        {rec.topic || rec.skill || `Topic ${idx + 1}`}
                      </h3>
                    </div>
                    {rec.estimatedTime && (
                      <span className="career-score-pill" style={{ fontSize: "0.8rem" }}>
                        Est: {rec.estimatedTime}
                      </span>
                    )}
                  </div>

                  <p style={{ fontSize: "0.9rem", color: "#cbd5e1", lineHeight: 1.5, marginBottom: "0.75rem" }}>
                    {rec.action || rec.description || "Systematic study and hands-on implementation suggested."}
                  </p>

                  {rec.why && (
                    <AIExplanationBanner 
                      title="Why Learn This Now?"
                      text={rec.why}
                    />
                  )}

                  {rec.keyConcepts && rec.keyConcepts.length > 0 && (
                    <div style={{ marginTop: "0.75rem" }}>
                      <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "#94a3b8", display: "block", marginBottom: "0.3rem" }}>
                        Key Focus Areas:
                      </span>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                        {rec.keyConcepts.map((c, i) => (
                          <span key={i} className="career-badge-assessed" style={{ fontSize: "0.75rem" }}>
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {(!learningData.recommendations || learningData.recommendations.length === 0) && (
                <div className="career-card" style={{ textAlign: "center", padding: "3rem 1rem" }}>
                  <CheckCircle size={36} style={{ color: "#34d399", margin: "0 auto 0.75rem" }} />
                  <h3 style={{ fontSize: "1.1rem", fontWeight: 600, color: "#f1f5f9" }}>All Core Foundations Cleared!</h3>
                  <p style={{ color: "#94a3b8", fontSize: "0.9rem", maxWidth: "450px", margin: "0.5rem auto 1.5rem" }}>
                    No urgent skill gaps detected. You can strengthen your profile with advanced system design or mock interviews.
                  </p>
                  <Link to="/interview/prepare" className="career-btn-primary">
                    Practice Mock Interviews
                  </Link>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Revision Sessions Tab */
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <div className="career-card">
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.5rem", color: "#f1f5f9" }}>
                Generate Targeted Quick-Revision Deck
              </h3>
              <p style={{ fontSize: "0.85rem", color: "#94a3b8", marginBottom: "1rem" }}>
                Select a domain below. The AI extracts tricky interview questions, edge cases, and core concepts into a focused revision checklist.
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    className="career-btn-secondary"
                    style={{ fontSize: "0.8rem" }}
                    disabled={generatingCategory === cat}
                    onClick={() => handleGenerateRevision(cat)}
                  >
                    {generatingCategory === cat ? (
                      <>
                        <div className="career-spinner" style={{ width: "12px", height: "12px", borderWidth: "2px" }} />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Plus size={14} /> {cat}
                      </>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {revisionSessions.map((session) => {
                const completedCount = (session.topics || []).filter(t => t.completed).length;
                const totalCount = (session.topics || []).length;
                const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

                return (
                  <div key={session._id} className="career-card">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem", marginBottom: "0.75rem" }}>
                      <div>
                        <span className="career-badge-verified" style={{ fontSize: "0.75rem", marginBottom: "0.25rem", display: "inline-block" }}>
                          {session.category || "Domain Revision"}
                        </span>
                        <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0, color: "#f1f5f9" }}>
                          {session.title || `${session.category} Revision Deck`}
                        </h3>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#cbd5e1" }}>
                          {completedCount}/{totalCount} Reviewed ({percent}%)
                        </span>
                        <div className="readiness-track" style={{ width: "80px", height: "8px" }}>
                          <div className="readiness-fill fill-emerald" style={{ width: `${percent}%` }} />
                        </div>
                      </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: "0.75rem" }}>
                      {(session.topics || []).map((topic) => (
                        <div 
                          key={topic._id} 
                          onClick={() => handleToggleTopic(session._id, topic._id)}
                          style={{ 
                            padding: "0.6rem 0.75rem", 
                            background: topic.completed ? "rgba(16, 185, 129, 0.06)" : "rgba(15, 23, 42, 0.4)", 
                            borderRadius: "10px", 
                            border: `1px solid ${topic.completed ? "rgba(16, 185, 129, 0.15)" : "rgba(148, 163, 184, 0.08)"}`,
                            display: "flex", 
                            alignItems: "flex-start", 
                            gap: "0.6rem", 
                            cursor: "pointer",
                            transition: "all 0.2s ease"
                          }}
                        >
                          {topic.completed ? (
                            <CheckSquare size={18} style={{ color: "#34d399", flexShrink: 0, marginTop: "2px" }} />
                          ) : (
                            <Square size={18} style={{ color: "#64748b", flexShrink: 0, marginTop: "2px" }} />
                          )}
                          <div>
                            <span style={{ 
                              fontSize: "0.9rem", 
                              fontWeight: 600, 
                              textDecoration: topic.completed ? "line-through" : "none",
                              color: topic.completed ? "#64748b" : "#f1f5f9"
                            }}>
                              {topic.concept}
                            </span>
                            {topic.keyTakeaway && (
                              <p style={{ fontSize: "0.8rem", color: "#94a3b8", margin: "0.2rem 0 0", lineHeight: 1.4 }}>
                                {topic.keyTakeaway}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

              {revisionSessions.length === 0 && (
                <div className="career-card" style={{ textAlign: "center", padding: "3rem 1rem" }}>
                  <RefreshCw size={36} style={{ opacity: 0.4, color: "#64748b", margin: "0 auto 0.75rem" }} />
                  <h3 style={{ fontSize: "1.1rem", fontWeight: 600, color: "#f1f5f9" }}>No Revision Decks Generated Yet</h3>
                  <p style={{ color: "#94a3b8", fontSize: "0.9rem", maxWidth: "400px", margin: "0.5rem auto" }}>
                    Pick a topic above to generate your first high-yield spaced revision card deck.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
