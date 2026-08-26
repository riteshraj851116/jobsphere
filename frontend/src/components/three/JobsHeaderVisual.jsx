import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const ClusterMesh = () => {
  const meshRef = useRef();

  const { points, lineGeometry } = useMemo(() => {
    const pts = [];
    const count = 7;
    const positions = [];

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const radius = 1.2 + Math.sin(i * 2) * 0.3;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      const z = Math.cos(i) * 0.3;
      positions.push(new THREE.Vector3(x, y, z));
    }

    for (let i = 0; i < count; i++) {
      const next = (i + 1) % count;
      pts.push(positions[i].x, positions[i].y, positions[i].z);
      pts.push(positions[next].x, positions[next].y, positions[next].z);
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));

    return { points: positions, lineGeometry: geometry };
  }, []);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!prefersReducedMotion) {
      meshRef.current.rotation.y += delta * 0.1;
    }
  });

  return (
    <group ref={meshRef}>
      <lineSegments geometry={lineGeometry}>
        <lineBasicMaterial color="#A1A1AA" opacity={0.35} transparent />
      </lineSegments>

      {points.map((pos, idx) => (
        <mesh key={idx} position={[pos.x, pos.y, pos.z]}>
          <sphereGeometry args={[0.09, 12, 12]} />
          <meshBasicMaterial color={idx % 2 === 0 ? '#18181B' : '#71717A'} />
        </mesh>
      ))}
    </group>
  );
};

const JobsHeaderVisual = () => {
  return (
    <div style={{ width: '120px', height: '80px', position: 'relative' }}>
      <Canvas
        camera={{ position: [0, 0, 4], fov: 45 }}
        dpr={[1, 1.25]}
        gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
      >
        <ambientLight intensity={0.8} />
        <ClusterMesh />
      </Canvas>
    </div>
  );
};

export default JobsHeaderVisual;
