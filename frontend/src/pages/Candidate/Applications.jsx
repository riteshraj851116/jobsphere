import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyApplications } from '../../services/applicationService';
import Loader from '../../components/common/Loader';
import Button from '../../components/common/Button';
import { Briefcase, MapPin, ExternalLink, Calendar, Search } from 'lucide-react';
import './Applications.css';

const STATUS_COLORS = {
  applied:     'badge-info',
  reviewing:   'badge-warning',
  shortlisted: 'badge-primary',
  interview:   'badge-purple',
  hired:       'badge-success',
  rejected:    'badge-danger'
};

const Applications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getMyApplications();
      setApplications(res.data?.applications || []);
    } catch (err) {
      setError('Failed to load applications. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const key = status?.toLowerCase() || 'applied';
    const cls = STATUS_COLORS[key] || 'badge-info';
    return (
      <span className={`status-badge ${cls}`}>
        {status || 'Applied'}
      </span>
    );
  };

  if (loading) return <Loader />;

  return (
    <div className="candidate-applications-page">
      <div className="container apps-container">
        <div className="apps-header">
          <div>
            <h1>My Applications</h1>
            <p className="text-muted">Track the status of jobs you've applied to.</p>
          </div>
          <Link to="/jobs" className="btn btn--outline btn--md">
            <Search size={16} /> Find More Jobs
          </Link>
        </div>

        {error && (
          <div className="apps-error" role="alert">{error}</div>
        )}

        {applications.length > 0 ? (
          <div className="applications-list">
            {applications.map(app => (
              <div key={app._id} className="application-card">
                <div className="app-card-header">
                  <div className="app-company-info">
                    {app.company?.logo ? (
                      <img src={app.company.logo} alt={`${app.company.name} logo`} className="app-company-logo" />
                    ) : (
                      <div className="app-logo-placeholder" aria-hidden="true">
                        {app.company?.name?.charAt(0) || 'C'}
                      </div>
                    )}
                    <div className="app-title-group">
                      <h3>
                        <Link to={`/jobs/${app.job?._id}`} className="app-job-title">
                          {app.job?.title || 'Unknown Job'}
                        </Link>
                      </h3>
                      <span className="app-company-name">{app.company?.name || 'Unknown Company'}</span>
                    </div>
                  </div>
                  <div className="app-status-col">
                    {getStatusBadge(app.status)}
                  </div>
                </div>

                <div className="app-details-meta">
                  {app.job?.location && (
                    <div className="app-meta-chip">
                      <MapPin size={14} />
                      <span>{app.job.location}</span>
                    </div>
                  )}
                  {app.job?.jobType && (
                    <div className="app-meta-chip">
                      <Briefcase size={14} />
                      <span>{app.job.jobType}</span>
                    </div>
                  )}
                  <div className="app-meta-chip">
                    <Calendar size={14} />
                    <span>Applied {new Date(app.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="app-card-footer">
                  <span className="app-job-status-text">
                    {app.job?.status === 'closed'
                      ? '🔒 This job is now closed.'
                      : '✅ This job is currently active.'}
                  </span>
                  <Link to={`/jobs/${app.job?._id}`} className="view-job-link">
                    View Job <ExternalLink size={13} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="apps-empty-state">
            <Briefcase size={48} className="apps-empty-icon" />
            <h3>No Applications Yet</h3>
            <p>You haven't applied to any jobs. Start exploring opportunities!</p>
            <Link to="/jobs" className="btn btn--primary btn--md">Browse Jobs</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Applications;
