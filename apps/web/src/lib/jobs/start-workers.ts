#!/usr/bin/env node
/**
 * Start job queue workers
 * This script should be run as a separate process from the Next.js app
 *
 * Usage:
 *   pnpm tsx apps/web/src/lib/jobs/start-workers.ts
 *
 * Or add to package.json:
 *   "workers": "tsx apps/web/src/lib/jobs/start-workers.ts"
 */

import { workers, checkWorkerHealth } from './workers';
import { initializeScheduledJobs } from './init-scheduled-jobs';
import { redisConnection } from './redis-connection';

// Load environment variables
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function startWorkers() {
  console.log('🚀 Starting MESSAI job queue workers...');

  try {
    // Test Redis connection
    await redisConnection.ping();
    console.log('✅ Redis connection established');

    // Initialize scheduled jobs
    if (process.env.INIT_SCHEDULED_JOBS !== 'false') {
      await initializeScheduledJobs();
    }

    // Log worker status
    console.log('\n📊 Worker Status:');
    Object.entries(workers).forEach(([name, worker]) => {
      console.log(`  - ${name}: ${worker.isRunning() ? '✅ Running' : '❌ Stopped'}`);
    });

    // Set up health check interval
    setInterval(async () => {
      const health = await checkWorkerHealth();
      const unhealthy = Object.entries(health).filter(([_, status]) => !status.isRunning);

      if (unhealthy.length > 0) {
        console.warn(
          '⚠️  Unhealthy workers detected:',
          unhealthy.map(([name]) => name)
        );
      }
    }, 60000); // Check every minute

    console.log('\n✅ All workers started successfully');
    console.log('👀 Monitoring job queues... Press Ctrl+C to stop\n');

    // Log some stats every 30 seconds
    setInterval(async () => {
      const health = await checkWorkerHealth();
      const stats = Object.entries(health).map(([name, status]) => {
        const { active = 0, completed = 0, failed = 0 } = status.jobCount || {};
        return `${name}: ${active} active, ${completed} completed, ${failed} failed`;
      });

      console.log(`[${new Date().toLocaleTimeString()}] Queue stats:`, stats.join(' | '));
    }, 30000);
  } catch (error) {
    console.error('❌ Failed to start workers:', error);
    process.exit(1);
  }
}

// Handle errors
process.on('unhandledRejection', (error) => {
  console.error('Unhandled rejection:', error);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  process.exit(1);
});

// Start the workers
startWorkers();
