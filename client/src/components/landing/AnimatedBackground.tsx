'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function FloatingParticles({ count = 120 }: { count?: number }) {
  const mesh = useRef<THREE.InstancedMesh>(null!);

  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 20;
      const y = (Math.random() - 0.5) * 20;
      const z = (Math.random() - 0.5) * 10 - 5;
      const scale = Math.random() * 0.02 + 0.005;
      const speed = Math.random() * 0.3 + 0.1;
      const offset = Math.random() * Math.PI * 2;
      temp.push({ x, y, z, scale, speed, offset });
    }
    return temp;
  }, [count]);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    particles.forEach((p, i) => {
      dummy.position.set(
        p.x + Math.sin(t * p.speed + p.offset) * 0.5,
        p.y + Math.cos(t * p.speed * 0.7 + p.offset) * 0.3,
        p.z
      );
      dummy.scale.setScalar(p.scale * (1 + Math.sin(t * 0.5 + p.offset) * 0.3));
      dummy.updateMatrix();
      mesh.current.setMatrixAt(i, dummy.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshBasicMaterial color="#6366f1" transparent opacity={0.4} />
    </instancedMesh>
  );
}

function ConnectionLines() {
  const lineRef = useRef<THREE.LineSegments>(null!);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(600 * 6);
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geo;
  }, []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const positions = geometry.attributes.position as THREE.BufferAttribute;
    const arr = positions.array as Float32Array;

    for (let i = 0; i < 200; i++) {
      const idx = i * 6;
      const x1 = Math.sin(t * 0.2 + i * 0.5) * 8;
      const y1 = Math.cos(t * 0.15 + i * 0.3) * 5;
      const z1 = -5 + Math.sin(t * 0.1 + i) * 2;
      const x2 = Math.sin(t * 0.2 + (i + 1) * 0.5) * 8;
      const y2 = Math.cos(t * 0.15 + (i + 1) * 0.3) * 5;
      const z2 = -5 + Math.sin(t * 0.1 + (i + 1)) * 2;

      const dist = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
      if (dist < 4) {
        arr[idx] = x1; arr[idx + 1] = y1; arr[idx + 2] = z1;
        arr[idx + 3] = x2; arr[idx + 4] = y2; arr[idx + 5] = z2;
      } else {
        arr[idx] = 0; arr[idx + 1] = 0; arr[idx + 2] = 0;
        arr[idx + 3] = 0; arr[idx + 4] = 0; arr[idx + 5] = 0;
      }
    }
    positions.needsUpdate = true;
  });

  return (
    <lineSegments ref={lineRef} geometry={geometry}>
      <lineBasicMaterial color="#818cf8" transparent opacity={0.08} />
    </lineSegments>
  );
}

export default function AnimatedBackground() {
  return (
    <div className="absolute inset-0 z-0" aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 60 }}
        dpr={[1, 1.5]}
        gl={{ antialias: false, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <FloatingParticles />
        <ConnectionLines />
      </Canvas>
    </div>
  );
}
