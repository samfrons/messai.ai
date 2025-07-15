/**
 * Literature Analysis Sub-Agent
 * Performs automated literature review, gap analysis, and research trend identification
 */

import { BaseResearchAgent } from '../core/base-agent';
import type {
  AgentTask,
  AgentCapability,
  ValidationResult,
  AgentConfiguration,
} from '../types/agent.types';
import type {
  PaperAnalysisInput,
  PaperAnalysisResult,
  TrendAnalysis,
  ResearchGap,
  PaperConnection,
} from '../types/research.types';

export class LiteratureAnalyzer extends BaseResearchAgent {
  constructor(config: AgentConfiguration) {
    super(
      'literature-analyzer',
      'Literature Analysis Agent',
      'Performs automated literature review, gap analysis, and research trend identification',
      ['literature_analysis'],
      '1.0.0',
      config
    );
  }

  validateInput(input: Record<string, any>): ValidationResult {
    const errors: Array<{ field: string; message: string; code: string }> = [];

    const analysisInput = input as PaperAnalysisInput;

    if (!analysisInput.analysisType) {
      errors.push({
        field: 'analysisType',
        message: 'Analysis type is required',
        code: 'MISSING_FIELD',
      });
    }

    if (
      !['summary', 'trends', 'gaps', 'connections', 'performance'].includes(
        analysisInput.analysisType
      )
    ) {
      errors.push({
        field: 'analysisType',
        message: 'Invalid analysis type',
        code: 'INVALID_VALUE',
      });
    }

    if (!analysisInput.paperId && !analysisInput.paperIds && !analysisInput.filters) {
      errors.push({
        field: 'input',
        message: 'Must provide either paperId, paperIds, or filters',
        code: 'MISSING_SCOPE',
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  protected async executeTask(task: AgentTask): Promise<Record<string, any>> {
    const input = task.input as PaperAnalysisInput;

    this.log('info', `Starting literature analysis: ${input.analysisType}`, {
      paperId: input.paperId,
      paperCount: input.paperIds?.length,
      filters: input.filters,
    });

    let result: PaperAnalysisResult;

    switch (input.analysisType) {
      case 'summary':
        result = await this.generateSummary(input);
        break;
      case 'trends':
        result = await this.analyzeTrends(input);
        break;
      case 'gaps':
        result = await this.identifyGaps(input);
        break;
      case 'connections':
        result = await this.findConnections(input);
        break;
      case 'performance':
        result = await this.analyzePerformance(input);
        break;
      default:
        throw new Error(`Unsupported analysis type: ${input.analysisType}`);
    }

    return {
      ...result,
      tokensUsed: this.estimateTokenUsage(input),
      confidence: result.confidence,
    };
  }

  private async generateSummary(input: PaperAnalysisInput): Promise<PaperAnalysisResult> {
    // In a real implementation, this would:
    // 1. Query the database for papers based on input criteria
    // 2. Use LLM to generate summaries
    // 3. Extract key findings and insights

    this.log('info', 'Generating literature summary');

    // Mock implementation for demonstration
    const mockSummary = `
      Analysis of ${input.paperIds?.length || 'filtered'} papers reveals significant 
      advances in microbial electrochemical systems. Key themes include improved 
      electrode materials, enhanced microbial communities, and novel reactor designs.
      
      Major findings:
      - Carbon-based electrode materials show 40% improvement in power density
      - Mixed microbial communities outperform pure cultures by 25%
      - Miniaturized reactors enable new applications in IoT sensing
      
      Research focus has shifted toward practical applications and scale-up challenges.
    `;

    const keyFindings = [
      'Carbon-based electrodes demonstrate superior performance',
      'Mixed microbial communities are more resilient and efficient',
      'Miniaturization enables new application domains',
      'Scale-up remains a significant technical challenge',
      'Environmental factors critically impact performance',
    ];

    return {
      paperId: input.paperId,
      insights: {
        summary: mockSummary.trim(),
        keyFindings,
      },
      confidence: 0.85,
      sources: input.paperIds || [],
    };
  }

  private async analyzeTrends(input: PaperAnalysisInput): Promise<PaperAnalysisResult> {
    this.log('info', 'Analyzing research trends');

    // Mock trend analysis - in production this would use sophisticated NLP and ML
    const trends: TrendAnalysis[] = [
      {
        category: 'material',
        trend: 'Increasing adoption of graphene-based electrode materials',
        direction: 'increasing',
        confidence: 0.92,
        timeframe: {
          start: new Date('2020-01-01'),
          end: new Date('2024-12-31'),
        },
        evidence: [
          {
            paperId: 'paper-1',
            title: 'Graphene electrodes in microbial fuel cells',
            relevance: 0.95,
          },
          {
            paperId: 'paper-2',
            title: 'Enhanced performance with graphene oxide',
            relevance: 0.88,
          },
        ],
      },
      {
        category: 'performance',
        trend: 'Power density improvements plateauing',
        direction: 'stable',
        confidence: 0.78,
        timeframe: {
          start: new Date('2022-01-01'),
          end: new Date('2024-12-31'),
        },
        evidence: [
          {
            paperId: 'paper-3',
            title: 'Limits of current MFC designs',
            relevance: 0.82,
          },
        ],
      },
      {
        category: 'application',
        trend: 'Growing interest in waste-to-energy applications',
        direction: 'increasing',
        confidence: 0.87,
        timeframe: {
          start: new Date('2021-01-01'),
          end: new Date('2024-12-31'),
        },
        evidence: [
          {
            paperId: 'paper-4',
            title: 'MFC for municipal wastewater treatment',
            relevance: 0.91,
          },
        ],
      },
    ];

    return {
      paperId: input.paperId,
      insights: {
        trends,
        keyFindings: trends.map((t) => t.trend),
      },
      confidence: 0.82,
      sources: trends.flatMap((t) => t.evidence.map((e) => e.paperId)),
    };
  }

  private async identifyGaps(input: PaperAnalysisInput): Promise<PaperAnalysisResult> {
    this.log('info', 'Identifying research gaps');

    // Mock gap analysis
    const gaps: ResearchGap[] = [
      {
        id: 'gap-1',
        description: 'Limited long-term stability studies for microbial communities',
        category: 'methodology',
        priority: 'high',
        evidence: {
          missingConnections: 15,
          potentialImpact: 0.85,
          researchVolume: 0.23,
        },
        suggestedResearch: [
          'Longitudinal studies of microbial community evolution',
          'Standardized protocols for community stability assessment',
          'Investigation of factors affecting community resilience',
        ],
      },
      {
        id: 'gap-2',
        description: 'Insufficient research on cold-climate MFC performance',
        category: 'application',
        priority: 'medium',
        evidence: {
          missingConnections: 8,
          potentialImpact: 0.62,
          researchVolume: 0.05,
        },
        suggestedResearch: [
          'Low-temperature MFC operation studies',
          'Cold-adapted microbial community development',
          'Thermal management strategies for cold climates',
        ],
      },
    ];

    return {
      paperId: input.paperId,
      insights: {
        gaps,
        keyFindings: gaps.map((g) => g.description),
      },
      confidence: 0.79,
      sources: [],
    };
  }

  private async findConnections(input: PaperAnalysisInput): Promise<PaperAnalysisResult> {
    this.log('info', 'Finding paper connections');

    // Mock connection analysis
    const connections: PaperConnection[] = [
      {
        sourceId: 'paper-1',
        targetId: 'paper-2',
        connectionType: 'similar_methods',
        strength: 0.87,
        explanation: 'Both papers use similar electrode fabrication techniques',
      },
      {
        sourceId: 'paper-1',
        targetId: 'paper-3',
        connectionType: 'complementary',
        strength: 0.72,
        explanation: 'Paper 3 provides theoretical framework for Paper 1 experimental results',
      },
      {
        sourceId: 'paper-4',
        targetId: 'paper-5',
        connectionType: 'contradictory',
        strength: 0.65,
        explanation: 'Conflicting results on optimal pH range for maximum power output',
      },
    ];

    return {
      paperId: input.paperId,
      insights: {
        connections,
        keyFindings: connections.map((c) => c.explanation),
      },
      confidence: 0.81,
      sources: connections.flatMap((c) => [c.sourceId, c.targetId]),
    };
  }

  private async analyzePerformance(input: PaperAnalysisInput): Promise<PaperAnalysisResult> {
    this.log('info', 'Analyzing performance metrics');

    // Mock performance analysis
    const performanceMetrics = {
      powerDensity: {
        value: 1250,
        unit: 'mW/m²',
        confidence: 0.88,
      },
      currentDensity: {
        value: 3.2,
        unit: 'A/m²',
        confidence: 0.84,
      },
      efficiency: {
        value: 18.5,
        unit: '%',
        confidence: 0.76,
      },
      materials: [
        {
          type: 'anode' as const,
          material: 'carbon cloth',
          confidence: 0.92,
        },
        {
          type: 'cathode' as const,
          material: 'platinum-coated carbon',
          confidence: 0.89,
        },
      ],
    };

    const keyFindings = [
      `Average power density: ${performanceMetrics.powerDensity.value} ${performanceMetrics.powerDensity.unit}`,
      `Peak current density: ${performanceMetrics.currentDensity.value} ${performanceMetrics.currentDensity.unit}`,
      `Coulombic efficiency: ${performanceMetrics.efficiency.value}${performanceMetrics.efficiency.unit}`,
      'Carbon cloth anodes consistently outperform alternatives',
      'Platinum catalysts significantly improve cathode performance',
    ];

    return {
      paperId: input.paperId,
      insights: {
        performance: performanceMetrics,
        keyFindings,
      },
      confidence: 0.83,
      sources: input.paperIds || [],
    };
  }

  private estimateTokenUsage(input: PaperAnalysisInput): number {
    // Rough estimation based on analysis type and scope
    const baseTokens = 500;
    const paperCount = input.paperIds?.length || 10;

    const multipliers = {
      summary: 1.5,
      trends: 2.0,
      gaps: 1.8,
      connections: 1.3,
      performance: 1.2,
    };

    return Math.floor(
      baseTokens * (multipliers[input.analysisType] || 1.0) * Math.log(paperCount + 1)
    );
  }
}
