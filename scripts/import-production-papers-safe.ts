#!/usr/bin/env node
// Safe production import script using raw SQL to avoid schema mismatch issues

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
      // Use raw SQL to check if paper exists
      const existingResult = await prisma.$queryRaw`
        SELECT id FROM "ResearchPaper" WHERE doi = ${paper.doi} LIMIT 1
      `;

      if (Array.isArray(existingResult) && existingResult.length > 0) {
        console.log(`⏭️ Skipping existing paper: ${paper.doi}`);
        skipped++;
        continue;
      }

      // Insert using raw SQL with only the fields we know exist in production
      await prisma.$executeRaw`
        INSERT INTO "ResearchPaper" (
          id, title, abstract, authors, "publicationDate", journal, volume, issue, pages,
          keywords, "externalUrl", doi, "pubmedId", "arxivId", "organismTypes",
          "anodeMaterials", "cathodeMaterials", "powerOutput", efficiency, "systemType",
          source, "uploadedBy", "isPublic", "aiSummary", "aiKeyFindings", "aiMethodology",
          "aiImplications", "aiDataExtraction", "aiInsights", "aiProcessingDate",
          "aiModelVersion", "aiConfidence", "experimentalConditions", "reactorConfiguration",
          "electrodeSpecifications", "biologicalParameters", "performanceMetrics",
          "operationalParameters", "electrochemicalData", "timeSeriesData", "economicMetrics",
          "microbialCommunity", "microbialClassification", "systemConfiguration",
          "performanceBenchmarks", "createdAt", "updatedAt"
        ) VALUES (
          ${paper.id}, ${paper.title}, ${paper.abstract || ''}, ${paper.authors},
          ${paper.publicationDate ? new Date(paper.publicationDate) : null},
          ${paper.journal || ''}, ${paper.volume || null}, ${paper.issue || null},
          ${paper.pages || null}, ${paper.keywords || '[]'}, ${paper.externalUrl},
          ${paper.doi}, ${paper.pubmedId || null}, ${paper.arxivId || null},
          ${paper.organismTypes || null}, ${paper.anodeMaterials || null},
          ${paper.cathodeMaterials || null}, ${paper.powerOutput || null},
          ${paper.efficiency || null}, ${paper.systemType || null}, ${paper.source},
          ${paper.uploadedBy || null}, ${paper.isPublic}, ${paper.aiSummary || null},
          ${paper.aiKeyFindings || null}, ${paper.aiMethodology || null},
          ${paper.aiImplications || null}, ${paper.aiDataExtraction || null},
          ${paper.aiInsights || null}, ${
        paper.aiProcessingDate ? new Date(paper.aiProcessingDate) : null
      },
          ${paper.aiModelVersion || null}, ${paper.aiConfidence || null},
          ${paper.experimentalConditions || null}, ${paper.reactorConfiguration || null},
          ${paper.electrodeSpecifications || null}, ${paper.biologicalParameters || null},
          ${paper.performanceMetrics || null}, ${paper.operationalParameters || null},
          ${paper.electrochemicalData || null}, ${paper.timeSeriesData || null},
          ${paper.economicMetrics || null}, ${paper.microbialCommunity || null},
          ${paper.microbialClassification || null}, ${paper.systemConfiguration || null},
          ${paper.performanceBenchmarks || null}, ${new Date(paper.createdAt)},
          ${new Date(paper.updatedAt)}
        )
      `;

      console.log(`✅ Added: ${paper.title.substring(0, 60)}...`);
      added++;
    } catch (e: any) {
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
