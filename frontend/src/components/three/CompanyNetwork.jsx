import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import SceneShell from './SceneShell';

const COMPANIES = [
  { name: 'TechNova', pos: [-2.0, 0.8, 0], size: 0.35 },
  { name: 'PixelForge', pos: [1.8, 1.0, -0.3], size: 0.28 },
  { name: 'Northstar Studio', pos: [-1.5, -1.0, 0.3], size: 0.25 },
  { name: 'Orbit Labs', pos: [2.0, -0.8, 0.2], size: 0.4 },
  { name: 'CloudPeak', pos: [0.2, 1.4, -0.2], size: 0.32 },
  { name: 'GrowthGrid', pos: [-0.4, -1.6, -0.4], size: 0.26 }
];

const CompanyScene = ({ activeCompany }) => {
  const groupRef = useRef();

  const lineGeometry = useMemo(() => {
    const pts = [];
    for (let i = 0; i < COMPANIES.length; i++) {
      for (let j = i + 1; j < COMPANIES.length; j++) {
        const p1 = COMPANIES[i].pos;
        const p2 = COMPANIES[j].pos;
        pts.push(p1[0], p1[1], p1[2]);
        pts.push(p2[0], p2[1], p2[2]);
      }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    return geo;
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
      <lineSegments geometry={lineGeometry}>
        <lineBasicMaterial color="#A1A1AA" opacity={0.25} transparent />
      </lineSegments>

      {COMPANIES.map((comp) => {
        const isActive = activeCompany && comp.name.toLowerCase().includes(activeCompany.toLowerCase());

        return (
          <group key={comp.name} position={comp.pos}>
            <mesh scale={isActive ? 1.4 : 1}>
              <sphereGeometry args={[comp.size, 16, 16]} />
              <meshBasicMaterial color={isActive ? '#2563EB' : '#18181B'} />
            </mesh>

            {/* Emissive Ring */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[comp.size + 0.12, 0.01, 8, 32]} />
              <meshBasicMaterial color={isActive ? '#2563EB' : '#A1A1AA'} opacity={0.5} transparent />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};

const CompanyNetwork = ({ activeCompany }) => {
  return (
    <div style={{ width: '100%', height: '300px', position: 'relative' }}>
      <SceneShell
        camera={{ position: [0, 0, 5.5], fov: 45 }}
        dpr={[1, 1.25]}
        height="100%"
        minHeight="300px"
      >
        <ambientLight intensity={0.8} />
        <CompanyScene activeCompany={activeCompany} />
      </SceneShell>
    </div>
  );
};

export default CompanyNetwork;
