import { NextRequest, NextResponse } from 'next/server';
import { ResearchOrchestrator, AgentFactory, AgentTask } from '@messai/feature-research-agents';

// Initialize orchestrator and agents
const orchestrator = new ResearchOrchestrator();
const agents = AgentFactory.createAllAgents();
agents.forEach((agent) => orchestrator.registerAgent(agent));

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      analysisScope = 'global',
      insightTypes = ['trend', 'gap', 'recommendation'],
      timeframe,
      filters,
      priority = 'medium',
      userId,
    } = body;

    // Create insight generation task
    const task: AgentTask = {
      id: `insight-task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'insight_generation',
      priority,
      input: {
        analysisScope,
        insightTypes,
        timeframe,
        filters,
        priority: priority === 'critical' ? 'breakthrough' : priority,
      },
      metadata: {
        userId,
        source: 'api_request',
        createdAt: new Date(),
      },
    };

    // Execute through insights generator
    const result = await orchestrator.executeTask(task);

    if (result.status === 'error') {
      return NextResponse.json(
        {
          data: null,
          error: {
            message: result.error?.message || 'Failed to generate insights',
            code: result.error?.code || 'GENERATION_ERROR',
          },
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: {
        task: {
          id: task.id,
          type: task.type,
          status: result.status,
        },
        insights: result.output.insights || [],
        summary: result.output.summary,
        confidence: result.output.confidence,
        metadata: {
          generatedAt: result.output.generatedAt,
          totalPapersAnalyzed: result.output.totalPapersAnalyzed,
          processingTime: result.metadata.duration,
        },
      },
      error: null,
    });
  } catch (error) {
    console.error('Insights generation error:', error);
    return NextResponse.json(
      {
        data: null,
        error: {
          message: 'Failed to generate research insights',
          code: 'GENERATION_ERROR',
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
    const insightType = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit') || '10');
    const significance = searchParams.get('significance');

    // In a real implementation, this would query a database of previously generated insights
    // For now, we'll return sample insights
    const sampleInsights = [
      {
        id: 'insight-1',
        type: 'trend',
        title: 'Rising Interest in 2D Material Electrodes',
        description:
          'Research on 2D materials for MFC electrodes has increased 340% in the last 3 years.',
        significance: 'high',
        confidence: 0.89,
        createdAt: new Date(Date.now() - 86400000), // 1 day ago
        actionable: true,
      },
      {
        id: 'insight-2',
        type: 'gap',
        title: 'Limited Long-term Stability Studies',
        description: 'Only 12% of MFC studies include performance data beyond 6 months.',
        significance: 'high',
        confidence: 0.91,
        createdAt: new Date(Date.now() - 172800000), // 2 days ago
        actionable: true,
      },
      {
        id: 'insight-3',
        type: 'recommendation',
        title: 'Standardize Testing Protocols',
        description:
          'Establishing standardized MFC testing protocols would improve research comparability.',
        significance: 'medium',
        confidence: 0.87,
        createdAt: new Date(Date.now() - 259200000), // 3 days ago
        actionable: true,
      },
    ];

    let filteredInsights = sampleInsights;

    if (insightType) {
      filteredInsights = filteredInsights.filter((insight) => insight.type === insightType);
    }

    if (significance) {
      filteredInsights = filteredInsights.filter(
        (insight) => insight.significance === significance
      );
    }

    filteredInsights = filteredInsights.slice(0, limit);

    return NextResponse.json({
      data: {
        insights: filteredInsights,
        total: filteredInsights.length,
        filters: {
          type: insightType,
          significance,
          limit,
        },
      },
      error: null,
    });
  } catch (error) {
    console.error('Insights API error:', error);
    return NextResponse.json(
      {
        data: null,
        error: {
          message: 'Failed to fetch insights',
          code: 'FETCH_ERROR',
        },
      },
      { status: 500 }
    );
  }
}
