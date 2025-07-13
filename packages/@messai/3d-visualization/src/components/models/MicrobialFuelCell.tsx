import React from 'react'
import { Group } from 'three'
import { useRef } from 'react'
import { Chamber } from '../primitives/Chamber'
import { Electrode } from '../primitives/Electrode'
import { Membrane } from '../primitives/Membrane'
import { FlowVisualization } from '../effects/FlowVisualization'
import { BiofilmVisualization } from '../effects/BiofilmVisualization'
import { MESSModel3DProps } from '../../types'

export const MicrobialFuelCell: React.FC<MESSModel3DProps> = ({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  configuration,
  showLabels = false,
  showFlow = false,
  showBiofilm = false,
  interactive = true,
  onSelect,
}) => {
  const groupRef = useRef<Group>(null)
  
  const defaultConfig = {
    electrodes: {
      anode: {
        type: 'anode' as const,
        material: 'carbon',
        position: [-1.5, 0, 0] as [number, number, number],
        size: [0.5, 2, 0.1] as [number, number, number],
      },
      cathode: {
        type: 'cathode' as const,
        material: 'carbon',
        position: [1.5, 0, 0] as [number, number, number],
        size: [0.5, 2, 0.1] as [number, number, number],
      },
    },
    chamber: {
      type: 'anode' as const,
      dimensions: [4, 3, 2] as [number, number, number],
    },
    membrane: {
      type: 'PEM' as const,
      position: [0, 0, 0] as [number, number, number],
      size: [0.1, 2.5, 1.8] as [number, number, number],
    },
  }
  
  const config = { ...defaultConfig, ...configuration }
  
  return (
    <group 
      ref={groupRef} 
      position={position} 
      rotation={rotation} 
      scale={scale}
      onClick={() => interactive && onSelect?.('mfc')}
    >
      {/* Main chamber */}
      <Chamber {...config.chamber}>
        {/* Anode */}
        <Electrode 
          {...config.electrodes.anode!} 
          showLabel={showLabels}
        />
        
        {/* Cathode */}
        <Electrode 
          {...config.electrodes.cathode!} 
          showLabel={showLabels}
        />
        
        {/* Membrane */}
        <Membrane {...config.membrane!} />
        
        {/* Flow visualization */}
        {showFlow && config.flow && (
          <FlowVisualization 
            pattern={config.flow}
            bounds={config.chamber.dimensions}
          />
        )}
        
        {/* Biofilm on anode */}
        {showBiofilm && config.biofilm && config.electrodes.anode?.size && (
          <BiofilmVisualization
            {...config.biofilm}
            position={config.electrodes.anode.position}
            size={config.electrodes.anode.size}
          />
        )}
      </Chamber>
    </group>
  )
}