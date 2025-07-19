import { Job, JobsOptions, BulkJobOptions } from 'bullmq';
import { getQueue, QUEUE_NAMES } from './queues';
import {
  JobData,
  JobPriority,
  PaperProcessingJobData,
  ExperimentDataJobData,
  EmailNotificationJobData,
  DataExportJobData,
  MLTrainingJobData,
  DatabaseCleanupJobData,
  ScheduledTaskJobData,
} from './types';

// Job creation helpers
export const JobCreators = {
  // Paper processing jobs
  async processPaper(
    paperId: string,
    action: PaperProcessingJobData['action'],
    options?: JobsOptions
  ): Promise<Job> {
    const queue = getQueue(QUEUE_NAMES.PAPER_PROCESSING);
    return queue.add(
      `process-paper-${action}`,
      {
        paperId,
        action,
      } as PaperProcessingJobData,
      {
        ...options,
        priority: JobPriority.NORMAL,
      }
    );
  },

  async processPaperBatch(
    papers: Array<{ paperId: string; action: PaperProcessingJobData['action'] }>,
    options?: BulkJobOptions
  ): Promise<Job[]> {
    const queue = getQueue(QUEUE_NAMES.PAPER_PROCESSING);
    const jobs = papers.map(({ paperId, action }) => ({
      name: `process-paper-${action}`,
      data: { paperId, action } as PaperProcessingJobData,
      opts: options,
    }));
    return queue.addBulk(jobs);
  },

  // Experiment data jobs
  async processExperiment(
    experimentId: string,
    action: ExperimentDataJobData['action'],
    userId: string,
    data?: any,
    options?: JobsOptions
  ): Promise<Job> {
    const queue = getQueue(QUEUE_NAMES.EXPERIMENT_DATA);
    return queue.add(
      `process-experiment-${action}`,
      {
        experimentId,
        action,
        userId,
        data,
      } as ExperimentDataJobData,
      options
    );
  },

  // Email notification jobs
  async sendEmail(
    to: string | string[],
    template: EmailNotificationJobData['template'],
    data: Record<string, any>,
    options?: JobsOptions & { priority?: EmailNotificationJobData['priority'] }
  ): Promise<Job> {
    const queue = getQueue(QUEUE_NAMES.EMAIL_NOTIFICATIONS);
    return queue.add(
      `email-${template}`,
      {
        to,
        template,
        data,
        priority: options?.priority || 'normal',
        subject: '', // Will be filled by template
      } as EmailNotificationJobData,
      {
        ...options,
        priority: options?.priority === 'high' ? JobPriority.HIGH : JobPriority.NORMAL,
      }
    );
  },

  // Data export jobs
  async exportData(
    userId: string,
    exportType: DataExportJobData['exportType'],
    format: DataExportJobData['format'],
    options?: {
      filters?: Record<string, any>;
      email?: string;
      jobOptions?: JobsOptions;
    }
  ): Promise<Job> {
    const queue = getQueue(QUEUE_NAMES.DATA_EXPORT);
    return queue.add(
      `export-${exportType}`,
      {
        userId,
        exportType,
        format,
        filters: options?.filters,
        email: options?.email,
      } as DataExportJobData,
      options?.jobOptions
    );
  },

  // ML training jobs
  async trainModel(
    modelType: MLTrainingJobData['modelType'],
    trainingDataId: string,
    userId: string,
    hyperparameters?: Record<string, any>,
    options?: JobsOptions
  ): Promise<Job> {
    const queue = getQueue(QUEUE_NAMES.ML_TRAINING);
    return queue.add(
      `train-${modelType}`,
      {
        modelType,
        trainingDataId,
        userId,
        hyperparameters,
      } as MLTrainingJobData,
      {
        ...options,
        priority: JobPriority.LOW, // ML training is resource-intensive
      }
    );
  },

  // Database cleanup jobs
  async cleanupDatabase(
    action: DatabaseCleanupJobData['action'],
    options?: {
      olderThanDays?: number;
      dryRun?: boolean;
      jobOptions?: JobsOptions;
    }
  ): Promise<Job> {
    const queue = getQueue(QUEUE_NAMES.DATABASE_CLEANUP);
    return queue.add(
      `cleanup-${action}`,
      {
        action,
        olderThanDays: options?.olderThanDays,
        dryRun: options?.dryRun ?? true, // Default to dry run for safety
      } as DatabaseCleanupJobData,
      {
        ...options?.jobOptions,
        priority: JobPriority.LOW,
      }
    );
  },

  // Scheduled task jobs
  async scheduleTask(
    taskType: ScheduledTaskJobData['taskType'],
    options?: {
      recipients?: string[];
      taskOptions?: Record<string, any>;
      jobOptions?: JobsOptions;
    }
  ): Promise<Job> {
    const queue = getQueue(QUEUE_NAMES.SCHEDULED_TASKS);
    return queue.add(
      `scheduled-${taskType}`,
      {
        taskType,
        recipients: options?.recipients,
        options: options?.taskOptions,
      } as ScheduledTaskJobData,
      options?.jobOptions
    );
  },
};

// Cron job scheduling helpers
export const ScheduleHelpers = {
  // Schedule daily report at 9 AM
  async scheduleDailyReport(recipients: string[]): Promise<Job> {
    const queue = getQueue(QUEUE_NAMES.SCHEDULED_TASKS);
    return queue.add(
      'daily-report',
      {
        taskType: 'daily_report',
        recipients,
      } as ScheduledTaskJobData,
      {
        repeat: {
          pattern: '0 9 * * *', // Every day at 9 AM
          tz: 'America/New_York',
        },
      }
    );
  },

  // Schedule weekly digest on Mondays at 10 AM
  async scheduleWeeklyDigest(recipients: string[]): Promise<Job> {
    const queue = getQueue(QUEUE_NAMES.SCHEDULED_TASKS);
    return queue.add(
      'weekly-digest',
      {
        taskType: 'weekly_digest',
        recipients,
      } as ScheduledTaskJobData,
      {
        repeat: {
          pattern: '0 10 * * 1', // Every Monday at 10 AM
          tz: 'America/New_York',
        },
      }
    );
  },

  // Schedule monthly analytics on the 1st at 8 AM
  async scheduleMonthlyAnalytics(recipients: string[]): Promise<Job> {
    const queue = getQueue(QUEUE_NAMES.SCHEDULED_TASKS);
    return queue.add(
      'monthly-analytics',
      {
        taskType: 'monthly_analytics',
        recipients,
      } as ScheduledTaskJobData,
      {
        repeat: {
          pattern: '0 8 1 * *', // 1st of every month at 8 AM
          tz: 'America/New_York',
        },
      }
    );
  },

  // Schedule system health check every hour
  async scheduleHealthCheck(recipients?: string[]): Promise<Job> {
    const queue = getQueue(QUEUE_NAMES.SCHEDULED_TASKS);
    return queue.add(
      'health-check',
      {
        taskType: 'system_health_check',
        recipients,
      } as ScheduledTaskJobData,
      {
        repeat: {
          pattern: '0 * * * *', // Every hour
        },
      }
    );
  },

  // Schedule database cleanup weekly on Sunday at 2 AM
  async scheduleDatabaseCleanup(): Promise<Job> {
    const queue = getQueue(QUEUE_NAMES.DATABASE_CLEANUP);
    return queue.add(
      'weekly-cleanup',
      {
        action: 'clean_temp_data',
        olderThanDays: 7,
        dryRun: false,
      } as DatabaseCleanupJobData,
      {
        repeat: {
          pattern: '0 2 * * 0', // Every Sunday at 2 AM
          tz: 'America/New_York',
        },
      }
    );
  },
};

// Job management utilities
export const JobManagement = {
  // Get job by ID
  async getJob(queueName: keyof typeof QUEUE_NAMES, jobId: string): Promise<Job | undefined> {
    const queue = getQueue(QUEUE_NAMES[queueName]);
    return queue.getJob(jobId);
  },

  // Cancel a job
  async cancelJob(queueName: keyof typeof QUEUE_NAMES, jobId: string): Promise<boolean> {
    const job = await this.getJob(queueName, jobId);
    if (job) {
      await job.remove();
      return true;
    }
    return false;
  },

  // Retry a failed job
  async retryJob(queueName: keyof typeof QUEUE_NAMES, jobId: string): Promise<boolean> {
    const job = await this.getJob(queueName, jobId);
    if (job && (await job.isFailed())) {
      await job.retry();
      return true;
    }
    return false;
  },

  // Get job counts for a queue
  async getQueueStats(queueName: keyof typeof QUEUE_NAMES) {
    const queue = getQueue(QUEUE_NAMES[queueName]);
    const counts = await queue.getJobCounts();
    const isPaused = await queue.isPaused();

    return {
      name: queueName,
      isPaused,
      counts,
      total: Object.values(counts).reduce((a, b) => a + b, 0),
    };
  },

  // Get all queue stats
  async getAllQueueStats() {
    const stats = await Promise.all(
      Object.keys(QUEUE_NAMES).map((queueName) =>
        this.getQueueStats(queueName as keyof typeof QUEUE_NAMES)
      )
    );
    return stats;
  },

  // Clean completed jobs older than specified hours
  async cleanCompletedJobs(queueName: keyof typeof QUEUE_NAMES, olderThanHours: number = 24) {
    const queue = getQueue(QUEUE_NAMES[queueName]);
    const gracePeriod = olderThanHours * 60 * 60 * 1000; // Convert to milliseconds
    await queue.clean(gracePeriod, 100, 'completed');
  },

  // Clean failed jobs older than specified days
  async cleanFailedJobs(queueName: keyof typeof QUEUE_NAMES, olderThanDays: number = 7) {
    const queue = getQueue(QUEUE_NAMES[queueName]);
    const gracePeriod = olderThanDays * 24 * 60 * 60 * 1000; // Convert to milliseconds
    await queue.clean(gracePeriod, 100, 'failed');
  },

  // Pause a queue
  async pauseQueue(queueName: keyof typeof QUEUE_NAMES): Promise<void> {
    const queue = getQueue(QUEUE_NAMES[queueName]);
    await queue.pause();
  },

  // Resume a queue
  async resumeQueue(queueName: keyof typeof QUEUE_NAMES): Promise<void> {
    const queue = getQueue(QUEUE_NAMES[queueName]);
    await queue.resume();
  },

  // Drain a queue (remove all jobs)
  async drainQueue(queueName: keyof typeof QUEUE_NAMES): Promise<void> {
    const queue = getQueue(QUEUE_NAMES[queueName]);
    await queue.drain();
  },
};

// Job chaining utilities
export class JobChain {
  private jobs: Array<{ queue: string; name: string; data: any; opts?: JobsOptions }> = [];

  add(
    queueName: keyof typeof QUEUE_NAMES,
    name: string,
    data: JobData,
    opts?: JobsOptions
  ): JobChain {
    this.jobs.push({
      queue: QUEUE_NAMES[queueName],
      name,
      data,
      opts,
    });
    return this;
  }

  async execute(): Promise<Job[]> {
    const results: Job[] = [];
    let previousJobId: string | undefined;

    for (const jobConfig of this.jobs) {
      const queue = getQueue(jobConfig.queue as any);
      const opts = {
        ...jobConfig.opts,
      };

      // Chain jobs by making each job depend on the previous one
      if (previousJobId) {
        opts.parent = {
          id: previousJobId,
          queue: results[results.length - 1].queueName,
        };
      }

      const job = await queue.add(jobConfig.name, jobConfig.data, opts);
      results.push(job);
      previousJobId = job.id;
    }

    return results;
  }
}

// Batch processing utilities
export const BatchProcessing = {
  // Process multiple papers in parallel batches
  async processPapersBatch(
    paperIds: string[],
    action: PaperProcessingJobData['action'],
    batchSize: number = 10
  ): Promise<Job[]> {
    const batches = [];
    for (let i = 0; i < paperIds.length; i += batchSize) {
      const batch = paperIds.slice(i, i + batchSize);
      const jobs = await JobCreators.processPaperBatch(
        batch.map((paperId) => ({ paperId, action }))
      );
      batches.push(...jobs);
    }
    return batches;
  },

  // Send batch emails with rate limiting
  async sendBatchEmails(
    recipients: Array<{ email: string; template: EmailNotificationJobData['template']; data: any }>,
    rateLimit: number = 10, // emails per second
    priority: EmailNotificationJobData['priority'] = 'normal'
  ): Promise<Job[]> {
    const queue = getQueue(QUEUE_NAMES.EMAIL_NOTIFICATIONS);
    const jobs = recipients.map((recipient, index) => ({
      name: `email-${recipient.template}`,
      data: {
        to: recipient.email,
        template: recipient.template,
        data: recipient.data,
        priority,
        subject: '',
      } as EmailNotificationJobData,
      opts: {
        delay: Math.floor(index / rateLimit) * 1000, // Spread over time
        priority: priority === 'high' ? JobPriority.HIGH : JobPriority.NORMAL,
      },
    }));

    return queue.addBulk(jobs);
  },
};
