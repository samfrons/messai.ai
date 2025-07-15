'use client';

import { useState } from 'react';
import { Card } from './card';
import { Button } from './button';
import { Input } from './input';
import { Badge } from './badge';

interface AgentInfo {
  id: string;
  name: string;
  capabilities: string[];
  status: string;
}

interface TaskResult {
  taskId: string;
  agentId: string;
  status: 'success' | 'error' | 'partial';
  output: Record<string, any>;
  error?: {
    code: string;
    message: string;
  };
  metadata: {
    startTime: Date;
    endTime: Date;
    duration: number;
    confidence?: number;
  };
}

interface AgentTaskRunnerProps {
  agents: AgentInfo[];
  onTaskSubmit: (taskType: string, input: Record<string, any>) => Promise<TaskResult>;
  className?: string;
}

const taskTemplates = {
  literature_analysis: {
    name: 'Literature Analysis',
    description: 'Analyze research papers for trends, gaps, and insights',
    fields: [
      {
        key: 'analysisType',
        label: 'Analysis Type',
        type: 'select',
        options: ['summary', 'trends', 'gaps', 'connections', 'performance'],
      },
      {
        key: 'paperIds',
        label: 'Paper IDs (comma-separated)',
        type: 'text',
        placeholder: 'paper-1,paper-2,paper-3',
      },
    ],
  },
  data_enhancement: {
    name: 'Data Enhancement',
    description: 'Improve paper quality and extract additional data',
    fields: [
      { key: 'paperId', label: 'Paper ID', type: 'text', required: true },
      {
        key: 'enhancementType',
        label: 'Enhancement Type',
        type: 'select',
        options: ['extraction', 'validation', 'enrichment', 'quality_scoring'],
      },
    ],
  },
  insight_generation: {
    name: 'Insight Generation',
    description: 'Generate research insights and recommendations',
    fields: [
      {
        key: 'analysisScope',
        label: 'Analysis Scope',
        type: 'select',
        options: ['global', 'filtered', 'specific'],
      },
      {
        key: 'insightTypes',
        label: 'Insight Types',
        type: 'multiselect',
        options: ['trend', 'gap', 'prediction', 'recommendation'],
      },
    ],
  },
  knowledge_graph: {
    name: 'Knowledge Graph',
    description: 'Manage and analyze the research knowledge graph',
    fields: [
      {
        key: 'operation',
        label: 'Operation',
        type: 'select',
        options: ['expand', 'analyze', 'discover', 'validate', 'query'],
      },
      {
        key: 'analysisType',
        label: 'Analysis Type (for analyze)',
        type: 'select',
        options: ['centrality', 'clustering', 'pathfinding', 'similarity'],
      },
    ],
  },
};

export function AgentTaskRunner({ agents, onTaskSubmit, className = '' }: AgentTaskRunnerProps) {
  const [selectedTaskType, setSelectedTaskType] = useState<string>('');
  const [taskInput, setTaskInput] = useState<Record<string, any>>({});
  const [isRunning, setIsRunning] = useState(false);
  const [lastResult, setLastResult] = useState<TaskResult | null>(null);

  const handleFieldChange = (key: string, value: any) => {
    setTaskInput((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!selectedTaskType) return;

    setIsRunning(true);
    try {
      const result = await onTaskSubmit(selectedTaskType, taskInput);
      setLastResult(result);
    } catch (error) {
      console.error('Task execution error:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const getCapableAgents = (taskType: string) => {
    return agents.filter((agent) => agent.capabilities.includes(taskType));
  };

  const selectedTemplate = selectedTaskType
    ? taskTemplates[selectedTaskType as keyof typeof taskTemplates]
    : null;
  const capableAgents = selectedTaskType ? getCapableAgents(selectedTaskType) : [];

  const renderField = (field: any) => {
    switch (field.type) {
      case 'select':
        return (
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={taskInput[field.key] || ''}
            onChange={(e) => handleFieldChange(field.key, e.target.value)}
          >
            <option value="">Select {field.label}</option>
            {field.options.map((option: string) => (
              <option key={option} value={option}>
                {option.replace('_', ' ')}
              </option>
            ))}
          </select>
        );

      case 'multiselect':
        return (
          <div className="space-y-2">
            {field.options.map((option: string) => (
              <label key={option} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={(taskInput[field.key] || []).includes(option)}
                  onChange={(e) => {
                    const current = taskInput[field.key] || [];
                    const updated = e.target.checked
                      ? [...current, option]
                      : current.filter((item: string) => item !== option);
                    handleFieldChange(field.key, updated);
                  }}
                  className="rounded"
                />
                <span className="text-sm">{option.replace('_', ' ')}</span>
              </label>
            ))}
          </div>
        );

      default:
        return (
          <Input
            value={taskInput[field.key] || ''}
            onChange={(e) => handleFieldChange(field.key, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
          />
        );
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Research Agent Task Runner</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Task Type</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={selectedTaskType}
              onChange={(e) => {
                setSelectedTaskType(e.target.value);
                setTaskInput({});
                setLastResult(null);
              }}
            >
              <option value="">Select a task type</option>
              {Object.entries(taskTemplates).map(([key, template]) => (
                <option key={key} value={key}>
                  {template.name}
                </option>
              ))}
            </select>
          </div>

          {selectedTemplate && (
            <>
              <div className="bg-blue-50 p-4 rounded-md">
                <h3 className="font-medium text-blue-900 mb-1">{selectedTemplate.name}</h3>
                <p className="text-sm text-blue-700">{selectedTemplate.description}</p>
              </div>

              <div className="space-y-4">
                {selectedTemplate.fields.map((field) => (
                  <div key={field.key}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {field.label}
                      {'required' in field && field.required && (
                        <span className="text-red-500 ml-1">*</span>
                      )}
                    </label>
                    {renderField(field)}
                  </div>
                ))}
              </div>

              <div className="border-t pt-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Available Agents</h4>
                <div className="flex flex-wrap gap-2">
                  {capableAgents.map((agent) => (
                    <Badge
                      key={agent.id}
                      className={`${
                        agent.status === 'idle'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {agent.name} ({agent.status})
                    </Badge>
                  ))}
                </div>
              </div>

              <Button
                onClick={handleSubmit}
                disabled={isRunning || capableAgents.length === 0}
                className="w-full"
              >
                {isRunning ? 'Running Task...' : 'Run Task'}
              </Button>
            </>
          )}
        </div>
      </Card>

      {lastResult && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Task Result</h3>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge
                className={
                  lastResult.status === 'success'
                    ? 'bg-green-100 text-green-800'
                    : lastResult.status === 'error'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800'
                }
              >
                {lastResult.status}
              </Badge>
              <span className="text-sm text-gray-600">
                Duration: {lastResult.metadata.duration}ms
              </span>
              {lastResult.metadata.confidence && (
                <span className="text-sm text-gray-600">
                  Confidence: {(lastResult.metadata.confidence * 100).toFixed(0)}%
                </span>
              )}
            </div>

            {lastResult.error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <h4 className="font-medium text-red-900">Error</h4>
                <p className="text-sm text-red-700">{lastResult.error.message}</p>
                <p className="text-xs text-red-600">Code: {lastResult.error.code}</p>
              </div>
            )}

            {lastResult.status === 'success' && (
              <div className="bg-gray-50 rounded-md p-4">
                <h4 className="font-medium text-gray-900 mb-2">Output</h4>
                <pre className="text-xs text-gray-700 overflow-auto max-h-96">
                  {JSON.stringify(lastResult.output, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
