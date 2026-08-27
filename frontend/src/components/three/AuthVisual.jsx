import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import SceneShell from './SceneShell';

const AuthMesh = () => {
  const meshRef = useRef();

  const { points, lineGeometry } = useMemo(() => {
    const pts = [];
    const count = 12;
    const positions = [];

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const radius = 1.8 + Math.sin(i * 3) * 0.4;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      const z = Math.cos(i * 1.5) * 0.5;

      positions.push(new THREE.Vector3(x, y, z));
    }

    for (let i = 0; i < count; i++) {
      const next = (i + 1) % count;
      pts.push(positions[i].x, positions[i].y, positions[i].z);
      pts.push(positions[next].x, positions[next].y, positions[next].z);

      const cross = (i + 4) % count;
      pts.push(positions[i].x, positions[i].y, positions[i].z);
      pts.push(positions[cross].x, positions[cross].y, positions[cross].z);
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
      meshRef.current.rotation.y += delta * 0.08;
      meshRef.current.rotation.x += delta * 0.03;
    }
  });

  return (
    <group ref={meshRef}>
      <lineSegments geometry={lineGeometry}>
        <lineBasicMaterial color="#3F3F46" opacity={0.3} transparent />
      </lineSegments>

      {points.map((pos, idx) => (
        <mesh key={idx} position={[pos.x, pos.y, pos.z]}>
          <sphereGeometry args={[0.08, 12, 12]} />
          <meshBasicMaterial color={idx % 2 === 0 ? '#18181B' : '#71717A'} />
        </mesh>
      ))}
    </group>
  );
};

const AuthVisual = () => {
  return (
    <SceneShell
      camera={{ position: [0, 0, 5], fov: 45 }}
      dpr={[1, 1.25]}
      minHeight="300px"
    >
      <ambientLight intensity={0.8} />
      <AuthMesh />
    </SceneShell>
  );
};

export default AuthVisual;
