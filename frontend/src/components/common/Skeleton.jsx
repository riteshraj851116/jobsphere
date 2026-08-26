import React from 'react';
import './Skeleton.css';

export const Skeleton = ({ width, height, className = '', style = {} }) => (
  <div
    className={`skeleton ${className}`}
    style={{ width, height, ...style }}
    aria-hidden="true"
  />
);

export const SkeletonText = ({ lines = 3 }) => (
  <div className="skeleton-text">
    {Array.from({ length: lines }).map((_, i) => (
      <div
        key={i}
        className="skeleton"
        style={{ height: 14, width: i === lines - 1 ? '65%' : '100%' }}
      />
    ))}
  </div>
);

export const JobCardSkeleton = () => (
  <div className="skeleton-job-card">
    <div className="flex gap-3 mb-3">
      <Skeleton width={44} height={44} className="rounded-md" />
      <div style={{ flex: 1 }}>
        <Skeleton height={14} className="mb-2" style={{ width: '60%' }} />
        <Skeleton height={12} style={{ width: '40%' }} />
      </div>
    </div>
    <Skeleton height={18} className="mb-2" />
    <Skeleton height={14} className="mb-1" style={{ width: '70%' }} />
    <Skeleton height={14} style={{ width: '50%' }} />
    <div className="flex gap-2 mt-3">
      <Skeleton height={26} style={{ width: 70 }} className="rounded-full" />
      <Skeleton height={26} style={{ width: 60 }} className="rounded-full" />
    </div>
  </div>
);

export const ProfileSkeleton = () => (
  <div className="skeleton-profile">
    <Skeleton height={120} className="rounded-lg mb-4" />
    <Skeleton height={20} style={{ width: '40%' }} className="mb-2" />
    <Skeleton height={14} style={{ width: '60%' }} className="mb-1" />
    <Skeleton height={14} style={{ width: '50%' }} />
  </div>
);

export default Skeleton;
