/**
 * Unit tests for Optimized Ollama Wrapper
 * Tests integration between OllamaService and CostOptimizationService
 */

import { OptimizedOllamaWrapper, OptimizedRequest } from './optimized-ollama-wrapper';
import { OllamaService, PaperAnalysisPrompt } from './ollama-service';
import { CostOptimizationService } from './cost-optimization-service';

// Mock dependencies
jest.mock('./ollama-service');
jest.mock('./cost-optimization-service');

describe('OptimizedOllamaWrapper', () => {
  let wrapper: OptimizedOllamaWrapper;
  let mockOllamaService: jest.Mocked<OllamaService>;
  let mockCostOptimizer: jest.Mocked<CostOptimizationService>;

  beforeEach(() => {
    // Create mocks
    mockOllamaService = {
      initialize: jest.fn().mockResolvedValue(undefined),
      generateCompletion: jest.fn(),
      analyzePaper: jest.fn(),
      isServiceAvailable: jest.fn().mockReturnValue(true),
      assessPaperQuality: jest.fn(),
    } as any;

    mockCostOptimizer = {
      generateCacheKey: jest.fn(),
      checkCache: jest.fn(),
      setCacheResult: jest.fn(),
      analyzeTaskComplexity: jest.fn(),
      optimizeModelSelection: jest.fn(),
      estimateTokens: jest.fn(),
      calculateCostEstimate: jest.fn(),
      updateMetrics: jest.fn(),
      batchRequest: jest.fn(),
      cleanup: jest.fn(),
    } as any;

    // Mock constructor calls
    (OllamaService as jest.Mock).mockImplementation(() => mockOllamaService);
    (CostOptimizationService as jest.Mock).mockImplementation(() => mockCostOptimizer);

    wrapper = new OptimizedOllamaWrapper();
  });

  afterEach(() => {
    wrapper.cleanup();
    jest.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize both services', async () => {
      await wrapper.initialize();

      expect(mockOllamaService.initialize).toHaveBeenCalled();
    });

    it('should use provided OllamaService instance', () => {
      const customService = new OllamaService();
      const customWrapper = new OptimizedOllamaWrapper(customService);

      expect(customWrapper.getOllamaService()).toBe(customService);
    });
  });

  describe('Paper Analysis with Optimization', () => {
    const mockPrompt: PaperAnalysisPrompt = {
      type: 'keyword_extraction',
      context: 'Sample research paper content about algae fuel cells',
    };

    const mockAnalysisResult = {
      type: 'keyword_extraction' as const,
      result: ['algae', 'fuel cell', 'bioreactor'],
      confidence: 0.85,
      processingTime: 1500,
      metadata: {
        model: 'nuextract',
        prompt_tokens: 100,
        completion_tokens: 50,
        total_tokens: 150,
      },
    };

    beforeEach(() => {
      mockCostOptimizer.generateCacheKey.mockReturnValue('cache-key-123');
      mockCostOptimizer.analyzeTaskComplexity.mockReturnValue({
        level: 'simple',
        confidence: 0.9,
        recommendedModel: 'nuextract',
        reasoning: 'Simple extraction task',
      });
      mockCostOptimizer.optimizeModelSelection.mockReturnValue({
        model: 'nuextract',
        wasDowngraded: true,
        reasoning: 'Optimized for efficiency',
      });
      mockCostOptimizer.estimateTokens.mockReturnValue(100);
      mockCostOptimizer.calculateCostEstimate.mockReturnValue({
        processingTime: 1200,
        efficiency: 0.9,
      });
    });

    it('should use cached result when available', async () => {
      const cachedResult = { ...mockAnalysisResult };
      mockCostOptimizer.checkCache.mockReturnValue(cachedResult);

      const result = await wrapper.analyzePaper(mockPrompt);

      expect(result).toEqual({
        ...cachedResult,
        optimizations: {
          wasCached: true,
          wasBatched: false,
          modelOptimized: false,
          costSavingFactors: ['Cache hit - no processing required'],
        },
      });

      expect(mockOllamaService.analyzePaper).not.toHaveBeenCalled();
      expect(mockCostOptimizer.updateMetrics).toHaveBeenCalledWith('cached', 0, 0, true);
    });

    it('should perform optimization when cache miss', async () => {
      mockCostOptimizer.checkCache.mockReturnValue(null);
      mockOllamaService.analyzePaper.mockResolvedValue(mockAnalysisResult);

      const result = await wrapper.analyzePaper(mockPrompt);

      expect(mockCostOptimizer.analyzeTaskComplexity).toHaveBeenCalledWith(
        mockPrompt.context,
        mockPrompt.type
      );
      expect(mockCostOptimizer.optimizeModelSelection).toHaveBeenCalled();
      expect(mockOllamaService.analyzePaper).toHaveBeenCalledWith(mockPrompt);
      expect(mockCostOptimizer.setCacheResult).toHaveBeenCalled();

      expect(result.optimizations).toEqual({
        wasCached: false,
        wasBatched: false,
        modelOptimized: true,
        originalModel: 'llama3.1:8b',
        tokensEstimated: 100,
        processingTimeEstimated: 1200,
        actualProcessingTime: expect.any(Number),
        costSavingFactors: ['Simple extraction task', 'Optimized for efficiency'],
      });
    });
  });

  describe('Optimized Completion Generation', () => {
    const mockRequest: OptimizedRequest = {
      model: 'llama3.1:8b',
      prompt: 'Analyze this research paper',
      allowCaching: true,
      allowBatching: true,
      allowModelOptimization: true,
      priority: 'medium',
    };

    const mockResponse = {
      response: 'Analysis complete',
      done: true,
      prompt_eval_count: 50,
      eval_count: 30,
      total_duration: 2000,
    };

    beforeEach(() => {
      mockCostOptimizer.generateCacheKey.mockReturnValue('completion-cache-key');
      mockCostOptimizer.analyzeTaskComplexity.mockReturnValue({
        level: 'medium',
        confidence: 0.8,
        recommendedModel: 'phi3.5',
        reasoning: 'Analysis task',
      });
      mockCostOptimizer.optimizeModelSelection.mockReturnValue({
        model: 'phi3.5',
        wasDowngraded: true,
        reasoning: 'Optimized for task type',
      });
      mockCostOptimizer.estimateTokens.mockReturnValue(75);
      mockCostOptimizer.calculateCostEstimate.mockReturnValue({
        processingTime: 1800,
        efficiency: 0.85,
      });
    });

    it('should return cached result when available', async () => {
      const cachedResponse = { ...mockResponse };
      mockCostOptimizer.checkCache.mockReturnValue(cachedResponse);

      const result = await wrapper.generateCompletion(mockRequest);

      expect(result).toEqual({
        ...cachedResponse,
        optimizations: {
          wasCached: true,
          wasBatched: false,
          modelOptimized: false,
          tokensEstimated: 0,
          processingTimeEstimated: 0,
          actualProcessingTime: expect.any(Number),
          costSavingFactors: ['Cache hit'],
        },
      });

      expect(mockOllamaService.generateCompletion).not.toHaveBeenCalled();
    });

    it('should perform model optimization when cache miss', async () => {
      mockCostOptimizer.checkCache.mockReturnValue(null);
      mockOllamaService.generateCompletion.mockResolvedValue(mockResponse);

      const result = await wrapper.generateCompletion(mockRequest);

      expect(mockCostOptimizer.analyzeTaskComplexity).toHaveBeenCalled();
      expect(mockCostOptimizer.optimizeModelSelection).toHaveBeenCalled();
      expect(mockOllamaService.generateCompletion).toHaveBeenCalledWith({
        ...mockRequest,
        model: 'phi3.5', // Optimized model
      });

      expect(result.optimizations.modelOptimized).toBe(true);
      expect(result.optimizations.costSavingFactors).toContain('Optimized for task type');
    });

    it('should use batching for low priority requests', async () => {
      const lowPriorityRequest = { ...mockRequest, priority: 'low' as const };

      mockCostOptimizer.checkCache.mockReturnValue(null);
      mockCostOptimizer.batchRequest.mockResolvedValue(mockResponse);

      const result = await wrapper.generateCompletion(lowPriorityRequest);

      expect(mockCostOptimizer.batchRequest).toHaveBeenCalled();
      expect(result.optimizations.wasBatched).toBe(true);
      expect(result.optimizations.costSavingFactors).toContain('Batch processing');
    });

    it('should respect optimization flags', async () => {
      const noOptimizationRequest = {
        ...mockRequest,
        allowCaching: false,
        allowBatching: false,
        allowModelOptimization: false,
      };

      mockOllamaService.generateCompletion.mockResolvedValue(mockResponse);

      const result = await wrapper.generateCompletion(noOptimizationRequest);

      expect(mockCostOptimizer.checkCache).not.toHaveBeenCalled();
      expect(mockCostOptimizer.optimizeModelSelection).not.toHaveBeenCalled();
      expect(mockCostOptimizer.batchRequest).not.toHaveBeenCalled();
      expect(mockOllamaService.generateCompletion).toHaveBeenCalledWith({
        ...noOptimizationRequest,
        model: 'llama3.1:8b', // Original model
      });

      expect(result.optimizations.wasCached).toBe(false);
      expect(result.optimizations.wasBatched).toBe(false);
      expect(result.optimizations.modelOptimized).toBe(false);
    });
  });

  describe('Search Query Generation', () => {
    it('should use optimized completion for search queries', async () => {
      const context = 'algae fuel cell research';
      const existingQueries = ['previous query'];

      const mockOptimizedResponse = {
        response: 'chlorella fuel cell\nspirulina bioreactor\nmicrofluidic algae',
        optimizations: {
          wasCached: false,
          wasBatched: false,
          modelOptimized: true,
          costSavingFactors: ['Task-optimized model selection'],
        },
      };

      // Mock the internal generateCompletion call
      jest.spyOn(wrapper, 'generateCompletion').mockResolvedValue(mockOptimizedResponse as any);
      mockCostOptimizer.generateCacheKey.mockReturnValue('search-cache-key');
      mockCostOptimizer.checkCache.mockReturnValue(null);

      const result = await wrapper.generateSearchQueries(context, existingQueries);

      expect(wrapper.generateCompletion).toHaveBeenCalledWith({
        model: 'phi3.5',
        prompt: expect.stringContaining(context),
        taskType: 'search_generation',
        priority: 'medium',
        allowCaching: true,
        allowBatching: false, // medium priority
        allowModelOptimization: true,
        options: {
          temperature: 0.7,
          num_predict: 200,
        },
      });

      expect(result).toEqual(['chlorella fuel cell', 'spirulina bioreactor', 'microfluidic algae']);
      expect(mockCostOptimizer.setCacheResult).toHaveBeenCalled();
    });

    it('should return cached queries when available', async () => {
      const cachedQueries = ['cached query 1', 'cached query 2'];
      mockCostOptimizer.checkCache.mockReturnValue(cachedQueries);

      const result = await wrapper.generateSearchQueries('test context');

      expect(result).toEqual(cachedQueries);
      expect(wrapper.generateCompletion).not.toHaveBeenCalled();
    });
  });

  describe('Quality Assessment', () => {
    const title = 'Sample Paper Title';
    const abstract = 'Sample abstract content';
    const authors = 'John Doe, Jane Smith';

    it('should use appropriate model based on detail level', async () => {
      const mockQualityResponse = {
        response: JSON.stringify({
          overall_score: 85,
          factors: [{ factor: 'rigor', score: 90, reasoning: 'well designed' }],
        }),
        optimizations: { modelOptimized: true },
      };

      jest.spyOn(wrapper, 'generateCompletion').mockResolvedValue(mockQualityResponse as any);
      mockCostOptimizer.checkCache.mockReturnValue(null);

      // Test detailed assessment
      await wrapper.assessPaperQuality(title, abstract, authors, { detailed: true });
      expect(wrapper.generateCompletion).toHaveBeenCalledWith(
        expect.objectContaining({ model: 'llama3.1:8b' })
      );

      jest.clearAllMocks();

      // Test non-detailed assessment
      await wrapper.assessPaperQuality(title, abstract, authors, { detailed: false });
      expect(wrapper.generateCompletion).toHaveBeenCalledWith(
        expect.objectContaining({ model: 'phi3.5' })
      );
    });

    it('should handle JSON parsing errors gracefully', async () => {
      const invalidJsonResponse = {
        response: 'Invalid JSON response',
        optimizations: {},
      };

      jest.spyOn(wrapper, 'generateCompletion').mockResolvedValue(invalidJsonResponse as any);
      mockOllamaService.assessPaperQuality.mockResolvedValue({
        score: 75,
        factors: [],
      });
      mockCostOptimizer.checkCache.mockReturnValue(null);

      const result = await wrapper.assessPaperQuality(title, abstract, authors);

      expect(mockOllamaService.assessPaperQuality).toHaveBeenCalledWith(title, abstract, authors);
      expect(result).toEqual({ score: 75, factors: [] });
    });

    it('should cache and return cached results', async () => {
      const cachedAssessment = {
        score: 88,
        factors: [{ factor: 'novelty', score: 90, reasoning: 'innovative approach' }],
        optimizations: { wasCached: true },
      };

      mockCostOptimizer.checkCache.mockReturnValue(cachedAssessment);

      const result = await wrapper.assessPaperQuality(title, abstract, authors);

      expect(result).toEqual(cachedAssessment);
      expect(wrapper.generateCompletion).not.toHaveBeenCalled();
    });
  });

  describe('Metrics and Status', () => {
    it('should return optimization metrics', () => {
      const mockMetrics = {
        totalRequests: 10,
        costSavings: { cacheHits: 3, batchOptimizations: 2 },
        recommendations: ['Use more caching'],
      };

      mockCostOptimizer.getMetrics.mockReturnValue(mockMetrics as any);

      const result = wrapper.getOptimizationMetrics();

      expect(result).toEqual(mockMetrics);
      expect(mockCostOptimizer.getMetrics).toHaveBeenCalled();
    });

    it('should reset optimization metrics', () => {
      wrapper.resetOptimizationMetrics();

      expect(mockCostOptimizer.resetMetrics).toHaveBeenCalled();
    });

    it('should check service availability', () => {
      mockOllamaService.isServiceAvailable.mockReturnValue(true);

      const result = wrapper.isServiceAvailable();

      expect(result).toBe(true);
      expect(mockOllamaService.isServiceAvailable).toHaveBeenCalled();
    });

    it('should provide access to underlying service', () => {
      const result = wrapper.getOllamaService();

      expect(result).toBe(mockOllamaService);
    });

    it('should cleanup resources', () => {
      wrapper.cleanup();

      expect(mockCostOptimizer.cleanup).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle system load calculation errors gracefully', async () => {
      // Mock getSystemLoad to simulate error (private method testing via proxy)
      const originalGetSystemLoad = (wrapper as any).getSystemLoad;
      (wrapper as any).getSystemLoad = jest.fn().mockRejectedValue(new Error('System load error'));

      const mockRequest: OptimizedRequest = {
        model: 'test-model',
        prompt: 'test prompt',
        allowModelOptimization: true,
      };

      mockCostOptimizer.checkCache.mockReturnValue(null);
      mockCostOptimizer.analyzeTaskComplexity.mockReturnValue({
        level: 'simple',
        confidence: 0.8,
        recommendedModel: 'nuextract',
        reasoning: 'test',
      });
      mockCostOptimizer.optimizeModelSelection.mockReturnValue({
        model: 'nuextract',
        wasDowngraded: false,
        reasoning: 'test',
      });
      mockOllamaService.generateCompletion.mockResolvedValue({
        response: 'test response',
        done: true,
      });

      // Should not throw error despite system load failure
      await expect(wrapper.generateCompletion(mockRequest)).resolves.toBeDefined();

      // Restore original method
      (wrapper as any).getSystemLoad = originalGetSystemLoad;
    });
  });
});
