#!/usr/bin/env node

/**
 * Script to export priority research papers data for production import
 * This script generates a JSON file that can be safely imported to production
 */

import { config } from 'dotenv';
import path from 'path';
import fs from 'fs';
import { prisma } from '../libs/data-access/database/src/client';

// Load environment variables
config({ path: path.join(__dirname, '..', '.env.local') });

// DOIs of priority papers
const PRIORITY_DOIS = [
  '10.1038/s41579-019-0173-x',
  '10.1016/j.rser.2006.07.016',
  '10.1016/j.biortech.2009.10.017',
  '10.1016/j.bios.2019.111747',
  '10.1039/d0ee03442j',
  '10.1016/j.aej.2015.03.020',
  '10.1016/j.tibtech.2005.04.008',
  '10.1007/s00253-010-2930-9',
  '10.1111/j.1574-6976.2009.00191.x',
  '10.1016/j.elecom.2006.10.023',
  '10.1021/es062758h',
  '10.1021/es049652w',
  '10.1016/j.watres.2005.05.019',
  '10.1016/j.watres.2007.06.005',
  '10.1016/S0141-0229(01)00478-1',
  '10.1021/es052009r',
  '10.1016/j.biortech.2005.07.017',
  '10.1016/j.watres.2005.09.019',
  '10.1016/j.jpowsour.2006.02.023',
  '10.1128/AEM.66.4.1292-1297.2000',
  '10.1021/es052477l',
  '10.1016/j.watres.2007.01.010',
  '10.1016/j.tibtech.2008.04.008',
  '10.1016/j.jpowsour.2005.03.033',
  '10.1039/d0ee00545b',
  '10.1016/j.watres.2021.117223',
  '10.1016/j.apenergy.2022.119847',
  '10.1016/j.bios.2023.114312',
  '10.1021/acs.est.4c00123',
  '10.1016/j.watres.2023.119789',
];

async function exportPapersForProduction() {
  console.log('🚀 Exporting priority research papers for production import\n');

  // Check environment
  const isProduction =
    process.env.NODE_ENV === 'production' ||
    process.env.DATABASE_URL?.includes('supabase') ||
    process.env.DATABASE_URL?.includes('neon');

  if (isProduction) {
    console.error('❌ This script should be run in local environment!');
    process.exit(1);
  }

  // Fetch papers from local database
  const papers = await prisma.researchPaper.findMany({
    where: {
      doi: {
        in: PRIORITY_DOIS,
      },
    },
    select: {
      title: true,
      abstract: true,
      authors: true,
      publicationDate: true,
      journal: true,
      volume: true,
      issue: true,
      pages: true,
      keywords: true,
      externalUrl: true,
      doi: true,
      pubmedId: true,
      arxivId: true,
      systemType: true,
      anodeMaterials: true,
      cathodeMaterials: true,
      powerOutput: true,
      source: true,
      aiConfidence: true,
    },
  });

  console.log(`Found ${papers.length} papers in local database`);

  // Prepare export data
  const exportData = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    source: 'priority-papers-script',
    papers: papers.map((paper) => ({
      ...paper,
      // Ensure required fields have defaults
      source: paper.source || 'crossref',
      isPublic: true,
      aiConfidence: paper.aiConfidence || 0.95,
    })),
  };

  // Write to file
  const outputPath = path.join(__dirname, '..', 'data', 'priority-papers-export.json');
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(exportData, null, 2));

  console.log(`\n✅ Export complete!`);
  console.log(`📄 File saved to: ${outputPath}`);
  console.log(`📊 Total papers exported: ${papers.length}`);

  // Create production import script
  const importScriptPath = path.join(__dirname, 'import-priority-papers-production.ts');
  const importScript = `#!/usr/bin/env node

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
  console.log('🚀 Starting production import of priority research papers\\n');
  
  // Verify production environment
  const isProduction = process.env.NODE_ENV === 'production' || 
                      process.env.DATABASE_URL?.includes('supabase') ||
                      process.env.DATABASE_URL?.includes('neon');
  
  if (!isProduction) {
    console.error('❌ This script must be run in production environment!');
    console.error('Set NODE_ENV=production or use production DATABASE_URL');
    process.exit(1);
  }
  
  // Additional safety check
  const paperCount = await prisma.researchPaper.count();
  console.log(\`Current papers in database: \${paperCount}\`);
  
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
  console.log(\`Import file version: \${exportData.version}\`);
  console.log(\`Papers to import: \${exportData.papers.length}\`);
  
  const stats = {
    added: 0,
    skipped: 0,
    failed: 0
  };
  
  // Import papers one by one
  for (const paperData of exportData.papers) {
    try {
      // Check if already exists
      if (paperData.doi) {
        const existing = await prisma.researchPaper.findUnique({
          where: { doi: paperData.doi }
        });
        
        if (existing) {
          console.log(\`⏭️  Skipping existing: \${paperData.doi}\`);
          stats.skipped++;
          continue;
        }
      }
      
      // Create paper
      await prisma.researchPaper.create({
        data: {
          ...paperData,
          publicationDate: paperData.publicationDate ? new Date(paperData.publicationDate) : undefined,
        }
      });
      
      console.log(\`✅ Added: \${paperData.title.substring(0, 60)}...\`);
      stats.added++;
      
    } catch (error) {
      console.error(\`❌ Failed to add paper: \${error.message}\`);
      stats.failed++;
    }
  }
  
  // Final report
  console.log('\\n📊 Import Complete:');
  console.log(\`✅ Added: \${stats.added}\`);
  console.log(\`⏭️  Skipped: \${stats.skipped}\`);
  console.log(\`❌ Failed: \${stats.failed}\`);
  
  const finalCount = await prisma.researchPaper.count();
  console.log(\`\\nTotal papers in database: \${finalCount}\`);
}

// Run import with confirmation
console.log('⚠️  WARNING: This will modify the PRODUCTION database!');
console.log('Press Ctrl+C to cancel, or wait 5 seconds to continue...\\n');

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
`;

  fs.writeFileSync(importScriptPath, importScript);
  fs.chmodSync(importScriptPath, '755');

  console.log(`\n📄 Production import script created: ${importScriptPath}`);
  console.log('\n📋 Next steps:');
  console.log('1. Review the exported data in data/priority-papers-export.json');
  console.log('2. Deploy the import script to production');
  console.log('3. Run: NODE_ENV=production pnpm tsx scripts/import-priority-papers-production.ts');
}

// Run export
exportPapersForProduction()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
