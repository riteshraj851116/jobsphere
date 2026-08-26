import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyJobs, deleteJob, updateJob } from '../../services/jobService';
import Loader from '../../components/common/Loader';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { Briefcase, Edit, Trash2, Users, PlusCircle, MapPin, X } from 'lucide-react';
import './ManageJobs.css';

const EXP_LEVELS = ['Entry Level', 'Mid Level', 'Senior Level', 'Lead'];
const JOB_TYPES = ['Full Time', 'Part Time', 'Contract', 'Internship', 'Freelance'];

const ManageJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Edit Job Modal state
  const [editingJob, setEditingJob] = useState(null);
  const [editFormData, setEditFormData] = useState({
    title: '',
    location: '',
    jobType: 'Full Time',
    experienceLevel: 'Entry Level',
    salaryMin: '',
    salaryMax: '',
    status: 'active',
    description: ''
  });
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState('');

  useEffect(() => {
    fetchMyJobs();
  }, []);

  const fetchMyJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getMyJobs();
      setJobs(res.data?.jobs || []);
    } catch (err) {
      setError('Failed to load your job postings.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEditModal = (job) => {
    setEditingJob(job);
    setEditFormData({
      title: job.title || '',
      location: job.location || '',
      jobType: job.jobType || 'Full Time',
      experienceLevel: job.experienceLevel || 'Entry Level',
      salaryMin: job.salaryMin || '',
      salaryMax: job.salaryMax || '',
      status: job.status || 'active',
      description: job.description || ''
    });
    setUpdateError('');
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingJob) return;
    try {
      setUpdating(true);
      setUpdateError('');
      const res = await updateJob(editingJob._id, {
        title: editFormData.title.trim(),
        location: editFormData.location.trim(),
        jobType: editFormData.jobType,
        experienceLevel: editFormData.experienceLevel,
        salaryMin: Number(editFormData.salaryMin) || 0,
        salaryMax: Number(editFormData.salaryMax) || 0,
        status: editFormData.status,
        description: editFormData.description.trim()
      });

      const updated = res.data?.job || res.job;
      setJobs((prev) => prev.map((j) => (j._id === editingJob._id ? { ...j, ...updated } : j)));
      setEditingJob(null);
    } catch (err) {
      setUpdateError(err.response?.data?.message || 'Failed to update job posting.');
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this job? This cannot be undone.')) return;
    try {
      setDeletingId(id);
      await deleteJob(id);
      setJobs(prev => prev.filter(job => job._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete job.');
    } finally {
      setDeletingId(null);
    }
  };

  const getStatusBadge = (status) => {
    const map = {
      active: 'badge-active',
      closed: 'badge-closed',
      draft: 'badge-draft'
    };
    return (
      <span className={`mj-status-badge ${map[status] || 'badge-active'}`}>
        {status?.charAt(0).toUpperCase() + status?.slice(1) || 'Active'}
      </span>
    );
  };

  if (loading) return <Loader />;

  return (
    <div className="manage-jobs-page">
      <div className="container">
        <div className="manage-jobs-header">
          <div>
            <h1>Manage Jobs</h1>
            <p className="text-muted">
              {jobs.length > 0 ? `${jobs.length} job posting${jobs.length !== 1 ? 's' : ''}` : 'No active job postings'}
            </p>
          </div>
          <Link to="/create-job" className="btn btn--primary btn--md">
            <PlusCircle size={18} /> Post a Job
          </Link>
        </div>

        {error && <div className="manage-jobs-error">{error}</div>}

        {jobs.length > 0 ? (
          <div className="manage-jobs-list">
            {jobs.map(job => (
              <div key={job._id} className="manage-job-card">
                <div className="mj-left">
                  <div className="mj-company-logo">
                    {job.company?.logo
                      ? <img src={job.company.logo} alt={job.company.name} />
                      : <span>{job.company?.name?.charAt(0) || 'C'}</span>
                    }
                  </div>
                  <div className="mj-info">
                    <h3 className="mj-title">{job.title}</h3>
                    <div className="mj-meta">
                      <span className="mj-meta-item">
                        <Briefcase size={14} /> {job.jobType}
                      </span>
                      {job.location && (
                        <span className="mj-meta-item">
                          <MapPin size={14} /> {job.isRemote ? 'Remote' : job.location}
                        </span>
                      )}
                      <span className="mj-meta-item text-muted">
                        Posted {new Date(job.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mj-right">
                  {getStatusBadge(job.status)}
                  <Link
                    to={`/applicants?jobId=${job._id}`}
                    className="btn btn--outline btn--sm"
                    title="View applicants"
                  >
                    <Users size={15} /> Applicants
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    title="Edit job"
                    onClick={() => handleOpenEditModal(job)}
                    aria-label="Edit job"
                  >
                    <Edit size={15} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="delete-btn"
                    onClick={() => handleDelete(job._id)}
                    disabled={deletingId === job._id}
                    title="Delete job"
                    aria-label="Delete job"
                  >
                    <Trash2 size={15} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="manage-jobs-empty">
            <Briefcase size={48} className="empty-icon-svg" />
            <h3>No Job Postings Yet</h3>
            <p>You haven't posted any jobs. Start attracting candidates by creating your first posting.</p>
            <Link to="/create-job" className="btn btn--primary btn--md">
              <PlusCircle size={18} /> Post Your First Job
            </Link>
          </div>
        )}
      </div>

      {/* Edit Job Modal */}
      {editingJob && (
        <div className="modal-backdrop fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="modal-card bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl relative">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Edit Job Posting</h3>
              <button onClick={() => setEditingJob(null)} className="text-muted hover:text-dark">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="flex flex-col gap-4">
              <Input
                label="Job Title"
                value={editFormData.title}
                onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                required
              />

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Location"
                  value={editFormData.location}
                  onChange={(e) => setEditFormData({ ...editFormData, location: e.target.value })}
                  required
                />
                <div className="input-group">
                  <label className="input-label block text-sm font-semibold mb-1">Status</label>
                  <select
                    className="form-select w-full"
                    value={editFormData.status}
                    onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                  >
                    <option value="active">Active</option>
                    <option value="closed">Closed</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="input-group">
                  <label className="input-label block text-sm font-semibold mb-1">Job Type</label>
                  <select
                    className="form-select w-full"
                    value={editFormData.jobType}
                    onChange={(e) => setEditFormData({ ...editFormData, jobType: e.target.value })}
                  >
                    {JOB_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="input-group">
                  <label className="input-label block text-sm font-semibold mb-1">Experience Level</label>
                  <select
                    className="form-select w-full"
                    value={editFormData.experienceLevel}
                    onChange={(e) => setEditFormData({ ...editFormData, experienceLevel: e.target.value })}
                  >
                    {EXP_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Min Salary (₹)"
                  type="number"
                  value={editFormData.salaryMin}
                  onChange={(e) => setEditFormData({ ...editFormData, salaryMin: e.target.value })}
                />
                <Input
                  label="Max Salary (₹)"
                  type="number"
                  value={editFormData.salaryMax}
                  onChange={(e) => setEditFormData({ ...editFormData, salaryMax: e.target.value })}
                />
              </div>

              <div>
                <label className="input-label block text-sm font-semibold mb-1">Description</label>
                <textarea
                  className="form-textarea w-full"
                  rows="4"
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  required
                />
              </div>

              {updateError && (
                <div className="error-alert text-sm">{updateError}</div>
              )}

              <div className="flex gap-3 justify-end mt-2">
                <Button type="button" variant="outline" onClick={() => setEditingJob(null)}>
                  Cancel
                </Button>
                <Button type="submit" loading={updating}>
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageJobs;
