/**
 * Examples of how to use the MESSAI job processing system
 */

import { JobCreators, JobChain, BatchProcessing, ScheduleHelpers } from './utils';

// Example 1: Process a single research paper
export async function processSinglePaper() {
  // Extract PDF content
  const pdfJob = await JobCreators.processPaper('paper-123', 'extract_pdf', {
    priority: 2, // High priority
    attempts: 3,
  });

  console.log(`PDF extraction job created: ${pdfJob.id}`);

  // You can also chain multiple actions
  const chain = new JobChain()
    .add('PAPER_PROCESSING', 'extract-pdf', {
      paperId: 'paper-123',
      action: 'extract_pdf',
    })
    .add('PAPER_PROCESSING', 'analyze-content', {
      paperId: 'paper-123',
      action: 'analyze_content',
    })
    .add('PAPER_PROCESSING', 'extract-parameters', {
      paperId: 'paper-123',
      action: 'extract_parameters',
    });

  const jobs = await chain.execute();
  console.log(`Created job chain with ${jobs.length} jobs`);
}

// Example 2: Process experiment data and send notification
export async function processExperimentComplete() {
  // Process experiment results
  const experimentJob = await JobCreators.processExperiment(
    'exp-456',
    'process_results',
    'user-789',
    {
      temperature: [25, 26, 27, 28],
      voltage: [0.65, 0.68, 0.7, 0.72],
      current: [3.2, 3.5, 3.8, 4.1],
    }
  );

  // Generate report (will run after results are processed)
  const reportJob = await JobCreators.processExperiment('exp-456', 'generate_report', 'user-789');

  // Send notification email
  const emailJob = await JobCreators.sendEmail(
    'researcher@example.com',
    'experiment_complete',
    {
      experimentName: 'MFC Optimization Study',
      status: 'completed',
      duration: '7 days',
      results: [
        'Peak power density: 1250 mW/m²',
        'Coulombic efficiency: 85%',
        'Optimal temperature: 27°C',
      ],
      link: 'https://messai.ai/experiments/exp-456',
    },
    { priority: 'high' }
  );

  console.log('Experiment processing pipeline started');
}

// Example 3: Batch process multiple papers
export async function batchProcessPapers() {
  const paperIds = [
    'paper-001',
    'paper-002',
    'paper-003',
    // ... up to 100 papers
  ];

  // Process in batches of 10
  const jobs = await BatchProcessing.processPapersBatch(paperIds, 'extract_pdf', 10);

  console.log(`Created ${jobs.length} jobs for batch processing`);
}

// Example 4: Export user data
export async function exportUserData() {
  const exportJob = await JobCreators.exportData('user-123', 'experiments', 'excel', {
    filters: {
      dateRange: {
        start: '2024-01-01',
        end: '2024-12-31',
      },
      systemType: 'MFC',
    },
    email: 'user@example.com',
  });

  console.log(`Export job created: ${exportJob.id}`);
}

// Example 5: Schedule recurring tasks
export async function setupScheduledJobs() {
  // Daily report for admins
  await ScheduleHelpers.scheduleDailyReport(['admin@messai.ai', 'manager@messai.ai']);

  // Weekly digest for all users
  await ScheduleHelpers.scheduleWeeklyDigest(['team@messai.ai']);

  // System health check every hour
  await ScheduleHelpers.scheduleHealthCheck(['ops@messai.ai']);

  console.log('Scheduled jobs configured');
}

// Example 6: Handle job events programmatically
export async function monitorJobProgress() {
  const { getQueue, getQueueEvents } = await import('./queues');

  const queue = getQueue('paper-processing');
  const events = getQueueEvents('paper-processing');

  // Listen for job progress
  events.on('progress', ({ jobId, data }) => {
    console.log(`Job ${jobId} progress:`, data);
  });

  // Listen for completed jobs
  events.on('completed', async ({ jobId, returnvalue }) => {
    console.log(`Job ${jobId} completed:`, returnvalue);

    // Trigger next action based on result
    if (returnvalue.success && returnvalue.data.paperId) {
      // Start parameter extraction
      await JobCreators.processPaper(returnvalue.data.paperId, 'extract_parameters');
    }
  });

  // Listen for failed jobs
  events.on('failed', ({ jobId, failedReason }) => {
    console.error(`Job ${jobId} failed:`, failedReason);

    // Send alert email
    JobCreators.sendEmail(
      'admin@messai.ai',
      'error_notification',
      {
        taskType: 'Paper Processing',
        error: failedReason,
        jobId,
        timestamp: new Date(),
        retryable: true,
      },
      { priority: 'high' }
    );
  });
}

// Example 7: Clean up old jobs
export async function cleanupOldJobs() {
  const { JobManagement } = await import('./utils');

  // Clean completed jobs older than 24 hours
  await JobManagement.cleanCompletedJobs('PAPER_PROCESSING', 24);
  await JobManagement.cleanCompletedJobs('EMAIL_NOTIFICATIONS', 12);

  // Clean failed jobs older than 7 days
  await JobManagement.cleanFailedJobs('PAPER_PROCESSING', 7);

  console.log('Old jobs cleaned up');
}

// Example 8: Database maintenance
export async function scheduleDatabaseMaintenance() {
  // Run cleanup in dry-run mode first
  const dryRunJob = await JobCreators.cleanupDatabase('remove_orphaned_files', {
    dryRun: true,
  });

  // Schedule actual cleanup for Sunday at 2 AM
  await ScheduleHelpers.scheduleDatabaseCleanup();

  // Archive old data monthly
  const archiveJob = await JobCreators.cleanupDatabase('archive_old_data', {
    olderThanDays: 90,
    dryRun: false,
    jobOptions: {
      repeat: {
        pattern: '0 3 1 * *', // 1st of each month at 3 AM
      },
    },
  });

  console.log('Database maintenance scheduled');
}

// Example 9: Train ML model
export async function trainPredictionModel() {
  const trainingJob = await JobCreators.trainModel(
    'prediction',
    'training-data-2024',
    'user-admin',
    {
      epochs: 100,
      batchSize: 32,
      learningRate: 0.001,
      validationSplit: 0.2,
    },
    {
      priority: 4, // Low priority
      attempts: 1, // Don't retry automatically
    }
  );

  console.log(`ML training job created: ${trainingJob.id}`);
}

// Example 10: Send batch notifications
export async function sendNewsletterBatch() {
  const recipients = [
    { email: 'user1@example.com', template: 'welcome' as const, data: { name: 'User 1' } },
    { email: 'user2@example.com', template: 'welcome' as const, data: { name: 'User 2' } },
    // ... hundreds more
  ];

  // Send with rate limiting (10 emails per second)
  const jobs = await BatchProcessing.sendBatchEmails(recipients, 10, 'normal');

  console.log(`Sending ${jobs.length} emails with rate limiting`);
}
