import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

const ConstellationScene = ({ skills = [] }) => {
  const groupRef = useRef();
  const [activeIdx, setActiveIdx] = useState(null);
  const [hoveredIdx, setHoveredIdx] = useState(null);

  // Position nodes in a 3D constellation formation
  const { nodePositions, lineGeometry } = useMemo(() => {
    const positions = [];
    const points = [];
    const count = skills.length;

    for (let i = 0; i < count; i++) {
      const radius = i === 0 ? 0 : 1.5 + (i * 0.35);
      const angle = (i / Math.max(1, count - 1)) * Math.PI * 2;
      const x = i === 0 ? 0 : Math.cos(angle) * Math.min(radius, 2.5);
      const y = i === 0 ? 0 : Math.sin(angle) * Math.min(radius, 2.5);
      const z = (Math.sin(i * 2) * 0.4);

      positions.push(new THREE.Vector3(x, y, z));
    }

    // Connect node 0 to all nodes, and form ring between neighbors
    for (let i = 1; i < count; i++) {
      points.push(positions[0].x, positions[0].y, positions[0].z);
      points.push(positions[i].x, positions[i].y, positions[i].z);

      const next = i === count - 1 ? 1 : i + 1;
      points.push(positions[i].x, positions[i].y, positions[i].z);
      points.push(positions[next].x, positions[next].y, positions[next].z);
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));

    return { nodePositions: positions, lineGeometry: geometry };
  }, [skills]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!prefersReducedMotion) {
      groupRef.current.rotation.y += delta * 0.1;
      const targetX = state.pointer.x * 0.15;
      const targetY = state.pointer.y * 0.15;
      groupRef.current.rotation.y += (targetX - groupRef.current.rotation.y) * 0.04;
      groupRef.current.rotation.x += (-targetY - groupRef.current.rotation.x) * 0.04;
    }
  });

  return (
    <group ref={groupRef}>
      <lineSegments geometry={lineGeometry}>
        <lineBasicMaterial color="#A1A1AA" opacity={0.35} transparent />
      </lineSegments>

      {nodePositions.map((pos, idx) => {
        const isHovered = hoveredIdx === idx;
        const isActive = activeIdx === idx;
        const isMain = idx === 0;
        const skillName = skills[idx];

        return (
          <group
            key={idx}
            position={[pos.x, pos.y, pos.z]}
            onPointerOver={(e) => {
              e.stopPropagation();
              setHoveredIdx(idx);
            }}
            onPointerOut={() => setHoveredIdx(null)}
            onClick={(e) => {
              e.stopPropagation();
              setActiveIdx(activeIdx === idx ? null : idx);
            }}
          >
            <mesh scale={isHovered || isActive ? 1.4 : 1}>
              <sphereGeometry args={[isMain ? 0.28 : 0.16, 16, 16]} />
              <meshBasicMaterial
                color={isActive ? '#2563EB' : isHovered ? '#18181B' : isMain ? '#18181B' : '#71717A'}
              />
            </mesh>

            <Html distanceFactor={9} position={[0, isMain ? 0.4 : 0.3, 0]} center>
              <div
                style={{
                  background: isActive || isHovered ? '#18181B' : '#FFFFFF',
                  color: isActive || isHovered ? '#FFFFFF' : '#18181B',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  border: '1px solid #E4E4E7',
                  pointerEvents: 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                {skillName}
              </div>
            </Html>
          </group>
        );
      })}
    </group>
  );
};

const SkillConstellation = ({ skills = [] }) => {
  // If no skills exist, display clean empty state instead of fake data
  if (!skills || skills.length === 0) {
    return (
      <div
        style={{
          width: '100%',
          padding: '2rem 1rem',
          textAlign: 'center',
          background: '#F7F7F5',
          borderRadius: '12px',
          border: '1px dashed #E4E4E7',
          color: '#71717A',
          fontSize: '0.875rem'
        }}
      >
        Add skills to your profile to generate your 3D Skill Constellation.
      </div>
    );
  }

  return (
    <div
      style={{
        width: '100%',
        height: '240px',
        background: '#FAFAFA',
        borderRadius: '12px',
        border: '1px solid #E4E4E7',
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 5.5], fov: 45 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.8} />
        <ConstellationScene skills={skills} />
      </Canvas>
    </div>
  );
};

export default SkillConstellation;
