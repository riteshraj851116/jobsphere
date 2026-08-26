import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const ParticleField = () => {
  const pointsRef = useRef();

  const particleData = useMemo(() => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const count = isMobile ? 80 : 200;
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 16;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 12;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 8;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    return geometry;
  }, []);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!prefersReducedMotion) {
      pointsRef.current.rotation.y += delta * 0.02;
      pointsRef.current.rotation.x += delta * 0.01;
    }
  });

  return (
    <points ref={pointsRef} geometry={particleData}>
      <pointsMaterial
        color="#71717A"
        size={0.03}
        transparent
        opacity={0.3}
        sizeAttenuation
      />
    </points>
  );
};

const FloatingParticles = () => {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
        overflow: 'hidden'
      }}
      aria-hidden="true"
    >
      <Canvas
        camera={{ position: [0, 0, 6], fov: 45 }}
        dpr={[1, 1.25]}
        gl={{ antialias: false, alpha: true, powerPreference: 'low-power' }}
      >
        <ParticleField />
      </Canvas>
    </div>
  );
};

export default FloatingParticles;
