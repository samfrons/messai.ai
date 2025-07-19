import { Job } from 'bullmq';

// Job data types for each queue
export interface PaperProcessingJobData {
  paperId: string;
  action: 'extract_pdf' | 'analyze_content' | 'generate_embeddings' | 'extract_parameters';
  pdfUrl?: string;
  userId?: string;
}

export interface ExperimentDataJobData {
  experimentId: string;
  action: 'process_results' | 'generate_report' | 'calculate_metrics';
  data?: any;
  userId: string;
}

export interface EmailNotificationJobData {
  to: string | string[];
  subject: string;
  template: 'welcome' | 'experiment_complete' | 'paper_processed' | 'error_notification';
  data: Record<string, any>;
  priority?: 'high' | 'normal' | 'low';
}

export interface DataExportJobData {
  userId: string;
  exportType: 'papers' | 'experiments' | 'parameters' | 'full_backup';
  format: 'json' | 'csv' | 'excel';
  filters?: Record<string, any>;
  email?: string;
}

export interface MLTrainingJobData {
  modelType: 'prediction' | 'classification' | 'parameter_extraction';
  trainingDataId: string;
  hyperparameters?: Record<string, any>;
  userId: string;
}

export interface DatabaseCleanupJobData {
  action: 'remove_orphaned_files' | 'clean_temp_data' | 'archive_old_data' | 'optimize_indexes';
  olderThanDays?: number;
  dryRun?: boolean;
}

export interface ScheduledTaskJobData {
  taskType: 'daily_report' | 'weekly_digest' | 'monthly_analytics' | 'system_health_check';
  recipients?: string[];
  options?: Record<string, any>;
}

// Union type for all job data
export type JobData =
  | PaperProcessingJobData
  | ExperimentDataJobData
  | EmailNotificationJobData
  | DataExportJobData
  | MLTrainingJobData
  | DatabaseCleanupJobData
  | ScheduledTaskJobData;

// Job result types
export interface JobResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  duration?: number;
  metadata?: Record<string, any>;
}

// Job progress data
export interface JobProgress {
  percentage: number;
  message: string;
  currentStep?: string;
  totalSteps?: number;
  metadata?: Record<string, any>;
}

// Job priority levels
export enum JobPriority {
  CRITICAL = 1,
  HIGH = 2,
  NORMAL = 3,
  LOW = 4,
}

// Job status for UI display
export interface JobStatus {
  id: string;
  name: string;
  queue: string;
  status: 'waiting' | 'active' | 'completed' | 'failed' | 'delayed' | 'paused';
  progress?: JobProgress;
  data: JobData;
  result?: JobResult;
  createdAt: Date;
  processedAt?: Date;
  completedAt?: Date;
  failedReason?: string;
  attempts: number;
  maxAttempts: number;
}

// Helper type guards
export function isPaperProcessingJob(data: JobData): data is PaperProcessingJobData {
  return 'paperId' in data && 'action' in data;
}

export function isExperimentDataJob(data: JobData): data is ExperimentDataJobData {
  return 'experimentId' in data && 'action' in data;
}

export function isEmailNotificationJob(data: JobData): data is EmailNotificationJobData {
  return 'to' in data && 'template' in data;
}

export function isDataExportJob(data: JobData): data is DataExportJobData {
  return 'exportType' in data && 'format' in data;
}

export function isMLTrainingJob(data: JobData): data is MLTrainingJobData {
  return 'modelType' in data && 'trainingDataId' in data;
}

export function isDatabaseCleanupJob(data: JobData): data is DatabaseCleanupJobData {
  return 'action' in data && !('paperId' in data || 'experimentId' in data);
}

export function isScheduledTaskJob(data: JobData): data is ScheduledTaskJobData {
  return 'taskType' in data;
}
