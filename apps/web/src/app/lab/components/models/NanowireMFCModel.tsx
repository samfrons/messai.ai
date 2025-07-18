import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface NanowireMFCModelProps {
  scale?: number;
  showAnimation?: boolean;
  visualizationMode?: 'static' | 'biofilm' | 'flow';
  parameters?: {
    // Existing parameters
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

    // Nanowire-specific parameters
    nanowireCount?: number;
    nanowireDiameter?: number; // 50nm (converted to scene units)
    nanowireLength?: number; // 2.5μm (converted to scene units)
    nanowireSpacing?: number; // Calculated from density
    nanowireDensity?: number; // 850 per mm²
    nanowireOrientation?: 'vertical' | 'random' | 'aligned';
    nanowireMaterial?: 'nickel-silicide' | 'nickel' | 'carbon';
    substrateType?: 'foam' | 'flat' | 'textured';
    substrateThickness?: number; // 1.5mm
    substrateMaterial?: string; // 'nickel-foam'

    // Microfluidic parameters
    flowChannelWidth?: number; // 500μm
    flowChannelHeight?: number; // 200μm
    mainChannelWidth?: number; // 12mm
    mainChannelHeight?: number; // 2mm
  };
}

export default function NanowireMFCModel({
  scale = 1,
  showAnimation = false,
  visualizationMode = 'static',
  parameters = {},
}: NanowireMFCModelProps) {
  const groupRef = useRef<THREE.Group>(null);
  const nanowiresRef = useRef<THREE.Group>(null);
  const flowRef = useRef<THREE.Mesh>(null);
  const biofilmRef = useRef<THREE.Mesh>(null);
  const elapsedTimeRef = useRef(0);

  // Calculate proper dimensions for microfluidic chip
  const dimensions = useMemo(() => {
    // Base dimensions for a 25mm x 12mm x 2mm microfluidic chip
    const baseLength = 2.5; // 25mm → 2.5 scene units
    const baseWidth = 1.2; // 12mm → 1.2 scene units
    const baseHeight = 0.2; // 2mm → 0.2 scene units

    // Scale based on parameters
    const lengthScale = parameters.chamberLength ? parameters.chamberLength / 25 : 1;
    const widthScale = parameters.chamberWidth ? parameters.chamberWidth / 12 : 1;
    const heightScale = parameters.chamberHeight ? parameters.chamberHeight / 2 : 1;

    return {
      length: baseLength * lengthScale,
      width: baseWidth * widthScale,
      height: baseHeight * heightScale,
      substrateThickness: 0.15, // 1.5mm substrate
      electrodeSpacing: baseLength * 0.6, // electrodes apart
    };
  }, [parameters]);

  // Nanowire array parameters
  const nanowireParams = useMemo(() => {
    const density = parameters.nanowireDensity || 850; // per mm²
    const electrodeArea = 25; // mm² electrode area
    const totalNanowires = Math.floor(density * electrodeArea);

    return {
      count: Math.min(totalNanowires, 1000), // Limit for performance
      diameter: 0.004, // 50nm → very thin cylinders
      length: 0.025, // 2.5μm → small but visible
      spacing: 0.034, // 34.1μm spacing
      density,
      electrodeArea,
    };
  }, [parameters]);

  // Material colors for realistic representation
  const materialColors = useMemo(() => {
    return {
      // Nickel silicide - metallic silver
      anodeColor: '#C0C0C0',
      // Nickel foam substrate - darker metallic
      substrateColor: '#A0A0A0',
      // Platinum cathode - bright silver
      cathodeColor: '#E5E5E5',
      // Glass substrate - clear
      glassColor: '#F8F8FF',
      // PDMS microfluidic channels - clear blue
      channelColor: '#E0F6FF',
    };
  }, []);

  // Environmental effects
  const environmentalEffects = useMemo(() => {
    const temp = parameters.temperature || 25;
    const ph = parameters.ph || 7.0;
    const flowRate = parameters.flowRate || 5;

    return {
      tempIntensity: Math.max(0.3, Math.min(1.0, (temp - 15) / 25)),
      biofilmColor: ph < 6.5 ? '#ff9800' : ph > 7.5 ? '#2196f3' : '#4caf50',
      flowSpeed: Math.max(0.5, Math.min(3.0, flowRate / 5)),
    };
  }, [parameters]);

  // Optimized nanowire array using instancedMesh
  const nanowireInstancedMesh = useMemo(() => {
    const count = Math.min(nanowireParams.count, 400);
    const gridSize = Math.ceil(Math.sqrt(count));
    const spacing = 0.08;

    const geometry = new THREE.CylinderGeometry(
      nanowireParams.diameter,
      nanowireParams.diameter,
      nanowireParams.length,
      8, // Reduce segments for better performance
      1
    );

    const material = new THREE.MeshStandardMaterial({
      color: materialColors.anodeColor,
      metalness: 0.95,
      roughness: 0.02,
      emissive: materialColors.anodeColor,
      emissiveIntensity: 0.1,
    });

    const instancedMesh = new THREE.InstancedMesh(geometry, material, count);
    const dummy = new THREE.Object3D();

    // Position each instance
    for (let i = 0; i < count; i++) {
      const row = Math.floor(i / gridSize);
      const col = i % gridSize;

      const x = (col - gridSize / 2) * spacing + (Math.random() - 0.5) * spacing * 0.1;
      const z = (row - gridSize / 2) * spacing + (Math.random() - 0.5) * spacing * 0.1;
      const y = -0.05;

      dummy.position.set(x, y, z);
      dummy.updateMatrix();
      instancedMesh.setMatrixAt(i, dummy.matrix);
    }

    instancedMesh.instanceMatrix.needsUpdate = true;
    return instancedMesh;
  }, [
    nanowireParams.count,
    nanowireParams.diameter,
    nanowireParams.length,
    materialColors.anodeColor,
  ]);

  // Cleanup Three.js objects on unmount
  useEffect(() => {
    return () => {
      if (nanowireInstancedMesh) {
        nanowireInstancedMesh.geometry.dispose();
        if (nanowireInstancedMesh.material) {
          if (Array.isArray(nanowireInstancedMesh.material)) {
            nanowireInstancedMesh.material.forEach((material) => material.dispose());
          } else {
            nanowireInstancedMesh.material.dispose();
          }
        }
      }
    };
  }, [nanowireInstancedMesh]);

  const renderNanowireArray = () => {
    return <primitive object={nanowireInstancedMesh} />;
  };

  // Render foam substrate with porous structure
  const renderFoamSubstrate = () => {
    const pores = [];
    const poreCount = 30;

    for (let i = 0; i < poreCount; i++) {
      const x = (Math.random() - 0.5) * dimensions.length * 0.8;
      const z = (Math.random() - 0.5) * dimensions.width * 0.8;
      const y = -0.1 + (Math.random() - 0.5) * 0.08;
      const size = 0.02 + Math.random() * 0.03;

      pores.push(
        <mesh key={i} position={[x, y, z]}>
          <sphereGeometry args={[size, 8, 6]} />
          <meshStandardMaterial color="#2C2C2C" transparent opacity={0.6} />
        </mesh>
      );
    }

    return pores;
  };

  useFrame((state, delta) => {
    elapsedTimeRef.current = state.clock.elapsedTime;

    if (groupRef.current && showAnimation) {
      groupRef.current.rotation.y += delta * 0.1;
    }

    // Subtle nanowire vibration
    if (nanowiresRef.current && showAnimation) {
      nanowiresRef.current.position.y += Math.sin(state.clock.elapsedTime * 8) * 0.0005;
    }

    // Flow animation
    if (flowRef.current && visualizationMode === 'flow') {
      const material = flowRef.current.material as THREE.MeshStandardMaterial;
      const baseOpacity =
        0.3 + Math.sin(state.clock.elapsedTime * 2 * environmentalEffects.flowSpeed) * 0.2;
      material.opacity = baseOpacity * environmentalEffects.tempIntensity;
    }

    // Biofilm animation
    if (biofilmRef.current && visualizationMode === 'biofilm') {
      const biofilmScale = (parameters.biofilmThickness || 10) / 10;
      const pulseScale = 1 + Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
      biofilmRef.current.scale.setScalar(biofilmScale * pulseScale);
    }
  });

  return (
    <group ref={groupRef} scale={scale} position={[0, 0, 0]}>
      {/* Glass substrate base */}
      <mesh position={[0, -0.18, 0]}>
        <boxGeometry args={[dimensions.length, 0.1, dimensions.width]} />
        <meshStandardMaterial
          color={materialColors.glassColor}
          transparent
          opacity={0.3}
          roughness={0.02}
          metalness={0.0}
        />
      </mesh>

      {/* Nickel foam substrate with realistic thickness */}
      <mesh position={[0, -0.1, 0]}>
        <boxGeometry
          args={[dimensions.length * 0.9, dimensions.substrateThickness, dimensions.width * 0.9]}
        />
        <meshStandardMaterial
          color={materialColors.substrateColor}
          metalness={0.8}
          roughness={0.7}
          emissive={materialColors.substrateColor}
          emissiveIntensity={0.02}
        />
      </mesh>

      {/* Foam pores for porosity visualization */}
      {renderFoamSubstrate()}

      {/* Nanowire array - the key feature */}
      <group ref={nanowiresRef} position={[0, 0, 0]}>
        {renderNanowireArray()}
      </group>

      {/* Microfluidic chamber - transparent PDMS */}
      <mesh position={[0, 0.1, 0]}>
        <boxGeometry args={[dimensions.length, dimensions.height, dimensions.width]} />
        <meshStandardMaterial
          color={materialColors.channelColor}
          transparent
          opacity={0.2}
          roughness={0.1}
          metalness={0.0}
        />
      </mesh>

      {/* Cathode electrode (platinum) */}
      <mesh position={[dimensions.electrodeSpacing, 0.05, 0]}>
        <boxGeometry args={[0.1, 0.03, dimensions.width * 0.8]} />
        <meshStandardMaterial
          color={materialColors.cathodeColor}
          metalness={0.95}
          roughness={0.05}
        />
      </mesh>

      {/* Microfluidic channels */}
      <mesh position={[0, 0.08, 0]} ref={flowRef}>
        <boxGeometry args={[dimensions.length * 0.9, 0.02, dimensions.width * 0.6]} />
        <meshStandardMaterial
          color={visualizationMode === 'flow' ? '#00bcd4' : '#4fc3f7'}
          transparent
          opacity={visualizationMode === 'flow' ? 0.6 : 0.3}
        />
      </mesh>

      {/* Inlet and outlet ports */}
      <mesh position={[-dimensions.length * 0.5, 0.08, 0]}>
        <cylinderGeometry args={[0.015, 0.015, 0.06]} />
        <meshStandardMaterial color="#607d8b" />
      </mesh>
      <mesh position={[dimensions.length * 0.5, 0.08, 0]}>
        <cylinderGeometry args={[0.015, 0.015, 0.06]} />
        <meshStandardMaterial color="#607d8b" />
      </mesh>

      {/* Biofilm layer on nanowires (only in biofilm mode) */}
      {visualizationMode === 'biofilm' && (
        <mesh position={[0, 0.02, 0]} ref={biofilmRef}>
          <boxGeometry args={[dimensions.length * 0.8, 0.008, dimensions.width * 0.8]} />
          <meshStandardMaterial
            color={environmentalEffects.biofilmColor}
            transparent
            opacity={0.6}
            emissive={environmentalEffects.biofilmColor}
            emissiveIntensity={0.1}
          />
        </mesh>
      )}

      {/* Flow visualization particles */}
      {visualizationMode === 'flow' && (
        <>
          {Array.from({ length: 8 }).map((_, i) => (
            <mesh
              key={i}
              position={[-dimensions.length * 0.4 + i * ((dimensions.length * 0.8) / 8), 0.08, 0]}
            >
              <sphereGeometry args={[0.008, 6, 4]} />
              <meshStandardMaterial
                color="#01579b"
                transparent
                opacity={0.8}
                emissive="#01579b"
                emissiveIntensity={0.2}
              />
            </mesh>
          ))}
        </>
      )}

      {/* Electrical connections */}
      <mesh position={[-dimensions.electrodeSpacing, 0.25, -dimensions.width * 0.5]}>
        <cylinderGeometry args={[0.01, 0.01, 0.2]} />
        <meshStandardMaterial color="#ff5722" />
      </mesh>
      <mesh position={[dimensions.electrodeSpacing, 0.25, -dimensions.width * 0.5]}>
        <cylinderGeometry args={[0.01, 0.01, 0.2]} />
        <meshStandardMaterial color="#2196f3" />
      </mesh>

      {/* Performance indicator */}
      {showAnimation && (
        <mesh position={[0, 0.35, 0]}>
          <sphereGeometry args={[0.03, 16, 12]} />
          <meshStandardMaterial
            color="#4caf50"
            emissive="#4caf50"
            emissiveIntensity={0.3 + Math.sin(elapsedTimeRef.current * 2) * 0.2}
          />
        </mesh>
      )}

      {/* Scientific accuracy labels (invisible but for reference) */}
      {/* 850 nanowires per mm² */}
      {/* 25mm × 12mm × 2mm microfluidic chip */}
      {/* 1.5mm thick nickel foam substrate */}
      {/* 50nm diameter, 2.5μm length nanowires */}
    </group>
  );
}
