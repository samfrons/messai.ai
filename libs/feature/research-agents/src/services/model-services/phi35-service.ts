/**
 * Phi3.5 Service - AI Insights and Analysis
 * Handles intelligent analysis and insights generation using Phi3.5 model
 */

import { EnhancedOllamaClient, ModelRequest, ModelResponse } from '../enhanced-ollama-client';

export interface AnalysisTemplate {
  id: string;
  name: string;
  description: string;
  prompt: string;
  outputFormat: 'text' | 'json' | 'structured';
  parameters: {
    temperature: number;
    max_tokens: number;
    stop?: string[];
  };
}

export interface InsightResult {
  insights: string[];
  confidence: number;
  reasoning: string;
  recommendations: string[];
  metadata: {
    analysisType: string;
    processingTime: number;
    model: string;
  };
}

export interface TrendAnalysisResult {
  trends: Array<{
    trend: string;
    significance: number;
    evidence: string[];
    timeframe: string;
  }>;
  emergingTopics: string[];
  decliningTopics: string[];
  keyInsights: string[];
}

export interface GapAnalysisResult {
  identifiedGaps: Array<{
    gap: string;
    category: string;
    priority: 'high' | 'medium' | 'low';
    description: string;
    potentialSolutions: string[];
  }>;
  researchOpportunities: string[];
  methodologicalGaps: string[];
  technicalChallenges: string[];
}

export interface QualityAssessmentResult {
  overallScore: number;
  dimensions: {
    novelty: number;
    methodology: number;
    impact: number;
    clarity: number;
    completeness: number;
  };
  strengths: string[];
  weaknesses: string[];
  improvementSuggestions: string[];
}

export class Phi35Service {
  private client: EnhancedOllamaClient;
  private templates: Map<string, AnalysisTemplate> = new Map();

  constructor(client: EnhancedOllamaClient) {
    this.client = client;
    this.initializeTemplates();
  }

  private initializeTemplates(): void {
    // Paper Insight Generation Template
    this.templates.set('paper_insights', {
      id: 'paper_insights',
      name: 'Paper Insights Generation',
      description: 'Generate key insights from research paper content',
      prompt: `Analyze the following research paper text and provide key insights:

      Research Paper: {input}

      Please provide:
      1. Key scientific insights (3-5 points)
      2. Methodological innovations
      3. Practical applications
      4. Limitations and challenges
      5. Future research directions

      Focus on algae fuel cell research and bioelectrochemical systems.`,
      outputFormat: 'structured',
      parameters: {
        temperature: 0.7,
        max_tokens: 600,
        stop: ['---', 'References:', 'Bibliography:'],
      },
    });

    // Research Trend Analysis Template
    this.templates.set('trend_analysis', {
      id: 'trend_analysis',
      name: 'Research Trend Analysis',
      description: 'Analyze trends in research papers',
      prompt: `Analyze the following collection of research papers and identify key trends:

      Papers: {input}

      Please analyze:
      1. Emerging research trends (identify 3-5 key trends)
      2. Declining research areas
      3. Methodological shifts
      4. Performance improvements over time
      5. Future research directions

      Focus on trends in algae fuel cell research, bioelectrochemical systems, and microfluidics.
      
      Format your response as structured text with clear sections.`,
      outputFormat: 'structured',
      parameters: {
        temperature: 0.6,
        max_tokens: 800,
      },
    });

    // Research Gap Identification Template
    this.templates.set('gap_analysis', {
      id: 'gap_analysis',
      name: 'Research Gap Analysis',
      description: 'Identify gaps in research literature',
      prompt: `Analyze the following research literature and identify research gaps:

      Literature: {input}

      Please identify:
      1. Methodological gaps (missing experimental approaches)
      2. Technical gaps (unexplored technologies or materials)
      3. Application gaps (missing practical applications)
      4. Scale-up gaps (lab to industry challenges)
      5. Interdisciplinary gaps (missing cross-field connections)

      For each gap, provide:
      - Description of the gap
      - Why it's important
      - Potential research directions
      - Priority level (high/medium/low)

      Focus on algae fuel cell research and bioelectrochemical systems.`,
      outputFormat: 'structured',
      parameters: {
        temperature: 0.5,
        max_tokens: 700,
      },
    });

    // Quality Assessment Template
    this.templates.set('quality_assessment', {
      id: 'quality_assessment',
      name: 'Research Quality Assessment',
      description: 'Assess the quality of research papers',
      prompt: `Assess the quality of the following research paper:

      Paper: {input}

      Please evaluate:
      1. Scientific rigor and methodology (score 0-100)
      2. Novelty and innovation (score 0-100)
      3. Practical impact potential (score 0-100)
      4. Clarity and presentation (score 0-100)
      5. Completeness of data and analysis (score 0-100)

      For each dimension, provide:
      - Score and reasoning
      - Strengths
      - Areas for improvement

      Also provide an overall quality score and specific recommendations.`,
      outputFormat: 'structured',
      parameters: {
        temperature: 0.3,
        max_tokens: 500,
      },
    });

    // Comparative Analysis Template
    this.templates.set('comparative_analysis', {
      id: 'comparative_analysis',
      name: 'Comparative Paper Analysis',
      description: 'Compare multiple research papers',
      prompt: `Compare the following research papers:

      Papers: {input}

      Please provide:
      1. Similarities in approach and methodology
      2. Key differences in findings
      3. Complementary aspects
      4. Contradictory results (if any)
      5. Synthesis of findings
      6. Implications for the field

      Focus on algae fuel cell research and identify which approaches show the most promise.`,
      outputFormat: 'structured',
      parameters: {
        temperature: 0.6,
        max_tokens: 600,
      },
    });

    // Innovation Potential Template
    this.templates.set('innovation_potential', {
      id: 'innovation_potential',
      name: 'Innovation Potential Analysis',
      description: 'Analyze innovation potential of research',
      prompt: `Analyze the innovation potential of the following research:

      Research: {input}

      Please assess:
      1. Technical innovation level
      2. Commercial viability potential
      3. Scalability challenges
      4. Market readiness
      5. Competitive advantages
      6. Implementation barriers

      Provide specific recommendations for maximizing innovation impact.`,
      outputFormat: 'structured',
      parameters: {
        temperature: 0.6,
        max_tokens: 500,
      },
    });
  }

  /**
   * Generate insights from research paper content
   */
  async generateInsights(
    paperContent: string,
    analysisType: string = 'paper_insights'
  ): Promise<InsightResult> {
    const template = this.templates.get(analysisType);
    if (!template) {
      throw new Error(`Analysis template ${analysisType} not found`);
    }

    const startTime = Date.now();

    try {
      const prompt = template.prompt.replace('{input}', paperContent);

      const response = await this.client.generateEnhancedCompletion({
        prompt,
        model: 'phi3.5',
        parameters: template.parameters,
      });

      const insights = this.parseInsights(response.response);
      const processingTime = Date.now() - startTime;

      return {
        insights,
        confidence: response.confidence,
        reasoning: response.response,
        recommendations: this.extractRecommendations(response.response),
        metadata: {
          analysisType,
          processingTime,
          model: response.model,
        },
      };
    } catch (error) {
      console.error(`Phi3.5 insight generation failed:`, error);
      throw error;
    }
  }

  /**
   * Analyze trends in research papers
   */
  async analyzeTrends(papers: string[]): Promise<TrendAnalysisResult> {
    const combinedContent = papers.join('\n\n--- PAPER SEPARATOR ---\n\n');

    const response = await this.client.generateEnhancedCompletion({
      prompt: this.templates.get('trend_analysis')!.prompt.replace('{input}', combinedContent),
      model: 'phi3.5',
      parameters: {
        temperature: 0.6,
        max_tokens: 800,
      },
    });

    return this.parseTrendAnalysis(response.response);
  }

  /**
   * Identify research gaps in literature
   */
  async identifyGaps(literatureContent: string): Promise<GapAnalysisResult> {
    const response = await this.client.generateEnhancedCompletion({
      prompt: this.templates.get('gap_analysis')!.prompt.replace('{input}', literatureContent),
      model: 'phi3.5',
      parameters: {
        temperature: 0.5,
        max_tokens: 700,
      },
    });

    return this.parseGapAnalysis(response.response);
  }

  /**
   * Assess research quality
   */
  async assessQuality(paperContent: string): Promise<QualityAssessmentResult> {
    const response = await this.client.generateEnhancedCompletion({
      prompt: this.templates.get('quality_assessment')!.prompt.replace('{input}', paperContent),
      model: 'phi3.5',
      parameters: {
        temperature: 0.3,
        max_tokens: 500,
      },
    });

    return this.parseQualityAssessment(response.response);
  }

  /**
   * Compare multiple papers
   */
  async compareResearch(papers: string[]): Promise<InsightResult> {
    const combinedContent = papers.join('\n\n--- PAPER SEPARATOR ---\n\n');

    return this.generateInsights(combinedContent, 'comparative_analysis');
  }

  /**
   * Analyze innovation potential
   */
  async analyzeInnovationPotential(researchContent: string): Promise<InsightResult> {
    return this.generateInsights(researchContent, 'innovation_potential');
  }

  /**
   * Parse insights from response text
   */
  private parseInsights(responseText: string): string[] {
    const insights: string[] = [];

    // Look for numbered lists or bullet points
    const lines = responseText.split('\n');

    for (const line of lines) {
      const trimmed = line.trim();

      // Match numbered lists (1., 2., etc.)
      if (/^\d+\./.test(trimmed)) {
        insights.push(trimmed.replace(/^\d+\.\s*/, ''));
      }
      // Match bullet points
      else if (/^[-*•]/.test(trimmed)) {
        insights.push(trimmed.replace(/^[-*•]\s*/, ''));
      }
      // Match key insights section
      else if (trimmed && !trimmed.includes(':') && trimmed.length > 20) {
        insights.push(trimmed);
      }
    }

    return insights.filter((insight) => insight.length > 10);
  }

  /**
   * Extract recommendations from response
   */
  private extractRecommendations(responseText: string): string[] {
    const recommendations: string[] = [];
    const lines = responseText.split('\n');

    let inRecommendationSection = false;

    for (const line of lines) {
      const trimmed = line.trim();

      if (
        trimmed.toLowerCase().includes('recommendation') ||
        trimmed.toLowerCase().includes('future') ||
        trimmed.toLowerCase().includes('suggest')
      ) {
        inRecommendationSection = true;
        continue;
      }

      if (inRecommendationSection && trimmed) {
        if (/^\d+\./.test(trimmed) || /^[-*•]/.test(trimmed)) {
          recommendations.push(trimmed.replace(/^[\d\.\-\*•\s]+/, ''));
        }
      }
    }

    return recommendations.filter((rec) => rec.length > 10);
  }

  /**
   * Parse trend analysis response
   */
  private parseTrendAnalysis(responseText: string): TrendAnalysisResult {
    const trends: Array<{
      trend: string;
      significance: number;
      evidence: string[];
      timeframe: string;
    }> = [];

    const emergingTopics: string[] = [];
    const decliningTopics: string[] = [];
    const keyInsights: string[] = [];

    // Simple parsing - in production, this would be more sophisticated
    const lines = responseText.split('\n');

    for (const line of lines) {
      const trimmed = line.trim();

      if (trimmed.toLowerCase().includes('trend') && trimmed.length > 20) {
        trends.push({
          trend: trimmed,
          significance: 0.8, // Default significance
          evidence: [],
          timeframe: 'recent',
        });
      }

      if (trimmed.toLowerCase().includes('emerging')) {
        emergingTopics.push(trimmed);
      }

      if (trimmed.toLowerCase().includes('declining')) {
        decliningTopics.push(trimmed);
      }

      if (trimmed && !trimmed.includes(':') && trimmed.length > 15) {
        keyInsights.push(trimmed);
      }
    }

    return {
      trends,
      emergingTopics,
      decliningTopics,
      keyInsights,
    };
  }

  /**
   * Parse gap analysis response
   */
  private parseGapAnalysis(responseText: string): GapAnalysisResult {
    const identifiedGaps: Array<{
      gap: string;
      category: string;
      priority: 'high' | 'medium' | 'low';
      description: string;
      potentialSolutions: string[];
    }> = [];

    const researchOpportunities: string[] = [];
    const methodologicalGaps: string[] = [];
    const technicalChallenges: string[] = [];

    // Simple parsing - in production, this would be more sophisticated
    const lines = responseText.split('\n');

    for (const line of lines) {
      const trimmed = line.trim();

      if (trimmed.toLowerCase().includes('gap') && trimmed.length > 20) {
        identifiedGaps.push({
          gap: trimmed,
          category: 'general',
          priority: 'medium',
          description: trimmed,
          potentialSolutions: [],
        });
      }

      if (trimmed.toLowerCase().includes('opportunity')) {
        researchOpportunities.push(trimmed);
      }

      if (trimmed.toLowerCase().includes('methodological')) {
        methodologicalGaps.push(trimmed);
      }

      if (
        trimmed.toLowerCase().includes('technical') ||
        trimmed.toLowerCase().includes('challenge')
      ) {
        technicalChallenges.push(trimmed);
      }
    }

    return {
      identifiedGaps,
      researchOpportunities,
      methodologicalGaps,
      technicalChallenges,
    };
  }

  /**
   * Parse quality assessment response
   */
  private parseQualityAssessment(responseText: string): QualityAssessmentResult {
    const dimensions = {
      novelty: 75,
      methodology: 80,
      impact: 70,
      clarity: 85,
      completeness: 75,
    };

    const strengths: string[] = [];
    const weaknesses: string[] = [];
    const improvementSuggestions: string[] = [];

    // Extract scores and feedback from response
    const scorePattern = /(\d+)/g;
    const scores = responseText.match(scorePattern);

    if (scores && scores.length >= 5) {
      dimensions.novelty = parseInt(scores[0]) || 75;
      dimensions.methodology = parseInt(scores[1]) || 80;
      dimensions.impact = parseInt(scores[2]) || 70;
      dimensions.clarity = parseInt(scores[3]) || 85;
      dimensions.completeness = parseInt(scores[4]) || 75;
    }

    const overallScore = Object.values(dimensions).reduce((a, b) => a + b, 0) / 5;

    // Simple parsing of strengths and weaknesses
    const lines = responseText.split('\n');

    for (const line of lines) {
      const trimmed = line.trim();

      if (trimmed.toLowerCase().includes('strength') && trimmed.length > 15) {
        strengths.push(trimmed);
      }

      if (
        trimmed.toLowerCase().includes('weakness') ||
        trimmed.toLowerCase().includes('limitation')
      ) {
        weaknesses.push(trimmed);
      }

      if (trimmed.toLowerCase().includes('improve') || trimmed.toLowerCase().includes('suggest')) {
        improvementSuggestions.push(trimmed);
      }
    }

    return {
      overallScore,
      dimensions,
      strengths,
      weaknesses,
      improvementSuggestions,
    };
  }

  /**
   * Get available analysis templates
   */
  getAvailableTemplates(): AnalysisTemplate[] {
    return Array.from(this.templates.values());
  }

  /**
   * Add custom analysis template
   */
  addTemplate(template: AnalysisTemplate): void {
    this.templates.set(template.id, template);
  }

  /**
   * Remove analysis template
   */
  removeTemplate(templateId: string): boolean {
    return this.templates.delete(templateId);
  }
}
