import React, { useRef, useMemo } from 'react'
import * as THREE from 'three'
import { Group, BufferGeometry, Float32BufferAttribute } from 'three'
import { useFrame } from '@react-three/fiber'
import { BiofilmProps } from '../../types'

interface BiofilmVisualizationProps extends BiofilmProps {
  position: [number, number, number]
  size?: [number, number, number]
}

export const BiofilmVisualization: React.FC<BiofilmVisualizationProps> = ({
  thickness,
  coverage,
  color = '#4caf50',
  animated = true,
  position,
  size = [0.5, 2, 0.1],
}) => {
  const meshRef = useRef<THREE.Mesh>(null)
  
  const geometry = useMemo(() => {
    const geo = new BufferGeometry()
    const vertices: number[] = []
    const normals: number[] = []
    const uvs: number[] = []
    
    const segments = 20
    const layers = 5
    
    for (let layer = 0; layer < layers; layer++) {
      const layerThickness = (thickness * layer) / layers
      
      for (let i = 0; i <= segments; i++) {
        for (let j = 0; j <= segments; j++) {
          const u = i / segments
          const v = j / segments
          
          // Only create biofilm where coverage allows
          if (Math.random() > coverage) continue
          
          const x = (u - 0.5) * size[0]
          const y = (v - 0.5) * size[1]
          const z = layerThickness + Math.random() * thickness * 0.2
          
          vertices.push(x, y, z)
          normals.push(0, 0, 1)
          uvs.push(u, v)
        }
      }
    }
    
    geo.setAttribute('position', new Float32BufferAttribute(vertices, 3))
    geo.setAttribute('normal', new Float32BufferAttribute(normals, 3))
    geo.setAttribute('uv', new Float32BufferAttribute(uvs, 2))
    
    return geo
  }, [thickness, coverage, size])
  
  useFrame((state) => {
    if (meshRef.current && animated) {
      const time = state.clock.elapsedTime
      const material = meshRef.current.material
      if (!Array.isArray(material) && 'opacity' in material) {
        material.opacity = 0.6 + Math.sin(time * 2) * 0.1
      }
      if (!Array.isArray(material) && 'emissiveIntensity' in material) {
        material.emissiveIntensity = 0.1 + Math.sin(time * 3) * 0.05
      }
    }
  })
  
  return (
    <group position={position}>
      <mesh ref={meshRef} geometry={geometry}>
        <meshPhysicalMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.1}
          roughness={0.9}
          metalness={0}
          transparent
          opacity={0.6}
          side={2}
        />
      </mesh>
      
      {/* Base layer */}
      <mesh position={[0, 0, thickness / 2]}>
        <boxGeometry args={[size[0], size[1], thickness]} />
        <meshPhysicalMaterial
          color={color}
          transparent
          opacity={0.3}
          roughness={1}
        />
      </mesh>
    </group>
  )
}