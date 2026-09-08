import React from 'react';
import './Loader.css';

const Loader = ({ fullscreen = false, size = 'md', text = 'Loading', subtext = '' }) => {
  if (fullscreen) {
    return (
      <div className="loader-fullscreen" role="status" aria-label={text || "Loading"}>
        <div className="quantum-loader-wrap">
          <div className={`quantum-loader quantum-loader--${size}`}>
            <div className="quantum-ring quantum-ring-outer" />
            <div className="quantum-ring quantum-ring-middle" />
            <div className="quantum-ring quantum-ring-inner" />
            <div className="quantum-core" />
          </div>
        </div>

        <div className="loader-brand-meta">
          <span className="loader-brand-title">JOBSPHERE</span>
          {text && <p className="loader-text-shimmer">{text}</p>}
          {subtext && <span className="loader-subtext">{subtext}</span>}
          <div className="loader-progress-bar">
            <div className="loader-progress-glow" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="loader-inline" role="status" aria-label={text || "Loading"}>
      <div className={`quantum-loader quantum-loader--${size}`}>
        <div className="quantum-ring quantum-ring-outer" />
        <div className="quantum-ring quantum-ring-middle" />
        <div className="quantum-ring quantum-ring-inner" />
        <div className="quantum-core" />
      </div>
      {text && (
        <div className="loader-inline-text-wrap">
          <span className="loader-text-shimmer">{text}</span>
          {subtext && <span className="loader-subtext">{subtext}</span>}
        </div>
      )}
    </div>
  );
};

export default Loader;
