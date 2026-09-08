import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Code2,
  CheckCircle2,
  Flame,
  Award,
  Zap,
  BookOpen,
  Layers,
  ArrowRight,
  Sparkles,
  Clock,
  TrendingUp,
  Target,
} from "lucide-react";
import DsaSubNav from "../../components/dsa/DsaSubNav";
import dsaService from "../../services/dsaService";
import { useAuth } from "../../hooks/useAuth";
import "./dsa.css";

const DsaHome = () => {
  const { user } = useAuth();
  const [progress, setProgress] = useState(null);
  const [dailyChallenge, setDailyChallenge] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [progressRes, dailyRes] = await Promise.all([
          user ? dsaService.getUserProgress().catch(() => null) : null,
          dsaService.getDailyChallenge().catch(() => null),
        ]);

        if (progressRes?.success) {
          setProgress(progressRes.data);
        }
        if (dailyRes?.success) {
          setDailyChallenge(dailyRes.data);
        }
      } catch (err) {
        console.error("Failed to load DSA dashboard:", err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [user]);

  const totalProblems = progress?.totalProblems || 19;
  const solvedCount = progress?.solvedCount || 0;
  const attemptedCount = progress?.attemptedCount || 0;
  const easyCount = progress?.difficultyStats?.easy || 0;
  const mediumCount = progress?.difficultyStats?.medium || 0;
  const hardCount = progress?.difficultyStats?.hard || 0;
  const streak = progress?.streak?.currentStreak || 0;
  const acceptanceRate = progress?.acceptanceRate || 0;

  // Percentage widths for difficulty bar
  const easyPct = totalProblems > 0 ? (easyCount / totalProblems) * 100 : 0;
  const medPct = totalProblems > 0 ? (mediumCount / totalProblems) * 100 : 0;
  const hardPct = totalProblems > 0 ? (hardCount / totalProblems) * 100 : 0;

  return (
    <div className="dsa-container">
      <div className="dsa-content-limit">
        {/* DSA Sub Navigation Bar */}
        <DsaSubNav />

        {/* Hero Section */}
        <div className="dsa-hero">
          {/* Main Stats Card */}
          <div className="dsa-hero-card">
            <div className="dsa-hero-title">
              <Code2 size={28} color="#818cf8" />
              <span>DSA Practice Arena</span>
            </div>

            <p className="dsa-hero-desc">
              Master essential data structures and algorithms, sharpen problem-solving patterns,
              and get personalized real-time guidance from your AI DSA Coach.
            </p>

            {/* Metrics Grid */}
            <div className="dsa-stats-grid">
              <div className="dsa-stat-box">
                <div className="dsa-stat-val" style={{ color: "#10b981" }}>
                  {solvedCount}
                </div>
                <div className="dsa-stat-lbl">Solved</div>
              </div>

              <div className="dsa-stat-box">
                <div className="dsa-stat-val" style={{ color: "#f59e0b" }}>
                  {attemptedCount}
                </div>
                <div className="dsa-stat-lbl">Attempted</div>
              </div>

              <div className="dsa-stat-box">
                <div className="dsa-stat-val" style={{ color: "#ff7849" }}>
                  {streak} 🔥
                </div>
                <div className="dsa-stat-lbl">Day Streak</div>
              </div>

              <div className="dsa-stat-box">
                <div className="dsa-stat-val" style={{ color: "#818cf8" }}>
                  {acceptanceRate}%
                </div>
                <div className="dsa-stat-lbl">Acceptance</div>
              </div>
            </div>

            {/* Difficulty Breakdown Bar */}
            <div className="dsa-difficulty-bar">
              <div className="dsa-diff-seg-easy" style={{ width: `${Math.max(4, easyPct)}%` }} />
              <div className="dsa-diff-seg-medium" style={{ width: `${Math.max(4, medPct)}%` }} />
              <div className="dsa-diff-seg-hard" style={{ width: `${Math.max(4, hardPct)}%` }} />
            </div>

            <div className="dsa-diff-legend">
              <div className="dsa-diff-legend-item">
                <span className="dsa-diff-dot" style={{ background: "var(--dsa-easy)" }} />
                <span>Easy: {easyCount}</span>
              </div>
              <div className="dsa-diff-legend-item">
                <span className="dsa-diff-dot" style={{ background: "var(--dsa-medium)" }} />
                <span>Medium: {mediumCount}</span>
              </div>
              <div className="dsa-diff-legend-item">
                <span className="dsa-diff-dot" style={{ background: "var(--dsa-hard)" }} />
                <span>Hard: {hardCount}</span>
              </div>
            </div>
          </div>

          {/* Daily Challenge Card */}
          <div className="daily-challenge-card">
            <div>
              <div className="daily-badge-ribbon">
                <Zap size={13} />
                <span>Daily Challenge</span>
              </div>

              {dailyChallenge?.problem ? (
                <>
                  <div className="daily-problem-title">
                    {dailyChallenge.problem.title}
                  </div>

                  <div className="daily-meta-row">
                    <span
                      className={
                        dailyChallenge.problem.difficulty === "Easy"
                          ? "dsa-badge-easy"
                          : dailyChallenge.problem.difficulty === "Medium"
                          ? "dsa-badge-medium"
                          : "dsa-badge-hard"
                      }
                    >
                      {dailyChallenge.problem.difficulty}
                    </span>

                    <span style={{ fontSize: "0.8rem", color: "var(--dsa-text-muted)", display: "inline-flex", alignItems: "center", gap: 4 }}>
                      <Clock size={13} /> ~{dailyChallenge.estimatedMinutes || 25} mins
                    </span>

                    {dailyChallenge.isCompleted && (
                      <span style={{ color: "#10b981", fontSize: "0.8rem", display: "inline-flex", alignItems: "center", gap: 4, fontWeight: 600 }}>
                        <CheckCircle2 size={14} /> Solved Today!
                      </span>
                    )}
                  </div>

                  <p style={{ fontSize: "0.85rem", color: "var(--dsa-text-secondary)", lineHeight: 1.5, marginBottom: "1.5rem" }}>
                    Solve today's featured problem to extend your streak and sharpen your algorithmic intuition.
                  </p>
                </>
              ) : (
                <p style={{ color: "var(--dsa-text-secondary)" }}>Loading daily challenge...</p>
              )}
            </div>

            {dailyChallenge?.problem && (
              <Link
                to={`/dsa/problems/${dailyChallenge.problem.slug}`}
                className="daily-action-btn"
              >
                <span>{dailyChallenge.isCompleted ? "Practice Again" : "Solve Challenge"}</span>
                <ArrowRight size={16} />
              </Link>
            )}
          </div>
        </div>

        {/* AI Coach Insights & Recommendations Card */}
        {progress?.aiRecommendation && (
          <div
            className="dsa-hero-card"
            style={{
              marginBottom: "2rem",
              background: "linear-gradient(135deg, #eff6ff 0%, #f5f3ff 100%)",
              border: "1px solid #bfdbfe",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.65rem", marginBottom: "0.5rem" }}>
              <Sparkles size={20} color="var(--dsa-accent)" />
              <h3 style={{ margin: 0, color: "var(--dsa-text-primary)", fontSize: "1.1rem" }}>
                AI DSA Coach Insights
              </h3>
            </div>

            <p style={{ fontSize: "0.9rem", color: "var(--dsa-text-secondary)", lineHeight: 1.6, marginBottom: "1rem" }}>
              {progress.aiRecommendation.message}
            </p>

            <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", flexWrap: "wrap", fontSize: "0.85rem" }}>
              {progress.aiRecommendation.targetTopics?.length > 0 && (
                <div>
                  <span style={{ color: "var(--dsa-text-muted)", marginRight: 8 }}>
                    Recommended Focus:
                  </span>
                  {progress.aiRecommendation.targetTopics.map((t, idx) => (
                    <span key={idx} className="dsa-topic-pill" style={{ color: "var(--dsa-accent)" }}>
                      {t}
                    </span>
                  ))}
                </div>
              )}

              {progress.aiRecommendation.actionItem && (
                <div style={{ color: "var(--dsa-easy)", fontWeight: 600 }}>
                  💡 {progress.aiRecommendation.actionItem}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Quick Hub Navigation Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "1.5rem",
            marginBottom: "2.5rem",
          }}
        >
          {/* DSA Sheet Card */}
          <Link
            to="/dsa/sheet"
            className="dsa-stat-box"
            style={{
              textAlign: "left",
              padding: "1.5rem",
              textDecoration: "none",
              background: "var(--surface, #ffffff)",
              border: "1px solid var(--dsa-border)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
              <div style={{ background: "rgba(37, 99, 235, 0.1)", padding: "0.5rem", borderRadius: "10px" }}>
                <BookOpen size={20} color="var(--dsa-accent)" />
              </div>
              <h3 style={{ margin: 0, color: "var(--dsa-text-primary)", fontSize: "1.1rem" }}>Curated DSA Sheet</h3>
            </div>
            <p style={{ fontSize: "0.85rem", color: "var(--dsa-text-secondary)", lineHeight: 1.5, margin: 0 }}>
              Follow a structured tier-by-tier curriculum: Beginner, Intermediate, and Advanced coding patterns.
            </p>
          </Link>

          {/* Topics Card */}
          <Link
            to="/dsa/topics"
            className="dsa-stat-box"
            style={{
              textAlign: "left",
              padding: "1.5rem",
              textDecoration: "none",
              background: "var(--surface, #ffffff)",
              border: "1px solid var(--dsa-border)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
              <div style={{ background: "rgba(22, 163, 74, 0.1)", padding: "0.5rem", borderRadius: "10px" }}>
                <Layers size={20} color="var(--dsa-easy)" />
              </div>
              <h3 style={{ margin: 0, color: "var(--dsa-text-primary)", fontSize: "1.1rem" }}>19 Topic Categories</h3>
            </div>
            <p style={{ fontSize: "0.85rem", color: "var(--dsa-text-secondary)", lineHeight: 1.5, margin: 0 }}>
              Deep dive into Arrays, Strings, Trees, Dynamic Programming, Graphs, and Heaps.
            </p>
          </Link>

          {/* Browse All Problems Card */}
          <Link
            to="/dsa/problems"
            className="dsa-stat-box"
            style={{
              textAlign: "left",
              padding: "1.5rem",
              textDecoration: "none",
              background: "var(--surface, #ffffff)",
              border: "1px solid var(--dsa-border)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
              <div style={{ background: "rgba(217, 119, 6, 0.1)", padding: "0.5rem", borderRadius: "10px" }}>
                <Target size={20} color="var(--dsa-medium)" />
              </div>
              <h3 style={{ margin: 0, color: "var(--dsa-text-primary)", fontSize: "1.1rem" }}>Problem Catalog</h3>
            </div>
            <p style={{ fontSize: "0.85rem", color: "var(--dsa-text-secondary)", lineHeight: 1.5, margin: 0 }}>
              Search, filter by difficulty and status, view acceptance rates, and bookmark problems.
            </p>
          </Link>
        </div>

        {/* Recent Submissions Activity */}
        {progress?.recentSubmissions?.length > 0 && (
          <div className="dsa-table-card">
            <div style={{ padding: "1.25rem", borderBottom: "1px solid var(--dsa-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0, color: "var(--dsa-text-primary)", fontSize: "1rem" }}>Recent Submissions</h3>
              <Link to="/dsa/problems" style={{ fontSize: "0.8rem", color: "var(--dsa-accent)", textDecoration: "none" }}>
                View All Problems &rarr;
              </Link>
            </div>

            <table className="dsa-table">
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Problem</th>
                  <th>Difficulty</th>
                  <th>Language</th>
                  <th>Runtime</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {progress.recentSubmissions.slice(0, 5).map((sub) => (
                  <tr key={sub._id}>
                    <td>
                      {sub.status === "Accepted" ? (
                        <span style={{ color: "#10b981", display: "inline-flex", alignItems: "center", gap: 4, fontWeight: 600 }}>
                          <CheckCircle2 size={14} /> Accepted
                        </span>
                      ) : (
                        <span style={{ color: "#ef4444", fontWeight: 600 }}>{sub.status}</span>
                      )}
                    </td>
                    <td>
                      {sub.problem ? (
                        <Link to={`/dsa/problems/${sub.problem.slug}`} className="dsa-problem-link">
                          {sub.problem.title}
                        </Link>
                      ) : (
                        "Problem"
                      )}
                    </td>
                    <td>
                      {sub.problem?.difficulty && (
                        <span
                          className={
                            sub.problem.difficulty === "Easy"
                              ? "dsa-badge-easy"
                              : sub.problem.difficulty === "Medium"
                              ? "dsa-badge-medium"
                              : "dsa-badge-hard"
                          }
                        >
                          {sub.problem.difficulty}
                        </span>
                      )}
                    </td>
                    <td style={{ textTransform: "capitalize" }}>{sub.language}</td>
                    <td>{sub.runtime || 0} ms</td>
                    <td style={{ color: "var(--dsa-text-muted)" }}>
                      {new Date(sub.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DsaHome;
