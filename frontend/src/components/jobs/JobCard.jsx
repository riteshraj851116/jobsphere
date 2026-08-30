import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapPin,
  Briefcase,
  Clock,
  Bookmark,
  BookmarkCheck,
  DollarSign,
  ArrowUpRight,
} from "lucide-react";

import { saveJob } from "../../services/userService";
import { useAuth } from "../../hooks/useAuth";

import "./JobCard.css";

const JobCard = ({ job, isSaved = false, onSave }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [saved, setSaved] = useState(Boolean(isSaved));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setSaved(Boolean(isSaved));
  }, [isSaved]);

  if (!job) {
    return null;
  }

  const {
    _id,
    title,
    company,
    location,
    jobType,
    experienceLevel,
    salaryMin,
    salaryMax,
    isRemote,
    createdAt,
    skills,
  } = job;

  const companyName = company?.name || "Unknown Company";

  const companyInitial =
    companyName.charAt(0).toUpperCase() || "C";

  const formatDate = (dateString) => {
    if (!dateString) {
      return "";
    }

    const now = new Date();
    const posted = new Date(dateString);

    if (Number.isNaN(posted.getTime())) {
      return "";
    }

    const diff = now - posted;

    const diffDays = Math.floor(
      diff / (1000 * 60 * 60 * 24)
    );

    if (diffDays <= 0) {
      return "Today";
    }

    if (diffDays === 1) {
      return "Yesterday";
    }

    if (diffDays < 7) {
      return `${diffDays} days ago`;
    }

    if (diffDays < 30) {
      return `${Math.floor(diffDays / 7)}w ago`;
    }

    return posted.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatSalary = (min, max) => {
    const minimum = Number(min);
    const maximum = Number(max);

    if (
      (!min && !max) ||
      (Number.isNaN(minimum) &&
        Number.isNaN(maximum))
    ) {
      return null;
    }

    const formatAmount = (value) => {
      if (!value || Number.isNaN(value)) {
        return null;
      }

      if (value >= 100000) {
        return `₹${(value / 100000).toFixed(1)}L`;
      }

      if (value >= 1000) {
        return `₹${Math.round(value / 1000)}k`;
      }

      return `₹${value.toLocaleString("en-IN")}`;
    };

    const minText = formatAmount(minimum);
    const maxText = formatAmount(maximum);

    if (minText && maxText) {
      return `${minText} – ${maxText}`;
    }

    if (minText) {
      return `From ${minText}`;
    }

    if (maxText) {
      return `Up to ${maxText}`;
    }

    return null;
  };

  const salaryText = formatSalary(
    salaryMin,
    salaryMax
  );

  const jobId = _id || job.id;

  const handleCardClick = () => {
    if (!jobId) {
      console.error("Cannot open job: Job ID missing");
      return;
    }

    navigate(`/jobs/${jobId}`);
  };

  const handleCardKeyDown = (event) => {
    if (
      event.key === "Enter" ||
      event.key === " "
    ) {
      event.preventDefault();
      handleCardClick();
    }
  };

  const handleSave = async (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (saving) {
      return;
    }

    if (!isAuthenticated) {
      navigate("/login", {
        state: {
          from: `/jobs/${_id}`,
        },
      });

      return;
    }

    if (!_id) {
      console.error(
        "Cannot save job: Job ID missing"
      );
      return;
    }

    try {
      setSaving(true);

      const response = await saveJob(_id);

      const savedJobs =
        response?.data?.savedJobs || [];

      const isNowSaved = savedJobs.some(
        (item) => {
          const savedId =
            item?._id || item;

          return (
            String(savedId) === String(_id)
          );
        }
      );

      setSaved(isNowSaved);

      if (typeof onSave === "function") {
        onSave(_id, isNowSaved);
      }
    } catch (error) {
      console.error(
        "Save job error:",
        error
      );

      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Unable to save job. Please try again.";

      window.alert(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <article
      className={`job-card ${
        saved ? "job-card--saved" : ""
      }`}
      onClick={handleCardClick}
      onKeyDown={handleCardKeyDown}
      tabIndex={0}
      aria-label={`${title || "Job"} at ${companyName}`}
    >
      {/* TOP ROW */}

      <div className="job-card-top">
        <span className="job-posted">
          {formatDate(createdAt)}
        </span>

        <button
          type="button"
          className={`save-btn ${
            saved ? "save-btn--saved" : ""
          }`}
          onClick={handleSave}
          disabled={saving}
          aria-label={
            saved
              ? "Remove saved job"
              : "Save job"
          }
          title={
            saved
              ? "Remove saved job"
              : "Save job"
          }
        >
          {saved ? (
            <BookmarkCheck
              size={18}
              strokeWidth={2}
            />
          ) : (
            <Bookmark
              size={18}
              strokeWidth={1.8}
            />
          )}
        </button>
      </div>

      {/* COMPANY / TITLE */}

      <div className="job-card-header">
        <div className="company-logo-wrap">
          {company?.logo ? (
            <img
              src={company.logo}
              alt={`${companyName} logo`}
              className="company-logo"
              onError={(event) => {
                event.currentTarget.style.display =
                  "none";

                const fallback =
                  event.currentTarget
                    .nextElementSibling;

                if (fallback) {
                  fallback.style.display =
                    "flex";
                }
              }}
            />
          ) : null}

          <div
            className="company-logo-placeholder"
            aria-hidden="true"
            style={{
              display: company?.logo
                ? "none"
                : "flex",
            }}
          >
            {companyInitial}
          </div>
        </div>

        <div className="job-title-group">
          <span className="job-company-label">
            COMPANY
          </span>

          <span className="company-name">
            {companyName}
          </span>

          <h3 className="job-title">
            {title || "Untitled Job"}
          </h3>
        </div>
      </div>

      {/* JOB INFORMATION */}

      <div className="job-meta">
        {location && (
          <div className="job-meta-item">
            <MapPin size={15} />

            <span>
              {isRemote
                ? "Remote"
                : location}
            </span>
          </div>
        )}

        {jobType && (
          <div className="job-meta-item">
            <Briefcase size={15} />

            <span>
              {jobType}
            </span>
          </div>
        )}

        {experienceLevel && (
          <div className="job-meta-item">
            <Clock size={15} />

            <span>
              {experienceLevel}
            </span>
          </div>
        )}

        {salaryText && (
          <div className="job-meta-item job-meta-salary">
            <DollarSign size={15} />

            <span>
              {salaryText}
            </span>
          </div>
        )}
      </div>

      {/* SKILLS */}

      {Array.isArray(skills) &&
        skills.length > 0 && (
          <div className="job-skills-section">
            <span className="skills-label">
              SKILLS
            </span>

            <div className="job-skills">
              {skills
                .slice(0, 5)
                .map((skill, index) => (
                  <span
                    key={`${skill}-${index}`}
                    className="skill-pill"
                  >
                    {skill}
                  </span>
                ))}

              {skills.length > 5 && (
                <span className="skill-pill skill-pill--more">
                  +{skills.length - 5}
                </span>
              )}
            </div>
          </div>
        )}

      {/* FOOTER */}

      <div className="job-card-footer">
        <div className="job-footer-left">
          <span className="footer-dot" />

          <span>
            Open opportunity
          </span>
        </div>

        <button
          type="button"
          className="view-job-btn"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();

            handleCardClick();
          }}
        >
          <span>
            View Job
          </span>

          <ArrowUpRight size={16} />
        </button>
      </div>
    </article>
  );
};

export default JobCard;