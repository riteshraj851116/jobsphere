import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import "./AuthBackground.css";

const AuthBackground = () => {
const mountRef = useRef(null);

useEffect(() => {
const mount = mountRef.current;


if (!mount) return;

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  45,
  mount.clientWidth / mount.clientHeight,
  0.1,
  100
);

camera.position.z = 7;

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: true,
  powerPreference: "high-performance",
});

renderer.setPixelRatio(
  Math.min(window.devicePixelRatio, 1.5)
);

renderer.setSize(
  mount.clientWidth,
  mount.clientHeight
);

renderer.setClearColor(0x000000, 0);

mount.appendChild(renderer.domElement);

/* ---------------------------------------------
   MAIN SPHERE
--------------------------------------------- */

const geometry = new THREE.IcosahedronGeometry(
  2.15,
  2
);

const material = new THREE.MeshBasicMaterial({
  color: 0x000000,
  wireframe: true,
  transparent: true,
  opacity: 0.13,
});

const sphere = new THREE.Mesh(
  geometry,
  material
);

scene.add(sphere);

/* ---------------------------------------------
   INNER SPHERE
--------------------------------------------- */

const innerGeometry =
  new THREE.IcosahedronGeometry(1.55, 2);

const innerMaterial =
  new THREE.MeshBasicMaterial({
    color: 0x000000,
    wireframe: true,
    transparent: true,
    opacity: 0.07,
  });

const innerSphere = new THREE.Mesh(
  innerGeometry,
  innerMaterial
);

scene.add(innerSphere);

/* ---------------------------------------------
   PARTICLES
--------------------------------------------- */

const particleCount = 500;

const positions = new Float32Array(
  particleCount * 3
);

for (let i = 0; i < particleCount; i++) {
  const radius = 3.2 + Math.random() * 2.2;

  const theta =
    Math.random() * Math.PI * 2;

  const phi =
    Math.acos(
      2 * Math.random() - 1
    );

  positions[i * 3] =
    radius *
    Math.sin(phi) *
    Math.cos(theta);

  positions[i * 3 + 1] =
    radius *
    Math.sin(phi) *
    Math.sin(theta);

  positions[i * 3 + 2] =
    radius *
    Math.cos(phi);
}

const particleGeometry =
  new THREE.BufferGeometry();

particleGeometry.setAttribute(
  "position",
  new THREE.BufferAttribute(
    positions,
    3
  )
);

const particleMaterial =
  new THREE.PointsMaterial({
    color: 0x000000,
    size: 0.025,
    transparent: true,
    opacity: 0.35,
    sizeAttenuation: true,
  });

const particles = new THREE.Points(
  particleGeometry,
  particleMaterial
);

scene.add(particles);

/* ---------------------------------------------
   ORBIT RINGS
--------------------------------------------- */

const rings = [];

const ringSettings = [
  {
    radius: 2.65,
    rotation: [0.8, 0.2, 0.1],
    opacity: 0.12,
  },
  {
    radius: 3.05,
    rotation: [1.2, 0.7, 0.4],
    opacity: 0.08,
  },
  {
    radius: 3.45,
    rotation: [0.3, 1.1, 0.8],
    opacity: 0.06,
  },
];

ringSettings.forEach(
  ({
    radius,
    rotation,
    opacity,
  }) => {
    const ringGeometry =
      new THREE.TorusGeometry(
        radius,
        0.008,
        8,
        160
      );

    const ringMaterial =
      new THREE.MeshBasicMaterial({
        color: 0x000000,
        transparent: true,
        opacity,
      });

    const ring = new THREE.Mesh(
      ringGeometry,
      ringMaterial
    );

    ring.rotation.set(
      rotation[0],
      rotation[1],
      rotation[2]
    );

    scene.add(ring);

    rings.push(ring);
  }
);

/* ---------------------------------------------
   MOUSE
--------------------------------------------- */

const mouse = {
  x: 0,
  y: 0,
};

const target = {
  x: 0,
  y: 0,
};

const handleMouseMove = (event) => {
  const rect =
    mount.getBoundingClientRect();

  mouse.x =
    ((event.clientX - rect.left) /
      rect.width -
      0.5) *
    2;

  mouse.y =
    ((event.clientY - rect.top) /
      rect.height -
      0.5) *
    2;
};

window.addEventListener(
  "mousemove",
  handleMouseMove,
  { passive: true }
);

/* ---------------------------------------------
   RESIZE
--------------------------------------------- */

const handleResize = () => {
  if (!mount) return;

  const width = mount.clientWidth;
  const height = mount.clientHeight;

  if (!width || !height) return;

  camera.aspect =
    width / height;

  camera.updateProjectionMatrix();

  renderer.setSize(
    width,
    height
  );

  renderer.setPixelRatio(
    Math.min(
      window.devicePixelRatio,
      1.5
    )
  );
};

window.addEventListener(
  "resize",
  handleResize
);

/* ---------------------------------------------
   ANIMATION
--------------------------------------------- */

let animationFrame;

const animate = () => {
  animationFrame =
    requestAnimationFrame(
      animate
    );

  target.x +=
    (mouse.x - target.x) *
    0.025;

  target.y +=
    (mouse.y - target.y) *
    0.025;

  sphere.rotation.x += 0.0015;
  sphere.rotation.y += 0.002;

  innerSphere.rotation.x -=
    0.001;

  innerSphere.rotation.y -=
    0.0015;

  particles.rotation.y +=
    0.0004;

  particles.rotation.x +=
    0.00015;

  rings.forEach(
    (ring, index) => {
      ring.rotation.x +=
        0.00025 *
        (index + 1);

      ring.rotation.y +=
        0.00035 *
        (index + 1);
    }
  );

  scene.rotation.y +=
    (target.x * 0.08 -
      scene.rotation.y) *
    0.015;

  scene.rotation.x +=
    (-target.y * 0.05 -
      scene.rotation.x) *
    0.015;

  renderer.render(
    scene,
    camera
  );
};

animate();

/* ---------------------------------------------
   CLEANUP
--------------------------------------------- */

return () => {
  cancelAnimationFrame(
    animationFrame
  );

  window.removeEventListener(
    "mousemove",
    handleMouseMove
  );

  window.removeEventListener(
    "resize",
    handleResize
  );

  geometry.dispose();
  material.dispose();

  innerGeometry.dispose();
  innerMaterial.dispose();

  particleGeometry.dispose();
  particleMaterial.dispose();

  rings.forEach((ring) => {
    ring.geometry.dispose();
    ring.material.dispose();
  });

  renderer.dispose();

  if (
    renderer.domElement &&
    mount.contains(
      renderer.domElement
    )
  ) {
    mount.removeChild(
      renderer.domElement
    );
  }
};


}, []);

return ( <div
   ref={mountRef}
   className="auth-background"
   aria-hidden="true"
 />
);
};

export default AuthBackground;
