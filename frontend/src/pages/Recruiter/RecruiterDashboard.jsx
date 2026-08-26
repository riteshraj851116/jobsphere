import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getMyJobs } from '../../services/jobService';
import { PlusCircle, Briefcase, Users, BarChart2, Settings } from 'lucide-react';
import '../Dashboard/Dashboard.css';
import './RecruiterDashboard.css';

const RecruiterDashboard = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await getMyJobs();
      setJobs(res.data?.jobs || []);
    } catch (err) {
      console.error('Failed to load recruiter data', err);
    } finally {
      setLoading(false);
    }
  };

  const activeJobs = jobs.filter(j => j.status === 'active').length;

  return (
    <div className="recruiter-dashboard-page">
      <div className="container dashboard-container">

        {/* Sidebar */}
        <aside className="dashboard-sidebar">
          <div className="user-profile-card">
            <div className="user-avatar recruiter-avatar" aria-hidden="true">
              {user?.name?.charAt(0)?.toUpperCase() || 'R'}
            </div>
            <h4>{user?.name || 'Recruiter'}</h4>
            <span className="user-email">{user?.email}</span>
            <span className="recruiter-badge">Recruiter</span>
          </div>

          <nav className="dashboard-nav" aria-label="Recruiter navigation">
            <Link to="/recruiter-dashboard" className="dash-nav-item dash-nav-item--active">
              <BarChart2 size={18} /> Overview
            </Link>
            <Link to="/manage-jobs" className="dash-nav-item">
              <Briefcase size={18} /> Manage Jobs
            </Link>
            <Link to="/applicants" className="dash-nav-item">
              <Users size={18} /> Applicants
            </Link>
            <Link to="/company-profile" className="dash-nav-item">
              <Settings size={18} /> Company Profile
            </Link>
            <Link to="/create-job" className="dash-nav-item dash-nav-item--cta">
              <PlusCircle size={18} /> Post a Job
            </Link>
          </nav>
        </aside>

        {/* Main */}
        <main className="dashboard-main">
          <div className="dashboard-header">
            <h1>Recruiter Dashboard</h1>
            <p className="text-muted">Manage your job postings and track applicants.</p>
          </div>

          {/* Stats */}
          <div className="stats-grid recruiter-stats">
            <div className="stat-card stat-card--blue">
              <div className="stat-icon"><Briefcase size={22} /></div>
              <div className="stat-body">
                <span className="stat-value">{loading ? '—' : activeJobs}</span>
                <span className="stat-label">Active Jobs</span>
              </div>
            </div>

            <div className="stat-card stat-card--blue">
              <div className="stat-icon"><Briefcase size={22} /></div>
              <div className="stat-body">
                <span className="stat-value">{loading ? '—' : jobs.length}</span>
                <span className="stat-label">Total Postings</span>
              </div>
            </div>
          </div>

          {/* Recent Jobs */}
          <div className="dashboard-section">
            <div className="section-header">
              <h3>Recent Job Postings</h3>
              <Link to="/manage-jobs" className="section-link">View All →</Link>
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
            ) : jobs.length > 0 ? (
              <div className="recent-apps-list">
                {jobs.slice(0, 5).map(job => (
                  <div key={job._id} className="recent-app-item">
                    <div className="recent-app-logo">
                      {job.company?.logo
                        ? <img src={job.company.logo} alt={job.company.name} />
                        : <span>{job.company?.name?.charAt(0) || 'C'}</span>
                      }
                    </div>
                    <div className="recent-app-info">
                      <span className="recent-app-title">{job.title}</span>
                      <span className="recent-app-company">{job.jobType} · {job.location}</span>
                    </div>
                    <div className="recent-app-right">
                      <span className={`app-badge ${job.status === 'active' ? 'stat-green' : 'stat-red'}`}>
                        {job.status}
                      </span>
                      <span className="recent-app-date">{new Date(job.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="dash-empty-state">
                <Briefcase size={32} className="dash-empty-icon" />
                <p>You haven't posted any jobs yet.</p>
                <Link to="/create-job" className="btn btn--primary btn--sm">
                  <PlusCircle size={16} /> Post Your First Job
                </Link>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default RecruiterDashboard;
