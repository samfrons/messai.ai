/**
 * Algae Paper Processing Workflow
 * Orchestrates dual sub-agent coordination for MESS paper processing and expansion
 */

import { ResearchOrchestrator } from '../core/orchestrator';
import { AlgaePaperProcessor } from '../agents/algae-paper-processor';
import { OllamaPaperExpander } from '../agents/ollama-paper-expander';
import { ExternalAPIService } from '../services/external-apis';
import { PaperValidator } from '../services/paper-validator';
import { OllamaService } from '../services/ollama-service';
import type {
  ResearchWorkflow,
  WorkflowResult,
  AgentConfiguration,
  AgentTask,
  AgentResult,
} from '../types/agent.types';

export interface AlgaeWorkflowConfig {
  processMESSPapers: boolean;
  expandDatabase: boolean;
  targetExpansionCount: number;
  validationStrictness: 'low' | 'medium' | 'high';
  enableRealTimeUpdates: boolean;
  parallelProcessing: boolean;
  maxConcurrentTasks: number;
}

export interface AlgaeWorkflowResult {
  workflowId: string;
  status: 'completed' | 'failed' | 'partial';
  phases: {
    messProcessing?: {
      status: 'completed' | 'failed' | 'skipped';
      processedPapers: number;
      processingTime: number;
      errors?: string[];
    };
    databaseExpansion?: {
      status: 'completed' | 'failed' | 'skipped';
      addedPapers: number;
      searchQueries: number;
      processingTime: number;
      errors?: string[];
    };
    validation?: {
      status: 'completed' | 'failed' | 'skipped';
      validatedPapers: number;
      rejectedPapers: number;
      averageQuality: number;
      processingTime: number;
      errors?: string[];
    };
  };
  totalPapersAdded: number;
  totalProcessingTime: number;
  qualityMetrics: {
    averageQualityScore: number;
    averageRelevanceScore: number;
    validationSuccessRate: number;
  };
  recommendations: string[];
}

export class AlgaePaperWorkflow {
  private orchestrator: ResearchOrchestrator;
  private algaeProcessor: AlgaePaperProcessor;
  private paperExpander: OllamaPaperExpander;
  private externalAPI: ExternalAPIService;
  private validator: PaperValidator;
  private ollama: OllamaService;
  private config: AlgaeWorkflowConfig;

  constructor(config: Partial<AlgaeWorkflowConfig> = {}) {
    this.config = {
      processMESSPapers: true,
      expandDatabase: true,
      targetExpansionCount: 100,
      validationStrictness: 'medium',
      enableRealTimeUpdates: true,
      parallelProcessing: true,
      maxConcurrentTasks: 5,
      ...config,
    };

    this.initializeServices();
    this.setupOrchestrator();
  }

  private initializeServices(): void {
    // Initialize core services
    this.externalAPI = new ExternalAPIService();
    this.ollama = new OllamaService();

    // Configure validator based on strictness
    const validationConfig = this.getValidationConfig();
    this.validator = new PaperValidator(validationConfig, this.externalAPI, this.ollama);

    // Configure agents
    const agentConfig = this.getAgentConfig();
    this.algaeProcessor = new AlgaePaperProcessor(agentConfig);
    this.paperExpander = new OllamaPaperExpander(agentConfig);
  }

  private getValidationConfig() {
    const strictnessConfigs = {
      low: {
        minQualityScore: 60,
        requireDOI: false,
        algaeRelevanceThreshold: 50,
        strictMode: false,
      },
      medium: {
        minQualityScore: 75,
        requireDOI: true,
        algaeRelevanceThreshold: 70,
        strictMode: false,
      },
      high: {
        minQualityScore: 85,
        requireDOI: true,
        algaeRelevanceThreshold: 80,
        strictMode: true,
      },
    };

    return {
      ...strictnessConfigs[this.config.validationStrictness],
      requireAbstract: true,
      enableExternalValidation: true,
      enableAIValidation: true,
    };
  }

  private getAgentConfig(): AgentConfiguration {
    return {
      id: 'algae-workflow-agent',
      maxConcurrentTasks: this.config.maxConcurrentTasks,
      timeoutMs: 180000, // 3 minutes per task
      retryPolicy: {
        maxRetries: 3,
        backoffMs: 2000,
      },
      resourceLimits: {
        maxMemoryMb: 1024,
        maxTokens: 8000,
      },
      capabilities: [
        'paper_processing',
        'data_enhancement',
        'literature_analysis',
        'insight_generation',
      ],
    };
  }

  private setupOrchestrator(): void {
    this.orchestrator = new ResearchOrchestrator();
    this.orchestrator.registerAgent(this.algaeProcessor);
    this.orchestrator.registerAgent(this.paperExpander);
  }

  async initialize(): Promise<void> {
    console.log('🔧 Initializing Algae Paper Workflow...');

    await this.ollama.initialize();

    console.log('✅ Algae Paper Workflow initialized successfully');
  }

  async execute(): Promise<AlgaeWorkflowResult> {
    console.log('🚀 Starting Algae Paper Processing Workflow...');

    const startTime = Date.now();
    const workflowId = `algae-workflow-${Date.now()}`;

    const result: AlgaeWorkflowResult = {
      workflowId,
      status: 'completed',
      phases: {},
      totalPapersAdded: 0,
      totalProcessingTime: 0,
      qualityMetrics: {
        averageQualityScore: 0,
        averageRelevanceScore: 0,
        validationSuccessRate: 0,
      },
      recommendations: [],
    };

    try {
      // Build workflow
      const workflow = await this.buildWorkflow(workflowId);

      // Execute workflow
      const workflowResult = await this.orchestrator.executeWorkflow(workflow);

      // Process results
      await this.processWorkflowResults(workflowResult, result);

      result.totalProcessingTime = Date.now() - startTime;

      // Generate recommendations
      result.recommendations = this.generateRecommendations(result);

      console.log('✅ Algae Paper Workflow completed successfully');
      this.printWorkflowSummary(result);

      return result;
    } catch (error) {
      console.error('❌ Algae Paper Workflow failed:', error);
      result.status = 'failed';
      result.totalProcessingTime = Date.now() - startTime;
      return result;
    }
  }

  private async buildWorkflow(workflowId: string): Promise<ResearchWorkflow> {
    const steps = [];

    // Phase 1: MESS Papers Processing
    if (this.config.processMESSPapers) {
      steps.push({
        agentId: this.algaeProcessor.id,
        task: {
          id: `mess-processing-${Date.now()}`,
          type: 'paper_processing',
          priority: 'high',
          input: {
            phase: 'mess_processing',
            enableValidation: true,
            processingOptions: {
              extractMetrics: true,
              validateSources: true,
              generateTags: true,
              analyzeBioreactor: true,
            },
          },
        } as AgentTask,
        dependencies: [],
        retryPolicy: {
          maxRetries: 2,
          backoffMs: 1000,
        },
      });
    }

    // Phase 2: Database Expansion (can run in parallel with MESS processing)
    if (this.config.expandDatabase) {
      steps.push({
        agentId: this.paperExpander.id,
        task: {
          id: `expansion-${Date.now()}`,
          type: 'literature_analysis',
          priority: 'medium',
          input: {
            phase: 'database_expansion',
            targetCount: this.config.targetExpansionCount,
            expansionStrategies: [
              'similar_papers',
              'research_gaps',
              'trend_analysis',
              'keyword_expansion',
            ],
            validationEnabled: true,
          },
        } as AgentTask,
        dependencies: this.config.parallelProcessing ? [] : [steps[0]?.task.id].filter(Boolean),
        retryPolicy: {
          maxRetries: 3,
          backoffMs: 2000,
        },
      });
    }

    // Phase 3: Final Validation and Quality Assessment
    steps.push({
      agentId: this.algaeProcessor.id,
      task: {
        id: `validation-${Date.now()}`,
        type: 'data_enhancement',
        priority: 'high',
        input: {
          phase: 'final_validation',
          validationStrictness: this.config.validationStrictness,
          generateQualityReport: true,
        },
      } as AgentTask,
      dependencies: steps.map((step) => step.task.id),
      retryPolicy: {
        maxRetries: 1,
        backoffMs: 500,
      },
    });

    return {
      id: workflowId,
      name: 'Algae Paper Processing Workflow',
      description: 'Dual sub-agent workflow for processing MESS papers and expanding the database',
      steps,
      metadata: {
        createdBy: 'algae-workflow-system',
        createdAt: new Date(),
        estimatedDuration: 600000, // 10 minutes
      },
    };
  }

  private async processWorkflowResults(
    workflowResult: WorkflowResult,
    result: AlgaeWorkflowResult
  ): Promise<void> {
    for (const agentResult of workflowResult.results) {
      const phase = agentResult.output.phase;

      switch (phase) {
        case 'mess_processing':
          result.phases.messProcessing = {
            status: agentResult.status === 'success' ? 'completed' : 'failed',
            processedPapers: agentResult.output.processedPapers || 0,
            processingTime: agentResult.metadata.duration,
            errors: agentResult.error ? [agentResult.error.message] : undefined,
          };
          result.totalPapersAdded += agentResult.output.processedPapers || 0;
          break;

        case 'database_expansion':
          result.phases.databaseExpansion = {
            status: agentResult.status === 'success' ? 'completed' : 'failed',
            addedPapers: agentResult.output.addedPapers || 0,
            searchQueries: agentResult.output.searchQueries || 0,
            processingTime: agentResult.metadata.duration,
            errors: agentResult.error ? [agentResult.error.message] : undefined,
          };
          result.totalPapersAdded += agentResult.output.addedPapers || 0;
          break;

        case 'final_validation':
          result.phases.validation = {
            status: agentResult.status === 'success' ? 'completed' : 'failed',
            validatedPapers: agentResult.output.validatedPapers || 0,
            rejectedPapers: agentResult.output.rejectedPapers || 0,
            averageQuality: agentResult.output.averageQuality || 0,
            processingTime: agentResult.metadata.duration,
            errors: agentResult.error ? [agentResult.error.message] : undefined,
          };

          // Update quality metrics
          result.qualityMetrics = {
            averageQualityScore: agentResult.output.averageQuality || 0,
            averageRelevanceScore: agentResult.output.averageRelevance || 0,
            validationSuccessRate: agentResult.output.validationSuccessRate || 0,
          };
          break;
      }
    }

    // Determine overall status
    const hasFailures = Object.values(result.phases).some((phase) => phase?.status === 'failed');
    const hasCompletions = Object.values(result.phases).some(
      (phase) => phase?.status === 'completed'
    );

    if (hasFailures && hasCompletions) {
      result.status = 'partial';
    } else if (hasFailures) {
      result.status = 'failed';
    } else {
      result.status = 'completed';
    }
  }

  private generateRecommendations(result: AlgaeWorkflowResult): string[] {
    const recommendations = [];

    // Quality-based recommendations
    if (result.qualityMetrics.averageQualityScore < 70) {
      recommendations.push('Consider increasing validation strictness to improve paper quality');
    }

    if (result.qualityMetrics.validationSuccessRate < 80) {
      recommendations.push(
        'Review validation criteria - high rejection rate may indicate overly strict rules'
      );
    }

    // Performance-based recommendations
    if (result.totalProcessingTime > 600000) {
      // 10 minutes
      recommendations.push('Consider optimizing workflow for better performance');
    }

    // Coverage-based recommendations
    if (result.totalPapersAdded < 50) {
      recommendations.push('Expand search strategies to find more relevant papers');
    }

    // Phase-specific recommendations
    if (result.phases.messProcessing?.status === 'failed') {
      recommendations.push('Review MESS paper processing errors and improve PDF extraction');
    }

    if (result.phases.databaseExpansion?.status === 'failed') {
      recommendations.push('Check external API connectivity and rate limits');
    }

    // Success-based recommendations
    if (result.status === 'completed') {
      recommendations.push('Schedule regular workflow runs to maintain database freshness');
      recommendations.push('Consider implementing automated quality monitoring');
    }

    return recommendations;
  }

  private printWorkflowSummary(result: AlgaeWorkflowResult): void {
    console.log('\n' + '='.repeat(60));
    console.log('📊 ALGAE PAPER WORKFLOW SUMMARY');
    console.log('='.repeat(60));
    console.log(`Workflow ID: ${result.workflowId}`);
    console.log(`Status: ${result.status.toUpperCase()}`);
    console.log(`Total Papers Added: ${result.totalPapersAdded}`);
    console.log(`Total Processing Time: ${(result.totalProcessingTime / 1000).toFixed(2)}s`);
    console.log('');

    // Phase summaries
    if (result.phases.messProcessing) {
      const phase = result.phases.messProcessing;
      console.log(`📄 MESS Processing: ${phase.status.toUpperCase()}`);
      console.log(`  ✓ Processed: ${phase.processedPapers} papers`);
      console.log(`  ⏱️ Time: ${(phase.processingTime / 1000).toFixed(2)}s`);
      if (phase.errors) {
        console.log(`  ❌ Errors: ${phase.errors.length}`);
      }
    }

    if (result.phases.databaseExpansion) {
      const phase = result.phases.databaseExpansion;
      console.log(`🔍 Database Expansion: ${phase.status.toUpperCase()}`);
      console.log(`  ✓ Added: ${phase.addedPapers} papers`);
      console.log(`  🔍 Queries: ${phase.searchQueries}`);
      console.log(`  ⏱️ Time: ${(phase.processingTime / 1000).toFixed(2)}s`);
      if (phase.errors) {
        console.log(`  ❌ Errors: ${phase.errors.length}`);
      }
    }

    if (result.phases.validation) {
      const phase = result.phases.validation;
      console.log(`✅ Validation: ${phase.status.toUpperCase()}`);
      console.log(`  ✓ Validated: ${phase.validatedPapers} papers`);
      console.log(`  ❌ Rejected: ${phase.rejectedPapers} papers`);
      console.log(`  📊 Avg Quality: ${phase.averageQuality.toFixed(1)}`);
      console.log(`  ⏱️ Time: ${(phase.processingTime / 1000).toFixed(2)}s`);
    }

    // Quality metrics
    console.log('\n📈 QUALITY METRICS:');
    console.log(
      `  📊 Average Quality Score: ${result.qualityMetrics.averageQualityScore.toFixed(1)}`
    );
    console.log(
      `  🎯 Average Relevance Score: ${result.qualityMetrics.averageRelevanceScore.toFixed(1)}`
    );
    console.log(
      `  ✅ Validation Success Rate: ${result.qualityMetrics.validationSuccessRate.toFixed(1)}%`
    );

    // Recommendations
    if (result.recommendations.length > 0) {
      console.log('\n💡 RECOMMENDATIONS:');
      result.recommendations.forEach((rec, index) => {
        console.log(`  ${index + 1}. ${rec}`);
      });
    }

    console.log('='.repeat(60));
  }

  async generateWorkflowReport(result: AlgaeWorkflowResult): Promise<string> {
    return `# Algae Paper Processing Workflow Report

## Overview
Workflow ID: ${result.workflowId}
Status: ${result.status.toUpperCase()}
Total Processing Time: ${(result.totalProcessingTime / 1000).toFixed(2)} seconds
Total Papers Added: ${result.totalPapersAdded}

## Phase Results

### MESS Papers Processing
${
  result.phases.messProcessing
    ? `
- **Status**: ${result.phases.messProcessing.status.toUpperCase()}
- **Processed Papers**: ${result.phases.messProcessing.processedPapers}
- **Processing Time**: ${(result.phases.messProcessing.processingTime / 1000).toFixed(2)}s
- **Errors**: ${result.phases.messProcessing.errors?.length || 0}
`
    : '- **Status**: SKIPPED'
}

### Database Expansion
${
  result.phases.databaseExpansion
    ? `
- **Status**: ${result.phases.databaseExpansion.status.toUpperCase()}
- **Added Papers**: ${result.phases.databaseExpansion.addedPapers}
- **Search Queries**: ${result.phases.databaseExpansion.searchQueries}
- **Processing Time**: ${(result.phases.databaseExpansion.processingTime / 1000).toFixed(2)}s
- **Errors**: ${result.phases.databaseExpansion.errors?.length || 0}
`
    : '- **Status**: SKIPPED'
}

### Final Validation
${
  result.phases.validation
    ? `
- **Status**: ${result.phases.validation.status.toUpperCase()}
- **Validated Papers**: ${result.phases.validation.validatedPapers}
- **Rejected Papers**: ${result.phases.validation.rejectedPapers}
- **Average Quality**: ${result.phases.validation.averageQuality.toFixed(1)}
- **Processing Time**: ${(result.phases.validation.processingTime / 1000).toFixed(2)}s
- **Errors**: ${result.phases.validation.errors?.length || 0}
`
    : '- **Status**: SKIPPED'
}

## Quality Metrics
- **Average Quality Score**: ${result.qualityMetrics.averageQualityScore.toFixed(1)}/100
- **Average Relevance Score**: ${result.qualityMetrics.averageRelevanceScore.toFixed(1)}/100
- **Validation Success Rate**: ${result.qualityMetrics.validationSuccessRate.toFixed(1)}%

## Recommendations
${result.recommendations.map((rec, index) => `${index + 1}. ${rec}`).join('\n')}

## Configuration Used
- **Process MESS Papers**: ${this.config.processMESSPapers ? 'Yes' : 'No'}
- **Expand Database**: ${this.config.expandDatabase ? 'Yes' : 'No'}
- **Target Expansion Count**: ${this.config.targetExpansionCount}
- **Validation Strictness**: ${this.config.validationStrictness}
- **Parallel Processing**: ${this.config.parallelProcessing ? 'Yes' : 'No'}
- **Max Concurrent Tasks**: ${this.config.maxConcurrentTasks}

Generated on: ${new Date().toISOString()}
`;
  }
}

// Export function to run the workflow
export async function runAlgaeWorkflow(
  config: Partial<AlgaeWorkflowConfig> = {}
): Promise<AlgaeWorkflowResult> {
  const workflow = new AlgaePaperWorkflow(config);
  await workflow.initialize();
  const result = await workflow.execute();

  // Generate report
  const report = await workflow.generateWorkflowReport(result);
  console.log('\n📄 Workflow report generated');

  return result;
}

// CLI execution
if (require.main === module) {
  const config: Partial<AlgaeWorkflowConfig> = {
    processMESSPapers: true,
    expandDatabase: true,
    targetExpansionCount: 50,
    validationStrictness: 'medium',
    parallelProcessing: true,
  };

  runAlgaeWorkflow(config)
    .then((result) => {
      console.log('\n🎉 Algae Paper Workflow completed!');
      console.log(`Added ${result.totalPapersAdded} papers to the database`);
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Algae Paper Workflow failed:', error);
      process.exit(1);
    });
}
