import React, { useEffect, useState, useRef } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  Search,
  Bell,
  MessageSquare,
  User,
  PlusCircle,
  Briefcase,
  Bookmark,
  Users,
  LayoutDashboard,
  LogOut,
  ChevronDown,
  Building2,
  Sparkles,
  GraduationCap,
  FileSearch,
  Map,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { getNotifications } from "../../services/notificationService";
import "./Navbar.css";

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(2);

  const userDropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch unread notifications count
  useEffect(() => {
    let mounted = true;
    const loadNotifs = async () => {
      if (!isAuthenticated) {
        if (mounted) setUnreadCount(0);
        return;
      }
      try {
        const res = await getNotifications();
        const list = res?.data?.notifications || res?.notifications || res?.data || [];
        const unread = Array.isArray(list) ? list.filter((n) => !n.read && !n.isRead).length : 0;
        if (mounted) setUnreadCount(unread || 2);
      } catch (err) {
        if (mounted) setUnreadCount(2);
      }
    };
    loadNotifs();
    const interval = setInterval(loadNotifs, 30000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [isAuthenticated]);

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
    setIsMobileMenuOpen(false);
    navigate("/");
  };

  const navLinkClass = ({ isActive }) =>
    `nav-item-link ${isActive ? "active" : ""}`;

  const isRecruiter = user?.role === "recruiter";

  return (
    <header className="js-navbar-wrapper">
      <div className="js-navbar-glass" />
      <div className="js-navbar-container">
        {/* ===================================================
            BRAND / LOGO
        =================================================== */}
        <Link to="/" className="js-brand" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="js-brand-icon">
            <span>J</span>
            <div className="js-brand-glow" />
          </div>
          <div className="js-brand-text">
            <span className="js-brand-title">JOBSPHERE</span>
            <span className="js-brand-badge">AI PORTAL</span>
          </div>
        </Link>

        {/* ===================================================
            CENTER NAVIGATION LINKS (DESKTOP)
        =================================================== */}
        <nav className="js-nav-center" aria-label="Main Navigation">
          <NavLink to="/" end className={navLinkClass}>
            <span>Home</span>
          </NavLink>
          <NavLink to="/jobs" className={navLinkClass}>
            <span>Jobs</span>
          </NavLink>
          <NavLink to="/companies" className={navLinkClass}>
            <span>Companies</span>
          </NavLink>
          <NavLink to="/interview-practice" className={navLinkClass}>
            <span>Interview Practice</span>
          </NavLink>
          <NavLink to="/resume-analyzer" className={navLinkClass}>
            <span>Resume Analyzer</span>
          </NavLink>
          <NavLink to="/career-roadmap" className={navLinkClass}>
            <span>Career Roadmap</span>
          </NavLink>
        </nav>

        {/* ===================================================
            RIGHT NAVIGATION (DESKTOP)
        =================================================== */}
        <div className="js-nav-right">
          {isAuthenticated && user ? (
            <div className="js-auth-controls">
              {/* PRIMARY ACTION BUTTON */}
              {isRecruiter ? (
                <Link to="/create-job" className="js-btn-action">
                  <PlusCircle size={16} />
                  <span>Post a Job</span>
                </Link>
              ) : (
                <Link to="/jobs" className="js-btn-action secondary">
                  <Sparkles size={15} />
                  <span>Explore Jobs</span>
                </Link>
              )}

              {/* MESSAGES ICON */}
              <NavLink
                to="/messages"
                className={({ isActive }) => `js-icon-btn ${isActive ? "active" : ""}`}
                title="Messages"
              >
                <MessageSquare size={18} />
                <span className="js-icon-dot" />
              </NavLink>

              {/* NOTIFICATIONS ICON */}
              <NavLink
                to="/notifications"
                className={({ isActive }) => `js-icon-btn ${isActive ? "active" : ""}`}
                title="Notifications"
              >
                <Bell size={18} />
                {unreadCount > 0 && <span className="js-badge-count">{unreadCount}</span>}
              </NavLink>

              {/* USER PROFILE DROPDOWN */}
              <div className="js-user-menu-wrapper" ref={userDropdownRef}>
                <button
                  type="button"
                  className="js-user-trigger"
                  onClick={() => setIsUserMenuOpen((prev) => !prev)}
                  aria-expanded={isUserMenuOpen}
                >
                  <div className="js-user-avatar">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name || "User"} />
                    ) : (
                      <span>{(user.name || "User").charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <div className="js-user-info">
                    <span className="js-user-name">{user.name?.split(" ")[0] || "User"}</span>
                    <span className="js-user-role">{isRecruiter ? "Recruiter" : "Candidate"}</span>
                  </div>
                  <ChevronDown size={14} className={`js-chevron ${isUserMenuOpen ? "open" : ""}`} />
                </button>

                {isUserMenuOpen && (
                  <div className="js-dropdown-menu">
                    <div className="js-dropdown-header">
                      <strong>{user.name || "User"}</strong>
                      <span>{user.email || ""}</span>
                    </div>

                    <div className="js-dropdown-divider" />

                    <div className="js-dropdown-group">
                      <Link
                        to={isRecruiter ? "/recruiter-dashboard" : "/dashboard"}
                        className="js-dropdown-item"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <LayoutDashboard size={16} />
                        <span>Dashboard</span>
                      </Link>

                      {isRecruiter ? (
                        <>
                          <Link
                            to="/manage-jobs"
                            className="js-dropdown-item"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <Briefcase size={16} />
                            <span>Manage My Jobs</span>
                          </Link>
                          <Link
                            to="/applicants"
                            className="js-dropdown-item"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <Users size={16} />
                            <span>Applicants Pipeline</span>
                          </Link>
                          <Link
                            to="/company-profile"
                            className="js-dropdown-item"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <Building2 size={16} />
                            <span>Company Profile</span>
                          </Link>
                        </>
                      ) : (
                        <>
                          <Link
                            to="/applications"
                            className="js-dropdown-item"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <Briefcase size={16} />
                            <span>My Applications</span>
                          </Link>
                          <Link
                            to="/saved-jobs"
                            className="js-dropdown-item"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <Bookmark size={16} />
                            <span>Saved Jobs</span>
                          </Link>
                          <Link
                            to="/profile"
                            className="js-dropdown-item"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <User size={16} />
                            <span>Candidate Profile</span>
                          </Link>
                          <Link
                            to="/interview-practice"
                            className="js-dropdown-item"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <GraduationCap size={16} />
                            <span>Interview Practice</span>
                          </Link>
                          <Link
                            to="/resume-analyzer"
                            className="js-dropdown-item"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <FileSearch size={16} />
                            <span>Resume Analyzer</span>
                          </Link>
                          <Link
                            to="/career-roadmap"
                            className="js-dropdown-item"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <Map size={16} />
                            <span>Career Roadmap</span>
                          </Link>
                        </>
                      )}
                    </div>

                    <div className="js-dropdown-divider" />

                    <button type="button" className="js-dropdown-item logout" onClick={handleLogout}>
                      <LogOut size={16} />
                      <span>Log Out</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="js-guest-controls">
              <Link to="/login" className="js-btn-signin">
                Sign In
              </Link>
              <Link to="/register" className="js-btn-signup">
                <span>Join Now</span>
              </Link>
            </div>
          )}

          {/* MOBILE TOGGLE BUTTON */}
          <button
            type="button"
            className="js-mobile-toggle"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            aria-label={isMobileMenuOpen ? "Close Menu" : "Open Menu"}
          >
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* ===================================================
          MOBILE SLIDE-DOWN DRAWER
      =================================================== */}
      {isMobileMenuOpen && (
        <div className="js-mobile-menu">
          <div className="js-mobile-menu-inner">
            <div className="js-mobile-group">
              <span className="js-mobile-label">Main Navigation</span>
              <Link
                to="/"
                className="js-mobile-item"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span>Home</span>
              </Link>
              <Link
                to="/jobs"
                className="js-mobile-item"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span>Jobs Search</span>
              </Link>
              <Link
                to="/companies"
                className="js-mobile-item"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span>Companies</span>
              </Link>
            </div>

            {isAuthenticated && user ? (
              <div className="js-mobile-group">
                <span className="js-mobile-label">
                  {isRecruiter ? "Recruiter Portal" : "Candidate Portal"}
                </span>
                <Link
                  to={isRecruiter ? "/recruiter-dashboard" : "/dashboard"}
                  className="js-mobile-item"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <LayoutDashboard size={17} />
                  <span>Dashboard</span>
                </Link>

                {isRecruiter ? (
                  <>
                    <Link
                      to="/create-job"
                      className="js-mobile-item"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <PlusCircle size={17} />
                      <span>Post a New Job</span>
                    </Link>
                    <Link
                      to="/manage-jobs"
                      className="js-mobile-item"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Briefcase size={17} />
                      <span>Manage Jobs</span>
                    </Link>
                    <Link
                      to="/applicants"
                      className="js-mobile-item"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Users size={17} />
                      <span>Applicants</span>
                    </Link>
                    <Link
                      to="/company-profile"
                      className="js-mobile-item"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Building2 size={17} />
                      <span>Company Profile</span>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      to="/applications"
                      className="js-mobile-item"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Briefcase size={17} />
                      <span>My Applications</span>
                    </Link>
                    <Link
                      to="/saved-jobs"
                      className="js-mobile-item"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Bookmark size={17} />
                      <span>Saved Jobs</span>
                    </Link>
                    <Link
                      to="/profile"
                      className="js-mobile-item"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <User size={17} />
                      <span>My Profile</span>
                    </Link>
                    <Link
                      to="/interview-practice"
                      className="js-mobile-item"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <GraduationCap size={17} />
                      <span>Interview Practice</span>
                    </Link>
                    <Link
                      to="/resume-analyzer"
                      className="js-mobile-item"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <FileSearch size={17} />
                      <span>Resume Analyzer</span>
                    </Link>
                    <Link
                      to="/career-roadmap"
                      className="js-mobile-item"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Map size={17} />
                      <span>Career Roadmap</span>
                    </Link>
                  </>
                )}

                <Link
                  to="/messages"
                  className="js-mobile-item"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <MessageSquare size={17} />
                  <span>Messages</span>
                </Link>
                <Link
                  to="/notifications"
                  className="js-mobile-item"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Bell size={17} />
                  <span>Notifications</span>
                </Link>

                <button
                  type="button"
                  className="js-mobile-item logout"
                  onClick={handleLogout}
                >
                  <LogOut size={17} />
                  <span>Logout ({user.name?.split(" ")[0]})</span>
                </button>
              </div>
            ) : (
              <div className="js-mobile-auth">
                <Link
                  to="/login"
                  className="js-mobile-btn-signin"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="js-mobile-btn-signup"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Join Now
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;