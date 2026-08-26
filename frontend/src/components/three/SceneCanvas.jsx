import React, { useState, useEffect, useRef, Component } from 'react';
import WebGLFallback from './WebGLFallback';

class CanvasErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.warn("ThreeScene Error caught safely:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <WebGLFallback />;
    }
    return this.props.children;
  }
}

const checkWebGLSupport = () => {
  try {
    const canvas = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
  } catch (e) {
    return false;
  }
};

const SceneCanvas = ({
  children,
  fallback = <WebGLFallback />,
  height = '100%',
  minHeight = '300px',
  className = ''
}) => {
  const containerRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    setIsSupported(checkWebGLSupport());
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

  if (!isSupported) {
    return (
      <div className={`scene-canvas-fallback ${className}`} style={{ width: '100%', height, minHeight }}>
        {fallback}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`scene-canvas-wrapper ${className}`}
      style={{ width: '100%', height, minHeight, position: 'relative' }}
      aria-hidden="true"
    >
      <CanvasErrorBoundary fallback={fallback}>
        {isVisible ? children : fallback}
      </CanvasErrorBoundary>
    </div>
  );
};

export default SceneCanvas;
