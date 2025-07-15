import { NextRequest, NextResponse } from 'next/server';
import {
  ResearchOrchestrator,
  AgentFactory,
  AgentTask,
  AgentCapability,
} from '@messai/feature-research-agents';

// Initialize orchestrator and agents
const orchestrator = new ResearchOrchestrator();

// Register all agents
const agents = AgentFactory.createAllAgents();
agents.forEach((agent) => orchestrator.registerAgent(agent));

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const operation = searchParams.get('operation');

    if (operation === 'status') {
      const agentStatuses = orchestrator.getAgentStatuses();

      return NextResponse.json({
        data: {
          agents: agentStatuses,
          totalAgents: agentStatuses.length,
          activeAgents: agentStatuses.filter((a) => a.status === 'running').length,
        },
        error: null,
      });
    }

    if (operation === 'capabilities') {
      const capabilities = agents.map((agent) => ({
        agentId: agent.id,
        name: agent.name,
        capabilities: agent.capabilities,
        status: agent.getStatus(),
        metrics: agent.getMetrics(),
      }));

      return NextResponse.json({
        data: capabilities,
        error: null,
      });
    }

    // Default: return agent list
    const agentList = agents.map((agent) => ({
      id: agent.id,
      name: agent.name,
      description: agent.description,
      capabilities: agent.capabilities,
      version: agent.version,
      status: agent.getStatus(),
    }));

    return NextResponse.json({
      data: agentList,
      error: null,
    });
  } catch (error) {
    console.error('Research agents API error:', error);
    return NextResponse.json(
      {
        data: null,
        error: {
          message: 'Failed to fetch agent information',
          code: 'FETCH_ERROR',
        },
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { taskType, input, priority = 'medium', metadata } = body;

    if (!taskType || !input) {
      return NextResponse.json(
        {
          data: null,
          error: {
            message: 'Missing required fields: taskType, input',
            code: 'VALIDATION_ERROR',
          },
        },
        { status: 400 }
      );
    }

    // Create agent task
    const task: AgentTask = {
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: taskType as AgentCapability,
      priority,
      input,
      metadata: {
        ...metadata,
        createdAt: new Date(),
      },
    };

    // Execute task through orchestrator
    const result = await orchestrator.executeTask(task);

    return NextResponse.json({
      data: {
        task: {
          id: task.id,
          type: task.type,
          priority: task.priority,
        },
        result,
      },
      error: null,
    });
  } catch (error) {
    console.error('Research agent task execution error:', error);
    return NextResponse.json(
      {
        data: null,
        error: {
          message: 'Failed to execute agent task',
          code: 'EXECUTION_ERROR',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
      },
      { status: 500 }
    );
  }
}
