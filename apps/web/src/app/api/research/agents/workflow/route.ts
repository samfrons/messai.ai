import { NextRequest, NextResponse } from 'next/server';
import {
  ResearchOrchestrator,
  AgentFactory,
  ResearchWorkflow,
  WorkflowStep,
  AgentTask,
  AgentCapability,
} from '@messai/feature-research-agents';

// Initialize orchestrator and agents
const orchestrator = new ResearchOrchestrator();
const agents = AgentFactory.createAllAgents();
agents.forEach((agent) => orchestrator.registerAgent(agent));

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { workflowName, steps, metadata } = body;

    if (!workflowName || !steps || !Array.isArray(steps)) {
      return NextResponse.json(
        {
          data: null,
          error: {
            message: 'Missing required fields: workflowName, steps (array)',
            code: 'VALIDATION_ERROR',
          },
        },
        { status: 400 }
      );
    }

    // Create workflow
    const workflow: ResearchWorkflow = {
      id: `workflow-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: workflowName,
      description: metadata?.description || `Research workflow: ${workflowName}`,
      steps: steps.map(
        (step: any): WorkflowStep => ({
          agentId: step.agentId,
          task: {
            id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type: step.taskType as AgentCapability,
            priority: step.priority || 'medium',
            input: step.input,
            metadata: {
              createdAt: new Date(),
              ...step.metadata,
            },
          } as AgentTask,
          dependencies: step.dependencies,
          retryPolicy: step.retryPolicy,
        })
      ),
      metadata: {
        createdBy: metadata?.userId || 'system',
        createdAt: new Date(),
        estimatedDuration: metadata?.estimatedDuration || 300000, // 5 minutes default
      },
    };

    // Execute workflow
    const result = await orchestrator.executeWorkflow(workflow);

    return NextResponse.json({
      data: {
        workflow: {
          id: workflow.id,
          name: workflow.name,
          steps: workflow.steps.length,
        },
        result,
      },
      error: null,
    });
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const workflowId = searchParams.get('workflowId');

    if (workflowId) {
      const workflowStatus = orchestrator.getWorkflowStatus(workflowId);

      if (!workflowStatus) {
        return NextResponse.json(
          {
            data: null,
            error: {
              message: 'Workflow not found',
              code: 'NOT_FOUND',
            },
          },
          { status: 404 }
        );
      }

      return NextResponse.json({
        data: {
          workflowId,
          status: workflowStatus,
          completedSteps: workflowStatus.completedSteps.size,
          failedSteps: workflowStatus.failedSteps.size,
          totalSteps: workflowStatus.workflow.steps.length,
        },
        error: null,
      });
    }

    // Return workflow templates or examples
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
      error: null,
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
