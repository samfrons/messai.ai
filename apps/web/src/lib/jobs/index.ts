/**
 * MESSAI Job Queue System
 *
 * A comprehensive background job processing system for handling
 * asynchronous tasks like paper processing, data analysis,
 * email notifications, and scheduled maintenance.
 */

// Core exports
export * from './types';
export * from './queues';
export * from './utils';
export * from './monitoring';

// Worker management
export { workers, shutdownWorkers, checkWorkerHealth } from './workers';

// Scheduled jobs
export {
  initializeScheduledJobs,
  removeAllScheduledJobs,
  listScheduledJobs,
} from './init-scheduled-jobs';

// Job creators and helpers
export { JobCreators, ScheduleHelpers, JobManagement, JobChain, BatchProcessing } from './utils';

// Monitoring and dashboard
export { JobMonitor, JobDashboard, JOB_EVENTS } from './monitoring';

// Redis connection (for advanced usage)
export { redisConnection } from './redis-connection';

// Re-export BullMQ types for convenience
export type { Job, Queue, Worker, QueueEvents, JobsOptions } from 'bullmq';
