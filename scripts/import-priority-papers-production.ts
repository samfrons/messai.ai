#!/usr/bin/env node

/**
 * Production Import Script for Priority Research Papers
 *
 * IMPORTANT: This script is designed to run in production environment
 * It imports pre-validated paper data from the export file
 */

import { config } from 'dotenv';
import path from 'path';
import fs from 'fs';
import { prisma } from '../libs/data-access/database/src/client';

// Load environment variables
config();

async function importPapersToProduction() {
  console.log('🚀 Starting production import of priority research papers\n');

  // Verify production environment
  const isProduction =
    process.env.NODE_ENV === 'production' ||
    process.env.DATABASE_URL?.includes('supabase') ||
    process.env.DATABASE_URL?.includes('neon');

  if (!isProduction) {
    console.error('❌ This script must be run in production environment!');
    console.error('Set NODE_ENV=production or use production DATABASE_URL');
    process.exit(1);
  }

  // Additional safety check
  const paperCount = await prisma.researchPaper.count();
  console.log(`Current papers in database: ${paperCount}`);

  if (paperCount < 2000) {
    console.error('❌ This does not appear to be the production database!');
    console.error('Expected 4000+ papers, found ' + paperCount);
    process.exit(1);
  }

  // Load export data
  const exportPath = path.join(__dirname, '..', 'data', 'priority-papers-export.json');
  if (!fs.existsSync(exportPath)) {
    console.error('❌ Export file not found: ' + exportPath);
    console.error('Run export-priority-papers-for-production.ts first');
    process.exit(1);
  }

  const exportData = JSON.parse(fs.readFileSync(exportPath, 'utf-8'));
  console.log(`Import file version: ${exportData.version}`);
  console.log(`Papers to import: ${exportData.papers.length}`);

  const stats = {
    added: 0,
    skipped: 0,
    failed: 0,
  };

  // Import papers one by one
  for (const paperData of exportData.papers) {
    try {
      // Check if already exists
      if (paperData.doi) {
        const existing = await prisma.researchPaper.findUnique({
          where: { doi: paperData.doi },
        });

        if (existing) {
          console.log(`⏭️  Skipping existing: ${paperData.doi}`);
          stats.skipped++;
          continue;
        }
      }

      // Create paper
      await prisma.researchPaper.create({
        data: {
          ...paperData,
          publicationDate: paperData.publicationDate
            ? new Date(paperData.publicationDate)
            : undefined,
        },
      });

      console.log(`✅ Added: ${paperData.title.substring(0, 60)}...`);
      stats.added++;
    } catch (error) {
      console.error(`❌ Failed to add paper: ${error.message}`);
      stats.failed++;
    }
  }

  // Final report
  console.log('\n📊 Import Complete:');
  console.log(`✅ Added: ${stats.added}`);
  console.log(`⏭️  Skipped: ${stats.skipped}`);
  console.log(`❌ Failed: ${stats.failed}`);

  const finalCount = await prisma.researchPaper.count();
  console.log(`\nTotal papers in database: ${finalCount}`);
}

// Run import with confirmation
console.log('⚠️  WARNING: This will modify the PRODUCTION database!');
console.log('Press Ctrl+C to cancel, or wait 5 seconds to continue...\n');

setTimeout(() => {
  importPapersToProduction()
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}, 5000);
