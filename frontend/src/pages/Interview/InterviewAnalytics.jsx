import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  TrendingUp,
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  ArrowRight,
  Layers,
  Loader2,
  GraduationCap
} from "lucide-react";
import { getInterviewAnalytics } from "../../services/careerService";
import Loader from "../../components/common/Loader.jsx";
import "./Interview.css";

const InterviewAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await getInterviewAnalytics();
        if (isMounted) {
          setAnalytics(data);
        }
      } catch (err) {
        console.error("Failed to load interview analytics:", err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchStats();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return <Loader fullscreen text="Aggregating Interview Performance Metrics..." />;
  }

  const categoryPerformance = analytics?.categoryPerformance || {};

  return (
    <div className="interview-page">
      <div className="interview-container">
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <h1 className="interview-title" style={{ textAlign: "left", marginBottom: "0.25rem" }}>
              Interview Performance Analytics
            </h1>
            <p style={{ color: "#71717a", fontSize: "0.9375rem" }}>
              Track question attempt volume, accuracy rates by technology, and identify areas to reinforce.
            </p>
          </div>

          <Link to="/interview-practice" className="btn-session primary">
            <GraduationCap size={16} />
            <span>Practice Interviews</span>
          </Link>
        </div>

        {/* 4 Stat Cards */}
        <div className="analytics-stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "2rem" }}>
          <div className="interview-card" style={{ margin: 0, padding: "1.25rem", textAlign: "center" }}>
            <div style={{ fontSize: "2rem", fontWeight: "800", color: "#000000" }}>
              {analytics?.totalSessions || 0}
            </div>
            <div style={{ fontSize: "0.875rem", color: "#666666", fontWeight: "600", marginTop: "4px" }}>
              Total Sessions Completed
            </div>
          </div>

          <div className="interview-card" style={{ margin: 0, padding: "1.25rem", textAlign: "center" }}>
            <div style={{ fontSize: "2rem", fontWeight: "800", color: "#111111" }}>
              {analytics?.totalAnswered || 0}
            </div>
            <div style={{ fontSize: "0.875rem", color: "#666666", fontWeight: "600", marginTop: "4px" }}>
              Questions Answered
            </div>
          </div>

          <div className="interview-card" style={{ margin: 0, padding: "1.25rem", textAlign: "center" }}>
            <div style={{ fontSize: "2rem", fontWeight: "800", color: "#222222" }}>
              {analytics?.totalSkipped || 0}
            </div>
            <div style={{ fontSize: "0.875rem", color: "#666666", fontWeight: "600", marginTop: "4px" }}>
              Questions Skipped
            </div>
          </div>

          <div className="interview-card" style={{ margin: 0, padding: "1.25rem", textAlign: "center" }}>
            <div style={{ fontSize: "2rem", fontWeight: "800", color: "#111111" }}>
              {analytics?.completionRate || 0}%
            </div>
            <div style={{ fontSize: "0.875rem", color: "#666666", fontWeight: "600", marginTop: "4px" }}>
              Overall Completion Rate
            </div>
          </div>
        </div>

        {/* Strengths & Weaknesses */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "16px", marginBottom: "2rem" }}>
          <div className="interview-card" style={{ margin: 0, padding: "1.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "1rem" }}>
              <CheckCircle2 size={20} color="#111111" />
              <h3 style={{ margin: 0, fontSize: "1.125rem", fontWeight: "700" }}>Strong Areas</h3>
            </div>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {analytics?.strongAreas?.length > 0 ? (
                analytics.strongAreas.map((area, idx) => (
                  <span key={idx} style={{ background: "#FAFAFA", border: "1px solid #DDDDDD", color: "#111111", padding: "6px 12px", borderRadius: "8px", fontWeight: "600", fontSize: "0.875rem" }}>
                    ✓ {area}
                  </span>
                ))
              ) : (
                <p style={{ color: "#888888", fontSize: "0.875rem" }}>
                  Complete more practice sessions to uncover your core strengths.
                </p>
              )}
            </div>
          </div>

          <div className="interview-card" style={{ margin: 0, padding: "1.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "1rem" }}>
              <TrendingUp size={20} color="#000000" />
              <h3 style={{ margin: 0, fontSize: "1.125rem", fontWeight: "700" }}>Areas to Reinforce</h3>
            </div>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {analytics?.areasToImprove?.length > 0 ? (
                analytics.areasToImprove.map((area, idx) => (
                  <span key={idx} style={{ background: "#F5F5F5", border: "1px solid #DDDDDD", color: "#000000", padding: "6px 12px", borderRadius: "8px", fontWeight: "600", fontSize: "0.875rem" }}>
                    ⚡ {area}
                  </span>
                ))
              ) : (
                <p style={{ color: "#888888", fontSize: "0.875rem" }}>
                  No significant weak areas identified yet.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Category Breakdown Table */}
        <div className="interview-card" style={{ margin: 0, padding: "1.5rem" }}>
          <h3 style={{ fontSize: "1.125rem", fontWeight: "700", marginBottom: "1rem" }}>
            Performance by Category
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {Object.keys(categoryPerformance).map((cat) => {
              const data = categoryPerformance[cat];
              const pct = data.questions > 0 ? Math.round((data.answered / data.questions) * 100) : 0;

              return (
                <div key={cat} style={{ background: "#FAFAFA", padding: "12px 16px", borderRadius: "12px", border: "1px solid #DDDDDD" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", fontWeight: "700", fontSize: "0.9375rem" }}>
                    <span>{cat}</span>
                    <span>{pct}% ({data.answered}/{data.questions} answered)</span>
                  </div>
                  <div style={{ height: "8px", background: "#DDDDDD", borderRadius: "9999px", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${pct}%`, background: pct >= 75 ? "#111111" : "#000000", borderRadius: "9999px" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewAnalytics;
