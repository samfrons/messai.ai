import React, { useRef, useMemo } from 'react'
import { Group, Vector3 } from 'three'
import { useFrame } from '@react-three/fiber'
import { FlowPattern } from '../../types'

interface FlowVisualizationProps {
  pattern: FlowPattern
  bounds: [number, number, number]
}

export const FlowVisualization: React.FC<FlowVisualizationProps> = ({
  pattern,
  bounds,
}) => {
  const groupRef = useRef<Group>(null)
  const particlesRef = useRef<Group[]>([])
  
  const particles = useMemo(() => {
    return Array.from({ length: pattern.particles }, (_, i) => ({
      id: i,
      position: new Vector3(
        (Math.random() - 0.5) * bounds[0],
        (Math.random() - 0.5) * bounds[1],
        (Math.random() - 0.5) * bounds[2]
      ),
      velocity: new Vector3(
        (Math.random() - 0.5) * 0.1,
        pattern.type === 'laminar' ? 0 : (Math.random() - 0.5) * 0.1,
        (Math.random() - 0.5) * 0.1
      ),
    }))
  }, [pattern, bounds])
  
  useFrame((state, delta) => {
    if (!groupRef.current) return
    
    particlesRef.current.forEach((particle, i) => {
      if (!particle) return
      
      const data = particles[i]
      if (!data) return
      
      // Update position based on flow pattern
      switch (pattern.type) {
        case 'laminar':
          particle.position.x += pattern.velocity * delta
          if (particle.position.x > bounds[0] / 2) {
            particle.position.x = -bounds[0] / 2
          }
          break
          
        case 'turbulent':
          particle.position.x += data.velocity.x * pattern.velocity * delta
          particle.position.y += data.velocity.y * pattern.velocity * delta
          particle.position.z += data.velocity.z * pattern.velocity * delta
          
          // Add randomness
          data.velocity.x += (Math.random() - 0.5) * 0.01
          data.velocity.y += (Math.random() - 0.5) * 0.01
          data.velocity.z += (Math.random() - 0.5) * 0.01
          
          // Boundary checks
          if (Math.abs(particle.position.x) > bounds[0] / 2) {
            data.velocity.x *= -1
            particle.position.x = Math.sign(particle.position.x) * bounds[0] / 2
          }
          if (Math.abs(particle.position.y) > bounds[1] / 2) {
            data.velocity.y *= -1
            particle.position.y = Math.sign(particle.position.y) * bounds[1] / 2
          }
          if (Math.abs(particle.position.z) > bounds[2] / 2) {
            data.velocity.z *= -1
            particle.position.z = Math.sign(particle.position.z) * bounds[2] / 2
          }
          break
          
        case 'diffusive':
          const angle = state.clock.elapsedTime * 0.5 + i * 0.1
          particle.position.x += Math.sin(angle) * pattern.velocity * delta
          particle.position.y += Math.cos(angle) * pattern.velocity * delta * 0.5
          break
      }
    })
  })
  
  return (
    <group ref={groupRef}>
      {particles.map((particle, i) => (
        <group
          key={particle.id}
          ref={el => particlesRef.current[i] = el!}
          position={[particle.position.x, particle.position.y, particle.position.z]}
        >
          <mesh>
            <sphereGeometry args={[0.02]} />
            <meshPhysicalMaterial
              color={pattern.color || '#00bcd4'}
              emissive={pattern.color || '#00acc1'}
              emissiveIntensity={0.5}
              transparent
              opacity={0.8}
            />
          </mesh>
        </group>
      ))}
    </group>
  )
}