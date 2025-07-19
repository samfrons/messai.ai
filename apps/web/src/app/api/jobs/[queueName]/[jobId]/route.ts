import { NextRequest, NextResponse } from 'next/server';
import { JobManagement } from '../../../../../lib/jobs/utils';
import { QUEUE_NAMES } from '../../../../../lib/jobs/queues';
import { JobMonitor } from '../../../../../lib/jobs/monitoring';

// GET /api/jobs/[queueName]/[jobId] - Get specific job details
export async function GET(
  request: NextRequest,
  { params }: { params: { queueName: string; jobId: string } }
) {
  try {
    const queueName = params.queueName as keyof typeof QUEUE_NAMES;
    const jobId = params.jobId;

    if (!QUEUE_NAMES[queueName]) {
      return NextResponse.json({ error: 'Invalid queue name' }, { status: 404 });
    }

    const monitor = new JobMonitor();
    const job = await monitor.getJobDetails(QUEUE_NAMES[queueName], jobId);
    await monitor.cleanup();

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    return NextResponse.json(job);
  } catch (error) {
    console.error('Error fetching job:', error);
    return NextResponse.json({ error: 'Failed to fetch job' }, { status: 500 });
  }
}

// POST /api/jobs/[queueName]/[jobId] - Control specific job
export async function POST(
  request: NextRequest,
  { params }: { params: { queueName: string; jobId: string } }
) {
  try {
    const queueName = params.queueName as keyof typeof QUEUE_NAMES;
    const jobId = params.jobId;

    if (!QUEUE_NAMES[queueName]) {
      return NextResponse.json({ error: 'Invalid queue name' }, { status: 404 });
    }

    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'retry':
        const retried = await JobManagement.retryJob(queueName, jobId);
        if (retried) {
          return NextResponse.json({ message: 'Job retried successfully' });
        } else {
          return NextResponse.json(
            { error: 'Failed to retry job - job may not be in failed state' },
            { status: 400 }
          );
        }

      case 'cancel':
        const cancelled = await JobManagement.cancelJob(queueName, jobId);
        if (cancelled) {
          return NextResponse.json({ message: 'Job cancelled successfully' });
        } else {
          return NextResponse.json({ error: 'Failed to cancel job' }, { status: 400 });
        }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error controlling job:', error);
    return NextResponse.json({ error: 'Failed to control job' }, { status: 500 });
  }
}

// DELETE /api/jobs/[queueName]/[jobId] - Remove specific job
export async function DELETE(
  request: NextRequest,
  { params }: { params: { queueName: string; jobId: string } }
) {
  try {
    const queueName = params.queueName as keyof typeof QUEUE_NAMES;
    const jobId = params.jobId;

    if (!QUEUE_NAMES[queueName]) {
      return NextResponse.json({ error: 'Invalid queue name' }, { status: 404 });
    }

    const removed = await JobManagement.cancelJob(queueName, jobId);

    if (removed) {
      return NextResponse.json({ message: 'Job removed successfully' });
    } else {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('Error removing job:', error);
    return NextResponse.json({ error: 'Failed to remove job' }, { status: 500 });
  }
}
