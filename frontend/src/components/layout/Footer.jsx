
import React from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Mail } from "lucide-react";
import "./Footer.css";

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <footer className="footer">
      <div className="footer-grid" />
      <div className="footer-glow footer-glow-one" />
      <div className="footer-glow footer-glow-two" />

      <div className="container footer-container">

        {/* BRAND */}
        <div className="footer-brand">
          <Link to="/" className="footer-logo">
            <span className="footer-logo-box">J</span>
            <span>JOBSPHERE</span>
          </Link>

          <p className="footer-description">
            Connecting ambitious people with meaningful opportunities.
            Discover jobs, companies and careers built for what comes next.
          </p>

          <div className="footer-status">
            <span className="status-dot" />
            <span>Platform is live</span>
          </div>
        </div>

        {/* CANDIDATES */}
        <div className="footer-col">
          <span className="footer-index">01</span>

          <h3>Candidates</h3>

          <ul>
            <li>
              <Link to="/jobs">
                Search Jobs
                <ArrowUpRight size={14} />
              </Link>
            </li>

            <li>
              <Link to="/companies">
                Browse Companies
                <ArrowUpRight size={14} />
              </Link>
            </li>

            <li>
              <Link to="/dashboard">
                Dashboard
                <ArrowUpRight size={14} />
              </Link>
            </li>

            <li>
              <Link to="/saved-jobs">
                Saved Jobs
                <ArrowUpRight size={14} />
              </Link>
            </li>
          </ul>
        </div>

        {/* EMPLOYERS */}
        <div className="footer-col">
          <span className="footer-index">02</span>

          <h3>Employers</h3>

          <ul>
            <li>
              <Link to="/create-job">
                Post a Job
                <ArrowUpRight size={14} />
              </Link>
            </li>

            <li>
              <Link to="/manage-jobs">
                Manage Jobs
                <ArrowUpRight size={14} />
              </Link>
            </li>

            <li>
              <Link to="/recruiter-dashboard">
                Recruiter Dashboard
                <ArrowUpRight size={14} />
              </Link>
            </li>
          </ul>
        </div>

        {/* COMPANY */}
        <div className="footer-col">
          <span className="footer-index">03</span>

          <h3>Company</h3>

          <ul>
            <li>
              <Link to="/companies">
                Companies
                <ArrowUpRight size={14} />
              </Link>
            </li>

            <li>
              <a href="mailto:hello@jobsphere.com">
                Contact
                <ArrowUpRight size={14} />
              </a>
            </li>

            <li>
              <a href="#">
                Privacy
                <ArrowUpRight size={14} />
              </a>
            </li>

            <li>
              <a href="#">
                Terms
                <ArrowUpRight size={14} />
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* BIG CTA */}
      <div className="container footer-cta">

        <div>
          <span className="footer-cta-label">
            YOUR NEXT MOVE
          </span>

          <h2>
            Build your
            <span> future.</span>
          </h2>
        </div>

        <Link to="/jobs" className="footer-cta-button">
          Explore Jobs
          <ArrowUpRight size={20} />
        </Link>

      </div>

      {/* BOTTOM */}
      <div className="footer-bottom">

        <div className="container footer-bottom-inner">

          <p>
            © {new Date().getFullYear()} JobSphere.
            All rights reserved.
          </p>

          <div className="footer-socials">

            <a
              href="mailto:hello@jobsphere.com"
              aria-label="Email"
            >
              <Mail size={17} />
            </a>

            <a
              href="#"
              aria-label="GitHub"
              className="text-social-icon"
            >
              GH
            </a>

            <a
              href="#"
              aria-label="LinkedIn"
              className="text-social-icon"
            >
              in
            </a>

          </div>

          <button
            type="button"
            className="back-top"
            onClick={scrollToTop}
          >
            BACK TO TOP
            <ArrowUpRight size={15} />
          </button>

        </div>

      </div>
    </footer>
  );
};

export default Footer;

