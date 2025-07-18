'use client';

import { useState, useEffect, useCallback } from 'react';

export interface RealTimeUpdate {
  id: string;
  timestamp: number;
  type: 'parameter' | 'model' | 'simulation' | 'system';
  message: string;
  data?: any;
}

export interface RealTimeStatus {
  connected: boolean;
  lastUpdate: number;
  updates: RealTimeUpdate[];
  connectionQuality: 'excellent' | 'good' | 'poor' | 'disconnected';
}

export function useRealTimeUpdates() {
  const [status, setStatus] = useState<RealTimeStatus>({
    connected: false,
    lastUpdate: Date.now(),
    updates: [],
    connectionQuality: 'disconnected',
  });

  const [subscribers, setSubscribers] = useState<Set<(update: RealTimeUpdate) => void>>(new Set());

  // Simulate real-time connection
  useEffect(() => {
    const connectTimer = setTimeout(() => {
      setStatus((prev) => ({
        ...prev,
        connected: true,
        connectionQuality: 'excellent',
      }));
    }, 1000);

    return () => clearTimeout(connectTimer);
  }, []);

  // Simulate periodic updates
  useEffect(() => {
    if (!status.connected) return;

    const interval = setInterval(
      () => {
        const updateTypes = ['parameter', 'model', 'simulation', 'system'] as const;
        const messages = {
          parameter: 'Parameter updated in real-time',
          model: 'Model configuration synchronized',
          simulation: 'Simulation results updated',
          system: 'System performance metrics refreshed',
        };

        const typeIndex = Math.floor(Math.random() * updateTypes.length);
        const type = updateTypes[typeIndex];
        if (!type) return; // Type guard

        const newUpdate: RealTimeUpdate = {
          id: `update-${Date.now()}`,
          timestamp: Date.now(),
          type,
          message: messages[type],
          data: {
            value: Math.random() * 100,
            confidence: Math.random() * 0.5 + 0.5,
          },
        };

        setStatus((prev) => ({
          ...prev,
          lastUpdate: Date.now(),
          updates: [...prev.updates.slice(-19), newUpdate], // Keep last 20 updates
        }));

        // Notify subscribers
        subscribers.forEach((callback) => callback(newUpdate));
      },
      3000 + Math.random() * 2000
    ); // Random interval between 3-5 seconds

    return () => clearInterval(interval);
  }, [status.connected, subscribers]);

  // Connection quality monitoring
  useEffect(() => {
    const qualityTimer = setInterval(() => {
      if (!status.connected) return;

      const timeSinceUpdate = Date.now() - status.lastUpdate;
      let quality: RealTimeStatus['connectionQuality'] = 'excellent';

      if (timeSinceUpdate > 10000) {
        quality = 'poor';
      } else if (timeSinceUpdate > 5000) {
        quality = 'good';
      }

      setStatus((prev) => ({
        ...prev,
        connectionQuality: quality,
      }));
    }, 1000);

    return () => clearInterval(qualityTimer);
  }, [status.lastUpdate, status.connected]);

  const subscribe = useCallback((callback: (update: RealTimeUpdate) => void) => {
    setSubscribers((prev) => new Set([...prev, callback]));

    return () => {
      setSubscribers((prev) => {
        const newSet = new Set(prev);
        newSet.delete(callback);
        return newSet;
      });
    };
  }, []);

  const sendUpdate = useCallback(
    (type: RealTimeUpdate['type'], message: string, data?: any) => {
      const update: RealTimeUpdate = {
        id: `manual-${Date.now()}`,
        timestamp: Date.now(),
        type,
        message,
        data,
      };

      setStatus((prev) => ({
        ...prev,
        lastUpdate: Date.now(),
        updates: [...prev.updates.slice(-19), update],
      }));

      subscribers.forEach((callback) => callback(update));
    },
    [subscribers]
  );

  const clearUpdates = useCallback(() => {
    setStatus((prev) => ({
      ...prev,
      updates: [],
    }));
  }, []);

  return {
    status,
    subscribe,
    sendUpdate,
    clearUpdates,
  };
}
