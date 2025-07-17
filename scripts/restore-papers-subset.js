#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const prisma = new PrismaClient();

async function restorePapersSubset(count = 1000) {
  try {
    console.log('📚 Starting partial restore of research papers...');

    // Read the backup file
    const backupPath = path.join(
      __dirname,
      '../backups/messai-prisma-backup-2025-07-17T14-49-37-791Z.json'
    );

    if (!fs.existsSync(backupPath)) {
      console.error('❌ Backup file not found:', backupPath);
      console.log('💡 Please run "pnpm db:backup:prisma" to create a backup first');
      process.exit(1);
    }

    console.log('📖 Reading backup file...');
    const backupData = JSON.parse(fs.readFileSync(backupPath, 'utf8'));

    // First, create users if they don't exist
    if (backupData.data.users && backupData.data.users.length > 0) {
      console.log('👤 Creating users from backup...');
      for (const user of backupData.data.users) {
        try {
          const { accounts, sessions, experiments, researchPapers, ...userData } = user;
          await prisma.user.create({
            data: userData,
          });
        } catch (error) {
          if (!error.message.includes('Unique constraint')) {
            console.warn('⚠️  Error creating user:', error.message);
          }
        }
      }
      console.log('✅ Users created');
    }

    // Extract first N papers
    const papersToRestore = backupData.data.researchPapers.slice(0, count);
    console.log(`📊 Found ${backupData.data.researchPapers.length} papers in backup`);
    console.log(`📥 Importing first ${papersToRestore.length} papers...`);

    // Import papers in batches
    const batchSize = 50;
    let successCount = 0;

    for (let i = 0; i < papersToRestore.length; i += batchSize) {
      const batch = papersToRestore.slice(i, i + batchSize);

      try {
        // Clean up data for createMany (remove relations and extra fields)
        const cleanedBatch = batch.map((paper) => {
          const {
            // Remove relations
            userId,
            experiments,
            user,
            // Remove fields not in current schema
            aiSummary,
            aiKeyFindings,
            aiMethodology,
            aiImplications,
            aiDataExtraction,
            aiInsights,
            aiProcessingDate,
            aiModelVersion,
            aiConfidence,
            experimentalConditions,
            reactorConfiguration,
            electrodeSpecifications,
            biologicalParameters,
            performanceMetrics,
            operationalParameters,
            electrochemicalData,
            timeSeriesData,
            economicMetrics,
            microbialCommunity,
            microbialClassification,
            systemConfiguration,
            performanceBenchmarks,
            // Keep the rest
            ...paperData
          } = paper;

          // Set uploadedBy to null if it's empty
          if (paperData.uploadedBy === '') {
            paperData.uploadedBy = null;
          }

          return paperData;
        });

        const result = await prisma.researchPaper.createMany({
          data: cleanedBatch,
          skipDuplicates: true,
        });

        successCount += result.count;
        console.log(
          `✅ Imported ${Math.min(i + batchSize, papersToRestore.length)} / ${
            papersToRestore.length
          } papers`
        );
      } catch (error) {
        console.error(`⚠️  Error importing batch starting at ${i}:`, error.message);
      }
    }

    // Verify count
    const finalCount = await prisma.researchPaper.count();
    console.log(`\n🎉 Success! Database now contains ${finalCount} research papers`);
    console.log(`📈 Imported ${successCount} new papers in this run`);
  } catch (error) {
    console.error('❌ Error restoring papers:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Execute with count from command line or default to 1000
const count = process.argv[2] ? parseInt(process.argv[2]) : 1000;

if (isNaN(count) || count < 1) {
  console.error('❌ Please provide a valid number of papers to restore');
  console.log('Usage: node restore-papers-subset.js [count]');
  console.log('Example: node restore-papers-subset.js 1000');
  process.exit(1);
}

console.log(`🚀 Restoring ${count} papers to local database...`);
restorePapersSubset(count);
