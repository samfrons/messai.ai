import { Queue, Worker, QueueEvents } from 'bullmq';
import { redisConnection } from './redis-connection';

// Queue names
export const QUEUE_NAMES = {
  PAPER_PROCESSING: 'paper-processing',
  EXPERIMENT_DATA: 'experiment-data',
  EMAIL_NOTIFICATIONS: 'email-notifications',
  DATA_EXPORT: 'data-export',
  ML_TRAINING: 'ml-training',
  DATABASE_CLEANUP: 'database-cleanup',
  SCHEDULED_TASKS: 'scheduled-tasks',
} as const;

export type QueueName = (typeof QUEUE_NAMES)[keyof typeof QUEUE_NAMES];

// Default job options
export const defaultJobOptions = {
  attempts: 3,
  backoff: {
    type: 'exponential' as const,
    delay: 2000,
  },
  removeOnComplete: {
    count: 100, // Keep last 100 completed jobs
    age: 24 * 3600, // Remove completed jobs older than 24 hours
  },
  removeOnFail: {
    count: 500, // Keep last 500 failed jobs
    age: 7 * 24 * 3600, // Remove failed jobs older than 7 days
  },
};

// Queue instances
export const queues: Record<QueueName, Queue> = {
  [QUEUE_NAMES.PAPER_PROCESSING]: new Queue(QUEUE_NAMES.PAPER_PROCESSING, {
    connection: redisConnection,
    defaultJobOptions: {
      ...defaultJobOptions,
      attempts: 5, // More retries for paper processing
    },
  }),
  [QUEUE_NAMES.EXPERIMENT_DATA]: new Queue(QUEUE_NAMES.EXPERIMENT_DATA, {
    connection: redisConnection,
    defaultJobOptions,
  }),
  [QUEUE_NAMES.EMAIL_NOTIFICATIONS]: new Queue(QUEUE_NAMES.EMAIL_NOTIFICATIONS, {
    connection: redisConnection,
    defaultJobOptions: {
      ...defaultJobOptions,
      attempts: 1, // Don't retry emails too many times
    },
  }),
  [QUEUE_NAMES.DATA_EXPORT]: new Queue(QUEUE_NAMES.DATA_EXPORT, {
    connection: redisConnection,
    defaultJobOptions,
  }),
  [QUEUE_NAMES.ML_TRAINING]: new Queue(QUEUE_NAMES.ML_TRAINING, {
    connection: redisConnection,
    defaultJobOptions: {
      ...defaultJobOptions,
      attempts: 1, // ML training jobs are expensive, don't retry automatically
    },
  }),
  [QUEUE_NAMES.DATABASE_CLEANUP]: new Queue(QUEUE_NAMES.DATABASE_CLEANUP, {
    connection: redisConnection,
    defaultJobOptions,
  }),
  [QUEUE_NAMES.SCHEDULED_TASKS]: new Queue(QUEUE_NAMES.SCHEDULED_TASKS, {
    connection: redisConnection,
    defaultJobOptions,
  }),
};

// Queue events for monitoring
export const queueEvents: Record<QueueName, QueueEvents> = Object.entries(QUEUE_NAMES).reduce(
  (acc, [key, queueName]) => {
    acc[queueName] = new QueueEvents(queueName, {
      connection: redisConnection,
    });
    return acc;
  },
  {} as Record<QueueName, QueueEvents>
);

// Helper to get queue by name
export function getQueue(queueName: QueueName): Queue {
  return queues[queueName];
}

// Helper to get queue events by name
export function getQueueEvents(queueName: QueueName): QueueEvents {
  return queueEvents[queueName];
}
