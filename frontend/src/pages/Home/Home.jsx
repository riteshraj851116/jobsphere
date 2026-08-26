
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  Search,
  MapPin,
  Briefcase,
  TrendingUp,
  CheckCircle,
  ArrowUpRight,
  Users,
  Building2,
  Code2,
  Palette,
  Megaphone,
  DollarSign,
  Handshake,
  Database,
  Settings,
} from "lucide-react";

import JobSphere3D from "./JobSphere3D";
import "./Home.css";

const CATEGORIES = [
  {
    name: "Software Development",
    icon: Code2,
    count: "2,840+ jobs",
  },
  {
    name: "Design",
    icon: Palette,
    count: "1,240+ jobs",
  },
  {
    name: "Marketing",
    icon: Megaphone,
    count: "980+ jobs",
  },
  {
    name: "Finance",
    icon: DollarSign,
    count: "760+ jobs",
  },
  {
    name: "Sales",
    icon: Handshake,
    count: "1,120+ jobs",
  },
  {
    name: "Human Resources",
    icon: Users,
    count: "540+ jobs",
  },
  {
    name: "Data",
    icon: Database,
    count: "890+ jobs",
  },
  {
    name: "Operations",
    icon: Settings,
    count: "670+ jobs",
  },
];

const POPULAR_SEARCHES = [
  "React Developer",
  "UI/UX Designer",
  "Product Manager",
];

const Home = () => {
  const navigate = useNavigate();

  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");

  const handleSearch = (event) => {
    event.preventDefault();

    const params = new URLSearchParams();

    const cleanKeyword = keyword.trim();
    const cleanLocation = location.trim();

    if (cleanKeyword) {
      params.set("search", cleanKeyword);
    }

    if (cleanLocation) {
      params.set("location", cleanLocation);
    }

    const query = params.toString();

    navigate(query ? `/jobs?${query}` : "/jobs");
  };

  const handlePopularSearch = (term) => {
    navigate(
      `/jobs?search=${encodeURIComponent(term)}`
    );
  };

  const handleCategoryClick = (category) => {
    navigate(
      `/jobs?search=${encodeURIComponent(category)}`
    );
  };

  return (
    <main className="home-page">

      {/* =====================================================
          HERO BACKGROUND
      ===================================================== */}

      <div
        className="hero-grid"
        aria-hidden="true"
      />

      <div
        className="hero-noise"
        aria-hidden="true"
      />

      <div
        className="hero-orb hero-orb-one"
        aria-hidden="true"
      />

      <div
        className="hero-orb hero-orb-two"
        aria-hidden="true"
      />

      {/* =====================================================
          HERO
      ===================================================== */}

      <section
        className="hero-section"
        aria-label="JobSphere job search"
      >

        <div className="container hero-container">

          {/* =================================================
              LEFT CONTENT
          ================================================= */}

          <div className="hero-content">

            <div className="hero-eyebrow">
              <span className="hero-eyebrow-dot" />
              Career opportunities
            </div>

            <h1 className="hero-title">
              <span>Find your</span>
              <span className="hero-title-muted">
                next move.
              </span>
            </h1>

            <p className="hero-subtitle">
              Discover meaningful opportunities from
              companies looking for talented people.
              Search jobs, explore companies and take
              the next step in your career.
            </p>

            {/* =================================================
                SEARCH
            ================================================= */}

            <form
              className="hero-search-box"
              onSubmit={handleSearch}
              aria-label="Search for jobs"
            >

              <div className="hero-search-fields">

                {/* KEYWORD */}

                <div className="hero-search-field">

                  <Search
                    size={19}
                    className="hero-search-icon"
                    aria-hidden="true"
                  />

                  <div className="hero-input-content">

                    <span>SEARCH</span>

                    <input
                      type="text"
                      value={keyword}
                      onChange={(event) =>
                        setKeyword(event.target.value)
                      }
                      placeholder="Job title, skill or keyword"
                      aria-label="Job title, skill or keyword"
                    />

                  </div>

                </div>

                <div
                  className="hero-search-divider"
                  aria-hidden="true"
                />

                {/* LOCATION */}

                <div className="hero-search-field">

                  <MapPin
                    size={19}
                    className="hero-search-icon"
                    aria-hidden="true"
                  />

                  <div className="hero-input-content">

                    <span>LOCATION</span>

                    <input
                      type="text"
                      value={location}
                      onChange={(event) =>
                        setLocation(event.target.value)
                      }
                      placeholder="City, state or remote"
                      aria-label="Job location"
                    />

                  </div>

                </div>

              </div>

              {/* SEARCH BUTTON */}

              <button
                type="submit"
                className="hero-search-btn"
              >
                <Search
                  size={17}
                  strokeWidth={2.2}
                />

                <span>Find Jobs</span>

                <ArrowUpRight
                  size={16}
                  strokeWidth={2.2}
                />
              </button>

            </form>

            {/* =================================================
                POPULAR
            ================================================= */}

            <div className="hero-popular">

              <span className="popular-label">
                Popular
              </span>

              {POPULAR_SEARCHES.map((term) => (
                <button
                  key={term}
                  type="button"
                  className="popular-tag"
                  onClick={() =>
                    handlePopularSearch(term)
                  }
                >
                  {term}
                </button>
              ))}

            </div>

          </div>

          {/* =================================================
              THREE.JS VISUAL
          ================================================= */}

          <div
            className="hero-visual"
            aria-hidden="true"
          >

            <div className="hero-3d">

              <JobSphere3D />

            </div>

            {/* TOP LABEL */}

            <div className="hero-3d-label hero-3d-label-top">

              <span className="label-dot" />

              10K+ OPEN ROLES

            </div>

            {/* BOTTOM LABEL */}

            <div className="hero-3d-label hero-3d-label-bottom">

              <TrendingUp size={14} />

              GROW YOUR CAREER

            </div>

            {/* FLOATING CARD */}

            <div className="floating-card floating-card-one">

              <div className="floating-icon">
                <Briefcase size={18} />
              </div>

              <div>
                <strong>10,000+</strong>
                <span>Active jobs</span>
              </div>

            </div>

            {/* FLOATING CARD */}

            <div className="floating-card floating-card-two">

              <div className="floating-icon">
                <Building2 size={18} />
              </div>

              <div>
                <strong>500+</strong>
                <span>Companies hiring</span>
              </div>

            </div>

          </div>

        </div>

      </section>

      {/* =====================================================
          STATS
      ===================================================== */}

      <section
        className="stats-section"
        aria-label="JobSphere statistics"
      >

        <div className="container stats-container">

          <div className="stat-item">
            <strong>10K+</strong>
            <span>Active Jobs</span>
          </div>

          <div className="stat-divider" />

          <div className="stat-item">
            <strong>500+</strong>
            <span>Companies</span>
          </div>

          <div className="stat-divider" />

          <div className="stat-item">
            <strong>50K+</strong>
            <span>Job Seekers</span>
          </div>

          <div className="stat-divider" />

          <div className="stat-item">
            <strong>95%</strong>
            <span>Success Rate</span>
          </div>

        </div>

      </section>

      {/* =====================================================
          CATEGORIES
      ===================================================== */}

      <section
        className="categories-section section"
        aria-label="Browse jobs by category"
      >

        <div className="container">

          <div className="section-header">

            <div>

              <span className="section-eyebrow">
                <span className="label-dot" />
                Explore opportunities
              </span>

              <h2 className="section-title">
                Browse by
                <span> category.</span>
              </h2>

              <p className="section-desc">
                Find roles across industries and
                skills that matter to your career.
              </p>

            </div>

            <Link
              to="/jobs"
              className="section-cta"
            >
              View all jobs
              <ArrowUpRight size={16} />
            </Link>

          </div>

          <div className="categories-grid">

            {CATEGORIES.map((category, index) => {

              const Icon = category.icon;

              return (
                <button
                  key={category.name}
                  type="button"
                  className="category-card"
                  style={{
                    "--category-index": index,
                  }}
                  onClick={() =>
                    handleCategoryClick(
                      category.name
                    )
                  }
                  aria-label={`Browse ${category.name} jobs`}
                >

                  <div className="category-top">

                    <div className="category-icon">
                      <Icon size={23} />
                    </div>

                    <ArrowUpRight
                      size={18}
                      className="category-arrow"
                    />

                  </div>

                  <div className="category-bottom">

                    <h3>
                      {category.name}
                    </h3>

                    <span>
                      {category.count}
                    </span>

                  </div>

                  <div className="category-hover-line" />

                </button>
              );
            })}

          </div>

        </div>

      </section>

      {/* =====================================================
          HOW IT WORKS
      ===================================================== */}

      <section
        className="how-section section"
        aria-label="How JobSphere works"
      >

        <div className="container">

          <div className="how-header">

            <span className="section-eyebrow">
              <span className="label-dot" />
              Simple process
            </span>

            <h2 className="section-title">
              From search to
              <span> hired.</span>
            </h2>

            <p className="section-desc">
              Everything you need to discover
              your next opportunity in one
              simple workflow.
            </p>

          </div>

          <div className="how-steps">

            <div className="how-step">

              <span className="step-index">
                01 / 03
              </span>

              <div className="step-icon">
                <Search size={25} />
              </div>

              <h3>
                Search Jobs
              </h3>

              <p>
                Search thousands of opportunities
                using keywords, locations and
                useful filters.
              </p>

            </div>

            <div className="how-step">

              <span className="step-index">
                02 / 03
              </span>

              <div className="step-icon">
                <CheckCircle size={25} />
              </div>

              <h3>
                Apply Instantly
              </h3>

              <p>
                Apply to relevant positions with
                your JobSphere profile without
                unnecessary forms.
              </p>

            </div>

            <div className="how-step">

              <span className="step-index">
                03 / 03
              </span>

              <div className="step-icon">
                <TrendingUp size={25} />
              </div>

              <h3>
                Get Hired
              </h3>

              <p>
                Track applications, connect with
                recruiters and move closer to your
                next opportunity.
              </p>

            </div>

          </div>

        </div>

      </section>

      {/* =====================================================
          CTA
      ===================================================== */}

      <section
        className="cta-section"
        aria-label="Get started"
      >

        <div
          className="cta-grid"
          aria-hidden="true"
        />

        <div className="container cta-container">

          <div className="cta-content">

            <span className="section-eyebrow cta-eyebrow">
              <span className="label-dot" />
              Your next opportunity
            </span>

            <h2>
              Ready for your
              <br />
              <span>next move?</span>
            </h2>

            <p>
              Explore open positions and take
              the next step in your career.
            </p>

          </div>

          {/* CTA BUTTONS */}

          <div className="cta-actions">

            <button
              type="button"
              className="cta-primary"
              onClick={() => navigate("/jobs")}
            >
              <span>Browse Jobs</span>

              <ArrowUpRight
                size={18}
              />
            </button>

            <button
              type="button"
              className="cta-secondary"
              onClick={() =>
                navigate("/register")
              }
            >
              <span>Create Profile</span>

              <ArrowUpRight
                size={18}
              />
            </button>

          </div>

        </div>

      </section>

    </main>
  );
};

export default Home;

