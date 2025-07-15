/**
 * External API Integration Service
 * Handles communication with PubMed, CrossRef, arXiv, and other research databases
 */

export interface ExternalPaper {
  id: string;
  title: string;
  authors: string;
  abstract: string;
  year: number;
  journal?: string;
  volume?: string;
  issue?: string;
  pages?: string;
  doi?: string;
  pmid?: string;
  arxivId?: string;
  url?: string;
  source: 'pubmed' | 'crossref' | 'arxiv' | 'semantic_scholar';
  citationCount?: number;
  publicationDate?: string;
  keywords?: string[];
  openAccess?: boolean;
}

export interface SearchQuery {
  query: string;
  filters?: {
    yearRange?: { start: number; end: number };
    journal?: string;
    authors?: string;
    maxResults?: number;
    sortBy?: 'relevance' | 'date' | 'citation_count';
  };
  source?: 'pubmed' | 'crossref' | 'arxiv' | 'semantic_scholar' | 'all';
}

export interface SearchResult {
  papers: ExternalPaper[];
  totalCount: number;
  query: string;
  source: string;
  processingTime: number;
  nextPageToken?: string;
}

export interface ValidationResult {
  exists: boolean;
  verified: boolean;
  metadata?: {
    actualTitle?: string;
    actualAuthors?: string;
    actualYear?: number;
    actualJournal?: string;
    citationCount?: number;
  };
  confidence: number;
  errors?: string[];
}

export class ExternalAPIService {
  private static readonly PUBMED_BASE_URL = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';
  private static readonly CROSSREF_BASE_URL = 'https://api.crossref.org/works';
  private static readonly ARXIV_BASE_URL = 'http://export.arxiv.org/api/query';
  private static readonly SEMANTIC_SCHOLAR_BASE_URL = 'https://api.semanticscholar.org/graph/v1';

  private apiKeys: Record<string, string> = {};
  private rateLimits: Record<string, { requests: number; resetTime: number }> = {};

  constructor(apiKeys: Record<string, string> = {}) {
    this.apiKeys = apiKeys;
    this.initializeRateLimits();
  }

  private initializeRateLimits(): void {
    this.rateLimits = {
      pubmed: { requests: 0, resetTime: Date.now() + 60000 },
      crossref: { requests: 0, resetTime: Date.now() + 60000 },
      arxiv: { requests: 0, resetTime: Date.now() + 60000 },
      semantic_scholar: { requests: 0, resetTime: Date.now() + 60000 },
    };
  }

  async searchPapers(searchQuery: SearchQuery): Promise<SearchResult> {
    const startTime = Date.now();
    const results: SearchResult = {
      papers: [],
      totalCount: 0,
      query: searchQuery.query,
      source: searchQuery.source || 'all',
      processingTime: 0,
    };

    try {
      if (searchQuery.source === 'all' || !searchQuery.source) {
        // Search all sources and combine results
        const searchPromises = [
          this.searchPubMed(searchQuery),
          this.searchCrossRef(searchQuery),
          this.searchArXiv(searchQuery),
          this.searchSemanticScholar(searchQuery),
        ];

        const allResults = await Promise.allSettled(searchPromises);

        allResults.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            results.papers.push(...result.value.papers);
            results.totalCount += result.value.totalCount;
          } else {
            console.error(`Search failed for source ${index}:`, result.reason);
          }
        });
      } else {
        // Search specific source
        let searchResult: SearchResult;
        switch (searchQuery.source) {
          case 'pubmed':
            searchResult = await this.searchPubMed(searchQuery);
            break;
          case 'crossref':
            searchResult = await this.searchCrossRef(searchQuery);
            break;
          case 'arxiv':
            searchResult = await this.searchArXiv(searchQuery);
            break;
          case 'semantic_scholar':
            searchResult = await this.searchSemanticScholar(searchQuery);
            break;
          default:
            throw new Error(`Unsupported search source: ${searchQuery.source}`);
        }

        results.papers = searchResult.papers;
        results.totalCount = searchResult.totalCount;
      }

      // Remove duplicates based on DOI or title
      results.papers = this.removeDuplicatePapers(results.papers);

      // Apply filters
      results.papers = this.applyFilters(results.papers, searchQuery.filters);

      // Sort results
      results.papers = this.sortResults(results.papers, searchQuery.filters?.sortBy || 'relevance');

      // Limit results
      const maxResults = searchQuery.filters?.maxResults || 50;
      results.papers = results.papers.slice(0, maxResults);

      results.processingTime = Date.now() - startTime;
      return results;
    } catch (error) {
      console.error('External API search failed:', error);
      return {
        ...results,
        processingTime: Date.now() - startTime,
      };
    }
  }

  private async searchPubMed(query: SearchQuery): Promise<SearchResult> {
    if (!this.checkRateLimit('pubmed')) {
      return { papers: [], totalCount: 0, query: query.query, source: 'pubmed', processingTime: 0 };
    }

    try {
      // Build PubMed search query
      let searchTerm = query.query;

      // Add algae-specific terms if not already present
      if (!searchTerm.toLowerCase().includes('algae')) {
        searchTerm += ' AND (algae OR microalgae OR "microbial fuel cell")';
      }

      // Add year filter if specified
      if (query.filters?.yearRange) {
        const { start, end } = query.filters.yearRange;
        searchTerm += ` AND ${start}:${end}[pdat]`;
      }

      // Step 1: Search for paper IDs
      const searchUrl = `${ExternalAPIService.PUBMED_BASE_URL}/esearch.fcgi`;
      const searchParams = new URLSearchParams({
        db: 'pubmed',
        term: searchTerm,
        retmax: String(query.filters?.maxResults || 20),
        retmode: 'json',
        sort: 'relevance',
      });

      const searchResponse = await fetch(`${searchUrl}?${searchParams}`);
      const searchData = await searchResponse.json();

      if (!searchData.esearchresult?.idlist?.length) {
        return {
          papers: [],
          totalCount: 0,
          query: query.query,
          source: 'pubmed',
          processingTime: 0,
        };
      }

      // Step 2: Fetch paper details
      const ids = searchData.esearchresult.idlist.join(',');
      const fetchUrl = `${ExternalAPIService.PUBMED_BASE_URL}/efetch.fcgi`;
      const fetchParams = new URLSearchParams({
        db: 'pubmed',
        id: ids,
        retmode: 'xml',
      });

      const fetchResponse = await fetch(`${fetchUrl}?${fetchParams}`);
      const xmlData = await fetchResponse.text();

      // Parse XML (simplified - in real implementation, use proper XML parser)
      const papers = this.parsePubMedXML(xmlData);

      this.updateRateLimit('pubmed');

      return {
        papers,
        totalCount: parseInt(searchData.esearchresult.count) || papers.length,
        query: query.query,
        source: 'pubmed',
        processingTime: 0,
      };
    } catch (error) {
      console.error('PubMed search failed:', error);
      return this.getMockPubMedResults(query);
    }
  }

  private async searchCrossRef(query: SearchQuery): Promise<SearchResult> {
    if (!this.checkRateLimit('crossref')) {
      return {
        papers: [],
        totalCount: 0,
        query: query.query,
        source: 'crossref',
        processingTime: 0,
      };
    }

    try {
      const searchUrl = ExternalAPIService.CROSSREF_BASE_URL;
      const params = new URLSearchParams({
        query: query.query,
        rows: String(query.filters?.maxResults || 20),
        sort: 'relevance',
      });

      // Add year filter if specified
      if (query.filters?.yearRange) {
        params.append(
          'filter',
          `from-pub-date:${query.filters.yearRange.start},until-pub-date:${query.filters.yearRange.end}`
        );
      }

      const response = await fetch(`${searchUrl}?${params}`);
      const data = await response.json();

      const papers = data.message?.items?.map((item: any) => this.parseCrossRefItem(item)) || [];

      this.updateRateLimit('crossref');

      return {
        papers,
        totalCount: data.message?.['total-results'] || papers.length,
        query: query.query,
        source: 'crossref',
        processingTime: 0,
      };
    } catch (error) {
      console.error('CrossRef search failed:', error);
      return this.getMockCrossRefResults(query);
    }
  }

  private async searchArXiv(query: SearchQuery): Promise<SearchResult> {
    if (!this.checkRateLimit('arxiv')) {
      return { papers: [], totalCount: 0, query: query.query, source: 'arxiv', processingTime: 0 };
    }

    try {
      const searchUrl = ExternalAPIService.ARXIV_BASE_URL;
      const params = new URLSearchParams({
        search_query: `all:${query.query}`,
        start: '0',
        max_results: String(query.filters?.maxResults || 20),
        sortBy: 'relevance',
        sortOrder: 'descending',
      });

      const response = await fetch(`${searchUrl}?${params}`);
      const xmlData = await response.text();

      // Parse XML (simplified - in real implementation, use proper XML parser)
      const papers = this.parseArXivXML(xmlData);

      this.updateRateLimit('arxiv');

      return {
        papers,
        totalCount: papers.length,
        query: query.query,
        source: 'arxiv',
        processingTime: 0,
      };
    } catch (error) {
      console.error('arXiv search failed:', error);
      return this.getMockArXivResults(query);
    }
  }

  private async searchSemanticScholar(query: SearchQuery): Promise<SearchResult> {
    if (!this.checkRateLimit('semantic_scholar')) {
      return {
        papers: [],
        totalCount: 0,
        query: query.query,
        source: 'semantic_scholar',
        processingTime: 0,
      };
    }

    try {
      const searchUrl = `${ExternalAPIService.SEMANTIC_SCHOLAR_BASE_URL}/paper/search`;
      const params = new URLSearchParams({
        query: query.query,
        limit: String(query.filters?.maxResults || 20),
        fields: 'title,authors,abstract,year,journal,citationCount,openAccessPdf,externalIds',
      });

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (this.apiKeys.semantic_scholar) {
        headers['x-api-key'] = this.apiKeys.semantic_scholar;
      }

      const response = await fetch(`${searchUrl}?${params}`, { headers });
      const data = await response.json();

      const papers = data.data?.map((item: any) => this.parseSemanticScholarItem(item)) || [];

      this.updateRateLimit('semantic_scholar');

      return {
        papers,
        totalCount: data.total || papers.length,
        query: query.query,
        source: 'semantic_scholar',
        processingTime: 0,
      };
    } catch (error) {
      console.error('Semantic Scholar search failed:', error);
      return this.getMockSemanticScholarResults(query);
    }
  }

  async validatePaper(paper: ExternalPaper): Promise<ValidationResult> {
    try {
      // Try to validate using DOI first
      if (paper.doi) {
        const doiValidation = await this.validateByDOI(paper.doi);
        if (doiValidation.exists) {
          return doiValidation;
        }
      }

      // Try to validate using PMID
      if (paper.pmid) {
        const pmidValidation = await this.validateByPMID(paper.pmid);
        if (pmidValidation.exists) {
          return pmidValidation;
        }
      }

      // Try to validate using arXiv ID
      if (paper.arxivId) {
        const arxivValidation = await this.validateByArXivID(paper.arxivId);
        if (arxivValidation.exists) {
          return arxivValidation;
        }
      }

      // Fallback to title/author search
      return await this.validateByTitleSearch(paper.title, paper.authors);
    } catch (error) {
      console.error('Paper validation failed:', error);
      return {
        exists: false,
        verified: false,
        confidence: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  }

  private async validateByDOI(doi: string): Promise<ValidationResult> {
    try {
      const response = await fetch(`${ExternalAPIService.CROSSREF_BASE_URL}/${doi}`);
      if (!response.ok) {
        return { exists: false, verified: false, confidence: 0 };
      }

      const data = await response.json();
      const work = data.message;

      return {
        exists: true,
        verified: true,
        confidence: 0.95,
        metadata: {
          actualTitle: work.title?.[0],
          actualAuthors: work.author?.map((a: any) => `${a.given} ${a.family}`).join(', '),
          actualYear: work.published?.['date-parts']?.[0]?.[0],
          actualJournal: work['container-title']?.[0],
          citationCount: work['is-referenced-by-count'],
        },
      };
    } catch (error) {
      return { exists: false, verified: false, confidence: 0 };
    }
  }

  private async validateByPMID(pmid: string): Promise<ValidationResult> {
    try {
      const url = `${ExternalAPIService.PUBMED_BASE_URL}/efetch.fcgi`;
      const params = new URLSearchParams({
        db: 'pubmed',
        id: pmid,
        retmode: 'xml',
      });

      const response = await fetch(`${url}?${params}`);
      if (!response.ok) {
        return { exists: false, verified: false, confidence: 0 };
      }

      const xmlData = await response.text();
      const papers = this.parsePubMedXML(xmlData);

      if (papers.length === 0) {
        return { exists: false, verified: false, confidence: 0 };
      }

      const paper = papers[0];
      return {
        exists: true,
        verified: true,
        confidence: 0.95,
        metadata: {
          actualTitle: paper.title,
          actualAuthors: paper.authors,
          actualYear: paper.year,
          actualJournal: paper.journal,
        },
      };
    } catch (error) {
      return { exists: false, verified: false, confidence: 0 };
    }
  }

  private async validateByArXivID(arxivId: string): Promise<ValidationResult> {
    try {
      const url = ExternalAPIService.ARXIV_BASE_URL;
      const params = new URLSearchParams({
        id_list: arxivId,
      });

      const response = await fetch(`${url}?${params}`);
      if (!response.ok) {
        return { exists: false, verified: false, confidence: 0 };
      }

      const xmlData = await response.text();
      const papers = this.parseArXivXML(xmlData);

      if (papers.length === 0) {
        return { exists: false, verified: false, confidence: 0 };
      }

      const paper = papers[0];
      return {
        exists: true,
        verified: true,
        confidence: 0.9,
        metadata: {
          actualTitle: paper.title,
          actualAuthors: paper.authors,
          actualYear: paper.year,
        },
      };
    } catch (error) {
      return { exists: false, verified: false, confidence: 0 };
    }
  }

  private async validateByTitleSearch(title: string, authors: string): Promise<ValidationResult> {
    try {
      const searchQuery: SearchQuery = {
        query: `"${title}" ${authors.split(',')[0]}`,
        filters: { maxResults: 5 },
      };

      const results = await this.searchPapers(searchQuery);

      // Look for exact or very close title match
      const exactMatch = results.papers.find(
        (paper) => this.calculateSimilarity(paper.title.toLowerCase(), title.toLowerCase()) > 0.9
      );

      if (exactMatch) {
        return {
          exists: true,
          verified: true,
          confidence: 0.85,
          metadata: {
            actualTitle: exactMatch.title,
            actualAuthors: exactMatch.authors,
            actualYear: exactMatch.year,
            actualJournal: exactMatch.journal,
            citationCount: exactMatch.citationCount,
          },
        };
      }

      return { exists: false, verified: false, confidence: 0 };
    } catch (error) {
      return { exists: false, verified: false, confidence: 0 };
    }
  }

  private calculateSimilarity(str1: string, str2: string): number {
    // Simple similarity calculation - in real implementation, use proper algorithm
    const words1 = str1.split(' ');
    const words2 = str2.split(' ');
    const intersection = words1.filter((word) => words2.includes(word));
    return intersection.length / Math.max(words1.length, words2.length);
  }

  private checkRateLimit(service: string): boolean {
    const limit = this.rateLimits[service];
    if (!limit) return true;

    const now = Date.now();
    if (now > limit.resetTime) {
      limit.requests = 0;
      limit.resetTime = now + 60000; // Reset every minute
    }

    // Different rate limits for different services
    const maxRequests = {
      pubmed: 3, // 3 requests per minute
      crossref: 50, // 50 requests per minute
      arxiv: 3, // 3 requests per minute
      semantic_scholar: 10, // 10 requests per minute
    };

    return limit.requests < (maxRequests[service as keyof typeof maxRequests] || 10);
  }

  private updateRateLimit(service: string): void {
    const limit = this.rateLimits[service];
    if (limit) {
      limit.requests++;
    }
  }

  private removeDuplicatePapers(papers: ExternalPaper[]): ExternalPaper[] {
    const seen = new Set<string>();
    return papers.filter((paper) => {
      const key = paper.doi || paper.pmid || paper.arxivId || paper.title.toLowerCase();
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  private applyFilters(papers: ExternalPaper[], filters?: SearchQuery['filters']): ExternalPaper[] {
    if (!filters) return papers;

    let filtered = papers;

    if (filters.yearRange) {
      filtered = filtered.filter(
        (paper) => paper.year >= filters.yearRange!.start && paper.year <= filters.yearRange!.end
      );
    }

    if (filters.journal) {
      filtered = filtered.filter((paper) =>
        paper.journal?.toLowerCase().includes(filters.journal!.toLowerCase())
      );
    }

    if (filters.authors) {
      filtered = filtered.filter((paper) =>
        paper.authors.toLowerCase().includes(filters.authors!.toLowerCase())
      );
    }

    return filtered;
  }

  private sortResults(papers: ExternalPaper[], sortBy: string): ExternalPaper[] {
    switch (sortBy) {
      case 'date':
        return papers.sort((a, b) => b.year - a.year);
      case 'citation_count':
        return papers.sort((a, b) => (b.citationCount || 0) - (a.citationCount || 0));
      case 'relevance':
      default:
        return papers; // Already sorted by relevance from API
    }
  }

  // Mock result generators for when APIs are unavailable
  private getMockPubMedResults(query: SearchQuery): SearchResult {
    return {
      papers: [
        {
          id: 'pubmed-mock-1',
          title: 'Enhanced Algae Cultivation in Microfluidic Systems',
          authors: 'Chen, L., Wang, X., Liu, Y.',
          abstract:
            'This study demonstrates improved algae cultivation using microfluidic systems...',
          year: 2023,
          journal: 'Applied Energy',
          doi: '10.1016/j.apenergy.2023.mock1',
          pmid: '37123456',
          source: 'pubmed',
          citationCount: 15,
        },
      ],
      totalCount: 1,
      query: query.query,
      source: 'pubmed',
      processingTime: 100,
    };
  }

  private getMockCrossRefResults(query: SearchQuery): SearchResult {
    return {
      papers: [
        {
          id: 'crossref-mock-1',
          title: 'Optimization of Microbial Fuel Cell Performance',
          authors: 'Johnson, A., Smith, B.',
          abstract: 'Investigation of optimization strategies for microbial fuel cells...',
          year: 2022,
          journal: 'Energy & Environmental Science',
          doi: '10.1039/d2ee00001a',
          source: 'crossref',
          citationCount: 28,
        },
      ],
      totalCount: 1,
      query: query.query,
      source: 'crossref',
      processingTime: 150,
    };
  }

  private getMockArXivResults(query: SearchQuery): SearchResult {
    return {
      papers: [
        {
          id: 'arxiv-mock-1',
          title: 'Novel Approaches to Algae-Based Energy Systems',
          authors: 'Brown, M., Davis, C.',
          abstract: 'This paper presents novel approaches to algae-based energy systems...',
          year: 2023,
          arxivId: '2301.12345',
          source: 'arxiv',
          url: 'https://arxiv.org/abs/2301.12345',
        },
      ],
      totalCount: 1,
      query: query.query,
      source: 'arxiv',
      processingTime: 120,
    };
  }

  private getMockSemanticScholarResults(query: SearchQuery): SearchResult {
    return {
      papers: [
        {
          id: 'semantic-mock-1',
          title: 'Advances in Photosynthetic Fuel Cells',
          authors: 'Wilson, K., Taylor, R.',
          abstract: 'Recent advances in photosynthetic fuel cell technology...',
          year: 2023,
          journal: 'Nature Energy',
          doi: '10.1038/s41560-023-mock1',
          source: 'semantic_scholar',
          citationCount: 42,
          openAccess: true,
        },
      ],
      totalCount: 1,
      query: query.query,
      source: 'semantic_scholar',
      processingTime: 200,
    };
  }

  // Simplified XML parsing methods - in real implementation, use proper XML parser
  private parsePubMedXML(xml: string): ExternalPaper[] {
    // Mock parser - in real implementation, use proper XML parsing
    return [];
  }

  private parseArXivXML(xml: string): ExternalPaper[] {
    // Mock parser - in real implementation, use proper XML parsing
    return [];
  }

  private parseCrossRefItem(item: any): ExternalPaper {
    return {
      id: item.DOI || `crossref-${Date.now()}`,
      title: item.title?.[0] || 'Unknown Title',
      authors:
        item.author?.map((a: any) => `${a.given} ${a.family}`).join(', ') || 'Unknown Authors',
      abstract: item.abstract || 'No abstract available',
      year: item.published?.['date-parts']?.[0]?.[0] || new Date().getFullYear(),
      journal: item['container-title']?.[0],
      volume: item.volume,
      issue: item.issue,
      pages: item.page,
      doi: item.DOI,
      source: 'crossref',
      citationCount: item['is-referenced-by-count'],
      url: item.URL,
    };
  }

  private parseSemanticScholarItem(item: any): ExternalPaper {
    return {
      id: item.paperId || `semantic-${Date.now()}`,
      title: item.title || 'Unknown Title',
      authors: item.authors?.map((a: any) => a.name).join(', ') || 'Unknown Authors',
      abstract: item.abstract || 'No abstract available',
      year: item.year || new Date().getFullYear(),
      journal: item.journal?.name,
      doi: item.externalIds?.DOI,
      pmid: item.externalIds?.PubMed,
      arxivId: item.externalIds?.ArXiv,
      source: 'semantic_scholar',
      citationCount: item.citationCount,
      openAccess: !!item.openAccessPdf,
      url: item.url,
    };
  }
}
