/**
 * Ollama Paper Expander Sub-Agent
 * Uses Ollama for intelligent paper discovery and database expansion
 */

import { BaseResearchAgent } from '../core/base-agent';
import type { AgentTask, ValidationResult, AgentConfiguration } from '../types/agent.types';
import type { ResearchInsight } from '../types/research.types';

export interface OllamaExpanderInput {
  searchQuery?: string;
  existingPapers?: Array<{
    id: string;
    title: string;
    abstract: string;
    keywords: string[];
  }>;
  expansionType: 'similar_papers' | 'research_gaps' | 'trend_analysis' | 'keyword_expansion';
  filters?: {
    yearRange?: { start: number; end: number };
    maxResults?: number;
    qualityThreshold?: number;
    algaeSpecific?: boolean;
  };
  ollamaSettings?: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
  };
}

export interface OllamaExpanderResult {
  searchQueries: string[];
  recommendedPapers: Array<{
    title: string;
    authors: string;
    abstract: string;
    year: number;
    journal?: string;
    doi?: string;
    url?: string;
    relevanceScore: number;
    validationStatus: 'validated' | 'pending' | 'failed';
    source: 'pubmed' | 'crossref' | 'arxiv' | 'manual';
  }>;
  insights: ResearchInsight[];
  expansionMetrics: {
    totalQueriesGenerated: number;
    totalPapersFound: number;
    validatedPapers: number;
    averageRelevanceScore: number;
    processingTime: number;
  };
  recommendedActions: string[];
}

export interface ExternalPaperSource {
  id: string;
  title: string;
  authors: string;
  abstract: string;
  year: number;
  journal?: string;
  doi?: string;
  url?: string;
  source: 'pubmed' | 'crossref' | 'arxiv';
}

export class OllamaPaperExpander extends BaseResearchAgent {
  constructor(config: AgentConfiguration) {
    super(
      'ollama-paper-expander',
      'Ollama Paper Expander',
      'Uses Ollama for intelligent paper discovery and database expansion',
      ['literature_analysis', 'insight_generation', 'trend_analysis'],
      '1.0.0',
      config
    );
  }

  override validateInput(input: Record<string, any>): ValidationResult {
    const errors: Array<{ field: string; message: string; code: string }> = [];
    const expanderInput = input as OllamaExpanderInput;

    if (!expanderInput.expansionType) {
      errors.push({
        field: 'expansionType',
        message: 'Expansion type is required',
        code: 'MISSING_FIELD',
      });
    }

    const validExpansionTypes = [
      'similar_papers',
      'research_gaps',
      'trend_analysis',
      'keyword_expansion',
    ];
    if (!validExpansionTypes.includes(expanderInput.expansionType)) {
      errors.push({
        field: 'expansionType',
        message: 'Invalid expansion type',
        code: 'INVALID_VALUE',
      });
    }

    if (!expanderInput.searchQuery && !expanderInput.existingPapers) {
      errors.push({
        field: 'input',
        message: 'Must provide either searchQuery or existingPapers',
        code: 'MISSING_INPUT',
      });
    }

    if (expanderInput.filters?.maxResults && expanderInput.filters.maxResults > 200) {
      errors.push({
        field: 'filters.maxResults',
        message: 'Maximum results cannot exceed 200',
        code: 'INVALID_LIMIT',
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  override async executeTask(task: AgentTask): Promise<Record<string, any>> {
    const input = task.input as OllamaExpanderInput;
    const startTime = Date.now();

    let result: OllamaExpanderResult;

    switch (input.expansionType) {
      case 'similar_papers':
        result = await this.findSimilarPapers(input);
        break;
      case 'research_gaps':
        result = await this.identifyResearchGaps(input);
        break;
      case 'trend_analysis':
        result = await this.analyzeTrends(input);
        break;
      case 'keyword_expansion':
        result = await this.expandKeywords(input);
        break;
      default:
        throw new Error(`Unsupported expansion type: ${input.expansionType}`);
    }

    result.expansionMetrics.processingTime = Date.now() - startTime;

    return {
      expansionResult: result,
      processingType: input.expansionType,
      validationSummary: this.generateValidationSummary(result),
    };
  }

  private async findSimilarPapers(input: OllamaExpanderInput): Promise<OllamaExpanderResult> {
    // Generate search queries using Ollama
    const searchQueries = await this.generateSearchQueriesWithOllama(input);

    // Search external databases
    const foundPapers = await this.searchExternalDatabases(searchQueries, input.filters);

    // Validate papers
    const validatedPapers = await this.validatePapers(foundPapers);

    // Generate insights
    const insights = await this.generateInsights(validatedPapers, 'similar_papers');

    return {
      searchQueries,
      recommendedPapers: validatedPapers,
      insights,
      expansionMetrics: {
        totalQueriesGenerated: searchQueries.length,
        totalPapersFound: foundPapers.length,
        validatedPapers: validatedPapers.filter((p) => p.validationStatus === 'validated').length,
        averageRelevanceScore: this.calculateAverageRelevance(validatedPapers),
        processingTime: 0, // Will be set by caller
      },
      recommendedActions: this.generateRecommendations(validatedPapers),
    };
  }

  private async identifyResearchGaps(input: OllamaExpanderInput): Promise<OllamaExpanderResult> {
    // Analyze existing papers to identify gaps
    const gapAnalysis = await this.analyzeResearchGaps(input.existingPapers || []);

    // Generate search queries for gap-filling papers
    const searchQueries = await this.generateGapFillingQueries(gapAnalysis);

    // Search for papers that might fill these gaps
    const foundPapers = await this.searchExternalDatabases(searchQueries, input.filters);

    // Validate papers
    const validatedPapers = await this.validatePapers(foundPapers);

    // Generate gap-related insights
    const insights = await this.generateInsights(validatedPapers, 'research_gaps');

    return {
      searchQueries,
      recommendedPapers: validatedPapers,
      insights,
      expansionMetrics: {
        totalQueriesGenerated: searchQueries.length,
        totalPapersFound: foundPapers.length,
        validatedPapers: validatedPapers.filter((p) => p.validationStatus === 'validated').length,
        averageRelevanceScore: this.calculateAverageRelevance(validatedPapers),
        processingTime: 0,
      },
      recommendedActions: this.generateRecommendations(validatedPapers),
    };
  }

  private async analyzeTrends(input: OllamaExpanderInput): Promise<OllamaExpanderResult> {
    // Analyze trends in existing papers
    const trendAnalysis = await this.analyzePaperTrends(input.existingPapers || []);

    // Generate queries for trend-related papers
    const searchQueries = await this.generateTrendBasedQueries(trendAnalysis);

    // Search for papers
    const foundPapers = await this.searchExternalDatabases(searchQueries, input.filters);

    // Validate papers
    const validatedPapers = await this.validatePapers(foundPapers);

    // Generate trend insights
    const insights = await this.generateInsights(validatedPapers, 'trend_analysis');

    return {
      searchQueries,
      recommendedPapers: validatedPapers,
      insights,
      expansionMetrics: {
        totalQueriesGenerated: searchQueries.length,
        totalPapersFound: foundPapers.length,
        validatedPapers: validatedPapers.filter((p) => p.validationStatus === 'validated').length,
        averageRelevanceScore: this.calculateAverageRelevance(validatedPapers),
        processingTime: 0,
      },
      recommendedActions: this.generateRecommendations(validatedPapers),
    };
  }

  private async expandKeywords(input: OllamaExpanderInput): Promise<OllamaExpanderResult> {
    // Expand keywords using Ollama
    const expandedKeywords = await this.expandKeywordsWithOllama(input);

    // Generate search queries from expanded keywords
    const searchQueries = expandedKeywords.map((keyword) => `${keyword} algae fuel cell`);

    // Search external databases
    const foundPapers = await this.searchExternalDatabases(searchQueries, input.filters);

    // Validate papers
    const validatedPapers = await this.validatePapers(foundPapers);

    // Generate insights
    const insights = await this.generateInsights(validatedPapers, 'keyword_expansion');

    return {
      searchQueries,
      recommendedPapers: validatedPapers,
      insights,
      expansionMetrics: {
        totalQueriesGenerated: searchQueries.length,
        totalPapersFound: foundPapers.length,
        validatedPapers: validatedPapers.filter((p) => p.validationStatus === 'validated').length,
        averageRelevanceScore: this.calculateAverageRelevance(validatedPapers),
        processingTime: 0,
      },
      recommendedActions: this.generateRecommendations(validatedPapers),
    };
  }

  private async generateSearchQueriesWithOllama(input: OllamaExpanderInput): Promise<string[]> {
    // Mock Ollama interaction - in real implementation, use Ollama API
    const baseQuery = input.searchQuery || 'algae fuel cell';

    const ollamaPrompt = `
      Given the search query "${baseQuery}" for algae fuel cell and bioreactor research,
      generate 5 diverse search queries that would find related high-quality papers.
      Focus on:
      1. Different algae species
      2. Various fuel cell types
      3. Different bioreactor configurations
      4. Performance optimization techniques
      5. Novel materials and methods
    `;

    // Mock response - in real implementation, call Ollama API
    return [
      'chlorella vulgaris microbial fuel cell performance optimization',
      'microfluidic algae bioreactor design electricity generation',
      'scenedesmus obliquus bioelectrochemical systems power density',
      'spirulina platensis fuel cell electrode materials',
      'dunaliella salina photosynthetic microbial fuel cell',
    ];
  }

  private async searchExternalDatabases(
    queries: string[],
    filters?: OllamaExpanderInput['filters']
  ): Promise<ExternalPaperSource[]> {
    const papers: ExternalPaperSource[] = [];

    for (const query of queries) {
      // Mock external database search - in real implementation, use actual APIs
      const mockPapers = await this.mockExternalSearch(query, filters);
      papers.push(...mockPapers);
    }

    // Remove duplicates by DOI
    const uniquePapers = papers.filter(
      (paper, index, self) =>
        index === self.findIndex((p) => p.doi === paper.doi && p.doi !== undefined)
    );

    return uniquePapers.slice(0, filters?.maxResults || 50);
  }

  private async mockExternalSearch(
    query: string,
    filters?: OllamaExpanderInput['filters']
  ): Promise<ExternalPaperSource[]> {
    // Mock implementation - in real version, use PubMed, CrossRef, arXiv APIs
    return [
      {
        id: `pubmed-${Date.now()}`,
        title: 'Enhanced Power Generation in Algae-Based Microbial Fuel Cells',
        authors: 'Chen, L., Wang, X., Liu, Y.',
        abstract: 'This study investigates the optimization of algae-based microbial fuel cells...',
        year: 2023,
        journal: 'Applied Energy',
        doi: `10.1016/j.apenergy.2023.${Math.random().toString(36).substr(2, 6)}`,
        url: 'https://example.com/paper1',
        source: 'pubmed',
      },
      {
        id: `crossref-${Date.now()}`,
        title: 'Microfluidic Algae Bioreactor for Sustainable Energy Production',
        authors: 'Smith, J., Johnson, A.',
        abstract: 'Novel microfluidic design for algae cultivation and energy harvesting...',
        year: 2022,
        journal: 'Energy & Environmental Science',
        doi: `10.1039/d2ee${Math.random().toString(36).substr(2, 6)}`,
        url: 'https://example.com/paper2',
        source: 'crossref',
      },
    ];
  }

  private async validatePapers(
    papers: ExternalPaperSource[]
  ): Promise<OllamaExpanderResult['recommendedPapers']> {
    const validatedPapers = [];

    for (const paper of papers) {
      const relevanceScore = await this.calculateRelevanceScore(paper);
      const validationStatus = await this.validatePaperExists(paper);

      validatedPapers.push({
        title: paper.title,
        authors: paper.authors,
        abstract: paper.abstract,
        year: paper.year,
        journal: paper.journal,
        doi: paper.doi,
        url: paper.url,
        relevanceScore,
        validationStatus,
        source: paper.source,
      });
    }

    return validatedPapers;
  }

  private async calculateRelevanceScore(paper: ExternalPaperSource): Promise<number> {
    const algaeKeywords = ['algae', 'microalgae', 'chlorella', 'scenedesmus', 'spirulina'];
    const fuelCellKeywords = ['fuel cell', 'microbial fuel cell', 'MFC', 'bioelectrochemical'];
    const bioreactorKeywords = ['bioreactor', 'photobioreactor', 'cultivation', 'microfluidic'];

    const text = `${paper.title} ${paper.abstract}`.toLowerCase();

    let score = 0;
    algaeKeywords.forEach((keyword) => {
      if (text.includes(keyword)) score += 20;
    });
    fuelCellKeywords.forEach((keyword) => {
      if (text.includes(keyword)) score += 25;
    });
    bioreactorKeywords.forEach((keyword) => {
      if (text.includes(keyword)) score += 15;
    });

    // Boost score for recent papers
    const currentYear = new Date().getFullYear();
    if (paper.year >= currentYear - 2) score += 10;
    else if (paper.year >= currentYear - 5) score += 5;

    return Math.min(100, score);
  }

  private async validatePaperExists(
    paper: ExternalPaperSource
  ): Promise<'validated' | 'pending' | 'failed'> {
    // Mock validation - in real implementation, verify paper exists in original source
    if (paper.doi && paper.doi.includes('10.')) {
      return 'validated';
    }
    return 'pending';
  }

  private async analyzeResearchGaps(_papers: Array<any>): Promise<string[]> {
    // Mock gap analysis - in real implementation, use AI to analyze gaps
    return [
      'Limited studies on long-term stability',
      'Insufficient data on scale-up potential',
      'Gap in cost-effectiveness analysis',
      'Limited comparison between algae species',
    ];
  }

  private async generateGapFillingQueries(gaps: string[]): Promise<string[]> {
    return gaps.map((gap) => `algae fuel cell ${gap.toLowerCase().replace(/\s+/g, ' ')}`);
  }

  private async analyzePaperTrends(_papers: Array<any>): Promise<string[]> {
    // Mock trend analysis - in real implementation, use AI to analyze trends
    return [
      'Increasing focus on microfluidic designs',
      'Growing interest in mixed algae cultures',
      'Trend toward integrated bioreactor-fuel cell systems',
      'Emphasis on sustainable electrode materials',
    ];
  }

  private async generateTrendBasedQueries(trends: string[]): Promise<string[]> {
    return trends.map((trend) => `${trend.toLowerCase()} algae fuel cell`);
  }

  private async expandKeywordsWithOllama(input: OllamaExpanderInput): Promise<string[]> {
    // Mock keyword expansion - in real implementation, use Ollama API
    return [
      'photosynthetic bacteria',
      'cyanobacteria',
      'biofilm formation',
      'electron transport',
      'biomass conversion',
      'renewable energy',
    ];
  }

  private async generateInsights(
    papers: OllamaExpanderResult['recommendedPapers'],
    type: string
  ): Promise<ResearchInsight[]> {
    // Mock insight generation - in real implementation, use AI to generate insights
    const insight: ResearchInsight = {
      id: `insight-${Date.now()}`,
      type: 'trend',
      title: `Emerging trends in ${type}`,
      description: `Analysis of ${papers.length} papers reveals new opportunities in algae fuel cell research`,
      significance: 'medium',
      confidence: 0.75,
      evidence: papers.slice(0, 3).map((paper) => ({
        paperId: paper.doi || `paper-${Date.now()}`,
        title: paper.title,
        relevance: paper.relevanceScore / 100,
      })),
      actionable: true,
      recommendations: [
        'Focus on high-relevance papers for detailed analysis',
        'Investigate gaps in current research',
        'Consider collaboration opportunities',
      ],
      createdAt: new Date(),
      generatedBy: 'ollama-paper-expander',
    };

    return [insight];
  }

  private calculateAverageRelevance(papers: OllamaExpanderResult['recommendedPapers']): number {
    if (papers.length === 0) return 0;
    const total = papers.reduce((sum, paper) => sum + paper.relevanceScore, 0);
    return total / papers.length;
  }

  private generateRecommendations(papers: OllamaExpanderResult['recommendedPapers']): string[] {
    const recommendations = [];

    const highQualityPapers = papers.filter((p) => p.relevanceScore > 80);
    if (highQualityPapers.length > 0) {
      recommendations.push(
        `Prioritize ${highQualityPapers.length} high-relevance papers for immediate processing`
      );
    }

    const unvalidatedPapers = papers.filter((p) => p.validationStatus === 'pending');
    if (unvalidatedPapers.length > 0) {
      recommendations.push(`Validate ${unvalidatedPapers.length} papers before adding to database`);
    }

    const recentPapers = papers.filter((p) => p.year >= new Date().getFullYear() - 2);
    if (recentPapers.length > 0) {
      recommendations.push(`Focus on ${recentPapers.length} recent papers for current trends`);
    }

    return recommendations;
  }

  private generateValidationSummary(result: OllamaExpanderResult): Record<string, any> {
    return {
      totalPapers: result.recommendedPapers.length,
      validatedPapers: result.recommendedPapers.filter((p) => p.validationStatus === 'validated')
        .length,
      averageRelevance: result.expansionMetrics.averageRelevanceScore,
      highQualityPapers: result.recommendedPapers.filter((p) => p.relevanceScore > 80).length,
      recommendationsCount: result.recommendedActions.length,
    };
  }
}
