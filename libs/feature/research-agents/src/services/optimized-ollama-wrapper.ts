/**
 * Optimized Ollama Wrapper
 * Adds cost optimization layer to the existing Ollama service
 */

import { BaseOllamaService, BaseOllamaRequest, BaseOllamaResponse } from './base-ollama-service';
import { PaperAnalysisPrompt, PaperAnalysisResult } from './ollama-service';

// Type aliases for compatibility
type OllamaService = BaseOllamaService;
type OllamaRequest = BaseOllamaRequest;
type OllamaResponse = BaseOllamaResponse;
import { CostOptimizationService, TaskComplexity } from './cost-optimization-service';

export interface OptimizedRequest extends OllamaRequest {
  taskType?: string;
  priority?: 'low' | 'medium' | 'high';
  allowCaching?: boolean;
  allowBatching?: boolean;
  allowModelOptimization?: boolean;
}

export interface OptimizedResponse extends OllamaResponse {
  optimizations: {
    wasCached: boolean;
    wasBatched: boolean;
    modelOptimized: boolean;
    originalModel?: string;
    tokensEstimated: number;
    processingTimeEstimated: number;
    actualProcessingTime: number;
    costSavingFactors: string[];
  };
}

export class OptimizedOllamaWrapper {
  private ollamaService: OllamaService;
  private costOptimizer: CostOptimizationService;

  constructor(ollamaService?: OllamaService) {
    this.ollamaService = ollamaService || new BaseOllamaService();
    this.costOptimizer = new CostOptimizationService();
  }

  /**
   * Initialize both services
   */
  async initialize(): Promise<void> {
    await this.ollamaService.initialize();
  }

  /**
   * Optimized paper analysis with cost optimizations
   */
  async analyzePaper(
    prompt: PaperAnalysisPrompt
  ): Promise<PaperAnalysisResult & { optimizations: any }> {
    const startTime = Date.now();
    const taskType = prompt.type;

    // Generate cache key
    const cacheKey = this.costOptimizer.generateCacheKey(JSON.stringify(prompt), 'default', {
      type: taskType,
    });

    // Check cache first
    const cachedResult = this.costOptimizer.checkCache(cacheKey);
    if (cachedResult) {
      this.costOptimizer.updateMetrics('cached', 0, 0, true);
      return {
        ...cachedResult,
        optimizations: {
          wasCached: true,
          wasBatched: false,
          modelOptimized: false,
          costSavingFactors: ['Cache hit - no processing required'],
        },
      };
    }

    // Analyze task complexity and optimize model selection
    const complexity = this.costOptimizer.analyzeTaskComplexity(prompt.context, taskType);
    const systemLoad = await this.getSystemLoad();
    const modelOptimization = this.costOptimizer.optimizeModelSelection(
      'llama3.1:8b', // Default model
      complexity,
      systemLoad
    );

    // Execute with optimized parameters
    const result = await this.ollamaService.analyzePaper(prompt);
    const processingTime = Date.now() - startTime;

    // Cache the result
    this.costOptimizer.setCacheResult(cacheKey, result);

    // Update metrics
    const estimatedTokens = this.costOptimizer.estimateTokens(prompt.context);
    this.costOptimizer.updateMetrics(
      modelOptimization.model,
      result.metadata.total_tokens,
      processingTime
    );

    return {
      ...result,
      optimizations: {
        wasCached: false,
        wasBatched: false,
        modelOptimized: modelOptimization.wasDowngraded,
        originalModel: 'llama3.1:8b',
        tokensEstimated: estimatedTokens,
        processingTimeEstimated: this.costOptimizer.calculateCostEstimate(
          modelOptimization.model,
          estimatedTokens
        ).processingTime,
        actualProcessingTime: processingTime,
        costSavingFactors: [complexity.reasoning, modelOptimization.reasoning].filter(Boolean),
      },
    };
  }

  /**
   * Optimized completion generation with batching support
   */
  async generateCompletion(request: OptimizedRequest): Promise<OptimizedResponse> {
    const startTime = Date.now();
    const costSavingFactors: string[] = [];

    // Set defaults
    const allowCaching = request.allowCaching !== false;
    const allowBatching = request.allowBatching !== false;
    const allowModelOptimization = request.allowModelOptimization !== false;

    // Check cache if enabled
    if (allowCaching) {
      const cacheKey = this.costOptimizer.generateCacheKey(
        request.prompt,
        request.model || 'default',
        request.options
      );

      const cachedResult = this.costOptimizer.checkCache(cacheKey);
      if (cachedResult) {
        costSavingFactors.push('Cache hit');
        return {
          ...cachedResult,
          optimizations: {
            wasCached: true,
            wasBatched: false,
            modelOptimized: false,
            tokensEstimated: 0,
            processingTimeEstimated: 0,
            actualProcessingTime: Date.now() - startTime,
            costSavingFactors,
          },
        };
      }
    }

    // Optimize model selection if enabled
    let optimizedModel = request.model || 'llama3.1:8b';
    let modelOptimized = false;

    if (allowModelOptimization) {
      const complexity = this.costOptimizer.analyzeTaskComplexity(
        request.prompt,
        request.taskType || 'general'
      );

      const systemLoad = await this.getSystemLoad();
      const modelOptimization = this.costOptimizer.optimizeModelSelection(
        optimizedModel,
        complexity,
        systemLoad
      );

      if (modelOptimization.wasDowngraded || modelOptimization.model !== optimizedModel) {
        optimizedModel = modelOptimization.model;
        modelOptimized = true;
        costSavingFactors.push(modelOptimization.reasoning);
      }
    }

    // Prepare optimized request
    const optimizedRequest: OllamaRequest = {
      ...request,
      model: optimizedModel,
    };

    // Use batching for low priority requests
    let wasBatched = false;
    let result: OllamaResponse;

    if (allowBatching && request.priority === 'low') {
      const batchKey = `${optimizedModel}-${request.taskType || 'general'}`;

      result = await this.costOptimizer.batchRequest(
        batchKey,
        optimizedRequest,
        async (requests: OllamaRequest[]) => {
          // Process batch of requests
          const results = await Promise.all(
            requests.map((req) => this.ollamaService.generateCompletion(req))
          );
          return results;
        }
      );

      wasBatched = true;
      costSavingFactors.push('Batch processing');
    } else {
      result = await this.ollamaService.generateCompletion(optimizedRequest);
    }

    const processingTime = Date.now() - startTime;

    // Cache result if enabled
    if (allowCaching) {
      const cacheKey = this.costOptimizer.generateCacheKey(
        request.prompt,
        request.model || 'default',
        request.options
      );
      this.costOptimizer.setCacheResult(cacheKey, result);
    }

    // Update metrics
    const estimatedTokens = this.costOptimizer.estimateTokens(request.prompt);
    this.costOptimizer.updateMetrics(
      optimizedModel,
      (result.prompt_eval_count || 0) + (result.eval_count || 0),
      processingTime,
      false,
      wasBatched
    );

    return {
      ...result,
      optimizations: {
        wasCached: false,
        wasBatched,
        modelOptimized,
        originalModel: request.model,
        tokensEstimated: estimatedTokens,
        processingTimeEstimated: this.costOptimizer.calculateCostEstimate(
          optimizedModel,
          estimatedTokens
        ).processingTime,
        actualProcessingTime: processingTime,
        costSavingFactors,
      },
    };
  }

  /**
   * Optimized search query generation with intelligent caching
   */
  async generateSearchQueries(
    context: string,
    existingQueries: string[] = [],
    options: { priority?: 'low' | 'medium' | 'high' } = {}
  ): Promise<string[]> {
    const cacheKey = this.costOptimizer.generateCacheKey(
      context + JSON.stringify(existingQueries.sort()),
      'search-queries'
    );

    // Check cache first
    const cachedResult = this.costOptimizer.checkCache(cacheKey);
    if (cachedResult) {
      return cachedResult;
    }

    // Use optimized completion for search query generation
    const result = await this.generateCompletion({
      model: 'phi3.5', // Use efficient model for this task
      prompt: this.buildSearchQueryPrompt(context, existingQueries),
      taskType: 'search_generation',
      priority: options.priority || 'medium',
      allowCaching: true,
      allowBatching: options.priority === 'low',
      allowModelOptimization: true,
      options: {
        temperature: 0.7,
        num_predict: 200,
      },
    });

    const queries = result.response
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0 && !line.match(/^\d+\.?\s*/))
      .slice(0, 5);

    // Cache the result
    this.costOptimizer.setCacheResult(cacheKey, queries);

    return queries;
  }

  /**
   * Optimized quality assessment with model selection
   */
  async assessPaperQuality(
    title: string,
    abstract: string,
    authors: string,
    options: { detailed?: boolean; priority?: 'low' | 'medium' | 'high' } = {}
  ) {
    const content = `Title: ${title}\nAuthors: ${authors}\nAbstract: ${abstract}`;
    const cacheKey = this.costOptimizer.generateCacheKey(content, 'quality-assessment');

    // Check cache
    const cachedResult = this.costOptimizer.checkCache(cacheKey);
    if (cachedResult) {
      return cachedResult;
    }

    // Choose model based on detail level required
    const model = options.detailed ? 'llama3.1:8b' : 'phi3.5';

    const result = await this.generateCompletion({
      model,
      prompt: this.buildQualityAssessmentPrompt(title, abstract, authors, options.detailed),
      taskType: 'quality_assessment',
      priority: options.priority || 'medium',
      allowCaching: true,
      allowBatching: options.priority === 'low',
      allowModelOptimization: true,
      options: {
        temperature: 0.3,
        num_predict: options.detailed ? 800 : 400,
      },
    });

    try {
      const parsed = JSON.parse(result.response);
      const assessment = {
        score: parsed.overall_score || 0,
        factors: parsed.factors || [],
        optimizations: result.optimizations,
      };

      this.costOptimizer.setCacheResult(cacheKey, assessment);
      return assessment;
    } catch (error) {
      // Fallback to service method
      return this.ollamaService.assessPaperQuality(title, abstract, authors);
    }
  }

  /**
   * Get optimization metrics and recommendations
   */
  getOptimizationMetrics() {
    return this.costOptimizer.getMetrics();
  }

  /**
   * Reset optimization metrics
   */
  resetOptimizationMetrics() {
    this.costOptimizer.resetMetrics();
  }

  /**
   * Check if Ollama service is available
   */
  isServiceAvailable(): boolean {
    return this.ollamaService.isServiceAvailable();
  }

  /**
   * Get underlying Ollama service for direct access
   */
  getOllamaService(): OllamaService {
    return this.ollamaService;
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    this.costOptimizer.cleanup();
  }

  /**
   * Private helper methods
   */
  private async getSystemLoad(): Promise<number> {
    // In a real implementation, this would check actual system metrics
    // For now, return a mock value
    return Math.random() * 0.5 + 0.3; // Random load between 0.3 and 0.8
  }

  private buildSearchQueryPrompt(context: string, existingQueries: string[]): string {
    return `
Given the following context about algae fuel cells and bioreactors research:

${context}

Generate 5 diverse, specific search queries that would help find high-quality research papers related to this topic.

Avoid these existing queries:
${existingQueries.map((q) => `- ${q}`).join('\n')}

Focus on:
1. Specific algae species (Chlorella, Scenedesmus, Spirulina, etc.)
2. Technical aspects (power density, current density, electrode materials)
3. System types (microfluidic, photobioreactor, microbial fuel cell)
4. Recent innovations and optimization techniques
5. Practical applications and scaling considerations

Return only the search queries, one per line, without numbering or explanation.
    `.trim();
  }

  private buildQualityAssessmentPrompt(
    title: string,
    abstract: string,
    authors: string,
    detailed: boolean = false
  ): string {
    const basePrompt = `
Assess the quality of this research paper for inclusion in an algae fuel cell research database:

Title: ${title}
Authors: ${authors}
Abstract: ${abstract}

Evaluate the paper based on:
1. Scientific rigor and methodology
2. Relevance to algae fuel cell research
3. Novelty and innovation
4. Practical applicability
${
  detailed
    ? '5. Data quality and completeness\n6. Statistical analysis quality\n7. Reproducibility'
    : '5. Data quality and completeness'
}

Provide a score from 0-100 and brief reasoning for each factor.
    `;

    if (detailed) {
      return (
        basePrompt +
        `
Format your response as JSON:
{
  "overall_score": 85,
  "factors": [
    {
      "factor": "Scientific rigor",
      "score": 90,
      "reasoning": "Well-designed experiments with proper controls"
    },
    ...
  ],
  "detailed_analysis": {
    "strengths": ["list", "of", "strengths"],
    "weaknesses": ["list", "of", "weaknesses"],
    "recommendations": ["list", "of", "recommendations"]
  }
}`
      );
    } else {
      return (
        basePrompt +
        `
Format your response as JSON:
{
  "overall_score": 85,
  "factors": [
    {
      "factor": "Scientific rigor",
      "score": 90,
      "reasoning": "Well-designed experiments with proper controls"
    },
    ...
  ]
}`
      );
    }
  }
}
