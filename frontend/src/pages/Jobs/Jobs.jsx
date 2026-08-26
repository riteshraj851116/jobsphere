import React, { useEffect, useMemo, useState } from "react";
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
import "./Jobs.css";

const JOBS = [
  {
    id: 1,
    title: "Frontend React Developer",
    company: "TechNova",
    location: "Bangalore, India",
    type: "Full Time",
    mode: "Remote",
    experience: "Mid Level",
    salary: "₹8L – ₹14L",
    posted: "2 days ago",
    category: "Software Development",
    skills: ["React", "JavaScript", "CSS"],
  },
  {
    id: 2,
    title: "MERN Stack Developer",
    company: "PixelForge",
    location: "Hyderabad, India",
    type: "Full Time",
    mode: "Hybrid",
    experience: "Entry Level",
    salary: "₹5L – ₹9L",
    posted: "1 day ago",
    category: "Software Development",
    skills: ["MongoDB", "Express", "React", "Node"],
  },
  {
    id: 3,
    title: "UI/UX Designer",
    company: "Northstar Studio",
    location: "Delhi, India",
    type: "Full Time",
    mode: "On-site",
    experience: "Mid Level",
    salary: "₹6L – ₹11L",
    posted: "3 days ago",
    category: "Design",
    skills: ["Figma", "UI Design", "UX Research"],
  },
  {
    id: 4,
    title: "Product Manager",
    company: "Orbit Labs",
    location: "Mumbai, India",
    type: "Full Time",
    mode: "Hybrid",
    experience: "Senior Level",
    salary: "₹14L – ₹22L",
    posted: "4 days ago",
    category: "Product",
    skills: ["Product Strategy", "Agile", "Analytics"],
  },
  {
    id: 5,
    title: "Backend Node.js Developer",
    company: "CloudPeak",
    location: "Pune, India",
    type: "Full Time",
    mode: "Remote",
    experience: "Mid Level",
    salary: "₹9L – ₹16L",
    posted: "5 days ago",
    category: "Software Development",
    skills: ["Node.js", "Express", "MongoDB"],
  },
  {
    id: 6,
    title: "Digital Marketing Specialist",
    company: "GrowthGrid",
    location: "Gurgaon, India",
    type: "Full Time",
    mode: "Hybrid",
    experience: "Entry Level",
    salary: "₹4L – ₹7L",
    posted: "6 days ago",
    category: "Marketing",
    skills: ["SEO", "Google Ads", "Analytics"],
  },
  {
    id: 7,
    title: "Data Analyst",
    company: "InsightWorks",
    location: "Chennai, India",
    type: "Full Time",
    mode: "On-site",
    experience: "Mid Level",
    salary: "₹7L – ₹12L",
    posted: "1 week ago",
    category: "Data",
    skills: ["SQL", "Python", "Power BI"],
  },
  {
    id: 8,
    title: "HR Business Partner",
    company: "PeopleFirst",
    location: "Noida, India",
    type: "Full Time",
    mode: "Hybrid",
    experience: "Senior Level",
    salary: "₹10L – ₹17L",
    posted: "1 week ago",
    category: "Human Resources",
    skills: ["Recruitment", "HR", "People Ops"],
  },
];

const FILTERS = {
  type: ["Full Time", "Part Time", "Contract", "Internship"],
  mode: ["Remote", "Hybrid", "On-site"],
  experience: ["Entry Level", "Mid Level", "Senior Level"],
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

  useEffect(() => {
    setSearch(initialSearch);
    setLocation(initialLocation);
  }, [initialSearch, initialLocation]);

  const filteredJobs = useMemo(() => {
    const searchValue = search.trim().toLowerCase();
    const locationValue = location.trim().toLowerCase();

    let result = JOBS.filter((job) => {
      const searchableText = [
        job.title,
        job.company,
        job.category,
        ...job.skills,
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !searchValue || searchableText.includes(searchValue);

      const matchesLocation =
        !locationValue ||
        job.location.toLowerCase().includes(locationValue) ||
        job.mode.toLowerCase().includes(locationValue);

      const matchesType =
        selectedFilters.type.length === 0 ||
        selectedFilters.type.includes(job.type);

      const matchesMode =
        selectedFilters.mode.length === 0 ||
        selectedFilters.mode.includes(job.mode);

      const matchesExperience =
        selectedFilters.experience.length === 0 ||
        selectedFilters.experience.includes(job.experience);

      return (
        matchesSearch &&
        matchesLocation &&
        matchesType &&
        matchesMode &&
        matchesExperience
      );
    });

    if (sort === "title") {
      result = [...result].sort((a, b) =>
        a.title.localeCompare(b.title)
      );
    }

    return result;
  }, [search, location, selectedFilters, sort]);

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

  const activeFilterCount =
    selectedFilters.type.length +
    selectedFilters.mode.length +
    selectedFilters.experience.length;

  return (
    <main className="jobs-page">
      <section className="jobs-hero">
        <div className="container">
          <div className="jobs-eyebrow">
            <span />
            JobSphere / Opportunities
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

            <button type="submit">
              <Search size={17} />
              Search Jobs
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
                  {filteredJobs.length}{" "}
                  {filteredJobs.length === 1
                    ? "position"
                    : "positions"}{" "}
                  found
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

            <div className="job-list">
              {filteredJobs.length > 0 ? (
                filteredJobs.map((job) => (
                  <article
                    className="job-card"
                    key={job.id}
                  >
                    <div className="job-company-icon">
                      <Building2 size={24} />
                    </div>

                    <div className="job-main">
                      <div className="job-card-top">
                        <div>
                          <Link
                            to={`/jobs/${job.id}`}
                            className="job-title"
                          >
                            {job.title}
                          </Link>

                          <div className="job-company">
                            {job.company}
                          </div>
                        </div>

                        <Link
                          to={`/jobs/${job.id}`}
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
                          {job.type}
                        </span>

                        <span>
                          <Clock3 size={14} />
                          {job.posted}
                        </span>
                      </div>

                      <div className="job-tags">
                        <span className="job-mode">
                          {job.mode}
                        </span>

                        <span>{job.experience}</span>

                        {job.skills
                          .slice(0, 2)
                          .map((skill) => (
                            <span key={skill}>
                              {skill}
                            </span>
                          ))}
                      </div>
                    </div>

                    <div className="job-salary">
                      <strong>{job.salary}</strong>
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