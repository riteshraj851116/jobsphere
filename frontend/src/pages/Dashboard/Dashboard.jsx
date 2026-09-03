import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import {
  getDashboardAnalytics,
  getRecommendedJobs,
  exportUserData
} from "../../services/careerService";
import {
  Briefcase,
  Bookmark,
  CheckCircle,
  Clock,
  Search,
  GraduationCap,
  FileSearch,
  Map,
  TrendingUp,
  Bell,
  Sparkles,
  Download,
  AlertCircle,
  Calendar,
  Layers,
  ArrowRight,
  ShieldCheck
} from "lucide-react";
import DataFlow from "../../components/three/DataFlow";
import "./Dashboard.css";

const Dashboard = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      try {
        setLoading(true);
        const [analyticsData, recData] = await Promise.allSettled([
          getDashboardAnalytics(),
          getRecommendedJobs()
        ]);

        if (isMounted) {
          if (analyticsData.status === "fulfilled") {
            setAnalytics(analyticsData.value);
          }
          if (recData.status === "fulfilled") {
            setRecommendedJobs(recData.value?.recommendedJobs || []);
          }
        }
      } catch (err) {
        console.error("Dashboard Load Error:", err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleExport = async () => {
    try {
      setExporting(true);
      const data = await exportUserData();
      const blob = new Blob([data], { type: "application/json" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `jobsphere-career-data-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Export Error:", err);
      alert("Failed to export career data.");
    } finally {
      setExporting(false);
    }
  };

  const profile = analytics?.profileStrength || { score: 70, missingSections: [] };
  const appStats = analytics?.applicationStats || { total: 0, applied: 0, underReview: 0, interviews: 0, offers: 0 };
  const interviewStats = analytics?.interviewStats || { totalSessions: 0, completedSessions: 0, questionsAttempted: 0 };
  const roadmap = analytics?.roadmapProgress;
  const reminders = analytics?.upcomingReminders || [];
  const activity = analytics?.activityTimeline || [];

  return (
    <div className="dashboard-page">
      <div className="container dashboard-container" style={{ maxWidth: "1280px" }}>
        {/* ========================================================
            SIDEBAR NAVIGATION
        ======================================================== */}
        <aside className="dashboard-sidebar">
          <div className="user-profile-card">
            <div className="user-avatar" aria-hidden="true">
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <h4>{user?.name || "User"}</h4>
            <span className="user-email">{user?.email}</span>
          </div>

          <nav className="dashboard-nav" aria-label="Dashboard navigation">
            <Link to="/dashboard" className="dash-nav-item dash-nav-item--active">
              <Briefcase size={17} /> Dashboard
            </Link>
            <Link to="/applications" className="dash-nav-item">
              <CheckCircle size={17} /> Application Tracker
            </Link>
            <Link to="/career-roadmap" className="dash-nav-item">
              <Map size={17} /> AI Career Roadmap
            </Link>
            <Link to="/skill-gap" className="dash-nav-item">
              <Sparkles size={17} /> Skill Gap Analyzer
            </Link>
            <Link to="/interview-practice" className="dash-nav-item">
              <GraduationCap size={17} /> Interview Practice
            </Link>
            <Link to="/interview-practice/bookmarks" className="dash-nav-item">
              <Bookmark size={17} /> Saved Questions
            </Link>
            <Link to="/interview-practice/analytics" className="dash-nav-item">
              <TrendingUp size={17} /> Interview Analytics
            </Link>
            <Link to="/resume-analyzer" className="dash-nav-item">
              <FileSearch size={17} /> AI Resume Analyzer
            </Link>
            <Link to="/job-alerts" className="dash-nav-item">
              <Bell size={17} /> Job Alerts
            </Link>
            <Link to="/saved-jobs" className="dash-nav-item">
              <Bookmark size={17} /> Saved Jobs
            </Link>
            <Link to="/profile" className="dash-nav-item">
              <Clock size={17} /> My Profile
            </Link>
            <Link to="/jobs" className="dash-nav-item dash-nav-item--cta">
              <Search size={17} /> Browse Jobs
            </Link>
          </nav>
        </aside>

        {/* ========================================================
            MAIN DASHBOARD CONTENT
        ======================================================== */}
        <main className="dashboard-main">
          {/* Header */}
          <div className="dashboard-header flex justify-between items-center" style={{ marginBottom: "1.75rem" }}>
            <div>
              <h1 style={{ margin: "0 0 4px", fontSize: "1.75rem", fontWeight: "800" }}>
                Welcome back, {user?.name?.split(" ")[0] || "User"}!
              </h1>
              <p className="text-muted" style={{ margin: 0 }}>
                Here is your complete career intelligence and job search pipeline overview.
              </p>
            </div>

            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <button
                type="button"
                className="btn-session secondary"
                onClick={handleExport}
                disabled={exporting}
                style={{ padding: "6px 12px", fontSize: "0.8125rem" }}
              >
                <Download size={15} />
                <span>{exporting ? "Exporting..." : "Export Career Data"}</span>
              </button>
            </div>
          </div>

          {/* 1. TOP STATS GRID */}
          <div className="stats-grid" style={{ marginBottom: "2rem" }}>
            <div className="stat-card stat-card--blue">
              <div className="stat-icon">
                <Briefcase size={22} />
              </div>
              <div className="stat-body">
                <span className="stat-value">{loading ? "—" : appStats.total}</span>
                <span className="stat-label">Applications Sent</span>
              </div>
            </div>

            <div className="stat-card stat-card--orange">
              <div className="stat-icon">
                <Bookmark size={22} />
              </div>
              <div className="stat-body">
                <span className="stat-value">{loading ? "—" : analytics?.savedJobsCount || 0}</span>
                <span className="stat-label">Saved Jobs</span>
              </div>
            </div>

            <div className="stat-card stat-card--green">
              <div className="stat-icon">
                <FileSearch size={22} />
              </div>
              <div className="stat-body">
                <span className="stat-value">
                  {loading ? "—" : analytics?.latestAtsScore ? `${analytics.latestAtsScore}%` : "Not Scanned"}
                </span>
                <span className="stat-label">Latest ATS Score</span>
              </div>
            </div>

            <div className="stat-card stat-card--blue">
              <div className="stat-icon">
                <GraduationCap size={22} />
              </div>
              <div className="stat-body">
                <span className="stat-value">{loading ? "—" : interviewStats.completedSessions}</span>
                <span className="stat-label">Interview Sessions</span>
              </div>
            </div>
          </div>

          {/* 2. PROFILE STRENGTH & ROADMAP WIDGET */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "16px", marginBottom: "2rem" }}>
            {/* Profile Strength Card */}
            <div style={{ background: "#ffffff", padding: "1.5rem", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <ShieldCheck size={20} color="#2563eb" />
                  <h3 style={{ margin: 0, fontSize: "1.0625rem", fontWeight: "700" }}>Profile Strength</h3>
                </div>
                <span style={{ fontSize: "1.25rem", fontWeight: "800", color: "#2563eb" }}>
                  {profile.score}%
                </span>
              </div>

              <div style={{ height: "8px", background: "#f1f5f9", borderRadius: "9999px", overflow: "hidden", marginBottom: "1rem" }}>
                <div style={{ height: "100%", width: `${profile.score}%`, background: profile.score >= 80 ? "#16a34a" : "#2563eb" }} />
              </div>

              {profile.missingSections?.length > 0 ? (
                <div>
                  <div style={{ fontSize: "0.8125rem", color: "#64748b", marginBottom: "6px" }}>
                    Complete these items to boost recruiter visibility:
                  </div>
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                    {profile.missingSections.slice(0, 3).map((sec, idx) => (
                      <Link key={idx} to="/profile" style={{ fontSize: "0.75rem", background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", padding: "3px 8px", borderRadius: "6px", textDecoration: "none" }}>
                        + Add {sec}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <div style={{ fontSize: "0.8125rem", color: "#16a34a", fontWeight: "600" }}>
                  ✓ Outstanding! Your profile is 100% complete and optimized for recruiters.
                </div>
              )}
            </div>

            {/* Career Roadmap Progress */}
            <div style={{ background: "#ffffff", padding: "1.5rem", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Map size={20} color="#9333ea" />
                  <h3 style={{ margin: 0, fontSize: "1.0625rem", fontWeight: "700" }}>Career Roadmap</h3>
                </div>
                <Link to="/career-roadmap" style={{ fontSize: "0.8125rem", color: "#2563eb", fontWeight: "600", textDecoration: "none" }}>
                  View →
                </Link>
              </div>

              {roadmap ? (
                <div>
                  <div style={{ fontSize: "0.9375rem", fontWeight: "700", color: "#0f172a", marginBottom: "4px" }}>
                    {roadmap.targetRole}
                  </div>
                  <div style={{ fontSize: "0.8125rem", color: "#64748b", marginBottom: "8px" }}>
                    {roadmap.completedSkillsCount} of {roadmap.totalSkills} skills mastered ({roadmap.percentage}%)
                  </div>
                  <div style={{ height: "8px", background: "#f1f5f9", borderRadius: "9999px", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${roadmap.percentage}%`, background: "linear-gradient(90deg, #9333ea, #38bdf8)" }} />
                  </div>
                </div>
              ) : (
                <div>
                  <p style={{ fontSize: "0.8125rem", color: "#64748b", margin: "0 0 10px" }}>
                    Select a target engineering role to generate your personalized learning curriculum.
                  </p>
                  <Link to="/career-roadmap" className="btn-session primary" style={{ padding: "4px 10px", fontSize: "0.8125rem" }}>
                    Start Learning Roadmap
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* 3. RECOMMENDED JOBS */}
          <div style={{ background: "#ffffff", padding: "1.5rem", borderRadius: "16px", border: "1px solid #e2e8f0", marginBottom: "2rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Sparkles size={20} color="#2563eb" />
                <h3 style={{ margin: 0, fontSize: "1.125rem", fontWeight: "700" }}>
                  Recommended For You ({recommendedJobs.length})
                </h3>
              </div>
              <Link to="/jobs" style={{ fontSize: "0.8125rem", color: "#2563eb", fontWeight: "600", textDecoration: "none" }}>
                Browse all jobs →
              </Link>
            </div>

            {recommendedJobs.length > 0 ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "12px" }}>
                {recommendedJobs.slice(0, 4).map((j) => (
                  <div key={j._id} style={{ background: "#f8fafc", padding: "1rem", borderRadius: "12px", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
                        <h4 style={{ margin: 0, fontSize: "0.9375rem", fontWeight: "700" }}>
                          <Link to={`/jobs/${j._id}`} style={{ color: "#0f172a", textDecoration: "none" }}>
                            {j.title}
                          </Link>
                        </h4>
                        <span style={{ fontSize: "0.75rem", fontWeight: "800", background: "#eff6ff", color: "#2563eb", padding: "2px 6px", borderRadius: "6px" }}>
                          {j.matchScore}% Match
                        </span>
                      </div>
                      <div style={{ fontSize: "0.8125rem", color: "#64748b", marginBottom: "6px" }}>
                        {j.company?.name || "Company"} &bull; {j.location || "Remote"}
                      </div>
                      <p style={{ margin: "0 0 8px", fontSize: "0.75rem", color: "#334155", fontStyle: "italic" }}>
                        {j.recommendationReason}
                      </p>
                    </div>

                    <Link to={`/jobs/${j._id}`} style={{ fontSize: "0.8125rem", color: "#2563eb", fontWeight: "700", display: "flex", alignItems: "center", gap: "4px", textDecoration: "none" }}>
                      <span>View & Apply</span>
                      <ArrowRight size={13} />
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: "#94a3b8", fontSize: "0.875rem", margin: 0 }}>
                No personalized recommendations generated yet. Add skills to your profile to unlock recommendations.
              </p>
            )}
          </div>

          {/* 4. UPCOMING REMINDERS & RECENT ACTIVITY */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "16px" }}>
            {/* Reminders */}
            <div style={{ background: "#ffffff", padding: "1.5rem", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "1rem" }}>
                <Clock size={18} color="#d97706" />
                <h3 style={{ margin: 0, fontSize: "1.0625rem", fontWeight: "700" }}>Upcoming Reminders</h3>
              </div>

              {reminders.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {reminders.map((r, idx) => (
                    <div key={idx} style={{ background: "#f8fafc", padding: "8px 12px", borderRadius: "10px", fontSize: "0.8125rem", borderLeft: "3px solid #d97706" }}>
                      <div style={{ fontWeight: "700", color: "#0f172a" }}>{r.title}</div>
                      <div style={{ color: "#64748b", fontSize: "0.75rem" }}>
                        {r.jobTitle} &bull; Due: {new Date(r.dueDate).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: "#94a3b8", fontSize: "0.8125rem", margin: 0 }}>
                  No pending reminders. Set follow-up tasks directly from your Application Tracker.
                </p>
              )}
            </div>

            {/* Recent Activity Timeline */}
            <div style={{ background: "#ffffff", padding: "1.5rem", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "1rem" }}>
                <Layers size={18} color="#2563eb" />
                <h3 style={{ margin: 0, fontSize: "1.0625rem", fontWeight: "700" }}>Recent Activity Timeline</h3>
              </div>

              {activity.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {activity.map((item, idx) => (
                    <div key={idx} style={{ background: "#f8fafc", padding: "8px 12px", borderRadius: "10px", fontSize: "0.8125rem" }}>
                      <div style={{ color: "#0f172a", fontWeight: "600" }}>{item.title}</div>
                      <div style={{ color: "#94a3b8", fontSize: "0.6875rem" }}>
                        {new Date(item.date).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: "#94a3b8", fontSize: "0.8125rem", margin: 0 }}>
                  No recent activity logged yet.
                </p>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
