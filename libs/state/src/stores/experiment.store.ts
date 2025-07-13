import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { 
  Experiment, 
  ExperimentStatus, 
  TimeSeriesData,
  ExperimentSummary 
} from '../types';

export interface ExperimentStore {
  // State
  experiments: Record<string, Experiment>;
  activeExperimentId: string | null;
  
  // Filters
  statusFilter: ExperimentStatus | 'all';
  typeFilter: string | 'all';
  
  // Actions
  createExperiment: (experiment: Omit<Experiment, 'id' | 'createdAt'>) => string;
  updateExperiment: (id: string, updates: Partial<Experiment>) => void;
  deleteExperiment: (id: string) => void;
  setActiveExperiment: (id: string | null) => void;
  
  // Status management
  startExperiment: (id: string) => void;
  pauseExperiment: (id: string) => void;
  resumeExperiment: (id: string) => void;
  completeExperiment: (id: string) => void;
  archiveExperiment: (id: string) => void;
  
  // Data management
  addDataPoint: (experimentId: string, data: TimeSeriesData) => void;
  updateSummary: (experimentId: string, summary: Partial<ExperimentSummary>) => void;
  
  // Filtering
  setStatusFilter: (status: ExperimentStatus | 'all') => void;
  setTypeFilter: (type: string | 'all') => void;
  
  // Computed
  getFilteredExperiments: () => Experiment[];
  getActiveExperiment: () => Experiment | null;
}

const experimentStore = create<ExperimentStore>()(
  devtools(
    persist(
      immer((set, get) => ({
        // Initial state
        experiments: {},
        activeExperimentId: null,
        statusFilter: 'all',
        typeFilter: 'all',
        
        // Actions
        createExperiment: (experiment) => {
          const id = `exp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          set((state) => {
            state.experiments[id] = {
              ...experiment,
              id,
              createdAt: new Date(),
              status: 'draft',
              data: {
                timeSeries: [],
                summary: {
                  maxPowerDensity: 0,
                  avgPowerDensity: 0,
                  totalEnergyProduced: 0,
                  substrateConsumed: 0,
                  coulombicEfficiency: 0,
                  stabilityIndex: 0
                }
              }
            };
          });
          return id;
        },
        
        updateExperiment: (id, updates) => set((state) => {
          if (state.experiments[id]) {
            Object.assign(state.experiments[id], updates);
          }
        }),
        
        deleteExperiment: (id) => set((state) => {
          delete state.experiments[id];
          if (state.activeExperimentId === id) {
            state.activeExperimentId = null;
          }
        }),
        
        setActiveExperiment: (id) => set((state) => {
          state.activeExperimentId = id;
        }),
        
        // Status management
        startExperiment: (id) => set((state) => {
          const experiment = state.experiments[id];
          if (experiment && experiment.status === 'ready') {
            experiment.status = 'running';
            experiment.startedAt = new Date();
          }
        }),
        
        pauseExperiment: (id) => set((state) => {
          const experiment = state.experiments[id];
          if (experiment && experiment.status === 'running') {
            experiment.status = 'paused';
          }
        }),
        
        resumeExperiment: (id) => set((state) => {
          const experiment = state.experiments[id];
          if (experiment && experiment.status === 'paused') {
            experiment.status = 'running';
          }
        }),
        
        completeExperiment: (id) => set((state) => {
          const experiment = state.experiments[id];
          if (experiment && ['running', 'paused'].includes(experiment.status)) {
            experiment.status = 'completed';
            experiment.completedAt = new Date();
          }
        }),
        
        archiveExperiment: (id) => set((state) => {
          const experiment = state.experiments[id];
          if (experiment && experiment.status === 'completed') {
            experiment.status = 'archived';
          }
        }),
        
        // Data management
        addDataPoint: (experimentId, data) => set((state) => {
          const experiment = state.experiments[experimentId];
          if (experiment) {
            experiment.data.timeSeries.push(data);
            
            // Update summary statistics
            const powerDensity = data.measurements.powerDensity || 0;
            if (powerDensity > experiment.data.summary.maxPowerDensity) {
              experiment.data.summary.maxPowerDensity = powerDensity;
            }
            
            // Calculate average
            const allPowerDensities = experiment.data.timeSeries
              .map(d => d.measurements.powerDensity || 0)
              .filter(d => d > 0);
            
            if (allPowerDensities.length > 0) {
              experiment.data.summary.avgPowerDensity = 
                allPowerDensities.reduce((a, b) => a + b, 0) / allPowerDensities.length;
            }
          }
        }),
        
        updateSummary: (experimentId, summary) => set((state) => {
          const experiment = state.experiments[experimentId];
          if (experiment) {
            Object.assign(experiment.data.summary, summary);
          }
        }),
        
        // Filtering
        setStatusFilter: (status) => set((state) => {
          state.statusFilter = status;
        }),
        
        setTypeFilter: (type) => set((state) => {
          state.typeFilter = type;
        }),
        
        // Computed
        getFilteredExperiments: () => {
          const state = get();
          let experiments = Object.values(state.experiments);
          
          if (state.statusFilter !== 'all') {
            experiments = experiments.filter(e => e.status === state.statusFilter);
          }
          
          if (state.typeFilter !== 'all') {
            experiments = experiments.filter(e => e.type === state.typeFilter);
          }
          
          return experiments.sort((a, b) => 
            b.createdAt.getTime() - a.createdAt.getTime()
          );
        },
        
        getActiveExperiment: () => {
          const state = get();
          return state.activeExperimentId ? (state.experiments[state.activeExperimentId] ?? null) : null;
        }
      })),
      {
        name: 'experiment-storage',
        partialize: (state) => ({
          experiments: state.experiments
        })
      }
    ),
    {
      name: 'ExperimentStore'
    }
  )
);

export const useExperimentStore = experimentStore;
export type ExperimentStoreType = typeof experimentStore;