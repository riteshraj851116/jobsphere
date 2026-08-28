import React, { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Menu, X, Search, ArrowUpRight } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import Button from "../common/Button";
import { getNotifications } from "../../services/notificationService";
import "./Navbar.css";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    closeMobileMenu();
    navigate("/");
  };

  // FIX 1: Added backticks (``) for string interpolation
  const navLinkClass = ({ isActive }) =>
    `navbar-link ${isActive ? "active" : ""}`;

  useEffect(() => {
    let isMounted = true;
    const fetchNotifications = async () => {
      if (!user) {
        if (isMounted) {
          setUnreadNotificationCount(0);
        }
        return;
      }

      try {
        const response = await getNotifications();

        const notifications =
          response?.data?.notifications ||
          response?.notifications ||
          response?.data ||
          [];

        if (!Array.isArray(notifications)) {
          if (isMounted) {
            setUnreadNotificationCount(0);
          }
          return;
        }

        const unreadCount = notifications.filter(
          (notification) => !notification.isRead
        ).length;

        if (isMounted) {
          setUnreadNotificationCount(unreadCount);
        }
      } catch (error) {
        console.error("Failed to fetch notifications:", error);

        if (isMounted) {
          setUnreadNotificationCount(0);
        }
      }
    };

    fetchNotifications();

    const interval = setInterval(fetchNotifications, 30000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [user]);

  const notificationCountText =
    unreadNotificationCount > 99 ? "99+" : unreadNotificationCount;

  return (
    // FIX 2: Added opening <nav> tag to wrap all child elements
    <nav className="navbar">
      <div className="navbar-glow" />
      <div className="navbar-grid" />
      <div className="navbar-line" />

      <div className="container navbar-container">
        {/* =========================
            LOGO
        ========================= */}
        <Link to="/" className="navbar-logo" onClick={closeMobileMenu}>
          <span className="navbar-logo-mark">
            <span>J</span>
          </span>
          <span className="navbar-logo-text">JOBSPHERE</span>
        </Link>

        {/* =========================
            DESKTOP CENTER NAVIGATION
        ========================= */}
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

        {/* =========================
            DESKTOP RIGHT NAVIGATION
        ========================= */}
        <div className="navbar-right desktop-only">
          {user ? (
            <>
              {/* DASHBOARD */}
              <NavLink
                to={
                  user.role === "recruiter"
                    ? "/recruiter/dashboard"
                    : "/dashboard"
                }
                className={navLinkClass}
              >
                <span>Dashboard</span>
              </NavLink>

              {/* CANDIDATE LINKS */}
              {user.role !== "recruiter" && (
                <>
                  <NavLink to="/applications" className={navLinkClass}>
                    <span>Applications</span>
                  </NavLink>
                  <NavLink to="/saved-jobs" className={navLinkClass}>
                    <span>Saved</span>
                  </NavLink>
                </>
              )}

              {/* MESSAGES */}
              <NavLink to="/messages" className={navLinkClass}>
                <span>Messages</span>
              </NavLink>

              {/* NOTIFICATIONS */}
              <NavLink to="/notifications" className={navLinkClass}>
                <span>Notifications</span>
                {unreadNotificationCount > 0 && (
                  <span className="notification-text-badge">
                    {notificationCountText}
                  </span>
                )}
              </NavLink>

              {/* PROFILE */}
              <NavLink
                to={
                  user.role === "recruiter" ? "/recruiter/company" : "/profile"
                }
                className={navLinkClass}
              >
                <span>Profile</span>
              </NavLink>

              {/* LOGOUT */}
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link to="/jobs" className="navbar-search" aria-label="Search jobs">
                <Search size={17} strokeWidth={1.8} />
              </Link>
              <Link to="/login" className="navbar-link navbar-signin">
                <span>Sign In</span>
              </Link>
              <Button size="sm" onClick={() => navigate("/register")}>
                Join Now
                <ArrowUpRight size={14} />
              </Button>
            </>
          )}
        </div>

        {/* =========================
            MOBILE MENU BUTTON
        ========================= */}
        <button
          type="button"
          className="navbar-mobile-button mobile-only"
          onClick={() => setIsMobileMenuOpen((current) => !current)}
          aria-label={isMobileMenuOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={isMobileMenuOpen}
        >
          {isMobileMenuOpen ? (
            <X size={21} strokeWidth={1.8} />
          ) : (
            <Menu size={21} strokeWidth={1.8} />
          )}
        </button>
      </div>

      {/* =========================
          MOBILE MENU
      ========================= */}
      <div
        className={`navbar-mobile-menu ${
          isMobileMenuOpen ? "navbar-mobile-menu-open" : ""
        }`}
      >
        <div className="navbar-mobile-grid" />
        <div className="navbar-mobile-inner">
          <div className="mobile-menu-label">Navigation</div>

          <Link to="/" className="navbar-mobile-link" onClick={closeMobileMenu}>
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
              {/* DASHBOARD */}
              <Link
                to={
                  user.role === "recruiter"
                    ? "/recruiter/dashboard"
                    : "/dashboard"
                }
                className="navbar-mobile-link"
                onClick={closeMobileMenu}
              >
                <span>04</span>
                Dashboard
                <ArrowUpRight size={16} />
              </Link>

              {/* CANDIDATE LINKS */}
              {user.role !== "recruiter" && (
                <>
                  <Link
                    to="/applications"
                    className="navbar-mobile-link"
                    onClick={closeMobileMenu}
                  >
                    <span>05</span>
                    Applications
                    <ArrowUpRight size={16} />
                  </Link>
                  <Link
                    to="/saved-jobs"
                    className="navbar-mobile-link"
                    onClick={closeMobileMenu}
                  >
                    <span>06</span>
                    Saved Jobs
                    <ArrowUpRight size={16} />
                  </Link>
                </>
              )}

              {/* MESSAGES */}
              <Link
                to="/messages"
                className="navbar-mobile-link"
                onClick={closeMobileMenu}
              >
                <span>{user.role === "recruiter" ? "05" : "07"}</span>
                Messages
                <ArrowUpRight size={16} />
              </Link>

              {/* NOTIFICATIONS */}
              <Link
                to="/notifications"
                className="navbar-mobile-link"
                onClick={closeMobileMenu}
              >
                <span>{user.role === "recruiter" ? "06" : "08"}</span>
                Notifications
                {unreadNotificationCount > 0 && (
                  <span className="mobile-notification-count">
                    {notificationCountText}
                  </span>
                )}
                <ArrowUpRight size={16} />
              </Link>

              {/* PROFILE */}
              <Link
                to={
                  user.role === "recruiter" ? "/recruiter/company" : "/profile"
                }
                className="navbar-mobile-link"
                onClick={closeMobileMenu}
              >
                <span>{user.role === "recruiter" ? "07" : "09"}</span>
                Profile
                <ArrowUpRight size={16} />
              </Link>

              {/* LOGOUT */}
              <button
                type="button"
                className="navbar-mobile-link navbar-logout"
                onClick={handleLogout}
              >
                <span>{user.role === "recruiter" ? "08" : "10"}</span>
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