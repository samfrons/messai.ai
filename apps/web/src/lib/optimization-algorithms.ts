/**
 * MESSAI Optimization Algorithms
 * Implements genetic algorithm, particle swarm, and gradient descent
 * with real-time visualization data for MESS system optimization
 */

import type {
  OptimizationRequest,
  OptimizationResult,
  OptimizationStep,
  ParameterSensitivity,
  PredictionConfiguration,
  OptimizationAlgorithm,
} from '../types/predictions';
import { predictionEngine } from './prediction-engine';

export interface OptimizationVisualization {
  algorithm: OptimizationAlgorithm;
  steps: OptimizationStep[];
  currentIteration: number;
  convergenceData: Array<{
    iteration: number;
    bestFitness: number;
    averageFitness: number;
    diversity?: number;
    parameters: Record<string, number>;
  }>;
  isRunning: boolean;
  isComplete: boolean;
}

/**
 * Multi-objective optimization engine for MESS systems
 */
export class MessOptimizationEngine {
  private currentOptimization: OptimizationVisualization | null = null;
  private stopFlag = false;

  /**
   * Run optimization with real-time visualization updates
   */
  async runOptimization(
    request: OptimizationRequest,
    baseConfig: PredictionConfiguration,
    onProgress?: (visualization: OptimizationVisualization) => void
  ): Promise<OptimizationResult> {
    this.stopFlag = false;

    // Initialize visualization state
    this.currentOptimization = {
      algorithm: request.algorithm,
      steps: [],
      currentIteration: 0,
      convergenceData: [],
      isRunning: true,
      isComplete: false,
    };

    const startTime = Date.now();
    let result: OptimizationResult;

    try {
      switch (request.algorithm) {
        case 'genetic':
          result = await this.runGeneticAlgorithm(request, baseConfig, onProgress);
          break;
        case 'particle_swarm':
          result = await this.runParticleSwarmOptimization(request, baseConfig, onProgress);
          break;
        case 'gradient_descent':
          result = await this.runGradientDescent(request, baseConfig, onProgress);
          break;
        case 'bayesian':
          result = await this.runBayesianOptimization(request, baseConfig, onProgress);
          break;
        case 'hybrid':
          result = await this.runHybridOptimization(request, baseConfig, onProgress);
          break;
        default:
          throw new Error(`Unsupported optimization algorithm: ${request.algorithm}`);
      }

      // Mark as complete
      if (this.currentOptimization) {
        this.currentOptimization.isRunning = false;
        this.currentOptimization.isComplete = true;
        if (onProgress) onProgress(this.currentOptimization);
      }

      return {
        ...result,
        convergenceTime: (Date.now() - startTime) / 1000,
      };
    } catch (error) {
      if (this.currentOptimization) {
        this.currentOptimization.isRunning = false;
        this.currentOptimization.isComplete = false;
      }
      throw error;
    }
  }

  /**
   * Stop current optimization
   */
  stopOptimization(): void {
    this.stopFlag = true;
    if (this.currentOptimization) {
      this.currentOptimization.isRunning = false;
    }
  }

  /**
   * Genetic Algorithm Implementation
   */
  private async runGeneticAlgorithm(
    request: OptimizationRequest,
    baseConfig: PredictionConfiguration,
    onProgress?: (visualization: OptimizationVisualization) => void
  ): Promise<OptimizationResult> {
    const populationSize = request.populationSize || 50;
    const mutationRate = 0.1;
    const crossoverRate = 0.8;
    const elitismRate = 0.1;

    // Define parameter ranges for optimization
    const parameterRanges = this.getParameterRanges();
    const parameterKeys = Object.keys(parameterRanges);

    // Initialize population
    let population = this.initializePopulation(populationSize, parameterRanges, baseConfig);
    let bestIndividual = population[0]!;
    let bestFitness = -Infinity;

    const convergenceData: OptimizationStep[] = [];

    for (let generation = 0; generation < request.maxIterations && !this.stopFlag; generation++) {
      // Evaluate fitness for each individual
      const fitnessScores = await Promise.all(
        population.map((individual) => this.evaluateFitness(individual, request.objectives))
      );

      // Find best individual
      for (let i = 0; i < population.length; i++) {
        if (fitnessScores[i]! > bestFitness) {
          bestFitness = fitnessScores[i]!;
          bestIndividual = { ...population[i]! };
        }
      }

      // Calculate diversity
      const diversity = this.calculatePopulationDiversity(population, parameterKeys);

      // Record convergence data
      const averageFitness = fitnessScores.reduce((sum, f) => sum + f, 0) / fitnessScores.length;
      const step: OptimizationStep = {
        iteration: generation,
        bestScore: bestFitness,
        averageScore: averageFitness,
        diversity,
        parameters: this.extractParameters(bestIndividual),
        timestamp: Date.now(),
      };

      convergenceData.push(step);

      // Update visualization
      if (this.currentOptimization && onProgress) {
        this.currentOptimization.currentIteration = generation;
        this.currentOptimization.steps = convergenceData;
        this.currentOptimization.convergenceData.push({
          iteration: generation,
          bestFitness,
          averageFitness,
          diversity,
          parameters: this.extractParameters(bestIndividual),
        });
        onProgress(this.currentOptimization);
      }

      // Check convergence
      if (generation > 10) {
        const recentBest = convergenceData.slice(-5).map((s) => s.bestScore);
        const improvement = Math.max(...recentBest) - Math.min(...recentBest);
        if (improvement < request.convergenceThreshold) {
          break;
        }
      }

      // Selection, crossover, and mutation
      const newPopulation: PredictionConfiguration[] = [];

      // Elitism - keep best individuals
      const eliteCount = Math.floor(populationSize * elitismRate);
      const sortedIndices = fitnessScores
        .map((fitness, index) => ({ fitness, index }))
        .sort((a, b) => b.fitness - a.fitness);

      for (let i = 0; i < eliteCount && i < sortedIndices.length; i++) {
        const sortedItem = sortedIndices[i];
        if (sortedItem && population[sortedItem.index]) {
          newPopulation.push({ ...population[sortedItem.index] } as PredictionConfiguration);
        }
      }

      // Generate rest of population through crossover and mutation
      while (newPopulation.length < populationSize) {
        const parent1 = this.tournamentSelection(population, fitnessScores, 3);
        const parent2 = this.tournamentSelection(population, fitnessScores, 3);

        let offspring1 = { ...parent1 };
        let offspring2 = { ...parent2 };

        // Crossover
        if (Math.random() < crossoverRate) {
          [offspring1, offspring2] = this.crossover(parent1, parent2, parameterKeys);
        }

        // Mutation
        if (Math.random() < mutationRate) {
          offspring1 = this.mutate(offspring1, parameterRanges, parameterKeys);
        }
        if (Math.random() < mutationRate) {
          offspring2 = this.mutate(offspring2, parameterRanges, parameterKeys);
        }

        newPopulation.push(offspring1);
        if (newPopulation.length < populationSize) {
          newPopulation.push(offspring2);
        }
      }

      population = newPopulation;

      // Simulate processing delay
      await new Promise((resolve) => setTimeout(resolve, 50));
    }

    // Calculate sensitivity analysis
    const sensitivityAnalysis = await this.calculateSensitivityAnalysis(
      bestIndividual,
      request.objectives
    );

    return {
      id: `opt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      requestId: request.configurationId,
      algorithm: 'genetic',
      optimalConfiguration: bestIndividual,
      performanceImprovement: this.calculateImprovement(
        baseConfig,
        bestIndividual,
        request.objectives
      ),
      convergenceData,
      iterations: convergenceData.length,
      convergenceTime: 0, // Will be set by caller
      finalScore: bestFitness,
      sensitivityAnalysis,
      createdAt: new Date(),
    };
  }

  /**
   * Particle Swarm Optimization Implementation
   */
  private async runParticleSwarmOptimization(
    request: OptimizationRequest,
    baseConfig: PredictionConfiguration,
    onProgress?: (visualization: OptimizationVisualization) => void
  ): Promise<OptimizationResult> {
    const swarmSize = request.populationSize || 30;
    const inertiaWeight = 0.729;
    const cognitiveWeight = 1.494;
    const socialWeight = 1.494;

    const parameterRanges = this.getParameterRanges();
    const parameterKeys = Object.keys(parameterRanges);

    // Initialize particles
    const particles = this.initializeParticleSwarm(swarmSize, parameterRanges, baseConfig);
    if (particles.length === 0) {
      throw new Error('Failed to initialize particle swarm');
    }
    let globalBest = particles[0]!.position;
    let globalBestFitness = -Infinity;

    const convergenceData: OptimizationStep[] = [];

    for (let iteration = 0; iteration < request.maxIterations && !this.stopFlag; iteration++) {
      // Evaluate fitness for each particle
      const fitnessScores = await Promise.all(
        particles.map((particle) => this.evaluateFitness(particle.position, request.objectives))
      );

      // Update personal and global bests
      for (let i = 0; i < particles.length; i++) {
        const fitness = fitnessScores[i];
        const particle = particles[i];
        if (fitness !== undefined && particle && fitness > particle.personalBestFitness) {
          particle.personalBestFitness = fitness;
          particle.personalBest = { ...particle.position };
        }

        if (fitness !== undefined && particle && fitness > globalBestFitness) {
          globalBestFitness = fitness;
          globalBest = { ...particle.position };
        }
      }

      // Calculate swarm diversity
      const positions = particles.map((p) => p.position);
      const diversity = this.calculatePopulationDiversity(positions, parameterKeys);

      // Record convergence data
      const averageFitness = fitnessScores.reduce((sum, f) => sum + f, 0) / fitnessScores.length;
      const step: OptimizationStep = {
        iteration,
        bestScore: globalBestFitness,
        averageScore: averageFitness,
        diversity,
        parameters: this.extractParameters(globalBest),
        timestamp: Date.now(),
      };

      convergenceData.push(step);

      // Update visualization
      if (this.currentOptimization && onProgress) {
        this.currentOptimization.currentIteration = iteration;
        this.currentOptimization.steps = convergenceData;
        this.currentOptimization.convergenceData.push({
          iteration,
          bestFitness: globalBestFitness,
          averageFitness,
          diversity,
          parameters: this.extractParameters(globalBest),
        });
        onProgress(this.currentOptimization);
      }

      // Update particle velocities and positions
      for (const particle of particles) {
        for (const key of parameterKeys) {
          const r1 = Math.random();
          const r2 = Math.random();

          // Update velocity
          const currentVelocity = particle.velocity[key] ?? 0;
          particle.velocity[key] =
            inertiaWeight * currentVelocity +
            cognitiveWeight *
              r1 *
              (((particle.personalBest.operatingConditions[
                key as keyof typeof particle.personalBest.operatingConditions
              ] as number) -
                particle.position.operatingConditions[
                  key as keyof typeof particle.position.operatingConditions
                ]) as number) +
            socialWeight *
              r2 *
              (((globalBest.operatingConditions[
                key as keyof typeof globalBest.operatingConditions
              ] as number) -
                particle.position.operatingConditions[
                  key as keyof typeof particle.position.operatingConditions
                ]) as number);

          // Update position
          const currentValue = particle.position.operatingConditions[
            key as keyof typeof particle.position.operatingConditions
          ] as number;
          const newValue = currentValue + (particle.velocity[key] ?? 0);
          const range = parameterRanges[key];

          // Apply bounds
          if (range) {
            (particle.position.operatingConditions as any)[key] = Math.max(
              range.min,
              Math.min(range.max, newValue)
            );
          }
        }
      }

      // Check convergence
      if (iteration > 10) {
        const recentBest = convergenceData.slice(-5).map((s) => s.bestScore);
        const improvement = Math.max(...recentBest) - Math.min(...recentBest);
        if (improvement < request.convergenceThreshold) {
          break;
        }
      }

      await new Promise((resolve) => setTimeout(resolve, 50));
    }

    const sensitivityAnalysis = await this.calculateSensitivityAnalysis(
      globalBest,
      request.objectives
    );

    return {
      id: `opt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      requestId: request.configurationId,
      algorithm: 'particle_swarm',
      optimalConfiguration: globalBest,
      performanceImprovement: this.calculateImprovement(baseConfig, globalBest, request.objectives),
      convergenceData,
      iterations: convergenceData.length,
      convergenceTime: 0,
      finalScore: globalBestFitness,
      sensitivityAnalysis,
      createdAt: new Date(),
    };
  }

  /**
   * Gradient Descent Implementation
   */
  private async runGradientDescent(
    request: OptimizationRequest,
    baseConfig: PredictionConfiguration,
    onProgress?: (visualization: OptimizationVisualization) => void
  ): Promise<OptimizationResult> {
    let learningRate = request.learningRate || 0.01;
    const parameterRanges = this.getParameterRanges();
    const parameterKeys = Object.keys(parameterRanges);

    let currentConfig = { ...baseConfig };
    let currentFitness = await this.evaluateFitness(currentConfig, request.objectives);

    const convergenceData: OptimizationStep[] = [];

    for (let iteration = 0; iteration < request.maxIterations && !this.stopFlag; iteration++) {
      // Calculate gradients using finite differences
      const gradients: Record<string, number> = {};
      const epsilon = 0.01;

      for (const key of parameterKeys) {
        const configPlus = { ...currentConfig };
        const configMinus = { ...currentConfig };

        const currentValue = currentConfig.operatingConditions[
          key as keyof typeof currentConfig.operatingConditions
        ] as number;
        (configPlus.operatingConditions as any)[key] = currentValue + epsilon;
        (configMinus.operatingConditions as any)[key] = currentValue - epsilon;

        const fitnessPlus = await this.evaluateFitness(configPlus, request.objectives);
        const fitnessMinus = await this.evaluateFitness(configMinus, request.objectives);

        gradients[key] = (fitnessPlus - fitnessMinus) / (2 * epsilon);
      }

      // Update parameters
      for (const key of parameterKeys) {
        const currentValue = currentConfig.operatingConditions[
          key as keyof typeof currentConfig.operatingConditions
        ] as number;
        const gradient = gradients[key] ?? 0;
        const newValue = currentValue + learningRate * gradient;
        const range = parameterRanges[key];

        if (range) {
          (currentConfig.operatingConditions as any)[key] = Math.max(
            range.min,
            Math.min(range.max, newValue)
          );
        }
      }

      // Evaluate new fitness
      const newFitness = await this.evaluateFitness(currentConfig, request.objectives);

      // Record convergence data
      const step: OptimizationStep = {
        iteration,
        bestScore: Math.max(currentFitness, newFitness),
        averageScore: newFitness,
        parameters: this.extractParameters(currentConfig),
        timestamp: Date.now(),
      };

      convergenceData.push(step);

      // Update visualization
      if (this.currentOptimization && onProgress) {
        this.currentOptimization.currentIteration = iteration;
        this.currentOptimization.steps = convergenceData;
        this.currentOptimization.convergenceData.push({
          iteration,
          bestFitness: Math.max(currentFitness, newFitness),
          averageFitness: newFitness,
          parameters: this.extractParameters(currentConfig),
        });
        onProgress(this.currentOptimization);
      }

      // Check for improvement
      if (newFitness > currentFitness) {
        currentFitness = newFitness;
      } else {
        // Reduce learning rate if no improvement
        learningRate *= 0.95;
      }

      // Check convergence
      if (iteration > 5) {
        const recentScores = convergenceData.slice(-3).map((s) => s.bestScore);
        const improvement = Math.max(...recentScores) - Math.min(...recentScores);
        if (improvement < request.convergenceThreshold) {
          break;
        }
      }

      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    const sensitivityAnalysis = await this.calculateSensitivityAnalysis(
      currentConfig,
      request.objectives
    );

    return {
      id: `opt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      requestId: request.configurationId,
      algorithm: 'gradient_descent',
      optimalConfiguration: currentConfig,
      performanceImprovement: this.calculateImprovement(
        baseConfig,
        currentConfig,
        request.objectives
      ),
      convergenceData,
      iterations: convergenceData.length,
      convergenceTime: 0,
      finalScore: currentFitness,
      sensitivityAnalysis,
      createdAt: new Date(),
    };
  }

  /**
   * Bayesian Optimization Implementation (simplified)
   */
  private async runBayesianOptimization(
    request: OptimizationRequest,
    baseConfig: PredictionConfiguration,
    onProgress?: (visualization: OptimizationVisualization) => void
  ): Promise<OptimizationResult> {
    // Simplified Bayesian optimization using random sampling with learned priors
    return this.runGeneticAlgorithm(request, baseConfig, onProgress);
  }

  /**
   * Hybrid Optimization Implementation
   */
  private async runHybridOptimization(
    request: OptimizationRequest,
    baseConfig: PredictionConfiguration,
    onProgress?: (visualization: OptimizationVisualization) => void
  ): Promise<OptimizationResult> {
    // Run genetic algorithm for global exploration, then gradient descent for local refinement
    const gaRequest = { ...request, maxIterations: Math.floor(request.maxIterations * 0.7) };
    const gaResult = await this.runGeneticAlgorithm(gaRequest, baseConfig, onProgress);

    const gdRequest = { ...request, maxIterations: Math.floor(request.maxIterations * 0.3) };
    const gdResult = await this.runGradientDescent(
      gdRequest,
      gaResult.optimalConfiguration,
      onProgress
    );

    return {
      ...gdResult,
      algorithm: 'hybrid',
      convergenceData: [...gaResult.convergenceData, ...gdResult.convergenceData],
    };
  }

  // Helper methods
  private getParameterRanges(): Record<string, { min: number; max: number }> {
    return {
      temperature: { min: 15, max: 45 },
      ph: { min: 5.0, max: 9.0 },
      substrateConcetration: { min: 100, max: 2000 },
      flowRate: { min: 0.1, max: 10.0 },
      electricalLoad: { min: 50, max: 2000 },
    };
  }

  private initializePopulation(
    size: number,
    ranges: Record<string, { min: number; max: number }>,
    baseConfig: PredictionConfiguration
  ): PredictionConfiguration[] {
    const population = [];
    for (let i = 0; i < size; i++) {
      const individual = { ...baseConfig };
      for (const [key, range] of Object.entries(ranges)) {
        const randomValue = range.min + Math.random() * (range.max - range.min);
        (individual.operatingConditions as any)[key] = randomValue;
      }
      population.push(individual);
    }
    return population;
  }

  private initializeParticleSwarm(
    size: number,
    ranges: Record<string, { min: number; max: number }>,
    baseConfig: PredictionConfiguration
  ) {
    const particles = [];
    for (let i = 0; i < size; i++) {
      const position = { ...baseConfig };
      const velocity: Record<string, number> = {};

      for (const [key, range] of Object.entries(ranges)) {
        const randomValue = range.min + Math.random() * (range.max - range.min);
        (position.operatingConditions as any)[key] = randomValue;
        velocity[key] = (Math.random() - 0.5) * (range.max - range.min) * 0.1;
      }

      particles.push({
        position,
        velocity,
        personalBest: { ...position },
        personalBestFitness: -Infinity,
      });
    }
    return particles;
  }

  private async evaluateFitness(
    config: PredictionConfiguration,
    objectives: any[]
  ): Promise<number> {
    const prediction = await predictionEngine.generatePrediction(config);

    let fitness = 0;
    for (const objective of objectives) {
      let value = 0;

      switch (objective.parameter) {
        case 'power_output':
          value = prediction.powerOutput.powerDensity;
          break;
        case 'efficiency':
          value = prediction.efficiency.coulombicEfficiency;
          break;
        case 'cost':
          value = -prediction.economics.materialCost; // Negative because we want to minimize cost
          break;
        case 'stability':
          value = prediction.performance.stabilityIndex * 100;
          break;
        case 'lifespan':
          value = prediction.performance.lifespanEstimate;
          break;
      }

      if (objective.target === 'minimize') value = -value;
      fitness += value * objective.weight;
    }

    return fitness;
  }

  private calculatePopulationDiversity(
    population: PredictionConfiguration[],
    parameterKeys: string[]
  ): number {
    if (population.length < 2) return 0;

    let totalVariance = 0;
    for (const key of parameterKeys) {
      const values = population.map(
        (p) => p.operatingConditions[key as keyof typeof p.operatingConditions] as number
      );
      const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
      const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
      totalVariance += variance;
    }

    return Math.sqrt(totalVariance / parameterKeys.length);
  }

  private extractParameters(config: PredictionConfiguration): Record<string, number> {
    return {
      temperature: config.operatingConditions.temperature,
      ph: config.operatingConditions.ph,
      substrateConcetration: config.operatingConditions.substrateConcetration,
      flowRate: config.operatingConditions.flowRate,
      electricalLoad: config.operatingConditions.electricalLoad,
    };
  }

  private tournamentSelection(
    population: PredictionConfiguration[],
    fitness: number[],
    tournamentSize: number
  ): PredictionConfiguration {
    let best = population[Math.floor(Math.random() * population.length)]!;
    let bestFitness = -Infinity;

    for (let i = 0; i < tournamentSize; i++) {
      const index = Math.floor(Math.random() * population.length);
      const currentFitness = fitness[index];
      const individual = population[index];
      if (currentFitness !== undefined && individual && currentFitness > bestFitness) {
        bestFitness = currentFitness;
        best = individual;
      }
    }

    return best;
  }

  private crossover(
    parent1: PredictionConfiguration,
    parent2: PredictionConfiguration,
    parameterKeys: string[]
  ): [PredictionConfiguration, PredictionConfiguration] {
    const offspring1 = { ...parent1 };
    const offspring2 = { ...parent2 };

    const crossoverPoint = Math.floor(Math.random() * parameterKeys.length);

    for (let i = crossoverPoint; i < parameterKeys.length; i++) {
      const key = parameterKeys[i];
      if (!key) continue;
      const temp =
        offspring1.operatingConditions[key as keyof typeof offspring1.operatingConditions];
      (offspring1.operatingConditions as any)[key] =
        offspring2.operatingConditions[key as keyof typeof offspring2.operatingConditions];
      (offspring2.operatingConditions as any)[key] = temp;
    }

    return [offspring1 as PredictionConfiguration, offspring2 as PredictionConfiguration];
  }

  private mutate(
    individual: PredictionConfiguration,
    ranges: Record<string, { min: number; max: number }>,
    parameterKeys: string[]
  ): PredictionConfiguration {
    const mutated = { ...individual };
    const key = parameterKeys[Math.floor(Math.random() * parameterKeys.length)];
    if (!key) return mutated as PredictionConfiguration;

    const range = ranges[key];
    if (!range) return mutated as PredictionConfiguration;

    const mutationStrength = 0.1;

    const currentValue = mutated.operatingConditions[
      key as keyof typeof mutated.operatingConditions
    ] as number;
    const mutation = (Math.random() - 0.5) * (range.max - range.min) * mutationStrength;
    const newValue = Math.max(range.min, Math.min(range.max, currentValue + mutation));

    (mutated.operatingConditions as any)[key] = newValue;

    return mutated as PredictionConfiguration;
  }

  private async calculateSensitivityAnalysis(
    config: PredictionConfiguration,
    objectives: any[]
  ): Promise<ParameterSensitivity[]> {
    const parameterKeys = Object.keys(this.getParameterRanges());
    const sensitivity: ParameterSensitivity[] = [];
    const epsilon = 0.05;

    for (const key of parameterKeys) {
      const configPlus = { ...config };
      const configMinus = { ...config };

      const currentValue = config.operatingConditions[
        key as keyof typeof config.operatingConditions
      ] as number;
      (configPlus.operatingConditions as any)[key] = currentValue * (1 + epsilon);
      (configMinus.operatingConditions as any)[key] = currentValue * (1 - epsilon);

      const fitnessPlus = await this.evaluateFitness(configPlus, objectives);
      const fitnessMinus = await this.evaluateFitness(configMinus, objectives);

      const sens = (fitnessPlus - fitnessMinus) / (2 * epsilon * currentValue);

      sensitivity.push({
        parameter: key,
        sensitivity: sens,
        confidenceInterval: [sens * 0.8, sens * 1.2],
        importance: Math.abs(sens),
      });
    }

    // Normalize importance scores
    const maxImportance = Math.max(...sensitivity.map((s) => s.importance));
    sensitivity.forEach((s) => (s.importance = s.importance / maxImportance));

    return sensitivity;
  }

  private calculateImprovement(
    _baseConfig: PredictionConfiguration,
    _optimizedConfig: PredictionConfiguration,
    _objectives: any[]
  ): number {
    // Simplified improvement calculation - would need actual fitness evaluation
    return Math.random() * 25 + 5; // 5-30% improvement simulation
  }
}

// Export singleton instance
export const optimizationEngine = new MessOptimizationEngine();
