import { Server as SocketIOServer, Socket } from 'socket.io';
import { JobMonitor, JOB_EVENTS } from '../jobs/monitoring';
import { QUEUE_NAMES } from '../jobs/queues';

// Job WebSocket namespace
const JOB_NAMESPACE = '/jobs';

// Initialize job updates WebSocket handling
export function initializeJobWebSocket(io: SocketIOServer) {
  // Create job namespace
  const jobNamespace = io.of(JOB_NAMESPACE);

  // Initialize job monitor with WebSocket server
  const jobMonitor = new JobMonitor(jobNamespace as any);

  // Handle client connections
  jobNamespace.on('connection', (socket: Socket) => {
    console.log(`✅ Client connected to job updates: ${socket.id}`);

    // Send initial queue stats on connection
    sendInitialStats(socket);

    // Handle client requests
    socket.on('subscribe:queue', (queueName: string) => {
      if (Object.values(QUEUE_NAMES).includes(queueName as any)) {
        socket.join(`queue:${queueName}`);
        console.log(`Client ${socket.id} subscribed to queue: ${queueName}`);
      }
    });

    socket.on('unsubscribe:queue', (queueName: string) => {
      socket.leave(`queue:${queueName}`);
      console.log(`Client ${socket.id} unsubscribed from queue: ${queueName}`);
    });

    socket.on('subscribe:job', (jobId: string) => {
      socket.join(`job:${jobId}`);
      console.log(`Client ${socket.id} subscribed to job: ${jobId}`);
    });

    socket.on('unsubscribe:job', (jobId: string) => {
      socket.leave(`job:${jobId}`);
      console.log(`Client ${socket.id} unsubscribed from job: ${jobId}`);
    });

    // Request specific data
    socket.on('request:queue-stats', async () => {
      const stats = await jobMonitor.getAllQueueStats();
      socket.emit(JOB_EVENTS.QUEUE_STATS, stats);
    });

    socket.on('request:recent-jobs', async (queueName: string, status: string, limit: number) => {
      if (Object.values(QUEUE_NAMES).includes(queueName as any)) {
        const jobs = await jobMonitor.getRecentJobs(queueName as any, status as any, limit);
        socket.emit('recent-jobs', { queueName, status, jobs });
      }
    });

    socket.on('request:job-details', async (queueName: string, jobId: string) => {
      if (Object.values(QUEUE_NAMES).includes(queueName as any)) {
        const job = await jobMonitor.getJobDetails(queueName as any, jobId);
        socket.emit('job-details', { queueName, jobId, job });
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`❌ Client disconnected from job updates: ${socket.id}`);
    });
  });

  // Clean up on server shutdown
  process.on('SIGTERM', async () => {
    await jobMonitor.cleanup();
  });

  return jobMonitor;
}

// Send initial stats to newly connected client
async function sendInitialStats(socket: Socket) {
  try {
    const { JobDashboard } = await import('../jobs/monitoring');
    const overview = await JobDashboard.getOverview();
    socket.emit('initial-stats', overview);
  } catch (error) {
    console.error('Error sending initial stats:', error);
  }
}

// Client-side hooks for React components
export const jobSocketEvents = {
  // Connection events
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',

  // Subscription events
  SUBSCRIBE_QUEUE: 'subscribe:queue',
  UNSUBSCRIBE_QUEUE: 'unsubscribe:queue',
  SUBSCRIBE_JOB: 'subscribe:job',
  UNSUBSCRIBE_JOB: 'unsubscribe:job',

  // Request events
  REQUEST_QUEUE_STATS: 'request:queue-stats',
  REQUEST_RECENT_JOBS: 'request:recent-jobs',
  REQUEST_JOB_DETAILS: 'request:job-details',

  // Response events
  INITIAL_STATS: 'initial-stats',
  RECENT_JOBS: 'recent-jobs',
  JOB_DETAILS: 'job-details',

  // Job events (from JOB_EVENTS)
  ...JOB_EVENTS,
} as const;

// Type definitions for client-side usage
export interface JobSocketClient {
  subscribeToQueue(queueName: string): void;
  unsubscribeFromQueue(queueName: string): void;
  subscribeToJob(jobId: string): void;
  unsubscribeFromJob(jobId: string): void;
  requestQueueStats(): void;
  requestRecentJobs(queueName: string, status: string, limit: number): void;
  requestJobDetails(queueName: string, jobId: string): void;
}
