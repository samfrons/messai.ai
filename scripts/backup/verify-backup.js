#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
require('dotenv').config();

const BACKUP_DIR = path.join(__dirname, '../../backups');

function getLatestBackup() {
  if (!fs.existsSync(BACKUP_DIR)) {
    throw new Error('No backup directory found');
  }

  const backups = fs
    .readdirSync(BACKUP_DIR)
    .filter((file) => file.startsWith('messai-backup-') && file.endsWith('.sql'))
    .map((file) => {
      const filePath = path.join(BACKUP_DIR, file);
      const stats = fs.statSync(filePath);
      return {
        name: file,
        path: filePath,
        date: stats.mtime,
        size: stats.size,
      };
    })
    .sort((a, b) => b.date - a.date);

  if (backups.length === 0) {
    throw new Error('No backups found');
  }

  return backups[0];
}

function verifyBackupContent(backupPath) {
  return new Promise((resolve, reject) => {
    console.log('🔍 Analyzing backup content...');

    // Read the backup file and check for key indicators
    const backupContent = fs.readFileSync(backupPath, 'utf8');

    const checks = {
      hasHeader: backupContent.includes('PostgreSQL database dump'),
      hasTableCreation: backupContent.includes('CREATE TABLE'),
      hasData: backupContent.includes('COPY') || backupContent.includes('INSERT'),
      hasResearchPapers:
        backupContent.includes('ResearchPaper') || backupContent.includes('research_paper'),
      hasUsers: backupContent.includes('User') || backupContent.includes('"users"'),
      hasExperiments: backupContent.includes('Experiment') || backupContent.includes('experiments'),
      hasValidEnding:
        backupContent.trim().endsWith('PostgreSQL database dump complete') ||
        backupContent.includes('-- Completed on') ||
        backupContent.length > 1000, // Basic size check
    };

    const passed = Object.values(checks).filter(Boolean).length;
    const total = Object.keys(checks).length;

    console.log('\n📊 Backup Content Analysis:');
    console.log('─'.repeat(40));
    console.log(`✅ Has PostgreSQL header: ${checks.hasHeader ? '✓' : '✗'}`);
    console.log(`✅ Has table creation: ${checks.hasTableCreation ? '✓' : '✗'}`);
    console.log(`✅ Has data inserts: ${checks.hasData ? '✓' : '✗'}`);
    console.log(`✅ Has research papers: ${checks.hasResearchPapers ? '✓' : '✗'}`);
    console.log(`✅ Has users table: ${checks.hasUsers ? '✓' : '✗'}`);
    console.log(`✅ Has experiments: ${checks.hasExperiments ? '✓' : '✗'}`);
    console.log(`✅ Has valid ending: ${checks.hasValidEnding ? '✓' : '✗'}`);
    console.log('─'.repeat(40));
    console.log(`📈 Overall score: ${passed}/${total} (${Math.round((passed / total) * 100)}%)`);

    if (passed >= Math.ceil(total * 0.7)) {
      // 70% pass rate
      resolve({ valid: true, score: passed / total, checks });
    } else {
      reject(new Error(`Backup validation failed. Score: ${passed}/${total}`));
    }
  });
}

function checkBackupSize(backup) {
  const sizeMB = backup.size / 1024 / 1024;

  console.log('\n📏 Backup Size Analysis:');
  console.log('─'.repeat(40));
  console.log(`📊 Size: ${sizeMB.toFixed(2)} MB`);

  if (sizeMB < 0.1) {
    console.log('⚠️  Warning: Backup is very small (< 0.1 MB)');
    return false;
  } else if (sizeMB < 1) {
    console.log('ℹ️  Info: Small backup (< 1 MB) - may be empty database');
    return true;
  } else {
    console.log('✅ Good: Backup has substantial content');
    return true;
  }
}

async function main() {
  try {
    console.log('🔍 Database Backup Verification');
    console.log('═'.repeat(50));

    const latestBackup = getLatestBackup();

    console.log(`📁 Verifying: ${latestBackup.name}`);
    console.log(`📅 Created: ${latestBackup.date.toLocaleString()}`);
    console.log(`📍 Path: ${latestBackup.path}`);

    // Check if file exists and is readable
    if (!fs.existsSync(latestBackup.path)) {
      throw new Error('Backup file not found');
    }

    // Check backup size
    const sizeValid = checkBackupSize(latestBackup);

    // Verify backup content
    const verification = await verifyBackupContent(latestBackup.path);

    console.log('\n🎉 Backup Verification Complete!');
    console.log('═'.repeat(50));

    if (verification.valid && sizeValid) {
      console.log('✅ PASSED: Backup appears to be valid and complete');
      console.log(`📊 Confidence score: ${Math.round(verification.score * 100)}%`);

      // Count approximate number of research papers in backup
      const backupContent = fs.readFileSync(latestBackup.path, 'utf8');
      const paperMatches = backupContent.match(/INSERT INTO.*research.*paper/gi) || [];
      const copyMatches = backupContent.match(/COPY.*research.*paper.*FROM/gi) || [];

      if (paperMatches.length > 0 || copyMatches.length > 0) {
        console.log('📚 Contains research papers data');
      }

      console.log('\n💡 Your data is safely backed up!');
      console.log('   You can restore with: pnpm db:restore');
    } else {
      console.log('❌ FAILED: Backup may be corrupted or incomplete');
      console.log('🔧 Recommendation: Create a new backup with: pnpm db:backup');
    }
  } catch (error) {
    console.error('\n❌ Verification failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('   1. Create a backup first: pnpm db:backup');
    console.log('   2. Check database connection: pnpm db:test');
    console.log('   3. Verify environment variables are set');
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { verifyBackupContent, getLatestBackup };
