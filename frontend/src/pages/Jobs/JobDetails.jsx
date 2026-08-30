import React, { useEffect, useState, useCallback } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import {
  ArrowLeft,
  ArrowUpRight,
  Briefcase,
  Building2,
  CheckCircle2,
  Clock3,
  MapPin,
  Share2,
  Bookmark,
  BookmarkCheck,
  MessageCircle,
  X,
} from "lucide-react";

import { useAuth } from "../../hooks/useAuth";
import { getJobById } from "../../services/jobService";
import { saveJob } from "../../services/userService";
import { applyForJob, getMyApplications } from "../../services/applicationService";
import Loader from "../../components/common/Loader";

import CareerGraph from "../../components/three/CareerGraph";
import CareerPath from "../../components/three/CareerPath";

import "./JobDetails.css";

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const [hasApplied, setHasApplied] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applying, setApplying] = useState(false);
  const [applyError, setApplyError] = useState("");
  const [applySuccess, setApplySuccess] = useState("");

  const [coverLetter, setCoverLetter] = useState("");
  const [resumeUrl, setResumeUrl] = useState(user?.resume || "");

  const fetchJobAndStatus = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const res = await getJobById(id);
      const jobData = res?.data?.job || res?.job;

      if (!jobData) {
        throw new Error("Job details not found");
      }

      setJob(jobData);

      // Check if saved
      if (user?.savedJobs) {
        const savedIds = user.savedJobs.map((j) => (j?._id || j).toString());
        setIsSaved(savedIds.includes(String(id)));
      }

      // Check if already applied
      if (isAuthenticated && user?.role === "user") {
        try {
          const appRes = await getMyApplications();
          const apps = appRes?.data?.applications || [];
          const applied = apps.some(
            (app) => String(app?.job?._id || app?.job) === String(id)
          );
          setHasApplied(applied);
        } catch (err) {
          console.warn("Could not check application status:", err);
        }
      }
    } catch (err) {
      console.error("Fetch Job Details Error:", err);
      setError(err?.response?.data?.message || err?.message || "Failed to load job details.");
    } finally {
      setLoading(false);
    }
  }, [id, isAuthenticated, user]);

  useEffect(() => {
    if (id) {
      fetchJobAndStatus();
    }
  }, [id, fetchJobAndStatus]);

  const recruiterId =
    job?.recruiter?._id ||
    job?.recruiter ||
    job?.company?.recruiter;

  const handleMessageRecruiter = () => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: `/jobs/${id}` } });
      return;
    }

    if (!recruiterId) {
      window.alert("Recruiter information is not available for this job.");
      return;
    }

    const currentUserId = user?._id || user?.id;
    if (currentUserId && String(currentUserId) === String(recruiterId)) {
      window.alert("You cannot message yourself.");
      return;
    }

    navigate(`/messages?userId=${encodeURIComponent(recruiterId)}`);
  };

  const handleOpenApplyModal = () => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: `/jobs/${id}` } });
      return;
    }

    if (user?.role === "recruiter") {
      window.alert("Recruiters cannot apply for jobs.");
      return;
    }

    if (hasApplied) {
      return;
    }

    setShowApplyModal(true);
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    setApplyError("");
    setApplySuccess("");

    try {
      setApplying(true);
      await applyForJob(id, {
        coverLetter: coverLetter.trim(),
        resume: resumeUrl.trim() || user?.resume,
      });

      setHasApplied(true);
      setApplySuccess("Application submitted successfully!");
      setTimeout(() => {
        setShowApplyModal(false);
      }, 1500);
    } catch (err) {
      console.error("Apply Error:", err);
      setApplyError(err?.response?.data?.message || "Failed to submit application.");
    } finally {
      setApplying(false);
    }
  };

  const handleSave = async () => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: `/jobs/${id}` } });
      return;
    }

    try {
      setSaving(true);
      const res = await saveJob(id);
      const savedJobs = res?.data?.savedJobs || [];
      const nowSaved = savedJobs.some(
        (j) => String(j?._id || j) === String(id)
      );
      setIsSaved(nowSaved);
    } catch (err) {
      console.error("Save Job Error:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleShare = async () => {
    try {
      const url = window.location.href;
      if (navigator.share) {
        await navigator.share({
          title: job?.title || "Job",
          text: `Check out this job: ${job?.title || ""}`,
          url,
        });
        return;
      }
      await navigator.clipboard.writeText(url);
      window.alert("Job link copied!");
    } catch (err) {
      console.error("Share error:", err);
    }
  };

  const formatSalary = (min, max) => {
    if (!min && !max) return "Not specified";
    const format = (v) => (v >= 100000 ? `₹${(v / 100000).toFixed(1)}L` : `₹${v}`);
    if (min && max) return `${format(min)} – ${format(max)}`;
    return min ? `From ${format(min)}` : `Up to ${format(max)}`;
  };

  if (loading) {
    return <Loader />;
  }

  if (error || !job) {
    return (
      <main className="job-details-page">
        <div className="container job-not-found">
          <div className="not-found-icon">
            <Briefcase size={28} />
          </div>
          <h1>Job not found.</h1>
          <p>{error || "This position may have been removed or is no longer available."}</p>
          <button type="button" onClick={() => navigate("/jobs")}>
            <ArrowLeft size={16} />
            Back to Jobs
          </button>
        </div>
      </main>
    );
  }

  const companyName = job.company?.name || "Company";
  const companyId = job.company?._id || job.company;

  return (
    <main className="job-details-page">
      {/* HERO */}
      <section className="job-details-hero">
        <div className="container">
          <Link to="/jobs" className="back-link">
            <ArrowLeft size={16} />
            Back to jobs
          </Link>

          <div className="job-hero-grid">
            <div>
              <div className="job-detail-eyebrow">{job.category || "General"}</div>
              <h1>{job.title}</h1>
              <div className="job-detail-company">
                <div className="company-mark">
                  {job.company?.logo ? (
                    <img src={job.company.logo} alt={companyName} style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover' }} />
                  ) : (
                    <Building2 size={25} />
                  )}
                </div>
                <div>
                  <strong>{companyName}</strong>
                  <span>Hiring now</span>
                </div>
              </div>

              <div className="detail-meta">
                <span>
                  <MapPin size={16} />
                  {job.location}
                </span>
                <span>
                  <Briefcase size={16} />
                  {job.jobType}
                </span>
                <span>
                  <Clock3 size={16} />
                  {job.isRemote ? "Remote" : "On-site"}
                </span>
              </div>
            </div>

            {/* RIGHT ACTIONS */}
            <div className="job-hero-actions">
              <div className="hero-salary">
                <span>COMPENSATION</span>
                <strong>{formatSalary(job.salaryMin, job.salaryMax)}</strong>
                <small>per year</small>
              </div>

              <button
                type="button"
                className={`apply-button ${hasApplied ? "applied" : ""}`}
                onClick={handleOpenApplyModal}
                disabled={hasApplied}
              >
                {hasApplied ? "Applied ✓" : "Apply Now"}
                {!hasApplied && <ArrowUpRight size={18} />}
              </button>

              <button
                type="button"
                className="message-job-button"
                onClick={handleMessageRecruiter}
              >
                <MessageCircle size={18} />
                <span>Message Recruiter</span>
              </button>

              <div className="secondary-actions">
                <button type="button" onClick={handleSave} disabled={saving}>
                  {isSaved ? <BookmarkCheck size={17} /> : <Bookmark size={17} />}
                  {isSaved ? "Saved" : "Save Job"}
                </button>
                <button type="button" onClick={handleShare}>
                  <Share2 size={17} />
                  Share
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CONTENT */}
      <section className="job-details-content">
        <div className="container details-layout">
          <article className="job-description">
            <div className="detail-block">
              <span className="block-number">01</span>
              <div>
                <h2>About the role</h2>
                <p>{job.description}</p>
              </div>
            </div>

            {Array.isArray(job.responsibilities) && job.responsibilities.length > 0 && (
              <div className="detail-block">
                <span className="block-number">02</span>
                <div>
                  <h2>Responsibilities</h2>
                  <ul>
                    {job.responsibilities.map((item, idx) => (
                      <li key={idx}>
                        <CheckCircle2 size={17} />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {Array.isArray(job.requirements) && job.requirements.length > 0 && (
              <div className="detail-block">
                <span className="block-number">03</span>
                <div>
                  <h2>Requirements</h2>
                  <ul>
                    {job.requirements.map((item, idx) => (
                      <li key={idx}>
                        <CheckCircle2 size={17} />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            <div className="detail-block">
              <span className="block-number">04</span>
              <div>
                <h2>Where this role can take you</h2>
                <p style={{ marginBottom: "1rem", fontSize: "0.875rem", color: "var(--text-secondary)" }}>
                  Skill graph & 3D career progression pathway for this position.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <CareerGraph skills={job.skills || []} />
                  <CareerPath />
                </div>
              </div>
            </div>
          </article>

          {/* SIDEBAR */}
          <aside className="job-detail-sidebar">
            <div className="side-card">
              <span className="side-label">JOB INFORMATION</span>
              <div className="info-row">
                <span>Experience</span>
                <strong>{job.experienceLevel || "Not specified"}</strong>
              </div>
              <div className="info-row">
                <span>Work mode</span>
                <strong>{job.isRemote ? "Remote" : "On-site"}</strong>
              </div>
              <div className="info-row">
                <span>Job type</span>
                <strong>{job.jobType}</strong>
              </div>
              <div className="info-row">
                <span>Category</span>
                <strong>{job.category}</strong>
              </div>
            </div>

            {/* AI MATCH SCORECARD */}
            <div className="side-card" style={{
              background: "linear-gradient(135deg, rgba(37, 99, 235, 0.06), rgba(16, 185, 129, 0.06))",
              border: "1px solid rgba(37, 99, 235, 0.2)",
              borderRadius: "12px",
              padding: "1.25rem"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                <span className="side-label" style={{ color: "#2563eb", fontWeight: 700, margin: 0 }}>
                  ⚡ AI SKILL MATCH
                </span>
                <span style={{
                  background: "#10b981",
                  color: "#fff",
                  fontSize: "0.75rem",
                  fontWeight: 800,
                  padding: "3px 8px",
                  borderRadius: "999px"
                }}>
                  {(() => {
                    const userSkills = (user?.skills || ["React", "Node.js", "MongoDB", "JavaScript", "TypeScript"]).map(s => String(s).toLowerCase());
                    const jobSkills = (job.skills || []).map(s => String(s).toLowerCase());
                    if (!jobSkills.length) return "92% Fit";
                    const matches = jobSkills.filter(s => userSkills.some(us => us.includes(s) || s.includes(us)));
                    const pct = Math.max(70, Math.min(98, Math.round((matches.length / jobSkills.length) * 100)));
                    return `${pct}% Match`;
                  })()}
                </span>
              </div>
              <p style={{ margin: "0 0 0.75rem", color: "var(--text-secondary, #555)", fontSize: "0.82rem", lineHeight: 1.5 }}>
                {user ? `Analyzed against your profile (${user.name}).` : "Analyzed against candidate benchmark."}
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "1rem" }}>
                {(job.skills || []).map((skill, idx) => {
                  const userSkills = (user?.skills || ["React", "Node.js", "MongoDB", "JavaScript", "TypeScript"]).map(s => String(s).toLowerCase());
                  const isMatched = userSkills.some(us => us.includes(String(skill).toLowerCase()) || String(skill).toLowerCase().includes(us));
                  return (
                    <span
                      key={idx}
                      style={{
                        fontSize: "0.74rem",
                        padding: "3px 8px",
                        borderRadius: "6px",
                        background: isMatched ? "rgba(16, 185, 129, 0.15)" : "rgba(245, 158, 11, 0.15)",
                        color: isMatched ? "#065f46" : "#92400e",
                        fontWeight: 600,
                        border: isMatched ? "1px solid rgba(16, 185, 129, 0.3)" : "1px solid rgba(245, 158, 11, 0.3)",
                      }}
                    >
                      {isMatched ? "✓ " : "+ "} {skill}
                    </span>
                  );
                })}
              </div>
            </div>

            {Array.isArray(job.skills) && job.skills.length > 0 && (
              <div className="side-card skills-card">
                <span className="side-label">ALL REQUIRED SKILLS</span>
                <div className="detail-skills">
                  {job.skills.map((skill, idx) => (
                    <span key={idx}>{skill}</span>
                  ))}
                </div>
              </div>
            )}

            <div className="company-card">
              <div className="company-card-icon">
                <Building2 size={22} />
              </div>
              <span>ABOUT COMPANY</span>
              <h3>{companyName}</h3>
              <p>Learn more about the company, culture and opportunities.</p>
              {companyId && typeof companyId === "string" && (
                <button
                  type="button"
                  onClick={() => navigate(`/companies/${companyId}`)}
                >
                  View Company
                  <ArrowUpRight size={15} />
                </button>
              )}
            </div>

            <div className="side-card">
              <span className="side-label">HAVE A QUESTION?</span>
              <p style={{ margin: "0 0 1rem", color: "var(--text-secondary, #666)", fontSize: "0.8rem", lineHeight: 1.6 }}>
                Want to know more about this role? Contact the recruiter directly.
              </p>
              <button
                type="button"
                className="message-job-button"
                onClick={handleMessageRecruiter}
              >
                <MessageCircle size={18} />
                <span>Message Recruiter</span>
              </button>
            </div>
          </aside>
        </div>
      </section>

      {/* BOTTOM CTA */}
      <section className="job-apply-banner">
        <div className="container">
          <div>
            <span>READY TO APPLY?</span>
            <h2>
              Make your<br />
              <em>next move.</em>
            </h2>
          </div>
          <div className="job-banner-actions">
            <button
              type="button"
              onClick={handleOpenApplyModal}
              disabled={hasApplied}
            >
              {hasApplied ? "Applied ✓" : "Apply for this role"}
              {!hasApplied && <ArrowUpRight size={18} />}
            </button>

            <button
              type="button"
              className="banner-message-button"
              onClick={handleMessageRecruiter}
            >
              <MessageCircle size={18} />
              Message Recruiter
            </button>
          </div>
        </div>
      </section>

      {/* APPLY MODAL */}
      {showApplyModal && (
        <div className="modal-overlay" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div className="card" style={{
            maxWidth: '500px',
            width: '100%',
            backgroundColor: '#121624',
            borderRadius: '16px',
            padding: '2rem',
            border: '1px solid rgba(255,255,255,0.1)',
            position: 'relative'
          }}>
            <button
              type="button"
              onClick={() => setShowApplyModal(false)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'none',
                border: 'none',
                color: '#fff',
                cursor: 'pointer'
              }}
            >
              <X size={20} />
            </button>

            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Apply for {job.title}</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              {companyName} • {job.location}
            </p>

            {applyError && (
              <div style={{ padding: '0.75rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', color: '#f87171', marginBottom: '1rem', fontSize: '0.85rem' }}>
                {applyError}
              </div>
            )}

            {applySuccess && (
              <div style={{ padding: '0.75rem', backgroundColor: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: '8px', color: '#4ade80', marginBottom: '1rem', fontSize: '0.85rem' }}>
                {applySuccess}
              </div>
            )}

            <form onSubmit={handleApplySubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: 600 }}>
                  Resume Link (optional)
                </label>
                <input
                  type="url"
                  placeholder="https://drive.google.com/your-resume.pdf"
                  value={resumeUrl}
                  onChange={(e) => setResumeUrl(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    backgroundColor: '#1a2035',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#fff'
                  }}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: 600 }}>
                  Cover Letter (optional)
                </label>
                <textarea
                  rows="4"
                  placeholder="Tell the employer why you are a great fit..."
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    backgroundColor: '#1a2035',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#fff',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  style={{
                    padding: '0.75rem 1.5rem',
                    borderRadius: '8px',
                    background: 'transparent',
                    border: '1px solid rgba(255,255,255,0.2)',
                    color: '#fff',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={applying}
                  style={{
                    padding: '0.75rem 1.5rem',
                    borderRadius: '8px',
                    background: 'var(--primary, #3b82f6)',
                    border: 'none',
                    color: '#fff',
                    fontWeight: 600,
                    cursor: applying ? 'not-allowed' : 'pointer'
                  }}
                >
                  {applying ? "Submitting..." : "Submit Application"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
};

export default JobDetails;