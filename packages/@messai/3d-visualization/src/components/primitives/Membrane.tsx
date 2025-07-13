import React, { useRef } from 'react'
import { Mesh } from 'three'
import { useFrame } from '@react-three/fiber'
import { MembraneProps } from '../../types'
import { materials } from '../materials'

export const Membrane: React.FC<MembraneProps> = ({
  type,
  position,
  size,
  thickness = 0.05,
  opacity = 0.7,
}) => {
  const meshRef = useRef<Mesh>(null)
  
  useFrame((state) => {
    if (meshRef.current && type === 'hydrogel') {
      // Subtle animation for hydrogel
      const material = meshRef.current.material
      if (!Array.isArray(material) && 'opacity' in material) {
        material.opacity = opacity + Math.sin(state.clock.elapsedTime) * 0.05
      }
    }
  })
  
  const materialMap = {
    PEM: 'nafion',
    CEM: 'nafion',
    AEM: 'nafion',
    hydrogel: 'hydrogel',
  }
  
  const materialProps = {
    ...materials[materialMap[type] as keyof typeof materials],
    opacity,
  }
  
  return (
    <mesh ref={meshRef} position={position} castShadow receiveShadow>
      <boxGeometry args={[size[0], size[1], thickness]} />
      <meshPhysicalMaterial {...materialProps} side={2} />
    </mesh>
  )
}