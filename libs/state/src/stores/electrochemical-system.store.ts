import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { ElectrochemicalSystem, PerformanceMetrics } from '../types';

export interface ElectrochemicalSystemState {
  // State
  systems: Record<string, ElectrochemicalSystem>;
  activeSystemId: string | null;
  performanceHistory: Record<string, PerformanceMetrics[]>;
  isCalculating: boolean;
  
  // Actions
  createSystem: (system: Omit<ElectrochemicalSystem, 'id'>) => string;
  updateSystem: (id: string, updates: Partial<ElectrochemicalSystem>) => void;
  deleteSystem: (id: string) => void;
  setActiveSystem: (id: string | null) => void;
  
  // Performance
  calculatePerformance: (systemId: string) => Promise<PerformanceMetrics>;
  addPerformanceData: (systemId: string, metrics: PerformanceMetrics) => void;
  clearPerformanceHistory: (systemId: string) => void;
  
  // Computed
  getActiveSystem: () => ElectrochemicalSystem | null;
  getSystemPerformance: (systemId: string) => PerformanceMetrics[];
}

const electrochemicalSystemStore = create<ElectrochemicalSystemState>()(
  devtools(
    persist(
      immer((set, get) => ({
        // Initial state
        systems: {},
        activeSystemId: null,
        performanceHistory: {},
        isCalculating: false,
        
        // Actions
        createSystem: (system) => {
          const id = `system-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          set((state) => {
            state.systems[id] = { ...system, id };
          });
          return id;
        },
        
        updateSystem: (id, updates) => set((state) => {
          if (state.systems[id]) {
            Object.assign(state.systems[id], updates);
          }
        }),
        
        deleteSystem: (id) => set((state) => {
          delete state.systems[id];
          delete state.performanceHistory[id];
          if (state.activeSystemId === id) {
            state.activeSystemId = null;
          }
        }),
        
        setActiveSystem: (id) => set((state) => {
          state.activeSystemId = id;
        }),
        
        // Performance calculations
        calculatePerformance: async (systemId) => {
          const system = get().systems[systemId];
          if (!system) throw new Error('System not found');
          
          set((state) => {
            state.isCalculating = true;
          });
          
          try {
            // Simulate performance calculation
            // In real implementation, this would call the prediction API
            const metrics: PerformanceMetrics = {
              powerDensity: Math.random() * 1000, // mW/m²
              currentDensity: Math.random() * 500, // mA/m²
              voltage: 0.5 + Math.random() * 0.3, // V
              coulombicEfficiency: 20 + Math.random() * 60, // %
              substrateRemoval: 60 + Math.random() * 30, // %
              timestamp: new Date()
            };
            
            get().addPerformanceData(systemId, metrics);
            return metrics;
          } finally {
            set((state) => {
              state.isCalculating = false;
            });
          }
        },
        
        addPerformanceData: (systemId, metrics) => set((state) => {
          if (!state.performanceHistory[systemId]) {
            state.performanceHistory[systemId] = [];
          }
          state.performanceHistory[systemId].push(metrics);
        }),
        
        clearPerformanceHistory: (systemId) => set((state) => {
          state.performanceHistory[systemId] = [];
        }),
        
        // Computed
        getActiveSystem: () => {
          const state = get();
          return state.activeSystemId ? (state.systems[state.activeSystemId] ?? null) : null;
        },
        
        getSystemPerformance: (systemId) => {
          return get().performanceHistory[systemId] || [];
        }
      })),
      {
        name: 'electrochemical-system-storage',
        partialize: (state) => ({
          systems: state.systems,
          performanceHistory: state.performanceHistory
        })
      }
    ),
    {
      name: 'ElectrochemicalSystemStore'
    }
  )
);

export const useElectrochemicalSystemStore = electrochemicalSystemStore;
export type ElectrochemicalSystemStore = typeof electrochemicalSystemStore;