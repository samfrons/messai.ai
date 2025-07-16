/**
 * Database Statistics Script - Research Papers
 *
 * This script is no longer used for seeding mock data.
 * It now only displays statistics about the existing research papers in the database.
 * The real research papers should be imported through the proper data pipeline.
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('📊 Research Papers Database Statistics\n');

  try {
    // Get basic statistics
    const totalPapers = await prisma.paper.count();
    const verifiedPapers = await prisma.paper.count({ where: { verified: true } });
    const papersWithMetrics = await prisma.paper.count({
      where: {
        performanceData: { not: null },
      },
    });
    const papersWithPdfUrl = await prisma.paper.count({ where: { pdfUrl: { not: null } } });

    console.log('📈 Paper Counts:');
    console.log(`   Total papers: ${totalPapers.toLocaleString()}`);
    console.log(`   Verified papers: ${verifiedPapers.toLocaleString()}`);
    console.log(`   Papers with performance metrics: ${papersWithMetrics.toLocaleString()}`);
    console.log(`   Papers with PDF URL: ${papersWithPdfUrl.toLocaleString()}`);

    // Get year distribution
    const papers = await prisma.paper.findMany({
      select: { year: true },
      where: { year: { gt: 0 } },
    });

    const yearDistribution = papers.reduce((acc, paper) => {
      const year = paper.year!;
      acc[year] = (acc[year] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    const sortedYears = Object.entries(yearDistribution)
      .sort(([a], [b]) => Number(b) - Number(a))
      .slice(0, 10);

    console.log('\n📅 Top 10 Years by Paper Count:');
    sortedYears.forEach(([year, count]) => {
      console.log(`   ${year}: ${count} papers`);
    });

    // Get tag statistics
    const tags = await prisma.tag.findMany({
      include: {
        _count: {
          select: { papers: true },
        },
      },
      orderBy: {
        papers: {
          _count: 'desc',
        },
      },
      take: 10,
    });

    console.log('\n🏷️  Top 10 Research Tags:');
    tags.forEach((tag) => {
      console.log(`   ${tag.name}: ${tag._count.papers} papers`);
    });

    // Test cross-environment compatibility
    console.log('\n🔧 Database Environment Check:');
    const samplePaper = await prisma.paper.findFirst({
      include: {
        tags: true,
        uploadedBy: true,
      },
    });

    if (samplePaper) {
      console.log(`✅ Database connection successful`);
      console.log(`   Sample paper: ${samplePaper.title.substring(0, 50)}...`);
      console.log(
        `   Authors type: ${typeof samplePaper.authors} (${
          Array.isArray(samplePaper.authors) ? 'Array' : 'JSON'
        })`
      );
      console.log(`   Database provider: ${process.env.DATABASE_PROVIDER || 'sqlite'}`);
    } else {
      console.log('⚠️  No papers found in database');
      console.log('   Please ensure your research papers have been properly imported');
    }

    console.log('\n✅ Statistics report completed!');
  } catch (error) {
    console.error('❌ Error generating statistics:', error);
    throw error;
  }
}

// Note: Tag color functionality removed since Tag model doesn't have color field

/**
 * Cleanup function
 */
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

export { main as seedResearchPapers };
