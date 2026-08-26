import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const StreamMesh = () => {
  const groupRef = useRef();

  const { points, lineGeometry } = useMemo(() => {
    const pts = [];
    const count = 30;
    const positions = [];

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 4;
      const radius = 1.8 + (i * 0.04);
      const x = Math.cos(angle) * radius;
      const y = (i * 0.12) - 1.8;
      const z = Math.sin(angle) * radius;
      positions.push(new THREE.Vector3(x, y, z));
    }

    for (let i = 0; i < count - 1; i++) {
      pts.push(positions[i].x, positions[i].y, positions[i].z);
      pts.push(positions[i + 1].x, positions[i + 1].y, positions[i + 1].z);
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));

    return { points: positions, lineGeometry: geo };
  }, []);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!prefersReducedMotion) {
      groupRef.current.rotation.y += delta * 0.12;
    }
  });

  return (
    <group ref={groupRef}>
      <lineSegments geometry={lineGeometry}>
        <lineBasicMaterial color="#2563EB" opacity={0.4} transparent />
      </lineSegments>

      {points.map((pos, idx) => (
        <mesh key={idx} position={[pos.x, pos.y, pos.z]}>
          <sphereGeometry args={[0.07, 12, 12]} />
          <meshBasicMaterial color={idx % 3 === 0 ? '#2563EB' : '#18181B'} />
        </mesh>
      ))}
    </group>
  );
};

const DataFlow = () => {
  return (
    <div style={{ width: '100%', height: '220px', position: 'relative' }}>
      <Canvas
        camera={{ position: [0, 0, 5.0], fov: 45 }}
        dpr={[1, 1.25]}
        gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
      >
        <ambientLight intensity={0.8} />
        <StreamMesh />
      </Canvas>
    </div>
  );
};

export default DataFlow;
