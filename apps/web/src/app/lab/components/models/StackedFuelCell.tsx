import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface StackedFuelCellProps {
  scale?: number;
  showAnimation?: boolean;
  visualizationMode?: 'static' | 'biofilm' | 'flow';
  parameters?: {
    numberOfChambers?: number;
    chamberLength?: number;
    chamberWidth?: number;
    chamberHeight?: number;
    electrodeSpacing?: number;
    anodeMaterial?: string;
    cathodeMaterial?: string;
    connectionType?: string;
    temperature?: number;
    ph?: number;
    flowRate?: number;
    biofilmThickness?: number;
    operatingVoltage?: number;
  };
}

export default function StackedFuelCell({
  scale = 1,
  showAnimation = false,
  visualizationMode = 'static',
  parameters = {},
}: StackedFuelCellProps) {
  const groupRef = useRef<THREE.Group>(null);
  const stackRefs = useRef<(THREE.Mesh | null)[]>([]);

  // Calculate dynamic dimensions and properties
  const stackConfig = useMemo(() => {
    const stackCount = parameters.numberOfChambers || 5;
    const baseLength = 2.5;
    const baseWidth = 1.2;
    const baseHeight = 0.25;

    // Scale based on parameters
    const lengthScale = parameters.chamberLength ? parameters.chamberLength / 100 : 1;
    const widthScale = parameters.chamberWidth ? parameters.chamberWidth / 50 : 1;
    const heightScale = parameters.chamberHeight ? parameters.chamberHeight / 30 : 1;

    return {
      count: stackCount,
      length: baseLength * lengthScale,
      width: baseWidth * widthScale,
      height: baseHeight * heightScale,
      spacing: 0.35 * heightScale,
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
      }[parameters.anodeMaterial || 'carbon-cloth'] || '#81c784';

    const cathodeColor =
      {
        platinum: '#c0c0c0',
        'carbon-pt': '#9e9e9e',
        mno2: '#8d6e63',
        carbon: '#424242',
      }[parameters.cathodeMaterial || 'platinum'] || '#64b5f6';

    return { anodeColor, cathodeColor };
  }, [parameters]);

  // Connection type configuration
  const connectionConfig = useMemo(() => {
    const connectionType = parameters.connectionType || 'single';
    const voltage = parameters.operatingVoltage || 0.5;

    return {
      type: connectionType,
      voltage: voltage,
      showSeries: connectionType === 'series' || connectionType === 'mixed',
      showParallel: connectionType === 'parallel' || connectionType === 'mixed',
    };
  }, [parameters]);

  // Environmental effects
  const environmentalEffects = useMemo(() => {
    const temp = parameters.temperature || 25;
    const ph = parameters.ph || 7.0;
    const flowRate = parameters.flowRate || 10;

    const tempIntensity = Math.max(0.3, Math.min(1.0, (temp - 15) / 25));
    const biofilmColor = ph < 6.5 ? '#ff9800' : ph > 7.5 ? '#2196f3' : '#4caf50';
    const flowSpeed = Math.max(0.5, Math.min(3.0, flowRate / 10));

    return { tempIntensity, biofilmColor, flowSpeed };
  }, [parameters]);

  useFrame((state, delta) => {
    if (groupRef.current && showAnimation) {
      groupRef.current.rotation.y += delta * 0.15;
    }

    // Animate individual stack elements with dynamic flow speed
    if (visualizationMode === 'flow') {
      stackRefs.current.forEach((ref, i) => {
        if (ref) {
          const offset =
            Math.sin(state.clock.elapsedTime * 2 * environmentalEffects.flowSpeed + i * 0.5) * 0.02;
          ref.position.y = i * stackConfig.spacing + offset;
        }
      });
    }
  });

  return (
    <group ref={groupRef} scale={scale}>
      {/* Base platform - dynamic dimensions */}
      <mesh position={[0, -0.2, 0]}>
        <boxGeometry args={[stackConfig.length * 1.2, 0.1, stackConfig.width * 1.25]} />
        <meshStandardMaterial color="#37474f" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Stacked fuel cell units - dynamic count and dimensions */}
      {Array.from({ length: stackConfig.count }).map((_, i) => {
        const isAnode = i % 2 === 0;
        const yPosition = i * stackConfig.spacing;

        return (
          <group key={i}>
            {/* Main cell body - dynamic dimensions and materials */}
            <mesh
              position={[0, yPosition, 0]}
              ref={(el) => {
                stackRefs.current[i] = el;
              }}
            >
              <boxGeometry args={[stackConfig.length, stackConfig.height, stackConfig.width]} />
              <meshStandardMaterial
                color={isAnode ? materialColors.anodeColor : materialColors.cathodeColor}
                transparent
                opacity={0.8 * environmentalEffects.tempIntensity}
                metalness={0.3}
                roughness={0.4}
              />
            </mesh>

            {/* Electrode tabs - dynamic positioning */}
            <mesh position={[stackConfig.length * 0.56, yPosition, 0]}>
              <boxGeometry args={[0.2, 0.15, stackConfig.width * 0.67]} />
              <meshStandardMaterial
                color={isAnode ? materialColors.anodeColor : materialColors.cathodeColor}
                metalness={0.9}
                roughness={0.1}
              />
            </mesh>

            {/* Internal electrode structure - dynamic dimensions */}
            <mesh position={[0, yPosition + stackConfig.height * 0.2, 0]}>
              <boxGeometry
                args={[
                  stackConfig.length * 0.92,
                  stackConfig.height * 0.2,
                  stackConfig.width * 0.83,
                ]}
              />
              <meshStandardMaterial color="#424242" metalness={0.8} roughness={0.2} />
            </mesh>

            {/* Separator membrane - dynamic dimensions */}
            <mesh position={[0, yPosition + stackConfig.height * 0.4, 0]}>
              <boxGeometry
                args={[
                  stackConfig.length * 0.96,
                  stackConfig.height * 0.08,
                  stackConfig.width * 0.92,
                ]}
              />
              <meshStandardMaterial
                color="#ffffff"
                transparent
                opacity={0.7 * environmentalEffects.tempIntensity}
              />
            </mesh>

            {/* Flow visualizations */}
            {visualizationMode === 'flow' && (
              <>
                {/* Hydrogen flow (anode side) */}
                {isAnode &&
                  Array.from({ length: 3 }).map((_, j) => (
                    <mesh key={`h-${j}`} position={[-0.8 + j * 0.8, yPosition + 0.15, 0]}>
                      <sphereGeometry args={[0.03, 8, 6]} />
                      <meshStandardMaterial
                        color="#e3f2fd"
                        transparent
                        opacity={0.8}
                        emissive="#1976d2"
                        emissiveIntensity={0.1}
                      />
                    </mesh>
                  ))}

                {/* Oxygen flow (cathode side) */}
                {!isAnode &&
                  Array.from({ length: 3 }).map((_, j) => (
                    <mesh key={`o-${j}`} position={[-0.8 + j * 0.8, yPosition + 0.15, 0]}>
                      <sphereGeometry args={[0.025, 8, 6]} />
                      <meshStandardMaterial
                        color="#ffebee"
                        transparent
                        opacity={0.8}
                        emissive="#d32f2f"
                        emissiveIntensity={0.1}
                      />
                    </mesh>
                  ))}
              </>
            )}

            {/* Biofilm on electrodes (biofilm mode) - dynamic dimensions and color */}
            {visualizationMode === 'biofilm' && isAnode && (
              <mesh position={[0, yPosition + stackConfig.height * 0.32, 0]}>
                <boxGeometry
                  args={[
                    stackConfig.length * 0.88,
                    (parameters.biofilmThickness || 0.1) * 0.3,
                    stackConfig.width * 0.75,
                  ]}
                />
                <meshStandardMaterial
                  color={environmentalEffects.biofilmColor}
                  transparent
                  opacity={0.6 * environmentalEffects.tempIntensity}
                  emissive={environmentalEffects.biofilmColor}
                  emissiveIntensity={0.2}
                />
              </mesh>
            )}
          </group>
        );
      })}

      {/* Series connection wires - conditional based on connection type */}
      {connectionConfig.showSeries && (
        <mesh
          position={[stackConfig.length * 0.72, stackConfig.count * stackConfig.spacing * 0.5, 0]}
        >
          <cylinderGeometry args={[0.03, 0.03, stackConfig.count * stackConfig.spacing]} />
          <meshStandardMaterial
            color="#ff7043"
            metalness={0.8}
            emissive="#ff7043"
            emissiveIntensity={connectionConfig.voltage * 0.1}
          />
        </mesh>
      )}

      {/* Parallel connection wires - conditional based on connection type */}
      {connectionConfig.showParallel && (
        <mesh
          position={[-stackConfig.length * 0.72, stackConfig.count * stackConfig.spacing * 0.5, 0]}
        >
          <cylinderGeometry args={[0.03, 0.03, stackConfig.count * stackConfig.spacing]} />
          <meshStandardMaterial
            color="#2196f3"
            metalness={0.8}
            emissive="#2196f3"
            emissiveIntensity={connectionConfig.voltage * 0.1}
          />
        </mesh>
      )}

      {/* Terminal connections - dynamic positioning */}
      <mesh
        position={[stackConfig.length * 0.72, stackConfig.count * stackConfig.spacing + 0.1, 0]}
      >
        <boxGeometry args={[0.15, 0.1, stackConfig.width * 0.25]} />
        <meshStandardMaterial
          color="#d32f2f"
          metalness={0.7}
          emissive="#d32f2f"
          emissiveIntensity={connectionConfig.voltage * 0.05}
        />
      </mesh>
      <mesh position={[-stackConfig.length * 0.72, -0.1, 0]}>
        <boxGeometry args={[0.15, 0.1, stackConfig.width * 0.25]} />
        <meshStandardMaterial
          color="#1976d2"
          metalness={0.7}
          emissive="#1976d2"
          emissiveIntensity={connectionConfig.voltage * 0.05}
        />
      </mesh>

      {/* Mounting hardware - dynamic positioning */}
      {[0, stackConfig.count * stackConfig.spacing].map((y, i) => (
        <group key={i}>
          <mesh position={[-stackConfig.length * 0.6, y, stackConfig.width * 0.67]}>
            <cylinderGeometry args={[0.05, 0.05, 0.2]} />
            <meshStandardMaterial color="#616161" metalness={0.8} />
          </mesh>
          <mesh position={[stackConfig.length * 0.6, y, stackConfig.width * 0.67]}>
            <cylinderGeometry args={[0.05, 0.05, 0.2]} />
            <meshStandardMaterial color="#616161" metalness={0.8} />
          </mesh>
          <mesh position={[-stackConfig.length * 0.6, y, -stackConfig.width * 0.67]}>
            <cylinderGeometry args={[0.05, 0.05, 0.2]} />
            <meshStandardMaterial color="#616161" metalness={0.8} />
          </mesh>
          <mesh position={[stackConfig.length * 0.6, y, -stackConfig.width * 0.67]}>
            <cylinderGeometry args={[0.05, 0.05, 0.2]} />
            <meshStandardMaterial color="#616161" metalness={0.8} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
