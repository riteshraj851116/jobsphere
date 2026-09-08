import React, { useEffect, useState } from "react";
import { CheckCircle2, XCircle, Clock, Copy, Check } from "lucide-react";
import dsaService from "../../services/dsaService";

const SubmissionHistory = ({ problemId, onSelectCode }) => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSub, setSelectedSub] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (problemId) {
      setLoading(true);
      dsaService
        .getSubmissions(problemId)
        .then((res) => {
          if (res.success) {
            setSubmissions(res.data || []);
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [problemId]);

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "2rem", color: "var(--dsa-text-secondary)" }}>
        Loading past submissions...
      </div>
    );
  }

  if (submissions.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "2rem", color: "var(--dsa-text-muted)" }}>
        No submissions yet for this problem. Write your solution and click <strong>Submit</strong>!
      </div>
    );
  }

  return (
    <div>
      <table className="dsa-table" style={{ fontSize: "0.825rem" }}>
        <thead>
          <tr>
            <th>Status</th>
            <th>Language</th>
            <th>Runtime</th>
            <th>Memory</th>
            <th>Date</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {submissions.map((s) => (
            <tr key={s._id}>
              <td>
                {s.status === "Accepted" ? (
                  <span style={{ color: "#222222", display: "inline-flex", alignItems: "center", gap: "0.25rem", fontWeight: 600 }}>
                    <CheckCircle2 size={13} /> Accepted
                  </span>
                ) : (
                  <span style={{ color: "#222222", display: "inline-flex", alignItems: "center", gap: "0.25rem", fontWeight: 600 }}>
                    <XCircle size={13} /> {s.status}
                  </span>
                )}
              </td>
              <td style={{ textTransform: "capitalize" }}>{s.language}</td>
              <td>{s.runtime || 0} ms</td>
              <td>{s.memory ? `${s.memory} KB` : "N/A"}</td>
              <td style={{ color: "var(--dsa-text-muted)" }}>
                {new Date(s.createdAt).toLocaleDateString()}
              </td>
              <td>
                <button
                  type="button"
                  onClick={() => setSelectedSub(s)}
                  className="dsa-page-btn"
                  style={{ padding: "0.2rem 0.5rem", fontSize: "0.75rem" }}
                >
                  View Code
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Code Modal */}
      {selectedSub && (
        <div className="celebration-overlay" onClick={() => setSelectedSub(null)}>
          <div
            className="celebration-modal"
            style={{ maxWidth: "680px", textAlign: "left" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "1rem",
              }}
            >
              <div>
                <h4 style={{ margin: 0, color: "var(--dsa-text-primary)" }}>
                  Submitted Code ({selectedSub.language})
                </h4>
                <span style={{ fontSize: "0.75rem", color: "var(--dsa-text-secondary)" }}>
                  Status: {selectedSub.status} | Runtime: {selectedSub.runtime} ms
                </span>
              </div>

              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  type="button"
                  className="editor-tool-btn"
                  onClick={() => handleCopyCode(selectedSub.code)}
                  title="Copy code"
                >
                  {copied ? <Check size={14} color="#222222" /> : <Copy size={14} />}
                </button>
                <button
                  type="button"
                  className="dsa-page-btn"
                  onClick={() => {
                    if (onSelectCode) onSelectCode(selectedSub.code, selectedSub.language);
                    setSelectedSub(null);
                  }}
                >
                  Load in Editor
                </button>
              </div>
            </div>

            <pre
              style={{
                background: "var(--surface-soft, #FAFAFA)",
                border: "1px solid var(--dsa-border)",
                borderRadius: "8px",
                padding: "1rem",
                maxHeight: "360px",
                overflowY: "auto",
                fontFamily: "monospace",
                fontSize: "0.825rem",
                color: "var(--dsa-text-primary)",
              }}
            >
              {selectedSub.code}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubmissionHistory;
