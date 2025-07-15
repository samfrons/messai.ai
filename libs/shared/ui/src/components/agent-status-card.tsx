import { Card } from './card';
import { Badge } from './badge';

interface AgentMetrics {
  totalTasks: number;
  completedTasks: number;
  failedTasks: number;
  averageDuration: number;
  averageConfidence: number;
  lastActive: Date;
  uptime: number;
}

interface AgentStatusCardProps {
  agentId: string;
  name: string;
  description: string;
  capabilities: string[];
  status: 'idle' | 'running' | 'completed' | 'failed' | 'paused';
  metrics: AgentMetrics;
  version: string;
}

const statusColors = {
  idle: 'bg-gray-100 text-gray-800',
  running: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  paused: 'bg-yellow-100 text-yellow-800',
};

const statusIcons = {
  idle: '⏸️',
  running: '🔄',
  completed: '✅',
  failed: '❌',
  paused: '⏳',
};

export function AgentStatusCard({
  name,
  description,
  capabilities,
  status,
  metrics,
  version,
}: AgentStatusCardProps) {
  const successRate =
    metrics.totalTasks > 0 ? ((metrics.completedTasks / metrics.totalTasks) * 100).toFixed(1) : '0';

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  const formatUptime = (ms: number) => {
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    return `${hours}h ${minutes}m`;
  };

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">{name}</h3>
            <Badge variant="outline" className="text-xs">
              v{version}
            </Badge>
          </div>
          <p className="text-sm text-gray-600 mb-3">{description}</p>
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusColors[status]}`}
            >
              {statusIcons[status]} {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Success Rate</span>
            <span className="text-sm font-medium text-gray-900">{successRate}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Total Tasks</span>
            <span className="text-sm font-medium text-gray-900">{metrics.totalTasks}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Failed</span>
            <span className="text-sm font-medium text-red-600">{metrics.failedTasks}</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Avg Duration</span>
            <span className="text-sm font-medium text-gray-900">
              {formatDuration(metrics.averageDuration)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Confidence</span>
            <span className="text-sm font-medium text-gray-900">
              {(metrics.averageConfidence * 100).toFixed(0)}%
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Uptime</span>
            <span className="text-sm font-medium text-gray-900">
              {formatUptime(metrics.uptime)}
            </span>
          </div>
        </div>
      </div>

      <div className="border-t pt-4">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Capabilities</h4>
        <div className="flex flex-wrap gap-1">
          {capabilities.map((capability) => (
            <Badge key={capability} variant="secondary" className="text-xs">
              {capability.replace('_', ' ')}
            </Badge>
          ))}
        </div>
      </div>

      <div className="mt-4 text-xs text-gray-500">
        Last active: {new Date(metrics.lastActive).toLocaleString()}
      </div>
    </Card>
  );
}
