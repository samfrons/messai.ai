import { ScheduleHelpers } from './utils';

// Initialize scheduled jobs
export async function initializeScheduledJobs() {
  console.log('🚀 Initializing scheduled jobs...');

  try {
    // Schedule daily report - runs every day at 9 AM
    await ScheduleHelpers.scheduleDailyReport(['admin@messai.ai', 'research@messai.ai']);
    console.log('✅ Daily report scheduled');

    // Schedule weekly digest - runs every Monday at 10 AM
    await ScheduleHelpers.scheduleWeeklyDigest(['admin@messai.ai', 'team@messai.ai']);
    console.log('✅ Weekly digest scheduled');

    // Schedule monthly analytics - runs on 1st of each month at 8 AM
    await ScheduleHelpers.scheduleMonthlyAnalytics(['admin@messai.ai', 'management@messai.ai']);
    console.log('✅ Monthly analytics scheduled');

    // Schedule system health check - runs every hour
    await ScheduleHelpers.scheduleHealthCheck(['ops@messai.ai']);
    console.log('✅ System health check scheduled');

    // Schedule database cleanup - runs every Sunday at 2 AM
    await ScheduleHelpers.scheduleDatabaseCleanup();
    console.log('✅ Database cleanup scheduled');

    console.log('🎉 All scheduled jobs initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing scheduled jobs:', error);
    throw error;
  }
}

// Remove all scheduled jobs (useful for cleanup or reset)
export async function removeAllScheduledJobs() {
  console.log('🧹 Removing all scheduled jobs...');

  try {
    const { getQueue } = await import('./queues');
    const { QUEUE_NAMES } = await import('./queues');

    // Remove repeatable jobs from scheduled tasks queue
    const scheduledQueue = getQueue(QUEUE_NAMES.SCHEDULED_TASKS);
    const repeatableJobs = await scheduledQueue.getRepeatableJobs();

    for (const job of repeatableJobs) {
      await scheduledQueue.removeRepeatableByKey(job.key);
      console.log(`✅ Removed scheduled job: ${job.name}`);
    }

    // Remove repeatable jobs from cleanup queue
    const cleanupQueue = getQueue(QUEUE_NAMES.DATABASE_CLEANUP);
    const cleanupJobs = await cleanupQueue.getRepeatableJobs();

    for (const job of cleanupJobs) {
      await cleanupQueue.removeRepeatableByKey(job.key);
      console.log(`✅ Removed cleanup job: ${job.name}`);
    }

    console.log('🎉 All scheduled jobs removed');
  } catch (error) {
    console.error('❌ Error removing scheduled jobs:', error);
    throw error;
  }
}

// List all scheduled jobs
export async function listScheduledJobs() {
  try {
    const { getQueue } = await import('./queues');
    const { QUEUE_NAMES } = await import('./queues');

    const allJobs = [];

    // Get scheduled tasks
    const scheduledQueue = getQueue(QUEUE_NAMES.SCHEDULED_TASKS);
    const scheduledJobs = await scheduledQueue.getRepeatableJobs();

    for (const job of scheduledJobs) {
      allJobs.push({
        queue: 'scheduled-tasks',
        ...job,
      });
    }

    // Get cleanup jobs
    const cleanupQueue = getQueue(QUEUE_NAMES.DATABASE_CLEANUP);
    const cleanupJobs = await cleanupQueue.getRepeatableJobs();

    for (const job of cleanupJobs) {
      allJobs.push({
        queue: 'database-cleanup',
        ...job,
      });
    }

    return allJobs;
  } catch (error) {
    console.error('❌ Error listing scheduled jobs:', error);
    throw error;
  }
}
