import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface MicrofluidicCellProps {
  scale?: number;
  showAnimation?: boolean;
  visualizationMode?: 'static' | 'biofilm' | 'flow';
  parameters?: {
    chamberLength?: number;
    chamberWidth?: number;
    chamberHeight?: number;
    electrodeSpacing?: number;
    membraneThickness?: number;
    anodeMaterial?: string;
    cathodeMaterial?: string;
    membraneType?: string;
    temperature?: number;
    ph?: number;
    flowRate?: number;
    biofilmThickness?: number;
    microbialSpecies?: string;
  };
}

export default function MicrofluidicCell({
  scale = 1,
  showAnimation = false,
  visualizationMode = 'static',
  parameters = {},
}: MicrofluidicCellProps) {
  const groupRef = useRef<THREE.Group>(null);
  const flowRef = useRef<THREE.Mesh>(null);
  const biofilmRef = useRef<THREE.Mesh>(null);

  // Calculate dynamic dimensions based on parameters
  const dimensions = useMemo(() => {
    const baseLength = 4;
    const baseWidth = 1.5;
    const baseHeight = 0.1;

    // Scale dimensions based on parameters (convert mm to base units)
    const lengthScale = parameters.chamberLength ? parameters.chamberLength / 100 : 1;
    const widthScale = parameters.chamberWidth ? parameters.chamberWidth / 50 : 1;
    const heightScale = parameters.chamberHeight ? parameters.chamberHeight / 30 : 1;

    return {
      length: baseLength * lengthScale,
      width: baseWidth * widthScale,
      height: baseHeight * heightScale,
      electrodeSpacing: parameters.electrodeSpacing ? parameters.electrodeSpacing / 10 : 1.5,
      membraneThickness: parameters.membraneThickness ? parameters.membraneThickness / 0.5 : 1,
    };
  }, [parameters]);

  // Material colors based on selections
  const materialColors = useMemo(() => {
    const anodeColor =
      {
        'carbon-cloth': '#424242',
        'carbon-paper': '#616161',
        graphite: '#757575',
        'carbon-felt': '#37474f',
      }[parameters.anodeMaterial || 'carbon-cloth'] || '#ffd700';

    const cathodeColor =
      {
        platinum: '#c0c0c0',
        'carbon-pt': '#9e9e9e',
        mno2: '#8d6e63',
        carbon: '#424242',
      }[parameters.cathodeMaterial || 'platinum'] || '#c0c0c0';

    const membraneColor =
      {
        nafion: '#8bc34a',
        ultrex: '#4caf50',
        cation: '#66bb6a',
        anion: '#81c784',
      }[parameters.membraneType || 'nafion'] || '#8bc34a';

    return { anodeColor, cathodeColor, membraneColor };
  }, [parameters]);

  // Environmental effects
  const environmentalEffects = useMemo(() => {
    const temp = parameters.temperature || 25;
    const ph = parameters.ph || 7.0;
    const flowRate = parameters.flowRate || 10;

    // Temperature affects color intensity
    const tempIntensity = Math.max(0.3, Math.min(1.0, (temp - 15) / 25));

    // pH affects biofilm color
    const biofilmColor = ph < 6.5 ? '#ff9800' : ph > 7.5 ? '#2196f3' : '#4caf50';

    // Flow rate affects animation speed
    const flowSpeed = Math.max(0.5, Math.min(3.0, flowRate / 10));

    return { tempIntensity, biofilmColor, flowSpeed };
  }, [parameters]);

  useFrame((state, delta) => {
    if (groupRef.current && showAnimation) {
      // Gentle rotation animation
      groupRef.current.rotation.y += delta * 0.1;
    }

    // Flow animation with dynamic speed
    if (flowRef.current && visualizationMode === 'flow') {
      const material = flowRef.current.material as THREE.MeshStandardMaterial;
      const baseOpacity =
        0.3 + Math.sin(state.clock.elapsedTime * 2 * environmentalEffects.flowSpeed) * 0.2;
      material.opacity = baseOpacity * environmentalEffects.tempIntensity;
    }

    // Biofilm animation with thickness parameter
    if (biofilmRef.current && visualizationMode === 'biofilm') {
      const biofilmScale = (parameters.biofilmThickness || 0.1) * 10;
      const pulseScale = 1 + Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
      biofilmRef.current.scale.setScalar(biofilmScale * pulseScale);
    }
  });

  return (
    <group ref={groupRef} scale={scale} position={[0, 0, 0]}>
      {/* Base microscope slide - dynamic dimensions */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[dimensions.length, dimensions.height, dimensions.width]} />
        <meshStandardMaterial
          color="#e3f2fd"
          transparent
          opacity={0.8 * environmentalEffects.tempIntensity}
          roughness={0.1}
          metalness={0.1}
        />
      </mesh>

      {/* Glass cover layer */}
      <mesh position={[0, dimensions.height, 0]}>
        <boxGeometry
          args={[dimensions.length * 0.95, dimensions.height * 0.2, dimensions.width * 0.87]}
        />
        <meshStandardMaterial
          color="#ffffff"
          transparent
          opacity={0.3}
          roughness={0.0}
          metalness={0.0}
        />
      </mesh>

      {/* Anode electrode (left) - dynamic position and material */}
      <mesh position={[-dimensions.electrodeSpacing, 0, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.4]} />
        <meshStandardMaterial color={materialColors.anodeColor} metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Cathode electrode (right) - dynamic position and material */}
      <mesh position={[dimensions.electrodeSpacing, 0, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.4]} />
        <meshStandardMaterial color={materialColors.cathodeColor} metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Magnetic positioning elements - dynamic positioning */}
      <mesh position={[-dimensions.electrodeSpacing, -0.25, 0]}>
        <boxGeometry args={[0.3, 0.1, 0.3]} />
        <meshStandardMaterial color="#8B4513" metalness={0.5} />
      </mesh>
      <mesh position={[dimensions.electrodeSpacing, -0.25, 0]}>
        <boxGeometry args={[0.3, 0.1, 0.3]} />
        <meshStandardMaterial color="#8B4513" metalness={0.5} />
      </mesh>

      {/* Fluid channels - dynamic dimensions */}
      <mesh position={[0, 0.05, 0]} ref={flowRef}>
        <boxGeometry args={[dimensions.length * 0.9, 0.08, dimensions.width * 0.8]} />
        <meshStandardMaterial
          color={visualizationMode === 'flow' ? '#00bcd4' : '#4fc3f7'}
          transparent
          opacity={visualizationMode === 'flow' ? 0.4 : 0.6}
        />
      </mesh>

      {/* Hydrogel membrane layer - dynamic dimensions and material */}
      <mesh position={[0, 0.15, 0]}>
        <boxGeometry
          args={[
            dimensions.length * 0.85,
            dimensions.membraneThickness * 0.03,
            dimensions.width * 0.67,
          ]}
        />
        <meshStandardMaterial
          color={materialColors.membraneColor}
          transparent
          opacity={0.5 * environmentalEffects.tempIntensity}
        />
      </mesh>

      {/* Biofilm visualization (only in biofilm mode) - dynamic positioning and color */}
      {visualizationMode === 'biofilm' && (
        <mesh position={[-dimensions.electrodeSpacing, 0.1, 0]} ref={biofilmRef}>
          <sphereGeometry args={[0.2, 16, 12]} />
          <meshStandardMaterial
            color={environmentalEffects.biofilmColor}
            transparent
            opacity={0.7 * environmentalEffects.tempIntensity}
            emissive={environmentalEffects.biofilmColor}
            emissiveIntensity={0.1}
          />
        </mesh>
      )}

      {/* Flow particles (only in flow mode) - dynamic positioning */}
      {visualizationMode === 'flow' && (
        <>
          {Array.from({ length: Math.max(3, Math.floor(dimensions.length / 0.8)) }).map((_, i) => (
            <mesh
              key={i}
              position={[
                -dimensions.electrodeSpacing +
                  i * (dimensions.length / Math.max(3, Math.floor(dimensions.length / 0.8))),
                0.05,
                0,
              ]}
            >
              <sphereGeometry args={[0.02, 8, 6]} />
              <meshStandardMaterial
                color="#01579b"
                transparent
                opacity={0.8 * environmentalEffects.tempIntensity}
              />
            </mesh>
          ))}
        </>
      )}

      {/* Connection wires - dynamic positioning */}
      <mesh position={[-dimensions.electrodeSpacing, 0.3, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.2]} />
        <meshStandardMaterial color="#ff5722" />
      </mesh>
      <mesh position={[dimensions.electrodeSpacing, 0.3, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.2]} />
        <meshStandardMaterial color="#2196f3" />
      </mesh>

      {/* Input/output ports - dynamic positioning */}
      <mesh position={[-dimensions.length * 0.55, 0.05, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.15]} />
        <meshStandardMaterial color="#607d8b" />
      </mesh>
      <mesh position={[dimensions.length * 0.55, 0.05, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.15]} />
        <meshStandardMaterial color="#607d8b" />
      </mesh>
    </group>
  );
}
