import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { 
  MESSConfig, 
  MESSModelType,
  MicrofluidicConfig,
  StackedConfig,
  BenchtopConfig,
  IndustrialConfig 
} from '../types';

export interface MultiMESSState {
  // Model configurations
  models: Record<string, MESSConfig>;
  activeModelId: string | null;
  selectedModelType: MESSModelType | null;
  
  // Presets
  presets: Record<string, MESSConfig>;
  
  // Actions
  createModel: (type: MESSModelType, config: Partial<MESSConfig>) => string;
  updateModel: (id: string, updates: Partial<MESSConfig>) => void;
  deleteModel: (id: string) => void;
  setActiveModel: (id: string | null) => void;
  selectModelType: (type: MESSModelType | null) => void;
  
  // Presets
  saveAsPreset: (modelId: string, name: string) => void;
  loadPreset: (presetName: string) => string;
  deletePreset: (name: string) => void;
  
  // Model-specific actions
  updateMicrofluidicFlow: (id: string, flowRate: number) => void;
  toggleStackedConnection: (id: string) => void;
  updateBenchtopMixing: (id: string, speed: number) => void;
  updateIndustrialCapacity: (id: string, capacity: number) => void;
  
  // Computed
  getActiveModel: () => MESSConfig | null;
  getModelsByType: (type: MESSModelType) => MESSConfig[];
}

// Default configurations for each model type (without id, which is added dynamically)
const defaultConfigs: Record<MESSModelType, Partial<MESSConfig>> = {
  microfluidic: {
    type: 'microfluidic',
    scale: 'micro',
    name: 'Microfluidic Algal Fuel Cell',
    description: 'Microscope slide chip with magnetic electrodes',
    dimensions: {
      slideLength: 75,
      slideWidth: 25,
      channelDepth: 100,
      channelWidth: 500
    },
    electrodes: {
      material: 'magnetic',
      pattern: 'interdigitated'
    },
    membrane: {
      type: 'hydrogel',
      thickness: 50,
      porosity: 80
    },
    algaeSpecies: 'Chlorella vulgaris',
    flowRate: 10,
    visualizationConfig: {
      defaultCamera: {
        position: [0, 50, 100],
        lookAt: [0, 0, 0]
      },
      animations: {
        flow: true,
        biofilm: true
      },
      interactiveElements: ['electrodes', 'channels', 'membrane']
    }
  },
  
  stacked: {
    type: 'stacked',
    scale: 'lab',
    name: 'Stacked Fuel Cell Array',
    description: 'Series/parallel configurable stack',
    stackConfiguration: {
      numberOfCells: 4,
      connectionType: 'series',
      cellSpacing: 5
    },
    individualCell: {
      area: 25,
      voltage: 0.7,
      current: 50
    },
    totalOutput: {
      voltage: 2.8,
      current: 50,
      power: 140
    },
    visualizationConfig: {
      defaultCamera: {
        position: [100, 100, 100],
        lookAt: [0, 0, 0]
      },
      animations: {
        electricalFlow: true
      },
      interactiveElements: ['cells', 'connections', 'terminals']
    }
  },
  
  benchtop: {
    type: 'benchtop',
    scale: 'lab',
    name: 'Benchtop Bioreactor',
    description: 'Laboratory scale reactor for experiments',
    reactor: {
      volume: 1,
      shape: 'cylindrical',
      material: 'glass'
    },
    mixing: {
      type: 'magnetic',
      speed: 200
    },
    monitoring: {
      sensors: ['pH', 'temperature', 'DO'],
      dataLogging: true,
      samplingInterval: 60
    },
    cultivation: {
      mode: 'batch',
      inoculumVolume: 50,
      cultureAge: 7
    },
    visualizationConfig: {
      defaultCamera: {
        position: [50, 50, 100],
        lookAt: [0, 0, 0]
      },
      animations: {
        mixing: true,
        gasProduction: true
      },
      interactiveElements: ['reactor', 'electrodes', 'stirrer', 'sensors']
    }
  },
  
  industrial: {
    type: 'industrial',
    scale: 'industrial',
    name: 'Industrial Brewery System',
    description: 'Waste-to-energy system for brewery',
    system: {
      capacity: 100,
      footprint: 200,
      numberOfModules: 10
    },
    wasteStream: {
      type: 'brewery',
      COD: 3000,
      BOD: 1800,
      TSS: 500
    },
    energyOutput: {
      electrical: 500,
      biogas: 50,
      heat: 1000
    },
    economics: {
      capitalCost: 500000,
      operatingCost: 50000,
      paybackPeriod: 5,
      ROI: 20
    },
    visualizationConfig: {
      defaultCamera: {
        position: [500, 300, 500],
        lookAt: [0, 0, 0]
      },
      animations: {
        flow: true,
        gasProduction: true
      },
      interactiveElements: ['modules', 'piping', 'storage', 'control']
    }
  }
};

const multiMESSStore = create<MultiMESSState>()(
  devtools(
    persist(
      immer((set, get) => ({
        // Initial state
        models: {},
        activeModelId: null,
        selectedModelType: null,
        presets: {},
        
        // Actions
        createModel: (type, config) => {
          const id = `model-${type}-${Date.now()}`;
          const defaultConfig = defaultConfigs[type];
          
          set((state) => {
            state.models[id] = {
              ...defaultConfig,
              ...config,
              id,
              type
            } as MESSConfig;
          });
          
          return id;
        },
        
        updateModel: (id, updates) => set((state) => {
          if (state.models[id]) {
            Object.assign(state.models[id], updates);
          }
        }),
        
        deleteModel: (id) => set((state) => {
          delete state.models[id];
          if (state.activeModelId === id) {
            state.activeModelId = null;
          }
        }),
        
        setActiveModel: (id) => set((state) => {
          state.activeModelId = id;
        }),
        
        selectModelType: (type) => set((state) => {
          state.selectedModelType = type;
        }),
        
        // Presets
        saveAsPreset: (modelId, name) => set((state) => {
          const model = state.models[modelId];
          if (model) {
            state.presets[name] = { ...model };
          }
        }),
        
        loadPreset: (presetName) => {
          const preset = get().presets[presetName];
          if (!preset) throw new Error('Preset not found');
          
          const id = get().createModel(preset.type, preset);
          return id;
        },
        
        deletePreset: (name) => set((state) => {
          delete state.presets[name];
        }),
        
        // Model-specific actions
        updateMicrofluidicFlow: (id, flowRate) => set((state) => {
          const model = state.models[id];
          if (model && model.type === 'microfluidic') {
            (model as MicrofluidicConfig).flowRate = flowRate;
          }
        }),
        
        toggleStackedConnection: (id) => set((state) => {
          const model = state.models[id];
          if (model && model.type === 'stacked') {
            const stacked = model as StackedConfig;
            stacked.stackConfiguration.connectionType = 
              stacked.stackConfiguration.connectionType === 'series' ? 'parallel' : 'series';
            
            // Recalculate output
            if (stacked.stackConfiguration.connectionType === 'series') {
              stacked.totalOutput.voltage = stacked.individualCell.voltage * stacked.stackConfiguration.numberOfCells;
              stacked.totalOutput.current = stacked.individualCell.current;
            } else {
              stacked.totalOutput.voltage = stacked.individualCell.voltage;
              stacked.totalOutput.current = stacked.individualCell.current * stacked.stackConfiguration.numberOfCells;
            }
            stacked.totalOutput.power = stacked.totalOutput.voltage * stacked.totalOutput.current;
          }
        }),
        
        updateBenchtopMixing: (id, speed) => set((state) => {
          const model = state.models[id];
          if (model && model.type === 'benchtop') {
            (model as BenchtopConfig).mixing.speed = speed;
          }
        }),
        
        updateIndustrialCapacity: (id, capacity) => set((state) => {
          const model = state.models[id];
          if (model && model.type === 'industrial') {
            (model as IndustrialConfig).system.capacity = capacity;
          }
        }),
        
        // Computed
        getActiveModel: () => {
          const state = get();
          return state.activeModelId ? (state.models[state.activeModelId] ?? null) : null;
        },
        
        getModelsByType: (type) => {
          const state = get();
          return Object.values(state.models).filter(model => model.type === type);
        }
      })),
      {
        name: 'multimess-storage',
        partialize: (state) => ({
          models: state.models,
          presets: state.presets
        })
      }
    ),
    {
      name: 'MultiMESSStore'
    }
  )
);

export const useMultiMESSStore = multiMESSStore;
export type MultiMESSStore = typeof multiMESSStore;