import { useEffect } from 'react';
import { useWebSocketContext } from '../../hooks/useWebSocket';
import { useAppStore } from '../../stores/useAppStore';
import { usePapersStore } from '../../stores/usePapersStore';
import { useExperimentsStore } from '../../stores/useExperimentsStore';

/**
 * Hook to integrate WebSocket events with Zustand stores
 */
export function useWebSocketStoreSync() {
  const { on, connected } = useWebSocketContext();
  const { addNotification } = useAppStore();
  const { updatePaper, removePaper } = usePapersStore();
  const { updateExperiment, updatePrediction, addRealtimeData } = useExperimentsStore();

  useEffect(() => {
    if (!connected) return;

    // Paper events
    const unsubPaperCreated = on('paper:created', (paper) => {
      addNotification({
        type: 'info',
        title: 'New Paper Added',
        message: `"${paper.title}" has been added to the library`,
      });
    });

    const unsubPaperUpdated = on('paper:updated', (paper) => {
      updatePaper(paper.id, paper);
      addNotification({
        type: 'info',
        title: 'Paper Updated',
        message: `"${paper.title}" has been updated`,
      });
    });

    const unsubPaperDeleted = on('paper:deleted', (paperId) => {
      removePaper(paperId);
      addNotification({
        type: 'warning',
        title: 'Paper Deleted',
        message: 'A paper has been removed from the library',
      });
    });

    // Experiment events
    const unsubExpStarted = on('experiment:started', (experiment) => {
      updateExperiment(experiment.id, {
        status: 'running',
        startedAt: new Date(experiment.startedAt),
      });
      addNotification({
        type: 'success',
        title: 'Experiment Started',
        message: `"${experiment.name}" is now running`,
      });
    });

    const unsubExpProgress = on('experiment:progress', ({ experimentId, progress, status }) => {
      updateExperiment(experimentId, { progress, status: status as any });
    });

    const unsubExpCompleted = on('experiment:completed', (experiment) => {
      updateExperiment(experiment.id, {
        status: 'completed',
        progress: 100,
        completedAt: new Date(experiment.completedAt),
        results: experiment.results,
      });
      addNotification({
        type: 'success',
        title: 'Experiment Completed',
        message: `"${experiment.name}" has completed successfully`,
      });
    });

    const unsubExpFailed = on('experiment:failed', ({ experimentId, error }) => {
      updateExperiment(experimentId, { status: 'failed' });
      addNotification({
        type: 'error',
        title: 'Experiment Failed',
        message: error,
      });
    });

    // Prediction events
    const unsubPredStarted = on('prediction:started', (prediction) => {
      updatePrediction(prediction.id, {
        status: 'processing',
        progress: 0,
      });
    });

    const unsubPredProgress = on('prediction:progress', ({ predictionId, progress, stage }) => {
      updatePrediction(predictionId, { progress, stage });
    });

    const unsubPredCompleted = on('prediction:completed', (prediction) => {
      updatePrediction(prediction.id, {
        status: 'completed',
        progress: 100,
        result: prediction.result,
        completedAt: new Date(),
      });
      addNotification({
        type: 'success',
        title: 'Prediction Completed',
        message: `Your prediction has completed with ${(prediction.result.confidence * 100).toFixed(
          1
        )}% confidence`,
      });
    });

    // Agent events
    const unsubAgentStatus = on('agent:status', ({ agentId, status, message }) => {
      addNotification({
        type: status === 'error' ? 'error' : 'info',
        title: `Agent ${agentId}`,
        message,
      });
    });

    // System events
    const unsubSystemNotif = on('system:notification', ({ type, message, level }) => {
      addNotification({
        type: level,
        title: type,
        message,
      });
    });

    const unsubSystemMaint = on('system:maintenance', ({ scheduled, message }) => {
      addNotification({
        type: 'warning',
        title: scheduled ? 'Scheduled Maintenance' : 'Maintenance Mode',
        message,
      });
    });

    // Cleanup
    return () => {
      unsubPaperCreated();
      unsubPaperUpdated();
      unsubPaperDeleted();
      unsubExpStarted();
      unsubExpProgress();
      unsubExpCompleted();
      unsubExpFailed();
      unsubPredStarted();
      unsubPredProgress();
      unsubPredCompleted();
      unsubAgentStatus();
      unsubSystemNotif();
      unsubSystemMaint();
    };
  }, [
    connected,
    on,
    addNotification,
    updatePaper,
    removePaper,
    updateExperiment,
    updatePrediction,
    addRealtimeData,
  ]);
}

/**
 * Hook to subscribe to real-time experiment data
 */
export function useExperimentRealtimeData(experimentId: string | null) {
  const { on, subscribe, unsubscribe, connected } = useWebSocketContext();
  const { addRealtimeData } = useExperimentsStore();

  useEffect(() => {
    if (!connected || !experimentId) return;

    // Subscribe to experiment room
    subscribe(`experiment:${experimentId}`);

    // Listen for real-time data
    const unsubData = on('experiment:data' as any, (data: any) => {
      if (data.experimentId === experimentId) {
        addRealtimeData(experimentId, {
          timestamp: new Date(data.timestamp),
          voltage: data.voltage,
          current: data.current,
          power: data.power,
          temperature: data.temperature,
          pH: data.pH,
        });
      }
    });

    return () => {
      unsubscribe(`experiment:${experimentId}`);
      unsubData();
    };
  }, [experimentId, connected, on, subscribe, unsubscribe, addRealtimeData]);
}

/**
 * Hook to handle WebSocket authentication with token from auth
 */
export function useWebSocketAuth() {
  const { emit, on, connected, authenticated } = useWebSocketContext();

  useEffect(() => {
    if (!connected || authenticated) return;

    // Get auth token (implement based on your auth system)
    const getAuthToken = async () => {
      try {
        // Example: Get token from your auth system
        const response = await fetch('/api/auth/session');
        const session = await response.json();
        return session?.accessToken;
      } catch (error) {
        console.error('Failed to get auth token:', error);
        return null;
      }
    };

    getAuthToken().then((token) => {
      if (token) {
        emit('authenticate' as any, token);
      }
    });
  }, [connected, authenticated, emit]);
}
