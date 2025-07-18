import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

export interface Experiment {
  id: string;
  name: string;
  description?: string;
  status: 'draft' | 'running' | 'completed' | 'failed' | 'paused';
  progress: number;
  systemType: 'MFC' | 'MEC' | 'MDC' | 'BES' | 'MES';
  configuration: {
    anodeMaterial?: string;
    cathodeMaterial?: string;
    membraneType?: string;
    reactorVolume?: number;
    temperature?: number;
    pH?: number;
    substrateType?: string;
    substrateConcentration?: number;
    hydraulicRetentionTime?: number;
    externalResistance?: number;
  };
  parameters: Record<string, any>;
  results?: {
    powerOutput?: number;
    efficiency?: number;
    currentDensity?: number;
    voltageOutput?: number;
    internalResistance?: number;
    coulombicEfficiency?: number;
    [key: string]: any;
  };
  startedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  paperId?: string;
}

export interface Prediction {
  id: string;
  experimentId?: string;
  configuration: Experiment['configuration'];
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  stage?: string;
  result?: {
    powerOutput: number;
    efficiency: number;
    confidence: number;
    uncertaintyBounds: {
      powerOutput: { min: number; max: number };
      efficiency: { min: number; max: number };
    };
    optimizationSuggestions?: Array<{
      parameter: string;
      currentValue: any;
      suggestedValue: any;
      expectedImprovement: number;
    }>;
  };
  error?: string;
  createdAt: Date;
  completedAt?: Date;
}

interface ExperimentsState {
  // Experiments
  experiments: Experiment[];
  activeExperiment: Experiment | null;

  // Predictions
  predictions: Prediction[];
  activePrediction: Prediction | null;

  // UI state
  showCompletedOnly: boolean;
  sortBy: 'date' | 'name' | 'status' | 'progress';
  sortOrder: 'asc' | 'desc';

  // Real-time updates
  realtimeData: Map<
    string,
    {
      timestamp: Date;
      voltage: number;
      current: number;
      power: number;
      temperature?: number;
      pH?: number;
    }[]
  >;
}

interface ExperimentsActions {
  // Experiment actions
  setExperiments: (experiments: Experiment[]) => void;
  addExperiment: (experiment: Experiment) => void;
  updateExperiment: (id: string, updates: Partial<Experiment>) => void;
  removeExperiment: (id: string) => void;
  setActiveExperiment: (experiment: Experiment | null) => void;

  // Experiment lifecycle
  startExperiment: (id: string) => Promise<void>;
  pauseExperiment: (id: string) => Promise<void>;
  resumeExperiment: (id: string) => Promise<void>;
  stopExperiment: (id: string) => Promise<void>;

  // Prediction actions
  setPredictions: (predictions: Prediction[]) => void;
  addPrediction: (prediction: Prediction) => void;
  updatePrediction: (id: string, updates: Partial<Prediction>) => void;
  removePrediction: (id: string) => void;
  setActivePrediction: (prediction: Prediction | null) => void;

  // Prediction lifecycle
  createPrediction: (configuration: Experiment['configuration']) => Promise<Prediction>;
  cancelPrediction: (id: string) => Promise<void>;

  // Real-time data
  addRealtimeData: (
    experimentId: string,
    data: ExperimentsState['realtimeData'] extends Map<any, (infer T)[]> ? T : never
  ) => void;
  clearRealtimeData: (experimentId: string) => void;

  // UI actions
  setShowCompletedOnly: (show: boolean) => void;
  setSortBy: (sortBy: ExperimentsState['sortBy']) => void;
  setSortOrder: (order: ExperimentsState['sortOrder']) => void;

  // Complex actions
  loadExperiments: () => Promise<void>;
  loadExperimentDetails: (id: string) => Promise<void>;
  exportExperimentData: (id: string, format: 'csv' | 'json' | 'xlsx') => Promise<void>;
}

export const useExperimentsStore = create<ExperimentsState & ExperimentsActions>()(
  devtools(
    subscribeWithSelector(
      immer((set, get) => ({
        // Initial state
        experiments: [],
        activeExperiment: null,
        predictions: [],
        activePrediction: null,
        showCompletedOnly: false,
        sortBy: 'date',
        sortOrder: 'desc',
        realtimeData: new Map(),

        // Experiment actions
        setExperiments: (experiments) =>
          set((state) => {
            state.experiments = experiments;
          }),

        addExperiment: (experiment) =>
          set((state) => {
            state.experiments.unshift(experiment);
          }),

        updateExperiment: (id, updates) =>
          set((state) => {
            const index = state.experiments.findIndex((e) => e.id === id);
            if (index !== -1) {
              state.experiments[index] = { ...state.experiments[index], ...updates };
            }

            if (state.activeExperiment?.id === id) {
              state.activeExperiment = { ...state.activeExperiment, ...updates };
            }
          }),

        removeExperiment: (id) =>
          set((state) => {
            state.experiments = state.experiments.filter((e) => e.id !== id);

            if (state.activeExperiment?.id === id) {
              state.activeExperiment = null;
            }

            // Clear real-time data
            state.realtimeData.delete(id);
          }),

        setActiveExperiment: (experiment) =>
          set((state) => {
            state.activeExperiment = experiment;
          }),

        // Experiment lifecycle
        startExperiment: async (id) => {
          try {
            const response = await fetch(`/api/experiments/${id}/start`, {
              method: 'POST',
            });

            if (!response.ok) {
              throw new Error('Failed to start experiment');
            }

            const result = await response.json();

            set((state) => {
              const experiment = state.experiments.find((e) => e.id === id);
              if (experiment) {
                experiment.status = 'running';
                experiment.startedAt = new Date();
                experiment.progress = 0;
              }
            });
          } catch (error) {
            console.error('Failed to start experiment:', error);
            throw error;
          }
        },

        pauseExperiment: async (id) => {
          try {
            const response = await fetch(`/api/experiments/${id}/pause`, {
              method: 'POST',
            });

            if (!response.ok) {
              throw new Error('Failed to pause experiment');
            }

            set((state) => {
              const experiment = state.experiments.find((e) => e.id === id);
              if (experiment) {
                experiment.status = 'paused';
              }
            });
          } catch (error) {
            console.error('Failed to pause experiment:', error);
            throw error;
          }
        },

        resumeExperiment: async (id) => {
          try {
            const response = await fetch(`/api/experiments/${id}/resume`, {
              method: 'POST',
            });

            if (!response.ok) {
              throw new Error('Failed to resume experiment');
            }

            set((state) => {
              const experiment = state.experiments.find((e) => e.id === id);
              if (experiment) {
                experiment.status = 'running';
              }
            });
          } catch (error) {
            console.error('Failed to resume experiment:', error);
            throw error;
          }
        },

        stopExperiment: async (id) => {
          try {
            const response = await fetch(`/api/experiments/${id}/stop`, {
              method: 'POST',
            });

            if (!response.ok) {
              throw new Error('Failed to stop experiment');
            }

            set((state) => {
              const experiment = state.experiments.find((e) => e.id === id);
              if (experiment) {
                experiment.status = 'completed';
                experiment.completedAt = new Date();
                experiment.progress = 100;
              }
            });
          } catch (error) {
            console.error('Failed to stop experiment:', error);
            throw error;
          }
        },

        // Prediction actions
        setPredictions: (predictions) =>
          set((state) => {
            state.predictions = predictions;
          }),

        addPrediction: (prediction) =>
          set((state) => {
            state.predictions.unshift(prediction);
          }),

        updatePrediction: (id, updates) =>
          set((state) => {
            const index = state.predictions.findIndex((p) => p.id === id);
            if (index !== -1) {
              state.predictions[index] = { ...state.predictions[index], ...updates };
            }

            if (state.activePrediction?.id === id) {
              state.activePrediction = { ...state.activePrediction, ...updates };
            }
          }),

        removePrediction: (id) =>
          set((state) => {
            state.predictions = state.predictions.filter((p) => p.id !== id);

            if (state.activePrediction?.id === id) {
              state.activePrediction = null;
            }
          }),

        setActivePrediction: (prediction) =>
          set((state) => {
            state.activePrediction = prediction;
          }),

        // Prediction lifecycle
        createPrediction: async (configuration) => {
          const prediction: Prediction = {
            id: `pred-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            configuration,
            status: 'pending',
            progress: 0,
            createdAt: new Date(),
          };

          set((state) => {
            state.predictions.unshift(prediction);
            state.activePrediction = prediction;
          });

          try {
            const response = await fetch('/api/predictions', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ configuration }),
            });

            if (!response.ok) {
              throw new Error('Failed to create prediction');
            }

            const result = await response.json();

            set((state) => {
              const pred = state.predictions.find((p) => p.id === prediction.id);
              if (pred) {
                pred.id = result.data.id;
                pred.status = 'processing';
              }
            });

            return result.data;
          } catch (error) {
            set((state) => {
              const pred = state.predictions.find((p) => p.id === prediction.id);
              if (pred) {
                pred.status = 'failed';
                pred.error = (error as Error).message;
              }
            });
            throw error;
          }
        },

        cancelPrediction: async (id) => {
          try {
            const response = await fetch(`/api/predictions/${id}/cancel`, {
              method: 'POST',
            });

            if (!response.ok) {
              throw new Error('Failed to cancel prediction');
            }

            set((state) => {
              const prediction = state.predictions.find((p) => p.id === id);
              if (prediction) {
                prediction.status = 'failed';
                prediction.error = 'Cancelled by user';
              }
            });
          } catch (error) {
            console.error('Failed to cancel prediction:', error);
            throw error;
          }
        },

        // Real-time data
        addRealtimeData: (experimentId, data) =>
          set((state) => {
            const existingData = state.realtimeData.get(experimentId) || [];
            existingData.push(data);

            // Keep only last 1000 data points
            if (existingData.length > 1000) {
              existingData.shift();
            }

            state.realtimeData.set(experimentId, existingData);
          }),

        clearRealtimeData: (experimentId) =>
          set((state) => {
            state.realtimeData.delete(experimentId);
          }),

        // UI actions
        setShowCompletedOnly: (show) =>
          set((state) => {
            state.showCompletedOnly = show;
          }),

        setSortBy: (sortBy) =>
          set((state) => {
            state.sortBy = sortBy;
          }),

        setSortOrder: (order) =>
          set((state) => {
            state.sortOrder = order;
          }),

        // Complex actions
        loadExperiments: async () => {
          try {
            const response = await fetch('/api/experiments');
            const result = await response.json();

            if (result.error) {
              throw new Error(result.error.message);
            }

            set((state) => {
              state.experiments = result.data.experiments;
            });
          } catch (error) {
            console.error('Failed to load experiments:', error);
            throw error;
          }
        },

        loadExperimentDetails: async (id) => {
          try {
            const response = await fetch(`/api/experiments/${id}`);
            const result = await response.json();

            if (result.error) {
              throw new Error(result.error.message);
            }

            set((state) => {
              state.activeExperiment = result.data;
            });
          } catch (error) {
            console.error('Failed to load experiment details:', error);
            throw error;
          }
        },

        exportExperimentData: async (id, format) => {
          try {
            const response = await fetch(`/api/experiments/${id}/export?format=${format}`);

            if (!response.ok) {
              throw new Error('Failed to export experiment data');
            }

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `experiment-${id}.${format}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          } catch (error) {
            console.error('Failed to export experiment data:', error);
            throw error;
          }
        },
      }))
    ),
    {
      name: 'MessAI Experiments Store',
    }
  )
);

// Selectors
export const selectExperiments = (state: ExperimentsState & ExperimentsActions) => {
  let experiments = [...state.experiments];

  // Filter
  if (state.showCompletedOnly) {
    experiments = experiments.filter((e) => e.status === 'completed');
  }

  // Sort
  experiments.sort((a, b) => {
    let comparison = 0;

    switch (state.sortBy) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'status':
        comparison = a.status.localeCompare(b.status);
        break;
      case 'progress':
        comparison = a.progress - b.progress;
        break;
      case 'date':
      default:
        comparison = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        break;
    }

    return state.sortOrder === 'asc' ? comparison : -comparison;
  });

  return experiments;
};

export const selectActiveExperiments = (state: ExperimentsState & ExperimentsActions) =>
  state.experiments.filter((e) => e.status === 'running' || e.status === 'paused');

export const selectRealtimeData =
  (experimentId: string) => (state: ExperimentsState & ExperimentsActions) =>
    state.realtimeData.get(experimentId) || [];
