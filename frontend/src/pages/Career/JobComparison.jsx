import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  Layers,
  CheckCircle2,
  XCircle,
  Building2,
  DollarSign,
  MapPin,
  Briefcase,
  ArrowRight,
  Loader2,
  PlusCircle,
  Sparkles
} from "lucide-react";
import { compareJobs } from "../../services/careerService";
import { getJobs } from "../../services/jobService";
import "./CareerRoadmap.css";

const JobComparison = () => {
  const [searchParams] = useSearchParams();
  const initialJobIds = searchParams.get("jobIds") ? searchParams.get("jobIds").split(",") : [];

  const [availableJobs, setAvailableJobs] = useState([]);
  const [selectedJobIds, setSelectedJobIds] = useState(initialJobIds);
  const [comparison, setComparison] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch available jobs for selector
  useEffect(() => {
    let isMounted = true;
    const fetchJobsList = async () => {
      try {
        const res = await getJobs({ limit: 20 });
        const list = res?.data?.jobs || res?.jobs || res?.data || [];
        if (isMounted) {
          setAvailableJobs(Array.isArray(list) ? list : []);
          if (initialJobIds.length === 0 && list.length >= 2) {
            setSelectedJobIds([list[0]._id, list[1]._id]);
          }
        }
      } catch (err) {
        console.error("Failed to load jobs list:", err);
      }
    };

    fetchJobsList();

    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch comparison data when selected jobs change
  useEffect(() => {
    let isMounted = true;
    const runComparison = async () => {
      if (selectedJobIds.length === 0) {
        setComparison([]);
        return;
      }

      try {
        setLoading(true);
        const res = await compareJobs(selectedJobIds);
        if (isMounted) {
          setComparison(res.comparison || []);
        }
      } catch (err) {
        console.error("Failed to compare jobs:", err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    runComparison();

    return () => {
      isMounted = false;
    };
  }, [selectedJobIds]);

  const handleSelectJob = (jobId) => {
    if (selectedJobIds.includes(jobId)) {
      setSelectedJobIds((prev) => prev.filter((id) => id !== jobId));
    } else if (selectedJobIds.length < 4) {
      setSelectedJobIds((prev) => [...prev, jobId]);
    } else {
      alert("You can compare up to 4 jobs simultaneously.");
    }
  };

  return (
    <div className="roadmap-page">
      <div className="roadmap-container" style={{ maxWidth: "1200px" }}>
        {/* Header */}
        <div className="roadmap-header">
          <div className="roadmap-badge">
            <Layers size={14} />
            <span>Side-by-Side Job Benchmarking</span>
          </div>
          <h1 className="roadmap-title">Job Comparison Matrix</h1>
          <p className="roadmap-subtitle">
            Compare salary, location, skill requirements, and your personalized Match Score across multiple opportunities to make confident career decisions.
          </p>

          {/* Job Selectors */}
          <div style={{ display: "flex", gap: "8px", justifyContent: "center", flexWrap: "wrap", marginBottom: "2rem" }}>
            {availableJobs.map((j) => {
              const isSelected = selectedJobIds.includes(j._id);
              return (
                <button
                  key={j._id}
                  type="button"
                  className={`role-tab-btn ${isSelected ? "active" : ""}`}
                  onClick={() => handleSelectJob(j._id)}
                  style={{ fontSize: "0.8125rem", padding: "6px 12px" }}
                >
                  <span>{isSelected ? "✓" : "+"}</span>
                  <span>{j.title} ({j.company?.name || "Company"})</span>
                </button>
              );
            })}
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "4rem 0" }}>
            <Loader2 size={36} style={{ animation: "spin 1s linear infinite", margin: "0 auto 1rem" }} />
            <h3>Evaluating Job Matches & Building Comparison Matrix...</h3>
          </div>
        ) : comparison.length === 0 ? (
          <div className="phase-card" style={{ textAlign: "center", padding: "3rem" }}>
            <Layers size={36} color="#94a3b8" style={{ margin: "0 auto 1rem" }} />
            <h3>Select at least 2 jobs above to compare</h3>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${comparison.length}, 1fr)`, gap: "16px", overflowX: "auto" }}>
            {comparison.map((job) => (
              <div key={job._id} className="phase-card" style={{ margin: 0, padding: "1.5rem", display: "flex", flexDirection: "column" }}>
                {/* Header */}
                <div style={{ textAlign: "center", paddingBottom: "1rem", borderBottom: "1px solid #e2e8f0", marginBottom: "1rem" }}>
                  <div
                    style={{
                      width: "60px",
                      height: "60px",
                      borderRadius: "50%",
                      border: "3px solid #2563eb",
                      background: "#eff6ff",
                      color: "#2563eb",
                      fontWeight: "800",
                      fontSize: "1.25rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 0.75rem"
                    }}
                  >
                    {job.matchScore}%
                  </div>
                  <div style={{ fontSize: "0.75rem", fontWeight: "700", color: "#2563eb", textTransform: "uppercase" }}>
                    Your Profile Match
                  </div>
                  <h3 style={{ margin: "6px 0 2px", fontSize: "1.125rem", fontWeight: "700" }}>{job.title}</h3>
                  <div style={{ color: "#64748b", fontSize: "0.875rem" }}>{job.company}</div>
                </div>

                {/* Key Metrics */}
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.875rem", marginBottom: "1.25rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <MapPin size={16} color="#64748b" />
                    <span><strong>Location:</strong> {job.location || "Remote"}</span>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Briefcase size={16} color="#64748b" />
                    <span><strong>Type:</strong> {job.jobType || "Full-time"}</span>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <DollarSign size={16} color="#64748b" />
                    <span>
                      <strong>Salary:</strong>{" "}
                      {job.salary?.min ? `$${job.salary.min.toLocaleString()} - $${job.salary.max?.toLocaleString()}` : "Competitive"}
                    </span>
                  </div>
                </div>

                {/* Matched Skills */}
                <div style={{ marginBottom: "1rem" }}>
                  <div style={{ fontSize: "0.8125rem", fontWeight: "700", color: "#16a34a", marginBottom: "6px" }}>
                    ✓ Matched Skills ({job.matchedSkills?.length || 0}):
                  </div>
                  <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                    {job.matchedSkills?.map((s, idx) => (
                      <span key={idx} style={{ fontSize: "0.6875rem", background: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0", padding: "2px 6px", borderRadius: "4px" }}>
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Missing Skills */}
                <div style={{ marginBottom: "1.5rem" }}>
                  <div style={{ fontSize: "0.8125rem", fontWeight: "700", color: "#dc2626", marginBottom: "6px" }}>
                    ✗ Missing Skills ({job.missingSkills?.length || 0}):
                  </div>
                  <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                    {job.missingSkills?.map((s, idx) => (
                      <span key={idx} style={{ fontSize: "0.6875rem", background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", padding: "2px 6px", borderRadius: "4px" }}>
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                {/* CTA */}
                <div style={{ marginTop: "auto" }}>
                  <Link to={`/jobs/${job._id}`} className="btn-session primary" style={{ width: "100%", justifyContent: "center" }}>
                    <span>View Job Details</span>
                    <ArrowRight size={15} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default JobComparison;
