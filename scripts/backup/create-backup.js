#!/usr/bin/env node

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Configuration
const BACKUP_DIR = path.join(__dirname, '../../backups');
const MAX_BACKUPS = 30; // Keep 30 backups

function ensureBackupDir() {
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
    console.log(`Created backup directory: ${BACKUP_DIR}`);
  }
}

function generateBackupName() {
  const now = new Date();
  const timestamp = now.toISOString().replace(/[:.]/g, '-');
  return `messai-backup-${timestamp}.sql`;
}

function createBackup() {
  return new Promise((resolve, reject) => {
    ensureBackupDir();

    const backupName = generateBackupName();
    const backupPath = path.join(BACKUP_DIR, backupName);

    console.log(`Creating backup: ${backupName}`);
    console.log(`Backup path: ${backupPath}`);

    // Parse DATABASE_URL to extract connection details
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      reject(new Error('DATABASE_URL environment variable not found'));
      return;
    }

    let pgDumpCommand;

    if (databaseUrl.includes('localhost')) {
      // Local Docker PostgreSQL
      pgDumpCommand = `docker exec messai-postgres-dev pg_dump -U messai -d messai_dev > "${backupPath}"`;
    } else {
      // Remote PostgreSQL - use pg_dump with URL
      pgDumpCommand = `pg_dump "${databaseUrl}" > "${backupPath}"`;
    }

    exec(pgDumpCommand, (error, stdout, stderr) => {
      if (error) {
        console.error('Backup failed:', error);
        reject(error);
        return;
      }

      if (stderr && !stderr.includes('NOTICE')) {
        console.warn('Backup warnings:', stderr);
      }

      // Verify backup file was created and has content
      if (fs.existsSync(backupPath)) {
        const stats = fs.statSync(backupPath);
        if (stats.size > 0) {
          console.log(`✅ Backup created successfully: ${backupName}`);
          console.log(`📊 Backup size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
          resolve(backupPath);
        } else {
          reject(new Error('Backup file is empty'));
        }
      } else {
        reject(new Error('Backup file was not created'));
      }
    });
  });
}

function cleanupOldBackups() {
  console.log('🧹 Cleaning up old backups...');

  try {
    const files = fs
      .readdirSync(BACKUP_DIR)
      .filter((file) => file.startsWith('messai-backup-') && file.endsWith('.sql'))
      .map((file) => ({
        name: file,
        path: path.join(BACKUP_DIR, file),
        mtime: fs.statSync(path.join(BACKUP_DIR, file)).mtime,
      }))
      .sort((a, b) => b.mtime - a.mtime); // Sort by newest first

    if (files.length > MAX_BACKUPS) {
      const filesToDelete = files.slice(MAX_BACKUPS);
      filesToDelete.forEach((file) => {
        fs.unlinkSync(file.path);
        console.log(`🗑️  Deleted old backup: ${file.name}`);
      });
    }

    console.log(`📁 Keeping ${Math.min(files.length, MAX_BACKUPS)} most recent backups`);
  } catch (error) {
    console.error('Error during cleanup:', error);
  }
}

// Main execution
async function main() {
  try {
    console.log('🚀 Starting database backup...');
    console.log(`📅 Timestamp: ${new Date().toISOString()}`);

    const backupPath = await createBackup();
    cleanupOldBackups();

    console.log('✅ Backup process completed successfully!');
    console.log(`💾 Latest backup: ${path.basename(backupPath)}`);
  } catch (error) {
    console.error('❌ Backup process failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { createBackup, cleanupOldBackups };
