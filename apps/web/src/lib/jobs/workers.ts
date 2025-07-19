import { Worker, Job } from 'bullmq';
import { redisConnection } from './redis-connection';
import { QUEUE_NAMES } from './queues';
import { processPaperJob } from './processors/paper-processing';
import { processEmailJob } from './processors/email-notifications';
import { processExperimentDataJob } from './processors/experiment-data';
import { processDatabaseCleanupJob } from './processors/database-cleanup';
import { processScheduledTaskJob } from './processors/scheduled-tasks';
import { JobData } from './types';

// Worker configuration
const workerOptions = {
  connection: redisConnection,
  concurrency: 5, // Number of jobs processed concurrently
  limiter: {
    max: 10, // Max number of jobs processed
    duration: 1000, // per duration in milliseconds
  },
};

// Create workers for each queue
export const workers = {
  paperProcessing: new Worker<JobData>(QUEUE_NAMES.PAPER_PROCESSING, processPaperJob as any, {
    ...workerOptions,
    concurrency: 3, // Limit concurrent paper processing
  }),

  emailNotifications: new Worker<JobData>(QUEUE_NAMES.EMAIL_NOTIFICATIONS, processEmailJob as any, {
    ...workerOptions,
    concurrency: 10, // Higher concurrency for emails
  }),

  experimentData: new Worker<JobData>(
    QUEUE_NAMES.EXPERIMENT_DATA,
    processExperimentDataJob as any,
    workerOptions
  ),

  databaseCleanup: new Worker<JobData>(
    QUEUE_NAMES.DATABASE_CLEANUP,
    processDatabaseCleanupJob as any,
    {
      ...workerOptions,
      concurrency: 1, // Only one cleanup job at a time
    }
  ),

  scheduledTasks: new Worker<JobData>(QUEUE_NAMES.SCHEDULED_TASKS, processScheduledTaskJob as any, {
    ...workerOptions,
    concurrency: 2, // Limited concurrency for scheduled tasks
  }),
};

// Set up event handlers for all workers
Object.entries(workers).forEach(([name, worker]) => {
  worker.on('completed', (job: Job) => {
    console.log(`✅ [${name}] Job ${job.id} completed`);
  });

  worker.on('failed', (job: Job | undefined, err: Error) => {
    console.error(`❌ [${name}] Job ${job?.id} failed:`, err);
  });

  worker.on('active', (job: Job) => {
    console.log(`🔄 [${name}] Job ${job.id} started`);
  });

  worker.on('progress', (job: Job, progress: number | object) => {
    console.log(`📊 [${name}] Job ${job.id} progress:`, progress);
  });

  worker.on('error', (err: Error) => {
    console.error(`🚨 [${name}] Worker error:`, err);
  });

  worker.on('stalled', (jobId: string) => {
    console.warn(`⚠️ [${name}] Job ${jobId} stalled`);
  });
});

// Graceful shutdown
export async function shutdownWorkers(): Promise<void> {
  console.log('🛑 Shutting down workers...');

  await Promise.all(Object.values(workers).map((worker) => worker.close()));

  console.log('✅ All workers shut down');
}

// Health check for workers
export async function checkWorkerHealth(): Promise<Record<string, any>> {
  const health: Record<string, any> = {};

  for (const [name, worker] of Object.entries(workers)) {
    health[name] = {
      isRunning: worker.isRunning(),
      isPaused: worker.isPaused(),
      jobCount: await worker.getJobCounts(),
    };
  }

  return health;
}

// Pause all workers
export async function pauseAllWorkers(): Promise<void> {
  await Promise.all(Object.values(workers).map((worker) => worker.pause()));
}

// Resume all workers
export async function resumeAllWorkers(): Promise<void> {
  await Promise.all(Object.values(workers).map((worker) => worker.resume()));
}

// Handle process signals for graceful shutdown
if (typeof process !== 'undefined') {
  process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down gracefully...');
    await shutdownWorkers();
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    console.log('SIGINT received, shutting down gracefully...');
    await shutdownWorkers();
    process.exit(0);
  });
}
