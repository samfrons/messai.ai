/**
 * Database Schema Types - Aligned with Prisma Schema
 *
 * These types match the actual database schema and can be used for
 * type-safe database operations and API transformations.
 */

import { ResearchPaper as PrismaResearchPaper } from '@prisma/client';

/**
 * Research Paper from database - includes all JSON fields as strings
 */
export type DatabaseResearchPaper = PrismaResearchPaper;

/**
 * Parsed research paper with JSON fields converted to objects
 */
export interface ParsedResearchPaper {
  id: string;
  title: string;
  authors: string[]; // Parsed from JSON
  abstract: string | null;
  doi: string | null;
  pubmedId: string | null;
  arxivId: string | null;
  ieeeId: string | null;
  publicationDate: Date | null;
  journal: string | null;
  volume: string | null;
  issue: string | null;
  pages: string | null;
  keywords: string[]; // Parsed from JSON
  externalUrl: string;

  // MES-specific fields
  organismTypes: string[] | null; // Parsed from JSON
  anodeMaterials: string[] | null; // Parsed from JSON
  cathodeMaterials: string[] | null; // Parsed from JSON
  powerOutput: number | null;
  efficiency: number | null;
  systemType: string | null;

  // Metadata
  source: string;
  uploadedBy: string | null;
  isPublic: boolean;

  // AI-generated fields
  aiSummary: string | null;
  aiKeyFindings: any | null; // Parsed from JSON
  aiMethodology: string | null;
  aiImplications: string | null;
  aiDataExtraction: any | null; // Parsed from JSON
  aiInsights: string | null;
  aiProcessingDate: Date | null;
  aiModelVersion: string | null;
  aiConfidence: number | null;

  // Parameter extraction fields (all JSON parsed)
  experimentalConditions: any | null;
  reactorConfiguration: any | null;
  electrodeSpecifications: any | null;
  biologicalParameters: any | null;
  performanceMetrics: any | null;
  operationalParameters: any | null;
  electrochemicalData: any | null;
  timeSeriesData: any | null;
  economicMetrics: any | null;

  // Enhanced categorization fields
  microbialCommunity: any | null;
  microbialClassification: any | null;
  systemConfiguration: any | null;
  performanceBenchmarks: any | null;

  // In Silico Model Integration
  inSilicoAvailable: boolean | null;
  modelType: string | null;
  modelParameters: any | null;
  performanceTargets: any | null;
  systemGeometry: any | null;
  materialSpecs: any | null;
  operatingSpecs: any | null;
  methodology: any | null;
  recreationDifficulty: string | null;
  parameterCompleteness: number | null;
  validationStatus: string | null;
  modelAccuracy: number | null;
  lastValidated: Date | null;

  createdAt: Date;
  updatedAt: Date;
}

/**
 * API Response format for research papers
 */
export interface ApiResearchPaper {
  id: string;
  title: string;
  authors: Array<{
    name: string;
    affiliation?: string;
    isCorresponding?: boolean;
    orcid?: string;
  }>;
  journal: {
    name: string;
    type?: string;
    impactFactor?: number;
    issn?: string;
    publisher?: string;
  };
  year: number; // Extracted from publicationDate
  researchFocus: string[];
  abstract: string; // Cleaned of JATS XML
  performanceMetrics: {
    maxPowerDensity?: number;
    currentDensity?: number;
    openCircuitVoltage?: number;
    coulombicEfficiency?: number;
    energyRecoveryEfficiency?: number;
    treatmentEfficiency?: number;
    costPerKwh?: number;
    lifespanDays?: number;
  };
  citation: {
    doi?: string;
    pmid?: string;
    citationCount: number; // Mapped from powerOutput
    hIndex?: number;
  };
  keywords: string[];
  aiEnhanced: boolean;
  aiConfidenceScore?: number; // Converted from 0-1 to 0-100
  publishedDate: Date;
  addedToDatabase: Date;
  qualityScore: number; // Converted from aiConfidence
  relatedPapers?: string[];
  fullTextAvailable: boolean; // Derived from externalUrl
  externalLinks?: {
    pdfUrl?: string;
    publisherUrl?: string;
    pubmedUrl?: string;
  };
  // In Silico fields
  inSilicoAvailable?: boolean;
  modelType?: string;
  modelParameters?: any;
  performanceTargets?: any;
  systemGeometry?: any;
  materialSpecs?: any;
  operatingSpecs?: any;
  methodology?: string[];
  recreationDifficulty?: 'easy' | 'medium' | 'hard';
  parameterCompleteness?: number;
  validationStatus?: 'validated' | 'pending' | 'failed';
  modelAccuracy?: number;
}

/**
 * Transform database research paper to API format
 */
export function transformDatabaseToApi(dbPaper: DatabaseResearchPaper): ApiResearchPaper {
  // Parse JSON fields safely
  const parseJsonField = (field: string | null): any => {
    if (!field) return null;
    try {
      return JSON.parse(field);
    } catch {
      return null;
    }
  };

  const parseAuthors = (authorsStr: string): Array<{ name: string; affiliation?: string }> => {
    const parsed = parseJsonField(authorsStr);
    if (Array.isArray(parsed)) {
      return parsed.map((author) =>
        typeof author === 'string'
          ? { name: author }
          : { name: author.name || '', affiliation: author.affiliation }
      );
    }
    if (typeof authorsStr === 'string') {
      return [{ name: authorsStr }];
    }
    return [];
  };

  const cleanAbstract = (text: string | null): string => {
    if (!text) return '';
    return text
      .replace(/<jats:[^>]*>/g, '') // Remove opening JATS tags
      .replace(/<\/jats:[^>]*>/g, '') // Remove closing JATS tags
      .replace(/<[^>]*>/g, '') // Remove any remaining HTML/XML tags
      .trim();
  };

  const extractYear = (date: Date | null): number => {
    return date ? date.getFullYear() : new Date().getFullYear();
  };

  const keywords = parseJsonField(dbPaper.keywords) || [];
  const authors = parseAuthors(dbPaper.authors);

  return {
    id: dbPaper.id,
    title: dbPaper.title,
    authors,
    journal: {
      name: dbPaper.journal || 'Unknown Journal',
      type: undefined, // Could be derived from journal name
    },
    year: extractYear(dbPaper.publicationDate),
    researchFocus: [dbPaper.systemType].filter(Boolean) as string[],
    abstract: cleanAbstract(dbPaper.abstract),
    performanceMetrics: {
      maxPowerDensity: dbPaper.powerOutput || undefined,
      coulombicEfficiency: dbPaper.efficiency || undefined,
    },
    citation: {
      doi: dbPaper.doi || undefined,
      pmid: dbPaper.pubmedId || undefined,
      citationCount: dbPaper.powerOutput || 0, // Using powerOutput as proxy
    },
    keywords,
    aiEnhanced: !!dbPaper.aiProcessingDate,
    aiConfidenceScore: dbPaper.aiConfidence ? Math.round(dbPaper.aiConfidence * 100) : undefined,
    publishedDate: dbPaper.publicationDate || dbPaper.createdAt,
    addedToDatabase: dbPaper.createdAt,
    qualityScore: dbPaper.aiConfidence ? Math.round(dbPaper.aiConfidence * 100) : 50,
    fullTextAvailable: !!dbPaper.externalUrl,
    externalLinks: {
      pdfUrl: dbPaper.externalUrl,
      publisherUrl: dbPaper.externalUrl,
      pubmedUrl: dbPaper.pubmedId
        ? `https://pubmed.ncbi.nlm.nih.gov/${dbPaper.pubmedId}`
        : undefined,
    },
    // In Silico fields
    inSilicoAvailable: dbPaper.inSilicoAvailable || undefined,
    modelType: dbPaper.modelType || undefined,
    modelParameters: parseJsonField(dbPaper.modelParameters),
    performanceTargets: parseJsonField(dbPaper.performanceTargets),
    systemGeometry: parseJsonField(dbPaper.systemGeometry),
    materialSpecs: parseJsonField(dbPaper.materialSpecs),
    operatingSpecs: parseJsonField(dbPaper.operatingSpecs),
    methodology: parseJsonField(dbPaper.methodology) || undefined,
    recreationDifficulty: (dbPaper.recreationDifficulty as 'easy' | 'medium' | 'hard') || undefined,
    parameterCompleteness: dbPaper.parameterCompleteness || undefined,
    validationStatus: (dbPaper.validationStatus as 'validated' | 'pending' | 'failed') || undefined,
    modelAccuracy: dbPaper.modelAccuracy || undefined,
  };
}

/**
 * Search result types
 */
export interface DatabaseSearchResults {
  papers: DatabaseResearchPaper[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  searchTime: number;
}

export interface ApiSearchResults {
  papers: ApiResearchPaper[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  query: string;
  searchTime: number;
  suggestions?: string[];
  stats?: {
    totalResults: number;
    systemTypes: Record<string, number>;
    yearRange: { min: number; max: number };
  };
}

/**
 * Transform database search results to API format
 */
export function transformSearchResults(
  dbResults: DatabaseSearchResults,
  query: string,
  suggestions?: string[]
): ApiSearchResults {
  return {
    papers: dbResults.papers.map(transformDatabaseToApi),
    totalCount: dbResults.totalCount,
    page: dbResults.page,
    pageSize: dbResults.pageSize,
    totalPages: dbResults.totalPages,
    query,
    searchTime: dbResults.searchTime,
    suggestions,
    stats: {
      totalResults: dbResults.totalCount,
      systemTypes: {}, // Could be calculated from papers
      yearRange: { min: 2000, max: new Date().getFullYear() }, // Could be calculated
    },
  };
}
