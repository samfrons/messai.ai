/**
 * Test script to verify connection to ResearchPaper database
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Testing ResearchPaper database connection...\n');

  try {
    // Test basic connection
    const count = await prisma.researchPaper.count();
    console.log(`✅ Connected successfully!`);
    console.log(`📊 Total ResearchPapers in database: ${count.toLocaleString()}\n`);

    // Get a sample paper
    const samplePaper = await prisma.researchPaper.findFirst({
      take: 1,
    });

    if (samplePaper) {
      console.log('📄 Sample Paper:');
      console.log(`   Title: ${samplePaper.title.substring(0, 80)}...`);
      console.log(`   Journal: ${samplePaper.journal || 'N/A'}`);
      console.log(`   DOI: ${samplePaper.doi || 'N/A'}`);
      console.log(`   System Type: ${samplePaper.systemType || 'N/A'}`);
      console.log(`   Power Output: ${samplePaper.powerOutput || 'N/A'} mW/m²`);
      console.log(`   Has AI Summary: ${samplePaper.aiSummary ? 'Yes' : 'No'}`);
    }

    // Get statistics by system type
    const systemTypes = await prisma.researchPaper.groupBy({
      by: ['systemType'],
      _count: true,
      where: {
        systemType: { not: null },
      },
    });

    console.log('\n📈 Papers by System Type:');
    systemTypes.forEach((type) => {
      console.log(`   ${type.systemType || 'Unknown'}: ${type._count} papers`);
    });

    // Get statistics by source
    const sources = await prisma.researchPaper.groupBy({
      by: ['source'],
      _count: true,
    });

    console.log('\n🌐 Papers by Source:');
    sources.forEach((source) => {
      console.log(`   ${source.source}: ${source._count} papers`);
    });
  } catch (error) {
    console.error('❌ Error connecting to database:', error);
    throw error;
  }
}

async function cleanup() {
  await prisma.$disconnect();
}

// Execute if run directly
if (require.main === module) {
  main()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(cleanup);
}

export { main as testResearchPapers };
