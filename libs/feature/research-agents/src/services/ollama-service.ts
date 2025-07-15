/**
 * Ollama Integration Service
 * Handles communication with Ollama for AI-powered paper analysis
 */

export interface OllamaConfig {
  baseUrl: string;
  model: string;
  timeout: number;
  maxRetries: number;
}

export interface OllamaRequest {
  model: string;
  prompt: string;
  stream?: boolean;
  options?: {
    temperature?: number;
    top_p?: number;
    top_k?: number;
    num_predict?: number;
    stop?: string[];
  };
}

export interface OllamaResponse {
  response: string;
  done: boolean;
  context?: number[];
  total_duration?: number;
  load_duration?: number;
  prompt_eval_count?: number;
  prompt_eval_duration?: number;
  eval_count?: number;
  eval_duration?: number;
}

export interface PaperAnalysisPrompt {
  type:
    | 'keyword_extraction'
    | 'similarity_analysis'
    | 'quality_assessment'
    | 'trend_analysis'
    | 'gap_identification';
  context: string;
  papers?: Array<{
    title: string;
    abstract: string;
    keywords?: string[];
  }>;
  parameters?: Record<string, any>;
}

export interface PaperAnalysisResult {
  type: PaperAnalysisPrompt['type'];
  result: any;
  confidence: number;
  processingTime: number;
  metadata: {
    model: string;
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class OllamaService {
  private config: OllamaConfig;
  private isAvailable: boolean = false;

  constructor(config: Partial<OllamaConfig> = {}) {
    this.config = {
      baseUrl: config.baseUrl || 'http://localhost:11434',
      model: config.model || 'llama3.1:8b',
      timeout: config.timeout || 30000,
      maxRetries: config.maxRetries || 3,
    };
  }

  async initialize(): Promise<void> {
    try {
      await this.checkAvailability();
      this.isAvailable = true;
      console.log('Ollama service initialized successfully');
    } catch (error) {
      console.warn('Ollama service not available, falling back to mock responses');
      this.isAvailable = false;
    }
  }

  async checkAvailability(): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.baseUrl}/api/tags`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(5000),
      });

      if (!response.ok) {
        throw new Error(`Ollama API returned ${response.status}`);
      }

      const data = await response.json();
      const availableModels = data.models?.map((m: any) => m.name) || [];

      if (!availableModels.includes(this.config.model)) {
        console.warn(
          `Model ${this.config.model} not available, using ${availableModels[0] || 'default'}`
        );
        if (availableModels.length > 0) {
          this.config.model = availableModels[0];
        }
      }

      this.isAvailable = true;
      return true;
    } catch (error) {
      console.error('Ollama availability check failed:', error);
      this.isAvailable = false;
      return false;
    }
  }

  async generateCompletion(request: OllamaRequest): Promise<OllamaResponse> {
    if (!this.isAvailable) {
      return this.getMockResponse(request);
    }

    const startTime = Date.now();
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < this.config.maxRetries; attempt++) {
      try {
        const response = await fetch(`${this.config.baseUrl}/api/generate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...request,
            model: this.config.model,
          }),
          signal: AbortSignal.timeout(this.config.timeout),
        });

        if (!response.ok) {
          throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return {
          ...data,
          total_duration: Date.now() - startTime,
        };
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');

        if (attempt < this.config.maxRetries - 1) {
          await this.sleep(1000 * Math.pow(2, attempt)); // Exponential backoff
        }
      }
    }

    // If all retries failed, return mock response
    console.warn('Ollama API failed after retries, returning mock response');
    return this.getMockResponse(request);
  }

  async analyzePaper(prompt: PaperAnalysisPrompt): Promise<PaperAnalysisResult> {
    const startTime = Date.now();
    const ollamaRequest = this.buildAnalysisRequest(prompt);

    try {
      const response = await this.generateCompletion(ollamaRequest);
      const result = await this.parseAnalysisResponse(response.response, prompt.type);

      return {
        type: prompt.type,
        result,
        confidence: this.calculateConfidence(response, prompt.type),
        processingTime: Date.now() - startTime,
        metadata: {
          model: this.config.model,
          prompt_tokens: response.prompt_eval_count || 0,
          completion_tokens: response.eval_count || 0,
          total_tokens: (response.prompt_eval_count || 0) + (response.eval_count || 0),
        },
      };
    } catch (error) {
      console.error('Paper analysis failed:', error);
      return this.getMockAnalysisResult(prompt.type, Date.now() - startTime);
    }
  }

  async generateSearchQueries(context: string, existingQueries: string[] = []): Promise<string[]> {
    const prompt = `
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
    `;

    try {
      const response = await this.generateCompletion({
        model: this.config.model,
        prompt,
        options: {
          temperature: 0.7,
          num_predict: 200,
        },
      });

      return response.response
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.length > 0 && !line.match(/^\d+\.?\s*/))
        .slice(0, 5);
    } catch (error) {
      console.error('Search query generation failed:', error);
      return this.getMockSearchQueries();
    }
  }

  async assessPaperQuality(
    title: string,
    abstract: string,
    authors: string
  ): Promise<{
    score: number;
    factors: Array<{
      factor: string;
      score: number;
      reasoning: string;
    }>;
  }> {
    const prompt = `
      Assess the quality of this research paper for inclusion in an algae fuel cell research database:
      
      Title: ${title}
      Authors: ${authors}
      Abstract: ${abstract}
      
      Evaluate the paper based on:
      1. Scientific rigor and methodology
      2. Relevance to algae fuel cell research
      3. Novelty and innovation
      4. Practical applicability
      5. Data quality and completeness
      
      Provide a score from 0-100 and brief reasoning for each factor.
      
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
      }
    `;

    try {
      const response = await this.generateCompletion({
        model: this.config.model,
        prompt,
        options: {
          temperature: 0.3,
          num_predict: 500,
        },
      });

      const result = JSON.parse(response.response);
      return {
        score: result.overall_score || 0,
        factors: result.factors || [],
      };
    } catch (error) {
      console.error('Paper quality assessment failed:', error);
      return this.getMockQualityAssessment();
    }
  }

  async identifyKeywords(text: string): Promise<string[]> {
    const prompt = `
      Extract key scientific keywords and terms from this algae fuel cell research text:
      
      ${text}
      
      Focus on:
      1. Algae species names
      2. Technical terminology
      3. Materials and methods
      4. Performance metrics
      5. System components
      
      Return only the keywords, one per line, without explanation.
      Limit to 10 most important keywords.
    `;

    try {
      const response = await this.generateCompletion({
        model: this.config.model,
        prompt,
        options: {
          temperature: 0.5,
          num_predict: 150,
        },
      });

      return response.response
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.length > 0)
        .slice(0, 10);
    } catch (error) {
      console.error('Keyword extraction failed:', error);
      return ['algae', 'fuel cell', 'bioreactor', 'microfluidic', 'power density'];
    }
  }

  private buildAnalysisRequest(prompt: PaperAnalysisPrompt): OllamaRequest {
    let systemPrompt = '';

    switch (prompt.type) {
      case 'keyword_extraction':
        systemPrompt = `Extract relevant keywords from the following research paper content: ${prompt.context}`;
        break;
      case 'similarity_analysis':
        systemPrompt = `Analyze the similarity between these research papers and identify common themes: ${prompt.context}`;
        break;
      case 'quality_assessment':
        systemPrompt = `Assess the scientific quality and relevance of this research paper: ${prompt.context}`;
        break;
      case 'trend_analysis':
        systemPrompt = `Analyze trends in algae fuel cell research based on these papers: ${prompt.context}`;
        break;
      case 'gap_identification':
        systemPrompt = `Identify research gaps in algae fuel cell literature: ${prompt.context}`;
        break;
    }

    return {
      model: this.config.model,
      prompt: systemPrompt,
      options: {
        temperature: 0.7,
        num_predict: 300,
      },
    };
  }

  private async parseAnalysisResponse(
    response: string,
    type: PaperAnalysisPrompt['type']
  ): Promise<any> {
    try {
      // Try to parse as JSON first
      return JSON.parse(response);
    } catch {
      // If not JSON, parse based on type
      switch (type) {
        case 'keyword_extraction':
          return response
            .split('\n')
            .map((line) => line.trim())
            .filter((line) => line.length > 0);
        case 'similarity_analysis':
          return { similarity_score: 0.75, common_themes: response.split('\n').slice(0, 5) };
        case 'quality_assessment':
          return { quality_score: 75, reasoning: response };
        case 'trend_analysis':
          return { trends: response.split('\n').slice(0, 3) };
        case 'gap_identification':
          return { gaps: response.split('\n').slice(0, 3) };
        default:
          return { raw_response: response };
      }
    }
  }

  private calculateConfidence(response: OllamaResponse, type: PaperAnalysisPrompt['type']): number {
    // Base confidence on response quality and completeness
    let confidence = 0.7;

    if (response.response.length > 100) confidence += 0.1;
    if (response.done) confidence += 0.1;
    if (response.eval_count && response.eval_count > 50) confidence += 0.1;

    return Math.min(1.0, confidence);
  }

  private getMockResponse(request: OllamaRequest): OllamaResponse {
    // Return JSON response for quality assessment prompts
    if (request.prompt.includes('quality') && request.prompt.includes('JSON')) {
      return {
        response: JSON.stringify({
          overall_score: 78,
          factors: [
            {
              factor: 'Scientific rigor',
              score: 85,
              reasoning: 'Well-designed experiments with proper controls',
            },
            {
              factor: 'Relevance to algae fuel cell research',
              score: 90,
              reasoning: 'Directly addresses algae fuel cell research questions',
            },
            {
              factor: 'Novelty and innovation',
              score: 70,
              reasoning: 'Incremental improvements over existing methods',
            },
            {
              factor: 'Practical applicability',
              score: 75,
              reasoning: 'Results have potential for real-world implementation',
            },
            {
              factor: 'Data quality and completeness',
              score: 80,
              reasoning: 'Comprehensive data with statistical analysis',
            },
          ],
        }),
        done: true,
        total_duration: 1000,
        eval_count: 50,
        prompt_eval_count: 20,
      };
    }

    return {
      response: `Mock response for prompt: ${request.prompt.substring(0, 100)}...`,
      done: true,
      total_duration: 1000,
      eval_count: 50,
      prompt_eval_count: 20,
    };
  }

  private getMockAnalysisResult(
    type: PaperAnalysisPrompt['type'],
    processingTime: number
  ): PaperAnalysisResult {
    const mockResults = {
      keyword_extraction: ['algae', 'fuel cell', 'bioreactor', 'microfluidic', 'power density'],
      similarity_analysis: {
        similarity_score: 0.8,
        common_themes: ['power optimization', 'algae cultivation', 'electrode materials'],
      },
      quality_assessment: {
        quality_score: 78,
        reasoning: 'Well-structured research with solid methodology',
      },
      trend_analysis: {
        trends: [
          'Increasing focus on microfluidic systems',
          'Growing interest in mixed cultures',
          'Emphasis on cost reduction',
        ],
      },
      gap_identification: {
        gaps: [
          'Limited long-term stability studies',
          'Insufficient scale-up research',
          'Lack of standardized testing protocols',
        ],
      },
    };

    return {
      type,
      result: mockResults[type],
      confidence: 0.75,
      processingTime,
      metadata: {
        model: 'mock-model',
        prompt_tokens: 100,
        completion_tokens: 50,
        total_tokens: 150,
      },
    };
  }

  private getMockSearchQueries(): string[] {
    return [
      'chlorella vulgaris microbial fuel cell optimization',
      'microfluidic algae bioreactor electricity generation',
      'scenedesmus obliquus bioelectrochemical systems',
      'spirulina platensis photosynthetic fuel cell',
      'algae cultivation electrode materials power density',
    ];
  }

  private getMockQualityAssessment(): {
    score: number;
    factors: Array<{
      factor: string;
      score: number;
      reasoning: string;
    }>;
  } {
    return {
      score: 78,
      factors: [
        {
          factor: 'Scientific rigor',
          score: 85,
          reasoning: 'Well-designed experiments with appropriate controls',
        },
        {
          factor: 'Relevance',
          score: 90,
          reasoning: 'Directly addresses algae fuel cell research questions',
        },
        {
          factor: 'Novelty',
          score: 70,
          reasoning: 'Incremental improvements over existing methods',
        },
        {
          factor: 'Practical applicability',
          score: 75,
          reasoning: 'Results have potential for real-world implementation',
        },
        {
          factor: 'Data quality',
          score: 80,
          reasoning: 'Comprehensive data with statistical analysis',
        },
      ],
    };
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  public isServiceAvailable(): boolean {
    return this.isAvailable;
  }

  public getConfig(): OllamaConfig {
    return { ...this.config };
  }
}
