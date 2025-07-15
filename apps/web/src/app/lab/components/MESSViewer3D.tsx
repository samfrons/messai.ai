'use client';

import React, { Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
import * as THREE from 'three';
import { Badge } from '@messai/ui';
import MicrofluidicCell from './models/MicrofluidicCell';
import StackedFuelCell from './models/StackedFuelCell';
import BenchtopReactor from './models/BenchtopReactor';
import PerformanceOverlay from './PerformanceOverlay';
import ErrorBoundary from './ErrorBoundary';

// Types for 3D viewer props
interface MESSViewer3DProps {
  className?: string;
  selectedModel?: string;
  viewScale?: 'molecular' | 'system' | 'industrial';
  visualizationMode?: 'static' | 'biofilm' | 'flow';
  parameters?: {
    chamberLength?: number;
    chamberWidth?: number;
    chamberHeight?: number;
    electrodeSpacing?: number;
    membraneThickness?: number;
    numberOfChambers?: number;
    anodeMaterial?: string;
    cathodeMaterial?: string;
    membraneType?: string;
    temperature?: number;
    ph?: number;
    flowRate?: number;
    biofilmThickness?: number;
    operatingVoltage?: number;
    connectionType?: string;
    microbialSpecies?: string;
    [key: string]: any;
  };
}

// Enhanced MESS model component with detailed models
function MESSModel({
  type,
  scale = 1,
  showAnimation = false,
  visualizationMode = 'static',
  parameters = {},
}: {
  type: string;
  scale?: number;
  showAnimation?: boolean;
  visualizationMode?: 'static' | 'biofilm' | 'flow';
  parameters?: any;
}) {
  // Render specific model based on type
  const renderModel = () => {
    switch (type) {
      case 'microfluidic':
        return (
          <MicrofluidicCell
            scale={scale}
            showAnimation={showAnimation}
            visualizationMode={visualizationMode}
            parameters={parameters}
          />
        );

      case 'stacked':
        return (
          <StackedFuelCell
            scale={scale}
            showAnimation={showAnimation}
            visualizationMode={visualizationMode}
            parameters={parameters}
          />
        );

      case 'benchtop':
        return (
          <BenchtopReactor
            scale={scale}
            showAnimation={showAnimation}
            visualizationMode={visualizationMode}
            parameters={parameters}
          />
        );

      case 'industrial':
        return (
          <group scale={scale}>
            {/* Placeholder for industrial system - more complex model */}
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[4, 2, 3]} />
              <meshStandardMaterial color="#616161" transparent opacity={0.7} />
            </mesh>
            <mesh position={[0, 1.5, 0]}>
              <cylinderGeometry args={[1.5, 1.5, 1]} />
              <meshStandardMaterial color="#8bc34a" transparent opacity={0.6} />
            </mesh>
            {/* Piping system */}
            {Array.from({ length: 6 }).map((_, i) => (
              <mesh key={i} position={[i - 2.5, 0.5, 2]}>
                <cylinderGeometry args={[0.1, 0.1, 1]} />
                <meshStandardMaterial color="#607d8b" />
              </mesh>
            ))}
          </group>
        );

      default:
        return (
          <mesh scale={scale}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="#9e9e9e" />
          </mesh>
        );
    }
  };

  return renderModel();
}

// Loading fallback component
function LoadingFallback() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-2"></div>
        <p className="text-sm text-gray-600">Loading 3D scene...</p>
      </div>
    </div>
  );
}

// Scene setup component
function Scene({
  selectedModel,
  viewScale,
  visualizationMode,
  parameters,
}: {
  selectedModel: string;
  viewScale: string;
  visualizationMode: 'static' | 'biofilm' | 'flow';
  parameters?: any;
}) {
  // Calculate scale based on view level and model type
  const getScaleForView = (viewScale: string, model: string) => {
    // Base scale adjustments for different models to fit properly
    const modelBaseScale = {
      microfluidic: 1.2,
      stacked: 0.9,
      benchtop: 0.8,
      industrial: 0.7,
    };

    const baseScale = modelBaseScale[model as keyof typeof modelBaseScale] || 1;

    // Apply view scale multiplier
    switch (viewScale) {
      case 'molecular':
        return baseScale * 0.6;
      case 'industrial':
        return baseScale * 1.5;
      default:
        return baseScale; // system
    }
  };

  const scale = getScaleForView(viewScale, selectedModel);
  const showAnimation = visualizationMode !== 'static';

  return (
    <>
      {/* Lighting setup without external HDR dependency */}
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={1}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      <directionalLight position={[-10, 10, -5]} intensity={0.5} />
      <pointLight position={[0, 10, 0]} intensity={0.3} />

      {/* Grid helper for reference - more subtle */}
      <Grid
        args={[50, 50]}
        cellSize={1}
        cellThickness={0.2}
        cellColor="#e0e0e0"
        sectionSize={5}
        sectionThickness={0.3}
        sectionColor="#cccccc"
        fadeDistance={30}
        fadeStrength={1}
        infiniteGrid
        position={[0, -0.01, 0]}
      />

      {/* MESS Model */}
      <MESSModel
        type={selectedModel}
        scale={scale}
        showAnimation={showAnimation}
        visualizationMode={visualizationMode}
        parameters={parameters}
      />

      {/* Camera controls - adjusted for better framing */}
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={5}
        maxDistance={40}
        maxPolarAngle={Math.PI * 0.85}
        target={[0, 0, 0]}
        makeDefault
      />
    </>
  );
}

// Main 3D Viewer Component
export default function MESSViewer3D({
  className = '',
  selectedModel = 'microfluidic',
  viewScale = 'system',
  visualizationMode = 'static',
  parameters = {},
}: MESSViewer3DProps) {
  const [isWebGLSupported, setIsWebGLSupported] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check WebGL support
  React.useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) {
        setIsWebGLSupported(false);
        setError('WebGL is not supported in this browser');
      }
    } catch (e) {
      setIsWebGLSupported(false);
      setError('WebGL initialization failed');
    }
  }, []);

  // Error fallback
  if (!isWebGLSupported || error) {
    return (
      <div className={`bg-gray-100 rounded-lg p-8 ${className}`}>
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">3D Viewer Unavailable</h3>
          <p className="text-gray-600 mb-4">
            {error || 'WebGL support is required for 3D visualization'}
          </p>
          <Badge variant="error">WebGL Not Supported</Badge>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className={`relative bg-gray-50 ${className}`}>
        {/* Canvas container - removed rounded corners and adjusted sizing */}
        <div className="w-full h-full min-h-[600px] relative">
          <Canvas
            shadows
            dpr={[1, 2]}
            gl={{
              antialias: true,
              alpha: false,
              preserveDrawingBuffer: true,
            }}
            camera={{
              position: [10, 8, 10],
              fov: 40,
              near: 0.1,
              far: 100,
            }}
            onCreated={({ gl, camera }) => {
              gl.toneMapping = THREE.ACESFilmicToneMapping;
              gl.toneMappingExposure = 1;
              // Ensure camera captures full scene
              camera.updateProjectionMatrix();
            }}
          >
            <Suspense fallback={null}>
              <Scene
                selectedModel={selectedModel}
                viewScale={viewScale}
                visualizationMode={visualizationMode}
                parameters={parameters}
              />
            </Suspense>
          </Canvas>
        </div>

        {/* Performance Analytics Overlay */}
        <PerformanceOverlay
          selectedModel={selectedModel}
          viewScale={viewScale}
          visualizationMode={visualizationMode}
          parameters={parameters}
        />

        {/* Loading overlay */}
        <Suspense fallback={<LoadingFallback />} />
      </div>
    </ErrorBoundary>
  );
}
