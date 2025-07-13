import React, { useRef, useState } from 'react'
import { Group } from 'three'
import { Text } from '@react-three/drei'
// import { animated } from '@react-spring/three'
// import { useSpring } from '@react-spring/core'
import { MESSModel3DProps } from '../../types'

const SingleCell: React.FC<{
  position: [number, number, number]
  showInternals: boolean
}> = ({ position, showInternals }) => {
  return (
    <group position={position}>
      {/* Cell frame */}
      <mesh>
        <boxGeometry args={[3, 0.3, 2]} />
        <meshPhysicalMaterial
          color="#333333"
          metalness={0.7}
          roughness={0.3}
        />
      </mesh>
      
      {showInternals && (
        <>
          {/* Anode */}
          <mesh position={[-0.7, 0, 0]}>
            <boxGeometry args={[0.1, 0.25, 1.8]} />
            <meshPhysicalMaterial color="#8b0000" metalness={0.5} />
          </mesh>
          
          {/* Cathode */}
          <mesh position={[0.7, 0, 0]}>
            <boxGeometry args={[0.1, 0.25, 1.8]} />
            <meshPhysicalMaterial color="#00008b" metalness={0.5} />
          </mesh>
          
          {/* Membrane */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.05, 0.25, 1.8]} />
            <meshPhysicalMaterial
              color="#ffffff"
              transparent
              opacity={0.6}
              transmission={0.8}
            />
          </mesh>
        </>
      )}
      
      {/* Connection terminals */}
      <mesh position={[-1.6, 0, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.1]} />
        <meshStandardMaterial color="#ff0000" metalness={0.9} />
      </mesh>
      <mesh position={[1.6, 0, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.1]} />
        <meshStandardMaterial color="#0000ff" metalness={0.9} />
      </mesh>
    </group>
  )
}

export const StackedFuelCell: React.FC<MESSModel3DProps> = ({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  showLabels = false,
  interactive = true,
  onSelect,
}) => {
  const groupRef = useRef<Group>(null)
  const [expanded, setExpanded] = useState(false)
  const [connectionMode, setConnectionMode] = useState<'series' | 'parallel'>('series')
  
  // const { separation } = useSpring({
  //   separation: expanded ? 0.8 : 0.35,
  // })
  const separation = expanded ? 0.8 : 0.35
  
  const handleClick = () => {
    if (interactive) {
      setExpanded(!expanded)
      onSelect?.('stacked-fuel-cell')
    }
  }
  
  const cellCount = 5
  
  return (
    <group 
      ref={groupRef} 
      position={position} 
      rotation={rotation} 
      scale={scale}
      onClick={handleClick}
    >
      {/* Stack of cells */}
      {Array.from({ length: cellCount }).map((_, i) => (
        <group
          key={i}
          position={[0, (i - cellCount / 2) * separation, 0]}
        >
          <SingleCell
            position={[0, 0, 0]}
            showInternals={expanded}
          />
        </group>
      ))}
      
      {/* Connection wires */}
      {expanded && connectionMode === 'series' && (
        <group>
          {Array.from({ length: cellCount - 1 }).map((_, i) => (
            <mesh
              key={i}
              position={[
                0,
                (i - cellCount / 2 + 0.5) * 0.8,
                1.1,
              ]}
            >
              <boxGeometry args={[3.2, 0.02, 0.02]} />
              <meshStandardMaterial color="#666666" />
            </mesh>
          ))}
        </group>
      )}
      
      {/* End plates */}
      <mesh position={[0, (cellCount / 2) * 0.35 + 0.2, 0]}>
        <boxGeometry args={[3.5, 0.1, 2.5]} />
        <meshPhysicalMaterial color="#1a1a1a" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0, -(cellCount / 2) * 0.35 - 0.2, 0]}>
        <boxGeometry args={[3.5, 0.1, 2.5]} />
        <meshPhysicalMaterial color="#1a1a1a" metalness={0.8} roughness={0.2} />
      </mesh>
      
      {/* Main terminals */}
      <mesh position={[-2, (cellCount / 2) * 0.35 + 0.3, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 0.2]} />
        <meshStandardMaterial color="#ff0000" metalness={0.9} />
      </mesh>
      <mesh position={[2, -(cellCount / 2) * 0.35 - 0.3, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 0.2]} />
        <meshStandardMaterial color="#0000ff" metalness={0.9} />
      </mesh>
      
      {showLabels && (
        <>
          <Text
            position={[0, -2.5, 0]}
            fontSize={0.2}
            color="#666666"
            anchorX="center"
          >
            Stacked Fuel Cell ({cellCount} cells)
          </Text>
          <Text
            position={[0, -2.8, 0]}
            fontSize={0.15}
            color="#999999"
            anchorX="center"
          >
            {connectionMode === 'series' ? 'Series Connection' : 'Parallel Connection'}
          </Text>
        </>
      )}
    </group>
  )
}