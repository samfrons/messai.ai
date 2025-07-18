'use client';

import { useState, useEffect } from 'react';
import { Card, Badge } from '@messai/ui';

interface LoadingState {
  label: string;
  status: 'pending' | 'loading' | 'completed';
  icon: string;
}

export default function LoadingStates() {
  const [loadingStates, setLoadingStates] = useState<LoadingState[]>([
    { label: '3D Rendering Active', status: 'pending', icon: '✅' },
    { label: 'Real-time Updates', status: 'pending', icon: '🔄' },
    { label: 'Interactive Controls', status: 'pending', icon: '🎮' },
  ]);

  useEffect(() => {
    const timer1 = setTimeout(() => {
      setLoadingStates((prev) =>
        prev.map((state, index) => (index === 0 ? { ...state, status: 'completed' } : state))
      );
    }, 500);

    const timer2 = setTimeout(() => {
      setLoadingStates((prev) =>
        prev.map((state, index) => (index === 1 ? { ...state, status: 'loading' } : state))
      );
    }, 1000);

    const timer3 = setTimeout(() => {
      setLoadingStates((prev) =>
        prev.map((state, index) =>
          index === 1
            ? { ...state, status: 'completed' }
            : index === 2
              ? { ...state, status: 'loading' }
              : state
        )
      );
    }, 1500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  const getStatusColor = (status: LoadingState['status']) => {
    switch (status) {
      case 'completed':
        return 'text-green-600';
      case 'loading':
        return 'text-blue-600';
      default:
        return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: LoadingState['status']) => {
    switch (status) {
      case 'completed':
        return '✅';
      case 'loading':
        return '🔄';
      default:
        return '⏳';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Card className="w-full max-w-2xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif font-light mb-2">MESSAi 3D Modeling Lab</h1>
          <div className="flex items-center justify-center gap-2 mb-4">
            <Badge variant="outline">v1.0</Badge>
            <span className="text-sm text-gray-500">
              Initializing interactive modeling environment
            </span>
          </div>
        </div>

        <div className="space-y-4 mb-8">
          {loadingStates.map((state, index) => (
            <div key={index} className="flex items-center gap-4">
              <div className="flex-shrink-0">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    state.status === 'completed'
                      ? 'bg-green-100'
                      : state.status === 'loading'
                        ? 'bg-blue-100'
                        : 'bg-gray-100'
                  }`}
                >
                  <span className="text-lg">{getStatusIcon(state.status)}</span>
                </div>
              </div>
              <div className="flex-1">
                <div className={`font-medium ${getStatusColor(state.status)}`}>{state.label}</div>
                {state.status === 'loading' && (
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div className="bg-blue-600 h-2 rounded-full animate-pulse w-2/3"></div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading interactive modeling environment...</p>
          <p className="text-sm text-gray-400 mt-2">
            <span className="font-semibold">Click and drag to rotate</span> •{' '}
            <span className="font-semibold">Scroll to zoom</span>
          </p>
        </div>
      </Card>
    </div>
  );
}
