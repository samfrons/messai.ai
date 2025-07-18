#!/usr/bin/env node

/**
 * MESSAI Nighttime Automation Script
 *
 * This script runs the same tasks as the GitHub Actions workflow
 * but can be executed locally for testing and manual runs.
 *
 * Usage:
 *   node scripts/nighttime-automation.js [task]
 *
 * Tasks:
 *   - all (default): Run all automation tasks
 *   - backup: Database backup and verification only
 *   - maintenance: Code quality and cleanup only
 *   - data: Research data processing only
 *   - performance: Performance analysis only
 */

const { exec, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const TASKS = {
  backup: 'Database Backup & Verification',
  maintenance: 'Code Quality & Maintenance',
  data: 'Research Data Enhancement',
  performance: 'Performance Analysis',
};

class NighttimeAutomation {
  constructor() {
    this.startTime = new Date();
    this.results = {};
    this.logFile = path.join(
      __dirname,
      '../logs',
      `nighttime-${this.startTime.toISOString().split('T')[0]}.log`
    );
    this.ensureLogDir();
  }

  ensureLogDir() {
    const logDir = path.dirname(this.logFile);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }

  log(message, level = 'INFO') {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${level}: ${message}`;

    console.log(logEntry);
    fs.appendFileSync(this.logFile, logEntry + '\n');
  }

  async runCommand(command, description, continueOnError = false) {
    this.log(`Starting: ${description}`);
    this.log(`Command: ${command}`);

    return new Promise((resolve) => {
      exec(command, (error, stdout, stderr) => {
        if (error && !continueOnError) {
          this.log(`Error in ${description}: ${error.message}`, 'ERROR');
          resolve({ success: false, error: error.message });
          return;
        }

        if (stderr && !stderr.includes('NOTICE') && !stderr.includes('warning')) {
          this.log(`Warning in ${description}: ${stderr}`, 'WARN');
        }

        if (stdout) {
          this.log(`Output: ${stdout.substring(0, 500)}...`);
        }

        this.log(`Completed: ${description}`, 'SUCCESS');
        resolve({ success: true, output: stdout });
      });
    });
  }

  async databaseBackup() {
    this.log('=== STARTING DATABASE BACKUP ===');

    // Test database connection first
    const testResult = await this.runCommand('pnpm db:test', 'Database connection test');
    if (!testResult.success) {
      return { success: false, error: 'Database connection failed' };
    }

    // Create backup
    const backupResult = await this.runCommand('pnpm db:backup', 'Database backup creation');
    if (!backupResult.success) {
      return { success: false, error: 'Backup creation failed' };
    }

    // Verify backup
    const verifyResult = await this.runCommand('pnpm db:backup:verify', 'Backup verification');
    if (!verifyResult.success) {
      return { success: false, error: 'Backup verification failed' };
    }

    this.log('=== DATABASE BACKUP COMPLETED ===');
    return { success: true };
  }

  async codeMaintenance() {
    this.log('=== STARTING CODE MAINTENANCE ===');

    const tasks = [
      { cmd: 'pnpm audit --audit-level=moderate', desc: 'Security audit', continueOnError: true },
      { cmd: 'pnpm deps:check', desc: 'Dependency update check', continueOnError: true },
      { cmd: 'pnpm lint:fix', desc: 'ESLint auto-fix', continueOnError: true },
      { cmd: 'pnpm format', desc: 'Code formatting', continueOnError: true },
      { cmd: 'pnpm type-check:prod', desc: 'TypeScript type checking', continueOnError: true },
      {
        cmd: 'pnpm test --coverage --watchAll=false',
        desc: 'Full test suite',
        continueOnError: true,
      },
    ];

    const results = [];
    for (const task of tasks) {
      const result = await this.runCommand(task.cmd, task.desc, task.continueOnError);
      results.push({ task: task.desc, success: result.success });
    }

    // Clean cache and build artifacts
    this.log('Cleaning cache and build artifacts...');
    try {
      const cleanupCommands = [
        'find . -name "*.tsbuildinfo" -type f -delete',
        'rm -rf apps/web/.next/cache/* 2>/dev/null || true',
        'rm -rf node_modules/.cache/* 2>/dev/null || true',
      ];

      for (const cmd of cleanupCommands) {
        await this.runCommand(cmd, 'Cache cleanup', true);
      }
    } catch (error) {
      this.log(`Cleanup warning: ${error.message}`, 'WARN');
    }

    this.log('=== CODE MAINTENANCE COMPLETED ===');
    return { success: true, results };
  }

  async dataProcessing() {
    this.log('=== STARTING DATA PROCESSING ===');

    const tasks = [
      {
        cmd: 'node scripts/research-papers-stats.ts',
        desc: 'Research statistics generation',
        continueOnError: true,
      },
      {
        cmd: 'pnpm algae-research:expand --count=100',
        desc: 'Algae research expansion',
        continueOnError: true,
      },
      {
        cmd: 'node scripts/batch-generate-docs.js --batch-size=50',
        desc: 'Documentation generation',
        continueOnError: true,
      },
      { cmd: 'pnpm schema:validate', desc: 'Schema validation', continueOnError: true },
    ];

    const results = [];
    for (const task of tasks) {
      const result = await this.runCommand(task.cmd, task.desc, task.continueOnError);
      results.push({ task: task.desc, success: result.success });
    }

    this.log('=== DATA PROCESSING COMPLETED ===');
    return { success: true, results };
  }

  async performanceAnalysis() {
    this.log('=== STARTING PERFORMANCE ANALYSIS ===');

    // Build for analysis
    const buildResult = await this.runCommand('pnpm build', 'Production build for analysis', true);

    // Generate performance report
    const report = {
      buildSuccess: buildResult.success,
      timestamp: new Date().toISOString(),
      nodeVersion: process.version,
      memoryUsage: process.memoryUsage(),
      uptime: process.uptime(),
    };

    // Analyze bundle sizes if build succeeded
    if (buildResult.success) {
      try {
        const nextDir = 'apps/web/.next';
        if (fs.existsSync(nextDir)) {
          const files = fs.readdirSync(nextDir, { recursive: true });
          const jsFiles = files.filter((f) => f.endsWith('.js'));
          this.log(`Found ${jsFiles.length} JavaScript files in build output`);
        }
      } catch (error) {
        this.log(`Bundle analysis warning: ${error.message}`, 'WARN');
      }
    }

    const reportPath = path.join(
      __dirname,
      '../reports',
      `performance-${new Date().toISOString().split('T')[0]}.json`
    );
    fs.mkdirSync(path.dirname(reportPath), { recursive: true });
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    this.log(`Performance report saved to: ${reportPath}`);
    this.log('=== PERFORMANCE ANALYSIS COMPLETED ===');
    return { success: true, report };
  }

  async generateSummaryReport() {
    const endTime = new Date();
    const duration = Math.round((endTime - this.startTime) / 1000);

    const summary = {
      startTime: this.startTime.toISOString(),
      endTime: endTime.toISOString(),
      duration: `${duration} seconds`,
      results: this.results,
      logFile: this.logFile,
    };

    const summaryPath = path.join(
      __dirname,
      '../reports',
      `summary-${this.startTime.toISOString().split('T')[0]}.json`
    );
    fs.mkdirSync(path.dirname(summaryPath), { recursive: true });
    fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));

    console.log('\n' + '='.repeat(60));
    console.log('🌙 NIGHTTIME AUTOMATION SUMMARY');
    console.log('='.repeat(60));
    console.log(`📅 Execution Time: ${duration} seconds`);
    console.log(`📊 Tasks Completed: ${Object.keys(this.results).length}`);
    console.log(`📝 Log File: ${this.logFile}`);
    console.log(`📋 Summary Report: ${summaryPath}`);
    console.log('='.repeat(60));

    Object.entries(this.results).forEach(([task, result]) => {
      const status = result.success ? '✅' : '❌';
      console.log(`${status} ${TASKS[task] || task}: ${result.success ? 'PASSED' : 'FAILED'}`);
    });

    console.log('='.repeat(60));
    return summary;
  }

  async run(taskType = 'all') {
    this.log(`Starting nighttime automation: ${taskType}`);
    this.log(`Environment: ${process.env.NODE_ENV || 'development'}`);

    try {
      if (taskType === 'all' || taskType === 'backup') {
        this.results.backup = await this.databaseBackup();
      }

      if (taskType === 'all' || taskType === 'maintenance') {
        this.results.maintenance = await this.codeMaintenance();
      }

      if (taskType === 'all' || taskType === 'data') {
        this.results.data = await this.dataProcessing();
      }

      if (taskType === 'all' || taskType === 'performance') {
        this.results.performance = await this.performanceAnalysis();
      }

      await this.generateSummaryReport();
    } catch (error) {
      this.log(`Fatal error: ${error.message}`, 'ERROR');
      process.exit(1);
    }
  }
}

// CLI execution
if (require.main === module) {
  const taskType = process.argv[2] || 'all';

  if (!['all', 'backup', 'maintenance', 'data', 'performance'].includes(taskType)) {
    console.log('Usage: node scripts/nighttime-automation.js [task]');
    console.log('Tasks: all, backup, maintenance, data, performance');
    process.exit(1);
  }

  const automation = new NighttimeAutomation();
  automation.run(taskType).catch((error) => {
    console.error('Automation failed:', error);
    process.exit(1);
  });
}

module.exports = NighttimeAutomation;
