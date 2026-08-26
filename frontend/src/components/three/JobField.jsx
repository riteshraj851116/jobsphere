import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const CLUSTERS = [
  { name: 'Frontend', pos: [-2.2, 0.6, 0], color: '#2563EB' },
  { name: 'Backend', pos: [2.0, 0.8, -0.2], color: '#18181B' },
  { name: 'Full Stack', pos: [0, 0, 0.2], color: '#18181B' },
  { name: 'UI/UX', pos: [-1.8, -1.0, 0.3], color: '#71717A' },
  { name: 'DevOps', pos: [1.8, -0.8, 0.2], color: '#52525B' },
  { name: 'Data', pos: [0.2, 1.4, -0.3], color: '#3F3F46' }
];

const FieldScene = ({ activeCategory }) => {
  const groupRef = useRef();

  const lineGeometry = useMemo(() => {
    const pts = [];
    const center = CLUSTERS[2].pos;
    CLUSTERS.forEach((c, idx) => {
      if (idx !== 2) {
        pts.push(center[0], center[1], center[2]);
        pts.push(c.pos[0], c.pos[1], c.pos[2]);
      }
    });

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    return geo;
  }, []);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!prefersReducedMotion) {
      groupRef.current.rotation.y += delta * 0.05;
    }
  });

  return (
    <group ref={groupRef}>
      <lineSegments geometry={lineGeometry}>
        <lineBasicMaterial color="#A1A1AA" opacity={0.3} transparent />
      </lineSegments>

      {CLUSTERS.map((cluster) => {
        const isActive = activeCategory && cluster.name.toLowerCase().includes(activeCategory.toLowerCase());

        return (
          <group key={cluster.name} position={cluster.pos}>
            <mesh scale={isActive ? 1.4 : 1}>
              <sphereGeometry args={[0.25, 16, 16]} />
              <meshBasicMaterial color={isActive ? '#2563EB' : cluster.color} opacity={0.85} transparent />
            </mesh>

            {/* Orbiting micro particles */}
            <mesh position={[0.4, 0.2, 0]} scale={0.4}>
              <sphereGeometry args={[0.08, 12, 12]} />
              <meshBasicMaterial color="#71717A" opacity={0.6} transparent />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};

const JobField = ({ activeCategory }) => {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
        overflow: 'hidden'
      }}
      aria-hidden="true"
    >
      <Canvas
        camera={{ position: [0, 0, 5.5], fov: 45 }}
        dpr={[1, 1.25]}
        gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
      >
        <ambientLight intensity={0.8} />
        <FieldScene activeCategory={activeCategory} />
      </Canvas>
    </div>
  );
};

export default JobField;
