/**
 * Core types and interfaces for MESSAI AI Predictions Engine
 * Based on CLAUDE.md specifications for ML model integration
 */

// System Configuration Types
export interface MessSystemConfiguration {
  id: string;
  name: string;
  type:
    | 'microfluidic_algal'
    | 'benchtop_bioreactor'
    | 'stacked_fuel_cell'
    | 'industrial_scale'
    | 'custom';
  description: string;
  baseParameters: Record<string, number>;
}

export interface ElectrodeMaterial {
  id: string;
  name: string;
  type: 'carbon_cloth' | 'graphite_felt' | 'stainless_steel_mesh' | 'platinum' | 'custom';
  conductivity: number; // S/m
  surfaceArea: number; // m²/g
  cost: number; // $/kg
  biocompatibility: number; // 0-1 score
}

export interface MicrobialSpecies {
  id: string;
  name: string;
  scientificName: string;
  type: 'geobacter' | 'shewanella' | 'pseudomonas' | 'mixed_culture' | 'custom';
  electronTransferRate: number; // electrons/s
  substrateAffinity: number; // 0-1 score
  temperatureRange: [number, number]; // [min, max] Celsius
  phRange: [number, number]; // [min, max] pH
}

export interface OperatingConditions {
  temperature: number; // Celsius
  ph: number;
  substrateConcetration: number; // mg/L
  flowRate: number; // mL/min
  electricalLoad: number; // Ohms
  duration: number; // hours
}

// Prediction Configuration
export interface PredictionConfiguration {
  id: string;
  name: string;
  systemConfig: MessSystemConfiguration;
  anodeMaterial: ElectrodeMaterial;
  cathodeMaterial: ElectrodeMaterial;
  microbialSpecies: MicrobialSpecies;
  operatingConditions: OperatingConditions;
  createdAt: Date;
  userId?: string;
}

// Performance Prediction Results
export interface PerformancePrediction {
  id: string;
  configurationId: string;

  // Power Output Metrics
  powerOutput: {
    voltage: number; // V
    current: number; // A
    powerDensity: number; // mW/cm²
    energyDensity: number; // Wh/kg
    powerCurve: Array<{ voltage: number; current: number; power: number }>;
  };

  // Efficiency Metrics
  efficiency: {
    coulombicEfficiency: number; // %
    energyEfficiency: number; // %
    substrateRemovalRate: number; // %
    carbonConversionEfficiency: number; // %
  };

  // System Performance
  performance: {
    startupTime: number; // hours
    stabilityIndex: number; // 0-1 score
    lifespanEstimate: number; // days
    maintenanceFrequency: number; // days
  };

  // Economic Analysis
  economics: {
    materialCost: number; // $
    operatingCost: number; // $/day
    energyValue: number; // $/kWh
    roi: number; // % annual
    paybackPeriod: number; // months
  };

  // Confidence Scoring
  confidence: ConfidenceScore;

  // Optimization Recommendations
  optimizations: OptimizationRecommendation[];

  createdAt: Date;
}

export interface ConfidenceScore {
  overall: number; // 0-100
  breakdown: {
    trainingDataQuality: number; // 0-100
    parameterSimilarity: number; // 0-100
    modelAccuracy: number; // 0-100
    uncertaintyRange: number; // ±%
  };
  factors: {
    paperCount: number; // Number of similar papers in training
    experimentalValidation: boolean;
    parameterCoverage: number; // % of parameters with training data
  };
}

export interface OptimizationRecommendation {
  id: string;
  type: 'electrode_material' | 'microbial_species' | 'operating_conditions' | 'system_design';
  priority: 'high' | 'medium' | 'low';
  impact: 'power' | 'efficiency' | 'cost' | 'stability';
  description: string;
  expectedImprovement: number; // % improvement
  implementationCost: number; // $ cost
  parameter: string;
  currentValue: number;
  recommendedValue: number;
  confidence: number; // 0-100
}

// Optimization Algorithm Types
export type OptimizationAlgorithm =
  | 'genetic'
  | 'particle_swarm'
  | 'gradient_descent'
  | 'bayesian'
  | 'hybrid';

export interface OptimizationObjective {
  parameter: 'power_output' | 'efficiency' | 'cost' | 'stability' | 'lifespan';
  weight: number; // 0-1, sum should equal 1
  target: 'maximize' | 'minimize';
}

export interface OptimizationConstraint {
  parameter: string;
  min?: number;
  max?: number;
  discrete?: number[];
}

export interface OptimizationRequest {
  configurationId: string;
  algorithm: OptimizationAlgorithm;
  objectives: OptimizationObjective[];
  constraints: OptimizationConstraint[];
  maxIterations: number;
  populationSize?: number; // For genetic and particle swarm
  learningRate?: number; // For gradient descent
  convergenceThreshold: number;
}

export interface OptimizationResult {
  id: string;
  requestId: string;
  algorithm: OptimizationAlgorithm;

  // Results
  optimalConfiguration: PredictionConfiguration;
  performanceImprovement: number; // % improvement
  convergenceData: OptimizationStep[];

  // Algorithm Performance
  iterations: number;
  convergenceTime: number; // seconds
  finalScore: number;

  // Analysis
  sensitivityAnalysis: ParameterSensitivity[];
  pareto_front?: ParetoPoint[]; // For multi-objective optimization

  createdAt: Date;
}

export interface OptimizationStep {
  iteration: number;
  bestScore: number;
  averageScore: number;
  diversity?: number; // Population diversity for evolutionary algorithms
  parameters: Record<string, number>;
  timestamp: number;
}

export interface ParameterSensitivity {
  parameter: string;
  sensitivity: number; // -1 to 1, impact on objective
  confidenceInterval: [number, number];
  importance: number; // 0-1, relative importance
}

export interface ParetoPoint {
  configuration: Partial<PredictionConfiguration>;
  objectives: Record<string, number>;
  dominated: boolean;
}

// Prediction History and Comparison
export interface PredictionHistory {
  id: string;
  userId: string;
  predictions: PerformancePrediction[];
  comparisons: PredictionComparison[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PredictionComparison {
  id: string;
  name: string;
  predictionIds: string[];
  metrics: ComparisonMetric[];
  insights: string[];
  createdAt: Date;
}

export interface ComparisonMetric {
  name: string;
  values: Record<string, number>; // predictionId -> value
  unit: string;
  optimal: 'higher' | 'lower';
}

// ML Model Simulation Types
export interface MLModelConfig {
  name: string;
  type: 'random_forest' | 'neural_network' | 'svm' | 'ensemble';
  trainingDataSize: number;
  features: string[];
  accuracy: number; // 0-1
  lastTrained: Date;
  version: string;
}

export interface TrainingDataQuality {
  paperCount: number;
  parameterCoverage: number; // 0-1
  experimentalVariance: number;
  publicationYearRange: [number, number];
  journalQuality: number; // 0-1 based on impact factor
}

// Real-time Prediction State
export interface PredictionState {
  isLoading: boolean;
  progress: number; // 0-100
  stage: 'initializing' | 'processing' | 'optimizing' | 'validating' | 'complete' | 'error';
  message: string;
  estimatedTimeRemaining?: number; // seconds
}

// Export utility types
export type PredictionStatus = 'draft' | 'running' | 'completed' | 'failed';
export type PredictionQuality = 'high' | 'good' | 'moderate' | 'low';

// Preset Configurations
export interface PresetConfiguration {
  id: string;
  name: string;
  description: string;
  category: 'research' | 'educational' | 'industrial' | 'custom';
  configuration: PredictionConfiguration;
  popularity: number; // Usage count
  rating: number; // User rating 0-5
  tags: string[];
  createdBy: string;
  isPublic: boolean;
}
