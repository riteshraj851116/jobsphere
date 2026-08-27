import React, { useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import WebGLFallback from "./WebGLFallback";

/**
 * SceneShell
 *
 * Owns THE ONE <Canvas> for a Three.js scene component.
 *
 * Fixes applied here (root causes of the WebGL context-loss spam):
 *  - Every Three visual previously rendered its OWN <Canvas> AND was often
 *    mounted inside <SceneCanvas>/<ThreeScene>, which wrapped it in ANOTHER
 *    <Canvas>. That produced multiple WebGL contexts per page and eventually
 *    "THREE.WebGLRenderer: Context Lost". Now a scene renders exactly one
 *    canvas through this shared shell.
 *  - Renders nothing until the wrapper intersects the viewport, so canvases
 *    far off-page never allocate a GL context at all.
 *  - Cleans up its IntersectionObserver, WebGL support probe and context-lost
 *    listeners correctly so nothing leaks after route changes.
 *  - Falls back gracefully when WebGL is unavailable or the context is lost,
 *    instead of breaking the page.
 */

const hasWebGL = () => {
  try {
    const probe = document.createElement("canvas");
    return Boolean(
      window.WebGLRenderingContext &&
      (probe.getContext("webgl") || probe.getContext("experimental-webgl")),
    );
  } catch {
    return false;
  }
};

const defaultProps = {
  camera: { position: [0, 0, 5.5], fov: 45 },
  dpr: [1, 1.5],
};

const SceneShell = ({
  children,
  fallback = null,
  camera = defaultProps.camera,
  dpr = defaultProps.dpr,
  glOptions,
  frameloop = "always",
  height = "100%",
  minHeight = "300px",
  className = "",
}) => {
  const containerRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [supported, setSupported] = useState(true);
  const [contextLost, setContextLost] = useState(false);

  // One-time capability probe (no persistent GL context created)
  useEffect(() => {
    setSupported(hasWebGL());
  }, []);

  // Only mount the real <Canvas> while on screen
  useEffect(() => {
    const element = containerRef.current;
    if (!element) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.05 },
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
      setIsVisible(false);
    };
  }, []);

  // Context loss / restoration on the container
  useEffect(() => {
    const element = containerRef.current;
    if (!element) return undefined;

    const handleContextLost = (event) => {
      event.preventDefault();
      setContextLost(true);
    };

    const handleContextRestored = () => {
      setContextLost(false);
    };

    element.addEventListener("webglcontextlost", handleContextLost);
    element.addEventListener("webglcontextrestored", handleContextRestored);

    return () => {
      element.removeEventListener("webglcontextlost", handleContextLost);
      element.removeEventListener(
        "webglcontextrestored",
        handleContextRestored,
      );
    };
  }, []);

  if (!supported || contextLost) {
    return (
      <div
        className={`scene-canvas-fallback ${className}`}
        style={{ width: "100%", height, minHeight }}
        aria-hidden="true"
      >
        {fallback || <WebGLFallback />}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`scene-canvas-wrapper ${className}`}
      style={{ width: "100%", height, minHeight, position: "relative" }}
      aria-hidden="true"
    >
      {isVisible && (
        <Canvas
          camera={camera}
          dpr={dpr}
          gl={{
            antialias: true,
            alpha: true,
            powerPreference: "low-power",
            ...glOptions,
          }}
          frameloop={frameloop}
        >
          {children}
        </Canvas>
      )}
    </div>
  );
};

/**
 * Error boundary kept as an escape hatch for unexpected render errors
 * inside three.js content (bad geometry arrays etc).
 */
export class SceneErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.warn("Three scene render error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || null;
    }
    return this.props.children;
  }
}

export default SceneShell;
