import { BaseResearchAgent } from './base-agent';
import type {
  AgentTask,
  AgentCapability,
  AgentConfiguration,
  ValidationResult,
} from '../types/agent.types';

// Test implementation of BaseResearchAgent
class TestAgent extends BaseResearchAgent {
  constructor(config: AgentConfiguration) {
    super(
      'test-agent',
      'Test Agent',
      'Test agent for unit testing',
      ['literature_analysis'],
      '1.0.0',
      config
    );
  }

  protected async executeTask(task: AgentTask): Promise<Record<string, any>> {
    // Mock implementation
    return {
      result: 'test-output',
      confidence: 0.85,
      tokensUsed: 100,
    };
  }

  validateInput(input: Record<string, any>): ValidationResult {
    const errors: Array<{ field: string; message: string; code: string }> = [];

    if (!input.required_field) {
      errors.push({
        field: 'required_field',
        message: 'Required field is missing',
        code: 'MISSING_FIELD',
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

describe('BaseResearchAgent', () => {
  let agent: TestAgent;
  let config: AgentConfiguration;

  beforeEach(() => {
    config = {
      id: 'test-agent',
      maxConcurrentTasks: 3,
      timeoutMs: 30000,
      retryPolicy: {
        maxRetries: 2,
        backoffMs: 1000,
      },
      resourceLimits: {
        maxMemoryMb: 256,
        maxTokens: 5000,
      },
      capabilities: ['literature_analysis'],
    };

    agent = new TestAgent(config);
  });

  describe('initialization', () => {
    it('should initialize with correct properties', () => {
      expect(agent.id).toBe('test-agent');
      expect(agent.name).toBe('Test Agent');
      expect(agent.description).toBe('Test agent for unit testing');
      expect(agent.capabilities).toEqual(['literature_analysis']);
      expect(agent.version).toBe('1.0.0');
    });

    it('should start with idle status', () => {
      expect(agent.getStatus()).toBe('idle');
    });

    it('should initialize metrics correctly', () => {
      const metrics = agent.getMetrics();
      expect(metrics.totalTasks).toBe(0);
      expect(metrics.completedTasks).toBe(0);
      expect(metrics.failedTasks).toBe(0);
      expect(metrics.averageDuration).toBe(0);
      expect(metrics.averageConfidence).toBe(0);
      expect(metrics.lastActive).toBeInstanceOf(Date);
    });
  });

  describe('canHandle', () => {
    it('should accept tasks with matching capabilities', () => {
      const task: AgentTask = {
        id: 'task-1',
        type: 'literature_analysis',
        priority: 'medium',
        input: { required_field: 'value' },
        metadata: { createdAt: new Date() },
      };

      expect(agent.canHandle(task)).toBe(true);
    });

    it('should reject tasks with non-matching capabilities', () => {
      const task: AgentTask = {
        id: 'task-1',
        type: 'data_enhancement' as AgentCapability,
        priority: 'medium',
        input: { required_field: 'value' },
        metadata: { createdAt: new Date() },
      };

      expect(agent.canHandle(task)).toBe(false);
    });

    it('should reject tasks when at capacity', () => {
      // Simulate being at capacity
      for (let i = 0; i < config.maxConcurrentTasks; i++) {
        (agent as any).currentTasks.add(`task-${i}`);
      }

      const task: AgentTask = {
        id: 'task-new',
        type: 'literature_analysis',
        priority: 'medium',
        input: { required_field: 'value' },
        metadata: { createdAt: new Date() },
      };

      expect(agent.canHandle(task)).toBe(false);
    });
  });

  describe('execute', () => {
    it('should execute task successfully', async () => {
      const task: AgentTask = {
        id: 'task-1',
        type: 'literature_analysis',
        priority: 'medium',
        input: { required_field: 'value' },
        metadata: { createdAt: new Date() },
      };

      const result = await agent.execute(task);

      expect(result.taskId).toBe('task-1');
      expect(result.agentId).toBe('test-agent');
      expect(result.status).toBe('success');
      expect(result.output.result).toBe('test-output');
      expect(result.metadata.confidence).toBe(0.85);
      expect(result.metadata.duration).toBeGreaterThan(0);
    });

    it('should handle validation errors', async () => {
      const task: AgentTask = {
        id: 'task-1',
        type: 'literature_analysis',
        priority: 'medium',
        input: {}, // Missing required_field
        metadata: { createdAt: new Date() },
      };

      const result = await agent.execute(task);

      expect(result.status).toBe('error');
      expect(result.error?.message).toContain('Invalid input');
      expect(result.error?.message).toContain('Required field is missing');
    });

    it('should update metrics after execution', async () => {
      const task: AgentTask = {
        id: 'task-1',
        type: 'literature_analysis',
        priority: 'medium',
        input: { required_field: 'value' },
        metadata: { createdAt: new Date() },
      };

      await agent.execute(task);

      const metrics = agent.getMetrics();
      expect(metrics.totalTasks).toBe(1);
      expect(metrics.completedTasks).toBe(1);
      expect(metrics.failedTasks).toBe(0);
      expect(metrics.averageDuration).toBeGreaterThan(0);
      expect(metrics.averageConfidence).toBe(0.85);
    });

    it('should update failed task metrics on error', async () => {
      const task: AgentTask = {
        id: 'task-1',
        type: 'literature_analysis',
        priority: 'medium',
        input: {}, // This will cause validation error
        metadata: { createdAt: new Date() },
      };

      await agent.execute(task);

      const metrics = agent.getMetrics();
      expect(metrics.totalTasks).toBe(1);
      expect(metrics.completedTasks).toBe(0);
      expect(metrics.failedTasks).toBe(1);
    });
  });

  describe('status management', () => {
    it('should pause and resume', async () => {
      expect(agent.getStatus()).toBe('idle');

      await agent.pause();
      expect(agent.getStatus()).toBe('paused');

      await agent.resume();
      expect(agent.getStatus()).toBe('idle');
    });

    it('should stop correctly', async () => {
      // Add some tasks
      (agent as any).currentTasks.add('task-1');
      (agent as any).currentTasks.add('task-2');

      await agent.stop();

      expect(agent.getStatus()).toBe('idle');
      expect((agent as any).currentTasks.size).toBe(0);
    });
  });

  describe('validation', () => {
    it('should validate input correctly', () => {
      const validInput = { required_field: 'value' };
      const invalidInput = {};

      const validResult = agent.validateInput(validInput);
      const invalidResult = agent.validateInput(invalidInput);

      expect(validResult.isValid).toBe(true);
      expect(validResult.errors).toHaveLength(0);

      expect(invalidResult.isValid).toBe(false);
      expect(invalidResult.errors).toHaveLength(1);
      expect(invalidResult.errors[0].field).toBe('required_field');
    });
  });
});
