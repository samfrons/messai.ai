'use client';

import { useRef, useState, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

function SimplifiedMESSModel() {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.1;
    }
  });

  return (
    <group
      ref={groupRef}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      scale={hovered ? 1.05 : 1}
    >
      {/* Chamber Base */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[3, 0.1, 2]} />
        <meshStandardMaterial color="#f5f5f5" />
      </mesh>

      {/* Chamber Walls */}
      <mesh position={[-1.45, 0.5, 0]}>
        <boxGeometry args={[0.1, 1, 2]} />
        <meshStandardMaterial color="#f5f5f5" opacity={0.3} transparent />
      </mesh>
      <mesh position={[1.45, 0.5, 0]}>
        <boxGeometry args={[0.1, 1, 2]} />
        <meshStandardMaterial color="#f5f5f5" opacity={0.3} transparent />
      </mesh>

      {/* Anode (Left) */}
      <mesh position={[-1, 0.5, 0]}>
        <boxGeometry args={[0.05, 0.8, 1.6]} />
        <meshStandardMaterial color="#2a2a2a" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Cathode (Right) */}
      <mesh position={[1, 0.5, 0]}>
        <boxGeometry args={[0.05, 0.8, 1.6]} />
        <meshStandardMaterial color="#8b0000" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Membrane (Center) */}
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[0.02, 0.8, 1.6]} />
        <meshStandardMaterial color="#4169e1" opacity={0.6} transparent />
      </mesh>

      {/* Biofilm Particles */}
      {[...Array(20)].map((_, i) => (
        <mesh
          key={i}
          position={[
            -0.8 + Math.random() * 0.3,
            0.1 + Math.random() * 0.8,
            -0.7 + Math.random() * 1.4,
          ]}
        >
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshStandardMaterial color="#228b22" emissive="#228b22" emissiveIntensity={0.2} />
        </mesh>
      ))}

      {/* Flow Arrows */}
      <group>
        {[0.3, 0.5, 0.7].map((y, i) => (
          <mesh key={i} position={[-1.8, y, 0]} rotation={[0, 0, Math.PI / 2]}>
            <coneGeometry args={[0.05, 0.15, 6]} />
            <meshStandardMaterial color="#000000" opacity={0.4} transparent />
          </mesh>
        ))}
      </group>
    </group>
  );
}

export default function Hero3DViewer() {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="relative w-full h-[600px] rounded-lg overflow-hidden">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-2 border-black border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-sm opacity-60">Loading 3D Model...</p>
          </div>
        </div>
      )}

      <Canvas
        className="w-full h-full"
        onCreated={() => setIsLoading(false)}
        gl={{ antialias: true, alpha: true }}
      >
        <PerspectiveCamera makeDefault position={[5, 3, 5]} fov={45} />
        <OrbitControls
          enablePan={false}
          enableZoom={true}
          minDistance={4}
          maxDistance={8}
          autoRotate={false}
          autoRotateSpeed={0.5}
        />

        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 5, 5]} intensity={0.6} castShadow />
        <directionalLight position={[-5, 3, -5]} intensity={0.3} />

        <Suspense fallback={null}>
          <SimplifiedMESSModel />
        </Suspense>

        {/* Grid Helper */}
        <gridHelper args={[10, 10, '#e0e0e0', '#f0f0f0']} position={[0, -0.05, 0]} />
      </Canvas>

      <div className="absolute bottom-4 left-4 bg-white/80 backdrop-blur-sm px-4 py-2 rounded">
        <p className="text-xs opacity-60">Drag to rotate • Scroll to zoom</p>
      </div>
    </div>
  );
}
