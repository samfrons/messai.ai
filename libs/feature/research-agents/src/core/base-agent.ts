/**
 * Base implementation for all research sub-agents
 */

import type {
  ResearchSubAgent,
  AgentStatus,
  AgentTask,
  AgentResult,
  AgentMetrics,
  AgentCapability,
  ValidationResult,
  AgentConfiguration,
} from '../types/agent.types';

export abstract class BaseResearchAgent implements ResearchSubAgent {
  public readonly id: string;
  public readonly name: string;
  public readonly description: string;
  public readonly capabilities: AgentCapability[];
  public readonly version: string;

  protected status: AgentStatus = 'idle';
  protected metrics: AgentMetrics;
  protected config: AgentConfiguration;
  protected currentTasks: Set<string> = new Set();

  constructor(
    id: string,
    name: string,
    description: string,
    capabilities: AgentCapability[],
    version: string,
    config: AgentConfiguration
  ) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.capabilities = capabilities;
    this.version = version;
    this.config = config;

    this.metrics = {
      totalTasks: 0,
      completedTasks: 0,
      failedTasks: 0,
      averageDuration: 0,
      averageConfidence: 0,
      lastActive: new Date(),
      uptime: 0,
    };
  }

  getStatus(): AgentStatus {
    return this.status;
  }

  getMetrics(): AgentMetrics {
    return { ...this.metrics };
  }

  canHandle(task: AgentTask): boolean {
    // Check if agent has the required capability
    if (!this.capabilities.includes(task.type)) {
      return false;
    }

    // Check if agent is at capacity
    if (this.currentTasks.size >= this.config.maxConcurrentTasks) {
      return false;
    }

    // Check if agent is in a state to accept tasks
    if (this.status === 'failed' || this.status === 'paused') {
      return false;
    }

    return true;
  }

  async execute(task: AgentTask): Promise<AgentResult> {
    const startTime = new Date();
    let result: AgentResult;

    try {
      // Validate input
      const validation = this.validateInput(task.input);
      if (!validation.isValid) {
        throw new Error(`Invalid input: ${validation.errors.map((e) => e.message).join(', ')}`);
      }

      // Check capacity
      if (!this.canHandle(task)) {
        throw new Error('Agent cannot handle this task at this time');
      }

      // Add to current tasks
      this.currentTasks.add(task.id);
      this.status = 'running';
      this.metrics.totalTasks++;

      // Execute the specific agent logic
      const output = await this.executeTask(task);

      const endTime = new Date();
      const duration = endTime.getTime() - startTime.getTime();

      result = {
        taskId: task.id,
        agentId: this.id,
        status: 'success',
        output,
        metadata: {
          startTime,
          endTime,
          duration,
          confidence: output.confidence || 0.8,
          resourceUsage: {
            cpu: 0, // Could be measured in production
            memory: 0,
            tokens: output.tokensUsed || 0,
          },
        },
      };

      // Update metrics
      this.metrics.completedTasks++;
      this.updateAverages(duration, result.metadata.confidence || 0.8);
    } catch (error) {
      const endTime = new Date();
      const duration = endTime.getTime() - startTime.getTime();

      result = {
        taskId: task.id,
        agentId: this.id,
        status: 'error',
        output: {},
        error: {
          code: 'EXECUTION_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
          details: { error: String(error) },
        },
        metadata: {
          startTime,
          endTime,
          duration,
        },
      };

      this.metrics.failedTasks++;
    } finally {
      // Clean up
      this.currentTasks.delete(task.id);
      this.status = this.currentTasks.size > 0 ? 'running' : 'idle';
      this.metrics.lastActive = new Date();
    }

    return result;
  }

  async pause(): Promise<void> {
    this.status = 'paused';
  }

  async resume(): Promise<void> {
    this.status = this.currentTasks.size > 0 ? 'running' : 'idle';
  }

  async stop(): Promise<void> {
    this.currentTasks.clear();
    this.status = 'idle';
  }

  validateInput(input: Record<string, any>): ValidationResult {
    // Basic validation - override in specific agents for detailed validation
    const errors: Array<{ field: string; message: string; code: string }> = [];

    if (!input || typeof input !== 'object') {
      errors.push({
        field: 'input',
        message: 'Input must be a valid object',
        code: 'INVALID_TYPE',
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  protected abstract executeTask(task: AgentTask): Promise<Record<string, any>>;

  private updateAverages(duration: number, confidence: number): void {
    const totalCompleted = this.metrics.completedTasks;

    // Update average duration
    this.metrics.averageDuration =
      (this.metrics.averageDuration * (totalCompleted - 1) + duration) / totalCompleted;

    // Update average confidence
    this.metrics.averageConfidence =
      (this.metrics.averageConfidence * (totalCompleted - 1) + confidence) / totalCompleted;
  }

  protected log(level: 'info' | 'warn' | 'error', message: string, data?: any): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      agent: this.id,
      level,
      message,
      data,
    };

    // In production, this would integrate with your logging system
    console.log(JSON.stringify(logEntry));
  }
}
