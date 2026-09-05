import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getMyApplications } from "../../services/applicationService";
import {
  updateApplicationStage,
  addApplicationNote,
  addApplicationReminder,
  toggleApplicationReminder
} from "../../services/careerService";
import Loader from "../../components/common/Loader";
import {
  Briefcase,
  MapPin,
  ExternalLink,
  Calendar,
  Search,
  LayoutGrid,
  List,
  StickyNote,
  Bell,
  Clock,
  CheckCircle2,
  PlusCircle,
  X
} from "lucide-react";
import "./Applications.css";

const KANBAN_STAGES = [
  "Applied",
  "Under Review",
  "Interview",
  "Technical Round",
  "Offer",
  "Rejected"
];

const STATUS_COLORS = {
  applied: "badge-info",
  reviewing: "badge-warning",
  "under review": "badge-warning",
  shortlisted: "badge-primary",
  interview: "badge-info",
  "technical round": "badge-primary",
  hired: "badge-success",
  offer: "badge-success",
  rejected: "badge-danger"
};

const Applications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState("kanban"); // "list" | "kanban"
  const [searchQuery, setSearchQuery] = useState("");

  // Modals
  const [activeTimelineApp, setActiveTimelineApp] = useState(null);
  const [activeNoteApp, setActiveNoteApp] = useState(null);
  const [newNoteText, setNewNoteText] = useState("");

  const [activeReminderApp, setActiveReminderApp] = useState(null);
  const [reminderTitle, setReminderTitle] = useState("");
  const [reminderDate, setReminderDate] = useState("");

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getMyApplications();
      setApplications(res.data?.applications || []);
    } catch (err) {
      setError("Failed to load applications. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleStageChange = async (appId, newStage) => {
    try {
      await updateApplicationStage(appId, newStage);
      setApplications((prev) =>
        prev.map((app) =>
          app._id === appId ? { ...app, stage: newStage } : app
        )
      );
    } catch (err) {
      console.error("Failed to update application stage:", err);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!activeNoteApp || !newNoteText.trim()) return;

    try {
      const res = await addApplicationNote(activeNoteApp._id, newNoteText.trim());
      setApplications((prev) =>
        prev.map((app) =>
          app._id === activeNoteApp._id
            ? { ...app, candidateNotes: res }
            : app
        )
      );
      setNewNoteText("");
      setActiveNoteApp(null);
    } catch (err) {
      console.error("Failed to add note:", err);
    }
  };

  const handleAddReminder = async (e) => {
    e.preventDefault();
    if (!activeReminderApp || !reminderTitle.trim() || !reminderDate) return;

    try {
      const res = await addApplicationReminder(activeReminderApp._id, reminderTitle.trim(), reminderDate);
      setApplications((prev) =>
        prev.map((app) =>
          app._id === activeReminderApp._id
            ? { ...app, reminders: res }
            : app
        )
      );
      setReminderTitle("");
      setReminderDate("");
      setActiveReminderApp(null);
    } catch (err) {
      console.error("Failed to set reminder:", err);
    }
  };

  const handleToggleReminder = async (appId, reminderId) => {
    try {
      const res = await toggleApplicationReminder(appId, reminderId);
      setApplications((prev) =>
        prev.map((app) =>
          app._id === appId ? { ...app, reminders: res } : app
        )
      );
    } catch (err) {
      console.error("Failed to toggle reminder:", err);
    }
  };

  const filteredApps = applications.filter((app) => {
    const title = app.job?.title?.toLowerCase() || "";
    const company = app.company?.name?.toLowerCase() || "";
    const q = searchQuery.toLowerCase();
    return title.includes(q) || company.includes(q);
  });

  const getStatusBadge = (status) => {
    const key = status?.toLowerCase() || "applied";
    const cls = STATUS_COLORS[key] || "badge-info";
    return <span className={`status-badge ${cls}`}>{status || "Applied"}</span>;
  };

  // KPIs
  const totalCount = applications.length;
  const activeCount = applications.filter(
    (a) => !["Rejected", "Hired", "Offer"].includes(a.stage || a.status)
  ).length;
  const interviewsCount = applications.filter((a) =>
    ["Interview", "Technical Round"].includes(a.stage || a.status)
  ).length;
  const offersCount = applications.filter((a) =>
    ["Offer", "Hired"].includes(a.stage || a.status)
  ).length;

  if (loading) return <Loader />;

  return (
    <div className="candidate-applications-page">
      <div className="container apps-container" style={{ maxWidth: "1280px" }}>
        {/* Header */}
        <div className="apps-header" style={{ marginBottom: "1.5rem" }}>
          <div>
            <h1 style={{ fontSize: "2rem", fontWeight: "800", margin: "0 0 4px" }}>
              Application Tracker
            </h1>
            <p className="text-muted" style={{ margin: 0 }}>
              Track stages, take interview notes, set follow-up reminders, and manage your pipeline.
            </p>
          </div>

          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <div style={{ display: "flex", background: "#f1f5f9", padding: "4px", borderRadius: "10px" }}>
              <button
                type="button"
                className={`view-toggle-btn ${viewMode === "kanban" ? "active" : ""}`}
                onClick={() => setViewMode("kanban")}
                style={{
                  padding: "6px 12px",
                  borderRadius: "8px",
                  border: "none",
                  background: viewMode === "kanban" ? "#ffffff" : "transparent",
                  fontWeight: "600",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  boxShadow: viewMode === "kanban" ? "0 2px 6px rgba(0,0,0,0.08)" : "none"
                }}
              >
                <LayoutGrid size={15} />
                <span>Kanban</span>
              </button>

              <button
                type="button"
                className={`view-toggle-btn ${viewMode === "list" ? "active" : ""}`}
                onClick={() => setViewMode("list")}
                style={{
                  padding: "6px 12px",
                  borderRadius: "8px",
                  border: "none",
                  background: viewMode === "list" ? "#ffffff" : "transparent",
                  fontWeight: "600",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  boxShadow: viewMode === "list" ? "0 2px 6px rgba(0,0,0,0.08)" : "none"
                }}
              >
                <List size={15} />
                <span>List</span>
              </button>
            </div>

            <Link to="/jobs" className="btn btn--outline btn--md">
              <Search size={16} /> Find Jobs
            </Link>
          </div>
        </div>

        {/* Dashboard KPI Summary Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "14px", marginBottom: "2rem" }}>
          <div style={{ background: "#ffffff", padding: "1.25rem", borderRadius: "14px", border: "1px solid #e2e8f0", textAlign: "center" }}>
            <div style={{ fontSize: "1.75rem", fontWeight: "800", color: "#2563eb" }}>{totalCount}</div>
            <div style={{ fontSize: "0.8125rem", color: "#64748b", fontWeight: "600" }}>Total Applications</div>
          </div>

          <div style={{ background: "#ffffff", padding: "1.25rem", borderRadius: "14px", border: "1px solid #e2e8f0", textAlign: "center" }}>
            <div style={{ fontSize: "1.75rem", fontWeight: "800", color: "#d97706" }}>{activeCount}</div>
            <div style={{ fontSize: "0.8125rem", color: "#64748b", fontWeight: "600" }}>Active Pipeline</div>
          </div>

          <div style={{ background: "#ffffff", padding: "1.25rem", borderRadius: "14px", border: "1px solid #e2e8f0", textAlign: "center" }}>
            <div style={{ fontSize: "1.75rem", fontWeight: "800", color: "#9333ea" }}>{interviewsCount}</div>
            <div style={{ fontSize: "0.8125rem", color: "#64748b", fontWeight: "600" }}>Interviews Scheduled</div>
          </div>

          <div style={{ background: "#ffffff", padding: "1.25rem", borderRadius: "14px", border: "1px solid #e2e8f0", textAlign: "center" }}>
            <div style={{ fontSize: "1.75rem", fontWeight: "800", color: "#16a34a" }}>{offersCount}</div>
            <div style={{ fontSize: "0.8125rem", color: "#64748b", fontWeight: "600" }}>Offers Received</div>
          </div>
        </div>

        {/* Search Bar */}
        <div style={{ marginBottom: "1.5rem" }}>
          <input
            type="text"
            className="form-input"
            placeholder="Search your applications by role or company..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ maxWidth: "400px" }}
          />
        </div>

        {error && <div className="apps-error" role="alert">{error}</div>}

        {/* ========================================================
            VIEW MODE: KANBAN BOARD
        ======================================================== */}
        {viewMode === "kanban" ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${KANBAN_STAGES.length}, minmax(240px, 1fr))`,
              gap: "14px",
              overflowX: "auto",
              paddingBottom: "2rem"
            }}
          >
            {KANBAN_STAGES.map((stage) => {
              const stageApps = filteredApps.filter(
                (a) => (a.stage || a.status || "Applied") === stage
              );

              return (
                <div
                  key={stage}
                  style={{
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderRadius: "14px",
                    padding: "1rem",
                    display: "flex",
                    flexDirection: "column",
                    minHeight: "450px"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", paddingBottom: "0.5rem", borderBottom: "2px solid #e2e8f0" }}>
                    <h3 style={{ fontSize: "0.9375rem", fontWeight: "700", margin: 0, color: "#1e293b" }}>
                      {stage}
                    </h3>
                    <span style={{ fontSize: "0.75rem", background: "#e2e8f0", padding: "2px 8px", borderRadius: "9999px", fontWeight: "700" }}>
                      {stageApps.length}
                    </span>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", flex: 1 }}>
                    {stageApps.map((app) => (
                      <div
                        key={app._id}
                        style={{
                          background: "#ffffff",
                          border: "1px solid #e2e8f0",
                          borderRadius: "12px",
                          padding: "1rem",
                          boxShadow: "0 2px 6px rgba(0,0,0,0.03)"
                        }}
                      >
                        <h4 style={{ margin: "0 0 2px", fontSize: "0.9375rem", fontWeight: "700" }}>
                          <Link to={`/jobs/${app.job?._id}`} style={{ color: "#0f172a", textDecoration: "none" }}>
                            {app.job?.title || "Job Title"}
                          </Link>
                        </h4>
                        <div style={{ fontSize: "0.8125rem", color: "#64748b", marginBottom: "8px" }}>
                          {app.company?.name || "Company"}
                        </div>

                        {/* Stage Selector */}
                        <div style={{ marginBottom: "8px" }}>
                          <select
                            value={app.stage || app.status || "Applied"}
                            onChange={(e) => handleStageChange(app._id, e.target.value)}
                            style={{ width: "100%", fontSize: "0.75rem", padding: "4px 6px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                          >
                            {KANBAN_STAGES.map((s) => (
                              <option key={s} value={s}>
                                Move to: {s}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Actions: Notes, Reminders, Timeline */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #f1f5f9", paddingTop: "8px", fontSize: "0.75rem", flexWrap: "wrap", gap: "6px" }}>
                          <button
                            type="button"
                            onClick={() => setActiveTimelineApp(app)}
                            style={{ background: "transparent", border: "none", color: "#059669", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", padding: 0, fontWeight: 600 }}
                            title="View application lifecycle timeline"
                          >
                            <Clock size={13} />
                            <span>Timeline</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setActiveNoteApp(app)}
                            style={{ background: "transparent", border: "none", color: "#2563eb", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", padding: 0 }}
                          >
                            <StickyNote size={13} />
                            <span>Notes ({app.candidateNotes?.length || 0})</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setActiveReminderApp(app)}
                            style={{ background: "transparent", border: "none", color: "#d97706", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", padding: 0 }}
                          >
                            <Bell size={13} />
                            <span>Remind ({app.reminders?.filter((r) => !r.isCompleted)?.length || 0})</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* ========================================================
              VIEW MODE: LIST VIEW
          ======================================================== */
          <div className="applications-list">
            {filteredApps.map((app) => (
              <div key={app._id} className="application-card">
                <div className="app-card-header">
                  <div className="app-company-info">
                    {app.company?.logo ? (
                      <img src={app.company.logo} alt={`${app.company.name} logo`} className="app-company-logo" />
                    ) : (
                      <div className="app-logo-placeholder" aria-hidden="true">
                        {app.company?.name?.charAt(0) || "C"}
                      </div>
                    )}
                    <div className="app-title-group">
                      <h3>
                        <Link to={`/jobs/${app.job?._id}`} className="app-job-title">
                          {app.job?.title || "Unknown Job"}
                        </Link>
                      </h3>
                      <span className="app-company-name">{app.company?.name || "Unknown Company"}</span>
                    </div>
                  </div>
                  <div className="app-status-col">
                    {getStatusBadge(app.stage || app.status)}
                  </div>
                </div>

                <div className="app-details-meta">
                  {app.job?.location && (
                    <div className="app-meta-chip">
                      <MapPin size={14} />
                      <span>{app.job.location}</span>
                    </div>
                  )}
                  <div className="app-meta-chip">
                    <Calendar size={14} />
                    <span>Applied {new Date(app.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="app-card-footer" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
                  <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                    <button
                      type="button"
                      className="btn-session secondary"
                      onClick={() => setActiveTimelineApp(app)}
                      style={{ padding: "4px 10px", fontSize: "0.8125rem", color: "#059669", borderColor: "#a7f3d0" }}
                    >
                      <Clock size={14} />
                      <span>Timeline History</span>
                    </button>

                    <button
                      type="button"
                      className="btn-session secondary"
                      onClick={() => setActiveNoteApp(app)}
                      style={{ padding: "4px 10px", fontSize: "0.8125rem" }}
                    >
                      <StickyNote size={14} />
                      <span>Private Notes ({app.candidateNotes?.length || 0})</span>
                    </button>

                    <button
                      type="button"
                      className="btn-session secondary"
                      onClick={() => setActiveReminderApp(app)}
                      style={{ padding: "4px 10px", fontSize: "0.8125rem" }}
                    >
                      <Bell size={14} />
                      <span>Reminders ({app.reminders?.length || 0})</span>
                    </button>
                  </div>

                  <Link to={`/jobs/${app.job?._id}`} className="view-job-link">
                    View Job <ExternalLink size={13} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* MODAL: CANDIDATE NOTES */}
        {activeNoteApp && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: "1rem" }}>
            <div style={{ background: "#ffffff", borderRadius: "18px", padding: "2rem", width: "100%", maxWidth: "520px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <h3 style={{ margin: 0, fontSize: "1.25rem", fontWeight: "700" }}>
                  Notes for {activeNoteApp.job?.title}
                </h3>
                <button type="button" onClick={() => setActiveNoteApp(null)} style={{ background: "transparent", border: "none", cursor: "pointer" }}>
                  <X size={20} />
                </button>
              </div>

              <div style={{ maxHeight: "200px", overflowY: "auto", marginBottom: "1rem", display: "flex", flexDirection: "column", gap: "8px" }}>
                {activeNoteApp.candidateNotes?.length > 0 ? (
                  activeNoteApp.candidateNotes.map((n, idx) => (
                    <div key={idx} style={{ background: "#f8fafc", padding: "8px 12px", borderRadius: "8px", fontSize: "0.875rem", borderLeft: "3px solid #2563eb" }}>
                      <p style={{ margin: "0 0 2px" }}>{n.text}</p>
                      <span style={{ fontSize: "0.6875rem", color: "#94a3b8" }}>{new Date(n.createdAt).toLocaleString()}</span>
                    </div>
                  ))
                ) : (
                  <p style={{ color: "#94a3b8", fontSize: "0.875rem", fontStyle: "italic" }}>No notes added yet.</p>
                )}
              </div>

              <form onSubmit={handleAddNote}>
                <textarea
                  className="form-textarea"
                  rows={3}
                  placeholder="e.g. HR contact is Sarah; asked to review system design principles..."
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                  style={{ marginBottom: "1rem" }}
                  required
                />
                <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                  <button type="button" className="btn-session secondary" onClick={() => setActiveNoteApp(null)}>Cancel</button>
                  <button type="submit" className="btn-session primary">Add Note</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: FOLLOW-UP REMINDERS */}
        {activeReminderApp && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: "1rem" }}>
            <div style={{ background: "#ffffff", borderRadius: "18px", padding: "2rem", width: "100%", maxWidth: "520px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <h3 style={{ margin: 0, fontSize: "1.25rem", fontWeight: "700" }}>
                  Follow-up Reminders
                </h3>
                <button type="button" onClick={() => setActiveReminderApp(null)} style={{ background: "transparent", border: "none", cursor: "pointer" }}>
                  <X size={20} />
                </button>
              </div>

              <div style={{ maxHeight: "200px", overflowY: "auto", marginBottom: "1rem", display: "flex", flexDirection: "column", gap: "8px" }}>
                {activeReminderApp.reminders?.length > 0 ? (
                  activeReminderApp.reminders.map((r) => (
                    <div key={r._id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#f8fafc", padding: "8px 12px", borderRadius: "8px", fontSize: "0.875rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <input
                          type="checkbox"
                          checked={r.isCompleted}
                          onChange={() => handleToggleReminder(activeReminderApp._id, r._id)}
                        />
                        <span style={{ textDecoration: r.isCompleted ? "line-through" : "none", color: r.isCompleted ? "#94a3b8" : "#0f172a" }}>
                          {r.title}
                        </span>
                      </div>
                      <span style={{ fontSize: "0.75rem", color: "#64748b" }}>
                        Due: {new Date(r.dueDate).toLocaleDateString()}
                      </span>
                    </div>
                  ))
                ) : (
                  <p style={{ color: "#94a3b8", fontSize: "0.875rem", fontStyle: "italic" }}>No reminders set yet.</p>
                )}
              </div>

              <form onSubmit={handleAddReminder}>
                <div style={{ marginBottom: "10px" }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Follow up email with hiring manager"
                    value={reminderTitle}
                    onChange={(e) => setReminderTitle(e.target.value)}
                    required
                  />
                </div>
                <div style={{ marginBottom: "1rem" }}>
                  <input
                    type="date"
                    className="form-input"
                    value={reminderDate}
                    onChange={(e) => setReminderDate(e.target.value)}
                    required
                  />
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                  <button type="button" className="btn-session secondary" onClick={() => setActiveReminderApp(null)}>Cancel</button>
                  <button type="submit" className="btn-session primary">Set Reminder</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: APPLICATION LIFECYCLE TIMELINE */}
        {activeTimelineApp && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: "1rem" }}>
            <div style={{ background: "#ffffff", borderRadius: "18px", padding: "2rem", width: "100%", maxWidth: "600px", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.25rem", borderBottom: "1px solid #f1f5f9", paddingBottom: "1rem" }}>
                <div>
                  <h3 style={{ margin: "0 0 4px", fontSize: "1.25rem", fontWeight: "800", color: "#0f172a" }}>
                    Application Lifecycle Timeline
                  </h3>
                  <p style={{ margin: 0, fontSize: "0.875rem", color: "#64748b" }}>
                    {activeTimelineApp.job?.title || "Role"} &bull; {activeTimelineApp.company?.name || "Company"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTimelineApp(null)}
                  style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "6px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                  aria-label="Close modal"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Visual Progress Lifecycle Stepper */}
              <div style={{ marginBottom: "2rem", padding: "1rem 0.5rem", background: "#f8fafc", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                <div style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", color: "#64748b", marginBottom: "0.75rem", textAlign: "center" }}>
                  Current Status: <span style={{ color: "#2563eb", textTransform: "none" }}>{activeTimelineApp.status || activeTimelineApp.stage || "Applied"}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative" }}>
                  {["Applied", "Under Review", "Interview", "Selected"].map((step, sIdx) => {
                    const currentStatus = String(activeTimelineApp.status || activeTimelineApp.stage || "Applied").toLowerCase();
                    const isRejected = currentStatus.includes("reject");
                    const stepOrder = ["applied", "under review", "reviewing", "shortlisted", "interview", "technical round", "selected", "hired", "offer"];
                    const currentIdx = stepOrder.indexOf(currentStatus);
                    const thisStepIdx = stepOrder.indexOf(step.toLowerCase());
                    const isPassed = !isRejected && currentIdx >= thisStepIdx;
                    const isCurrent = currentStatus === step.toLowerCase() || (step === "Under Review" && currentStatus === "reviewing") || (step === "Selected" && (currentStatus === "hired" || currentStatus === "offer"));

                    return (
                      <div key={step} style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1, zIndex: 2, position: "relative" }}>
                        <div
                          style={{
                            width: "28px",
                            height: "28px",
                            borderRadius: "50%",
                            background: isPassed ? "#16a34a" : isCurrent ? "#2563eb" : "#e2e8f0",
                            color: isPassed || isCurrent ? "#ffffff" : "#64748b",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            marginBottom: "6px",
                            boxShadow: isCurrent ? "0 0 0 4px rgba(37, 99, 235, 0.2)" : "none"
                          }}
                        >
                          {isPassed ? "✓" : sIdx + 1}
                        </div>
                        <span style={{ fontSize: "0.6875rem", fontWeight: isCurrent ? 700 : 500, color: isCurrent ? "#2563eb" : "#64748b", textAlign: "center" }}>
                          {step}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Detailed Event Log */}
              <div style={{ marginBottom: "1.5rem" }}>
                <h4 style={{ margin: "0 0 1rem", fontSize: "0.9375rem", fontWeight: "700", color: "#334155" }}>
                  Status History & Timestamps
                </h4>

                <div style={{ display: "flex", flexDirection: "column", gap: "12px", borderLeft: "2px solid #e2e8f0", marginLeft: "14px", paddingLeft: "16px" }}>
                  {Array.isArray(activeTimelineApp.timeline) && activeTimelineApp.timeline.length > 0 ? (
                    activeTimelineApp.timeline.map((entry, tIdx) => (
                      <div key={tIdx} style={{ position: "relative" }}>
                        <div
                          style={{
                            position: "absolute",
                            left: "-23px",
                            top: "2px",
                            width: "12px",
                            height: "12px",
                            borderRadius: "50%",
                            background: "#2563eb",
                            border: "2px solid #ffffff"
                          }}
                        />
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                          <span style={{ fontWeight: 700, fontSize: "0.875rem", color: "#0f172a" }}>
                            {entry.status}
                          </span>
                          <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                            {entry.date ? new Date(entry.date).toLocaleString() : "Date unavailable"}
                          </span>
                        </div>
                        {entry.note && (
                          <p style={{ margin: "4px 0 0", fontSize: "0.8125rem", color: "#475569" }}>
                            {entry.note}
                          </p>
                        )}
                      </div>
                    ))
                  ) : (
                    <div style={{ position: "relative" }}>
                      <div
                        style={{
                          position: "absolute",
                          left: "-23px",
                          top: "2px",
                          width: "12px",
                          height: "12px",
                          borderRadius: "50%",
                          background: "#2563eb",
                          border: "2px solid #ffffff"
                        }}
                      />
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                        <span style={{ fontWeight: 700, fontSize: "0.875rem", color: "#0f172a" }}>
                          {activeTimelineApp.status || "Applied"}
                        </span>
                        <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                          {new Date(activeTimelineApp.appliedAt || activeTimelineApp.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p style={{ margin: "4px 0 0", fontSize: "0.8125rem", color: "#475569" }}>
                        Application submitted successfully.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Recruiter Note if any */}
              {activeTimelineApp.recruiterNote && (
                <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", padding: "12px", borderRadius: "10px", marginBottom: "1.5rem" }}>
                  <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#1d4ed8", marginBottom: "4px", textTransform: "uppercase" }}>
                    Recruiter Note
                  </div>
                  <p style={{ margin: 0, fontSize: "0.875rem", color: "#1e3a8a" }}>
                    {activeTimelineApp.recruiterNote}
                  </p>
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button
                  type="button"
                  className="btn-session primary"
                  onClick={() => setActiveTimelineApp(null)}
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Applications;
