import React, {
  Component,
  useEffect,
  useRef,
  useState
} from "react";

class WebGLErrorBoundary extends Component {
  constructor(props) {
    super(props);

    this.state = {
      hasError: false
    };
  }

  static getDerivedStateFromError() {
    return {
      hasError: true
    };
  }

  componentDidCatch(error, errorInfo) {
    console.warn(
      "WebGL Scene Error:",
      error,
      errorInfo
    );
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

const DefaultFallback = () => {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        minHeight: "240px",
        background:
          "radial-gradient(circle, rgba(244,244,245,0.8) 0%, rgba(255,255,255,1) 80%)",
        borderRadius: "12px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden"
      }}
      aria-hidden="true"
    >
      <div
        style={{
          width: "40px",
          height: "40px",
          borderRadius: "50%",
          border: "1px dashed #D4D4D8"
        }}
      />
    </div>
  );
};

const checkWebGL = () => {
  try {
    if (typeof window === "undefined") {
      return false;
    }

    const canvas = document.createElement("canvas");

    const gl =
      canvas.getContext("webgl") ||
      canvas.getContext("experimental-webgl");

    return Boolean(gl);
  } catch {
    return false;
  }
};

const ThreeScene = ({
  children,
  fallback = <DefaultFallback />,
  height = "100%",
  minHeight = "300px",
  className = ""
}) => {
  const containerRef = useRef(null);

  const [visible, setVisible] = useState(false);
  const [webGLAvailable, setWebGLAvailable] = useState(true);
  const [contextLost, setContextLost] = useState(false);

  useEffect(() => {
    const supported = checkWebGL();

    setWebGLAvailable(supported);

    if (!supported) {
      setContextLost(true);
    }
  }, []);

  useEffect(() => {
    const element = containerRef.current;

    if (!element) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setVisible(entry.isIntersecting);
      },
      {
        threshold: 0.05
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const element = containerRef.current;

    if (!element) {
      return undefined;
    }

    const handleContextLost = (event) => {
      event.preventDefault();

      console.warn(
        "THREE WebGL context lost. Showing fallback."
      );

      setContextLost(true);
    };

    const handleContextRestored = () => {
      console.info(
        "THREE WebGL context restored."
      );

      setContextLost(false);
    };

    element.addEventListener(
      "webglcontextlost",
      handleContextLost,
      false
    );

    element.addEventListener(
      "webglcontextrestored",
      handleContextRestored,
      false
    );

    return () => {
      element.removeEventListener(
        "webglcontextlost",
        handleContextLost
      );

      element.removeEventListener(
        "webglcontextrestored",
        handleContextRestored
      );
    };
  }, []);

  if (!webGLAvailable || contextLost) {
    return (
      <div
        className={`three-fallback-container ${className}`}
        style={{
          width: "100%",
          height,
          minHeight
        }}
      >
        {fallback}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`three-scene-wrapper ${className}`}
      style={{
        width: "100%",
        height,
        minHeight,
        position: "relative",
        overflow: "hidden"
      }}
      aria-hidden="true"
    >
      <WebGLErrorBoundary fallback={fallback}>
        {visible ? children : fallback}
      </WebGLErrorBoundary>
    </div>
  );
};

export default ThreeScene;