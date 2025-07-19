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

// Lazy-loaded queue instances to prevent build-time initialization
let _queues: Record<QueueName, Queue> | null = null;
let _queueEvents: Record<QueueName, QueueEvents> | null = null;

// Initialize queues lazily
function initializeQueues(): Record<QueueName, Queue> {
  if (!_queues) {
    _queues = {
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
  }
  return _queues;
}

// Initialize queue events lazily
function initializeQueueEvents(): Record<QueueName, QueueEvents> {
  if (!_queueEvents) {
    _queueEvents = Object.entries(QUEUE_NAMES).reduce((acc, [key, queueName]) => {
      acc[queueName] = new QueueEvents(queueName, {
        connection: redisConnection,
      });
      return acc;
    }, {} as Record<QueueName, QueueEvents>);
  }
  return _queueEvents;
}

// Queue instances proxy for backward compatibility
export const queues = new Proxy({} as Record<QueueName, Queue>, {
  get(target, prop) {
    return initializeQueues()[prop as QueueName];
  },
  has(target, prop) {
    return prop in QUEUE_NAMES;
  },
  ownKeys() {
    return Object.values(QUEUE_NAMES);
  },
  getOwnPropertyDescriptor(target, prop) {
    if (prop in QUEUE_NAMES) {
      return {
        enumerable: true,
        configurable: true,
      };
    }
  },
});

// Queue events proxy for backward compatibility
export const queueEvents = new Proxy({} as Record<QueueName, QueueEvents>, {
  get(target, prop) {
    return initializeQueueEvents()[prop as QueueName];
  },
  has(target, prop) {
    return prop in QUEUE_NAMES;
  },
  ownKeys() {
    return Object.values(QUEUE_NAMES);
  },
  getOwnPropertyDescriptor(target, prop) {
    if (prop in QUEUE_NAMES) {
      return {
        enumerable: true,
        configurable: true,
      };
    }
  },
});

// Helper to get queue by name
export function getQueue(queueName: QueueName): Queue {
  return initializeQueues()[queueName];
}

// Helper to get queue events by name
export function getQueueEvents(queueName: QueueName): QueueEvents {
  return initializeQueueEvents()[queueName];
}
