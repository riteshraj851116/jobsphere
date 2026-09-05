import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { getJobApplicants, updateApplicationStatus } from '../../services/applicationService';
import Loader from '../../components/common/Loader';
import Button from '../../components/common/Button';
import { Users, FileText, ArrowLeft, Mail, Calendar } from 'lucide-react';
import './Applicants.css';

const STATUS_OPTIONS = [
  { value: 'Under Review', label: 'Under Review', className: 'btn-review' },
  { value: 'Shortlisted', label: 'Shortlist', className: 'btn-shortlist' },
  { value: 'Interview', label: 'Interview', className: 'btn-interview' },
  { value: 'Selected', label: 'Select Candidate', className: 'btn-hire' },
  { value: 'Rejected', label: 'Reject', className: 'btn-reject' }
];

const Applicants = () => {
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const jobId = queryParams.get('jobId');

  const fetchApplicants = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getJobApplicants(jobId);
      setApplicants(res.data?.applications || res.applications || res.data || []);
    } catch (err) {
      setError('Failed to load applicants. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    fetchApplicants();
  }, [fetchApplicants]);

  const handleUpdateStatus = async (id, status, recruiterNote = "") => {
    try {
      setUpdatingId(id);
      await updateApplicationStatus(id, status, recruiterNote);
      setApplicants(prev =>
        prev.map(app => app._id === id ? { ...app, status, recruiterNote } : app)
      );
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status.');
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadge = (status) => {
    const map = {
      'Applied':      'status-applied',
      'Under Review': 'status-reviewing',
      'Reviewing':    'status-reviewing',
      'Shortlisted':  'status-shortlisted',
      'Interview':    'status-interview',
      'Selected':     'status-hired',
      'Hired':        'status-hired',
      'Rejected':     'status-rejected'
    };
    return (
      <span className={`app-status-badge ${map[status] || 'status-applied'}`}>
        {status || 'Applied'}
      </span>
    );
  };

  if (!jobId) {
    return (
      <div className="applicants-no-job">
        <div className="no-job-card">
          <Users size={48} className="no-job-icon" />
          <h2>No Job Selected</h2>
          <p>Please select a job from Manage Jobs to view its applicants.</p>
          <Link to="/manage-jobs" className="btn btn--primary btn--md">
            <ArrowLeft size={16} /> Go to Manage Jobs
          </Link>
        </div>
      </div>
    );
  }

  if (loading) return <Loader />;

  return (
    <div className="applicants-page">
      <div className="container">
        <div className="applicants-header">
          <div>
            <Link to="/manage-jobs" className="back-link mb-2">
              <ArrowLeft size={16} /> Back to Jobs
            </Link>
            <h1>Applicants</h1>
            <p className="text-muted">
              {applicants.length > 0
                ? `${applicants.length} application${applicants.length !== 1 ? 's' : ''}`
                : 'No applications yet'
              }
            </p>
          </div>
        </div>

        {error && <div className="applicants-error">{error}</div>}

        {applicants.length > 0 ? (
          <div className="applicants-list">
            {applicants.map(app => (
              <div key={app._id} className="applicant-card">
                <div className="applicant-top">
                  <div className="applicant-identity">
                    <div className="applicant-avatar" aria-hidden="true">
                      {app.applicant?.name?.charAt(0)?.toUpperCase() || 'A'}
                    </div>
                    <div className="applicant-info">
                      <h3 className="applicant-name">
                        {app.applicant?.name || 'Unknown Candidate'}
                      </h3>
                      {app.applicant?.headline && (
                        <p className="applicant-headline">{app.applicant.headline}</p>
                      )}
                      <div className="applicant-meta">
                        {app.applicant?.email && (
                          <span className="applicant-meta-item">
                            <Mail size={14} /> {app.applicant.email}
                          </span>
                        )}
                        <span className="applicant-meta-item">
                          <Calendar size={14} />
                          Applied {new Date(app.appliedAt || app.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="applicant-status-col">
                    {getStatusBadge(app.status)}
                  </div>
                </div>

                {app.coverLetter && (
                  <div className="applicant-cover-letter">
                    <p>{app.coverLetter}</p>
                  </div>
                )}

                <div className="applicant-actions flex flex-wrap gap-2 items-center justify-between mt-4 pt-4 border-t border-border-light">
                  <div className="flex gap-2">
                    {app.applicant?._id && (
                      <Link
                        to={`/messages?userId=${app.applicant._id}`}
                        className="btn btn--outline btn--sm flex items-center gap-1.5"
                      >
                        <Mail size={15} /> Message Candidate
                      </Link>
                    )}
                    {(app.resume || app.applicant?.resume) && (
                      <a
                        href={app.resume || app.applicant?.resume}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn--ghost btn--sm flex items-center gap-1.5"
                      >
                        <FileText size={15} /> Resume
                      </a>
                    )}
                  </div>
                  <div className="status-action-group flex gap-1.5">
                    {STATUS_OPTIONS.filter(opt => opt.value !== app.status).slice(0, 3).map(opt => (
                      <Button
                        key={opt.value}
                        variant="ghost"
                        size="sm"
                        className={opt.className || ''}
                        onClick={() => handleUpdateStatus(app._id, opt.value)}
                        disabled={updatingId === app._id}
                        loading={updatingId === app._id}
                      >
                        {opt.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="applicants-empty">
            <Users size={48} className="no-job-icon" />
            <h3>No Applicants Yet</h3>
            <p>Your job hasn't received any applications. Share the listing to attract more candidates.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Applicants;
