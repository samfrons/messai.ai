import { ResearchOrchestrator } from './orchestrator';
import { BaseResearchAgent } from './base-agent';
import type {
  AgentTask,
  AgentConfiguration,
  ValidationResult,
  ResearchWorkflow,
} from '../types/agent.types';

// Mock agent for testing
class MockAgent extends BaseResearchAgent {
  private shouldFail: boolean = false;

  constructor(
    id: string,
    capabilities: string[],
    config: AgentConfiguration,
    shouldFail: boolean = false
  ) {
    super(
      id,
      `Mock Agent ${id}`,
      `Mock agent for testing: ${id}`,
      capabilities as any,
      '1.0.0',
      config
    );
    this.shouldFail = shouldFail;
  }

  protected async executeTask(task: AgentTask): Promise<Record<string, any>> {
    if (this.shouldFail) {
      throw new Error('Mock agent failure');
    }

    // Simulate some processing time
    await new Promise((resolve) => setTimeout(resolve, 10));

    return {
      result: `Processed by ${this.id}`,
      confidence: 0.8,
      tokensUsed: 50,
    };
  }

  validateInput(input: Record<string, any>): ValidationResult {
    return {
      isValid: true,
      errors: [],
    };
  }

  setShouldFail(shouldFail: boolean) {
    this.shouldFail = shouldFail;
  }
}

describe('ResearchOrchestrator', () => {
  let orchestrator: ResearchOrchestrator;
  let config: AgentConfiguration;

  beforeEach(() => {
    orchestrator = new ResearchOrchestrator();
    config = {
      id: 'test-config',
      maxConcurrentTasks: 3,
      timeoutMs: 30000,
      retryPolicy: {
        maxRetries: 2,
        backoffMs: 100,
      },
      resourceLimits: {
        maxMemoryMb: 256,
        maxTokens: 5000,
      },
      capabilities: [],
    };
  });

  describe('agent registration', () => {
    it('should register agents correctly', () => {
      const agent = new MockAgent('agent-1', ['literature_analysis'], config);

      orchestrator.registerAgent(agent);

      expect(orchestrator.getAgent('agent-1')).toBe(agent);
    });

    it('should unregister agents correctly', () => {
      const agent = new MockAgent('agent-1', ['literature_analysis'], config);

      orchestrator.registerAgent(agent);
      orchestrator.unregisterAgent('agent-1');

      expect(orchestrator.getAgent('agent-1')).toBeUndefined();
    });

    it('should find agents by capability', () => {
      const agent1 = new MockAgent('agent-1', ['literature_analysis'], config);
      const agent2 = new MockAgent('agent-2', ['data_enhancement'], config);
      const agent3 = new MockAgent('agent-3', ['literature_analysis', 'data_enhancement'], config);

      orchestrator.registerAgent(agent1);
      orchestrator.registerAgent(agent2);
      orchestrator.registerAgent(agent3);

      const literatureAgents = orchestrator.getAgentsByCapability('literature_analysis' as any);
      const dataAgents = orchestrator.getAgentsByCapability('data_enhancement' as any);

      expect(literatureAgents).toHaveLength(2);
      expect(literatureAgents.map((a) => a.id)).toEqual(['agent-1', 'agent-3']);

      expect(dataAgents).toHaveLength(2);
      expect(dataAgents.map((a) => a.id)).toEqual(['agent-2', 'agent-3']);
    });
  });

  describe('task execution', () => {
    it('should execute task with available agent', async () => {
      const agent = new MockAgent('agent-1', ['literature_analysis'], config);
      orchestrator.registerAgent(agent);

      const task: AgentTask = {
        id: 'task-1',
        type: 'literature_analysis' as any,
        priority: 'medium',
        input: { test: 'data' },
        metadata: { createdAt: new Date() },
      };

      const result = await orchestrator.executeTask(task);

      expect(result.status).toBe('success');
      expect(result.agentId).toBe('agent-1');
      expect(result.output.result).toBe('Processed by agent-1');
    });

    it('should return error when no agent available', async () => {
      const task: AgentTask = {
        id: 'task-1',
        type: 'literature_analysis' as any,
        priority: 'medium',
        input: { test: 'data' },
        metadata: { createdAt: new Date() },
      };

      const result = await orchestrator.executeTask(task);

      expect(result.status).toBe('error');
      expect(result.error?.code).toBe('NO_AVAILABLE_AGENT');
    });

    it('should execute multiple tasks in parallel', async () => {
      const agent1 = new MockAgent('agent-1', ['literature_analysis'], config);
      const agent2 = new MockAgent('agent-2', ['data_enhancement'], config);

      orchestrator.registerAgent(agent1);
      orchestrator.registerAgent(agent2);

      const tasks: AgentTask[] = [
        {
          id: 'task-1',
          type: 'literature_analysis' as any,
          priority: 'medium',
          input: { test: 'data1' },
          metadata: { createdAt: new Date() },
        },
        {
          id: 'task-2',
          type: 'data_enhancement' as any,
          priority: 'medium',
          input: { test: 'data2' },
          metadata: { createdAt: new Date() },
        },
      ];

      const results = await orchestrator.executeParallelTasks(tasks);

      expect(results).toHaveLength(2);
      expect(results[0].status).toBe('success');
      expect(results[1].status).toBe('success');
      expect(results[0].agentId).toBe('agent-1');
      expect(results[1].agentId).toBe('agent-2');
    });
  });

  describe('workflow execution', () => {
    it('should execute simple workflow successfully', async () => {
      const agent = new MockAgent('agent-1', ['literature_analysis'], config);
      orchestrator.registerAgent(agent);

      const workflow: ResearchWorkflow = {
        id: 'workflow-1',
        name: 'Test Workflow',
        description: 'Simple test workflow',
        steps: [
          {
            agentId: 'agent-1',
            task: {
              id: 'task-1',
              type: 'literature_analysis' as any,
              priority: 'medium',
              input: { test: 'data' },
              metadata: { createdAt: new Date() },
            },
          },
        ],
        metadata: {
          createdBy: 'test',
          createdAt: new Date(),
          estimatedDuration: 5000,
        },
      };

      const result = await orchestrator.executeWorkflow(workflow);

      expect(result.status).toBe('completed');
      expect(result.results).toHaveLength(1);
      expect(result.results[0].status).toBe('success');
    });

    it('should handle workflow with dependencies', async () => {
      const agent = new MockAgent('agent-1', ['literature_analysis'], config);
      orchestrator.registerAgent(agent);

      const workflow: ResearchWorkflow = {
        id: 'workflow-1',
        name: 'Dependent Workflow',
        description: 'Workflow with task dependencies',
        steps: [
          {
            agentId: 'agent-1',
            task: {
              id: 'task-1',
              type: 'literature_analysis' as any,
              priority: 'medium',
              input: { test: 'data1' },
              metadata: { createdAt: new Date() },
            },
          },
          {
            agentId: 'agent-1',
            task: {
              id: 'task-2',
              type: 'literature_analysis' as any,
              priority: 'medium',
              input: { test: 'data2' },
              metadata: { createdAt: new Date() },
            },
            dependencies: ['task-1'],
          },
        ],
        metadata: {
          createdBy: 'test',
          createdAt: new Date(),
          estimatedDuration: 10000,
        },
      };

      const result = await orchestrator.executeWorkflow(workflow);

      expect(result.status).toBe('completed');
      expect(result.results).toHaveLength(2);
      expect(result.results.every((r) => r.status === 'success')).toBe(true);
    });

    it('should handle workflow failures correctly', async () => {
      const agent = new MockAgent('agent-1', ['literature_analysis'], config, true); // shouldFail = true
      orchestrator.registerAgent(agent);

      const workflow: ResearchWorkflow = {
        id: 'workflow-1',
        name: 'Failing Workflow',
        description: 'Workflow that should fail',
        steps: [
          {
            agentId: 'agent-1',
            task: {
              id: 'task-1',
              type: 'literature_analysis' as any,
              priority: 'medium',
              input: { test: 'data' },
              metadata: { createdAt: new Date() },
            },
          },
        ],
        metadata: {
          createdBy: 'test',
          createdAt: new Date(),
          estimatedDuration: 5000,
        },
      };

      const result = await orchestrator.executeWorkflow(workflow);

      expect(result.status).toBe('failed');
      expect(result.results).toHaveLength(1);
      expect(result.results[0].status).toBe('error');
    });
  });

  describe('agent coordination', () => {
    it('should coordinate multiple agents efficiently', async () => {
      const agent1 = new MockAgent('agent-1', ['literature_analysis'], config);
      const agent2 = new MockAgent('agent-2', ['data_enhancement'], config);

      orchestrator.registerAgent(agent1);
      orchestrator.registerAgent(agent2);

      const tasks: AgentTask[] = [
        {
          id: 'task-1',
          type: 'literature_analysis' as any,
          priority: 'medium',
          input: { test: 'data1' },
          metadata: { createdAt: new Date() },
        },
        {
          id: 'task-2',
          type: 'literature_analysis' as any,
          priority: 'medium',
          input: { test: 'data2' },
          metadata: { createdAt: new Date() },
        },
        {
          id: 'task-3',
          type: 'data_enhancement' as any,
          priority: 'medium',
          input: { test: 'data3' },
          metadata: { createdAt: new Date() },
        },
      ];

      const results = await orchestrator.coordinateAgents(tasks);

      expect(results).toHaveLength(3);
      expect(results.filter((r) => r.status === 'success')).toHaveLength(3);

      // Literature analysis tasks should go to agent-1
      const litTasks = results.filter((r) => r.agentId === 'agent-1');
      expect(litTasks).toHaveLength(2);

      // Data enhancement task should go to agent-2
      const dataTasks = results.filter((r) => r.agentId === 'agent-2');
      expect(dataTasks).toHaveLength(1);
    });

    it('should handle capability mismatches gracefully', async () => {
      const agent = new MockAgent('agent-1', ['literature_analysis'], config);
      orchestrator.registerAgent(agent);

      const tasks: AgentTask[] = [
        {
          id: 'task-1',
          type: 'data_enhancement' as any, // Agent doesn't have this capability
          priority: 'medium',
          input: { test: 'data' },
          metadata: { createdAt: new Date() },
        },
      ];

      const results = await orchestrator.coordinateAgents(tasks);

      expect(results).toHaveLength(1);
      expect(results[0].status).toBe('error');
      expect(results[0].error?.code).toBe('NO_AGENT_FOR_CAPABILITY');
    });
  });

  describe('status monitoring', () => {
    it('should provide agent status information', () => {
      const agent1 = new MockAgent('agent-1', ['literature_analysis'], config);
      const agent2 = new MockAgent('agent-2', ['data_enhancement'], config);

      orchestrator.registerAgent(agent1);
      orchestrator.registerAgent(agent2);

      const statuses = orchestrator.getAgentStatuses();

      expect(statuses).toHaveLength(2);
      expect(statuses[0].agentId).toBe('agent-1');
      expect(statuses[1].agentId).toBe('agent-2');
      expect(statuses.every((s) => s.status === 'idle')).toBe(true);
    });

    it('should track workflow status', async () => {
      const agent = new MockAgent('agent-1', ['literature_analysis'], config);
      orchestrator.registerAgent(agent);

      const workflow: ResearchWorkflow = {
        id: 'workflow-1',
        name: 'Test Workflow',
        description: 'Test workflow for status tracking',
        steps: [
          {
            agentId: 'agent-1',
            task: {
              id: 'task-1',
              type: 'literature_analysis' as any,
              priority: 'medium',
              input: { test: 'data' },
              metadata: { createdAt: new Date() },
            },
          },
        ],
        metadata: {
          createdBy: 'test',
          createdAt: new Date(),
          estimatedDuration: 5000,
        },
      };

      // Start workflow execution but don't await it immediately
      const workflowPromise = orchestrator.executeWorkflow(workflow);

      // Check status while running (might be quick, so we immediately check)
      const status = orchestrator.getWorkflowStatus('workflow-1');

      // Wait for completion
      await workflowPromise;

      // Status should no longer be available after completion
      const finalStatus = orchestrator.getWorkflowStatus('workflow-1');
      expect(finalStatus).toBeUndefined();
    });
  });
});
