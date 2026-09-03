import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Bell,
  PlusCircle,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Loader2,
  ToggleLeft,
  ToggleRight
} from "lucide-react";
import {
  getJobAlerts,
  createJobAlert,
  toggleJobAlert,
  deleteJobAlert
} from "../../services/careerService";
import "./CareerRoadmap.css";

const JobAlerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [role, setRole] = useState("");
  const [location, setLocation] = useState("");
  const [keywords, setKeywords] = useState("");
  const [frequency, setFrequency] = useState("daily");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchAlerts = async () => {
      try {
        setLoading(true);
        const data = await getJobAlerts();
        if (isMounted) {
          setAlerts(data.alerts || []);
        }
      } catch (err) {
        console.error("Failed to load job alerts:", err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchAlerts();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title && !role) return;

    setSubmitting(true);
    try {
      const res = await createJobAlert({
        title: title || role,
        role,
        location,
        keywords,
        frequency
      });

      if (res?.data) {
        setAlerts((prev) => [res.data, ...prev]);
        setShowModal(false);
        setTitle("");
        setRole("");
        setLocation("");
        setKeywords("");
      }
    } catch (err) {
      console.error("Failed to create alert:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (id) => {
    try {
      const res = await toggleJobAlert(id);
      if (res?.data) {
        setAlerts((prev) => prev.map((a) => (a._id === id ? res.data : a)));
      }
    } catch (err) {
      console.error("Failed to toggle alert:", err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this job alert?")) return;
    try {
      await deleteJobAlert(id);
      setAlerts((prev) => prev.filter((a) => a._id !== id));
    } catch (err) {
      console.error("Failed to delete alert:", err);
    }
  };

  return (
    <div className="roadmap-page">
      <div className="roadmap-container">
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <h1 className="roadmap-title" style={{ textAlign: "left", marginBottom: "0.25rem" }}>
              Job Alerts & Notifications
            </h1>
            <p style={{ color: "#64748b", fontSize: "0.9375rem" }}>
              Get notified immediately whenever new jobs matching your target role and skills are posted.
            </p>
          </div>

          <button
            type="button"
            className="btn-session primary"
            onClick={() => setShowModal(true)}
          >
            <PlusCircle size={16} />
            <span>Create New Alert</span>
          </button>
        </div>

        {/* Alerts List */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "4rem 0" }}>
            <Loader2 size={36} style={{ animation: "spin 1s linear infinite", margin: "0 auto 1rem" }} />
            <h3>Loading Job Alerts...</h3>
          </div>
        ) : alerts.length === 0 ? (
          <div className="phase-card" style={{ textAlign: "center", padding: "3rem" }}>
            <Bell size={36} color="#94a3b8" style={{ margin: "0 auto 1rem" }} />
            <h3 style={{ margin: "0 0 8px" }}>No Job Alerts Created</h3>
            <p style={{ color: "#64748b", maxWidth: "400px", margin: "0 auto 1.5rem" }}>
              Set up automated criteria to receive updates when matching engineering positions open up.
            </p>
            <button
              type="button"
              className="btn-session primary"
              onClick={() => setShowModal(true)}
            >
              <PlusCircle size={16} />
              <span>Create Your First Alert</span>
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {alerts.map((alert) => (
              <div
                key={alert._id}
                className="phase-card"
                style={{
                  margin: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "16px"
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                    <h3 style={{ margin: 0, fontSize: "1.125rem", fontWeight: "700" }}>
                      {alert.title}
                    </h3>
                    <span
                      style={{
                        fontSize: "0.75rem",
                        padding: "2px 8px",
                        borderRadius: "6px",
                        fontWeight: "700",
                        background: alert.isActive ? "#f0fdf4" : "#f1f5f9",
                        color: alert.isActive ? "#16a34a" : "#64748b"
                      }}
                    >
                      {alert.isActive ? "Active" : "Paused"}
                    </span>
                  </div>

                  <div style={{ fontSize: "0.875rem", color: "#64748b", display: "flex", gap: "12px", flexWrap: "wrap" }}>
                    {alert.role && <span>Role: {alert.role}</span>}
                    {alert.location && <span>Location: {alert.location}</span>}
                    <span>Frequency: {alert.frequency}</span>
                  </div>

                  {Array.isArray(alert.keywords) && alert.keywords.length > 0 && (
                    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "8px" }}>
                      {alert.keywords.map((kw, idx) => (
                        <span key={idx} className="priority-tag optional">
                          {kw}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <button
                    type="button"
                    className="btn-session secondary"
                    onClick={() => handleToggle(alert._id)}
                    style={{ padding: "6px 12px" }}
                  >
                    {alert.isActive ? <ToggleRight size={20} color="#16a34a" /> : <ToggleLeft size={20} color="#94a3b8" />}
                    <span>{alert.isActive ? "Active" : "Paused"}</span>
                  </button>

                  <button
                    type="button"
                    className="btn-remove-file"
                    onClick={() => handleDelete(alert._id)}
                    title="Delete Alert"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Modal */}
        {showModal && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 9999,
              padding: "1rem"
            }}
          >
            <div
              style={{
                background: "#ffffff",
                borderRadius: "20px",
                padding: "2rem",
                width: "100%",
                maxWidth: "500px",
                boxShadow: "0 20px 40px rgba(0,0,0,0.2)"
              }}
            >
              <h2 style={{ margin: "0 0 1rem", fontSize: "1.375rem", fontWeight: "800" }}>
                Create New Job Alert
              </h2>

              <form onSubmit={handleCreate}>
                <div style={{ marginBottom: "1rem" }}>
                  <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "600", marginBottom: "4px" }}>
                    Alert Name / Title *
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Remote React Jobs"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div style={{ marginBottom: "1rem" }}>
                  <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "600", marginBottom: "4px" }}>
                    Target Role
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Frontend Developer"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                  />
                </div>

                <div style={{ marginBottom: "1rem" }}>
                  <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "600", marginBottom: "4px" }}>
                    Location / Remote
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Remote, San Francisco, New York"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>

                <div style={{ marginBottom: "1.5rem" }}>
                  <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "600", marginBottom: "4px" }}>
                    Keywords (comma-separated)
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. React, Node.js, TypeScript"
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                  />
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                  <button
                    type="button"
                    className="btn-session secondary"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-session primary"
                    disabled={submitting}
                  >
                    {submitting ? "Saving..." : "Create Alert"}
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

export default JobAlerts;
