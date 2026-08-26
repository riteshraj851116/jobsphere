import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getCompanyById } from '../../services/companyService';
import Loader from '../../components/common/Loader';
import { useAuth } from '../../hooks/useAuth';
import { MapPin, Users, Globe, ExternalLink, Mail } from 'lucide-react';
import './CompanyDetails.css';

const CompanyDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        setLoading(true);
        const res = await getCompanyById(id);
        setCompany(res.data?.company || null);
      } catch (err) {
        setError("Company not found.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchCompany();
  }, [id]);

  if (loading) return <Loader />;
  if (error) return <div className="container p-8"><div className="error-state">{error}</div></div>;
  if (!company) return null;

  const recruiterId = company.recruiter?._id || company.recruiter?.id || company.recruiter;

  return (
    <div className="company-details-page bg-surface-soft">
      {/* Cover / Header area */}
      <div className="company-cover">
        <div className="container">
          <div className="company-header-card card">
            <div className="company-header-main">
              {company.logo ? (
                <img src={company.logo} alt={company.name} className="cd-logo" />
              ) : (
                <div className="cd-logo-placeholder">{company.name?.charAt(0) || 'C'}</div>
              )}
              
              <div className="cd-info">
                <h1>{company.name}</h1>
                <div className="cd-meta">
                  <span className="cd-industry">{company.industry || 'Technology'}</span>
                  <span className="cd-meta-item"><MapPin size={16}/> {company.location || 'Remote'}</span>
                   {company.companySize && <span className="cd-meta-item"><Users size={16}/> {company.companySize} Employees</span>}
                </div>
              </div>
            </div>
            
            <div className="flex gap-2 items-center flex-wrap">
              {user && recruiterId && user._id !== recruiterId && user.id !== recruiterId && (
                <Link to={`/messages?userId=${recruiterId}`} className="btn btn--primary btn--md flex items-center gap-1.5">
                  <Mail size={16} /> Message Recruiter
                </Link>
              )}
              {company.website && (
                <a href={company.website} target="_blank" rel="noopener noreferrer" className="btn btn--outline btn--md cd-website-btn">
                  Visit Website <ExternalLink size={16} />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container company-content-container">
        <main className="company-main-content card">
          <h2>About {company.name}</h2>
          <div className="cd-description">
            {company.description ? (
              <p>{company.description}</p>
            ) : (
              <p className="text-muted">No description provided.</p>
            )}
          </div>
        </main>

        <aside className="company-jobs-sidebar">
          <div className="card">
            <h3>Open Positions</h3>
            {/* If we had a specific route for company jobs, we'd fetch them. For now, display a placeholder list or search link */}
            <p className="text-muted mb-4">View all {company.openJobs || 0} open positions at {company.name}.</p>
            <Link to={`/jobs?company=${company._id}`} className="btn btn-primary w-full text-center block">
              View Jobs
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default CompanyDetails;
