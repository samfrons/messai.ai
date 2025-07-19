'use client';

import React, { useState } from 'react';
import { useJobUpdates, useQueueStats } from '../../hooks/useJobUpdates';
import { formatBytes } from '../../lib/jobs/processors/database-cleanup';
import { QUEUE_NAMES } from '../../lib/jobs/queues';

export function JobDashboard() {
  const [selectedQueue, setSelectedQueue] = useState<string | null>(null);
  const { connected, activeJobs, failedJobs, recentJobs, client } = useJobUpdates({
    queues: Object.values(QUEUE_NAMES),
  });

  const queueStats = useQueueStats();

  return (
    <div className="p-6 space-y-6">
      {/* Connection Status */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Job Queue Dashboard</h1>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-sm text-gray-600">{connected ? 'Connected' : 'Disconnected'}</span>
        </div>
      </div>

      {/* Queue Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(queueStats).map(([queueName, stats]) => (
          <QueueCard
            key={queueName}
            queueName={queueName}
            stats={stats}
            isSelected={selectedQueue === queueName}
            onClick={() => setSelectedQueue(queueName)}
          />
        ))}
      </div>

      {/* Active Jobs */}
      {activeJobs.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Active Jobs</h2>
          <div className="space-y-2">
            {activeJobs.map((job) => (
              <JobItem key={job.id} job={job} showProgress />
            ))}
          </div>
        </div>
      )}

      {/* Failed Jobs */}
      {failedJobs.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4 text-red-600">Failed Jobs</h2>
          <div className="space-y-2">
            {failedJobs.map((job) => (
              <JobItem key={job.id} job={job} showError />
            ))}
          </div>
        </div>
      )}

      {/* Selected Queue Details */}
      {selectedQueue && recentJobs[selectedQueue] && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Jobs - {selectedQueue}</h2>
          <div className="space-y-2">
            {recentJobs[selectedQueue].map((job) => (
              <JobItem key={job.id} job={job} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface QueueCardProps {
  queueName: string;
  stats: any;
  isSelected: boolean;
  onClick: () => void;
}

function QueueCard({ queueName, stats, isSelected, onClick }: QueueCardProps) {
  const total = stats.total || 0;
  const { waiting = 0, active = 0, completed = 0, failed = 0 } = stats.counts || {};

  return (
    <div
      className={`bg-white rounded-lg shadow p-4 cursor-pointer transition-all ${
        isSelected ? 'ring-2 ring-blue-500' : 'hover:shadow-lg'
      }`}
      onClick={onClick}
    >
      <h3 className="font-semibold text-lg mb-2">{formatQueueName(queueName)}</h3>

      <div className="space-y-1 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Total Jobs:</span>
          <span className="font-medium">{total}</span>
        </div>

        {waiting > 0 && (
          <div className="flex justify-between">
            <span className="text-yellow-600">Waiting:</span>
            <span className="font-medium">{waiting}</span>
          </div>
        )}

        {active > 0 && (
          <div className="flex justify-between">
            <span className="text-blue-600">Active:</span>
            <span className="font-medium">{active}</span>
          </div>
        )}

        {completed > 0 && (
          <div className="flex justify-between">
            <span className="text-green-600">Completed:</span>
            <span className="font-medium">{completed}</span>
          </div>
        )}

        {failed > 0 && (
          <div className="flex justify-between">
            <span className="text-red-600">Failed:</span>
            <span className="font-medium">{failed}</span>
          </div>
        )}
      </div>

      {stats.isPaused && (
        <div className="mt-2 text-xs text-orange-600 font-medium">Queue Paused</div>
      )}
    </div>
  );
}

interface JobItemProps {
  job: any;
  showProgress?: boolean;
  showError?: boolean;
}

function JobItem({ job, showProgress, showError }: JobItemProps) {
  return (
    <div className="border rounded-lg p-3 hover:bg-gray-50">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm">{job.name}</span>
            <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(job.status)}`}>
              {job.status}
            </span>
          </div>

          <div className="text-xs text-gray-600 mt-1">
            ID: {job.id} | Queue: {job.queue}
          </div>

          {showProgress && job.progress && (
            <div className="mt-2">
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all"
                    style={{ width: `${job.progress.percentage || 0}%` }}
                  />
                </div>
                <span className="text-xs text-gray-600">{job.progress.percentage || 0}%</span>
              </div>
              {job.progress.message && (
                <p className="text-xs text-gray-600 mt-1">{job.progress.message}</p>
              )}
            </div>
          )}

          {showError && job.failedReason && (
            <p className="text-xs text-red-600 mt-1">{job.failedReason}</p>
          )}
        </div>

        <div className="text-xs text-gray-500">{formatTime(job.createdAt)}</div>
      </div>
    </div>
  );
}

// Helper functions
function formatQueueName(name: string): string {
  return name
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'waiting':
      return 'bg-yellow-100 text-yellow-800';
    case 'active':
      return 'bg-blue-100 text-blue-800';
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'failed':
      return 'bg-red-100 text-red-800';
    case 'delayed':
      return 'bg-orange-100 text-orange-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

function formatTime(date: Date | string): string {
  const d = new Date(date);
  const now = new Date();
  const diff = now.getTime() - d.getTime();

  if (diff < 60000) {
    return 'just now';
  } else if (diff < 3600000) {
    return `${Math.floor(diff / 60000)}m ago`;
  } else if (diff < 86400000) {
    return `${Math.floor(diff / 3600000)}h ago`;
  } else {
    return d.toLocaleDateString();
  }
}
