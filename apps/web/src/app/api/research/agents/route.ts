import { NextResponse } from 'next/server';
// TODO: Re-enable when research agents module is available
// import {
//   ResearchOrchestrator,
//   AgentFactory,
//   AgentTask,
//   AgentCapability,
// } from '@messai/feature-research-agents';

// Initialize orchestrator and agents
// const orchestrator = new ResearchOrchestrator();

// Register all agents
// const agents = AgentFactory.createAllAgents();
// agents.forEach((agent) => orchestrator.registerAgent(agent));

export async function GET() {
  try {
    // TODO: Re-enable when research agents module is available
    return NextResponse.json({
      data: {
        agents: [],
        totalAgents: 0,
        activeAgents: 0,
        message: 'Research agents module not available',
      },
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

export async function POST() {
  try {
    // TODO: Re-enable when research agents module is available
    return NextResponse.json(
      {
        data: {
          message: 'Research agents module not available',
        },
        error: {
          message: 'Research agents functionality is currently disabled',
          code: 'MODULE_UNAVAILABLE',
        },
      },
      { status: 503 }
    );
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
