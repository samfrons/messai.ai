import { Queue, QueueEvents, Job } from 'bullmq';
import { Server as SocketIOServer } from 'socket.io';
import { getQueue, getQueueEvents, QUEUE_NAMES, QueueName } from './queues';
import { JobStatus, JobProgress } from './types';

// WebSocket events for job updates
export const JOB_EVENTS = {
  JOB_ADDED: 'job:added',
  JOB_ACTIVE: 'job:active',
  JOB_PROGRESS: 'job:progress',
  JOB_COMPLETED: 'job:completed',
  JOB_FAILED: 'job:failed',
  JOB_REMOVED: 'job:removed',
  QUEUE_STATUS: 'queue:status',
  QUEUE_STATS: 'queue:stats',
} as const;

// Job monitoring service
export class JobMonitor {
  private io?: SocketIOServer;
  private eventListeners: Map<string, QueueEvents> = new Map();
  private updateInterval?: NodeJS.Timeout;

  constructor(io?: SocketIOServer) {
    this.io = io;
    this.setupEventListeners();
    this.startPeriodicUpdates();
  }

  // Set up event listeners for all queues
  private setupEventListeners() {
    Object.entries(QUEUE_NAMES).forEach(([_, queueName]) => {
      const events = getQueueEvents(queueName);
      this.eventListeners.set(queueName, events);

      // Job added
      events.on('added', ({ jobId, name }) => {
        this.handleJobAdded(queueName, jobId, name);
      });

      // Job started
      events.on('active', ({ jobId, prev }) => {
        this.handleJobActive(queueName, jobId, prev);
      });

      // Job progress
      events.on('progress', ({ jobId, data }) => {
        this.handleJobProgress(queueName, jobId, data);
      });

      // Job completed
      events.on('completed', ({ jobId, returnvalue }) => {
        this.handleJobCompleted(queueName, jobId, returnvalue);
      });

      // Job failed
      events.on('failed', ({ jobId, failedReason }) => {
        this.handleJobFailed(queueName, jobId, failedReason);
      });

      // Job removed
      events.on('removed', ({ jobId }) => {
        this.handleJobRemoved(queueName, jobId);
      });
    });
  }

  // Start periodic updates for queue statistics
  private startPeriodicUpdates() {
    // Update queue stats every 5 seconds
    this.updateInterval = setInterval(() => {
      this.broadcastQueueStats();
    }, 5000);
  }

  // Broadcast queue statistics
  private async broadcastQueueStats() {
    const stats = await this.getAllQueueStats();
    this.broadcast(JOB_EVENTS.QUEUE_STATS, stats);
  }

  // Get all queue statistics
  async getAllQueueStats() {
    const stats: Record<string, any> = {};

    for (const queueName of Object.values(QUEUE_NAMES)) {
      const queue = getQueue(queueName);
      const counts = await queue.getJobCounts();
      const isPaused = await queue.isPaused();
      const workerCount = await queue.getWorkerCount();

      stats[queueName] = {
        name: queueName,
        isPaused,
        workerCount,
        counts,
        total: Object.values(counts).reduce((a, b) => a + b, 0),
      };
    }

    return stats;
  }

  // Get recent jobs for a queue
  async getRecentJobs(
    queueName: QueueName,
    status: 'waiting' | 'active' | 'completed' | 'failed' = 'completed',
    limit: number = 10
  ): Promise<JobStatus[]> {
    const queue = getQueue(queueName);
    const jobs = await queue.getJobs([status], 0, limit - 1);

    return Promise.all(jobs.map((job) => this.formatJobStatus(job, queueName)));
  }

  // Get job details
  async getJobDetails(queueName: QueueName, jobId: string): Promise<JobStatus | null> {
    const queue = getQueue(queueName);
    const job = await queue.getJob(jobId);

    if (!job) return null;

    return this.formatJobStatus(job, queueName);
  }

  // Format job for frontend display
  private async formatJobStatus(job: Job, queueName: string): Promise<JobStatus> {
    const state = await job.getState();
    const progress = job.progress;

    return {
      id: job.id!,
      name: job.name,
      queue: queueName,
      status: state as JobStatus['status'],
      progress: typeof progress === 'object' ? (progress as JobProgress) : undefined,
      data: job.data,
      result: job.returnvalue,
      createdAt: new Date(job.timestamp),
      processedAt: job.processedOn ? new Date(job.processedOn) : undefined,
      completedAt: job.finishedOn ? new Date(job.finishedOn) : undefined,
      failedReason: job.failedReason,
      attempts: job.attemptsMade,
      maxAttempts: job.opts.attempts || 1,
    };
  }

  // Event handlers
  private async handleJobAdded(queueName: string, jobId: string, name: string) {
    const queue = getQueue(queueName as QueueName);
    const job = await queue.getJob(jobId);
    if (job) {
      const jobStatus = await this.formatJobStatus(job, queueName);
      this.broadcast(JOB_EVENTS.JOB_ADDED, { queue: queueName, job: jobStatus });
    }
  }

  private async handleJobActive(queueName: string, jobId: string, prev: string) {
    const queue = getQueue(queueName as QueueName);
    const job = await queue.getJob(jobId);
    if (job) {
      const jobStatus = await this.formatJobStatus(job, queueName);
      this.broadcast(JOB_EVENTS.JOB_ACTIVE, { queue: queueName, job: jobStatus, prev });
    }
  }

  private handleJobProgress(queueName: string, jobId: string, progress: any) {
    this.broadcast(JOB_EVENTS.JOB_PROGRESS, { queue: queueName, jobId, progress });
  }

  private async handleJobCompleted(queueName: string, jobId: string, returnvalue: any) {
    const queue = getQueue(queueName as QueueName);
    const job = await queue.getJob(jobId);
    if (job) {
      const jobStatus = await this.formatJobStatus(job, queueName);
      this.broadcast(JOB_EVENTS.JOB_COMPLETED, {
        queue: queueName,
        job: jobStatus,
        result: returnvalue,
      });
    }
  }

  private async handleJobFailed(queueName: string, jobId: string, failedReason: string) {
    const queue = getQueue(queueName as QueueName);
    const job = await queue.getJob(jobId);
    if (job) {
      const jobStatus = await this.formatJobStatus(job, queueName);
      this.broadcast(JOB_EVENTS.JOB_FAILED, { queue: queueName, job: jobStatus, failedReason });
    }
  }

  private handleJobRemoved(queueName: string, jobId: string) {
    this.broadcast(JOB_EVENTS.JOB_REMOVED, { queue: queueName, jobId });
  }

  // Broadcast event to all connected clients
  private broadcast(event: string, data: any) {
    if (this.io) {
      this.io.emit(event, data);
    }
  }

  // Clean up resources
  async cleanup() {
    // Stop periodic updates
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }

    // Remove event listeners
    for (const events of this.eventListeners.values()) {
      await events.close();
    }
    this.eventListeners.clear();
  }
}

// Dashboard data aggregation
export class JobDashboard {
  // Get dashboard overview data
  static async getOverview() {
    const queues = Object.values(QUEUE_NAMES);
    const overview = {
      totalJobs: 0,
      activeJobs: 0,
      completedJobs: 0,
      failedJobs: 0,
      queueBreakdown: {} as Record<string, any>,
      recentActivity: [] as any[],
      systemHealth: 'healthy' as 'healthy' | 'warning' | 'critical',
    };

    // Aggregate queue statistics
    for (const queueName of queues) {
      const queue = getQueue(queueName);
      const counts = await queue.getJobCounts();

      overview.totalJobs += Object.values(counts).reduce((a, b) => a + b, 0);
      overview.activeJobs += counts.active;
      overview.completedJobs += counts.completed;
      overview.failedJobs += counts.failed;

      overview.queueBreakdown[queueName] = counts;
    }

    // Get recent activity
    overview.recentActivity = await this.getRecentActivity(10);

    // Determine system health
    const failureRate = overview.failedJobs / (overview.totalJobs || 1);
    if (failureRate > 0.1) {
      overview.systemHealth = 'critical';
    } else if (failureRate > 0.05) {
      overview.systemHealth = 'warning';
    }

    return overview;
  }

  // Get recent activity across all queues
  static async getRecentActivity(limit: number = 20) {
    const activities: any[] = [];

    for (const queueName of Object.values(QUEUE_NAMES)) {
      const queue = getQueue(queueName);

      // Get recent completed jobs
      const completed = await queue.getJobs(['completed'], 0, 5);
      // Get recent failed jobs
      const failed = await queue.getJobs(['failed'], 0, 5);

      for (const job of [...completed, ...failed]) {
        const state = await job.getState();
        activities.push({
          queue: queueName,
          jobId: job.id,
          jobName: job.name,
          status: state,
          timestamp: job.finishedOn || job.processedOn || job.timestamp,
          duration: job.finishedOn && job.processedOn ? job.finishedOn - job.processedOn : null,
        });
      }
    }

    // Sort by timestamp and limit
    return activities.sort((a, b) => b.timestamp - a.timestamp).slice(0, limit);
  }

  // Get performance metrics
  static async getPerformanceMetrics(timeRange: 'hour' | 'day' | 'week' = 'hour') {
    const metrics = {
      throughput: {} as Record<string, number>,
      averageDuration: {} as Record<string, number>,
      successRate: {} as Record<string, number>,
      queueUtilization: {} as Record<string, number>,
    };

    const timeRanges = {
      hour: 60 * 60 * 1000,
      day: 24 * 60 * 60 * 1000,
      week: 7 * 24 * 60 * 60 * 1000,
    };

    const since = Date.now() - timeRanges[timeRange];

    for (const queueName of Object.values(QUEUE_NAMES)) {
      const queue = getQueue(queueName);

      // Get completed jobs in time range
      const completed = await queue.getJobs(['completed'], 0, 1000);
      const recentCompleted = completed.filter((job) => job.finishedOn && job.finishedOn > since);

      // Calculate metrics
      metrics.throughput[queueName] = recentCompleted.length;

      if (recentCompleted.length > 0) {
        const durations = recentCompleted
          .filter((job) => job.finishedOn && job.processedOn)
          .map((job) => job.finishedOn! - job.processedOn!);

        metrics.averageDuration[queueName] =
          durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : 0;
      }

      // Get failed jobs for success rate
      const failed = await queue.getJobs(['failed'], 0, 1000);
      const recentFailed = failed.filter((job) => job.finishedOn && job.finishedOn > since);

      const total = recentCompleted.length + recentFailed.length;
      metrics.successRate[queueName] = total > 0 ? (recentCompleted.length / total) * 100 : 100;

      // Queue utilization (active jobs / worker capacity)
      const counts = await queue.getJobCounts();
      const workerCount = await queue.getWorkerCount();
      metrics.queueUtilization[queueName] =
        workerCount > 0 ? (counts.active / workerCount) * 100 : 0;
    }

    return metrics;
  }

  // Get failed job analysis
  static async getFailedJobAnalysis() {
    const analysis = {
      byQueue: {} as Record<string, any>,
      byError: {} as Record<string, number>,
      recentFailures: [] as any[],
    };

    for (const queueName of Object.values(QUEUE_NAMES)) {
      const queue = getQueue(queueName);
      const failed = await queue.getJobs(['failed'], 0, 100);

      analysis.byQueue[queueName] = {
        count: failed.length,
        errors: {} as Record<string, number>,
      };

      for (const job of failed) {
        const errorType = this.categorizeError(job.failedReason || 'Unknown error');

        // Count by queue
        analysis.byQueue[queueName].errors[errorType] =
          (analysis.byQueue[queueName].errors[errorType] || 0) + 1;

        // Count overall
        analysis.byError[errorType] = (analysis.byError[errorType] || 0) + 1;

        // Add to recent failures
        if (analysis.recentFailures.length < 20) {
          analysis.recentFailures.push({
            queue: queueName,
            jobId: job.id,
            jobName: job.name,
            error: job.failedReason,
            errorType,
            timestamp: job.finishedOn || job.timestamp,
            attempts: job.attemptsMade,
          });
        }
      }
    }

    // Sort recent failures by timestamp
    analysis.recentFailures.sort((a, b) => b.timestamp - a.timestamp);

    return analysis;
  }

  // Categorize error types for analysis
  private static categorizeError(error: string): string {
    if (error.includes('timeout')) return 'Timeout';
    if (error.includes('connection')) return 'Connection Error';
    if (error.includes('not found')) return 'Not Found';
    if (error.includes('permission') || error.includes('unauthorized')) return 'Permission Error';
    if (error.includes('validation')) return 'Validation Error';
    if (error.includes('rate limit')) return 'Rate Limit';
    return 'Other';
  }
}
