/**
 * Research Agent Orchestrator - Coordinates multiple sub-agents
 */

import type {
  ResearchSubAgent,
  AgentTask,
  AgentResult,
  ResearchWorkflow,
  WorkflowResult,
  WorkflowStep,
  AgentCapability,
} from '../types/agent.types';

export class ResearchOrchestrator {
  private agents: Map<string, ResearchSubAgent> = new Map();
  private taskQueue: AgentTask[] = [];
  private runningWorkflows: Map<string, WorkflowExecution> = new Map();

  constructor() {
    this.log('info', 'Research Orchestrator initialized');
  }

  registerAgent(agent: ResearchSubAgent): void {
    this.agents.set(agent.id, agent);
    this.log('info', `Agent registered: ${agent.id} (${agent.name})`);
  }

  unregisterAgent(agentId: string): void {
    this.agents.delete(agentId);
    this.log('info', `Agent unregistered: ${agentId}`);
  }

  getAgent(agentId: string): ResearchSubAgent | undefined {
    return this.agents.get(agentId);
  }

  getAgentsByCapability(capability: AgentCapability): ResearchSubAgent[] {
    return Array.from(this.agents.values()).filter((agent) =>
      agent.capabilities.includes(capability)
    );
  }

  async executeTask(task: AgentTask): Promise<AgentResult> {
    // Find available agent for this task
    const availableAgents = Array.from(this.agents.values()).filter((agent) =>
      agent.canHandle(task)
    );

    if (availableAgents.length === 0) {
      return {
        taskId: task.id,
        agentId: 'orchestrator',
        status: 'error',
        output: {},
        error: {
          code: 'NO_AVAILABLE_AGENT',
          message: `No agent available to handle task type: ${task.type}`,
        },
        metadata: {
          startTime: new Date(),
          endTime: new Date(),
          duration: 0,
        },
      };
    }

    // Select best agent (for now, just pick the first available)
    const selectedAgent = availableAgents[0];

    this.log('info', `Executing task ${task.id} with agent ${selectedAgent.id}`);

    return await selectedAgent.execute(task);
  }

  async executeParallelTasks(tasks: AgentTask[]): Promise<AgentResult[]> {
    const taskPromises = tasks.map((task) => this.executeTask(task));
    return await Promise.all(taskPromises);
  }

  async executeWorkflow(workflow: ResearchWorkflow): Promise<WorkflowResult> {
    const workflowExecution: WorkflowExecution = {
      workflow,
      results: new Map(),
      completedSteps: new Set(),
      failedSteps: new Set(),
      startTime: new Date(),
    };

    this.runningWorkflows.set(workflow.id, workflowExecution);

    try {
      this.log('info', `Starting workflow: ${workflow.id} (${workflow.name})`);

      // Execute steps in dependency order
      const executionOrder = this.calculateExecutionOrder(workflow.steps);

      for (const stepGroup of executionOrder) {
        // Execute steps in parallel within each group
        const stepPromises = stepGroup.map((step) =>
          this.executeWorkflowStep(step, workflowExecution)
        );
        await Promise.all(stepPromises);

        // Check if any critical steps failed
        const hasFailures = stepGroup.some((step) =>
          workflowExecution.failedSteps.has(step.task.id)
        );

        if (hasFailures) {
          // Stop workflow execution on critical failures
          break;
        }
      }

      const endTime = new Date();
      const results = Array.from(workflowExecution.results.values());

      const workflowResult: WorkflowResult = {
        workflowId: workflow.id,
        status:
          workflowExecution.failedSteps.size === 0
            ? 'completed'
            : workflowExecution.completedSteps.size > 0
              ? 'partial'
              : 'failed',
        results,
        metadata: {
          startTime: workflowExecution.startTime,
          endTime,
          totalDuration: endTime.getTime() - workflowExecution.startTime.getTime(),
        },
      };

      this.log('info', `Workflow ${workflow.id} completed with status: ${workflowResult.status}`);

      return workflowResult;
    } finally {
      this.runningWorkflows.delete(workflow.id);
    }
  }

  async coordinateAgents(tasks: AgentTask[]): Promise<AgentResult[]> {
    // Group tasks by capability for efficient execution
    const taskGroups = this.groupTasksByCapability(tasks);
    const allResults: AgentResult[] = [];

    for (const [capability, capabilityTasks] of taskGroups) {
      const availableAgents = this.getAgentsByCapability(capability);

      if (availableAgents.length === 0) {
        // Create error results for tasks that can't be handled
        const errorResults = capabilityTasks.map((task) => ({
          taskId: task.id,
          agentId: 'orchestrator',
          status: 'error' as const,
          output: {},
          error: {
            code: 'NO_AGENT_FOR_CAPABILITY',
            message: `No agent available for capability: ${capability}`,
          },
          metadata: {
            startTime: new Date(),
            endTime: new Date(),
            duration: 0,
          },
        }));

        allResults.push(...errorResults);
        continue;
      }

      // Distribute tasks among available agents
      const taskResults = await this.distributeTasksToAgents(capabilityTasks, availableAgents);
      allResults.push(...taskResults);
    }

    return allResults;
  }

  getWorkflowStatus(workflowId: string): WorkflowExecution | undefined {
    return this.runningWorkflows.get(workflowId);
  }

  getAgentStatuses(): Array<{ agentId: string; status: string; metrics: any }> {
    return Array.from(this.agents.values()).map((agent) => ({
      agentId: agent.id,
      status: agent.getStatus(),
      metrics: agent.getMetrics(),
    }));
  }

  private async executeWorkflowStep(
    step: WorkflowStep,
    execution: WorkflowExecution
  ): Promise<void> {
    try {
      // Check dependencies
      if (step.dependencies) {
        const dependenciesMet = step.dependencies.every((depId) =>
          execution.completedSteps.has(depId)
        );

        if (!dependenciesMet) {
          throw new Error(`Dependencies not met for step ${step.task.id}`);
        }
      }

      const result = await this.executeTask(step.task);

      if (result.status === 'success') {
        execution.completedSteps.add(step.task.id);
      } else {
        execution.failedSteps.add(step.task.id);
      }

      execution.results.set(step.task.id, result);
    } catch (error) {
      execution.failedSteps.add(step.task.id);

      const errorResult: AgentResult = {
        taskId: step.task.id,
        agentId: 'orchestrator',
        status: 'error',
        output: {},
        error: {
          code: 'WORKFLOW_STEP_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
        metadata: {
          startTime: new Date(),
          endTime: new Date(),
          duration: 0,
        },
      };

      execution.results.set(step.task.id, errorResult);
    }
  }

  private calculateExecutionOrder(steps: WorkflowStep[]): WorkflowStep[][] {
    // Simple topological sort to handle dependencies
    const executionOrder: WorkflowStep[][] = [];
    const remainingSteps = [...steps];
    const completedSteps = new Set<string>();

    while (remainingSteps.length > 0) {
      const readySteps = remainingSteps.filter(
        (step) =>
          !step.dependencies || step.dependencies.every((depId) => completedSteps.has(depId))
      );

      if (readySteps.length === 0) {
        throw new Error('Circular dependency detected in workflow');
      }

      executionOrder.push(readySteps);

      // Mark steps as ready for next iteration
      readySteps.forEach((step) => {
        completedSteps.add(step.task.id);
        const index = remainingSteps.indexOf(step);
        remainingSteps.splice(index, 1);
      });
    }

    return executionOrder;
  }

  private groupTasksByCapability(tasks: AgentTask[]): Map<AgentCapability, AgentTask[]> {
    const groups = new Map<AgentCapability, AgentTask[]>();

    for (const task of tasks) {
      if (!groups.has(task.type)) {
        groups.set(task.type, []);
      }
      groups.get(task.type)!.push(task);
    }

    return groups;
  }

  private async distributeTasksToAgents(
    tasks: AgentTask[],
    agents: ResearchSubAgent[]
  ): Promise<AgentResult[]> {
    // Simple round-robin distribution
    const taskPromises: Promise<AgentResult>[] = [];

    for (let i = 0; i < tasks.length; i++) {
      const agent = agents[i % agents.length];
      const task = tasks[i];

      if (agent.canHandle(task)) {
        taskPromises.push(agent.execute(task));
      } else {
        // Create error result if agent can't handle task
        taskPromises.push(
          Promise.resolve({
            taskId: task.id,
            agentId: agent.id,
            status: 'error' as const,
            output: {},
            error: {
              code: 'AGENT_CANNOT_HANDLE',
              message: `Agent ${agent.id} cannot handle task ${task.id}`,
            },
            metadata: {
              startTime: new Date(),
              endTime: new Date(),
              duration: 0,
            },
          })
        );
      }
    }

    return await Promise.all(taskPromises);
  }

  private log(level: 'info' | 'warn' | 'error', message: string, data?: any): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      component: 'ResearchOrchestrator',
      level,
      message,
      data,
    };

    console.log(JSON.stringify(logEntry));
  }
}

interface WorkflowExecution {
  workflow: ResearchWorkflow;
  results: Map<string, AgentResult>;
  completedSteps: Set<string>;
  failedSteps: Set<string>;
  startTime: Date;
}
