import React from 'react';
import './ErrorState.css';

const ErrorState = ({
  title = 'Something went wrong',
  message = 'An unexpected error occurred. Please try again.',
  onRetry,
  onBack,
  code,
}) => (
  <div className="error-state">
    <div className="error-state__icon">
      {code === 404 ? '🔍' : code === 403 ? '🔒' : '⚠️'}
    </div>
    {code && <span className="error-state__code">{code}</span>}
    <h2 className="error-state__title">{title}</h2>
    <p className="error-state__msg">{message}</p>
    <div className="error-state__actions">
      {onRetry && (
        <button className="btn btn--primary btn--md" onClick={onRetry}>
          Try again
        </button>
      )}
      {onBack && (
        <button className="btn btn--outline btn--md" onClick={onBack}>
          Go back
        </button>
      )}
    </div>
  </div>
);

export default ErrorState;
