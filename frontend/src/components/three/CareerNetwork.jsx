import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import SceneShell from './SceneShell';

const NetworkMesh = () => {
  const groupRef = useRef();
  const coreRef = useRef();
  const ring1Ref = useRef();
  const ring2Ref = useRef();
  const particlesRef = useRef();
  const lineMeshRef = useRef();

  // Create rich 3D node hierarchy & particles
  const { nodes, lineGeometry, particlePositions } = useMemo(() => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const nodeList = [];

    // 1. Central Career Hub Core
    nodeList.push({
      size: 0.52,
      color: '#111111',
      basePos: new THREE.Vector3(0, 0, 0),
      currentPos: new THREE.Vector3(0, 0, 0),
      tier: 'HUB'
    });

    // 2. Primary Orbit Nodes
    const primaryCount = 8;
    for (let i = 0; i < primaryCount; i++) {
      const angle = (i / primaryCount) * Math.PI * 2;
      const radius = 2.4;
      const pos = new THREE.Vector3(
        Math.cos(angle) * radius,
        Math.sin(angle) * radius,
        (Math.sin(angle * 2)) * 0.4
      );

      nodeList.push({
        size: 0.22,
        color: '#222222',
        basePos: pos,
        currentPos: pos.clone(),
        tier: 'PRIMARY'
      });
    }

    // 3. Constellation / Skill / Professional Nodes
    const outerCount = isMobile ? 18 : 34;
    for (let i = 0; i < outerCount; i++) {
      const radius = 3.0 + Math.random() * 2.2;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const pos = new THREE.Vector3(
        radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.sin(phi) * Math.sin(theta),
        radius * Math.cos(phi) * 0.6
      );

      nodeList.push({
        size: 0.11,
        color: i % 2 === 0 ? '#333333' : '#666666',
        basePos: pos,
        currentPos: pos.clone(),
        tier: 'OUTER'
      });
    }

    // 4. Dynamic connecting web lines
    const points = [];
    for (let i = 0; i < nodeList.length; i++) {
      for (let j = i + 1; j < nodeList.length; j++) {
        const dist = nodeList[i].basePos.distanceTo(nodeList[j].basePos);
        if (dist < 2.5) {
          points.push(nodeList[i].basePos.x, nodeList[i].basePos.y, nodeList[i].basePos.z);
          points.push(nodeList[j].basePos.x, nodeList[j].basePos.y, nodeList[j].basePos.z);
        }
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));

    // 5. Star / Particle Dust Field
    const pCount = isMobile ? 60 : 120;
    const pCoords = new Float32Array(pCount * 3);
    for (let i = 0; i < pCount; i++) {
      pCoords[i * 3] = (Math.random() - 0.5) * 12;
      pCoords[i * 3 + 1] = (Math.random() - 0.5) * 10;
      pCoords[i * 3 + 2] = (Math.random() - 0.5) * 8;
    }

    return { nodes: nodeList, lineGeometry: geometry, particlePositions: pCoords };
  }, []);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const pointer = state.pointer;
    const time = state.clock.getElapsedTime();
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!prefersReducedMotion) {
      // Smooth continuous rotational drift
      groupRef.current.rotation.y += delta * 0.12;
      groupRef.current.rotation.x = Math.sin(time * 0.3) * 0.1;

      // Mouse parallax tilt
      groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, pointer.x * 0.6, 0.05);
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, pointer.y * 0.4, 0.05);

      // Core spinning animation
      if (coreRef.current) {
        coreRef.current.rotation.y -= delta * 0.4;
        coreRef.current.rotation.z += delta * 0.2;
        const pulse = 1 + Math.sin(time * 2) * 0.06;
        coreRef.current.scale.set(pulse, pulse, pulse);
      }

      // Orbit rings spinning
      if (ring1Ref.current) {
        ring1Ref.current.rotation.z += delta * 0.25;
        ring1Ref.current.rotation.x = 1.1 + Math.sin(time * 0.5) * 0.1;
      }
      if (ring2Ref.current) {
        ring2Ref.current.rotation.z -= delta * 0.18;
        ring2Ref.current.rotation.y = 0.8 + Math.cos(time * 0.4) * 0.15;
      }

      // Cursor physics pulling nearby nodes
      const mouse3D = new THREE.Vector3(pointer.x * 3.5, pointer.y * 3.5, 0);
      nodes.forEach((node) => {
        const dist = node.basePos.distanceTo(mouse3D);
        const target = node.basePos.clone();

        if (dist < 2.6) {
          const pull = (2.6 - dist) * 0.22;
          const dir = new THREE.Vector3().subVectors(mouse3D, node.basePos).normalize().multiplyScalar(pull);
          target.add(dir);
        }

        node.currentPos.lerp(target, 0.08);
      });
    }
  });

  return (
    <group ref={groupRef}>
      {/* Dynamic Network Connecting Lines */}
      <lineSegments ref={lineMeshRef} geometry={lineGeometry}>
        <lineBasicMaterial color="#71717A" opacity={0.38} transparent />
      </lineSegments>

      {/* Orbital Ring 1 */}
      <mesh ref={ring1Ref} rotation={[1.1, 0, 0]}>
        <torusGeometry args={[2.5, 0.012, 16, 100]} />
        <meshBasicMaterial color="#333333" opacity={0.5} transparent />
      </mesh>

      {/* Orbital Ring 2 */}
      <mesh ref={ring2Ref} rotation={[0.5, 0.8, 0]}>
        <torusGeometry args={[3.2, 0.012, 16, 100]} />
        <meshBasicMaterial color="#666666" opacity={0.35} transparent />
      </mesh>

      {/* Central 3D Icosahedron Core */}
      <mesh ref={coreRef} position={[0, 0, 0]}>
        <icosahedronGeometry args={[0.7, 1]} />
        <meshBasicMaterial color="#111111" wireframe transparent opacity={0.7} />
      </mesh>

      {/* Nodes */}
      {nodes.map((node, idx) => (
        <mesh key={idx} position={[node.currentPos.x, node.currentPos.y, node.currentPos.z]}>
          <sphereGeometry args={[node.size, 16, 16]} />
          <meshBasicMaterial color={node.color} opacity={0.92} transparent />
        </mesh>
      ))}

      {/* Background Star / Tech Dust Particles */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={particlePositions.length / 3}
            array={particlePositions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial size={0.035} color="#555555" transparent opacity={0.4} sizeAttenuation />
      </points>
    </group>
  );
};

const CareerNetwork = () => {
  const camera = useMemo(() => ({ position: [0, 0, 7.2], fov: 45 }), []);
  return (
    <SceneShell camera={camera} minHeight="380px">
      <ambientLight intensity={0.9} />
      <NetworkMesh />
    </SceneShell>
  );
};

export default CareerNetwork;
