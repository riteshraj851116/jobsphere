import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Menu, X, Search, ArrowUpRight } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import Button from "../common/Button";
import "./Navbar.css";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    closeMobileMenu();
    navigate("/");
  };

  const navLinkClass = ({ isActive }) =>
    `navbar-link ${isActive ? "active" : ""}`;

  return (
    <nav className="navbar">
      {/* Background layers */}
      <div className="navbar-glow" />
      <div className="navbar-grid" />
      <div className="navbar-line" />

      <div className="container navbar-container">
        {/* ================= LOGO ================= */}
        <Link
          to="/"
          className="navbar-logo"
          onClick={closeMobileMenu}
        >
          <span className="navbar-logo-mark">
            <span>J</span>
          </span>

          <span className="navbar-logo-text">
            JOBSPHERE
          </span>
        </Link>

        {/* ================= CENTER NAV ================= */}
        <div className="navbar-center desktop-only">
          <NavLink to="/" end className={navLinkClass}>
            <span>Home</span>
          </NavLink>

          <NavLink to="/jobs" className={navLinkClass}>
            <span>Jobs</span>
          </NavLink>

          <NavLink to="/companies" className={navLinkClass}>
            <span>Companies</span>
          </NavLink>
        </div>

        {/* ================= RIGHT ================= */}
        <div className="navbar-right desktop-only">
          {user ? (
            <>
              <NavLink
                to={
                  user.role === "recruiter"
                    ? "/recruiter-dashboard"
                    : "/dashboard"
                }
                className={navLinkClass}
              >
                <span>Dashboard</span>
              </NavLink>

              {user.role === "user" && (
                <NavLink
                  to="/applications"
                  className={navLinkClass}
                >
                  <span>Applications</span>
                </NavLink>
              )}

              <NavLink
                to="/messages"
                className={navLinkClass}
              >
                <span>Messages</span>
              </NavLink>

              <NavLink
                to={
                  user.role === "recruiter"
                    ? "/company-profile"
                    : "/profile"
                }
                className={navLinkClass}
              >
                <span>Profile</span>
              </NavLink>

              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link
                to="/jobs"
                className="navbar-search"
                aria-label="Search jobs"
              >
                <Search size={17} strokeWidth={1.8} />
              </Link>

              <Link
                to="/login"
                className="navbar-link navbar-signin"
              >
                <span>Sign In</span>
              </Link>

              <Button
                size="sm"
                onClick={() => navigate("/register")}
              >
                Join Now
                <ArrowUpRight size={14} />
              </Button>
            </>
          )}
        </div>

        {/* ================= MOBILE BUTTON ================= */}
        <button
          type="button"
          className="navbar-mobile-button mobile-only"
          onClick={() =>
            setIsMobileMenuOpen((current) => !current)
          }
          aria-label={
            isMobileMenuOpen
              ? "Close navigation"
              : "Open navigation"
          }
          aria-expanded={isMobileMenuOpen}
        >
          {isMobileMenuOpen ? (
            <X size={21} strokeWidth={1.8} />
          ) : (
            <Menu size={21} strokeWidth={1.8} />
          )}
        </button>
      </div>

      {/* ================= MOBILE MENU ================= */}
      <div
        className={`navbar-mobile-menu ${
          isMobileMenuOpen
            ? "navbar-mobile-menu-open"
            : ""
        }`}
      >
        <div className="navbar-mobile-grid" />

        <div className="navbar-mobile-inner">
          <div className="mobile-menu-label">
            Navigation
          </div>

          <Link
            to="/"
            className="navbar-mobile-link"
            onClick={closeMobileMenu}
          >
            <span>01</span>
            Home
            <ArrowUpRight size={16} />
          </Link>

          <Link
            to="/jobs"
            className="navbar-mobile-link"
            onClick={closeMobileMenu}
          >
            <span>02</span>
            Jobs
            <ArrowUpRight size={16} />
          </Link>

          <Link
            to="/companies"
            className="navbar-mobile-link"
            onClick={closeMobileMenu}
          >
            <span>03</span>
            Companies
            <ArrowUpRight size={16} />
          </Link>

          <div className="navbar-mobile-line" />

          {user ? (
            <>
              <Link
                to={
                  user.role === "recruiter"
                    ? "/recruiter-dashboard"
                    : "/dashboard"
                }
                className="navbar-mobile-link"
                onClick={closeMobileMenu}
              >
                <span>04</span>
                Dashboard
                <ArrowUpRight size={16} />
              </Link>

              {user.role === "user" && (
                <Link
                  to="/applications"
                  className="navbar-mobile-link"
                  onClick={closeMobileMenu}
                >
                  <span>05</span>
                  Applications
                  <ArrowUpRight size={16} />
                </Link>
              )}

              <Link
                to="/messages"
                className="navbar-mobile-link"
                onClick={closeMobileMenu}
              >
                <span>06</span>
                Messages
                <ArrowUpRight size={16} />
              </Link>

              <Link
                to={
                  user.role === "recruiter"
                    ? "/company-profile"
                    : "/profile"
                }
                className="navbar-mobile-link"
                onClick={closeMobileMenu}
              >
                <span>07</span>
                Profile
                <ArrowUpRight size={16} />
              </Link>

              <button
                type="button"
                className="navbar-mobile-link navbar-logout"
                onClick={handleLogout}
              >
                <span>08</span>
                Logout
                <X size={16} />
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="navbar-mobile-link"
                onClick={closeMobileMenu}
              >
                <span>04</span>
                Sign In
                <ArrowUpRight size={16} />
              </Link>

              <Link
                to="/register"
                className="navbar-mobile-join"
                onClick={closeMobileMenu}
              >
                Join JobSphere
                <ArrowUpRight size={17} />
              </Link>
            </>
          )}

          <div className="mobile-menu-footer">
            <span>JOBSPHERE</span>
            <span>CAREER / OPPORTUNITY / FUTURE</span>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;