import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getMyApplications } from '../../services/applicationService';
import { getSavedJobs } from '../../services/userService';
import { Briefcase, Bookmark, CheckCircle, Clock, Search } from 'lucide-react';
import './Dashboard.css';

const STAT_STATUS_MAP = {
  applied:     { label: 'Applied',     color: 'stat-blue' },
  reviewing:   { label: 'Reviewing',   color: 'stat-yellow' },
  shortlisted: { label: 'Shortlisted', color: 'stat-purple' },
  interview:   { label: 'Interview',   color: 'stat-indigo' },
  hired:       { label: 'Hired',       color: 'stat-green' },
  rejected:    { label: 'Rejected',    color: 'stat-red' }
};

const Dashboard = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [savedCount, setSavedCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [appRes, savedRes] = await Promise.allSettled([
        getMyApplications(),
        getSavedJobs()
      ]);

      if (appRes.status === 'fulfilled') {
        const apps = appRes.value.data?.applications || [];
        setApplications(apps);
      }
      if (savedRes.status === 'fulfilled') {
        const saved = savedRes.value.data?.savedJobs || [];
        setSavedCount(saved.length);
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const s = status?.toLowerCase() || 'applied';
    const cfg = STAT_STATUS_MAP[s] || STAT_STATUS_MAP.applied;
    return <span className={`app-badge ${cfg.color}`}>{status}</span>;
  };

  const totalApps = applications.length;
  const shortlisted = applications.filter(a => a.status?.toLowerCase() === 'shortlisted').length;
  const interviews = applications.filter(a => a.status?.toLowerCase() === 'interview').length;

  return (
    <div className="dashboard-page">
      <div className="container dashboard-container">

        {/* Sidebar */}
        <aside className="dashboard-sidebar">
          <div className="user-profile-card">
            <div className="user-avatar" aria-hidden="true">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <h4>{user?.name || 'User'}</h4>
            <span className="user-email">{user?.email}</span>
          </div>

          <nav className="dashboard-nav" aria-label="Dashboard navigation">
            <Link to="/dashboard" className="dash-nav-item dash-nav-item--active">
              <Briefcase size={18} /> Dashboard
            </Link>
            <Link to="/applications" className="dash-nav-item">
              <CheckCircle size={18} /> My Applications
            </Link>
            <Link to="/saved-jobs" className="dash-nav-item">
              <Bookmark size={18} /> Saved Jobs
            </Link>
            <Link to="/profile" className="dash-nav-item">
              <Clock size={18} /> My Profile
            </Link>
            <Link to="/jobs" className="dash-nav-item dash-nav-item--cta">
              <Search size={18} /> Browse Jobs
            </Link>
          </nav>
        </aside>

        {/* Main */}
        <main className="dashboard-main">
          <div className="dashboard-header">
            <h1>Welcome back, {user?.name?.split(' ')[0] || 'User'}!</h1>
            <p className="text-muted">Here's an overview of your job search activity.</p>
          </div>

          {/* Stats Grid */}
          <div className="stats-grid">
            <div className="stat-card stat-card--blue">
              <div className="stat-icon">
                <Briefcase size={22} />
              </div>
              <div className="stat-body">
                <span className="stat-value">{loading ? '—' : totalApps}</span>
                <span className="stat-label">Total Applications</span>
              </div>
            </div>

            <div className="stat-card stat-card--purple">
              <div className="stat-icon">
                <CheckCircle size={22} />
              </div>
              <div className="stat-body">
                <span className="stat-value">{loading ? '—' : shortlisted}</span>
                <span className="stat-label">Shortlisted</span>
              </div>
            </div>

            <div className="stat-card stat-card--green">
              <div className="stat-icon">
                <Clock size={22} />
              </div>
              <div className="stat-body">
                <span className="stat-value">{loading ? '—' : interviews}</span>
                <span className="stat-label">Interviews</span>
              </div>
            </div>

            <div className="stat-card stat-card--orange">
              <div className="stat-icon">
                <Bookmark size={22} />
              </div>
              <div className="stat-body">
                <span className="stat-value">{loading ? '—' : savedCount}</span>
                <span className="stat-label">Saved Jobs</span>
              </div>
            </div>
          </div>

          {/* Recent Applications */}
          <div className="dashboard-section">
            <div className="section-header">
              <h3>Recent Applications</h3>
              <Link to="/applications" className="section-link">View all →</Link>
            </div>

            {loading ? (
              <div className="recent-apps-loading">
                {[1, 2, 3].map(i => (
                  <div key={i} className="app-skeleton">
                    <div className="skeleton sk-logo" />
                    <div className="sk-body">
                      <div className="skeleton sk-title" />
                      <div className="skeleton sk-sub" />
                    </div>
                  </div>
                ))}
              </div>
            ) : applications.length > 0 ? (
              <div className="recent-apps-list">
                {applications.slice(0, 5).map(app => (
                  <div key={app._id} className="recent-app-item">
                    <div className="recent-app-logo">
                      {app.company?.logo
                        ? <img src={app.company.logo} alt={app.company.name} />
                        : <span>{app.company?.name?.charAt(0) || 'C'}</span>
                      }
                    </div>
                    <div className="recent-app-info">
                      <Link to={`/jobs/${app.job?._id}`} className="recent-app-title">
                        {app.job?.title || 'Unknown Job'}
                      </Link>
                      <span className="recent-app-company">{app.company?.name || 'Unknown Company'}</span>
                    </div>
                    <div className="recent-app-right">
                      {getStatusBadge(app.status)}
                      <span className="recent-app-date">
                        {new Date(app.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="dash-empty-state">
                <Briefcase size={32} className="dash-empty-icon" />
                <p>You haven't applied to any jobs yet.</p>
                <Link to="/jobs" className="btn btn--primary btn--sm">Browse Jobs</Link>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
