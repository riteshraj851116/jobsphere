import React, { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Line, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";

/* =========================================================
   PARTICLES
========================================================= */

const Particles = () => {
  const ref = useRef();

  const positions = useMemo(() => {
    const count = 700;
    const array = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const radius = 2.8 + Math.random() * 3.2;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      array[i * 3] =
        radius *
        Math.sin(phi) *
        Math.cos(theta);

      array[i * 3 + 1] =
        radius *
        Math.sin(phi) *
        Math.sin(theta);

      array[i * 3 + 2] =
        radius * Math.cos(phi);
    }

    return array;
  }, []);

  useFrame((state) => {
    if (!ref.current) return;

    ref.current.rotation.y =
      state.clock.elapsedTime * 0.025;

    ref.current.rotation.x =
      Math.sin(state.clock.elapsedTime * 0.12) * 0.04;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>

      <pointsMaterial
        color="#111111"
        size={0.018}
        sizeAttenuation
        transparent
        opacity={0.45}
        depthWrite={false}
      />
    </points>
  );
};

/* =========================================================
   ORBIT
========================================================= */

const Orbit = ({
  radius,
  rotation,
  speed,
  tube = 0.009,
  opacity = 0.3,
}) => {
  const ref = useRef();

  useFrame((state) => {
    if (!ref.current) return;

    ref.current.rotation.z =
      rotation +
      state.clock.elapsedTime * speed;
  });

  return (
    <mesh
      ref={ref}
      rotation={[Math.PI / 2, rotation, 0]}
    >
      <torusGeometry
        args={[radius, tube, 10, 180]}
      />

      <meshBasicMaterial
        color="#111111"
        transparent
        opacity={opacity}
      />
    </mesh>
  );
};

/* =========================================================
   ORBIT DOT
========================================================= */

const OrbitDot = ({
  radius,
  speed,
  offset,
  size = 0.07,
}) => {
  const ref = useRef();

  useFrame((state) => {
    if (!ref.current) return;

    const time =
      state.clock.elapsedTime * speed + offset;

    ref.current.position.x =
      Math.cos(time) * radius;

    ref.current.position.z =
      Math.sin(time) * radius;

    ref.current.position.y =
      Math.sin(time * 1.7) * 0.15;
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[size, 16, 16]} />

      <meshBasicMaterial color="#050505" />
    </mesh>
  );
};

/* =========================================================
   CENTER CORE
========================================================= */

const Core = () => {
  const group = useRef();

  useFrame((state) => {
    if (!group.current) return;

    group.current.rotation.x =
      state.clock.elapsedTime * 0.16;

    group.current.rotation.y =
      state.clock.elapsedTime * 0.23;

    group.current.position.y =
      Math.sin(state.clock.elapsedTime * 0.7) * 0.08;
  });

  return (
    <group ref={group}>
      {/* Outer wire structure */}
      <mesh>
        <icosahedronGeometry args={[1.15, 3]} />

        <meshBasicMaterial
          color="#111111"
          wireframe
          transparent
          opacity={0.22}
        />
      </mesh>

      {/* Second geometric shell */}
      <mesh rotation={[0.4, 0.2, 0.1]}>
        <octahedronGeometry args={[0.92, 2]} />

        <meshBasicMaterial
          color="#111111"
          wireframe
          transparent
          opacity={0.38}
        />
      </mesh>

      {/* Inner solid core */}
      <mesh>
        <icosahedronGeometry args={[0.3, 2]} />

        <meshBasicMaterial color="#050505" />
      </mesh>

      {/* Tiny center point */}
      <mesh>
        <sphereGeometry args={[0.1, 24, 24]} />

        <meshBasicMaterial color="#ffffff" />
      </mesh>

      {/* Orbit system */}
      <Orbit
        radius={1.45}
        rotation={0}
        speed={0.28}
        opacity={0.42}
      />

      <Orbit
        radius={1.75}
        rotation={0.8}
        speed={-0.2}
        opacity={0.3}
      />

      <Orbit
        radius={2.05}
        rotation={1.7}
        speed={0.13}
        opacity={0.22}
      />

      <Orbit
        radius={2.4}
        rotation={2.4}
        speed={-0.08}
        opacity={0.14}
      />

      {/* Orbiting opportunity points */}
      <OrbitDot
        radius={1.45}
        speed={0.8}
        offset={0}
        size={0.075}
      />

      <OrbitDot
        radius={1.75}
        speed={-0.55}
        offset={2}
        size={0.055}
      />

      <OrbitDot
        radius={2.05}
        speed={0.38}
        offset={4}
        size={0.07}
      />

      <OrbitDot
        radius={2.4}
        speed={-0.22}
        offset={1}
        size={0.045}
      />
    </group>
  );
};

/* =========================================================
   CAREER NODES
========================================================= */

const nodes = [
  {
    position: [-2.5, 1.45, 0.2],
    label: "REACT",
  },
  {
    position: [2.5, 1.2, -0.5],
    label: "NODE",
  },
  {
    position: [-2.65, -1.35, 0.3],
    label: "DESIGN",
  },
  {
    position: [2.55, -1.45, 0],
    label: "DATA",
  },
  {
    position: [0, 2.55, -1],
    label: "PRODUCT",
  },
  {
    position: [0, -2.45, 0.7],
    label: "FINANCE",
  },
];

/* =========================================================
   CONNECTIONS
========================================================= */

const Connections = () => {
  return (
    <group>
      {nodes.map((node, index) => (
        <Line
          key={index}
          points={[
            node.position,
            [0, 0, 0],
          ]}
          color="#111111"
          transparent
          opacity={0.2}
          lineWidth={0.5}
        />
      ))}

      {/* Extra network connections */}

      <Line
        points={[
          nodes[0].position,
          nodes[4].position,
        ]}
        color="#111111"
        transparent
        opacity={0.12}
        lineWidth={0.4}
      />

      <Line
        points={[
          nodes[1].position,
          nodes[4].position,
        ]}
        color="#111111"
        transparent
        opacity={0.12}
        lineWidth={0.4}
      />

      <Line
        points={[
          nodes[2].position,
          nodes[5].position,
        ]}
        color="#111111"
        transparent
        opacity={0.12}
        lineWidth={0.4}
      />

      <Line
        points={[
          nodes[3].position,
          nodes[5].position,
        ]}
        color="#111111"
        transparent
        opacity={0.12}
        lineWidth={0.4}
      />
    </group>
  );
};

/* =========================================================
   NODE OBJECTS
========================================================= */

const CareerNodes = () => {
  const group = useRef();

  useFrame((state) => {
    if (!group.current) return;

    group.current.rotation.y =
      Math.sin(state.clock.elapsedTime * 0.2) * 0.06;

    group.current.rotation.x =
      Math.cos(state.clock.elapsedTime * 0.17) * 0.035;
  });

  return (
    <group ref={group}>
      {nodes.map((node, index) => (
        <Float
          key={node.label}
          speed={1 + index * 0.12}
          rotationIntensity={0.35}
          floatIntensity={0.65}
        >
          <group position={node.position}>
            {/* Outer ring */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry
                args={[0.13, 0.008, 8, 40]}
              />

              <meshBasicMaterial
                color="#111111"
                transparent
                opacity={0.3}
              />
            </mesh>

            {/* Node */}
            <mesh>
              <sphereGeometry
                args={[0.055, 16, 16]}
              />

              <meshBasicMaterial color="#050505" />
            </mesh>
          </group>
        </Float>
      ))}
    </group>
  );
};

/* =========================================================
   ROTATING FRAME
========================================================= */

const RotatingFrame = () => {
  const ref = useRef();

  useFrame((state) => {
    if (!ref.current) return;

    ref.current.rotation.z =
      state.clock.elapsedTime * 0.025;
  });

  return (
    <group ref={ref}>
      <mesh rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[4.9, 4.9, 0.01]} />

        <meshBasicMaterial
          color="#111111"
          wireframe
          transparent
          opacity={0.035}
        />
      </mesh>
    </group>
  );
};

/* =========================================================
   MOUSE PARALLAX
========================================================= */

const Scene = () => {
  const scene = useRef();

  useFrame((state) => {
    if (!scene.current) return;

    const targetRotationY =
      state.pointer.x * 0.16;

    const targetRotationX =
      -state.pointer.y * 0.1;

    scene.current.rotation.y +=
      (targetRotationY -
        scene.current.rotation.y) *
      0.025;

    scene.current.rotation.x +=
      (targetRotationX -
        scene.current.rotation.x) *
      0.025;
  });

  return (
    <group ref={scene}>
      <RotatingFrame />

      <Particles />

      <Connections />

      <CareerNodes />

      <Core />
    </group>
  );
};

/* =========================================================
   MAIN
========================================================= */

const JobSphere3D = () => {
  return (
    <div className="jobsphere-3d-wrapper">
      <Canvas
        dpr={[1, 1.5]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
      >
        <PerspectiveCamera
          makeDefault
          position={[0, 0, 7]
          }
          fov={42}
        />

        <ambientLight intensity={0.5} />

        <Scene />
      </Canvas>

      <div className="jobsphere-3d-center-label">
        <span>JS</span>
      </div>

      <div className="jobsphere-3d-caption">
        <span className="caption-line" />
        <span>OPPORTUNITY NETWORK</span>
      </div>
    </div>
  );
};

export default JobSphere3D;