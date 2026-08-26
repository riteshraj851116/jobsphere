import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCompanies, createCompany, updateCompany } from '../../services/companyService';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import { Building, Globe, MapPin, Briefcase, Plus, CheckCircle } from 'lucide-react';
import './CompanyProfile.css';

const CompanyProfile = () => {
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    industry: '',
    location: '',
    website: '',
    logo: '',
    companySize: '10-50',
    foundedYear: '',
    description: ''
  });

  const navigate = useNavigate();

  useEffect(() => {
    fetchRecruiterCompany();
  }, []);

  const fetchRecruiterCompany = async () => {
    try {
      setLoading(true);
      const res = await getCompanies();
      const companyList = res.data?.companies || [];
      if (companyList.length > 0) {
        const comp = companyList[0];
        setCompany(comp);
        setFormData({
          name: comp.name || '',
          industry: comp.industry || '',
          location: comp.location || '',
          website: comp.website || '',
          logo: comp.logo || '',
          companySize: comp.companySize || '10-50',
          foundedYear: comp.foundedYear || '',
          description: comp.description || ''
        });
      }
    } catch (err) {
      setError('Failed to fetch company profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');
    setError(null);

    if (!formData.name.trim() || !formData.description.trim()) {
      setError('Company name and description are required.');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        name: formData.name.trim(),
        industry: formData.industry.trim(),
        location: formData.location.trim(),
        website: formData.website.trim(),
        logo: formData.logo.trim(),
        companySize: formData.companySize,
        foundedYear: formData.foundedYear ? Number(formData.foundedYear) : undefined,
        description: formData.description.trim()
      };

      if (company?._id) {
        const res = await updateCompany(company._id, payload);
        setCompany(res.data?.company || res.company || payload);
        setSuccess('Company profile updated successfully!');
      } else {
        const res = await createCompany(payload);
        const created = res.data?.company || res.company;
        setCompany(created);
        setSuccess('Company profile created successfully!');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save company details.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="company-profile-page bg-surface-soft py-8">
      <div className="container max-w-4xl">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h2>Company Profile</h2>
            <p className="text-muted">Manage your company's public identity and information.</p>
          </div>
          {company?._id && (
            <Button size="sm" onClick={() => navigate('/create-job')}>
              <Plus size={16} /> Post a Job
            </Button>
          )}
        </div>

        {error && <div className="error-alert mb-6">{error}</div>}
        {success && <div className="success-banner mb-6">{success}</div>}

        <div className="card">
          <form onSubmit={handleSubmit} className="company-form">
            <div className="form-grid">
              <Input
                label="Company Name *"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Acme Corporation"
                required
              />
              <Input
                label="Industry"
                name="industry"
                value={formData.industry}
                onChange={handleChange}
                placeholder="e.g. Software & Technology"
              />
            </div>

            <div className="form-grid">
              <Input
                label="Location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g. San Francisco, CA"
              />
              <Input
                label="Website URL"
                name="website"
                value={formData.website}
                onChange={handleChange}
                placeholder="https://example.com"
              />
            </div>

            <div className="form-grid">
              <Input
                label="Logo Image URL"
                name="logo"
                value={formData.logo}
                onChange={handleChange}
                placeholder="https://example.com/logo.png"
              />
              <div className="input-group">
                <label className="input-label">Company Size</label>
                <select
                  name="companySize"
                  className="form-select"
                  value={formData.companySize}
                  onChange={handleChange}
                >
                  <option value="1-10">1-10 Employees</option>
                  <option value="10-50">10-50 Employees</option>
                  <option value="50-200">50-200 Employees</option>
                  <option value="200-500">200-500 Employees</option>
                  <option value="500+">500+ Employees</option>
                </select>
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Company Description *</label>
              <textarea
                name="description"
                className="form-textarea"
                rows="5"
                placeholder="Tell candidates about your company's mission, culture, and achievements..."
                value={formData.description}
                onChange={handleChange}
                required
              ></textarea>
            </div>

            <div className="form-actions mt-6 flex gap-3 justify-end">
              <Button type="submit" disabled={saving} loading={saving}>
                {saving ? 'Saving...' : company?._id ? 'Update Company Profile' : 'Create Company Profile'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CompanyProfile;
