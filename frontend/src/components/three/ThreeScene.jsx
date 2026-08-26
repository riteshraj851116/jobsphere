import React, { useState, useEffect, useRef, Component } from 'react';

// Error boundary for WebGL / R3F Canvas errors
class WebGLErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.warn("WebGL Scene Error, rendering fallback UI:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <DefaultFallback />;
    }
    return this.props.children;
  }
}

const DefaultFallback = () => (
  <div
    style={{
      width: '100%',
      height: '100%',
      minHeight: '200px',
      background: 'radial-gradient(circle, rgba(244,244,245,0.8) 0%, rgba(255,255,255,1) 80%)',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}
    aria-hidden="true"
  >
    <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '1px dashed #D4D4D8' }} />
  </div>
);

const isWebGLSupported = () => {
  try {
    const canvas = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
  } catch {
    return false;
  }
};

const ThreeScene = ({ children, fallback = <DefaultFallback />, height = '100%', minHeight = '300px', className = '' }) => {
  const containerRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [webGLAvailable, setWebGLAvailable] = useState(true);

  useEffect(() => {
    setWebGLAvailable(isWebGLSupported());
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.05 }
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  if (!webGLAvailable) {
    return (
      <div className={`three-fallback-container ${className}`} style={{ width: '100%', height, minHeight }}>
        {fallback}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`three-scene-wrapper ${className}`}
      style={{ width: '100%', height, minHeight, position: 'relative' }}
      aria-hidden="true"
    >
      <WebGLErrorBoundary fallback={fallback}>
        {isVisible ? children : fallback}
      </WebGLErrorBoundary>
    </div>
  );
};

export default ThreeScene;
