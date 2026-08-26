import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const AuthBackground = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;

    if (!container) return;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );

    camera.position.z = 7;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });

    renderer.setPixelRatio(
      Math.min(window.devicePixelRatio, 1.5)
    );

    renderer.setSize(
      container.clientWidth,
      container.clientHeight
    );

    container.appendChild(renderer.domElement);

    const particleCount = 600;
    const positions = new Float32Array(
      particleCount * 3
    );

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;

      positions[i3] =
        (Math.random() - 0.5) * 14;

      positions[i3 + 1] =
        (Math.random() - 0.5) * 9;

      positions[i3 + 2] =
        (Math.random() - 0.5) * 8;
    }

    const particleGeometry =
      new THREE.BufferGeometry();

    particleGeometry.setAttribute(
      'position',
      new THREE.BufferAttribute(positions, 3)
    );

    const particleMaterial =
      new THREE.PointsMaterial({
        color: 0x111111,
        size: 0.025,
        transparent: true,
        opacity: 0.28,
      });

    const particles = new THREE.Points(
      particleGeometry,
      particleMaterial
    );

    scene.add(particles);

    const sphereGeometry =
      new THREE.IcosahedronGeometry(2.2, 2);

    const sphereMaterial =
      new THREE.MeshBasicMaterial({
        color: 0x111111,
        wireframe: true,
        transparent: true,
        opacity: 0.08,
      });

    const sphere = new THREE.Mesh(
      sphereGeometry,
      sphereMaterial
    );

    scene.add(sphere);

    const rings = [];

    for (let i = 0; i < 3; i++) {
      const geometry =
        new THREE.TorusGeometry(
          2.5 + i * 0.45,
          0.008,
          8,
          120
        );

      const material =
        new THREE.MeshBasicMaterial({
          color: 0x111111,
          transparent: true,
          opacity: 0.12,
        });

      const ring = new THREE.Mesh(
        geometry,
        material
      );

      ring.rotation.x =
        i * 0.8;

      ring.rotation.y =
        i * 0.5;

      scene.add(ring);
      rings.push(ring);
    }

    const coreGeometry =
      new THREE.SphereGeometry(
        0.3,
        24,
        24
      );

    const coreMaterial =
      new THREE.MeshBasicMaterial({
        color: 0x111111,
      });

    const core = new THREE.Mesh(
      coreGeometry,
      coreMaterial
    );

    scene.add(core);

    let mouseX = 0;
    let mouseY = 0;

    const handleMouseMove = (event) => {
      mouseX =
        (event.clientX /
          window.innerWidth) *
          2 -
        1;

      mouseY =
        (event.clientY /
          window.innerHeight) *
          2 -
        1;
    };

    window.addEventListener(
      'mousemove',
      handleMouseMove
    );

    const handleResize = () => {
      if (!container) return;

      const width =
        container.clientWidth;

      const height =
        container.clientHeight;

      if (!width || !height) return;

      camera.aspect =
        width / height;

      camera.updateProjectionMatrix();

      renderer.setSize(
        width,
        height
      );

      renderer.setPixelRatio(
        Math.min(window.devicePixelRatio, 1.5)
      );
    };

    window.addEventListener(
      'resize',
      handleResize
    );

    let animationId;

    const clock = new THREE.Clock();

    const animate = () => {
      animationId =
        requestAnimationFrame(animate);

      const time =
        clock.getElapsedTime();

      sphere.rotation.x +=
        (
          mouseY * 0.15 -
          sphere.rotation.x
        ) * 0.02;

      sphere.rotation.y +=
        (
          mouseX * 0.2 -
          sphere.rotation.y
        ) * 0.02;

      sphere.rotation.z =
        time * 0.035;

      particles.rotation.y =
        time * 0.01;

      rings.forEach((ring, index) => {
        ring.rotation.x +=
          0.0007 + index * 0.0002;

        ring.rotation.y +=
          0.001 + index * 0.0002;
      });

      core.scale.setScalar(
        1 + Math.sin(time * 2) * 0.05
      );

      renderer.render(
        scene,
        camera
      );
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);

      window.removeEventListener(
        'mousemove',
        handleMouseMove
      );

      window.removeEventListener(
        'resize',
        handleResize
      );

      particleGeometry.dispose();
      particleMaterial.dispose();

      sphereGeometry.dispose();
      sphereMaterial.dispose();

      coreGeometry.dispose();
      coreMaterial.dispose();

      rings.forEach((ring) => {
        ring.geometry.dispose();
        ring.material.dispose();
      });

      renderer.dispose();

      if (
        container.contains(
          renderer.domElement
        )
      ) {
        container.removeChild(
          renderer.domElement
        );
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="auth-background"
      aria-hidden="true"
    />
  );
};

export default AuthBackground;
