import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const NetworkMesh = () => {
  const groupRef = useRef();
  const lineMeshRef = useRef();

  // Create node hierarchy: 1 Central Hub, 6 Medium Clusters, 28 Small Skill/People nodes
  const { nodes, lineGeometry } = useMemo(() => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const nodeList = [];

    // 1. Central Career Hub Node
    nodeList.push({
      size: 0.45,
      color: '#18181B',
      basePos: new THREE.Vector3(0, 0, 0),
      currentPos: new THREE.Vector3(0, 0, 0),
      tier: 'HUB'
    });

    // 2. Medium Category Nodes
    const mediumCount = 6;
    for (let i = 0; i < mediumCount; i++) {
      const angle = (i / mediumCount) * Math.PI * 2;
      const radius = 2.2;
      const pos = new THREE.Vector3(
        Math.cos(angle) * radius,
        Math.sin(angle) * radius,
        (Math.random() - 0.5) * 0.6
      );

      nodeList.push({
        size: 0.22,
        color: '#2563EB',
        basePos: pos,
        currentPos: pos.clone(),
        tier: 'MEDIUM'
      });
    }

    // 3. Small Skill/Job/People Nodes
    const smallCount = isMobile ? 14 : 26;
    for (let i = 0; i < smallCount; i++) {
      const radius = 2.8 + Math.random() * 2.0;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const pos = new THREE.Vector3(
        radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.sin(phi) * Math.sin(theta),
        radius * Math.cos(phi) * 0.5
      );

      nodeList.push({
        size: 0.1,
        color: i % 3 === 0 ? '#18181B' : '#71717A',
        basePos: pos,
        currentPos: pos.clone(),
        tier: 'SMALL'
      });
    }

    // Build connections
    const points = [];
    for (let i = 0; i < nodeList.length; i++) {
      for (let j = i + 1; j < nodeList.length; j++) {
        const dist = nodeList[i].basePos.distanceTo(nodeList[j].basePos);
        if (dist < 2.6) {
          points.push(nodeList[i].basePos.x, nodeList[i].basePos.y, nodeList[i].basePos.z);
          points.push(nodeList[j].basePos.x, nodeList[j].basePos.y, nodeList[j].basePos.z);
        }
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));

    return { nodes: nodeList, lineGeometry: geometry };
  }, []);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const pointer = state.pointer;
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!prefersReducedMotion) {
      // Gentle constant rotation
      groupRef.current.rotation.y += delta * 0.08;
      groupRef.current.rotation.x += delta * 0.02;

      // Subtle cursor attraction / bending
      const mouse3D = new THREE.Vector3(pointer.x * 3, pointer.y * 3, 0);

      nodes.forEach((node) => {
        const dist = node.basePos.distanceTo(mouse3D);
        const target = node.basePos.clone();

        if (dist < 2.4) {
          const pull = (2.4 - dist) * 0.15;
          const dir = new THREE.Vector3().subVectors(mouse3D, node.basePos).normalize().multiplyScalar(pull);
          target.add(dir);
        }

        node.currentPos.lerp(target, 0.05);
      });
    }
  });

  return (
    <group ref={groupRef}>
      {/* Network Lines */}
      <lineSegments ref={lineMeshRef} geometry={lineGeometry}>
        <lineBasicMaterial color="#71717A" opacity={0.3} transparent />
      </lineSegments>

      {/* Nodes */}
      {nodes.map((node, idx) => (
        <mesh key={idx} position={[node.currentPos.x, node.currentPos.y, node.currentPos.z]}>
          <sphereGeometry args={[node.size, 16, 16]} />
          <meshBasicMaterial color={node.color} opacity={0.9} transparent />
        </mesh>
      ))}
    </group>
  );
};

const CareerNetwork = () => {
  return (
    <div style={{ width: '100%', height: '100%', minHeight: '380px', position: 'relative' }}>
      <Canvas
        camera={{ position: [0, 0, 7], fov: 45 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
      >
        <ambientLight intensity={0.9} />
        <NetworkMesh />
      </Canvas>
    </div>
  );
};

export default CareerNetwork;
