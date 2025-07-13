import React, { Suspense, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, Grid, Stats, Loader } from '@react-three/drei'
// import { EffectComposer, Bloom, DepthOfField } from '@react-three/postprocessing'
import { ViewerProps } from '../types'
import { getPerformanceLevel, adaptQualitySettings } from '../utils/performance'
import { MESSModel3D } from './MESSModel3D'

const LoadingFallback = () => (
  <mesh>
    <boxGeometry args={[1, 1, 1]} />
    <meshStandardMaterial color="#666666" wireframe />
  </mesh>
)

export const Viewer: React.FC<ViewerProps> = ({
  models,
  environment = 'laboratory',
  lighting = 'standard',
  cameraPosition = [5, 5, 5],
  controls = true,
  stats = false,
  rendererConfig = {},
  onModelSelect,
  onReady,
}) => {
  const [performanceLevel] = useState(() => getPerformanceLevel())
  const qualitySettings = adaptQualitySettings(performanceLevel)
  
  const handleModelSelect = (id: string) => {
    onModelSelect?.(id)
  }
  
  const renderLighting = () => {
    switch (lighting) {
      case 'dramatic':
        return (
          <>
            <ambientLight intensity={0.2} />
            <directionalLight
              position={[10, 10, 5]}
              intensity={2}
              castShadow={qualitySettings.shadows}
              shadow-mapSize={[2048, 2048]}
            />
            <spotLight
              position={[-5, 5, 5]}
              intensity={1}
              angle={Math.PI / 6}
              penumbra={0.5}
            />
          </>
        )
      case 'soft':
        return (
          <>
            <ambientLight intensity={0.8} />
            <directionalLight
              position={[5, 5, 5]}
              intensity={0.5}
              castShadow={qualitySettings.shadows}
            />
          </>
        )
      case 'custom':
        return null // Let the user provide their own lighting
      default: // standard
        return (
          <>
            <ambientLight intensity={0.5} />
            <directionalLight
              position={[10, 10, 5]}
              intensity={1}
              castShadow={qualitySettings.shadows}
              shadow-mapSize={[2048, 2048]}
            />
            <pointLight position={[-10, -10, -5]} intensity={0.5} />
          </>
        )
    }
  }
  
  return (
    <Canvas
      camera={{ position: cameraPosition, fov: 50 }}
      shadows={qualitySettings.shadows}
      gl={{
        antialias: qualitySettings.antialias,
        powerPreference: rendererConfig.powerPreference || 'default',
        pixelRatio: rendererConfig.pixelRatio || window.devicePixelRatio,
      }}
      onCreated={() => onReady?.()}
    >
      <Suspense fallback={<LoadingFallback />}>
        {/* Lighting */}
        {renderLighting()}
        
        {/* Environment */}
        {environment !== 'none' && performanceLevel !== 'basic' && (
          <Environment preset={environment as any} background={false} />
        )}
        
        {/* Grid */}
        <Grid
          args={[20, 20]}
          cellSize={0.5}
          cellThickness={0.5}
          cellColor="#6f6f6f"
          sectionSize={2}
          sectionThickness={1}
          sectionColor="#9d9d9d"
          fadeDistance={30}
          fadeStrength={1}
          followCamera={false}
          infiniteGrid
        />
        
        {/* Models */}
        {models.map((model, index) => (
          <group key={model.id || index} position={model.position || [0, 0, 0]}>
            <MESSModel3D
              {...model}
              onSelect={(id) => handleModelSelect(model.id || id)}
            />
          </group>
        ))}
        
        {/* Controls */}
        {controls && (
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={2}
            maxDistance={50}
            maxPolarAngle={Math.PI * 0.85}
          />
        )}
        
        {/* Post-processing effects */}
        {/* TODO: Re-enable when @react-three/postprocessing is installed
        {qualitySettings.postProcessing && (
          <EffectComposer>
            <Bloom
              intensity={0.5}
              luminanceThreshold={0.9}
              luminanceSmoothing={0.025}
            />
            <DepthOfField
              focusDistance={0}
              focalLength={0.02}
              bokehScale={2}
              height={480}
            />
          </EffectComposer>
        )}
        */}
        
        {/* Performance stats */}
        {stats && <Stats />}
      </Suspense>
    </Canvas>
  )
}