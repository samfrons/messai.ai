import { useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { jobSocketEvents, JobSocketClient } from '../lib/websocket/job-updates';
import { JobStatus } from '../lib/jobs/types';

interface UseJobUpdatesOptions {
  autoConnect?: boolean;
  queues?: string[];
  jobs?: string[];
}

interface JobUpdatesState {
  connected: boolean;
  queueStats: Record<string, any>;
  recentJobs: Record<string, JobStatus[]>;
  jobDetails: Record<string, JobStatus>;
  activeJobs: JobStatus[];
  failedJobs: JobStatus[];
}

export function useJobUpdates(options: UseJobUpdatesOptions = {}) {
  const { autoConnect = true, queues = [], jobs = [] } = options;

  const [state, setState] = useState<JobUpdatesState>({
    connected: false,
    queueStats: {},
    recentJobs: {},
    jobDetails: {},
    activeJobs: [],
    failedJobs: [],
  });

  const socketRef = useRef<Socket | null>(null);

  // Connect to WebSocket
  const connect = useCallback(() => {
    if (socketRef.current?.connected) return;

    const socket = io('/jobs', {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    // Connection handlers
    socket.on(jobSocketEvents.CONNECT, () => {
      setState((prev) => ({ ...prev, connected: true }));
      console.log('Connected to job updates');

      // Subscribe to specified queues
      queues.forEach((queue) => socket.emit(jobSocketEvents.SUBSCRIBE_QUEUE, queue));

      // Subscribe to specified jobs
      jobs.forEach((jobId) => socket.emit(jobSocketEvents.SUBSCRIBE_JOB, jobId));
    });

    socket.on(jobSocketEvents.DISCONNECT, () => {
      setState((prev) => ({ ...prev, connected: false }));
      console.log('Disconnected from job updates');
    });

    // Initial stats
    socket.on(jobSocketEvents.INITIAL_STATS, (data: any) => {
      setState((prev) => ({
        ...prev,
        queueStats: data.queueBreakdown,
        activeJobs: data.recentActivity.filter((job: any) => job.status === 'active'),
        failedJobs: data.recentActivity.filter((job: any) => job.status === 'failed'),
      }));
    });

    // Queue stats updates
    socket.on(jobSocketEvents.QUEUE_STATS, (stats: any) => {
      setState((prev) => ({ ...prev, queueStats: stats }));
    });

    // Job events
    socket.on(jobSocketEvents.JOB_ADDED, ({ queue, job }: any) => {
      setState((prev) => ({
        ...prev,
        recentJobs: {
          ...prev.recentJobs,
          [queue]: [job, ...(prev.recentJobs[queue] || [])].slice(0, 20),
        },
      }));
    });

    socket.on(jobSocketEvents.JOB_ACTIVE, ({ queue, job }: any) => {
      setState((prev) => ({
        ...prev,
        activeJobs: [job, ...prev.activeJobs.filter((j) => j.id !== job.id)].slice(0, 10),
        jobDetails: { ...prev.jobDetails, [job.id]: job },
      }));
    });

    socket.on(jobSocketEvents.JOB_PROGRESS, ({ jobId, progress }: any) => {
      setState((prev) => ({
        ...prev,
        jobDetails: {
          ...prev.jobDetails,
          [jobId]: {
            ...prev.jobDetails[jobId],
            progress,
          },
        },
      }));
    });

    socket.on(jobSocketEvents.JOB_COMPLETED, ({ queue, job }: any) => {
      setState((prev) => ({
        ...prev,
        activeJobs: prev.activeJobs.filter((j) => j.id !== job.id),
        recentJobs: {
          ...prev.recentJobs,
          [queue]: [job, ...(prev.recentJobs[queue] || [])].slice(0, 20),
        },
        jobDetails: { ...prev.jobDetails, [job.id]: job },
      }));
    });

    socket.on(jobSocketEvents.JOB_FAILED, ({ queue, job }: any) => {
      setState((prev) => ({
        ...prev,
        activeJobs: prev.activeJobs.filter((j) => j.id !== job.id),
        failedJobs: [job, ...prev.failedJobs].slice(0, 20),
        jobDetails: { ...prev.jobDetails, [job.id]: job },
      }));
    });

    // Response handlers
    socket.on(jobSocketEvents.RECENT_JOBS, ({ queueName, jobs }: any) => {
      setState((prev) => ({
        ...prev,
        recentJobs: { ...prev.recentJobs, [queueName]: jobs },
      }));
    });

    socket.on(jobSocketEvents.JOB_DETAILS, ({ jobId, job }: any) => {
      if (job) {
        setState((prev) => ({
          ...prev,
          jobDetails: { ...prev.jobDetails, [jobId]: job },
        }));
      }
    });
  }, [queues, jobs]);

  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
  }, []);

  // Client methods
  const client: JobSocketClient = {
    subscribeToQueue: useCallback((queueName: string) => {
      socketRef.current?.emit(jobSocketEvents.SUBSCRIBE_QUEUE, queueName);
    }, []),

    unsubscribeFromQueue: useCallback((queueName: string) => {
      socketRef.current?.emit(jobSocketEvents.UNSUBSCRIBE_QUEUE, queueName);
    }, []),

    subscribeToJob: useCallback((jobId: string) => {
      socketRef.current?.emit(jobSocketEvents.SUBSCRIBE_JOB, jobId);
    }, []),

    unsubscribeFromJob: useCallback((jobId: string) => {
      socketRef.current?.emit(jobSocketEvents.UNSUBSCRIBE_JOB, jobId);
    }, []),

    requestQueueStats: useCallback(() => {
      socketRef.current?.emit(jobSocketEvents.REQUEST_QUEUE_STATS);
    }, []),

    requestRecentJobs: useCallback((queueName: string, status: string, limit: number) => {
      socketRef.current?.emit(jobSocketEvents.REQUEST_RECENT_JOBS, queueName, status, limit);
    }, []),

    requestJobDetails: useCallback((queueName: string, jobId: string) => {
      socketRef.current?.emit(jobSocketEvents.REQUEST_JOB_DETAILS, queueName, jobId);
    }, []),
  };

  // Auto-connect on mount
  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  // Subscribe to new queues/jobs when they change
  useEffect(() => {
    if (socketRef.current?.connected) {
      queues.forEach((queue) => client.subscribeToQueue(queue));
      jobs.forEach((jobId) => client.subscribeToJob(jobId));
    }
  }, [queues, jobs, client]);

  return {
    ...state,
    connect,
    disconnect,
    client,
    isConnected: state.connected,
  };
}

// Hook for monitoring a specific job
export function useJobMonitor(queueName: string, jobId: string) {
  const [job, setJob] = useState<JobStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { connected, client, jobDetails } = useJobUpdates({
    jobs: [jobId],
  });

  // Request job details when connected
  useEffect(() => {
    if (connected && jobId) {
      setLoading(true);
      client.requestJobDetails(queueName, jobId);
    }
  }, [connected, queueName, jobId, client]);

  // Update job state from jobDetails
  useEffect(() => {
    if (jobDetails[jobId]) {
      setJob(jobDetails[jobId]);
      setLoading(false);
      setError(null);
    }
  }, [jobDetails, jobId]);

  // Retry function
  const retry = useCallback(async () => {
    try {
      const response = await fetch(`/api/jobs/${queueName}/${jobId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'retry' }),
      });

      if (!response.ok) {
        throw new Error('Failed to retry job');
      }

      // Request updated job details
      client.requestJobDetails(queueName, jobId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to retry job');
    }
  }, [queueName, jobId, client]);

  // Cancel function
  const cancel = useCallback(async () => {
    try {
      const response = await fetch(`/api/jobs/${queueName}/${jobId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cancel' }),
      });

      if (!response.ok) {
        throw new Error('Failed to cancel job');
      }

      // Request updated job details
      client.requestJobDetails(queueName, jobId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel job');
    }
  }, [queueName, jobId, client]);

  return {
    job,
    loading,
    error,
    retry,
    cancel,
    isActive: job?.status === 'active',
    isCompleted: job?.status === 'completed',
    isFailed: job?.status === 'failed',
    progress: job?.progress,
  };
}

// Hook for queue statistics
export function useQueueStats(queueNames?: string[]) {
  const { queueStats, client, connected } = useJobUpdates({
    queues: queueNames,
  });

  // Request stats periodically
  useEffect(() => {
    if (!connected) return;

    client.requestQueueStats();
    const interval = setInterval(() => {
      client.requestQueueStats();
    }, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, [connected, client]);

  return queueStats;
}
