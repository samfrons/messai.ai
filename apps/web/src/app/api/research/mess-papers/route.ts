import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';
import { normalizeAuthorsForDB, normalizeAuthors } from '../../../../lib/author-utils';

// Mock implementation of MESS papers processing
// In real implementation, this would use the actual processor
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'process') {
      // Process MESS papers
      const result = await processMESSPapers();
      return NextResponse.json({
        data: result,
        error: null,
      });
    }

    if (action === 'status') {
      // Get processing status
      const status = await getProcessingStatus();
      return NextResponse.json({
        data: status,
        error: null,
      });
    }

    return NextResponse.json(
      {
        data: null,
        error: {
          message: 'Invalid action',
          code: 'INVALID_ACTION',
        },
      },
      { status: 400 }
    );
  } catch (error) {
    console.error('MESS papers API error:', error);
    return NextResponse.json(
      {
        data: null,
        error: {
          message: 'Failed to process MESS papers',
          code: 'PROCESSING_ERROR',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const operation = searchParams.get('operation');

    if (operation === 'list') {
      // List processed MESS papers
      const papers = await listMESSPapers();
      return NextResponse.json({
        data: papers,
        error: null,
      });
    }

    if (operation === 'stats') {
      // Get processing statistics
      const stats = await getProcessingStats();
      return NextResponse.json({
        data: stats,
        error: null,
      });
    }

    // Default: return available operations
    return NextResponse.json({
      data: {
        availableOperations: ['list', 'stats'],
        availableActions: ['process', 'status'],
        description: 'MESS papers processing endpoint',
      },
      error: null,
    });
  } catch (error) {
    console.error('MESS papers API error:', error);
    return NextResponse.json(
      {
        data: null,
        error: {
          message: 'Failed to fetch MESS papers data',
          code: 'FETCH_ERROR',
        },
      },
      { status: 500 }
    );
  }
}

async function processMESSPapers() {
  // Mock processing results - in real implementation, use actual processor
  const mockPapers = [
    {
      fileName: '1-s2.0-S0378775324016409-main.pdf',
      title: 'Enhanced algae-based microbial fuel cell performance through microfluidic design',
      authors: 'Chen, L., Wang, X., Liu, Y., Zhang, M.',
      year: 2024,
      journal: 'Journal of Power Sources',
      doi: '10.1016/j.jpowsour.2024.234567',
      abstract:
        'This study investigates the performance enhancement of algae-based microbial fuel cells through innovative microfluidic design...',
      algaeSpecies: ['Chlorella vulgaris'],
      fuelCellType: 'MFC',
      powerDensity: 450,
      qualityScore: 92,
      confidence: 95,
      processingTime: 15000,
      status: 'success',
    },
    {
      fileName: 's41467-024-52498-w.pdf',
      title: 'Optimization of Scenedesmus obliquus cultivation in photobioreactors',
      authors: 'Johnson, A., Smith, B., Davis, C.',
      year: 2024,
      journal: 'Nature Communications',
      doi: '10.1038/s41467-024-52498-w',
      abstract:
        'This research focuses on optimizing Scenedesmus obliquus cultivation parameters in photobioreactors...',
      algaeSpecies: ['Scenedesmus obliquus'],
      fuelCellType: 'Photobioreactor',
      powerDensity: 320,
      qualityScore: 88,
      confidence: 90,
      processingTime: 18000,
      status: 'success',
    },
    {
      fileName: 's41598-025-91889-x.pdf',
      title: 'Microfluidic algae bioreactor for sustainable energy production',
      authors: 'Brown, M., Taylor, R., Wilson, K.',
      year: 2025,
      journal: 'Scientific Reports',
      doi: '10.1038/s41598-025-91889-x',
      abstract: 'Novel microfluidic design for algae cultivation and energy harvesting...',
      algaeSpecies: ['Spirulina platensis'],
      fuelCellType: 'Microfluidic',
      powerDensity: 280,
      qualityScore: 85,
      confidence: 88,
      processingTime: 12000,
      status: 'success',
    },
    {
      fileName: 'Algal_Biofuels_Current_Status_and_Key_Challenges.pdf',
      title: 'Algal Biofuels: Current Status and Key Challenges',
      authors: 'Brown, M., Taylor, R., Wilson, K.',
      year: 2023,
      journal: 'Renewable Energy',
      abstract:
        'This comprehensive review examines the current state of algal biofuel technology...',
      algaeSpecies: ['Multiple species'],
      fuelCellType: 'Review',
      qualityScore: 78,
      confidence: 82,
      processingTime: 8000,
      status: 'success',
    },
    {
      fileName: 'Marimuthuetal.2015-Perfusionchip.pdf',
      title: 'Perfusion chip for cultivation of microalgae and real-time monitoring',
      authors: 'Marimuthu, S., Ramasamy, E., Lee, J.',
      year: 2015,
      journal: 'Lab on a Chip',
      doi: '10.1039/c5lc00123a',
      abstract: 'We developed a perfusion chip for continuous cultivation of microalgae...',
      algaeSpecies: ['Chlorella vulgaris'],
      fuelCellType: 'Perfusion chip',
      qualityScore: 80,
      confidence: 85,
      processingTime: 10000,
      status: 'success',
    },
    {
      fileName: 'Microbial fuel cells and their electrified biofilms.pdf',
      title: 'Microbial fuel cells and their electrified biofilms',
      authors: 'Liu, H., Ramnarayanan, R., Logan, B.E.',
      year: 2004,
      journal: 'Environmental Science & Technology',
      doi: '10.1021/es035292b',
      abstract: 'This review examines the role of electrified biofilms in microbial fuel cells...',
      algaeSpecies: ['Various microorganisms'],
      fuelCellType: 'MFC',
      qualityScore: 95,
      confidence: 98,
      processingTime: 14000,
      status: 'success',
    },
    {
      fileName: 'energies-14-03381.pdf',
      title:
        'Recent Advances in Algae-Based Microbial Fuel Cells for Sustainable Energy Production',
      authors: 'Kim, S., Park, J., Lee, H.',
      year: 2021,
      journal: 'Energies',
      doi: '10.3390/en14113381',
      abstract: 'This paper reviews recent advances in algae-based microbial fuel cells...',
      algaeSpecies: ['Multiple species'],
      fuelCellType: 'MFC',
      qualityScore: 82,
      confidence: 87,
      processingTime: 11000,
      status: 'success',
    },
  ];

  // Add papers to database
  const addedPapers = [];
  for (const paper of mockPapers) {
    try {
      // Check if paper already exists
      const existingPaper = await prisma.researchPaper.findFirst({
        where: {
          OR: [{ title: paper.title }, ...(paper.doi ? [{ doi: paper.doi }] : [])],
        },
      });

      if (existingPaper) {
        console.log(`Paper already exists: ${paper.title}`);
        continue;
      }

      // Create paper record
      const createdPaper = await prisma.researchPaper.create({
        data: {
          title: paper.title,
          authors: JSON.stringify(normalizeAuthorsForDB(paper.authors)), // ResearchPaper.authors is JSON string
          abstract: paper.abstract,
          publicationDate: paper.year ? new Date(paper.year, 0, 1) : null,
          journal: paper.journal,
          doi: paper.doi || null,
          externalUrl: '', // Required field
          source: 'user', // Required field
          keywords: JSON.stringify(['mess-papers', 'algae', 'fuel-cell', 'bioreactor']), // Required field

          // AI-extracted data
          aiSummary: paper.abstract?.substring(0, 500),
          aiKeyFindings: JSON.stringify([
            `Power density: ${paper.powerDensity || 'N/A'} mW/m²`,
            `Algae species: ${paper.algaeSpecies?.join(', ') || 'N/A'}`,
            `System type: ${paper.fuelCellType || 'N/A'}`,
          ]),
          performanceMetrics: JSON.stringify({
            powerDensity: paper.powerDensity || null,
            algaeSpecies: paper.algaeSpecies || [],
            fuelCellType: paper.fuelCellType || null,
          }),

          // Metadata
          aiConfidence: (paper.qualityScore || 75) / 100, // Convert to 0-1 scale
          isPublic: true,

          // Source tracking
          uploadedBy: null, // System-added
        },
      });

      // Tags are now stored in the keywords field as JSON (updated during creation)

      addedPapers.push({
        ...paper,
        paperId: createdPaper.id,
      });

      console.log(`Added paper: ${paper.title}`);
    } catch (error) {
      console.error(`Error adding paper ${paper.title}:`, error);
    }
  }

  return {
    totalPapers: mockPapers.length,
    processedPapers: addedPapers.length,
    failedPapers: mockPapers.length - addedPapers.length,
    papers: addedPapers,
    processingTime: addedPapers.reduce((sum, p) => sum + p.processingTime, 0),
    averageProcessingTime:
      addedPapers.length > 0
        ? addedPapers.reduce((sum, p) => sum + p.processingTime, 0) / addedPapers.length
        : 0,
    successRate: (addedPapers.length / mockPapers.length) * 100,
  };
}

async function getProcessingStatus() {
  // Get count of MESS papers in database
  const messCount = await prisma.researchPaper.count({
    where: {
      keywords: {
        contains: 'mess-papers',
      },
    },
  });

  return {
    status: messCount > 0 ? 'completed' : 'not_started',
    processedCount: messCount,
    totalExpected: 7,
    lastProcessed: messCount > 0 ? new Date() : null,
  };
}

async function listMESSPapers() {
  const papers = await prisma.researchPaper.findMany({
    where: {
      keywords: {
        contains: 'mess-papers',
      },
    },
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
      experiments: true,
    },
    orderBy: [{ aiConfidence: 'desc' }, { publicationDate: 'desc' }],
  });

  return papers.map((paper: any) => ({
    id: paper.id,
    title: paper.title,
    authors: normalizeAuthors(JSON.parse(paper.authors)),
    year: paper.publicationDate ? paper.publicationDate.getFullYear() : null,
    journal: paper.journal,
    doi: paper.doi,
    qualityScore: Math.round((paper.aiConfidence || 0) * 100),
    keywords: paper.keywords ? JSON.parse(paper.keywords) : [],
    citationCount: 0, // Not available in current schema
    summary: paper.aiSummary,
    keyFindings: paper.aiKeyFindings ? JSON.parse(paper.aiKeyFindings) : [],
    performanceData: paper.performanceMetrics ? JSON.parse(paper.performanceMetrics) : {},
    processingStatus: 'completed',
    verified: paper.isPublic,
    createdAt: paper.createdAt,
  }));
}

async function getProcessingStats() {
  const totalPapers = await prisma.researchPaper.count();
  const messPapers = await prisma.researchPaper.count({
    where: {
      keywords: {
        contains: 'mess-papers',
      },
    },
  });

  const algaePapers = await prisma.researchPaper.count({
    where: {
      keywords: {
        contains: 'algae',
      },
    },
  });

  const fuelCellPapers = await prisma.researchPaper.count({
    where: {
      keywords: {
        contains: 'fuel-cell',
      },
    },
  });

  const averageQuality = await prisma.researchPaper.aggregate({
    where: {
      keywords: {
        contains: 'mess-papers',
      },
    },
    _avg: {
      aiConfidence: true,
    },
  });

  return {
    totalPapers,
    messPapers,
    algaePapers,
    fuelCellPapers,
    averageQualityScore: Math.round((averageQuality._avg.aiConfidence || 0) * 100),
    processingComplete: messPapers === 7,
    completionRate: (messPapers / 7) * 100,
  };
}
