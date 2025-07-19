import { NextRequest, NextResponse } from 'next/server';
import { JobManagement, JobCreators } from '../../../lib/jobs/utils';
import { QUEUE_NAMES } from '../../../lib/jobs/queues';
import { JobDashboard } from '../../../lib/jobs/monitoring';

// GET /api/jobs - Get job queue statistics and dashboard data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const view = searchParams.get('view') || 'overview';

    switch (view) {
      case 'overview':
        const overview = await JobDashboard.getOverview();
        return NextResponse.json(overview);

      case 'queues':
        const queueStats = await JobManagement.getAllQueueStats();
        return NextResponse.json(queueStats);

      case 'performance':
        const timeRange = (searchParams.get('timeRange') as 'hour' | 'day' | 'week') || 'hour';
        const performance = await JobDashboard.getPerformanceMetrics(timeRange);
        return NextResponse.json(performance);

      case 'failures':
        const failures = await JobDashboard.getFailedJobAnalysis();
        return NextResponse.json(failures);

      case 'activity':
        const limit = parseInt(searchParams.get('limit') || '20');
        const activity = await JobDashboard.getRecentActivity(limit);
        return NextResponse.json(activity);

      default:
        return NextResponse.json({ error: 'Invalid view parameter' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error fetching job data:', error);
    return NextResponse.json({ error: 'Failed to fetch job data' }, { status: 500 });
  }
}

// POST /api/jobs - Create a new job
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, data } = body;

    let job;
    switch (type) {
      case 'paper_processing':
        job = await JobCreators.processPaper(data.paperId, data.action, data.options);
        break;

      case 'experiment_data':
        job = await JobCreators.processExperiment(
          data.experimentId,
          data.action,
          data.userId,
          data.experimentData,
          data.options
        );
        break;

      case 'email_notification':
        job = await JobCreators.sendEmail(data.to, data.template, data.templateData, data.options);
        break;

      case 'data_export':
        job = await JobCreators.exportData(data.userId, data.exportType, data.format, {
          filters: data.filters,
          email: data.email,
          jobOptions: data.options,
        });
        break;

      case 'ml_training':
        job = await JobCreators.trainModel(
          data.modelType,
          data.trainingDataId,
          data.userId,
          data.hyperparameters,
          data.options
        );
        break;

      case 'database_cleanup':
        job = await JobCreators.cleanupDatabase(data.action, {
          olderThanDays: data.olderThanDays,
          dryRun: data.dryRun,
          jobOptions: data.options,
        });
        break;

      case 'scheduled_task':
        job = await JobCreators.scheduleTask(data.taskType, {
          recipients: data.recipients,
          taskOptions: data.taskOptions,
          jobOptions: data.options,
        });
        break;

      default:
        return NextResponse.json({ error: 'Invalid job type' }, { status: 400 });
    }

    return NextResponse.json({
      jobId: job.id,
      queue: job.queueName,
      status: 'created',
    });
  } catch (error) {
    console.error('Error creating job:', error);
    return NextResponse.json({ error: 'Failed to create job' }, { status: 500 });
  }
}

// DELETE /api/jobs - Clean old jobs
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queue = searchParams.get('queue') as keyof typeof QUEUE_NAMES;
    const status = searchParams.get('status') as 'completed' | 'failed';
    const olderThan = parseInt(searchParams.get('olderThan') || '24');

    if (!queue || !status) {
      return NextResponse.json(
        { error: 'Queue and status parameters are required' },
        { status: 400 }
      );
    }

    if (status === 'completed') {
      await JobManagement.cleanCompletedJobs(queue, olderThan);
    } else if (status === 'failed') {
      await JobManagement.cleanFailedJobs(queue, olderThan / 24); // Convert hours to days
    }

    return NextResponse.json({
      message: `Cleaned ${status} jobs older than ${olderThan} hours from ${queue} queue`,
    });
  } catch (error) {
    console.error('Error cleaning jobs:', error);
    return NextResponse.json({ error: 'Failed to clean jobs' }, { status: 500 });
  }
}
