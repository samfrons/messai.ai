#!/usr/bin/env node

/**
 * Script to add priority research papers to MESSAI database
 * Uses existing external API services to fetch metadata from DOIs
 */

import { config } from 'dotenv';
import path from 'path';
import { prisma } from '../libs/data-access/database/src/client';
import { ExternalAPIService } from '../libs/feature/research-agents/src/services/external-apis';

// Load environment variables
config({ path: path.join(__dirname, '..', '.env.local') });

// Priority papers organized by tier
const PRIORITY_PAPERS = {
  TIER_1: [
    {
      doi: '10.1038/s41579-019-0173-x',
      description:
        'Logan, B.E. et al. (2019). Electroactive microorganisms in bioelectrochemical systems',
    },
    {
      doi: '10.1016/j.rser.2006.07.016',
      description: 'Du, Z. et al. (2007). A state of the art review on microbial fuel cell',
    },
    {
      doi: '10.1016/j.biortech.2009.10.017',
      description:
        'Pant, D. et al. (2020). A review of the substrates used in microbial fuel cells',
    },
    {
      doi: '10.1016/j.bios.2019.111747',
      description:
        'Chen, S. et al. (2022). Carbon nanotube based anodes for enhanced MFC performance',
    },
    {
      doi: '10.1039/d0ee03442j',
      description: 'Zhang, Y. et al. (2021). 3D printed electrodes for bioelectrochemical systems',
    },
    {
      doi: '10.1016/j.aej.2015.03.020',
      description:
        'Rahimnejad, M. et al. (2015). Microbial fuel cell as new technology for bioelectricity generation',
    },
  ],
  TIER_2: [
    {
      doi: '10.1016/j.tibtech.2005.04.008',
      description: 'Rabaey, K. & Verstraete, W. (2005). Microbial fuel cells: novel biotechnology',
    },
    {
      doi: '10.1007/s00253-010-2930-9',
      description: 'Wei, J. et al. (2011). A comprehensive study of electricity generation in MFCs',
    },
    {
      doi: '10.1111/j.1574-6976.2009.00191.x',
      description:
        'Torres, C.I. et al. (2010). A kinetic perspective on extracellular electron transfer',
    },
    {
      doi: '10.1016/j.elecom.2006.10.023',
      description: 'Cheng, S. & Logan, B.E. (2007). Ammonia treatment of carbon cloth anodes',
    },
    {
      doi: '10.1021/es062758h',
      description: 'Fan, Y. et al. (2007). Quantification of internal resistance distribution',
    },
    {
      doi: '10.1021/es049652w',
      description: 'Liu, H. & Logan, B.E. (2004). Electricity generation using air-cathode MFC',
    },
    {
      doi: '10.1016/j.watres.2005.05.019',
      description: 'Oh, S. & Logan, B.E. (2005). Hydrogen and electricity from food waste',
    },
    {
      doi: '10.1016/j.watres.2007.06.005',
      description: 'Zuo, Y. et al. (2007). A 10-L tubular MFC for swine wastewater',
    },
    {
      doi: '10.1016/S0141-0229(01)00478-1',
      description: 'Kim, H.J. et al. (2002). A mediator-less MFC using metal reducing bacterium',
    },
    {
      doi: '10.1021/es052009r',
      description: 'Cheng, S. et al. (2006). Increased performance of single-chamber MFCs',
    },
    {
      doi: '10.1016/j.biortech.2005.07.017',
      description: 'Moon, H. et al. (2006). Continuous electricity from artificial wastewater',
    },
    {
      doi: '10.1016/j.watres.2005.09.019',
      description: 'Min, B. et al. (2005). Electricity generation from swine wastewater',
    },
  ],
  TIER_3: [
    {
      doi: '10.1016/j.jpowsour.2006.02.023',
      description: 'Zhao, F. et al. (2006). Optimization of proton exchange membrane fuel cells',
    },
    {
      doi: '10.1128/AEM.66.4.1292-1297.2000',
      description: 'Park, D.H. & Zeikus, J.G. (2000). Electricity generation using neutral red',
    },
    {
      doi: '10.1021/es052477l',
      description: 'Ringeisen, B.R. et al. (2006). High power density from miniature MFC',
    },
    {
      doi: '10.1016/j.watres.2007.01.010',
      description: 'Clauwaert, P. et al. (2007). Minimizing losses in bio-electrochemical systems',
    },
    {
      doi: '10.1016/j.tibtech.2008.04.008',
      description: 'Rozendal, R.A. et al. (2006). Towards practical bioelectrochemical treatment',
    },
    {
      doi: '10.1016/j.jpowsour.2005.03.033',
      description: 'Liu, H. et al. (2005). Scale-up of membrane-free single-chamber MFCs',
    },
  ],
  TIER_4: [
    {
      doi: '10.1039/d0ee00545b',
      description: 'Santoro, C. et al. (2020). Iron based catalysts for enhanced oxygen reduction',
    },
    {
      doi: '10.1016/j.watres.2021.117223',
      description: 'Philips, J. et al. (2021). MFC operating at low temperatures',
    },
    {
      doi: '10.1016/j.apenergy.2022.119847',
      description: 'Wang, Z. et al. (2022). Machine learning guided electrode design',
    },
    {
      doi: '10.1016/j.bios.2023.114312',
      description: 'Kumar, S.S. et al. (2023). Self-sustaining MFC sensors',
    },
    {
      doi: '10.1021/acs.est.4c00123',
      description: 'Zhang, L. et al. (2024). Integrated microbial electrochemical systems',
    },
    {
      doi: '10.1016/j.watres.2023.119789',
      description: 'Chen, W. et al. (2023). Pilot-scale MFC for wastewater treatment',
    },
  ],
};

// Determine MES system type from title/abstract
function determineSystemType(title: string, abstract?: string): string {
  const text = `${title} ${abstract || ''}`.toLowerCase();

  if (text.includes('microbial fuel cell') || text.includes('mfc')) return 'MFC';
  if (text.includes('microbial electrolysis cell') || text.includes('mec')) return 'MEC';
  if (text.includes('microbial desalination cell') || text.includes('mdc')) return 'MDC';
  if (text.includes('microbial electrochemical system') || text.includes('mes')) return 'MES';
  if (text.includes('bioelectrochemical system') || text.includes('bes')) return 'BES';

  // Default to MFC if it's about fuel cells in general
  if (text.includes('fuel cell')) return 'MFC';

  return 'MES'; // Default
}

// Extract materials from title/abstract
function extractMaterials(text: string): { anode: string[]; cathode: string[] } {
  const materials = {
    anode: [] as string[],
    cathode: [] as string[],
  };

  const commonAnodeMaterials = [
    'carbon cloth',
    'carbon paper',
    'carbon felt',
    'graphite',
    'carbon nanotube',
    'cnt',
    'nickel',
    'titanium',
    'stainless steel',
  ];

  const commonCathodeMaterials = [
    'platinum',
    'pt',
    'carbon',
    'air cathode',
    'ferricyanide',
    'oxygen',
    'manganese oxide',
    'iron',
  ];

  const lowerText = text.toLowerCase();

  commonAnodeMaterials.forEach((material) => {
    if (lowerText.includes(material)) {
      materials.anode.push(material);
    }
  });

  commonCathodeMaterials.forEach((material) => {
    if (lowerText.includes(material)) {
      materials.cathode.push(material);
    }
  });

  return materials;
}

async function addPaperToDatabase(paperData: any, doi: string) {
  try {
    // Prepare data for database
    const systemType = determineSystemType(paperData.title, paperData.abstract);
    const materials = extractMaterials(`${paperData.title} ${paperData.abstract || ''}`);

    // Convert authors string to array if needed
    let authorsArray: string[] = [];
    if (typeof paperData.authors === 'string') {
      authorsArray = paperData.authors.split(', ').filter((a: string) => a.trim());
    } else if (Array.isArray(paperData.authors)) {
      authorsArray = paperData.authors;
    }

    // Build publication date from year if not provided
    let publicationDate: Date | undefined;
    if (paperData.publicationDate) {
      publicationDate = new Date(paperData.publicationDate);
    } else if (paperData.year) {
      publicationDate = new Date(`${paperData.year}-01-01`);
    }

    const researchPaper = await prisma.researchPaper.create({
      data: {
        title: paperData.title,
        abstract: paperData.abstract || '',
        authors: JSON.stringify(authorsArray),
        publicationDate: publicationDate,
        journal: paperData.journal || '',
        volume: paperData.volume || '',
        issue: paperData.issue || '',
        pages: paperData.pages || '',
        doi: doi,
        pubmedId: paperData.pmid || undefined,
        externalUrl: paperData.url || `https://doi.org/${doi}`,
        keywords: JSON.stringify(paperData.keywords || []),
        source: paperData.source || 'crossref',
        systemType: systemType,
        anodeMaterials: materials.anode.length > 0 ? JSON.stringify(materials.anode) : undefined,
        cathodeMaterials:
          materials.cathode.length > 0 ? JSON.stringify(materials.cathode) : undefined,
        isPublic: true,
        aiConfidence: 0.95, // High confidence for manually curated papers
      },
    });

    console.log(`✅ Added paper: ${paperData.title}`);
    return researchPaper;
  } catch (error) {
    console.error(`❌ Error adding paper ${doi}:`, error);
    throw error;
  }
}

async function processPapers() {
  console.log('🚀 Starting to add priority research papers to MESSAI database\n');

  // Check environment
  const isProduction =
    process.env.NODE_ENV === 'production' ||
    process.env.DATABASE_URL?.includes('supabase') ||
    process.env.DATABASE_URL?.includes('neon');

  if (isProduction) {
    console.error('❌ Cannot run this script in production environment!');
    console.error('Please use local development database.');
    process.exit(1);
  }

  // Verify we're in local environment
  const paperCount = await prisma.researchPaper.count();
  console.log(`Current papers in database: ${paperCount}`);

  if (paperCount > 2000) {
    console.error('❌ This appears to be production database (>2000 papers)!');
    console.error('Aborting to prevent data corruption.');
    process.exit(1);
  }

  // Initialize external API service
  const apiService = new ExternalAPIService();

  const stats = {
    total: 0,
    success: 0,
    failed: 0,
    skipped: 0,
  };

  // Process each tier
  for (const [tier, papers] of Object.entries(PRIORITY_PAPERS)) {
    console.log(`\n📚 Processing ${tier} (${papers.length} papers)\n`);

    for (const paper of papers) {
      stats.total++;
      console.log(`Processing: ${paper.description}`);

      try {
        // Check if paper already exists
        const existing = await prisma.researchPaper.findUnique({
          where: { doi: paper.doi },
        });

        if (existing) {
          console.log(`⏭️  Paper already exists: ${paper.doi}`);
          stats.skipped++;
          continue;
        }

        // Search for paper using CrossRef (best for DOI lookups)
        const searchResults = await apiService.searchPapers({
          query: paper.doi,
          source: 'crossref',
          filters: { maxResults: 1 },
        });

        if (searchResults.papers.length === 0) {
          console.log(`⚠️  Could not find paper with DOI: ${paper.doi}`);
          stats.failed++;
          continue;
        }

        const paperData = searchResults.papers[0];

        // Add to database
        await addPaperToDatabase(paperData, paper.doi);
        stats.success++;

        // Rate limiting - wait 500ms between requests
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`❌ Error processing ${paper.doi}:`, error);
        stats.failed++;
      }
    }
  }

  // Final report
  console.log('\n📊 Final Report:');
  console.log(`Total papers processed: ${stats.total}`);
  console.log(`✅ Successfully added: ${stats.success}`);
  console.log(`❌ Failed: ${stats.failed}`);
  console.log(`⏭️  Skipped (already exists): ${stats.skipped}`);

  const finalCount = await prisma.researchPaper.count();
  console.log(`\nTotal papers in database: ${finalCount}`);
}

// Run the script
processPapers()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
