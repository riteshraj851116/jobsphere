import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const DisconnectedMesh = () => {
  const groupRef = useRef();

  const { disconnectedNode, nodeCluster, lineGeometry } = useMemo(() => {
    // Cluster of connected nodes on the right
    const cluster = [
      new THREE.Vector3(1.2, 0.5, 0),
      new THREE.Vector3(2.0, -0.4, 0.3),
      new THREE.Vector3(1.5, -1.0, -0.2),
      new THREE.Vector3(2.2, 0.8, -0.4)
    ];

    // Single disconnected node on the left
    const disconnected = new THREE.Vector3(-1.8, 0, 0);

    const pts = [
      cluster[0].x, cluster[0].y, cluster[0].z, cluster[1].x, cluster[1].y, cluster[1].z,
      cluster[1].x, cluster[1].y, cluster[1].z, cluster[2].x, cluster[2].y, cluster[2].z,
      cluster[2].x, cluster[2].y, cluster[2].z, cluster[3].x, cluster[3].y, cluster[3].z,
      cluster[3].x, cluster[3].y, cluster[3].z, cluster[0].x, cluster[0].y, cluster[0].z
    ];

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));

    return { disconnectedNode: disconnected, nodeCluster: cluster, lineGeometry: geometry };
  }, []);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!prefersReducedMotion) {
      groupRef.current.rotation.y += delta * 0.06;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Cluster lines */}
      <lineSegments geometry={lineGeometry}>
        <lineBasicMaterial color="#A1A1AA" opacity={0.35} transparent />
      </lineSegments>

      {/* Cluster nodes */}
      {nodeCluster.map((pos, idx) => (
        <mesh key={idx} position={[pos.x, pos.y, pos.z]}>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshBasicMaterial color="#52525B" />
        </mesh>
      ))}

      {/* Disconnected lone node */}
      <mesh position={[disconnectedNode.x, disconnectedNode.y, disconnectedNode.z]}>
        <sphereGeometry args={[0.24, 16, 16]} />
        <meshBasicMaterial color="#DC2626" opacity={0.85} transparent />
      </mesh>
    </group>
  );
};

const NotFoundScene = () => {
  return (
    <div style={{ width: '100%', height: '220px', maxWidth: '400px', margin: '0 auto', position: 'relative' }}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        dpr={[1, 1.25]}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.8} />
        <DisconnectedMesh />
      </Canvas>
    </div>
  );
};

export default NotFoundScene;
