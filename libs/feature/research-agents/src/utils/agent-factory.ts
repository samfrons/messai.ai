/**
 * Agent Factory - Creates and configures sub-agents
 */

import type { AgentConfiguration, ResearchSubAgent } from '../types/agent.types';
import { LiteratureAnalyzer } from '../agents/literature-analyzer';
import { DataEnhancer } from '../agents/data-enhancer';
import { InsightsGenerator } from '../agents/insights-generator';
import { KnowledgeGraphAgent } from '../agents/knowledge-graph';

export class AgentFactory {
  private static defaultConfig: AgentConfiguration = {
    id: 'default',
    maxConcurrentTasks: 3,
    timeoutMs: 300000, // 5 minutes
    retryPolicy: {
      maxRetries: 3,
      backoffMs: 1000,
    },
    resourceLimits: {
      maxMemoryMb: 512,
      maxTokens: 10000,
    },
    capabilities: [],
  };

  static createLiteratureAnalyzer(config?: Partial<AgentConfiguration>): LiteratureAnalyzer {
    const agentConfig = {
      ...this.defaultConfig,
      id: 'literature-analyzer',
      capabilities: ['literature_analysis' as const],
      ...config,
    };

    return new LiteratureAnalyzer(agentConfig);
  }

  static createDataEnhancer(config?: Partial<AgentConfiguration>): DataEnhancer {
    const agentConfig = {
      ...this.defaultConfig,
      id: 'data-enhancer',
      capabilities: ['data_enhancement' as const, 'paper_processing' as const],
      ...config,
    };

    return new DataEnhancer(agentConfig);
  }

  static createInsightsGenerator(config?: Partial<AgentConfiguration>): InsightsGenerator {
    const agentConfig = {
      ...this.defaultConfig,
      id: 'insights-generator',
      capabilities: ['insight_generation' as const, 'trend_analysis' as const],
      ...config,
    };

    return new InsightsGenerator(agentConfig);
  }

  static createKnowledgeGraphAgent(config?: Partial<AgentConfiguration>): KnowledgeGraphAgent {
    const agentConfig = {
      ...this.defaultConfig,
      id: 'knowledge-graph',
      capabilities: ['knowledge_graph' as const],
      maxConcurrentTasks: 2, // Graph operations can be memory intensive
      resourceLimits: {
        maxMemoryMb: 1024,
        maxTokens: 15000,
      },
      ...config,
    };

    return new KnowledgeGraphAgent(agentConfig);
  }

  static createAllAgents(baseConfig?: Partial<AgentConfiguration>): ResearchSubAgent[] {
    return [
      this.createLiteratureAnalyzer(baseConfig),
      this.createDataEnhancer(baseConfig),
      this.createInsightsGenerator(baseConfig),
      this.createKnowledgeGraphAgent(baseConfig),
    ];
  }

  static getDefaultConfiguration(): AgentConfiguration {
    return { ...this.defaultConfig };
  }
}
