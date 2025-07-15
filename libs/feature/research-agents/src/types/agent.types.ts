/**
 * Core types for the MESSAI Research Sub-Agent system
 */

export type AgentStatus = 'idle' | 'running' | 'completed' | 'failed' | 'paused';

export type AgentCapability =
  | 'literature_analysis'
  | 'data_enhancement'
  | 'trend_analysis'
  | 'knowledge_graph'
  | 'prediction_validation'
  | 'paper_processing'
  | 'insight_generation';

export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';

export interface AgentTask {
  id: string;
  type: AgentCapability;
  priority: TaskPriority;
  input: Record<string, any>;
  metadata?: {
    userId?: string;
    source?: string;
    createdAt: Date;
    estimatedDuration?: number;
  };
}

export interface AgentResult {
  taskId: string;
  agentId: string;
  status: 'success' | 'error' | 'partial';
  output: Record<string, any>;
  error?: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
  metadata: {
    startTime: Date;
    endTime: Date;
    duration: number;
    confidence?: number;
    resourceUsage?: {
      cpu?: number;
      memory?: number;
      tokens?: number;
    };
  };
}

export interface AgentMetrics {
  totalTasks: number;
  completedTasks: number;
  failedTasks: number;
  averageDuration: number;
  averageConfidence: number;
  lastActive: Date;
  uptime: number;
}

export interface ResearchSubAgent {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly capabilities: AgentCapability[];
  readonly version: string;

  getStatus(): AgentStatus;
  getMetrics(): AgentMetrics;

  canHandle(task: AgentTask): boolean;
  execute(task: AgentTask): Promise<AgentResult>;

  pause(): Promise<void>;
  resume(): Promise<void>;
  stop(): Promise<void>;

  validateInput(input: Record<string, any>): ValidationResult;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Array<{
    field: string;
    message: string;
    code: string;
  }>;
}

export interface WorkflowStep {
  agentId: string;
  task: AgentTask;
  dependencies?: string[];
  retryPolicy?: {
    maxRetries: number;
    backoffMs: number;
  };
}

export interface ResearchWorkflow {
  id: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
  metadata: {
    createdBy: string;
    createdAt: Date;
    estimatedDuration: number;
  };
}

export interface WorkflowResult {
  workflowId: string;
  status: 'completed' | 'failed' | 'partial';
  results: AgentResult[];
  metadata: {
    startTime: Date;
    endTime: Date;
    totalDuration: number;
  };
}

export interface AgentConfiguration {
  id: string;
  maxConcurrentTasks: number;
  timeoutMs: number;
  retryPolicy: {
    maxRetries: number;
    backoffMs: number;
  };
  resourceLimits: {
    maxMemoryMb: number;
    maxTokens: number;
  };
  capabilities: AgentCapability[];
}
