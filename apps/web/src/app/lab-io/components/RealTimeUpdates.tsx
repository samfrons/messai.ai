'use client';

import { useState, useEffect } from 'react';
import { Card, Button, Badge } from '@messai/ui';
import { useRealTimeUpdates, type RealTimeUpdate } from '../hooks/useRealTimeUpdates';

export default function RealTimeUpdates() {
  const { status, subscribe, clearUpdates } = useRealTimeUpdates();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribe((update: RealTimeUpdate) => {
      // Could add notification logic here
      console.log('Real-time update received:', update);
    });

    return unsubscribe;
  }, [subscribe]);

  const getConnectionColor = () => {
    switch (status.connectionQuality) {
      case 'excellent':
        return 'bg-green-500';
      case 'good':
        return 'bg-yellow-500';
      case 'poor':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getUpdateTypeIcon = (type: RealTimeUpdate['type']) => {
    switch (type) {
      case 'parameter':
        return '⚙️';
      case 'model':
        return '🧬';
      case 'simulation':
        return '🔬';
      case 'system':
        return '💻';
      default:
        return '📊';
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="flex items-center gap-2 mb-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsVisible(!isVisible)}
          className="bg-white shadow-lg"
        >
          <div className={`w-2 h-2 rounded-full ${getConnectionColor()} mr-2`}></div>
          Real-time Updates
          {status.updates.length > 0 && (
            <Badge variant="outline" size="sm" className="ml-2">
              {status.updates.length}
            </Badge>
          )}
        </Button>
      </div>

      {isVisible && (
        <Card className="w-80 max-h-96 overflow-y-auto shadow-xl">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-sm">Live Updates</h3>
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  size="sm"
                  className={`${
                    status.connected
                      ? 'bg-green-50 text-green-600 border-green-200'
                      : 'bg-red-50 text-red-600 border-red-200'
                  }`}
                >
                  {status.connected ? 'Connected' : 'Disconnected'}
                </Badge>
                <Button variant="ghost" size="sm" onClick={clearUpdates} className="h-6 w-6 p-0">
                  🗑️
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              {status.updates.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">No updates yet</p>
              ) : (
                status.updates
                  .slice(-10)
                  .reverse()
                  .map((update) => (
                    <div
                      key={update.id}
                      className="flex items-start gap-3 p-2 rounded-lg bg-gray-50"
                    >
                      <div className="text-lg">{getUpdateTypeIcon(update.type)}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{update.message}</p>
                        <p className="text-xs text-gray-500">{formatTime(update.timestamp)}</p>
                        {update.data && (
                          <div className="mt-1 text-xs text-gray-600">
                            Value: {update.data.value?.toFixed(2)} | Confidence:{' '}
                            {(update.data.confidence * 100)?.toFixed(0)}%
                          </div>
                        )}
                      </div>
                    </div>
                  ))
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Quality: {status.connectionQuality}</span>
                <span>
                  Last update: {status.lastUpdate ? formatTime(status.lastUpdate) : 'Never'}
                </span>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
