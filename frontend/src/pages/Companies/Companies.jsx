import React, { useState, useEffect } from 'react';
import { getCompanies } from '../../services/companyService';
import CompanyCard from '../../components/companies/CompanyCard';
import Button from '../../components/common/Button';
import { Search } from 'lucide-react';
import CompanyNetwork from '../../components/three/CompanyNetwork';
import SceneCanvas from '../../components/three/SceneCanvas';
import './Companies.css';

const Companies = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchCompanies(searchQuery);
  }, [searchQuery]);

  const fetchCompanies = async (search = '') => {
    try {
      setLoading(true);
      setError(null);
      const params = search ? { search } : {};
      const res = await getCompanies(params);
      // Backend returns: { success: true, data: { companies: [...] } }
      setCompanies(res.data?.companies || []);
    } catch (err) {
      setError('Failed to load companies. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchQuery(searchTerm.trim());
  };

  return (
    <div className="companies-page">
      {/* Hero Banner */}
      <div className="companies-hero">
        <div className="container grid grid-cols-2 gap-8 items-center">
          <div>
            <h1>Discover Great Companies</h1>
            <p className="mb-4 text-muted">Find the right company culture for your next career move across global tech hubs.</p>

            <form className="companies-search-bar" onSubmit={handleSearch}>
              <div className="company-search-field">
                <Search size={20} className="company-search-icon" />
                <input
                  type="text"
                  placeholder="Search by company name or industry..."
                  className="company-search-input"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  aria-label="Search companies"
                />
              </div>
              <Button type="submit">Search</Button>
            </form>
          </div>

          <div className="desktop-only">
            <SceneCanvas minHeight="300px">
              <CompanyNetwork activeCompany={searchQuery} />
            </SceneCanvas>
          </div>
        </div>
      </div>

      <div className="container companies-main">
        {/* Results header */}
        <div className="companies-results-header">
          <p className="results-count">
            {loading ? '' : `${companies.length} compan${companies.length !== 1 ? 'ies' : 'y'} found`}
            {searchQuery && <span className="search-for"> for "<strong>{searchQuery}</strong>"</span>}
          </p>
          {searchQuery && (
            <button
              className="clear-search-btn"
              onClick={() => { setSearchTerm(''); setSearchQuery(''); }}
            >
              Clear search
            </button>
          )}
        </div>

        {loading ? (
          <div className="companies-loading">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="company-skeleton">
                <div className="skeleton company-skeleton-logo" />
                <div className="skeleton company-skeleton-title" />
                <div className="skeleton company-skeleton-sub" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="companies-error-state">
            <p>{error}</p>
            <Button onClick={() => fetchCompanies(searchQuery)} variant="outline">Retry</Button>
          </div>
        ) : companies.length > 0 ? (
          <div className="companies-grid">
            {companies.map(company => (
              <CompanyCard key={company._id} company={company} />
            ))}
          </div>
        ) : (
          <div className="companies-empty-state">
            <div className="empty-icon">🏢</div>
            <h3>No Companies Found</h3>
            <p>
              {searchQuery
                ? 'No companies match your search. Try different keywords.'
                : 'No companies have been added yet.'}
            </p>
            {searchQuery && (
              <Button variant="outline" onClick={() => { setSearchTerm(''); setSearchQuery(''); }}>
                Clear search
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Companies;
