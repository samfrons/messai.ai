import { NextResponse } from 'next/server';
// TODO: Re-enable when research agents module is available
// import {
//   ResearchOrchestrator,
//   AgentFactory,
//   ResearchWorkflow,
//   WorkflowStep,
//   AgentTask,
//   AgentCapability,
// } from '@messai/feature-research-agents';

// Initialize orchestrator and agents
// const orchestrator = new ResearchOrchestrator();
// const agents = AgentFactory.createAllAgents();
// agents.forEach((agent) => orchestrator.registerAgent(agent));

export async function POST() {
  try {
    // TODO: Re-enable when research agents module is available
    return NextResponse.json(
      {
        data: {
          message: 'Research agents workflow module not available',
        },
        error: {
          message: 'Research agents workflow functionality is currently disabled',
          code: 'MODULE_UNAVAILABLE',
        },
      },
      { status: 503 }
    );
  } catch (error) {
    console.error('Workflow execution error:', error);
    return NextResponse.json(
      {
        data: null,
        error: {
          message: 'Failed to execute workflow',
          code: 'EXECUTION_ERROR',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // TODO: Re-enable when research agents module is available
    // Return workflow templates or examples when module is available
    const workflowTemplates = [
      {
        name: 'Complete Paper Analysis',
        description:
          'Comprehensive analysis including literature review, data enhancement, and insights generation',
        steps: [
          { taskType: 'literature_analysis', agentId: 'literature-analyzer' },
          { taskType: 'data_enhancement', agentId: 'data-enhancer', dependencies: ['step-1'] },
          {
            taskType: 'insight_generation',
            agentId: 'insights-generator',
            dependencies: ['step-1', 'step-2'],
          },
        ],
      },
      {
        name: 'Knowledge Graph Update',
        description: 'Update and expand the knowledge graph with new relationships',
        steps: [{ taskType: 'knowledge_graph', agentId: 'knowledge-graph' }],
      },
      {
        name: 'Research Trend Analysis',
        description: 'Analyze current research trends and generate insights',
        steps: [
          { taskType: 'literature_analysis', agentId: 'literature-analyzer' },
          { taskType: 'trend_analysis', agentId: 'insights-generator', dependencies: ['step-1'] },
        ],
      },
    ];

    return NextResponse.json({
      data: workflowTemplates,
      error: {
        message: 'Research agents workflow functionality is currently disabled',
        code: 'MODULE_UNAVAILABLE',
      },
    });
  } catch (error) {
    console.error('Workflow API error:', error);
    return NextResponse.json(
      {
        data: null,
        error: {
          message: 'Failed to fetch workflow information',
          code: 'FETCH_ERROR',
        },
      },
      { status: 500 }
    );
  }
}
