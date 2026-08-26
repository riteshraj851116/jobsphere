import React from 'react';
import './EmptyState.css';

const EmptyState = ({
  icon,
  title = 'Nothing here yet',
  description = '',
  action,
  actionLabel,
  onAction,
  compact = false,
}) => (
  <div className={`empty-state ${compact ? 'empty-state--compact' : ''}`}>
    {icon && <div className="empty-state__icon">{icon}</div>}
    <h3 className="empty-state__title">{title}</h3>
    {description && <p className="empty-state__desc">{description}</p>}
    {(action || (actionLabel && onAction)) && (
      <div className="empty-state__action">
        {action || (
          <button className="btn btn--primary btn--md" onClick={onAction}>
            {actionLabel}
          </button>
        )}
      </div>
    )}
  </div>
);

export default EmptyState;
