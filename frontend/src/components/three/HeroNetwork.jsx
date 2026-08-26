import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const NetworkMesh = () => {
  const groupRef = useRef();

  // Generate node positions and connections
  const { nodePositions, lineGeometry } = useMemo(() => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const count = isMobile ? 18 : 32;
    const positions = [];
    const points = [];

    // Central node at origin
    positions.push(new THREE.Vector3(0, 0, 0));

    // Outer nodes in a bounded 3D sphere distribution
    for (let i = 0; i < count; i++) {
      const radius = 2.2 + Math.random() * 2.8;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);

      const vec = new THREE.Vector3(x, y, z);
      positions.push(vec);
    }

    // Connect nodes that are within distance threshold
    for (let i = 0; i < positions.length; i++) {
      for (let j = i + 1; j < positions.length; j++) {
        const dist = positions[i].distanceTo(positions[j]);
        if (dist < 3.2) {
          points.push(positions[i].x, positions[i].y, positions[i].z);
          points.push(positions[j].x, positions[j].y, positions[j].z);
        }
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));

    return { nodePositions: positions, lineGeometry: geometry };
  }, []);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    // Check reduced motion
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!prefersReducedMotion) {
      // Gentle constant rotation
      groupRef.current.rotation.y += delta * 0.12;
      groupRef.current.rotation.x += delta * 0.04;

      // Subtle mouse parallax
      const targetX = state.pointer.x * 0.3;
      const targetY = state.pointer.y * 0.3;
      groupRef.current.rotation.y += (targetX - groupRef.current.rotation.y) * 0.05;
      groupRef.current.rotation.x += (-targetY - groupRef.current.rotation.x) * 0.05;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Network Lines */}
      <lineSegments geometry={lineGeometry}>
        <lineBasicMaterial color="#3F3F46" opacity={0.35} transparent />
      </lineSegments>

      {/* Main Node */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.35, 32, 32]} />
        <meshBasicMaterial color="#18181B" />
      </mesh>

      {/* Peripheral Nodes */}
      {nodePositions.slice(1).map((pos, idx) => (
        <mesh key={idx} position={[pos.x, pos.y, pos.z]}>
          <sphereGeometry args={[idx % 3 === 0 ? 0.14 : 0.09, 16, 16]} />
          <meshBasicMaterial
            color={idx % 4 === 0 ? '#18181B' : idx % 2 === 0 ? '#52525B' : '#A1A1AA'}
            opacity={0.85}
            transparent
          />
        </mesh>
      ))}
    </group>
  );
};

const HeroNetwork = () => {
  return (
    <div style={{ width: '100%', height: '100%', minHeight: '380px', position: 'relative' }}>
      <Canvas
        camera={{ position: [0, 0, 7.5], fov: 45 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
      >
        <ambientLight intensity={0.8} />
        <NetworkMesh />
      </Canvas>
    </div>
  );
};

export default HeroNetwork;
