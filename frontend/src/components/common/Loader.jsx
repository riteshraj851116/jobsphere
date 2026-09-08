import React, { useState, useEffect } from 'react';
import './Loader.css';

const DEFAULT_PHASES = [
  "Synchronizing Neural Mesh...",
  "Calibrating Opportunity Vectors...",
  "Synthesizing Career Graph...",
  "Optimizing Real-time Shards...",
  "Loading JobSphere Ecosystem..."
];

export const SkeletonCard = ({ lines = 3, height = "120px", hasAvatar = false }) => {
  return (
    <div className="skeleton-card" style={{ minHeight: height }}>
      {hasAvatar && (
        <div className="skeleton-header-row">
          <div className="skeleton-avatar skeleton-shimmer" />
          <div className="skeleton-header-text">
            <div className="skeleton-line skeleton-line-title skeleton-shimmer" />
            <div className="skeleton-line skeleton-line-sub skeleton-shimmer" />
          </div>
        </div>
      )}
      <div className="skeleton-body">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className="skeleton-line skeleton-shimmer"
            style={{ width: i === lines - 1 ? "60%" : i === 0 ? "95%" : "85%" }}
          />
        ))}
      </div>
    </div>
  );
};

export const SkeletonJob = () => (
  <div className="skeleton-card skeleton-job-card">
    <div className="skeleton-header-row">
      <div className="skeleton-avatar square skeleton-shimmer" />
      <div className="skeleton-header-text">
        <div className="skeleton-line skeleton-line-title skeleton-shimmer" />
        <div className="skeleton-line skeleton-line-sub skeleton-shimmer" />
      </div>
    </div>
    <div className="skeleton-body">
      <div className="skeleton-line skeleton-shimmer" style={{ width: "90%" }} />
      <div className="skeleton-line skeleton-shimmer" style={{ width: "75%" }} />
    </div>
    <div className="skeleton-tags-row">
      <div className="skeleton-pill skeleton-shimmer" />
      <div className="skeleton-pill skeleton-shimmer" />
      <div className="skeleton-pill skeleton-shimmer" />
    </div>
  </div>
);

const Loader = ({
  fullscreen = false,
  size = 'md',
  text = '',
  subtext = '',
  showPhases = true,
  customPhases = DEFAULT_PHASES
}) => {
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [progress, setProgress] = useState(12);

  // Dynamic phase and progress animation
  useEffect(() => {
    if (!showPhases && text) return;

    const phaseInterval = setInterval(() => {
      setPhaseIndex((prev) => (prev + 1) % customPhases.length);
    }, 1800);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return 20;
        return prev + Math.floor(Math.random() * 14) + 4;
      });
    }, 280);

    return () => {
      clearInterval(phaseInterval);
      clearInterval(progressInterval);
    };
  }, [showPhases, customPhases, text]);

  const activeText = text || (showPhases ? customPhases[phaseIndex] : "Loading...");

  if (fullscreen) {
    return (
      <div className="loader-fullscreen" role="status" aria-label={activeText}>
        {/* Ambient background glow grid */}
        <div className="loader-bg-grid" />
        <div className="loader-bg-glow" />

        <div className="loader-glass-card">
          {/* 3D GYROSCOPIC QUANTUM CORE */}
          <div className="gyro-loader-wrap">
            <div className={`gyro-loader gyro-loader--${size}`}>
              {/* Outer Hexagon Orbit */}
              <div className="gyro-ring gyro-ring--outer" />
              {/* Middle Gyro Ring */}
              <div className="gyro-ring gyro-ring--middle" />
              {/* Inner Gyro Ring */}
              <div className="gyro-ring gyro-ring--inner" />
              {/* Orbiting Satellite Nodes */}
              <div className="gyro-satellite gyro-sat-1" />
              <div className="gyro-satellite gyro-sat-2" />
              <div className="gyro-satellite gyro-sat-3" />
              {/* Central Glowing Energy Hub */}
              <div className="gyro-core-hub">
                <div className="gyro-core-pulse" />
                <span className="gyro-core-symbol">✦</span>
              </div>
            </div>
          </div>

          {/* BRAND META & DYNAMIC SHIMMER */}
          <div className="loader-brand-meta">
            <div className="loader-brand-badge">
              <span className="brand-dot" />
              <span>JOBSPHERE ENGINE</span>
            </div>

            <p className="loader-text-shimmer">{activeText}</p>

            {subtext && <span className="loader-subtext">{subtext}</span>}

            {/* HIGH TECH SEGMENTED LASER BAR */}
            <div className="laser-progress-container">
              <div className="laser-progress-track">
                <div
                  className="laser-progress-bar"
                  style={{ width: `${Math.min(100, progress)}%` }}
                >
                  <div className="laser-head-spark" />
                </div>
              </div>
              <span className="laser-percentage">{String(Math.min(99, progress)).padStart(2, '0')}%</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="loader-inline" role="status" aria-label={activeText}>
      <div className="gyro-loader-wrap">
        <div className={`gyro-loader gyro-loader--${size}`}>
          <div className="gyro-ring gyro-ring--outer" />
          <div className="gyro-ring gyro-ring--middle" />
          <div className="gyro-ring gyro-ring--inner" />
          <div className="gyro-core-hub">
            <div className="gyro-core-pulse" />
          </div>
        </div>
      </div>
      <div className="loader-inline-text-wrap">
        <span className="loader-text-shimmer">{activeText}</span>
        {subtext && <span className="loader-subtext">{subtext}</span>}
      </div>
    </div>
  );
};

export default Loader;
