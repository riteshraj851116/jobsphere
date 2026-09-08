import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Radar, Sparkles, TrendingUp, CheckCircle, Clock, 
  ExternalLink, ArrowRight, ShieldCheck, Filter 
} from "lucide-react";
import CareerSubNav from "../../components/career/CareerSubNav";
import AIExplanationBanner from "../../components/career/AIExplanationBanner";
import { getOpportunityRadar } from "../../services/careerService";
import "./career.css";

export default function OpportunityRadar() {
  const [data, setData] = useState({
    highMatch: [],
    newOpportunities: [],
    skillGrowth: [],
    recommended: []
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    fetchRadar();
  }, []);

  const fetchRadar = async () => {
    setLoading(true);
    try {
      const res = await getOpportunityRadar();
      if (res.success && res.data) {
        setData(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const renderJobCard = (job, categoryLabel) => {
    const match = job.matchScore || 80;
    return (
      <div key={job._id || job.id} className="career-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem", marginBottom: "0.75rem" }}>
            <div>
              <span className="career-badge-verified" style={{ fontSize: "0.75rem", marginBottom: "0.4rem", display: "inline-block" }}>
                {categoryLabel}
              </span>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0, color: "#f1f5f9" }}>
                {job.title}
              </h3>
              <p style={{ fontSize: "0.85rem", color: "#94a3b8", margin: "0.2rem 0 0" }}>
                {job.company?.name || job.company || "Leading Employer"} &bull; {job.location || "Remote"}
              </p>
            </div>
            <div className="career-score-pill" style={{ fontSize: "0.9rem" }}>
              {match}% Match
            </div>
          </div>

          <p style={{ fontSize: "0.875rem", color: "#94a3b8", margin: "0.5rem 0 1rem", lineHeight: 1.5 }}>
            {job.description ? job.description.substring(0, 140) + "..." : "High alignment with your target career profile."}
          </p>

          {job.skills && job.skills.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem", marginBottom: "1rem" }}>
              {job.skills.slice(0, 5).map((sk, idx) => (
                <span key={idx} className="career-badge-assessed" style={{ fontSize: "0.75rem" }}>
                  {typeof sk === "string" ? sk : sk.name}
                </span>
              ))}
            </div>
          )}

          {job.reason && (
            <div style={{ marginBottom: "1rem" }}>
              <AIExplanationBanner 
                title="Why Recommended For You" 
                text={job.reason} 
              />
            </div>
          )}
        </div>

        <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem", borderTop: "1px solid rgba(148, 163, 184, 0.1)", paddingTop: "0.75rem" }}>
          <Link 
            to={`/jobs/${job._id || job.id}`} 
            className="career-btn-secondary" 
            style={{ flex: 1, textAlign: "center", justifyContent: "center", fontSize: "0.85rem" }}
          >
            Details
          </Link>
          <Link 
            to={`/jobs/${job._id || job.id}`} 
            className="career-btn-primary" 
            style={{ flex: 1, textAlign: "center", justifyContent: "center", fontSize: "0.85rem" }}
          >
            Apply Now
          </Link>
        </div>
      </div>
    );
  };

  const highMatchJobs = data.highMatch || [];
  const newJobs = data.newOpportunities || [];
  const growthJobs = data.skillGrowth || [];
  const recommendedJobs = data.recommended || [];

  const allCount = highMatchJobs.length + newJobs.length + growthJobs.length + recommendedJobs.length;

  return (
    <div className="career-container">
      <div className="career-content-limit">
        <CareerSubNav />

        <div className="career-header">
          <div className="career-badge">
            <Radar size={13} />
            <span>Opportunity Radar</span>
          </div>
          <h1 className="career-title" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            Opportunity Radar
          </h1>
          <p className="career-subtitle">
            Algorithmic role matching partitioned by strategic intent: high matches, growth roles, and fresh market postings grounded in your career profile.
          </p>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
          <button 
            className={activeTab === "all" ? "career-btn-primary" : "career-btn-secondary"}
            onClick={() => setActiveTab("all")}
            style={{ fontSize: "0.85rem" }}
          >
            All Opportunities ({allCount})
          </button>
          <button 
            className={activeTab === "highMatch" ? "career-btn-primary" : "career-btn-secondary"}
            onClick={() => setActiveTab("highMatch")}
            style={{ fontSize: "0.85rem" }}
          >
            <CheckCircle size={14} /> High Match ({highMatchJobs.length})
          </button>
          <button 
            className={activeTab === "growth" ? "career-btn-primary" : "career-btn-secondary"}
            onClick={() => setActiveTab("growth")}
            style={{ fontSize: "0.85rem" }}
          >
            <TrendingUp size={14} /> Career Growth ({growthJobs.length})
          </button>
          <button 
            className={activeTab === "new" ? "career-btn-primary" : "career-btn-secondary"}
            onClick={() => setActiveTab("new")}
            style={{ fontSize: "0.85rem" }}
          >
            <Clock size={14} /> New Market Openings ({newJobs.length})
          </button>
          <button 
            className={activeTab === "recommended" ? "career-btn-primary" : "career-btn-secondary"}
            onClick={() => setActiveTab("recommended")}
            style={{ fontSize: "0.85rem" }}
          >
            <Sparkles size={14} /> AI Recommended ({recommendedJobs.length})
          </button>
        </div>

        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "4rem 0" }}>
            <div className="career-spinner" />
            <p style={{ marginTop: "1rem", color: "#94a3b8" }}>Scanning matching opportunities across the platform...</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
            {(activeTab === "all" || activeTab === "highMatch") && highMatchJobs.length > 0 && (
              <div>
                <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem", color: "#f1f5f9" }}>
                  <CheckCircle size={20} color="#34d399" /> High Match Roles (85%+ Alignment)
                </h2>
                <div className="career-grid-3">
                  {highMatchJobs.map(job => renderJobCard(job, "High Match"))}
                </div>
              </div>
            )}

            {(activeTab === "all" || activeTab === "growth") && growthJobs.length > 0 && (
              <div>
                <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem", color: "#f1f5f9" }}>
                  <TrendingUp size={20} color="#a78bfa" /> Career Growth & Upskilling Roles
                </h2>
                <div className="career-grid-3">
                  {growthJobs.map(job => renderJobCard(job, "Career Growth"))}
                </div>
              </div>
            )}

            {(activeTab === "all" || activeTab === "new") && newJobs.length > 0 && (
              <div>
                <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem", color: "#f1f5f9" }}>
                  <Clock size={20} color="#22d3ee" /> New Opportunities
                </h2>
                <div className="career-grid-3">
                  {newJobs.map(job => renderJobCard(job, "New Role"))}
                </div>
              </div>
            )}

            {(activeTab === "all" || activeTab === "recommended") && recommendedJobs.length > 0 && (
              <div>
                <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem", color: "#f1f5f9" }}>
                  <Sparkles size={20} color="#fbbf24" /> Personalized Recommendations
                </h2>
                <div className="career-grid-3">
                  {recommendedJobs.map(job => renderJobCard(job, "AI Recommended"))}
                </div>
              </div>
            )}

            {allCount === 0 && (
              <div className="career-card" style={{ textAlign: "center", padding: "3rem 1rem" }}>
                <Radar size={40} style={{ margin: "0 auto 1rem", opacity: 0.4, color: "#64748b" }} />
                <h3 style={{ fontSize: "1.1rem", fontWeight: 600, color: "#f1f5f9" }}>No Opportunities Found</h3>
                <p style={{ color: "#94a3b8", fontSize: "0.9rem", maxWidth: "400px", margin: "0.5rem auto 1.5rem" }}>
                  Expand your skills or update your target role in Career Digital Twin to widen your opportunity radar.
                </p>
                <Link to="/career" className="career-btn-primary">
                  Update Career Twin
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
