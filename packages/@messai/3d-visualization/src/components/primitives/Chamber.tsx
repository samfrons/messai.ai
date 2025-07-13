import React from 'react'
import * as THREE from 'three'
import { ChamberProps } from '../../types'
import { materials } from '../materials'

export const Chamber: React.FC<ChamberProps & { children?: React.ReactNode }> = ({
  type,
  dimensions,
  position = [0, 0, 0],
  material = 'acrylic',
  transparent = true,
  children,
}) => {
  const materialProps = {
    ...materials[material as keyof typeof materials],
    transparent,
  }
  
  return (
    <group position={position}>
      {/* Chamber walls */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={dimensions} />
        <meshPhysicalMaterial {...materialProps} side={2} />
      </mesh>
      
      {/* Chamber frame */}
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(...dimensions)]} />
        <lineBasicMaterial color="#333333" linewidth={2} />
      </lineSegments>
      
      {/* Inlet/Outlet ports */}
      {type !== 'single' && (
        <>
          <mesh position={[-dimensions[0] / 2, dimensions[1] / 4, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.1, 0.1, 0.3]} />
            <meshStandardMaterial color="#666666" />
          </mesh>
          <mesh position={[dimensions[0] / 2, -dimensions[1] / 4, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.1, 0.1, 0.3]} />
            <meshStandardMaterial color="#666666" />
          </mesh>
        </>
      )}
      
      {children}
    </group>
  )
}