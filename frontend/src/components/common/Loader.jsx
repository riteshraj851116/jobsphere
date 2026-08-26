import React from 'react';
import './Loader.css';

const Loader = ({ fullscreen = false, size = 'md', text = '' }) => {
  if (fullscreen) {
    return (
      <div className="loader-fullscreen" role="status" aria-label="Loading">
        <div className={`loader-spinner loader-spinner--${size}`} />
        {text && <p className="loader-text">{text}</p>}
      </div>
    );
  }
  return (
    <div className="loader-inline" role="status" aria-label="Loading">
      <div className={`loader-spinner loader-spinner--${size}`} />
      {text && <span className="loader-text">{text}</span>}
    </div>
  );
};

export default Loader;
