/**
 * Unit tests for Cost Optimization Service
 * Tests caching, batching, model selection, and optimization algorithms
 */

import { CostOptimizationService, TaskComplexity } from './cost-optimization-service';

describe('CostOptimizationService', () => {
  let service: CostOptimizationService;

  beforeEach(() => {
    service = new CostOptimizationService();
  });

  afterEach(() => {
    service.cleanup();
  });

  describe('Task Complexity Analysis', () => {
    it('should identify simple extraction tasks', () => {
      const prompt = 'Extract the title and authors from this paper';
      const result = service.analyzeTaskComplexity(prompt, 'extraction');

      expect(result.level).toBe('simple');
      expect(result.recommendedModel).toBe('nuextract');
      expect(result.confidence).toBeGreaterThan(0.8);
      expect(result.reasoning).toContain('Simple extraction task');
    });

    it('should identify complex reasoning tasks', () => {
      const longPrompt =
        'Analyze and evaluate the methodology presented in this research paper. Compare it with existing approaches and assess the validity of the conclusions drawn. Consider the experimental design, statistical analysis, and potential limitations that might affect the reproducibility of the results.';
      const result = service.analyzeTaskComplexity(longPrompt, 'analysis');

      expect(result.level).toBe('complex');
      expect(result.recommendedModel).toBe('llama3.1:8b');
      expect(result.confidence).toBeGreaterThan(0.7);
      expect(result.reasoning).toContain('Complex reasoning task');
    });

    it('should handle structured data extraction', () => {
      const prompt = 'Extract JSON data from this research paper: {"title": "", "methods": []}';
      const result = service.analyzeTaskComplexity(prompt, 'extraction');

      expect(result.level).toBe('medium');
      expect(result.recommendedModel).toBe('nuextract');
      expect(result.confidence).toBeGreaterThan(0.8);
      expect(result.reasoning).toContain('Structured data extraction');
    });

    it('should handle analysis tasks with phi3.5', () => {
      const prompt = 'Analyze the trends in this research data';
      const result = service.analyzeTaskComplexity(prompt, 'analysis');

      expect(result.level).toBe('medium');
      expect(result.recommendedModel).toBe('phi3.5');
      expect(result.confidence).toBeGreaterThan(0.8);
      expect(result.reasoning).toContain('Analysis task');
    });
  });

  describe('Caching System', () => {
    it('should generate consistent cache keys', () => {
      const key1 = service.generateCacheKey('test prompt', 'model1', { temp: 0.7 });
      const key2 = service.generateCacheKey('test prompt', 'model1', { temp: 0.7 });
      const key3 = service.generateCacheKey('test prompt', 'model2', { temp: 0.7 });

      expect(key1).toBe(key2);
      expect(key1).not.toBe(key3);
    });

    it('should store and retrieve cached results', () => {
      const cacheKey = service.generateCacheKey('test', 'model');
      const testData = { result: 'cached data' };

      // Initially no cache
      expect(service.checkCache(cacheKey)).toBeNull();

      // Store data
      service.setCacheResult(cacheKey, testData);

      // Retrieve data
      const cached = service.checkCache(cacheKey);
      expect(cached).toEqual(testData);
    });

    it('should respect TTL and expire old entries', (done) => {
      // Create service with very short TTL for testing
      const shortTtlService = new CostOptimizationService();
      (shortTtlService as any).cacheConfig.ttl = 50; // 50ms

      const cacheKey = shortTtlService.generateCacheKey('test', 'model');
      const testData = { result: 'cached data' };

      shortTtlService.setCacheResult(cacheKey, testData);
      expect(shortTtlService.checkCache(cacheKey)).toEqual(testData);

      // Wait for TTL to expire
      setTimeout(() => {
        expect(shortTtlService.checkCache(cacheKey)).toBeNull();
        shortTtlService.cleanup();
        done();
      }, 100);
    });

    it('should update cache hit metrics', () => {
      const cacheKey = service.generateCacheKey('test', 'model');
      service.setCacheResult(cacheKey, { data: 'test' });

      const initialMetrics = service.getMetrics();
      const initialHits = initialMetrics.costSavings.cacheHits;

      service.checkCache(cacheKey);
      service.checkCache(cacheKey);

      const updatedMetrics = service.getMetrics();
      expect(updatedMetrics.costSavings.cacheHits).toBe(initialHits + 2);
    });
  });

  describe('Batching System', () => {
    it('should process single request immediately when batching disabled', async () => {
      (service as any).batchConfig.enabled = false;

      const request = { id: 'test1' };
      const processor = jest.fn().mockResolvedValue([{ result: 'processed' }]);

      const result = await service.batchRequest('test-batch', request, processor);

      expect(result).toEqual({ result: 'processed' });
      expect(processor).toHaveBeenCalledWith([request]);
    });

    it('should batch multiple requests when enabled', async () => {
      const requests = [{ id: 'test1' }, { id: 'test2' }, { id: 'test3' }];
      const processor = jest
        .fn()
        .mockImplementation((reqs) =>
          Promise.resolve(reqs.map((r, i) => ({ result: `processed-${i}` })))
        );

      // Start multiple requests
      const promises = requests.map((req, i) =>
        service.batchRequest(`test-batch-${i % 2}`, req, processor)
      );

      const results = await Promise.all(promises);

      expect(results).toHaveLength(3);
      expect(processor).toHaveBeenCalled();
      expect(service.getMetrics().costSavings.batchOptimizations).toBeGreaterThan(0);
    });

    it('should process batch when size limit reached', async () => {
      (service as any).batchConfig.maxBatchSize = 2;
      (service as any).batchConfig.batchDelay = 10000; // Long delay to test size trigger

      const requests = [{ id: 'test1' }, { id: 'test2' }, { id: 'test3' }];
      const processor = jest
        .fn()
        .mockImplementation((reqs) =>
          Promise.resolve(reqs.map((r, i) => ({ result: `processed-${i}` })))
        );

      const promises = requests.map((req) =>
        service.batchRequest('size-test-batch', req, processor)
      );

      const results = await Promise.all(promises);

      expect(results).toHaveLength(3);
      expect(processor).toHaveBeenCalledTimes(2); // Two batches: [req1, req2] and [req3]
    });
  });

  describe('Model Selection Optimization', () => {
    it('should recommend more efficient models for simple tasks', () => {
      const taskComplexity: TaskComplexity = {
        level: 'simple',
        confidence: 0.9,
        recommendedModel: 'nuextract',
        reasoning: 'Simple task',
      };

      const result = service.optimizeModelSelection('llama3.1:8b', taskComplexity, 0.5);

      expect(result.model).toBe('nuextract');
      expect(result.wasDowngraded).toBe(true);
      expect(result.reasoning).toContain('Downgraded for efficiency');
    });

    it('should consider system load for model selection', () => {
      const taskComplexity: TaskComplexity = {
        level: 'medium',
        confidence: 0.8,
        recommendedModel: 'phi3.5',
        reasoning: 'Medium complexity',
      };

      const result = service.optimizeModelSelection('llama3.1:8b', taskComplexity, 0.9); // High load

      expect(result.wasDowngraded).toBe(true);
      expect(result.reasoning).toContain('Load-based optimization');
    });

    it('should track model downgrade metrics', () => {
      const taskComplexity: TaskComplexity = {
        level: 'simple',
        confidence: 0.9,
        recommendedModel: 'nuextract',
        reasoning: 'Simple task',
      };

      const initialMetrics = service.getMetrics();
      const initialDowngrades = initialMetrics.costSavings.modelDowngrades;

      service.optimizeModelSelection('llama3.1:8b', taskComplexity);

      const updatedMetrics = service.getMetrics();
      expect(updatedMetrics.costSavings.modelDowngrades).toBe(initialDowngrades + 1);
    });
  });

  describe('Token Estimation', () => {
    it('should estimate tokens correctly', () => {
      const shortText = 'test';
      const longText = 'a'.repeat(1000);

      expect(service.estimateTokens(shortText)).toBe(1); // 4 chars / 4 = 1 token
      expect(service.estimateTokens(longText)).toBe(250); // 1000 chars / 4 = 250 tokens
    });
  });

  describe('Cost Estimation', () => {
    it('should calculate processing time based on model efficiency', () => {
      const tokens = 1000;

      const nuextractEstimate = service.calculateCostEstimate('nuextract', tokens);
      const llamaEstimate = service.calculateCostEstimate('llama3.1:8b', tokens);

      expect(nuextractEstimate.processingTime).toBeLessThan(llamaEstimate.processingTime);
      expect(nuextractEstimate.efficiency).toBeGreaterThan(llamaEstimate.efficiency);
    });

    it('should handle unknown models gracefully', () => {
      const estimate = service.calculateCostEstimate('unknown-model', 100);

      expect(estimate.processingTime).toBe(100); // fallback: tokens / 1000
      expect(estimate.efficiency).toBe(0.5);
    });
  });

  describe('Metrics and Recommendations', () => {
    beforeEach(() => {
      service.resetMetrics();
    });

    it('should track comprehensive metrics', () => {
      service.updateMetrics('nuextract', 100, 1000, false, true);
      service.updateMetrics('phi3.5', 200, 2000, true, false);

      const metrics = service.getMetrics();

      expect(metrics.totalRequests).toBe(2);
      expect(metrics.totalTokensUsed).toBe(300);
      expect(metrics.totalProcessingTime).toBe(3000);
      expect(metrics.costSavings.batchOptimizations).toBe(1);
      expect(metrics.costSavings.cacheHits).toBe(1);

      expect(metrics.modelUsage['nuextract']).toBeDefined();
      expect(metrics.modelUsage['nuextract'].requestCount).toBe(1);
      expect(metrics.modelUsage['nuextract'].tokens).toBe(100);
      expect(metrics.modelUsage['nuextract'].avgProcessingTime).toBe(1000);
    });

    it('should provide optimization recommendations', () => {
      // Set up scenario for recommendations
      service.updateMetrics('mistral-small3.2', 1000, 5000); // Heavy usage of inefficient model

      for (let i = 0; i < 10; i++) {
        service.updateMetrics('mistral-small3.2', 100, 1000); // No cache hits
      }

      const metricsWithRecommendations = service.getMetrics();

      expect(metricsWithRecommendations.recommendations).toContain(
        expect.stringMatching(/cache|TTL/i)
      );
      expect(metricsWithRecommendations.recommendations).toContain(
        expect.stringMatching(/efficient.*model/i)
      );
    });

    it('should reset metrics correctly', () => {
      service.updateMetrics('test-model', 100, 1000);

      let metrics = service.getMetrics();
      expect(metrics.totalRequests).toBe(1);

      service.resetMetrics();

      metrics = service.getMetrics();
      expect(metrics.totalRequests).toBe(0);
      expect(metrics.totalTokensUsed).toBe(0);
      expect(metrics.modelUsage).toEqual({});
    });
  });

  describe('Cleanup and Resource Management', () => {
    it('should cleanup resources properly', () => {
      // Add some pending batches and timers
      const batchPromise = service.batchRequest(
        'cleanup-test',
        { id: 'test' },
        () => new Promise((resolve) => setTimeout(resolve, 5000))
      );

      service.cleanup();

      // Verify cleanup doesn't throw errors
      expect(() => service.cleanup()).not.toThrow();

      // The batch promise should be handled gracefully
      return expect(batchPromise).rejects.toBeDefined();
    });
  });

  describe('Integration Scenarios', () => {
    it('should optimize end-to-end workflow', async () => {
      const prompt = 'Extract title from paper';
      const cacheKey = service.generateCacheKey(prompt, 'default');

      // First request - should analyze and optimize
      const complexity = service.analyzeTaskComplexity(prompt, 'extraction');
      const optimization = service.optimizeModelSelection('llama3.1:8b', complexity);

      expect(optimization.model).toBe('nuextract');
      expect(optimization.wasDowngraded).toBe(true);

      // Cache the result
      const result = { extracted: 'Sample Title' };
      service.setCacheResult(cacheKey, result);

      // Second request - should hit cache
      const cachedResult = service.checkCache(cacheKey);
      expect(cachedResult).toEqual(result);

      // Update metrics
      service.updateMetrics(optimization.model, 50, 800, true);

      const metrics = service.getMetrics();
      expect(metrics.costSavings.modelDowngrades).toBeGreaterThan(0);
      expect(metrics.costSavings.cacheHits).toBeGreaterThan(0);
    });
  });
});
