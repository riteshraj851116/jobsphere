import React, { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import SceneShell from './SceneShell';

const ConstellationMesh = ({ skills = [] }) => {
  const groupRef = useRef();
  const [hoveredIdx, setHoveredIdx] = useState(null);

  const { nodePositions, lineGeometry } = useMemo(() => {
    const positions = [];
    const points = [];
    const count = skills.length;

    // Central identity node
    positions.push(new THREE.Vector3(0, 0, 0));

    // Orbiting skill nodes
    for (let i = 1; i <= count; i++) {
      const angle = ((i - 1) / count) * Math.PI * 2;
      const radius = 2.0;
      const pos = new THREE.Vector3(
        Math.cos(angle) * radius,
        Math.sin(angle) * radius,
        (Math.sin(i * 2) * 0.4)
      );
      positions.push(pos);

      // Lines connecting to central node
      points.push(0, 0, 0);
      points.push(pos.x, pos.y, pos.z);
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
      groupRef.current.rotation.y += delta * 0.08;
      const targetX = state.pointer.x * 0.15;
      groupRef.current.rotation.y += (targetX - groupRef.current.rotation.y) * 0.04;
    }
  });

  return (
    <group ref={groupRef}>
      <lineSegments geometry={lineGeometry}>
        <lineBasicMaterial color="#A1A1AA" opacity={0.35} transparent />
      </lineSegments>

      {nodePositions.map((pos, idx) => {
        const isCenter = idx === 0;
        const isHovered = hoveredIdx === idx;
        const label = isCenter ? 'IDENTITY CORE' : skills[idx - 1];

        return (
          <group
            key={idx}
            position={[pos.x, pos.y, pos.z]}
            onPointerOver={(e) => {
              e.stopPropagation();
              setHoveredIdx(idx);
            }}
            onPointerOut={() => setHoveredIdx(null)}
          >
            <mesh scale={isHovered ? 1.3 : 1}>
              <sphereGeometry args={[isCenter ? 0.32 : 0.18, 16, 16]} />
              <meshBasicMaterial color={isHovered ? '#2563EB' : isCenter ? '#18181B' : '#52525B'} />
            </mesh>

            <Html distanceFactor={8.5} position={[0, isCenter ? 0.45 : 0.32, 0]} center>
              <div
                style={{
                  background: isHovered ? '#18181B' : '#FFFFFF',
                  color: isHovered ? '#FFFFFF' : '#18181B',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '10px',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
                  border: '1px solid #E4E4E7',
                  pointerEvents: 'none'
                }}
              >
                {label}
              </div>
            </Html>
          </group>
        );
      })}
    </group>
  );
};

const ProfileConstellation = ({ skills = [] }) => {
  if (!skills || skills.length === 0) {
    return (
      <div
        style={{
          width: '100%',
          padding: '1.5rem 1rem',
          textAlign: 'center',
          background: '#F7F7F5',
          borderRadius: '12px',
          border: '1px dashed #E4E4E7',
          color: '#71717A',
          fontSize: '0.8125rem'
        }}
      >
        Add skills to your profile to build your Professional Identity Constellation.
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '240px', position: 'relative' }}>
      <SceneShell
        camera={{ position: [0, 0, 5.5], fov: 45 }}
        dpr={[1, 1.25]}
        height="240px"
        minHeight="240px"
      >
        <ambientLight intensity={0.8} />
        <ConstellationMesh skills={skills} />
      </SceneShell>
    </div>
  );
};

export default ProfileConstellation;
