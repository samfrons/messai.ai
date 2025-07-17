/**
 * Cost Optimization Service for Ollama Integration
 * Implements intelligent model selection, request batching, and caching for cost-effective AI processing
 */

export interface OptimizationMetrics {
  totalRequests: number;
  totalTokensUsed: number;
  totalProcessingTime: number;
  costSavings: {
    cacheHits: number;
    batchOptimizations: number;
    modelDowngrades: number;
    estimatedTokensSaved: number;
  };
  modelUsage: Record<
    string,
    {
      requestCount: number;
      tokens: number;
      avgProcessingTime: number;
    }
  >;
}

export interface TaskComplexity {
  level: 'simple' | 'medium' | 'complex';
  confidence: number;
  recommendedModel: string;
  reasoning: string;
}

export interface CacheConfig {
  ttl: number; // Time to live in milliseconds
  maxSize: number; // Maximum cache entries
  enabled: boolean;
}

export interface BatchConfig {
  maxBatchSize: number;
  batchDelay: number; // Delay before processing batch in ms
  enabled: boolean;
}

export class CostOptimizationService {
  private cache: Map<string, { data: any; timestamp: number; hits: number }> = new Map();
  private pendingBatches: Map<
    string,
    Array<{ request: any; resolve: Function; reject: Function }>
  > = new Map();
  private batchTimers: Map<string, NodeJS.Timeout> = new Map();
  private metrics: OptimizationMetrics;

  private readonly cacheConfig: CacheConfig = {
    ttl: 30 * 60 * 1000, // 30 minutes
    maxSize: 1000,
    enabled: true,
  };

  private readonly batchConfig: BatchConfig = {
    maxBatchSize: 5,
    batchDelay: 2000, // 2 seconds
    enabled: true,
  };

  // Model efficiency rankings (tokens per minute processing capacity)
  private readonly modelEfficiency = {
    nuextract: { rank: 1, tokensPerMinute: 2000, specialties: ['extraction', 'parsing'] },
    'phi3.5': { rank: 2, tokensPerMinute: 1800, specialties: ['analysis', 'insights'] },
    'llama3.1:8b': { rank: 3, tokensPerMinute: 1200, specialties: ['validation', 'reasoning'] },
    'mistral-small3.2': { rank: 4, tokensPerMinute: 800, specialties: ['general'] },
  };

  constructor() {
    this.metrics = this.initializeMetrics();
    this.startCacheCleanup();
  }

  /**
   * Analyze task complexity to recommend the most cost-effective model
   */
  analyzeTaskComplexity(prompt: string, taskType: string): TaskComplexity {
    const promptLength = prompt.length;
    const hasStructuredData = /\{|\[|table|json|xml/i.test(prompt);
    const requiresReasoning = /analyze|compare|evaluate|assess|reason/i.test(prompt);
    const isSimpleExtraction = /extract|parse|find|list/i.test(prompt) && !requiresReasoning;

    let level: TaskComplexity['level'] = 'medium';
    let recommendedModel = 'phi3.5'; // Default
    let confidence = 0.7;
    let reasoning = '';

    // Simple tasks - use fastest, most efficient model
    if (isSimpleExtraction && promptLength < 500) {
      level = 'simple';
      recommendedModel = 'nuextract';
      confidence = 0.9;
      reasoning = 'Simple extraction task, using specialized extraction model';
    }
    // Structured data extraction
    else if (hasStructuredData && taskType === 'extraction') {
      level = 'medium';
      recommendedModel = 'nuextract';
      confidence = 0.85;
      reasoning = 'Structured data extraction, using specialized model';
    }
    // Complex analysis requiring reasoning
    else if (requiresReasoning && promptLength > 1000) {
      level = 'complex';
      recommendedModel = 'llama3.1:8b';
      confidence = 0.8;
      reasoning = 'Complex reasoning task, using general purpose model';
    }
    // General analysis
    else if (taskType === 'analysis' || taskType === 'insights') {
      level = 'medium';
      recommendedModel = 'phi3.5';
      confidence = 0.85;
      reasoning = 'Analysis task, using efficient analysis model';
    }

    return { level, confidence, recommendedModel, reasoning };
  }

  /**
   * Check cache for existing results
   */
  checkCache(key: string): any | null {
    if (!this.cacheConfig.enabled) return null;

    const cached = this.cache.get(key);
    if (!cached) return null;

    // Check if cache entry is still valid
    if (Date.now() - cached.timestamp > this.cacheConfig.ttl) {
      this.cache.delete(key);
      return null;
    }

    // Update hit count and metrics
    cached.hits++;
    this.metrics.costSavings.cacheHits++;

    return cached.data;
  }

  /**
   * Store result in cache
   */
  setCacheResult(key: string, data: any): void {
    if (!this.cacheConfig.enabled) return;

    // Cleanup cache if it's too large
    if (this.cache.size >= this.cacheConfig.maxSize) {
      this.cleanupCache();
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      hits: 0,
    });
  }

  /**
   * Generate cache key for request
   */
  generateCacheKey(prompt: string, model: string, parameters?: any): string {
    const paramsStr = parameters ? JSON.stringify(parameters) : '';
    return `${model}:${this.hashString(prompt + paramsStr)}`;
  }

  /**
   * Batch similar requests for processing efficiency
   */
  async batchRequest<T>(
    batchKey: string,
    request: any,
    processor: (requests: any[]) => Promise<T[]>
  ): Promise<T> {
    if (!this.batchConfig.enabled) {
      const results = await processor([request]);
      return results[0];
    }

    return new Promise((resolve, reject) => {
      // Add to pending batch
      if (!this.pendingBatches.has(batchKey)) {
        this.pendingBatches.set(batchKey, []);
      }

      const batch = this.pendingBatches.get(batchKey)!;
      batch.push({ request, resolve, reject });

      // Clear existing timer
      if (this.batchTimers.has(batchKey)) {
        clearTimeout(this.batchTimers.get(batchKey)!);
      }

      // Set new timer
      const timer = setTimeout(async () => {
        const currentBatch = this.pendingBatches.get(batchKey) || [];
        if (currentBatch.length === 0) return;

        // Remove batch from pending
        this.pendingBatches.delete(batchKey);
        this.batchTimers.delete(batchKey);

        try {
          const requests = currentBatch.map((item) => item.request);
          const results = await processor(requests);

          // Resolve all promises
          currentBatch.forEach((item, index) => {
            item.resolve(results[index]);
          });

          // Update metrics
          this.metrics.costSavings.batchOptimizations++;
        } catch (error) {
          // Reject all promises
          currentBatch.forEach((item) => {
            item.reject(error);
          });
        }
      }, this.batchConfig.batchDelay);

      this.batchTimers.set(batchKey, timer);

      // Process immediately if batch is full
      if (batch.length >= this.batchConfig.maxBatchSize) {
        clearTimeout(timer);
        this.batchTimers.delete(batchKey);

        const currentBatch = this.pendingBatches.get(batchKey) || [];
        this.pendingBatches.delete(batchKey);

        try {
          const requests = currentBatch.map((item) => item.request);
          const results = await processor(requests);

          currentBatch.forEach((item, index) => {
            item.resolve(results[index]);
          });

          this.metrics.costSavings.batchOptimizations++;
        } catch (error) {
          currentBatch.forEach((item) => {
            item.reject(error);
          });
        }
      }
    });
  }

  /**
   * Optimize model selection based on task and current system load
   */
  optimizeModelSelection(
    originalModel: string,
    taskComplexity: TaskComplexity,
    systemLoad?: number
  ): { model: string; wasDowngraded: boolean; reasoning: string } {
    let selectedModel = taskComplexity.recommendedModel;
    let wasDowngraded = false;
    let reasoning = taskComplexity.reasoning;

    // Check if we can use a more efficient model
    const originalEfficiency =
      this.modelEfficiency[originalModel as keyof typeof this.modelEfficiency];
    const recommendedEfficiency =
      this.modelEfficiency[selectedModel as keyof typeof this.modelEfficiency];

    if (originalEfficiency && recommendedEfficiency) {
      if (recommendedEfficiency.rank < originalEfficiency.rank) {
        reasoning += ' (Upgraded to more efficient model)';
      } else if (recommendedEfficiency.rank > originalEfficiency.rank) {
        wasDowngraded = true;
        reasoning += ' (Downgraded for efficiency)';
        this.metrics.costSavings.modelDowngrades++;
      }
    }

    // Consider system load if provided
    if (systemLoad && systemLoad > 0.8) {
      // High load - prefer more efficient models
      const efficientModels = Object.entries(this.modelEfficiency)
        .sort((a, b) => a[1].rank - b[1].rank)
        .filter(([_, info]) =>
          info.specialties.some((s) =>
            this.modelEfficiency[
              selectedModel as keyof typeof this.modelEfficiency
            ]?.specialties.includes(s)
          )
        );

      if (efficientModels.length > 0 && efficientModels[0][0] !== selectedModel) {
        selectedModel = efficientModels[0][0];
        wasDowngraded = true;
        reasoning += ' (Load-based optimization)';
        this.metrics.costSavings.modelDowngrades++;
      }
    }

    return { model: selectedModel, wasDowngraded, reasoning };
  }

  /**
   * Estimate token usage for a prompt
   */
  estimateTokens(text: string): number {
    // Rough estimation: ~4 characters per token
    return Math.ceil(text.length / 4);
  }

  /**
   * Calculate processing cost estimate
   */
  calculateCostEstimate(
    model: string,
    estimatedTokens: number
  ): { processingTime: number; efficiency: number } {
    const modelInfo = this.modelEfficiency[model as keyof typeof this.modelEfficiency];

    if (!modelInfo) {
      return { processingTime: estimatedTokens / 1000, efficiency: 0.5 };
    }

    const processingTime = (estimatedTokens / modelInfo.tokensPerMinute) * 60; // seconds
    const efficiency = modelInfo.rank === 1 ? 1.0 : 1.0 / modelInfo.rank;

    return { processingTime, efficiency };
  }

  /**
   * Update metrics after request completion
   */
  updateMetrics(
    model: string,
    tokensUsed: number,
    processingTime: number,
    wasCached: boolean = false,
    wasBatched: boolean = false
  ): void {
    this.metrics.totalRequests++;
    this.metrics.totalTokensUsed += tokensUsed;
    this.metrics.totalProcessingTime += processingTime;

    // Update model-specific metrics
    if (!this.metrics.modelUsage[model]) {
      this.metrics.modelUsage[model] = {
        requestCount: 0,
        tokens: 0,
        avgProcessingTime: 0,
      };
    }

    const modelMetrics = this.metrics.modelUsage[model];
    modelMetrics.requestCount++;
    modelMetrics.tokens += tokensUsed;
    modelMetrics.avgProcessingTime =
      (modelMetrics.avgProcessingTime * (modelMetrics.requestCount - 1) + processingTime) /
      modelMetrics.requestCount;

    if (wasCached) {
      this.metrics.costSavings.cacheHits++;
    }

    if (wasBatched) {
      this.metrics.costSavings.batchOptimizations++;
    }
  }

  /**
   * Get optimization metrics and recommendations
   */
  getMetrics(): OptimizationMetrics & { recommendations: string[] } {
    const recommendations: string[] = [];

    // Analyze cache hit rate
    const cacheHitRate =
      this.metrics.costSavings.cacheHits / Math.max(this.metrics.totalRequests, 1);
    if (cacheHitRate < 0.2) {
      recommendations.push('Consider increasing cache TTL for better cache hit rates');
    }

    // Analyze model usage efficiency
    const modelUsage = Object.entries(this.metrics.modelUsage);
    if (modelUsage.length > 0) {
      const mostUsedModel = modelUsage.reduce((a, b) =>
        a[1].requestCount > b[1].requestCount ? a : b
      );

      const modelInfo = this.modelEfficiency[mostUsedModel[0] as keyof typeof this.modelEfficiency];
      if (modelInfo && modelInfo.rank > 2) {
        recommendations.push(
          `Consider optimizing tasks to use more efficient models (currently using ${mostUsedModel[0]} heavily)`
        );
      }
    }

    // Analyze batch optimization rate
    const batchOptimizationRate =
      this.metrics.costSavings.batchOptimizations / Math.max(this.metrics.totalRequests, 1);
    if (batchOptimizationRate < 0.1) {
      recommendations.push('Consider implementing more batching for similar requests');
    }

    return {
      ...this.metrics,
      recommendations,
    };
  }

  /**
   * Reset metrics
   */
  resetMetrics(): void {
    this.metrics = this.initializeMetrics();
  }

  /**
   * Private helper methods
   */
  private initializeMetrics(): OptimizationMetrics {
    return {
      totalRequests: 0,
      totalTokensUsed: 0,
      totalProcessingTime: 0,
      costSavings: {
        cacheHits: 0,
        batchOptimizations: 0,
        modelDowngrades: 0,
        estimatedTokensSaved: 0,
      },
      modelUsage: {},
    };
  }

  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
  }

  private cleanupCache(): void {
    // Remove oldest or least used entries
    const entries = Array.from(this.cache.entries());
    entries.sort((a, b) => {
      // Sort by hits (ascending) then by timestamp (ascending)
      if (a[1].hits !== b[1].hits) {
        return a[1].hits - b[1].hits;
      }
      return a[1].timestamp - b[1].timestamp;
    });

    // Remove the oldest quarter of entries
    const toRemove = Math.floor(entries.length / 4);
    for (let i = 0; i < toRemove; i++) {
      this.cache.delete(entries[i][0]);
    }
  }

  private startCacheCleanup(): void {
    // Clean up expired cache entries every 10 minutes
    setInterval(() => {
      const now = Date.now();
      for (const [key, value] of this.cache.entries()) {
        if (now - value.timestamp > this.cacheConfig.ttl) {
          this.cache.delete(key);
        }
      }
    }, 10 * 60 * 1000);
  }

  /**
   * Cleanup method for graceful shutdown
   */
  cleanup(): void {
    // Clear all pending batch timers
    for (const timer of this.batchTimers.values()) {
      clearTimeout(timer);
    }
    this.batchTimers.clear();
    this.pendingBatches.clear();
  }
}
