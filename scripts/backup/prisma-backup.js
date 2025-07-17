#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const BACKUP_DIR = path.join(__dirname, '../../backups');

function ensureBackupDir() {
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
    console.log(`Created backup directory: ${BACKUP_DIR}`);
  }
}

function generateBackupName() {
  const now = new Date();
  const timestamp = now.toISOString().replace(/[:.]/g, '-');
  return `messai-prisma-backup-${timestamp}.json`;
}

async function createPrismaBackup() {
  const prisma = new PrismaClient();

  try {
    console.log('🔗 Connecting to database...');

    // Test connection first
    await prisma.$connect();

    console.log('📊 Exporting data...');

    // Export all research papers (main data)
    const researchPapers = await prisma.researchPaper.findMany({
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        experiments: true,
      },
    });

    // Export other critical data
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        institution: true,
        researchArea: true,
      },
    });

    const experiments = await prisma.experiment.findMany({
      include: {
        measurements: true,
        papers: true,
        design: true,
      },
    });

    const mfcDesigns = await prisma.mFCDesign.findMany();

    // Create backup object
    const backup = {
      metadata: {
        timestamp: new Date().toISOString(),
        version: '1.0',
        source: 'prisma-backup',
        counts: {
          researchPapers: researchPapers.length,
          users: users.length,
          experiments: experiments.length,
          mfcDesigns: mfcDesigns.length,
        },
      },
      data: {
        researchPapers,
        users,
        experiments,
        mfcDesigns,
      },
    };

    ensureBackupDir();
    const backupName = generateBackupName();
    const backupPath = path.join(BACKUP_DIR, backupName);

    console.log('💾 Writing backup file...');
    fs.writeFileSync(backupPath, JSON.stringify(backup, null, 2), 'utf8');

    const stats = fs.statSync(backupPath);
    const sizeMB = (stats.size / 1024 / 1024).toFixed(2);

    console.log('✅ Backup created successfully!');
    console.log(`📁 File: ${backupName}`);
    console.log(`📊 Size: ${sizeMB} MB`);
    console.log(`📚 Research Papers: ${researchPapers.length}`);
    console.log(`👥 Users: ${users.length}`);
    console.log(`🧪 Experiments: ${experiments.length}`);

    return backupPath;
  } catch (error) {
    console.error('❌ Backup failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Main execution
async function main() {
  try {
    console.log('🚀 Starting Prisma backup...');
    console.log(`📅 Timestamp: ${new Date().toISOString()}`);

    const backupPath = await createPrismaBackup();

    console.log('✅ Backup process completed successfully!');
    console.log(`💾 Backup saved to: ${path.basename(backupPath)}`);
    console.log('\n💡 This is a JSON backup. For production, also use SQL backups.');
  } catch (error) {
    console.error('❌ Backup process failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { createPrismaBackup };
