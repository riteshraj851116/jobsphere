import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  Search,
  MapPin,
  Briefcase,
  SlidersHorizontal,
  ArrowUpRight,
  Clock3,
  Building2,
  X,
} from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import JobsHeaderVisual from "../../components/three/JobsHeaderVisual";
import JobField from "../../components/three/JobField";
import { getJobs } from "../../services/jobService";
import { useDebounce } from "../../hooks/useDebounce";
import "./Jobs.css";

const FILTERS = {
  type: ["Full Time", "Part Time", "Contract", "Internship", "Freelance"],
  mode: ["Remote", "Hybrid", "On-site"],
  experience: ["Entry Level", "Mid Level", "Senior Level", "Lead"],
};

const Jobs = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const initialSearch = searchParams.get("search") || "";
  const initialLocation = searchParams.get("location") || "";

  const [search, setSearch] = useState(initialSearch);
  const [location, setLocation] = useState(initialLocation);

  const [selectedFilters, setSelectedFilters] = useState({
    type: [],
    mode: [],
    experience: [],
  });

  const [sort, setSort] = useState("recent");
  const [mobileFilters, setMobileFilters] = useState(false);

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Debounce search and location to avoid excessive API calls
  const debouncedSearch = useDebounce(search, 500);
  const debouncedLocation = useDebounce(location, 500);

  useEffect(() => {
    setSearch(initialSearch);
    setLocation(initialLocation);
  }, [initialSearch, initialLocation]);

  useEffect(() => {
    let cancelled = false;

    const fetchJobs = async () => {
      try {
        setLoading(true);
        setError("");

        const params = {};

        if (debouncedSearch.trim()) {
          params.search = debouncedSearch.trim();
        }

        if (debouncedLocation.trim()) {
          params.location = debouncedLocation.trim();
        }

        if (selectedFilters.type.length > 0) {
          params.jobType = selectedFilters.type[0];
        }

        if (selectedFilters.mode.length > 0) {
          params.remote = selectedFilters.mode.includes("Remote") ? "true" :
                        selectedFilters.mode.includes("On-site") ? "false" : "";
        }

        if (selectedFilters.experience.length > 0) {
          params.experienceLevel = selectedFilters.experience[0];
        }

        if (sort === "title") {
          params.sort = "oldest";
        }

        const response = await getJobs(params);
        if (cancelled) return;
        const jobsData =
          response?.data?.jobs ||
          response?.jobs ||
          (Array.isArray(response?.data) ? response.data : []) ||
          (Array.isArray(response) ? response : []);
        setJobs(jobsData);
      } catch (err) {
        if (cancelled) return;
        setError(err?.response?.data?.message || "Failed to load jobs");
        setJobs([]);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchJobs();

    return () => {
      cancelled = true;
    };
  }, [debouncedSearch, debouncedLocation, selectedFilters, sort]);

  const handleSearch = (event) => {
    event.preventDefault();

    const params = new URLSearchParams();

    if (search.trim()) {
      params.set("search", search.trim());
    }

    if (location.trim()) {
      params.set("location", location.trim());
    }

    setSearchParams(params);
  };

  const toggleFilter = (group, value) => {
    setSelectedFilters((current) => {
      const exists = current[group].includes(value);

      return {
        ...current,
        [group]: exists
          ? current[group].filter((item) => item !== value)
          : [...current[group], value],
      };
    });
  };

  const clearFilters = () => {
    setSelectedFilters({
      type: [],
      mode: [],
      experience: [],
    });
  };

  const activeFilterCount = useMemo(() =>
    selectedFilters.type.length +
    selectedFilters.mode.length +
    selectedFilters.experience.length,
    [selectedFilters]
  );

  const formatSalary = useCallback((job) => {
    if (job.salaryMin || job.salaryMax) {
      const min = job.salaryMin ? `₹${(job.salaryMin / 100000).toFixed(1)}L` : "";
      const max = job.salaryMax ? `₹${(job.salaryMax / 100000).toFixed(1)}L` : "";
      return min && max ? `${min} – ${max}` : min || max;
    }
    return "Not specified";
  }, []);

  const getTimeAgo = useCallback((date) => {
    if (!date) return "Recently";
    const now = new Date();
    const jobDate = new Date(date);
    const diffTime = Math.abs(now - jobDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "1 day ago";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  }, []);

  return (
    <main className="jobs-page">
      <section className="jobs-hero" style={{ position: 'relative' }}>
        <JobField />
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div className="jobs-eyebrow flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span />
              JobSphere / Opportunities
            </div>
            <JobsHeaderVisual />
          </div>

          <h1>
            Find work that
            <br />
            <span>moves you.</span>
          </h1>

          <p>
            Explore relevant jobs from companies hiring across
            technology, design, business and more.
          </p>

          <form
            className="jobs-search"
            onSubmit={handleSearch}
          >
            <div className="jobs-search-field">
              <Search size={20} />

              <div>
                <label htmlFor="jobs-search">
                  KEYWORD
                </label>

                <input
                  id="jobs-search"
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Job title, skill or company"
                />
              </div>
            </div>

            <div className="jobs-search-divider" />

            <div className="jobs-search-field">
              <MapPin size={20} />

              <div>
                <label htmlFor="jobs-location">
                  LOCATION
                </label>

                <input
                  id="jobs-location"
                  value={location}
                  onChange={(event) =>
                    setLocation(event.target.value)
                  }
                  placeholder="City, state or remote"
                />
              </div>
            </div>

            <button type="submit" disabled={loading}>
              <Search size={17} />
              {loading ? "Searching..." : "Search Jobs"}
            </button>
          </form>
        </div>
      </section>

      <section className="jobs-content">
        <div className="container jobs-layout">
          <aside
            className={`jobs-sidebar ${
              mobileFilters ? "mobile-open" : ""
            }`}
          >
            <div className="sidebar-header">
              <div>
                <span>FILTERS</span>
                <h2>Refine results</h2>
              </div>

              <button
                type="button"
                className="mobile-filter-close"
                onClick={() => setMobileFilters(false)}
                aria-label="Close filters"
              >
                <X size={20} />
              </button>
            </div>

            {activeFilterCount > 0 && (
              <button
                type="button"
                className="clear-filters"
                onClick={clearFilters}
              >
                Clear all ({activeFilterCount})
              </button>
            )}

            {Object.entries(FILTERS).map(
              ([group, values]) => (
                <div className="filter-group" key={group}>
                  <h3>
                    {group === "type"
                      ? "Job Type"
                      : group === "mode"
                      ? "Work Mode"
                      : "Experience"}
                  </h3>

                  {values.map((value) => {
                    const checked =
                      selectedFilters[group].includes(value);

                    return (
                      <label
                        className={`filter-option ${
                          checked ? "checked" : ""
                        }`}
                        key={value}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() =>
                            toggleFilter(group, value)
                          }
                        />

                        <span className="custom-checkbox">
                          {checked ? "✓" : ""}
                        </span>

                        <span>{value}</span>
                      </label>
                    );
                  })}
                </div>
              )
            )}

            <div className="sidebar-bottom">
              <Briefcase size={18} />
              <span>
                New opportunities are added every day.
              </span>
            </div>
          </aside>

          <div className="jobs-results">
            <div className="results-toolbar">
              <div>
                <span className="results-label">
                  SEARCH RESULTS
                </span>

                <h2>
                  {loading ? (
                    "Loading..."
                  ) : error ? (
                    "Error loading jobs"
                  ) : (
                    <>
                      {jobs.length}{" "}
                      {jobs.length === 1
                        ? "position"
                        : "positions"}{" "}
                      found
                    </>
                  )}
                </h2>
              </div>

              <div className="results-actions">
                <button
                  type="button"
                  className="mobile-filter-button"
                  onClick={() => setMobileFilters(true)}
                >
                  <SlidersHorizontal size={17} />
                  Filters
                  {activeFilterCount > 0 && (
                    <span>{activeFilterCount}</span>
                  )}
                </button>

                <label className="sort-control">
                  <span>Sort</span>

                  <select
                    value={sort}
                    onChange={(event) =>
                      setSort(event.target.value)
                    }
                  >
                    <option value="recent">
                      Most Recent
                    </option>

                    <option value="title">
                      Job Title
                    </option>
                  </select>
                </label>
              </div>
            </div>

            {error && (
              <div className="error-state">
                <p>{error}</p>
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                >
                  Retry
                </button>
              </div>
            )}

            <div className="job-list">
              {loading ? (
                <div className="loading-state">
                  <p>Loading jobs...</p>
                </div>
              ) : jobs.length > 0 ? (
                jobs.map((job) => (
                  <article
                    className="job-card"
                    key={job._id}
                  >
                    <div className="job-company-icon">
                      {job.company?.logo ? (
                        <img
                          src={job.company.logo}
                          alt={job.company.name}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <Building2 size={24} style={{ display: job.company?.logo ? 'none' : 'flex' }} />
                    </div>

                    <div className="job-main">
                      <div className="job-card-top">
                        <div>
                          <Link
                            to={`/jobs/${job._id}`}
                            className="job-title"
                          >
                            {job.title}
                          </Link>

                          <div className="job-company">
                            {job.company?.name || "Unknown Company"}
                          </div>
                        </div>

                        <Link
                          to={`/jobs/${job._id}`}
                          className="job-arrow"
                          aria-label={`View ${job.title}`}
                        >
                          <ArrowUpRight size={20} />
                        </Link>
                      </div>

                      <div className="job-meta">
                        <span>
                          <MapPin size={14} />
                          {job.location}
                        </span>

                        <span>
                          <Briefcase size={14} />
                          {job.jobType}
                        </span>

                        <span>
                          <Clock3 size={14} />
                          {getTimeAgo(job.createdAt)}
                        </span>
                      </div>

                      <div className="job-tags">
                        <span className="job-mode">
                          {job.isRemote ? "Remote" : "On-site"}
                        </span>

                        <span>{job.experienceLevel}</span>

                        {job.skills?.slice(0, 2).map((skill) => (
                          <span key={skill}>
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="job-salary">
                      <strong>{formatSalary(job)}</strong>
                      <span>per year</span>
                    </div>
                  </article>
                ))
              ) : (
                <div className="empty-jobs">
                  <div>
                    <Search size={28} />
                  </div>

                  <h3>No jobs found</h3>

                  <p>
                    Try changing your search terms or removing
                    some filters.
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      setSearch("");
                      setLocation("");
                      clearFilters();
                      setSearchParams({});
                    }}
                  >
                    Reset Search
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Jobs;