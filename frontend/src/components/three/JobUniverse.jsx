import React, { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import SceneShell from './SceneShell';

const CATEGORIES = [
  { name: 'Frontend', pos: [-2.2, 0.8, 0], color: '#18181B' },
  { name: 'Backend', pos: [2.0, 1.0, -0.4], color: '#27272A' },
  { name: 'Full Stack', pos: [0, 0, 0.2], color: '#2563EB', isCenter: true },
  { name: 'Design', pos: [-1.8, -1.2, 0.3], color: '#3F3F46' },
  { name: 'DevOps', pos: [1.8, -1.0, 0.2], color: '#52525B' },
  { name: 'Data', pos: [0.2, 1.8, -0.2], color: '#71717A' },
  { name: 'Product', pos: [-0.4, -1.8, -0.3], color: '#3F3F46' }
];

const UniverseScene = ({ onSelectCategory }) => {
  const groupRef = useRef();
  const [hoveredIdx, setHoveredIdx] = useState(null);

  const lineGeometry = useMemo(() => {
    const pts = [];
    // Connect center ('Full Stack') to all other clusters
    const centerPos = CATEGORIES[2].pos;
    CATEGORIES.forEach((cat, idx) => {
      if (idx !== 2) {
        pts.push(centerPos[0], centerPos[1], centerPos[2]);
        pts.push(cat.pos[0], cat.pos[1], cat.pos[2]);
      }
    });

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    return geometry;
  }, []);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!prefersReducedMotion) {
      groupRef.current.rotation.y += delta * 0.08;
      const targetX = state.pointer.x * 0.15;
      const targetY = state.pointer.y * 0.15;
      groupRef.current.rotation.y += (targetX - groupRef.current.rotation.y) * 0.04;
      groupRef.current.rotation.x += (-targetY - groupRef.current.rotation.x) * 0.04;
    }
  });

  return (
    <group ref={groupRef}>
      <lineSegments geometry={lineGeometry}>
        <lineBasicMaterial color="#A1A1AA" opacity={0.3} transparent />
      </lineSegments>

      {CATEGORIES.map((cat, idx) => {
        const isHovered = hoveredIdx === idx;

        return (
          <group
            key={cat.name}
            position={cat.pos}
            onPointerOver={(e) => {
              e.stopPropagation();
              setHoveredIdx(idx);
            }}
            onPointerOut={() => setHoveredIdx(null)}
            onClick={() => onSelectCategory && onSelectCategory(cat.name)}
          >
            {/* Cluster core */}
            <mesh scale={isHovered ? 1.35 : 1}>
              <sphereGeometry args={[cat.isCenter ? 0.32 : 0.22, 20, 20]} />
              <meshBasicMaterial color={isHovered ? '#2563EB' : cat.color} />
            </mesh>

            {/* Orbiting satellite node */}
            <mesh position={[0.45, 0.2, 0]} scale={0.5}>
              <sphereGeometry args={[0.1, 12, 12]} />
              <meshBasicMaterial color="#71717A" opacity={0.7} transparent />
            </mesh>

            {/* DOM Overlay Tooltip */}
            <Html distanceFactor={10} position={[0, 0.4, 0]} center>
              <div
                style={{
                  background: isHovered ? '#18181B' : '#FFFFFF',
                  color: isHovered ? '#FFFFFF' : '#18181B',
                  padding: '3px 9px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                  border: '1px solid #E4E4E7',
                  pointerEvents: 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                {cat.name}
              </div>
            </Html>
          </group>
        );
      })}
    </group>
  );
};

const JobUniverse = ({ onSelectCategory }) => {
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
      <SceneShell
        camera={{ position: [0, 0, 6], fov: 45 }}
        dpr={[1, 1.5]}
        height="100%"
        minHeight="320px"
      >
        <ambientLight intensity={0.8} />
        <UniverseScene onSelectCategory={onSelectCategory} />
      </SceneShell>
    </div>
  );
};

export default JobUniverse;
