import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

const HUBS = [
  { city: 'Bangalore', role: 'Frontend & Fullstack', count: '2.8k+ jobs', pos: [0.8, 0.9, 1.4] },
  { city: 'Hyderabad', role: 'MERN & Cloud Ops', count: '1.4k+ jobs', pos: [1.2, 0.4, 1.2] },
  { city: 'Mumbai', role: 'Product & Design', count: '1.9k+ jobs', pos: [0.3, 1.1, 1.3] },
  { city: 'Delhi / NCR', role: 'Data & Marketing', count: '1.6k+ jobs', pos: [0.5, 1.4, 0.9] },
  { city: 'London', role: 'FinTech Engineering', count: '950+ jobs', pos: [-0.9, 1.2, 0.8] },
  { city: 'San Francisco', role: 'AI & Full Stack', count: '3.1k+ jobs', pos: [-1.4, 0.7, 0.6] }
];

const GlobeMesh = () => {
  const globeGroupRef = useRef();
  const [hoveredIdx, setHoveredIdx] = useState(null);

  const { wireframeGeo, connectionLines } = useMemo(() => {
    const geo = new THREE.IcosahedronGeometry(1.8, 3);

    // Create curved arcs connecting Bangalore to SF and London
    const pts = [];
    const bangalore = new THREE.Vector3(...HUBS[0].pos);
    const sf = new THREE.Vector3(...HUBS[5].pos);
    const london = new THREE.Vector3(...HUBS[4].pos);

    const arc1 = new THREE.QuadraticBezierCurve3(bangalore, new THREE.Vector3(0, 2.4, 0), sf);
    const arc2 = new THREE.QuadraticBezierCurve3(bangalore, new THREE.Vector3(0, 2.2, 0), london);

    pts.push(...arc1.getPoints(30).flatMap(p => [p.x, p.y, p.z]));
    pts.push(...arc2.getPoints(30).flatMap(p => [p.x, p.y, p.z]));

    const arcGeo = new THREE.BufferGeometry();
    arcGeo.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));

    return { wireframeGeo: geo, connectionLines: arcGeo };
  }, []);

  useFrame((state, delta) => {
    if (!globeGroupRef.current) return;
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!prefersReducedMotion) {
      globeGroupRef.current.rotation.y += delta * 0.1;
      const targetX = state.pointer.x * 0.12;
      globeGroupRef.current.rotation.y += (targetX - globeGroupRef.current.rotation.y) * 0.03;
    }
  });

  return (
    <group ref={globeGroupRef}>
      {/* Abstract Wireframe Sphere */}
      <mesh geometry={wireframeGeo}>
        <meshBasicMaterial color="#E4E4E7" wireframe transparent opacity={0.4} />
      </mesh>

      {/* Connection Arcs */}
      <lineSegments geometry={connectionLines}>
        <lineBasicMaterial color="#2563EB" opacity={0.5} transparent />
      </lineSegments>

      {/* Opportunity Hub Markers */}
      {HUBS.map((hub, idx) => {
        const isHovered = hoveredIdx === idx;

        return (
          <group
            key={hub.city}
            position={hub.pos}
            onPointerOver={(e) => {
              e.stopPropagation();
              setHoveredIdx(idx);
            }}
            onPointerOut={() => setHoveredIdx(null)}
          >
            <mesh scale={isHovered ? 1.4 : 1}>
              <sphereGeometry args={[0.09, 12, 12]} />
              <meshBasicMaterial color={isHovered ? '#2563EB' : '#18181B'} />
            </mesh>

            {/* Overlay tooltip */}
            <Html distanceFactor={8} position={[0, 0.25, 0]} center>
              <div
                style={{
                  background: isHovered ? '#18181B' : '#FFFFFF',
                  color: isHovered ? '#FFFFFF' : '#18181B',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                  border: '1px solid #E4E4E7',
                  pointerEvents: 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                <div><strong>{hub.city}</strong></div>
                <div style={{ fontSize: '10px', opacity: 0.8 }}>{hub.role} · {hub.count}</div>
              </div>
            </Html>
          </group>
        );
      })}
    </group>
  );
};

const JobGlobe = () => {
  return (
    <div
      style={{
        width: '100%',
        height: '320px',
        background: '#FAFAFA',
        borderRadius: '16px',
        border: '1px solid #E4E4E7',
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 5.2], fov: 45 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.8} />
        <GlobeMesh />
      </Canvas>
    </div>
  );
};

export default JobGlobe;
