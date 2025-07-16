/**
 * Paper Service - Data Transformation Layer
 *
 * Handles transformation between Prisma Paper model and frontend ResearchPaper types.
 * Provides cross-environment compatibility for SQLite (dev) and PostgreSQL (prod).
 */

import type { Paper, Prisma } from '@prisma/client';
import type {
  ResearchPaper,
  Author,
  Journal,
  PerformanceMetrics,
  Citation,
} from '../app/research/types';
import { normalizeAuthors, formatAuthorsForDisplay } from '../lib/author-utils';

/**
 * Paper with related data for complete transformation
 */
type PaperWithRelations = Paper & {
  uploadedBy?: {
    id: string;
    name: string | null;
  } | null;
  tags?: Array<{
    id: string;
    name: string;
  }>;
  _count?: {
    citations: number;
    citedBy: number;
  };
};

/**
 * Transforms a database Paper model to frontend ResearchPaper interface
 */
export function transformDBPaperToResearchPaper(dbPaper: PaperWithRelations): ResearchPaper {
  // Handle authors field (JSON in SQLite, String[] in PostgreSQL)
  const authorsArray = normalizeAuthors(dbPaper.authors);

  // Transform authors to frontend Author interface
  const authors: Author[] = authorsArray.map((authorName) => ({
    name: authorName,
    affiliation: undefined, // Not stored in current schema
    isCorresponding: false, // Could be enhanced later
  }));

  // Parse JSON fields safely
  const keyFindings = safeParseJSON(dbPaper.keyFindings) || [];
  const performanceData = safeParseJSON(dbPaper.performanceData) || {};
  const methodology = safeParseJSON(dbPaper.methodology) || [];
  const materials = safeParseJSON(dbPaper.materials) || {};

  // Transform performance data to frontend format
  const performanceMetrics: PerformanceMetrics = {
    maxPowerDensity: performanceData.maxPowerDensity,
    currentDensity: performanceData.currentDensity,
    openCircuitVoltage: performanceData.openCircuitVoltage,
    coulombicEfficiency: performanceData.coulombicEfficiency,
    energyRecoveryEfficiency: performanceData.energyRecoveryEfficiency,
    treatmentEfficiency: performanceData.treatmentEfficiency,
    costPerKwh: performanceData.costPerKwh,
    lifespanDays: performanceData.lifespanDays,
  };

  // Create journal object (simplified from DB string)
  const journal: Journal = {
    name: dbPaper.journal || 'Unknown Journal',
    type: 'Energy', // Default type - could be enhanced with journal type mapping
    impactFactor: undefined, // Not stored in current schema
    issn: undefined,
    publisher: undefined,
  };

  // Create citation object
  const citation: Citation = {
    doi: dbPaper.doi || undefined,
    pmid: dbPaper.pmid || undefined,
    citationCount: dbPaper.citationCount,
    hIndex: undefined, // Not stored in current schema
  };

  // Calculate AI confidence score from quality score
  const aiConfidenceScore = dbPaper.qualityScore ? dbPaper.qualityScore / 10 : 0.8;

  // Determine research focus from tags or infer from content
  const researchFocus =
    dbPaper.tags?.map((tag) => tag.name) || inferResearchFocus(dbPaper.title, dbPaper.abstract);

  return {
    id: dbPaper.id,
    title: dbPaper.title,
    authors,
    journal,
    year: dbPaper.year,
    researchFocus: researchFocus as any[], // ResearchFocus type
    abstract: dbPaper.abstract,
    methodology: methodology,
    performanceMetrics,
    citation,
    keywords: extractKeywords(dbPaper.title, dbPaper.abstract, keyFindings),
    aiEnhanced: dbPaper.qualityScore !== null && dbPaper.qualityScore > 0,
    aiConfidenceScore,
    publishedDate: new Date(dbPaper.year, 0, 1), // Approximation if no exact date
    addedToDatabase: dbPaper.createdAt,
    qualityScore: dbPaper.qualityScore || 0,
    relatedPapers: [], // Could be enhanced with actual relations
    fullTextAvailable: Boolean(dbPaper.pdfUrl),
    externalLinks: {
      pdfUrl: dbPaper.pdfUrl || undefined,
      publisherUrl: dbPaper.url || undefined,
      pubmedUrl: dbPaper.pmid ? `https://pubmed.ncbi.nlm.nih.gov/${dbPaper.pmid}` : undefined,
    },
  };
}

/**
 * Transforms a frontend ResearchPaper to database Paper format
 */
export function transformResearchPaperToDB(researchPaper: ResearchPaper): Prisma.PaperCreateInput {
  // Transform authors to database format
  const authorsForDB = researchPaper.authors.map((author) => author.name);

  // Create performance data JSON
  const performanceData = {
    maxPowerDensity: researchPaper.performanceMetrics.maxPowerDensity,
    currentDensity: researchPaper.performanceMetrics.currentDensity,
    openCircuitVoltage: researchPaper.performanceMetrics.openCircuitVoltage,
    coulombicEfficiency: researchPaper.performanceMetrics.coulombicEfficiency,
    energyRecoveryEfficiency: researchPaper.performanceMetrics.energyRecoveryEfficiency,
    treatmentEfficiency: researchPaper.performanceMetrics.treatmentEfficiency,
    costPerKwh: researchPaper.performanceMetrics.costPerKwh,
    lifespanDays: researchPaper.performanceMetrics.lifespanDays,
  };

  return {
    id: researchPaper.id,
    title: researchPaper.title,
    abstract: researchPaper.abstract,
    authors: authorsForDB as any, // Prisma will handle JSON/Array conversion
    journal: researchPaper.journal.name,
    year: researchPaper.year,
    doi: researchPaper.citation.doi,
    pmid: researchPaper.citation.pmid,
    url: researchPaper.externalLinks?.publisherUrl,
    pdfUrl: researchPaper.externalLinks?.pdfUrl,
    summary: undefined, // Could be derived from abstract
    keyFindings: researchPaper.keywords, // Approximation
    performanceData: performanceData,
    methodology: researchPaper.methodology,
    materials: {}, // Could be extracted from text
    qualityScore: researchPaper.qualityScore,
    citationCount: researchPaper.citation.citationCount,
    verified: researchPaper.aiEnhanced,
    processingStatus: 'completed',
  };
}

/**
 * Safely parse JSON fields from database
 */
function safeParseJSON(jsonField: any): any {
  if (jsonField === null || jsonField === undefined) {
    return null;
  }

  if (typeof jsonField === 'string') {
    try {
      return JSON.parse(jsonField);
    } catch {
      return null;
    }
  }

  return jsonField;
}

/**
 * Infer research focus from title and abstract
 */
function inferResearchFocus(title: string, abstract: string): string[] {
  const content = `${title} ${abstract}`.toLowerCase();
  const focus: string[] = [];

  if (content.includes('microbial fuel cell') || content.includes('mfc')) {
    focus.push('MFC');
  }
  if (content.includes('microbial electrolysis') || content.includes('mec')) {
    focus.push('MEC');
  }
  if (content.includes('desalination') || content.includes('mdc')) {
    focus.push('MDC');
  }
  if (content.includes('proton exchange') || content.includes('pem')) {
    focus.push('PEM');
  }
  if (content.includes('solid oxide') || content.includes('sofc')) {
    focus.push('SOFC');
  }
  if (content.includes('phosphoric acid') || content.includes('pafc')) {
    focus.push('PAFC');
  }
  if (content.includes('electrode') || content.includes('anode') || content.includes('cathode')) {
    focus.push('Electrode Design');
  }
  if (content.includes('biofilm') || content.includes('microbial community')) {
    focus.push('Biofilm Engineering');
  }
  if (content.includes('optimization') || content.includes('performance')) {
    focus.push('Performance Optimization');
  }
  if (content.includes('material') || content.includes('graphene') || content.includes('carbon')) {
    focus.push('Materials Science');
  }
  if (content.includes('economic') || content.includes('cost') || content.includes('feasibility')) {
    focus.push('Economic Analysis');
  }

  return focus.length > 0 ? focus : ['Performance Optimization'];
}

/**
 * Extract keywords from title, abstract, and key findings
 */
function extractKeywords(title: string, abstract: string, keyFindings: string[]): string[] {
  const content = `${title} ${abstract} ${keyFindings.join(' ')}`.toLowerCase();

  const commonKeywords = [
    'microbial fuel cell',
    'mfc',
    'bioelectrochemical',
    'electrode',
    'biofilm',
    'power density',
    'current density',
    'efficiency',
    'performance',
    'optimization',
    'graphene',
    'carbon',
    'membrane',
    'electrolyte',
    'catalyst',
    'material',
    'wastewater',
    'treatment',
    'energy',
    'sustainability',
    'cost',
    'economic',
  ];

  return commonKeywords.filter((keyword) => content.includes(keyword));
}

/**
 * Enriches paper data with computed fields
 */
export function enrichPaperData(paper: ResearchPaper): ResearchPaper {
  return {
    ...paper,
    // Ensure AI confidence score is calculated consistently
    aiConfidenceScore: paper.qualityScore ? Math.min(paper.qualityScore / 10, 1) : 0.8,

    // Format authors for consistent display
    authors: paper.authors.map((author) => ({
      ...author,
      name: author.name.trim(),
    })),

    // Ensure keywords are unique and filtered
    keywords: [...new Set(paper.keywords)].filter((keyword) => keyword.length > 2),
  };
}

/**
 * Validates paper data integrity
 */
export function validatePaperData(paper: ResearchPaper): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!paper.id || paper.id.length === 0) {
    errors.push('Paper ID is required');
  }

  if (!paper.title || paper.title.length === 0) {
    errors.push('Paper title is required');
  }

  if (!paper.authors || paper.authors.length === 0) {
    errors.push('At least one author is required');
  }

  if (!paper.abstract || paper.abstract.length < 50) {
    errors.push('Abstract must be at least 50 characters');
  }

  if (!paper.year || paper.year < 1900 || paper.year > new Date().getFullYear() + 1) {
    errors.push('Publication year must be valid');
  }

  if (!paper.journal || !paper.journal.name) {
    errors.push('Journal information is required');
  }

  if (paper.qualityScore < 0 || paper.qualityScore > 10) {
    errors.push('Quality score must be between 0 and 10');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
