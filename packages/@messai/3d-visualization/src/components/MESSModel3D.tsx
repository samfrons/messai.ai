import React, { Suspense, useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, Grid, Stats, Loader, Text } from '@react-three/drei'
// import { EffectComposer, Bloom, DepthOfField } from '@react-three/postprocessing'
import { MESSModel3DProps, ModelType } from '../types'
import { getPerformanceLevel, adaptQualitySettings } from '../utils/performance'
import { rendererPool } from '../utils/renderer-pool'

// Import all models
import { MicrobialFuelCell } from './models/MicrobialFuelCell'
import { AlgalFuelCell } from './models/AlgalFuelCell'
import { MicrofluidicChip } from './models/MicrofluidicChip'
import { StackedFuelCell } from './models/StackedFuelCell'
import { Bioreactor } from './models/Bioreactor'

// Model component map
const modelComponents: Record<ModelType, React.FC<MESSModel3DProps>> = {
  'microbial-fuel-cell': MicrobialFuelCell,
  'microbial-electrolysis-cell': MicrobialFuelCell, // Can reuse with different config
  'microbial-desalination-cell': MicrobialFuelCell, // Can reuse with different config
  'algal-fuel-cell': AlgalFuelCell,
  'microfluidic-chip': MicrofluidicChip,
  'stacked-fuel-cell': StackedFuelCell,
  'bioreactor': Bioreactor,
  'industrial-system': Bioreactor, // Can scale up bioreactor for industrial
}

// Fallback component for unsupported models
const FallbackModel: React.FC<MESSModel3DProps> = ({ type, position = [0, 0, 0], showLabels }) => {
  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[2, 2, 2]} />
        <meshStandardMaterial color="#cccccc" wireframe />
      </mesh>
      {showLabels && (
        <Text position={[0, -1.5, 0]} fontSize={0.2} color="#666666">
          {type} (Coming Soon)
        </Text>
      )}
    </group>
  )
}

// Loading component
const LoadingModel = () => (
  <mesh>
    <boxGeometry args={[1, 1, 1]} />
    <meshStandardMaterial color="#666666" wireframe />
  </mesh>
)

export const MESSModel3D: React.FC<MESSModel3DProps> = (props) => {
  const [performanceLevel, setPerformanceLevel] = useState<string>('full')
  const [rendererId] = useState(() => `mess-model-${Date.now()}`)
  
  useEffect(() => {
    const level = props.fallbackLevel || getPerformanceLevel()
    setPerformanceLevel(level)
    
    return () => {
      rendererPool.releaseRenderer(rendererId)
    }
  }, [props.fallbackLevel, rendererId])
  
  const qualitySettings = adaptQualitySettings(performanceLevel)
  const ModelComponent = modelComponents[props.type] || FallbackModel
  
  // Handle no WebGL support
  if (performanceLevel === 'none') {
    return (
      <div style={{
        width: '100%',
        height: '400px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f5f5',
        border: '1px solid #ddd',
        borderRadius: '8px',
      }}>
        <div style={{ textAlign: 'center', color: '#666' }}>
          <h3>3D Visualization Not Available</h3>
          <p>Your browser doesn't support WebGL</p>
          <p>Model: {props.type}</p>
        </div>
      </div>
    )
  }
  
  return (
    <>
      <Canvas
        camera={{ position: [5, 5, 5], fov: 50 }}
        shadows={qualitySettings.shadows}
        gl={{
          antialias: qualitySettings.antialias,
          powerPreference: performanceLevel === 'basic' ? 'low-power' : 'high-performance',
        }}
        onCreated={({ gl }) => {
          const renderer = rendererPool.getRenderer(rendererId, {
            antialias: qualitySettings.antialias,
            shadowMap: qualitySettings.shadows,
            pixelRatio: performanceLevel === 'basic' ? 1 : Math.min(window.devicePixelRatio, 2),
          })
          if (renderer) {
            gl.dispose()
            Object.assign(gl, renderer)
          }
        }}
      >
        <Suspense fallback={<LoadingModel />}>
          {/* Lighting */}
          <ambientLight intensity={0.5} />
          <directionalLight
            position={[10, 10, 5]}
            intensity={1}
            castShadow={qualitySettings.shadows}
            shadow-mapSize={[2048, 2048]}
          />
          <pointLight position={[-10, -10, -5]} intensity={0.5} />
          
          {/* Environment */}
          {performanceLevel !== 'basic' && (
            <Environment preset="studio" background={false} />
          )}
          
          {/* Grid */}
          <Grid
            args={[10, 10]}
            cellSize={0.5}
            cellThickness={0.5}
            cellColor="#6f6f6f"
            sectionSize={2}
            sectionThickness={1}
            sectionColor="#9d9d9d"
            fadeDistance={20}
            fadeStrength={1}
            followCamera={false}
            infiniteGrid
          />
          
          {/* Model */}
          <ModelComponent {...props} />
          
          {/* Controls */}
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={2}
            maxDistance={20}
            maxPolarAngle={Math.PI * 0.85}
          />
          
          {/* Post-processing effects - disabled until @react-three/postprocessing is added */}
          {/* {qualitySettings.postProcessing && (
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
          )} */}
          
          {/* Performance stats */}
          {props.interactive && <Stats />}
        </Suspense>
      </Canvas>
      <Loader />
    </>
  )
}