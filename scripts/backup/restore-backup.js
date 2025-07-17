#!/usr/bin/env node

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');
require('dotenv').config();

const BACKUP_DIR = path.join(__dirname, '../../backups');

function listBackups() {
  if (!fs.existsSync(BACKUP_DIR)) {
    console.log('❌ No backup directory found. Create a backup first with: pnpm db:backup');
    return [];
  }

  const files = fs
    .readdirSync(BACKUP_DIR)
    .filter((file) => file.startsWith('messai-backup-') && file.endsWith('.sql'))
    .map((file) => {
      const filePath = path.join(BACKUP_DIR, file);
      const stats = fs.statSync(filePath);
      return {
        name: file,
        path: filePath,
        size: stats.size,
        date: stats.mtime,
      };
    })
    .sort((a, b) => b.date - a.date); // Sort by newest first

  return files;
}

function displayBackups(backups) {
  console.log('\n📁 Available Backups:');
  console.log('─'.repeat(80));

  backups.forEach((backup, index) => {
    const sizeInMB = (backup.size / 1024 / 1024).toFixed(2);
    const dateStr = backup.date.toLocaleString();
    console.log(`${index + 1}. ${backup.name}`);
    console.log(`   📅 Created: ${dateStr}`);
    console.log(`   📊 Size: ${sizeInMB} MB`);
    console.log('');
  });
}

function askQuestion(question) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

async function selectBackup(backups) {
  displayBackups(backups);

  const answer = await askQuestion('Select backup number to restore (or "q" to quit): ');

  if (answer.toLowerCase() === 'q') {
    console.log('👋 Restore cancelled');
    process.exit(0);
  }

  const selection = parseInt(answer);
  if (isNaN(selection) || selection < 1 || selection > backups.length) {
    console.log('❌ Invalid selection. Please try again.');
    return await selectBackup(backups);
  }

  return backups[selection - 1];
}

async function confirmRestore(backup) {
  console.log(`\n⚠️  WARNING: This will COMPLETELY REPLACE your current database!`);
  console.log(`📁 Backup to restore: ${backup.name}`);
  console.log(`📅 Created: ${backup.date.toLocaleString()}`);
  console.log(`📊 Size: ${(backup.size / 1024 / 1024).toFixed(2)} MB`);

  const confirmation = await askQuestion('\nType "YES" to proceed with restore: ');

  if (confirmation !== 'YES') {
    console.log('👋 Restore cancelled');
    process.exit(0);
  }

  return true;
}

function restoreDatabase(backupPath) {
  return new Promise((resolve, reject) => {
    console.log('\n🔄 Starting database restoration...');

    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      reject(new Error('DATABASE_URL environment variable not found'));
      return;
    }

    let restoreCommand;

    if (databaseUrl.includes('localhost')) {
      // Local Docker PostgreSQL
      console.log('🐳 Restoring to local Docker PostgreSQL...');

      // First drop and recreate the database
      const dropDbCommand = `docker exec messai-postgres-dev psql -U messai -c "DROP DATABASE IF EXISTS messai_dev;"`;
      const createDbCommand = `docker exec messai-postgres-dev psql -U messai -c "CREATE DATABASE messai_dev;"`;

      exec(dropDbCommand, (error) => {
        if (error) {
          console.warn('Warning dropping database:', error.message);
        }

        exec(createDbCommand, (error) => {
          if (error) {
            reject(new Error(`Failed to create database: ${error.message}`));
            return;
          }

          // Now restore from backup
          restoreCommand = `docker exec -i messai-postgres-dev psql -U messai -d messai_dev < "${backupPath}"`;

          exec(restoreCommand, (error, stdout, stderr) => {
            if (error) {
              reject(new Error(`Restore failed: ${error.message}`));
              return;
            }

            if (stderr && !stderr.includes('NOTICE')) {
              console.warn('Restore warnings:', stderr);
            }

            resolve(stdout);
          });
        });
      });
    } else {
      // Remote PostgreSQL
      console.log('☁️  Restoring to remote PostgreSQL...');
      console.log('⚠️  WARNING: Remote restore requires careful consideration!');
      reject(new Error('Remote restore not implemented for safety. Use local development setup.'));
    }
  });
}

async function main() {
  try {
    console.log('🗃️  Database Restore Utility');
    console.log('─'.repeat(40));

    const backups = listBackups();

    if (backups.length === 0) {
      console.log('❌ No backups found. Create a backup first with: pnpm db:backup');
      return;
    }

    const selectedBackup = await selectBackup(backups);
    await confirmRestore(selectedBackup);

    await restoreDatabase(selectedBackup.path);

    console.log('✅ Database restored successfully!');
    console.log('🔄 You may need to restart your application and regenerate Prisma client.');
    console.log('   Run: pnpm db:generate && pnpm dev');
  } catch (error) {
    console.error('❌ Restore failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { restoreDatabase, listBackups };
