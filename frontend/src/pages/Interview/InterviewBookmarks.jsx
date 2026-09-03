import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Bookmark,
  Trash2,
  Sparkles,
  ArrowRight,
  BookOpen,
  Loader2,
  Tag,
  GraduationCap
} from "lucide-react";
import { getBookmarks, toggleBookmark } from "../../services/careerService";
import "./Interview.css";

const InterviewBookmarks = () => {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchBookmarks = async () => {
      try {
        setLoading(true);
        const data = await getBookmarks();
        if (isMounted) {
          setBookmarks(data.bookmarks || []);
        }
      } catch (err) {
        console.error("Failed to load bookmarks:", err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchBookmarks();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleRemove = async (questionId) => {
    try {
      setDeletingId(questionId);
      await toggleBookmark(questionId);
      setBookmarks((prev) => prev.filter((b) => (b.question?._id || b.question) !== questionId));
    } catch (err) {
      console.error("Failed to remove bookmark:", err);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="interview-page">
      <div className="interview-container">
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <h1 className="interview-title" style={{ textAlign: "left", marginBottom: "0.25rem" }}>
              Bookmarked Interview Questions
            </h1>
            <p style={{ color: "#71717a", fontSize: "0.9375rem" }}>
              Review challenging technical questions, practice model answers, and study your revision notes.
            </p>
          </div>

          <Link to="/interview-practice" className="btn-session primary">
            <GraduationCap size={16} />
            <span>Practice Interviews</span>
          </Link>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "4rem 0" }}>
            <Loader2 size={36} style={{ animation: "spin 1s linear infinite", margin: "0 auto 1rem" }} />
            <h3>Loading Saved Questions...</h3>
          </div>
        ) : bookmarks.length === 0 ? (
          <div className="empty-history-box">
            <div className="empty-history-icon">
              <Bookmark size={28} />
            </div>
            <h3 style={{ fontSize: "1.25rem", fontWeight: "700", marginBottom: "0.5rem" }}>
              No bookmarked questions yet
            </h3>
            <p style={{ color: "#71717a", maxWidth: "420px", margin: "0 auto 1.5rem" }}>
              When reviewing your interview results, click the bookmark icon on any difficult question to save it for revision.
            </p>
            <Link to="/interview-practice" className="btn-session primary">
              <Sparkles size={16} />
              <span>Start Practice Interview</span>
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {bookmarks.map((bm) => {
              const q = bm.question;
              if (!q) return null;

              return (
                <div key={bm._id} className="interview-card" style={{ margin: 0, padding: "1.5rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
                    <div>
                      <div style={{ display: "flex", gap: "8px", marginBottom: "8px", flexWrap: "wrap" }}>
                        <span className={`diff-pill ${q.difficulty || "medium"}`}>
                          {q.difficulty || "Medium"}
                        </span>
                        <span style={{ fontSize: "0.75rem", background: "#f1f5f9", padding: "2px 8px", borderRadius: "6px", color: "#475569", fontWeight: "600" }}>
                          {q.category || q.role}
                        </span>
                      </div>

                      <h3 style={{ fontSize: "1.125rem", fontWeight: "700", margin: "0 0 8px", color: "#0f172a" }}>
                        {q.question}
                      </h3>

                      {q.expectedAnswer && (
                        <div style={{ background: "#f8fafc", padding: "12px 14px", borderRadius: "10px", marginTop: "10px", fontSize: "0.875rem", color: "#334155", borderLeft: "3px solid #2563eb" }}>
                          <strong>Model Answer: </strong>
                          {q.expectedAnswer}
                        </div>
                      )}

                      {bm.notes && (
                        <p style={{ fontSize: "0.8125rem", color: "#64748b", margin: "8px 0 0", fontStyle: "italic" }}>
                          <strong>My Notes:</strong> {bm.notes}
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      className="btn-remove-file"
                      onClick={() => handleRemove(q._id)}
                      disabled={deletingId === q._id}
                      title="Remove Bookmark"
                    >
                      <Trash2 size={16} />
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

export default InterviewBookmarks;
