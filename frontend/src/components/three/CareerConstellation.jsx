import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import SceneShell from './SceneShell';
import * as THREE from 'three';

const PATH_STAGES = [
  { name: 'Developer', pos: [-2.5, -1.0, 0] },
  { name: 'Frontend', pos: [-1.2, -0.2, 0.4] },
  { name: 'React Expert', pos: [0.0, 0.4, -0.2] },
  { name: 'Senior Engineer', pos: [1.2, 0.0, 0.3] },
  { name: 'Tech Lead', pos: [2.5, 0.8, 0] }
];

const ConstellationScene = () => {
  const groupRef = useRef();

  const { lineGeo } = useMemo(() => {
    const rawPoints = PATH_STAGES.map((s) => new THREE.Vector3(...s.pos));
    const curve = new THREE.CatmullRomCurve3(rawPoints);
    const pts = curve.getPoints(50);
    const geo = new THREE.BufferGeometry().setFromPoints(pts);
    return { lineGeo: geo };
  }, []);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!prefersReducedMotion) {
      groupRef.current.rotation.y += delta * 0.06;
      const targetX = state.pointer.x * 0.15;
      groupRef.current.rotation.y += (targetX - groupRef.current.rotation.y) * 0.03;
    }
  });

  return (
    <group ref={groupRef}>
      <line geometry={lineGeo}>
        <lineBasicMaterial color="#2563EB" opacity={0.4} transparent linewidth={2} />
      </line>

      {PATH_STAGES.map((stage, idx) => (
        <group key={stage.name} position={stage.pos}>
          <mesh>
            <sphereGeometry args={[0.2, 16, 16]} />
            <meshBasicMaterial color={idx === 2 ? '#2563EB' : '#18181B'} />
          </mesh>

          <Html distanceFactor={8} position={[0, 0.35, 0]} center>
            <div
              style={{
                background: '#FFFFFF',
                color: '#18181B',
                padding: '3px 8px',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: 600,
                whiteSpace: 'nowrap',
                boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
                border: '1px solid #E4E4E7',
                pointerEvents: 'none'
              }}
            >
              {stage.name}
            </div>
          </Html>
        </group>
      ))}
    </group>
  );
};

const CareerConstellation = () => {
  return (
    <div style={{ width: '100%', height: '260px', position: 'relative' }}>
      <SceneShell
        camera={{ position: [0, 0, 5.5], fov: 45 }}
        height="260px"
        minHeight="260px"
      >
        <ambientLight intensity={0.8} />
        <ConstellationScene />
      </SceneShell>
    </div>
  );
};

export default CareerConstellation;
