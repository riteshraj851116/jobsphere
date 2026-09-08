import React, { useEffect, useState } from "react";
import { Award, CheckCircle2, AlertCircle, Clock, ShieldCheck, Plus, ExternalLink } from "lucide-react";
import CareerSubNav from "../../components/career/CareerSubNav";
import { getSkillPassport, verifySkill } from "../../services/careerService";
import "./career.css";

const SkillPassport = () => {
  const [proofs, setProofs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [targetSkill, setTargetSkill] = useState("");
  const [evidenceLink, setEvidenceLink] = useState("");
  const [evidenceDesc, setEvidenceDesc] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  const fetchProofs = async () => {
    setLoading(true);
    try {
      const res = await getSkillPassport();
      if (res?.success) {
        setProofs(res.data);
      }
    } catch (err) {
      console.error("Error loading skill passport:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProofs();
  }, []);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!targetSkill.trim()) return;
    setIsVerifying(true);
    try {
      const res = await verifySkill({
        skillName: targetSkill.trim(),
        proofType: "project_evidence",
        evidence: {
          link: evidenceLink,
          description: evidenceDesc || "Demonstrated in verified project repository.",
          score: 90,
        },
      });
      if (res.success) {
        setShowVerifyModal(false);
        setTargetSkill("");
        setEvidenceLink("");
        setEvidenceDesc("");
        await fetchProofs();
      }
    } catch (err) {
      console.error("Verification error:", err);
    } finally {
      setIsVerifying(false);
    }
  };

  const verifiedCount = proofs.filter((p) => p.status === "Verified").length;

  return (
    <div className="career-container">
      <div className="career-content-limit">
        <CareerSubNav />

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <div className="career-badge">
              <Award size={13} />
              <span>Skill Proof System</span>
            </div>
            <h1 className="career-title">Verified Skill Passport</h1>
            <p className="career-subtitle">
              Transparent, tamper-proof skill verification. Skills are verified through completed DSA problems,
              interview screening sessions, or evaluated repository artifacts.
            </p>
          </div>

          <button
            type="button"
            className="career-btn-primary"
            onClick={() => setShowVerifyModal(true)}
          >
            <ShieldCheck size={16} />
            <span>Submit Skill for Proof</span>
          </button>
        </div>

        {/* Overview Stats Bar */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "1.5rem" }}>
          <div className="career-card" style={{ padding: "1.25rem", textAlign: "center", marginBottom: 0 }}>
            <div style={{
              fontSize: "1.75rem",
              fontWeight: 900,
              background: "linear-gradient(135deg, #34d399, #06b6d4)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>
              {verifiedCount}
            </div>
            <div style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", color: "#94a3b8" }}>
              Verified Skills
            </div>
          </div>

          <div className="career-card" style={{ padding: "1.25rem", textAlign: "center", marginBottom: 0 }}>
            <div style={{
              fontSize: "1.75rem",
              fontWeight: 900,
              background: "linear-gradient(135deg, #22d3ee, #818cf8)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>
              {proofs.filter((p) => p.status === "Assessed").length}
            </div>
            <div style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", color: "#94a3b8" }}>
              Assessed
            </div>
          </div>

          <div className="career-card" style={{ padding: "1.25rem", textAlign: "center", marginBottom: 0 }}>
            <div style={{
              fontSize: "1.75rem",
              fontWeight: 900,
              background: "linear-gradient(135deg, #fbbf24, #f59e0b)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>
              {proofs.filter((p) => p.status === "Practicing").length}
            </div>
            <div style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", color: "#94a3b8" }}>
              Practicing
            </div>
          </div>

          <div className="career-card" style={{ padding: "1.25rem", textAlign: "center", marginBottom: 0 }}>
            <div style={{
              fontSize: "1.75rem",
              fontWeight: 900,
              background: "linear-gradient(135deg, #a78bfa, #6366f1)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>
              {proofs.length}
            </div>
            <div style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", color: "#94a3b8" }}>
              Total Tracked
            </div>
          </div>
        </div>

        {/* Passport Table */}
        <div className="career-card">
          <div className="career-card-header">
            <h3 className="career-card-title">
              <ShieldCheck size={18} color="#a78bfa" />
              Skill Passport Matrix
            </h3>
            <span style={{ fontSize: "0.775rem", color: "#64748b" }}>
              Evidence-Backed Competency Records
            </span>
          </div>

          {loading ? (
            <div style={{ textAlign: "center", padding: "3rem", color: "#94a3b8" }}>
              <div className="career-spinner" style={{ margin: "0 auto 1rem" }} />
              Loading verifiable skills...
            </div>
          ) : proofs.length === 0 ? (
            <div style={{ textAlign: "center", padding: "3rem", color: "#64748b" }}>
              No skills registered in passport yet. Click above to submit verification evidence.
            </div>
          ) : (
            <table className="career-table">
              <thead>
                <tr>
                  <th>Skill</th>
                  <th>Category</th>
                  <th>Verification Status</th>
                  <th>Proof Source</th>
                  <th>Evidence Details</th>
                </tr>
              </thead>
              <tbody>
                {proofs.map((p) => (
                  <tr key={p._id}>
                    <td>
                      <strong style={{ color: "#f1f5f9" }}>{p.skillName}</strong>
                    </td>
                    <td style={{ color: "#94a3b8" }}>{p.category}</td>
                    <td>
                      <span
                        className={
                          p.status === "Verified"
                            ? "passport-badge-verified"
                            : p.status === "Assessed"
                            ? "passport-badge-assessed"
                            : p.status === "Practicing"
                            ? "passport-badge-practicing"
                            : "passport-badge-unverified"
                        }
                      >
                        {p.status === "Verified" && <CheckCircle2 size={13} />}
                        {p.status}
                      </span>
                    </td>
                    <td style={{ textTransform: "capitalize", color: "#94a3b8" }}>
                      {p.proofType ? p.proofType.replace("_", " ") : "None"}
                    </td>
                    <td style={{ fontSize: "0.8rem", color: "#94a3b8" }}>
                      {p.evidence?.description || "Awaiting submission"}
                      {p.evidence?.link && (
                        <a
                          href={p.evidence.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ marginLeft: 6, color: "#a78bfa" }}
                        >
                          <ExternalLink size={12} style={{ display: "inline" }} />
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Verification Modal */}
        {showVerifyModal && (
          <div className="celebration-overlay" onClick={() => setShowVerifyModal(false)}>
            <div className="celebration-modal" style={{ maxWidth: 500, textAlign: "left" }} onClick={(e) => e.stopPropagation()}>
              <h3 style={{ margin: "0 0 0.5rem" }}>Submit Skill Verification</h3>
              <p style={{ fontSize: "0.85rem", marginBottom: "1.25rem" }}>
                Provide demonstrable evidence (e.g. GitHub repo link or live app) to verify your skill.
              </p>

              <form onSubmit={handleVerify}>
                <div style={{ marginBottom: "1rem" }}>
                  <label style={{ display: "block", fontSize: "0.825rem", fontWeight: 600, color: "#cbd5e1", marginBottom: 6 }}>
                    Skill Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Docker, React, MongoDB"
                    value={targetSkill}
                    onChange={(e) => setTargetSkill(e.target.value)}
                  />
                </div>

                <div style={{ marginBottom: "1rem" }}>
                  <label style={{ display: "block", fontSize: "0.825rem", fontWeight: 600, color: "#cbd5e1", marginBottom: 6 }}>
                    Evidence Artifact URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://github.com/username/project"
                    value={evidenceLink}
                    onChange={(e) => setEvidenceLink(e.target.value)}
                  />
                </div>

                <div style={{ marginBottom: "1.5rem" }}>
                  <label style={{ display: "block", fontSize: "0.825rem", fontWeight: 600, color: "#cbd5e1", marginBottom: 6 }}>
                    Demonstrated Competency Note
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Briefly describe what you implemented using this skill..."
                    value={evidenceDesc}
                    onChange={(e) => setEvidenceDesc(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "0.65rem 0.85rem",
                      borderRadius: "10px",
                      border: "1px solid rgba(148, 163, 184, 0.15)",
                      background: "rgba(15, 23, 42, 0.8)",
                      color: "#e2e8f0",
                      fontSize: "0.875rem",
                      boxSizing: "border-box",
                      resize: "vertical",
                    }}
                  />
                </div>

                <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
                  <button
                    type="button"
                    className="career-btn-secondary"
                    onClick={() => setShowVerifyModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="career-btn-primary"
                    disabled={isVerifying}
                  >
                    {isVerifying ? "Verifying..." : "Verify & Issue Badge"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SkillPassport;
