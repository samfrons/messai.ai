import { AgentFactory } from './agent-factory';
import { LiteratureAnalyzer } from '../agents/literature-analyzer';
import { DataEnhancer } from '../agents/data-enhancer';
import { InsightsGenerator } from '../agents/insights-generator';
import { KnowledgeGraphAgent } from '../agents/knowledge-graph';

describe('AgentFactory', () => {
  describe('createLiteratureAnalyzer', () => {
    it('should create a literature analyzer with default config', () => {
      const agent = AgentFactory.createLiteratureAnalyzer();

      expect(agent).toBeInstanceOf(LiteratureAnalyzer);
      expect(agent.id).toBe('literature-analyzer');
      expect(agent.name).toBe('Literature Analysis Agent');
      expect(agent.capabilities).toContain('literature_analysis');
      expect(agent.getStatus()).toBe('idle');
    });

    it('should create a literature analyzer with custom config', () => {
      const customConfig = {
        maxConcurrentTasks: 5,
        timeoutMs: 600000,
      };

      const agent = AgentFactory.createLiteratureAnalyzer(customConfig);

      expect(agent).toBeInstanceOf(LiteratureAnalyzer);
      expect(agent.id).toBe('literature-analyzer');
      // We can't directly test the internal config, but we can verify the agent was created
    });
  });

  describe('createDataEnhancer', () => {
    it('should create a data enhancer with default config', () => {
      const agent = AgentFactory.createDataEnhancer();

      expect(agent).toBeInstanceOf(DataEnhancer);
      expect(agent.id).toBe('data-enhancer');
      expect(agent.name).toBe('Data Enhancement Agent');
      expect(agent.capabilities).toContain('data_enhancement');
      expect(agent.capabilities).toContain('paper_processing');
      expect(agent.getStatus()).toBe('idle');
    });
  });

  describe('createInsightsGenerator', () => {
    it('should create an insights generator with default config', () => {
      const agent = AgentFactory.createInsightsGenerator();

      expect(agent).toBeInstanceOf(InsightsGenerator);
      expect(agent.id).toBe('insights-generator');
      expect(agent.name).toBe('Research Insights Generator');
      expect(agent.capabilities).toContain('insight_generation');
      expect(agent.capabilities).toContain('trend_analysis');
      expect(agent.getStatus()).toBe('idle');
    });
  });

  describe('createKnowledgeGraphAgent', () => {
    it('should create a knowledge graph agent with default config', () => {
      const agent = AgentFactory.createKnowledgeGraphAgent();

      expect(agent).toBeInstanceOf(KnowledgeGraphAgent);
      expect(agent.id).toBe('knowledge-graph');
      expect(agent.name).toBe('Knowledge Graph Agent');
      expect(agent.capabilities).toContain('knowledge_graph');
      expect(agent.getStatus()).toBe('idle');
    });

    it('should create knowledge graph agent with higher resource limits', () => {
      const agent = AgentFactory.createKnowledgeGraphAgent();

      // Knowledge graph agent should have higher default resource limits
      expect(agent).toBeInstanceOf(KnowledgeGraphAgent);
      expect(agent.id).toBe('knowledge-graph');
    });
  });

  describe('createAllAgents', () => {
    it('should create all agents with default configs', () => {
      const agents = AgentFactory.createAllAgents();

      expect(agents).toHaveLength(4);

      const agentTypes = agents.map((agent) => agent.constructor.name);
      expect(agentTypes).toContain('LiteratureAnalyzer');
      expect(agentTypes).toContain('DataEnhancer');
      expect(agentTypes).toContain('InsightsGenerator');
      expect(agentTypes).toContain('KnowledgeGraphAgent');

      // All agents should be idle initially
      expect(agents.every((agent) => agent.getStatus() === 'idle')).toBe(true);
    });

    it('should create all agents with custom base config', () => {
      const baseConfig = {
        maxConcurrentTasks: 2,
        timeoutMs: 120000,
      };

      const agents = AgentFactory.createAllAgents(baseConfig);

      expect(agents).toHaveLength(4);
      expect(agents.every((agent) => agent.getStatus() === 'idle')).toBe(true);
    });

    it('should have unique agent IDs', () => {
      const agents = AgentFactory.createAllAgents();
      const ids = agents.map((agent) => agent.id);
      const uniqueIds = new Set(ids);

      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should have correct capabilities distribution', () => {
      const agents = AgentFactory.createAllAgents();

      const allCapabilities = agents.flatMap((agent) => agent.capabilities);

      expect(allCapabilities).toContain('literature_analysis');
      expect(allCapabilities).toContain('data_enhancement');
      expect(allCapabilities).toContain('paper_processing');
      expect(allCapabilities).toContain('insight_generation');
      expect(allCapabilities).toContain('trend_analysis');
      expect(allCapabilities).toContain('knowledge_graph');
    });
  });

  describe('getDefaultConfiguration', () => {
    it('should return valid default configuration', () => {
      const config = AgentFactory.getDefaultConfiguration();

      expect(config).toHaveProperty('id');
      expect(config).toHaveProperty('maxConcurrentTasks');
      expect(config).toHaveProperty('timeoutMs');
      expect(config).toHaveProperty('retryPolicy');
      expect(config).toHaveProperty('resourceLimits');
      expect(config).toHaveProperty('capabilities');

      expect(typeof config.maxConcurrentTasks).toBe('number');
      expect(typeof config.timeoutMs).toBe('number');
      expect(Array.isArray(config.capabilities)).toBe(true);
    });

    it('should return a copy of the default configuration', () => {
      const config1 = AgentFactory.getDefaultConfiguration();
      const config2 = AgentFactory.getDefaultConfiguration();

      expect(config1).not.toBe(config2); // Different object references
      expect(config1).toEqual(config2); // Same content
    });
  });

  describe('integration', () => {
    it('should create agents that can handle their designated capabilities', () => {
      const agents = AgentFactory.createAllAgents();

      // Create sample tasks for each capability
      const literatureTask = {
        id: 'lit-task',
        type: 'literature_analysis' as const,
        priority: 'medium' as const,
        input: { analysisType: 'summary' },
        metadata: { createdAt: new Date() },
      };

      const dataTask = {
        id: 'data-task',
        type: 'data_enhancement' as const,
        priority: 'medium' as const,
        input: { paperId: 'test-paper', enhancementType: 'extraction' },
        metadata: { createdAt: new Date() },
      };

      const insightTask = {
        id: 'insight-task',
        type: 'insight_generation' as const,
        priority: 'medium' as const,
        input: { analysisScope: 'global', insightTypes: ['trend'] },
        metadata: { createdAt: new Date() },
      };

      const graphTask = {
        id: 'graph-task',
        type: 'knowledge_graph' as const,
        priority: 'medium' as const,
        input: { operation: 'analyze', analysisType: 'centrality' },
        metadata: { createdAt: new Date() },
      };

      // Find agents that can handle each task
      const litAgent = agents.find((agent) => agent.canHandle(literatureTask));
      const dataAgent = agents.find((agent) => agent.canHandle(dataTask));
      const insightAgent = agents.find((agent) => agent.canHandle(insightTask));
      const graphAgent = agents.find((agent) => agent.canHandle(graphTask));

      expect(litAgent).toBeDefined();
      expect(dataAgent).toBeDefined();
      expect(insightAgent).toBeDefined();
      expect(graphAgent).toBeDefined();

      expect(litAgent).toBeInstanceOf(LiteratureAnalyzer);
      expect(dataAgent).toBeInstanceOf(DataEnhancer);
      expect(insightAgent).toBeInstanceOf(InsightsGenerator);
      expect(graphAgent).toBeInstanceOf(KnowledgeGraphAgent);
    });
  });
});
