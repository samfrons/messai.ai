/**
 * Cost Optimization Configuration
 * Centralized configuration for cost-effective Ollama usage
 */

export interface ModelTier {
  id: string;
  name: string;
  tokensPerMinute: number;
  specialties: string[];
  costRank: number; // 1 = most cost-effective, higher = more expensive
  memoryUsage: string;
  recommendedFor: string[];
}

export interface OptimizationConfig {
  // Caching configuration
  cache: {
    enabled: boolean;
    ttl: number; // milliseconds
    maxSize: number;
    compression: boolean;
  };

  // Batching configuration
  batching: {
    enabled: boolean;
    maxBatchSize: number;
    batchDelay: number; // milliseconds
    maxWaitTime: number; // milliseconds
    similarityThreshold: number; // 0-1, for grouping similar requests
  };

  // Model selection optimization
  modelSelection: {
    enabled: boolean;
    preferEfficiency: boolean;
    allowDowngrades: boolean;
    loadThreshold: number; // 0-1, system load threshold for model downgrade
    taskComplexityWeights: {
      simple: number;
      medium: number;
      complex: number;
    };
  };

  // Token optimization
  tokenOptimization: {
    enabled: boolean;
    maxPromptLength: number;
    enableTruncation: boolean;
    compressionLevel: 'none' | 'light' | 'aggressive';
  };

  // Request prioritization
  prioritization: {
    enabled: boolean;
    queueSizes: {
      high: number;
      medium: number;
      low: number;
    };
    timeouts: {
      high: number; // milliseconds
      medium: number;
      low: number;
    };
  };

  // Performance monitoring
  monitoring: {
    enabled: boolean;
    metricsRetention: number; // milliseconds
    alertThresholds: {
      highLatency: number; // milliseconds
      lowCacheHitRate: number; // 0-1
      highTokenUsage: number; // tokens per hour
    };
  };
}

export const MODEL_TIERS: ModelTier[] = [
  {
    id: 'nuextract',
    name: 'NuExtract',
    tokensPerMinute: 2000,
    specialties: ['extraction', 'parsing', 'structured_data'],
    costRank: 1,
    memoryUsage: '2.2GB',
    recommendedFor: ['simple_extraction', 'data_parsing', 'metadata_extraction'],
  },
  {
    id: 'phi3.5',
    name: 'Phi-3.5',
    tokensPerMinute: 1800,
    specialties: ['analysis', 'insights', 'summarization'],
    costRank: 2,
    memoryUsage: '2.2GB',
    recommendedFor: ['analysis', 'insights', 'quality_assessment', 'summarization'],
  },
  {
    id: 'llama3.1:8b',
    name: 'Llama 3.1 8B',
    tokensPerMinute: 1200,
    specialties: ['reasoning', 'validation', 'analysis'],
    costRank: 3,
    memoryUsage: '4.9GB',
    recommendedFor: ['complex_reasoning', 'validation', 'detailed_analysis'],
  },
  {
    id: 'mistral-small3.2',
    name: 'Mistral Small 3.2',
    tokensPerMinute: 800,
    specialties: ['general', 'fallback'],
    costRank: 4,
    memoryUsage: '15GB',
    recommendedFor: ['fallback', 'general_purpose'],
  },
];

export const DEFAULT_OPTIMIZATION_CONFIG: OptimizationConfig = {
  cache: {
    enabled: true,
    ttl: 30 * 60 * 1000, // 30 minutes
    maxSize: 1000,
    compression: true,
  },

  batching: {
    enabled: true,
    maxBatchSize: 5,
    batchDelay: 2000, // 2 seconds
    maxWaitTime: 10000, // 10 seconds max wait
    similarityThreshold: 0.8,
  },

  modelSelection: {
    enabled: true,
    preferEfficiency: true,
    allowDowngrades: true,
    loadThreshold: 0.8,
    taskComplexityWeights: {
      simple: 0.3, // Prefer very efficient models
      medium: 0.6, // Balance efficiency and capability
      complex: 0.9, // Prefer capable models
    },
  },

  tokenOptimization: {
    enabled: true,
    maxPromptLength: 4000, // characters
    enableTruncation: true,
    compressionLevel: 'light',
  },

  prioritization: {
    enabled: true,
    queueSizes: {
      high: 10,
      medium: 20,
      low: 50,
    },
    timeouts: {
      high: 5000, // 5 seconds
      medium: 15000, // 15 seconds
      low: 60000, // 1 minute
    },
  },

  monitoring: {
    enabled: true,
    metricsRetention: 24 * 60 * 60 * 1000, // 24 hours
    alertThresholds: {
      highLatency: 10000, // 10 seconds
      lowCacheHitRate: 0.2, // 20%
      highTokenUsage: 100000, // 100k tokens per hour
    },
  },
};

/**
 * Development-optimized configuration for cost-effective local development
 */
export const DEVELOPMENT_CONFIG: OptimizationConfig = {
  ...DEFAULT_OPTIMIZATION_CONFIG,

  cache: {
    ...DEFAULT_OPTIMIZATION_CONFIG.cache,
    ttl: 60 * 60 * 1000, // 1 hour for development
    maxSize: 500, // Smaller cache for development
  },

  batching: {
    ...DEFAULT_OPTIMIZATION_CONFIG.batching,
    maxBatchSize: 3, // Smaller batches
    batchDelay: 1000, // Faster batching
  },

  modelSelection: {
    ...DEFAULT_OPTIMIZATION_CONFIG.modelSelection,
    preferEfficiency: true, // Strongly prefer efficient models
    taskComplexityWeights: {
      simple: 0.2, // Aggressively use efficient models
      medium: 0.4, // Still prefer efficiency
      complex: 0.7, // Use capable models only when needed
    },
  },

  tokenOptimization: {
    ...DEFAULT_OPTIMIZATION_CONFIG.tokenOptimization,
    maxPromptLength: 2000, // Shorter prompts for development
    compressionLevel: 'aggressive' as const,
  },
};

/**
 * Production-optimized configuration balancing cost and performance
 */
export const PRODUCTION_CONFIG: OptimizationConfig = {
  ...DEFAULT_OPTIMIZATION_CONFIG,

  cache: {
    ...DEFAULT_OPTIMIZATION_CONFIG.cache,
    ttl: 2 * 60 * 60 * 1000, // 2 hours
    maxSize: 2000, // Larger cache for production
    compression: true,
  },

  batching: {
    ...DEFAULT_OPTIMIZATION_CONFIG.batching,
    maxBatchSize: 8, // Larger batches for efficiency
    batchDelay: 3000, // Longer delay for better batching
    maxWaitTime: 15000,
  },

  modelSelection: {
    ...DEFAULT_OPTIMIZATION_CONFIG.modelSelection,
    preferEfficiency: false, // Balance efficiency and quality
    taskComplexityWeights: {
      simple: 0.4, // Still use efficient models but allow upgrades
      medium: 0.7, // Balanced approach
      complex: 1.0, // Use best models for complex tasks
    },
  },

  monitoring: {
    ...DEFAULT_OPTIMIZATION_CONFIG.monitoring,
    alertThresholds: {
      highLatency: 15000, // 15 seconds
      lowCacheHitRate: 0.3, // 30%
      highTokenUsage: 500000, // 500k tokens per hour
    },
  },
};

/**
 * Task-specific optimization presets
 */
export const TASK_PRESETS = {
  research_extraction: {
    preferredModels: ['nuextract', 'phi3.5'],
    allowBatching: true,
    cacheWeight: 1.5, // Higher cache preference
    maxPromptLength: 3000,
  },

  quality_assessment: {
    preferredModels: ['phi3.5', 'llama3.1:8b'],
    allowBatching: true,
    cacheWeight: 1.2,
    maxPromptLength: 4000,
  },

  trend_analysis: {
    preferredModels: ['llama3.1:8b', 'phi3.5'],
    allowBatching: false, // Complex analysis, no batching
    cacheWeight: 0.8, // Lower cache preference for fresh analysis
    maxPromptLength: 6000,
  },

  search_generation: {
    preferredModels: ['phi3.5', 'nuextract'],
    allowBatching: true,
    cacheWeight: 2.0, // Very high cache preference
    maxPromptLength: 1500,
  },
};

/**
 * Get optimized configuration based on environment and task type
 */
export function getOptimizedConfig(
  environment: 'development' | 'production' = 'development',
  taskType?: keyof typeof TASK_PRESETS
): OptimizationConfig {
  const baseConfig = environment === 'production' ? PRODUCTION_CONFIG : DEVELOPMENT_CONFIG;

  if (!taskType) {
    return baseConfig;
  }

  const taskPreset = TASK_PRESETS[taskType];

  // Merge task-specific optimizations
  return {
    ...baseConfig,

    // Adjust batching based on task preferences
    batching: {
      ...baseConfig.batching,
      enabled: baseConfig.batching.enabled && taskPreset.allowBatching,
    },

    // Adjust caching based on task preferences
    cache: {
      ...baseConfig.cache,
      ttl: Math.floor(baseConfig.cache.ttl * taskPreset.cacheWeight),
    },

    // Adjust token optimization
    tokenOptimization: {
      ...baseConfig.tokenOptimization,
      maxPromptLength: taskPreset.maxPromptLength,
    },
  };
}

/**
 * Cost estimation utilities
 */
export const COST_ESTIMATORS = {
  /**
   * Estimate processing cost based on model and token count
   */
  estimateProcessingCost(
    modelId: string,
    tokenCount: number
  ): {
    timeEstimate: number; // seconds
    efficiencyScore: number; // 0-1
    recommendedAlternatives?: string[];
  } {
    const model = MODEL_TIERS.find((m) => m.id === modelId);
    if (!model) {
      return { timeEstimate: tokenCount / 1000, efficiencyScore: 0.5 };
    }

    const timeEstimate = (tokenCount / model.tokensPerMinute) * 60;
    const efficiencyScore = 1.0 / model.costRank;

    // Find more efficient alternatives for the same task
    const recommendedAlternatives = MODEL_TIERS.filter(
      (m) => m.costRank < model.costRank && m.specialties.some((s) => model.specialties.includes(s))
    ).map((m) => m.id);

    return {
      timeEstimate,
      efficiencyScore,
      recommendedAlternatives:
        recommendedAlternatives.length > 0 ? recommendedAlternatives : undefined,
    };
  },

  /**
   * Calculate potential savings from optimization
   */
  calculateSavings(
    originalModel: string,
    optimizedModel: string,
    tokenCount: number,
    cacheHitRate: number = 0,
    batchingRate: number = 0
  ): {
    timeSavings: number; // seconds
    efficiencyGain: number; // percentage
    totalOptimizationScore: number; // 0-100
  } {
    const originalEstimate = this.estimateProcessingCost(originalModel, tokenCount);
    const optimizedEstimate = this.estimateProcessingCost(optimizedModel, tokenCount);

    const modelTimeSavings = originalEstimate.timeEstimate - optimizedEstimate.timeEstimate;
    const cacheTimeSavings = originalEstimate.timeEstimate * cacheHitRate;
    const batchTimeSavings = originalEstimate.timeEstimate * batchingRate * 0.3; // 30% savings from batching

    const totalTimeSavings = modelTimeSavings + cacheTimeSavings + batchTimeSavings;

    const efficiencyGain =
      ((optimizedEstimate.efficiencyScore - originalEstimate.efficiencyScore) /
        originalEstimate.efficiencyScore) *
      100;

    const totalOptimizationScore = Math.min(
      100,
      (totalTimeSavings / originalEstimate.timeEstimate) * 100 +
        cacheHitRate * 30 +
        batchingRate * 20
    );

    return {
      timeSavings: Math.max(0, totalTimeSavings),
      efficiencyGain: Math.max(0, efficiencyGain),
      totalOptimizationScore: Math.max(0, totalOptimizationScore),
    };
  },
};
