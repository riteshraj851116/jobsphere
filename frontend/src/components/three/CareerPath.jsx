import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

const STEPS = ['Student', 'Intern', 'Junior Dev', 'Developer', 'Senior Dev', 'Lead / Staff'];

const PathScene = () => {
  const groupRef = useRef();
  const [activeIdx, setActiveIdx] = useState(3);

  const { curvePoints, nodePositions } = useMemo(() => {
    const rawPoints = [
      new THREE.Vector3(-2.8, -1.2, 0),
      new THREE.Vector3(-1.7, -0.4, 0.4),
      new THREE.Vector3(-0.6, 0.3, -0.2),
      new THREE.Vector3(0.5, -0.1, 0.3),
      new THREE.Vector3(1.6, 0.8, -0.3),
      new THREE.Vector3(2.7, 1.2, 0)
    ];

    const curve = new THREE.CatmullRomCurve3(rawPoints);
    const points = curve.getPoints(50);
    const lineGeo = new THREE.BufferGeometry().setFromPoints(points);

    return { curvePoints: lineGeo, nodePositions: rawPoints };
  }, []);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!prefersReducedMotion) {
      groupRef.current.rotation.y += delta * 0.05;
      const targetX = state.pointer.x * 0.1;
      groupRef.current.rotation.y += (targetX - groupRef.current.rotation.y) * 0.03;
    }
  });

  return (
    <group ref={groupRef}>
      {/* 3D Path Line */}
      <line geometry={curvePoints}>
        <lineBasicMaterial color="#71717A" opacity={0.5} transparent linewidth={2} />
      </line>

      {nodePositions.map((pos, idx) => {
        const isActive = activeIdx === idx;
        const stepName = STEPS[idx];

        return (
          <group
            key={stepName}
            position={[pos.x, pos.y, pos.z]}
            onClick={() => setActiveIdx(idx)}
            onPointerOver={() => setActiveIdx(idx)}
          >
            <mesh scale={isActive ? 1.3 : 1}>
              <sphereGeometry args={[0.18, 16, 16]} />
              <meshBasicMaterial color={isActive ? '#2563EB' : '#18181B'} />
            </mesh>

            <Html distanceFactor={8.5} position={[0, 0.35, 0]} center>
              <div
                style={{
                  background: isActive ? '#18181B' : '#FFFFFF',
                  color: isActive ? '#FFFFFF' : '#18181B',
                  padding: '2px 7px',
                  borderRadius: '4px',
                  fontSize: '10px',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  border: '1px solid #E4E4E7',
                  pointerEvents: 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                {stepName}
              </div>
            </Html>
          </group>
        );
      })}
    </group>
  );
};

const CareerPath = () => {
  return (
    <div
      style={{
        width: '100%',
        height: '240px',
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
        <PathScene />
      </Canvas>
    </div>
  );
};

export default CareerPath;
