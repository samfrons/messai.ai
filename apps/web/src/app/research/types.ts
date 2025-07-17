/**
 * Research Paper Data Types
 *
 * Defines the TypeScript interfaces and types for research paper data structures
 * used in the MESSAI Research Intelligence System.
 */

/**
 * Research focus categories for paper classification
 */
export type ResearchFocus =
  | 'MFC' // Microbial Fuel Cells
  | 'MEC' // Microbial Electrolysis Cells
  | 'MDC' // Microbial Desalination Cells
  | 'PEM' // Proton Exchange Membrane
  | 'SOFC' // Solid Oxide Fuel Cells
  | 'PAFC' // Phosphoric Acid Fuel Cells
  | 'Electrode Design'
  | 'Biofilm Engineering'
  | 'Performance Optimization'
  | 'Materials Science'
  | 'Systems Integration'
  | 'Economic Analysis'
  | 'Environmental Impact';

/**
 * Journal types for categorization
 */
export type JournalType =
  | 'Energy'
  | 'Biotechnology'
  | 'Materials'
  | 'Environmental'
  | 'Engineering'
  | 'Biochemistry'
  | 'Sustainability'
  | 'Electrochemistry';

/**
 * Author information structure
 */
export interface Author {
  /** Author's full name */
  name: string;
  /** Author's institutional affiliation */
  affiliation?: string;
  /** Whether this author is the corresponding author */
  isCorresponding?: boolean;
  /** Author's ORCID identifier */
  orcid?: string;
}

/**
 * Performance metrics extracted from research papers
 */
export interface PerformanceMetrics {
  /** Maximum power density in mW/m² */
  maxPowerDensity?: number;
  /** Current density in mA/m² */
  currentDensity?: number;
  /** Open circuit voltage in V */
  openCircuitVoltage?: number;
  /** Coulombic efficiency as percentage */
  coulombicEfficiency?: number;
  /** Energy recovery efficiency as percentage */
  energyRecoveryEfficiency?: number;
  /** Treatment efficiency as percentage */
  treatmentEfficiency?: number;
  /** Cost per kWh in USD */
  costPerKwh?: number;
  /** Lifespan in days */
  lifespanDays?: number;
}

/**
 * Citation information
 */
export interface Citation {
  /** DOI (Digital Object Identifier) */
  doi?: string;
  /** PubMed ID */
  pmid?: string;
  /** Citation count from various sources */
  citationCount: number;
  /** H-index of the paper */
  hIndex?: number;
}

/**
 * Journal information
 */
export interface Journal {
  /** Journal name */
  name: string;
  /** Journal type category */
  type: JournalType;
  /** Impact factor */
  impactFactor?: number;
  /** Journal's ISSN */
  issn?: string;
  /** Publisher name */
  publisher?: string;
}

/**
 * Research paper structure representing papers in the MESSAI database
 */
export interface ResearchPaper {
  /** Unique identifier */
  id: string;

  /** Paper title */
  title: string;

  /** Authors list */
  authors: Author[];

  /** Journal information */
  journal: Journal;

  /** Publication year */
  year: number;

  /** Research focus categories */
  researchFocus: ResearchFocus[];

  /** Paper abstract */
  abstract: string;

  /** Key methodologies used */
  methodology?: string[];

  /** Performance metrics extracted by AI */
  performanceMetrics: PerformanceMetrics;

  /** Citation information */
  citation: Citation;

  /** Keywords for search optimization */
  keywords: string[];

  /** Whether this paper has been AI-enhanced */
  aiEnhanced: boolean;

  /** Confidence score of AI predictions (0-1) */
  aiConfidenceScore?: number;

  /** Publication date */
  publishedDate: Date;

  /** Date when paper was added to MESSAI database */
  addedToDatabase: Date;

  /** Paper quality score based on various factors */
  qualityScore: number;

  /** Related paper IDs for knowledge graph connections */
  relatedPapers?: string[];

  /** Full text availability */
  fullTextAvailable: boolean;

  /** External links */
  externalLinks?: {
    pdfUrl?: string;
    publisherUrl?: string;
    pubmedUrl?: string;
  };

  // In Silico Model Integration (optional fields)
  /** Whether this paper has an available 3D model */
  inSilicoAvailable?: boolean;

  /** Type of 3D model available */
  modelType?: string;

  /** Parameters for 3D modeling (JSON object) */
  modelParameters?: any;

  /** Performance targets for validation (JSON object) */
  performanceTargets?: any;

  /** System geometry specifications (JSON object) */
  systemGeometry?: any;

  /** Material specifications (JSON object) */
  materialSpecs?: any;

  /** Operating specifications (JSON object) */
  operatingSpecs?: any;

  /** Experimental methodology steps */
  methodology?: string[];

  /** Recreation difficulty rating */
  recreationDifficulty?: 'easy' | 'medium' | 'hard';

  /** Parameter completeness score (0-1) */
  parameterCompleteness?: number;

  /** Model validation status */
  validationStatus?: 'validated' | 'pending' | 'failed';

  /** Model prediction accuracy (0-1) */
  modelAccuracy?: number;
}

/**
 * Search filter options
 */
export interface SearchFilters {
  /** Year range filter */
  yearRange?: {
    start: number;
    end: number;
  };

  /** Journal types to include */
  journalTypes?: JournalType[];

  /** Research focus areas to include */
  researchFocus?: ResearchFocus[];

  /** Minimum citation count */
  minCitations?: number;

  /** Minimum AI confidence score */
  minConfidenceScore?: number;

  /** Minimum quality score */
  minQualityScore?: number;

  /** Only show papers with performance metrics */
  hasPerformanceMetrics?: boolean;

  /** Only show AI-enhanced papers */
  aiEnhancedOnly?: boolean;

  /** Only show papers with full text */
  fullTextOnly?: boolean;
}

/**
 * Search sort options
 */
export type SortOption =
  | 'relevance'
  | 'year-desc'
  | 'year-asc'
  | 'citations-desc'
  | 'citations-asc'
  | 'quality-desc'
  | 'quality-asc'
  | 'confidence-desc'
  | 'added-desc';

/**
 * Search results structure
 */
export interface SearchResults {
  /** Array of matching papers */
  papers: ResearchPaper[];

  /** Total number of results */
  totalCount: number;

  /** Current page number (0-indexed) */
  page: number;

  /** Number of results per page */
  pageSize: number;

  /** Total number of pages */
  totalPages: number;

  /** Search query that generated these results */
  query: string;

  /** Applied filters */
  filters: SearchFilters;

  /** Sort option used */
  sortBy: SortOption;

  /** Search execution time in milliseconds */
  searchTime: number;

  /** Suggested search terms for query refinement */
  suggestions?: string[];
}

/**
 * Search state for managing the research page
 */
export interface SearchState {
  /** Current search query */
  query: string;

  /** Applied filters */
  filters: SearchFilters;

  /** Current sort option */
  sortBy: SortOption;

  /** Current page */
  page: number;

  /** Results per page */
  pageSize: number;

  /** Loading state */
  isLoading: boolean;

  /** Current search results */
  results?: SearchResults;

  /** Search error if any */
  error?: string;

  /** Selected paper for detail view */
  selectedPaper?: ResearchPaper;

  /** Search history */
  searchHistory: string[];

  /** Saved searches */
  savedSearches: Array<{
    id: string;
    name: string;
    query: string;
    filters: SearchFilters;
    createdAt: Date;
  }>;
}

/**
 * Paper export format options
 */
export type ExportFormat = 'csv' | 'json' | 'bibtex' | 'ris' | 'excel';

/**
 * Export configuration
 */
export interface ExportConfig {
  /** Format to export to */
  format: ExportFormat;

  /** Papers to export */
  papers: ResearchPaper[];

  /** Fields to include in export */
  fields?: Array<keyof ResearchPaper>;

  /** Whether to include performance metrics */
  includeMetrics?: boolean;

  /** Whether to include abstracts */
  includeAbstracts?: boolean;

  /** Custom filename */
  filename?: string;
}
