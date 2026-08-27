import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createJob } from '../../services/jobService';
import { getMyCompanies } from '../../services/companyService';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { Building, PlusCircle, AlertCircle } from 'lucide-react';
import './CreateJob.css';

const JOB_TYPES = ['Full Time', 'Part Time', 'Contract', 'Internship', 'Freelance'];
const EXP_LEVELS = ['Entry Level', 'Mid Level', 'Senior Level', 'Lead'];
const CATEGORIES = [
  'Software Development', 'Design', 'Marketing', 'Finance',
  'Sales', 'Human Resources', 'Operations', 'Data', 'Engineering',
  'Product', 'Customer Support', 'Legal', 'Healthcare', 'Other'
];

const CreateJob = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    jobType: 'Full Time',
    experienceLevel: 'Entry Level',
    category: 'Software Development',
    salaryMin: '',
    salaryMax: '',
    isRemote: false,
    requirements: '',
    responsibilities: '',
    skills: '',
    openings: '1',
    company: '',
    deadline: ''
  });

  const [companies, setCompanies] = useState([]);
  const [companiesLoading, setCompaniesLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();

  // Fetch recruiter's companies
  useEffect(() => {
    fetchMyCompanies();
  }, []);

  const fetchMyCompanies = async () => {
    try {
      setCompaniesLoading(true);
      const res = await getMyCompanies();
      const all = res.data?.companies || [];
      setCompanies(all);
      // Pre-select first company if available
      if (all.length > 0) {
        setFormData(prev => ({ ...prev, company: all[0]._id }));
      }
    } catch (err) {
      console.error('Failed to fetch companies', err);
    } finally {
      setCompaniesLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title.trim()) { setError('Job title is required'); return; }
    if (!formData.description.trim()) { setError('Job description is required'); return; }
    if (!formData.location.trim()) { setError('Location is required'); return; }
    if (!formData.company) { setError('Please select a company, or create one first'); return; }

    const salaryMin = formData.salaryMin ? Number(formData.salaryMin) : 0;
    const salaryMax = formData.salaryMax ? Number(formData.salaryMax) : 0;
    if (salaryMin && salaryMax && salaryMax < salaryMin) {
      setError('Maximum salary cannot be less than minimum salary');
      return;
    }

    const jobData = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      location: formData.location.trim(),
      jobType: formData.jobType,
      experienceLevel: formData.experienceLevel,
      category: formData.category,
      salaryMin,
      salaryMax,
      isRemote: formData.isRemote,
      requirements: formData.requirements.split('\n').map(r => r.trim()).filter(Boolean),
      responsibilities: formData.responsibilities.split('\n').map(r => r.trim()).filter(Boolean),
      skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean),
      openings: Number(formData.openings) || 1,
      company: formData.company,
      deadline: formData.deadline || undefined
    };

    try {
      setLoading(true);
      await createJob(jobData);
      setSuccess(true);
      setTimeout(() => navigate('/manage-jobs'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create job. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="create-job-success">
        <div className="success-card">
          <div className="success-icon">✅</div>
          <h2>Job Posted!</h2>
          <p>Redirecting to your jobs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="create-job-page">
      <div className="container create-job-container">
        <div className="create-job-header">
          <h1>Post a New Job</h1>
          <p className="text-muted">Fill in the details to publish your job listing.</p>
        </div>

        {error && (
          <div className="create-job-error" role="alert">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        {/* Company Warning */}
        {!companiesLoading && companies.length === 0 && (
          <div className="no-company-warning">
            <Building size={20} />
            <div>
              <strong>No company profile found.</strong>
              <p>You must create a company profile before posting jobs.</p>
            </div>
            <Link to="/company-profile" className="btn btn--primary btn--sm">
              <PlusCircle size={16} /> Create Company
            </Link>
          </div>
        )}

        <form onSubmit={handleSubmit} className="create-job-form">
          {/* Company Selector */}
          <div className="form-card">
            <h3 className="form-section-title">Company</h3>
            <div className="form-group">
              <label className="form-label" htmlFor="company-select">Select Company *</label>
              {companiesLoading ? (
                <div className="skeleton" style={{ height: '42px', borderRadius: '8px' }} />
              ) : (
                <select
                  id="company-select"
                  name="company"
                  className="form-select"
                  value={formData.company}
                  onChange={handleChange}
                  required
                >
                  <option value="">— Select a company —</option>
                  {companies.map(c => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              )}
              {companies.length === 0 && !companiesLoading && (
                <span className="form-help">
                  <Link to="/company-profile" className="text-primary">Create your company profile</Link> first.
                </span>
              )}
            </div>
          </div>

          {/* Basic Info */}
          <div className="form-card">
            <h3 className="form-section-title">Job Details</h3>
            <div className="form-grid-2">
              <Input
                label="Job Title *"
                name="title"
                id="job-title"
                placeholder="e.g. Senior React Developer"
                value={formData.title}
                onChange={handleChange}
                required
              />
              <Input
                label="Location *"
                name="location"
                id="job-location"
                placeholder="e.g. San Francisco, CA"
                value={formData.location}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-grid-3">
              <div className="form-group">
                <label className="form-label" htmlFor="job-type">Job Type *</label>
                <select id="job-type" name="jobType" className="form-select" value={formData.jobType} onChange={handleChange}>
                  {JOB_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="exp-level">Experience Level *</label>
                <select id="exp-level" name="experienceLevel" className="form-select" value={formData.experienceLevel} onChange={handleChange}>
                  {EXP_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="category">Category *</label>
                <select id="category" name="category" className="form-select" value={formData.category} onChange={handleChange}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div className="form-grid-2">
              <Input
                label="Min Salary (₹)"
                name="salaryMin"
                id="salary-min"
                type="number"
                min="0"
                placeholder="e.g. 800000"
                value={formData.salaryMin}
                onChange={handleChange}
              />
              <Input
                label="Max Salary (₹)"
                name="salaryMax"
                id="salary-max"
                type="number"
                min="0"
                placeholder="e.g. 1200000"
                value={formData.salaryMax}
                onChange={handleChange}
              />
            </div>

            <div className="form-grid-2">
              <Input
                label="Number of Openings"
                name="openings"
                id="openings"
                type="number"
                min="1"
                value={formData.openings}
                onChange={handleChange}
              />
              <Input
                label="Application Deadline"
                name="deadline"
                id="deadline"
                type="date"
                value={formData.deadline}
                onChange={handleChange}
              />
            </div>

            <label className="remote-checkbox-label">
              <input
                type="checkbox"
                name="isRemote"
                checked={formData.isRemote}
                onChange={handleChange}
              />
              <span>This is a remote position</span>
            </label>
          </div>

          {/* Description */}
          <div className="form-card">
            <h3 className="form-section-title">Job Description</h3>
            <div className="form-group">
              <label className="form-label" htmlFor="description">Description *</label>
              <textarea
                id="description"
                name="description"
                className="form-textarea"
                rows="6"
                placeholder="Describe the role, team, and what you're looking for..."
                value={formData.description}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="responsibilities">Responsibilities <span className="form-hint">(one per line)</span></label>
              <textarea
                id="responsibilities"
                name="responsibilities"
                className="form-textarea"
                rows="4"
                placeholder="Build and maintain React applications&#10;Collaborate with design teams&#10;Write unit tests"
                value={formData.responsibilities}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="requirements">Requirements <span className="form-hint">(one per line)</span></label>
              <textarea
                id="requirements"
                name="requirements"
                className="form-textarea"
                rows="4"
                placeholder="3+ years of React experience&#10;Strong JavaScript skills&#10;Experience with REST APIs"
                value={formData.requirements}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="skills">Required Skills <span className="form-hint">(comma-separated)</span></label>
              <Input
                name="skills"
                id="skills"
                placeholder="React, Node.js, MongoDB, CSS"
                value={formData.skills}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="form-actions">
            <Button type="button" variant="outline" onClick={() => navigate(-1)} disabled={loading}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || companies.length === 0}
              loading={loading}
            >
              {loading ? 'Publishing...' : 'Publish Job'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateJob;
