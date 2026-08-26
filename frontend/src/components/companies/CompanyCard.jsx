import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Users } from 'lucide-react';
import Button from '../common/Button';
import './CompanyCard.css';

const CompanyCard = ({ company }) => {
  const { name, logo, industry, location, description, companySize, openJobs, _id } = company;

  return (
    <div className="company-card">
      <div className="company-card-header">
        {logo ? (
          <img src={logo} alt={`${name} logo`} className="company-card-logo" />
        ) : (
          <div className="company-logo-placeholder-lg">
            {name?.charAt(0) || 'C'}
          </div>
        )}
        <div className="company-card-title">
          <h3>{name}</h3>
          <span className="industry-tag">{industry || 'Technology'}</span>
        </div>
      </div>
      
      <p className="company-description">
        {description ? (description.length > 100 ? `${description.substring(0, 100)}...` : description) : 'No description available for this company.'}
      </p>

      <div className="company-meta-tags">
        <div className="meta-tag">
          <MapPin size={16} />
          <span>{location || 'Remote'}</span>
        </div>
        <div className="meta-tag">
          <Users size={16} />
          <span>{companySize || 'Company'} Employees</span>
        </div>
      </div>

      <div className="company-card-footer">
        <div className="open-jobs">
          <span className="text-primary font-semibold">{openJobs || 0}</span> open jobs
        </div>
        <Link to={`/companies/${_id}`} className="btn btn--outline btn--sm">View Profile</Link>
      </div>
    </div>
  );
};

export default CompanyCard;
