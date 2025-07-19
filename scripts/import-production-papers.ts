#!/usr/bin/env node
// Production import script for priority papers
// Run with: NODE_ENV=production pnpm tsx scripts/import-production-papers.ts

import { config } from 'dotenv';
import path from 'path';
import fs from 'fs';
import { prisma } from '../libs/data-access/database/src/client';

config();

async function importPapers() {
  if (process.env.NODE_ENV !== 'production') {
    console.error('This script must run in production!');
    process.exit(1);
  }

  const dataPath = path.join(__dirname, '..', 'data', 'priority-papers-production.json');
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

  console.log(`Importing ${data.count} papers...`);

  let added = 0;
  let skipped = 0;
  let failed = 0;

  for (const paper of data.papers) {
    try {
      // Check if paper exists by DOI
      const existing = await prisma.researchPaper.findFirst({
        where: { doi: paper.doi },
      });

      if (existing) {
        console.log(`⏭️ Skipping existing paper: ${paper.doi}`);
        skipped++;
        continue;
      }

      // Remove fields that don't exist in production
      const {
        ieeeId,
        inSilicoAvailable,
        modelType,
        modelParameters,
        performanceTargets,
        systemGeometry,
        materialSpecs,
        operatingSpecs,
        methodology,
        dataCompleteness,
        reproducibilityScore,
        recreationDifficulty,
        parameterCompleteness,
        validationStatus,
        modelAccuracy,
        lastValidated,
        ...cleanPaper
      } = paper;

      // Create paper with only fields that exist in production
      await prisma.researchPaper.create({
        data: {
          ...cleanPaper,
          publicationDate: paper.publicationDate ? new Date(paper.publicationDate) : undefined,
          createdAt: new Date(paper.createdAt),
          updatedAt: new Date(paper.updatedAt),
        },
      });

      console.log(`✅ Added: ${paper.title.substring(0, 60)}...`);
      added++;
    } catch (e) {
      console.error(`Failed to import ${paper.doi}:`, e.message);
      failed++;
    }
  }

  console.log(`\n📊 Import Complete:`);
  console.log(`✅ Added: ${added}`);
  console.log(`⏭️ Skipped: ${skipped}`);
  console.log(`❌ Failed: ${failed}`);
}

importPapers()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
