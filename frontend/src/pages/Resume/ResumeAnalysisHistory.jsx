import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FileText,
  Trash2,
  Eye,
  PlusCircle,
  Calendar,
  Sparkles,
  Loader2,
  AlertCircle,
  History
} from "lucide-react";
import {
  getResumeAnalyses,
  deleteResumeAnalysis
} from "../../services/resumeService";
import "./ResumeAnalyzer.css";

const ResumeAnalysisHistory = () => {
  const navigate = useNavigate();

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const res = await getResumeAnalyses();
        const list = res?.data || res?.analyses || res || [];
        if (isMounted) {
          setHistory(Array.isArray(list) ? list : []);
        }
      } catch (err) {
        console.error("Failed to load resume analyses history:", err);
        if (isMounted) {
          setError(err?.message || "Failed to load past scans.");
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

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this analysis report?")) {
      return;
    }

    try {
      setDeletingId(id);
      await deleteResumeAnalysis(id);
      setHistory((prev) => prev.filter((item) => (item._id || item.id) !== id));
    } catch (err) {
      console.error("Failed to delete analysis:", err);
      alert(err?.message || "Failed to delete analysis.");
    } finally {
      setDeletingId(null);
    }
  };

  const getScoreBadgeClass = (score) => {
    if (score >= 80) return "excellent";
    if (score >= 65) return "good";
    if (score >= 45) return "moderate";
    return "poor";
  };

  return (
    <div className="resume-page">
      <div className="resume-container">
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <h1 className="resume-title" style={{ textAlign: "left", marginBottom: "0.25rem" }}>
              Resume Scan History
            </h1>
            <p style={{ color: "#71717a", fontSize: "0.9375rem" }}>
              Review past ATS compatibility scans, track resume score progression, and access reports.
            </p>
          </div>

          <Link to="/resume-analyzer" className="btn-session primary">
            <PlusCircle size={16} />
            <span>Scan New Resume</span>
          </Link>
        </div>

        {/* Loading State */}
        {loading && (
          <div style={{ textAlign: "center", padding: "4rem 0" }}>
            <Loader2 size={36} style={{ margin: "0 auto 1rem", animation: "spin 1s linear infinite" }} />
            <h3>Loading Saved Analyses...</h3>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="resume-card" style={{ textAlign: "center", padding: "2rem" }}>
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
              No resume scans yet
            </h3>
            <p style={{ color: "#71717a", maxWidth: "420px", margin: "0 auto 1.5rem", lineHeight: "1.5" }}>
              Upload your resume and benchmark it against a job description to get your ATS compatibility score and actionable keyword insights.
            </p>
            <Link to="/resume-analyzer" className="btn-session primary">
              <Sparkles size={16} />
              <span>Scan Your First Resume</span>
            </Link>
          </div>
        )}

        {/* List of Analyses */}
        {!loading && !error && history.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {history.map((item) => {
              const id = item._id || item.id;
              const badgeClass = getScoreBadgeClass(item.atsScore);

              return (
                <div
                  key={id}
                  className="resume-card"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: "16px",
                    padding: "1.25rem 1.5rem",
                    margin: 0
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <div
                      className={`score-circle-wrapper ${badgeClass}`}
                      style={{ width: "56px", height: "56px", borderWidth: "3px" }}
                    >
                      <span style={{ fontSize: "1.125rem", fontWeight: "800" }}>
                        {item.atsScore}
                      </span>
                    </div>

                    <div>
                      <div style={{ fontSize: "1.0625rem", fontWeight: "700", color: "var(--text-primary, #18181b)" }}>
                        {item.jobTitle || "Job Position"}
                      </div>
                      <div style={{ fontSize: "0.8125rem", color: "#71717a", display: "flex", alignItems: "center", gap: "8px", marginTop: "3px" }}>
                        <span>File: {item.resumeFileName}</span>
                        <span>&bull;</span>
                        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                          <Calendar size={13} />
                          {new Date(item.createdAt).toLocaleDateString(undefined, {
                            year: "numeric",
                            month: "short",
                            day: "numeric"
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <Link
                      to={`/resume-analyzer/result/${id}`}
                      className="btn-session secondary"
                    >
                      <Eye size={15} />
                      <span>View Report</span>
                    </Link>

                    <button
                      type="button"
                      className="btn-remove-file"
                      onClick={(e) => handleDelete(id, e)}
                      disabled={deletingId === id}
                      title="Delete report"
                    >
                      {deletingId === id ? (
                        <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
                      ) : (
                        <Trash2 size={16} />
                      )}
                    </button>
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

export default ResumeAnalysisHistory;
