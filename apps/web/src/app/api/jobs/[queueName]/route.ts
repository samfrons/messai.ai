import { NextRequest, NextResponse } from 'next/server';
import { JobManagement } from '../../../../lib/jobs/utils';
import { QUEUE_NAMES } from '../../../../lib/jobs/queues';
import { JobMonitor } from '../../../../lib/jobs/monitoring';

// GET /api/jobs/[queueName] - Get queue-specific information
export async function GET(request: NextRequest, { params }: { params: { queueName: string } }) {
  try {
    const queueName = params.queueName as keyof typeof QUEUE_NAMES;

    if (!QUEUE_NAMES[queueName]) {
      return NextResponse.json({ error: 'Invalid queue name' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const view = searchParams.get('view') || 'stats';

    const monitor = new JobMonitor();

    switch (view) {
      case 'stats':
        const stats = await JobManagement.getQueueStats(queueName);
        return NextResponse.json(stats);

      case 'jobs':
        const status = (searchParams.get('status') as any) || 'completed';
        const limit = parseInt(searchParams.get('limit') || '10');
        const jobs = await monitor.getRecentJobs(QUEUE_NAMES[queueName], status, limit);
        await monitor.cleanup();
        return NextResponse.json(jobs);

      default:
        return NextResponse.json({ error: 'Invalid view parameter' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error fetching queue data:', error);
    return NextResponse.json({ error: 'Failed to fetch queue data' }, { status: 500 });
  }
}

// POST /api/jobs/[queueName] - Control queue operations
export async function POST(request: NextRequest, { params }: { params: { queueName: string } }) {
  try {
    const queueName = params.queueName as keyof typeof QUEUE_NAMES;

    if (!QUEUE_NAMES[queueName]) {
      return NextResponse.json({ error: 'Invalid queue name' }, { status: 404 });
    }

    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'pause':
        await JobManagement.pauseQueue(queueName);
        return NextResponse.json({ message: `Queue ${queueName} paused` });

      case 'resume':
        await JobManagement.resumeQueue(queueName);
        return NextResponse.json({ message: `Queue ${queueName} resumed` });

      case 'drain':
        await JobManagement.drainQueue(queueName);
        return NextResponse.json({ message: `Queue ${queueName} drained` });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error controlling queue:', error);
    return NextResponse.json({ error: 'Failed to control queue' }, { status: 500 });
  }
}
