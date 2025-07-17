/**
 * Unit tests for Cost Optimization Configuration
 * Tests configuration objects, model tiers, and cost estimation utilities
 */

import {
  MODEL_TIERS,
  DEFAULT_OPTIMIZATION_CONFIG,
  DEVELOPMENT_CONFIG,
  PRODUCTION_CONFIG,
  TASK_PRESETS,
  getOptimizedConfig,
  COST_ESTIMATORS,
  type ModelTier,
  type OptimizationConfig,
} from './cost-optimization-config';

describe('Cost Optimization Configuration', () => {
  describe('Model Tiers', () => {
    it('should have all required models defined', () => {
      expect(MODEL_TIERS).toHaveLength(4);

      const modelIds = MODEL_TIERS.map((m) => m.id);
      expect(modelIds).toContain('nuextract');
      expect(modelIds).toContain('phi3.5');
      expect(modelIds).toContain('llama3.1:8b');
      expect(modelIds).toContain('mistral-small3.2');
    });

    it('should have correct cost ranking order', () => {
      const sortedByRank = [...MODEL_TIERS].sort((a, b) => a.costRank - b.costRank);

      expect(sortedByRank[0].id).toBe('nuextract'); // Most cost-effective
      expect(sortedByRank[1].id).toBe('phi3.5');
      expect(sortedByRank[2].id).toBe('llama3.1:8b');
      expect(sortedByRank[3].id).toBe('mistral-small3.2'); // Least cost-effective
    });

    it('should have valid model properties', () => {
      MODEL_TIERS.forEach((model) => {
        expect(model.id).toBeTruthy();
        expect(model.name).toBeTruthy();
        expect(model.tokensPerMinute).toBeGreaterThan(0);
        expect(model.costRank).toBeGreaterThan(0);
        expect(model.specialties).toBeInstanceOf(Array);
        expect(model.specialties.length).toBeGreaterThan(0);
        expect(model.memoryUsage).toBeTruthy();
        expect(model.recommendedFor).toBeInstanceOf(Array);
        expect(model.recommendedFor.length).toBeGreaterThan(0);
      });
    });

    it('should have decreasing performance with increasing cost rank', () => {
      // Higher cost rank should generally mean lower tokens per minute
      const nuextract = MODEL_TIERS.find((m) => m.id === 'nuextract')!;
      const mistral = MODEL_TIERS.find((m) => m.id === 'mistral-small3.2')!;

      expect(nuextract.tokensPerMinute).toBeGreaterThan(mistral.tokensPerMinute);
      expect(nuextract.costRank).toBeLessThan(mistral.costRank);
    });
  });

  describe('Default Configuration', () => {
    it('should have all required configuration sections', () => {
      expect(DEFAULT_OPTIMIZATION_CONFIG.cache).toBeDefined();
      expect(DEFAULT_OPTIMIZATION_CONFIG.batching).toBeDefined();
      expect(DEFAULT_OPTIMIZATION_CONFIG.modelSelection).toBeDefined();
      expect(DEFAULT_OPTIMIZATION_CONFIG.tokenOptimization).toBeDefined();
      expect(DEFAULT_OPTIMIZATION_CONFIG.prioritization).toBeDefined();
      expect(DEFAULT_OPTIMIZATION_CONFIG.monitoring).toBeDefined();
    });

    it('should have reasonable default values', () => {
      const config = DEFAULT_OPTIMIZATION_CONFIG;

      // Cache settings
      expect(config.cache.enabled).toBe(true);
      expect(config.cache.ttl).toBe(30 * 60 * 1000); // 30 minutes
      expect(config.cache.maxSize).toBeGreaterThan(0);

      // Batching settings
      expect(config.batching.enabled).toBe(true);
      expect(config.batching.maxBatchSize).toBeGreaterThan(1);
      expect(config.batching.batchDelay).toBeGreaterThan(0);

      // Model selection
      expect(config.modelSelection.enabled).toBe(true);
      expect(config.modelSelection.taskComplexityWeights.simple).toBeLessThan(
        config.modelSelection.taskComplexityWeights.complex
      );
    });

    it('should have valid priority queue configurations', () => {
      const { prioritization } = DEFAULT_OPTIMIZATION_CONFIG;

      expect(prioritization.queueSizes.high).toBeLessThanOrEqual(prioritization.queueSizes.medium);
      expect(prioritization.queueSizes.medium).toBeLessThanOrEqual(prioritization.queueSizes.low);

      expect(prioritization.timeouts.high).toBeLessThanOrEqual(prioritization.timeouts.medium);
      expect(prioritization.timeouts.medium).toBeLessThanOrEqual(prioritization.timeouts.low);
    });
  });

  describe('Environment-Specific Configurations', () => {
    it('should have development config optimized for efficiency', () => {
      expect(DEVELOPMENT_CONFIG.cache.ttl).toBeGreaterThan(DEFAULT_OPTIMIZATION_CONFIG.cache.ttl);
      expect(DEVELOPMENT_CONFIG.cache.maxSize).toBeLessThan(
        DEFAULT_OPTIMIZATION_CONFIG.cache.maxSize
      );
      expect(DEVELOPMENT_CONFIG.batching.maxBatchSize).toBeLessThan(
        DEFAULT_OPTIMIZATION_CONFIG.batching.maxBatchSize
      );
      expect(DEVELOPMENT_CONFIG.tokenOptimization.compressionLevel).toBe('aggressive');
      expect(DEVELOPMENT_CONFIG.modelSelection.preferEfficiency).toBe(true);
    });

    it('should have production config optimized for performance', () => {
      expect(PRODUCTION_CONFIG.cache.ttl).toBeGreaterThan(DEFAULT_OPTIMIZATION_CONFIG.cache.ttl);
      expect(PRODUCTION_CONFIG.cache.maxSize).toBeGreaterThan(
        DEFAULT_OPTIMIZATION_CONFIG.cache.maxSize
      );
      expect(PRODUCTION_CONFIG.batching.maxBatchSize).toBeGreaterThan(
        DEFAULT_OPTIMIZATION_CONFIG.batching.maxBatchSize
      );
      expect(PRODUCTION_CONFIG.modelSelection.preferEfficiency).toBe(false);
    });

    it('should have production config with relaxed alert thresholds', () => {
      expect(PRODUCTION_CONFIG.monitoring.alertThresholds.highLatency).toBeGreaterThan(
        DEFAULT_OPTIMIZATION_CONFIG.monitoring.alertThresholds.highLatency
      );
      expect(PRODUCTION_CONFIG.monitoring.alertThresholds.highTokenUsage).toBeGreaterThan(
        DEFAULT_OPTIMIZATION_CONFIG.monitoring.alertThresholds.highTokenUsage
      );
    });
  });

  describe('Task Presets', () => {
    it('should have all expected task presets', () => {
      expect(TASK_PRESETS.research_extraction).toBeDefined();
      expect(TASK_PRESETS.quality_assessment).toBeDefined();
      expect(TASK_PRESETS.trend_analysis).toBeDefined();
      expect(TASK_PRESETS.search_generation).toBeDefined();
    });

    it('should have appropriate model preferences for each task', () => {
      // Research extraction should prefer extraction models
      expect(TASK_PRESETS.research_extraction.preferredModels).toContain('nuextract');

      // Quality assessment should prefer analysis models
      expect(TASK_PRESETS.quality_assessment.preferredModels).toContain('phi3.5');

      // Trend analysis should prefer reasoning models
      expect(TASK_PRESETS.trend_analysis.preferredModels).toContain('llama3.1:8b');

      // Search generation should prefer efficient models
      expect(TASK_PRESETS.search_generation.preferredModels).toContain('phi3.5');
    });

    it('should have logical batching preferences', () => {
      // Complex analysis shouldn't use batching
      expect(TASK_PRESETS.trend_analysis.allowBatching).toBe(false);

      // Simple tasks should allow batching
      expect(TASK_PRESETS.research_extraction.allowBatching).toBe(true);
      expect(TASK_PRESETS.search_generation.allowBatching).toBe(true);
    });

    it('should have appropriate cache weights', () => {
      // Search generation should have highest cache preference
      expect(TASK_PRESETS.search_generation.cacheWeight).toBeGreaterThan(
        TASK_PRESETS.research_extraction.cacheWeight
      );

      // Trend analysis should have lower cache preference for fresh results
      expect(TASK_PRESETS.trend_analysis.cacheWeight).toBeLessThan(
        TASK_PRESETS.research_extraction.cacheWeight
      );
    });
  });

  describe('getOptimizedConfig Function', () => {
    it('should return development config by default', () => {
      const config = getOptimizedConfig();

      expect(config.modelSelection.preferEfficiency).toBe(
        DEVELOPMENT_CONFIG.modelSelection.preferEfficiency
      );
      expect(config.tokenOptimization.compressionLevel).toBe(
        DEVELOPMENT_CONFIG.tokenOptimization.compressionLevel
      );
    });

    it('should return production config when specified', () => {
      const config = getOptimizedConfig('production');

      expect(config.modelSelection.preferEfficiency).toBe(
        PRODUCTION_CONFIG.modelSelection.preferEfficiency
      );
      expect(config.cache.maxSize).toBe(PRODUCTION_CONFIG.cache.maxSize);
    });

    it('should merge task-specific optimizations', () => {
      const config = getOptimizedConfig('development', 'research_extraction');

      // Should have task-specific prompt length
      expect(config.tokenOptimization.maxPromptLength).toBe(
        TASK_PRESETS.research_extraction.maxPromptLength
      );

      // Should have adjusted cache TTL based on cache weight
      const expectedTtl = Math.floor(
        DEVELOPMENT_CONFIG.cache.ttl * TASK_PRESETS.research_extraction.cacheWeight
      );
      expect(config.cache.ttl).toBe(expectedTtl);

      // Should respect batching preference
      expect(config.batching.enabled).toBe(
        DEVELOPMENT_CONFIG.batching.enabled && TASK_PRESETS.research_extraction.allowBatching
      );
    });

    it('should disable batching for tasks that do not allow it', () => {
      const config = getOptimizedConfig('production', 'trend_analysis');

      expect(config.batching.enabled).toBe(false);
    });
  });

  describe('Cost Estimators', () => {
    describe('estimateProcessingCost', () => {
      it('should calculate processing time based on model efficiency', () => {
        const tokenCount = 1000;

        const nuextractCost = COST_ESTIMATORS.estimateProcessingCost('nuextract', tokenCount);
        const llamaCost = COST_ESTIMATORS.estimateProcessingCost('llama3.1:8b', tokenCount);

        expect(nuextractCost.timeEstimate).toBeLessThan(llamaCost.timeEstimate);
        expect(nuextractCost.efficiencyScore).toBeGreaterThan(llamaCost.efficiencyScore);
      });

      it('should provide recommended alternatives for less efficient models', () => {
        const result = COST_ESTIMATORS.estimateProcessingCost('llama3.1:8b', 500);

        expect(result.recommendedAlternatives).toBeDefined();
        expect(result.recommendedAlternatives!.length).toBeGreaterThan(0);

        // Should include more efficient models with overlapping specialties
        expect(result.recommendedAlternatives).toContain('phi3.5'); // Has 'analysis' which overlaps with 'complex_analysis'
      });

      it('should handle unknown models gracefully', () => {
        const result = COST_ESTIMATORS.estimateProcessingCost('unknown-model', 100);

        expect(result.timeEstimate).toBe(0.1); // 100 / 1000
        expect(result.efficiencyScore).toBe(0.5);
        expect(result.recommendedAlternatives).toBeUndefined();
      });

      it('should calculate efficiency scores correctly', () => {
        const nuextract = COST_ESTIMATORS.estimateProcessingCost('nuextract', 100);
        const phi35 = COST_ESTIMATORS.estimateProcessingCost('phi3.5', 100);

        expect(nuextract.efficiencyScore).toBe(1.0); // 1.0 / 1 (costRank)
        expect(phi35.efficiencyScore).toBe(0.5); // 1.0 / 2 (costRank)
      });
    });

    describe('calculateSavings', () => {
      it('should calculate time savings from model optimization', () => {
        const savings = COST_ESTIMATORS.calculateSavings(
          'llama3.1:8b',
          'nuextract',
          1000,
          0, // no cache hits
          0 // no batching
        );

        expect(savings.timeSavings).toBeGreaterThan(0);
        expect(savings.efficiencyGain).toBeGreaterThan(0);
        expect(savings.totalOptimizationScore).toBeGreaterThan(0);
      });

      it('should include cache hit savings', () => {
        const withoutCache = COST_ESTIMATORS.calculateSavings('phi3.5', 'phi3.5', 1000, 0, 0);
        const withCache = COST_ESTIMATORS.calculateSavings('phi3.5', 'phi3.5', 1000, 0.5, 0);

        expect(withCache.timeSavings).toBeGreaterThan(withoutCache.timeSavings);
        expect(withCache.totalOptimizationScore).toBeGreaterThan(
          withoutCache.totalOptimizationScore
        );
      });

      it('should include batching savings', () => {
        const withoutBatching = COST_ESTIMATORS.calculateSavings('phi3.5', 'phi3.5', 1000, 0, 0);
        const withBatching = COST_ESTIMATORS.calculateSavings('phi3.5', 'phi3.5', 1000, 0, 0.8);

        expect(withBatching.timeSavings).toBeGreaterThan(withoutBatching.timeSavings);
        expect(withBatching.totalOptimizationScore).toBeGreaterThan(
          withoutBatching.totalOptimizationScore
        );
      });

      it('should cap optimization score at 100', () => {
        const savings = COST_ESTIMATORS.calculateSavings(
          'mistral-small3.2',
          'nuextract',
          10000,
          1.0, // 100% cache hits
          1.0 // 100% batching
        );

        expect(savings.totalOptimizationScore).toBeLessThanOrEqual(100);
      });

      it('should ensure non-negative savings', () => {
        // Test with same model (no improvement)
        const savings = COST_ESTIMATORS.calculateSavings('nuextract', 'nuextract', 100, 0, 0);

        expect(savings.timeSavings).toBeGreaterThanOrEqual(0);
        expect(savings.efficiencyGain).toBeGreaterThanOrEqual(0);
        expect(savings.totalOptimizationScore).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('Configuration Validation', () => {
    it('should have consistent priority levels across all configs', () => {
      const configs = [DEFAULT_OPTIMIZATION_CONFIG, DEVELOPMENT_CONFIG, PRODUCTION_CONFIG];

      configs.forEach((config) => {
        expect(config.prioritization.queueSizes).toHaveProperty('high');
        expect(config.prioritization.queueSizes).toHaveProperty('medium');
        expect(config.prioritization.queueSizes).toHaveProperty('low');

        expect(config.prioritization.timeouts).toHaveProperty('high');
        expect(config.prioritization.timeouts).toHaveProperty('medium');
        expect(config.prioritization.timeouts).toHaveProperty('low');
      });
    });

    it('should have valid compression levels', () => {
      const validLevels = ['none', 'light', 'aggressive'];

      expect(validLevels).toContain(DEFAULT_OPTIMIZATION_CONFIG.tokenOptimization.compressionLevel);
      expect(validLevels).toContain(DEVELOPMENT_CONFIG.tokenOptimization.compressionLevel);
      expect(validLevels).toContain(PRODUCTION_CONFIG.tokenOptimization.compressionLevel);
    });

    it('should have positive numeric values for all thresholds', () => {
      const configs = [DEFAULT_OPTIMIZATION_CONFIG, DEVELOPMENT_CONFIG, PRODUCTION_CONFIG];

      configs.forEach((config) => {
        expect(config.cache.ttl).toBeGreaterThan(0);
        expect(config.cache.maxSize).toBeGreaterThan(0);
        expect(config.batching.maxBatchSize).toBeGreaterThan(0);
        expect(config.batching.batchDelay).toBeGreaterThan(0);
        expect(config.monitoring.metricsRetention).toBeGreaterThan(0);
        expect(config.monitoring.alertThresholds.highLatency).toBeGreaterThan(0);
        expect(config.monitoring.alertThresholds.lowCacheHitRate).toBeGreaterThan(0);
        expect(config.monitoring.alertThresholds.lowCacheHitRate).toBeLessThanOrEqual(1);
      });
    });
  });
});
