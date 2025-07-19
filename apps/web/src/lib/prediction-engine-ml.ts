/**
 * MESSAI AI Prediction Engine - ML Service Integration
 * Connects to the real ML service for predictions
 */

import type {
  PredictionConfiguration,
  PerformancePrediction,
  ConfidenceScore,
  OptimizationRecommendation,
  PredictionState,
} from '../types/predictions';

/**
 * ML-powered Prediction Engine
 * Uses actual machine learning models via the ML service
 */
export class MessAIMLPredictionEngine {
  private mlServiceUrl: string;
  private useMLService: boolean;

  constructor() {
    this.mlServiceUrl = process.env.NEXT_PUBLIC_ML_SERVICE_URL || '/api/ml';
    this.useMLService = process.env.NEXT_PUBLIC_USE_ML_SERVICE === 'true';
  }

  /**
   * Generate prediction using ML service
   */
  async generatePrediction(
    config: PredictionConfiguration,
    onProgress?: (state: PredictionState) => void
  ): Promise<PerformancePrediction> {
    // Update progress: preprocessing
    onProgress?.({
      stage: 'preprocessing',
      progress: 0.2,
      message: 'Preparing data for ML models...',
    });

    try {
      // Map configuration to ML service format
      const mlRequest = this.mapToMLRequest(config);

      // Update progress: running models
      onProgress?.({
        stage: 'running_models',
        progress: 0.5,
        message: 'Running ML predictions...',
      });

      // Call ML service
      const response = await fetch(`${this.mlServiceUrl}/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mlRequest),
      });

      if (!response.ok) {
        throw new Error(`ML service error: ${response.statusText}`);
      }

      const mlResponse = await response.json();

      // Update progress: post-processing
      onProgress?.({
        stage: 'postprocessing',
        progress: 0.8,
        message: 'Processing ML results...',
      });

      // Map ML response to MESSAI format
      const prediction = this.mapFromMLResponse(mlResponse, config);

      // Update progress: complete
      onProgress?.({
        stage: 'complete',
        progress: 1.0,
        message: 'Prediction complete!',
      });

      return prediction;
    } catch (error) {
      console.error('ML prediction error:', error);

      // Fallback to simulation if ML service fails
      if (this.useMLService) {
        console.warn('Falling back to simulation engine');
        const { MessAIPredictionEngine } = await import('./prediction-engine');
        const simulationEngine = new MessAIPredictionEngine();
        return simulationEngine.generatePrediction(config, onProgress);
      }

      throw error;
    }
  }

  /**
   * Map MESSAI configuration to ML service request format
   */
  private mapToMLRequest(config: PredictionConfiguration) {
    return {
      system_type: config.systemConfiguration.systemType,
      configuration: {
        reactor_volume: config.systemConfiguration.reactorVolume || 100,
        electrode_spacing: config.systemConfiguration.electrodeSpacing || 2,
        num_chambers: config.systemConfiguration.numChambers || 2,
        flow_mode: config.systemConfiguration.flowMode || 'batch',
      },
      conditions: {
        temperature: config.operatingConditions.temperature + 273.15, // Convert to Kelvin
        ph: config.operatingConditions.ph,
        flow_rate: config.operatingConditions.flowRate,
        substrate_concentration: config.operatingConditions.substrateConcentration,
        external_resistance: config.operatingConditions.externalResistance,
        pressure: config.operatingConditions.pressure || 1.0,
      },
      materials: {
        anode_material: config.electrodeSpecifications.anodeMaterial,
        cathode_material: config.electrodeSpecifications.cathodeMaterial,
        membrane_type: config.electrodeSpecifications.membraneType,
        anode_surface_area: config.electrodeSpecifications.anodeSurfaceArea,
        cathode_surface_area: config.electrodeSpecifications.cathodeSurfaceArea,
        anode_modifications: config.electrodeSpecifications.anodeModifications,
        cathode_modifications: config.electrodeSpecifications.cathodeModifications,
      },
    };
  }

  /**
   * Map ML service response to MESSAI prediction format
   */
  private mapFromMLResponse(
    mlResponse: any,
    config: PredictionConfiguration
  ): PerformancePrediction {
    // Map power output
    const powerOutput = {
      maximum: mlResponse.power_output.value,
      average: mlResponse.power_output.value * 0.8, // Estimate average
      minimum: mlResponse.power_output.value * 0.5, // Estimate minimum
      unit: 'mW/m²',
      timeToSteadyState: 24, // Default estimate
      degradationRate: 0.5, // Default estimate
    };

    // Map efficiency
    const efficiency = {
      coulombic: mlResponse.efficiency.value,
      voltage: mlResponse.voltage ? (mlResponse.voltage.value / 1.229) * 100 : 70,
      energy: mlResponse.efficiency.value * 0.8, // Estimate
      overall: mlResponse.efficiency.value,
    };

    // Map system performance
    const performance = {
      currentDensity: mlResponse.current_density?.value || powerOutput.maximum / 0.7,
      voltage: mlResponse.voltage?.value || 0.7,
      internalResistance: 10, // Default estimate
      chargeTransferResistance: 5, // Default estimate
      diffusionResistance: 3, // Default estimate
      capacitance: 100, // Default estimate
    };

    // Economics (estimates based on power output)
    const economics = {
      capitalCost: 500, // Default estimate
      operatingCost: 50, // Default estimate
      paybackPeriod: 5, // Default estimate
      levelizedCost: 0.15, // Default estimate
      netPresentValue: 1000, // Default estimate
      returnOnInvestment: 15, // Default estimate
    };

    // Map confidence score
    const confidence: ConfidenceScore = {
      overall: mlResponse.confidence_score,
      powerPrediction: mlResponse.power_output.confidence,
      efficiencyPrediction: mlResponse.efficiency.confidence,
      dataQuality: 0.85, // Default
      modelFit: 0.9, // Default
    };

    // Map optimizations
    const optimizations: OptimizationRecommendation[] = mlResponse.optimizations.map(
      (opt: any) => ({
        parameter: opt.parameter,
        currentValue: opt.current_value,
        recommendedValue: opt.recommended_value,
        expectedImprovement: opt.expected_improvement,
        confidence: opt.confidence,
        implementation: opt.rationale,
        costBenefit: 1.5, // Default estimate
      })
    );

    return {
      id: mlResponse.prediction_id,
      configurationId: config.id,
      powerOutput,
      efficiency,
      performance,
      economics,
      confidence,
      optimizations,
      createdAt: new Date(mlResponse.timestamp),
    };
  }

  /**
   * Check if ML service is available
   */
  async checkMLServiceHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.mlServiceUrl}/health`);
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Get available ML models
   */
  async getAvailableModels() {
    try {
      const response = await fetch(`${this.mlServiceUrl}/models`);
      if (!response.ok) {
        throw new Error('Failed to fetch models');
      }
      return response.json();
    } catch (error) {
      console.error('Error fetching models:', error);
      return [];
    }
  }
}
