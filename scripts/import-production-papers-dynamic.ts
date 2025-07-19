#!/usr/bin/env node
// Dynamic production import script that adapts to the actual database schema

import { config } from 'dotenv';
import path from 'path';
import fs from 'fs';
import { prisma } from '../libs/data-access/database/src/client';

config();

async function getExistingColumns(): Promise<string[]> {
  const result = await prisma.$queryRaw<Array<{ column_name: string }>>`
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_name = 'ResearchPaper' 
    AND table_schema = 'public'
  `;
  return result.map((row) => row.column_name);
}

async function importPapers() {
  if (process.env.NODE_ENV !== 'production') {
    console.error('This script must run in production!');
    process.exit(1);
  }

  // First, get the actual columns in the production database
  console.log('Checking production database schema...');
  const existingColumns = await getExistingColumns();
  console.log(`Found ${existingColumns.length} columns in production ResearchPaper table`);

  // Use the comprehensive export file
  const dataPath = path.join(__dirname, '..', 'data', 'all-priority-papers-production.json');
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

  console.log(`\nImporting ${data.count} papers...`);

  let added = 0;
  let skipped = 0;
  let failed = 0;

  // Core fields that should always exist
  const coreFields = [
    'id',
    'title',
    'abstract',
    'authors',
    'publicationDate',
    'journal',
    'volume',
    'issue',
    'pages',
    'keywords',
    'externalUrl',
    'doi',
    'source',
    'isPublic',
    'createdAt',
    'updatedAt',
  ];

  for (const paper of data.papers) {
    try {
      // Check if paper exists
      const existingResult = await prisma.$queryRaw`
        SELECT id FROM "ResearchPaper" WHERE doi = ${paper.doi} LIMIT 1
      `;

      if (Array.isArray(existingResult) && existingResult.length > 0) {
        console.log(`⏭️ Skipping existing paper: ${paper.doi}`);
        skipped++;
        continue;
      }

      // Build INSERT query with only columns that exist in production
      const fieldsToInsert: string[] = [];
      const valuesToInsert: any[] = [];

      // Add core fields
      for (const field of coreFields) {
        if (existingColumns.includes(field) && paper[field] !== undefined) {
          fieldsToInsert.push(`"${field}"`);
          if (field === 'publicationDate' && paper[field]) {
            valuesToInsert.push(new Date(paper[field]));
          } else if (field === 'createdAt' || field === 'updatedAt') {
            valuesToInsert.push(new Date(paper[field]));
          } else {
            valuesToInsert.push(paper[field]);
          }
        }
      }

      // Add optional fields that exist in production
      const optionalFields = [
        'pubmedId',
        'arxivId',
        'systemType',
        'anodeMaterials',
        'cathodeMaterials',
        'powerOutput',
        'efficiency',
        'uploadedBy',
        'aiSummary',
        'aiKeyFindings',
        'aiMethodology',
        'aiImplications',
        'aiDataExtraction',
        'aiInsights',
        'aiProcessingDate',
        'aiModelVersion',
        'aiConfidence',
      ];

      for (const field of optionalFields) {
        if (
          existingColumns.includes(field) &&
          paper[field] !== undefined &&
          paper[field] !== null
        ) {
          fieldsToInsert.push(`"${field}"`);
          if (field === 'aiProcessingDate' && paper[field]) {
            valuesToInsert.push(new Date(paper[field]));
          } else {
            valuesToInsert.push(paper[field]);
          }
        }
      }

      // Build dynamic SQL query
      const placeholders = valuesToInsert.map((_, i) => `$${i + 1}`).join(', ');
      const query = `
        INSERT INTO "ResearchPaper" (${fieldsToInsert.join(', ')})
        VALUES (${placeholders})
      `;

      // Execute the query
      await prisma.$executeRawUnsafe(query, ...valuesToInsert);

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
