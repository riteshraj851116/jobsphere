import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

const GraphContent = ({ skills = [] }) => {
  const groupRef = useRef();
  const [hoveredIdx, setHoveredIdx] = useState(null);

  // Normalize skill items (fallback if list is short)
  const skillList = useMemo(() => {
    const defaultSkills = ['React', 'JavaScript', 'Node.js', 'REST API', 'System Architecture', 'TypeScript'];
    const merged = Array.from(new Set([...skills, ...defaultSkills]));
    return merged.slice(0, 7);
  }, [skills]);

  // Compute node 3D positions in a spherical layout
  const { nodePositions, lineGeometry } = useMemo(() => {
    const positions = [];
    const points = [];
    const count = skillList.length;

    // Center node
    positions.push(new THREE.Vector3(0, 0, 0));

    // Outer nodes arranged around center
    for (let i = 1; i < count; i++) {
      const angle = ((i - 1) / (count - 1)) * Math.PI * 2;
      const radius = 2.0;
      const zOffset = (Math.sin(i * 1.5) * 0.6);
      positions.push(new THREE.Vector3(
        Math.cos(angle) * radius,
        Math.sin(angle) * radius,
        zOffset
      ));
    }

    // Connect central node to all outer nodes, and adjacent outer nodes
    for (let i = 1; i < count; i++) {
      points.push(positions[0].x, positions[0].y, positions[0].z);
      points.push(positions[i].x, positions[i].y, positions[i].z);

      const nextIdx = i === count - 1 ? 1 : i + 1;
      points.push(positions[i].x, positions[i].y, positions[i].z);
      points.push(positions[nextIdx].x, positions[nextIdx].y, positions[nextIdx].z);
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));

    return { nodePositions: positions, lineGeometry: geometry };
  }, [skillList]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!prefersReducedMotion) {
      groupRef.current.rotation.y += delta * 0.15;
      const targetX = state.pointer.x * 0.2;
      const targetY = state.pointer.y * 0.2;
      groupRef.current.rotation.y += (targetX - groupRef.current.rotation.y) * 0.05;
      groupRef.current.rotation.x += (-targetY - groupRef.current.rotation.x) * 0.05;
    }
  });

  return (
    <group ref={groupRef}>
      <lineSegments geometry={lineGeometry}>
        <lineBasicMaterial color="#71717A" opacity={0.4} transparent />
      </lineSegments>

      {nodePositions.map((pos, idx) => {
        const isHovered = hoveredIdx === idx;
        const isCenter = idx === 0;
        const skillName = skillList[idx] || 'Skill';

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
              <sphereGeometry args={[isCenter ? 0.3 : 0.2, 16, 16]} />
              <meshBasicMaterial color={isHovered ? '#2563EB' : isCenter ? '#18181B' : '#52525B'} />
            </mesh>

            <Html distanceFactor={10} position={[0, isCenter ? 0.45 : 0.35, 0]} center>
              <div
                style={{
                  background: isHovered ? '#18181B' : '#FFFFFF',
                  color: isHovered ? '#FFFFFF' : '#18181B',
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

const CareerGraph = ({ skills = [] }) => {
  return (
    <div
      style={{
        width: '100%',
        height: '260px',
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
        <GraphContent skills={skills} />
      </Canvas>
    </div>
  );
};

export default CareerGraph;
