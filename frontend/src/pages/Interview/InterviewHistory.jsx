import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  History,
  PlayCircle,
  CheckCircle2,
  Clock,
  Layers,
  ArrowRight,
  Eye,
  Loader2,
  Sparkles,
  Calendar
} from "lucide-react";
import { getInterviewHistory } from "../../services/interviewService";
import "./Interview.css";

const InterviewHistory = () => {
  const navigate = useNavigate();

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchHistory = async () => {
      try {
        setLoading(true);
        const res = await getInterviewHistory();
        const list = res?.data || res?.sessions || res || [];
        if (isMounted) {
          setHistory(Array.isArray(list) ? list : []);
        }
      } catch (err) {
        console.error("Failed to fetch interview history:", err);
        if (isMounted) {
          setError(err?.message || "Failed to load past interviews.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchHistory();

    return () => {
      isMounted = false;
    };
  }, []);

  const formatDuration = (secs) => {
    if (!secs) return "0s";
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    if (mins === 0) return `${remainder}s`;
    return `${mins}m ${remainder}s`;
  };

  return (
    <div className="interview-page">
      <div className="interview-container">
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <h1 className="interview-title" style={{ textAlign: "left", marginBottom: "0.25rem" }}>
              Interview Practice History
            </h1>
            <p style={{ color: "#71717a", fontSize: "0.9375rem" }}>
              Review your previous practice sessions and track your readiness over time.
            </p>
          </div>

          <Link to="/interview-practice" className="btn-session primary">
            <PlayCircle size={16} />
            <span>New Practice Session</span>
          </Link>
        </div>

        {/* Loading State */}
        {loading && (
          <div style={{ textAlign: "center", padding: "4rem 0" }}>
            <Loader2 size={36} style={{ margin: "0 auto 1rem", animation: "spin 1s linear infinite" }} />
            <h3>Loading Practice History...</h3>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="review-card" style={{ textAlign: "center", padding: "2rem" }}>
            <p style={{ color: "#dc2626" }}>{error}</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && history.length === 0 && (
          <div className="empty-history-box">
            <div className="empty-history-icon">
              <History size={28} />
            </div>
            <h3 style={{ fontSize: "1.25rem", fontWeight: "700", marginBottom: "0.5rem" }}>
              No practice interviews yet
            </h3>
            <p style={{ color: "#71717a", maxWidth: "420px", margin: "0 auto 1.5rem", lineHeight: "1.5" }}>
              Take your first mock technical interview to practice answering questions, get model explanations, and boost your confidence.
            </p>
            <Link to="/interview-practice" className="btn-session primary">
              <Sparkles size={16} />
              <span>Start Your First Practice</span>
            </Link>
          </div>
        )}

        {/* Sessions List */}
        {!loading && !error && history.length > 0 && (
          <div className="history-grid">
            {history.map((session) => {
              const sId = session._id || session.id;
              const totalQ = session.totalQuestions || session.questions?.length || 0;
              const answeredQ = (session.answers || []).filter(
                (a) => !a.skipped && a.answer && a.answer.trim().length > 0
              ).length;
              const isCompleted = session.status === "completed";

              return (
                <div key={sId} className="history-card">
                  <div className="history-main">
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                      <span className="history-role">{session.role}</span>
                      <span className={`meta-chip difficulty-${session.difficulty}`}>
                        {session.difficulty.toUpperCase()}
                      </span>
                      {isCompleted ? (
                        <span
                          style={{
                            background: "#f0fdf4",
                            color: "#16a34a",
                            border: "1px solid #bbf7d0",
                            borderRadius: "6px",
                            padding: "2px 8px",
                            fontSize: "0.75rem",
                            fontWeight: "700"
                          }}
                        >
                          Completed
                        </span>
                      ) : (
                        <span
                          style={{
                            background: "#fffbeb",
                            color: "#d97706",
                            border: "1px solid #fde68a",
                            borderRadius: "6px",
                            padding: "2px 8px",
                            fontSize: "0.75rem",
                            fontWeight: "700"
                          }}
                        >
                          In Progress
                        </span>
                      )}
                    </div>

                    <div className="history-meta-row">
                      <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <Calendar size={14} />
                        {new Date(session.createdAt).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric"
                        })}
                      </span>

                      <span>&bull;</span>

                      <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <CheckCircle2 size={14} />
                        {answeredQ} / {totalQ} Answered
                      </span>

                      <span>&bull;</span>

                      <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <Clock size={14} />
                        {formatDuration(session.duration)}
                      </span>
                    </div>
                  </div>

                  <div className="history-actions">
                    {isCompleted ? (
                      <Link
                        to={`/interview-practice/result/${sId}`}
                        className="btn-session secondary"
                      >
                        <Eye size={15} />
                        <span>View Result</span>
                      </Link>
                    ) : (
                      <Link
                        to={`/interview-practice/session/${sId}`}
                        className="btn-session primary"
                      >
                        <span>Resume</span>
                        <ArrowRight size={15} />
                      </Link>
                    )}

                    <Link to="/interview-practice" className="btn-session secondary">
                      <span>Practice Again</span>
                    </Link>
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

export default InterviewHistory;
