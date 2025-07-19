# MESSAI Job Queue System

A comprehensive background job processing system built with BullMQ and Redis for
handling asynchronous tasks in the MESSAI platform.

## Features

- **Multiple Queue Types**: Separate queues for different job types (paper
  processing, experiments, emails, etc.)
- **Job Scheduling**: Cron-based scheduled tasks with timezone support
- **Real-time Updates**: WebSocket integration for live job progress updates
- **Retry Logic**: Configurable retry strategies with exponential backoff
- **Job Chaining**: Create dependent job workflows
- **Batch Processing**: Process multiple items efficiently with rate limiting
- **Monitoring Dashboard**: Real-time queue statistics and job tracking
- **Graceful Shutdown**: Proper cleanup and job persistence

## Setup

### Prerequisites

1. Redis server running (for job queue storage)
2. Node.js environment with TypeScript support

### Installation

```bash
# Install dependencies (already included in package.json)
pnpm install

# Start Redis using Docker
docker run -d -p 6379:6379 redis:alpine

# Or use the project's PostgreSQL setup which includes Redis
pnpm db:local:start
```

### Configuration

Set environment variables in `.env.local`:

```env
# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# Job Configuration
INIT_SCHEDULED_JOBS=true  # Set to false to skip scheduled job initialization
```

## Usage

### Starting Workers

```bash
# Start job workers in development (with auto-reload)
cd apps/web
pnpm workers:dev

# Start job workers in production
pnpm workers

# Workers can also be started programmatically
import { workers } from '@/lib/jobs/workers';
```

### Creating Jobs

```typescript
import { JobCreators } from '@/lib/jobs/utils';

// Process a research paper
const job = await JobCreators.processPaper('paper-123', 'extract_pdf', {
  priority: 2,
});

// Send an email
await JobCreators.sendEmail('user@example.com', 'welcome', {
  name: 'John Doe',
});

// Process experiment data
await JobCreators.processExperiment('exp-456', 'calculate_metrics', 'user-789');
```

### Job Chaining

```typescript
import { JobChain } from '@/lib/jobs/utils';

const chain = new JobChain()
  .add('PAPER_PROCESSING', 'extract-pdf', { paperId: '123' })
  .add('PAPER_PROCESSING', 'analyze-content', { paperId: '123' })
  .add('EMAIL_NOTIFICATIONS', 'notify-complete', {
    to: 'user@example.com',
    template: 'paper_processed',
  });

const jobs = await chain.execute();
```

### Scheduled Jobs

```bash
# Initialize scheduled jobs
pnpm jobs:init

# List all scheduled jobs
pnpm jobs:list

# Remove all scheduled jobs
pnpm jobs:clean
```

### Monitoring Jobs

#### Using the Dashboard Component

```tsx
import { JobDashboard } from '@/components/jobs/JobDashboard';

export function AdminPage() {
  return <JobDashboard />;
}
```

#### Using React Hooks

```tsx
import { useJobUpdates, useJobMonitor } from '@/hooks/useJobUpdates';

function MyComponent() {
  // Monitor all queues
  const { activeJobs, failedJobs, queueStats } = useJobUpdates({
    queues: ['paper-processing', 'email-notifications'],
  });

  // Monitor specific job
  const { job, progress, retry } = useJobMonitor('paper-processing', 'job-123');

  return (
    <div>
      {progress && <ProgressBar value={progress.percentage} />}
      {job?.status === 'failed' && <button onClick={retry}>Retry Job</button>}
    </div>
  );
}
```

#### Using API Endpoints

```bash
# Get job queue overview
GET /api/jobs?view=overview

# Get queue statistics
GET /api/jobs?view=queues

# Get performance metrics
GET /api/jobs?view=performance&timeRange=hour

# Get specific queue jobs
GET /api/jobs/paper-processing?view=jobs&status=completed&limit=10

# Create a new job
POST /api/jobs
{
  "type": "paper_processing",
  "data": {
    "paperId": "123",
    "action": "extract_pdf"
  }
}

# Control queue operations
POST /api/jobs/paper-processing
{
  "action": "pause" | "resume" | "drain"
}

# Retry or cancel specific job
POST /api/jobs/paper-processing/job-123
{
  "action": "retry" | "cancel"
}
```

## Job Types

### Paper Processing

- `extract_pdf`: Extract text content from PDF files
- `analyze_content`: AI-powered content analysis
- `generate_embeddings`: Create vector embeddings for search
- `extract_parameters`: Extract system parameters from papers

### Experiment Data

- `process_results`: Process raw experimental data
- `generate_report`: Create comprehensive experiment reports
- `calculate_metrics`: Calculate performance metrics

### Email Notifications

- Templates: `welcome`, `experiment_complete`, `paper_processed`,
  `error_notification`
- Priority levels: `high`, `normal`, `low`
- Batch sending with rate limiting

### Data Export

- Export types: `papers`, `experiments`, `parameters`, `full_backup`
- Formats: `json`, `csv`, `excel`
- Email delivery option

### ML Training

- Model types: `prediction`, `classification`, `parameter_extraction`
- Configurable hyperparameters
- Low priority to avoid resource conflicts

### Database Cleanup

- `remove_orphaned_files`: Clean up unused files
- `clean_temp_data`: Remove temporary data
- `archive_old_data`: Archive to cold storage
- `optimize_indexes`: Database performance optimization

### Scheduled Tasks

- `daily_report`: Daily activity summary
- `weekly_digest`: Weekly research digest
- `monthly_analytics`: Comprehensive monthly report
- `system_health_check`: Hourly system monitoring

## WebSocket Events

The job system broadcasts real-time updates via WebSocket:

```typescript
// Available events
JOB_EVENTS = {
  JOB_ADDED: 'job:added',
  JOB_ACTIVE: 'job:active',
  JOB_PROGRESS: 'job:progress',
  JOB_COMPLETED: 'job:completed',
  JOB_FAILED: 'job:failed',
  JOB_REMOVED: 'job:removed',
  QUEUE_STATUS: 'queue:status',
  QUEUE_STATS: 'queue:stats',
};
```

## Best Practices

1. **Job Naming**: Use descriptive job names that include the action and
   resource ID
2. **Error Handling**: Always implement proper error handling in job processors
3. **Idempotency**: Design jobs to be idempotent (safe to retry)
4. **Progress Updates**: Update job progress for long-running tasks
5. **Cleanup**: Remove old completed/failed jobs periodically
6. **Monitoring**: Set up alerts for high failure rates or queue backlogs

## Troubleshooting

### Redis Connection Issues

```bash
# Check Redis connection
redis-cli ping

# Check Redis is accessible
telnet localhost 6379
```

### Worker Not Processing Jobs

1. Check worker logs for errors
2. Verify Redis connection
3. Check if queue is paused
4. Verify job data structure matches processor expectations

### Memory Issues

- Limit concurrent job processing
- Clean up old jobs regularly
- Use pagination for large data sets
- Consider using job result storage limits

## Development

### Adding New Job Types

1. Add queue name to `QUEUE_NAMES` in `queues.ts`
2. Define job data interface in `types.ts`
3. Create processor in `processors/` directory
4. Register worker in `workers.ts`
5. Add job creator helper in `utils.ts`
6. Update API routes if needed

### Testing Jobs

```typescript
// Create test job
const testJob = await JobCreators.processPaper(
  'test-paper-123',
  'extract_pdf',
  {
    attempts: 1,
    removeOnComplete: true,
    removeOnFail: true,
  }
);

// Monitor job
const job = await queue.getJob(testJob.id);
const state = await job.getState();
console.log('Job state:', state);
```

## Production Considerations

1. **Redis Persistence**: Enable Redis persistence for job durability
2. **Worker Scaling**: Run multiple worker instances for high throughput
3. **Resource Limits**: Set appropriate concurrency limits per worker
4. **Monitoring**: Use tools like Bull Dashboard or custom monitoring
5. **Error Alerting**: Set up alerts for critical job failures
6. **Graceful Shutdown**: Ensure workers complete active jobs before shutting
   down
