'use client';

import { useState, useCallback, useEffect } from 'react';
import type {
  ResearchPaper,
  SearchFilters,
  SortOption,
  SearchResults,
  SearchState,
  ResearchFocus,
  JournalType,
} from '../types';
import { allMockPapers } from '../mockData';

/**
 * Custom hook for managing research paper search functionality
 *
 * Features:
 * - Semantic search across title, abstract, keywords, and authors
 * - Advanced filtering by year, journal type, research focus, etc.
 * - Multiple sorting options
 * - Pagination support
 * - Search history and suggestions
 * - Debounced search for performance
 */
export const useResearchSearch = () => {
  const [searchState, setSearchState] = useState<SearchState>({
    query: '',
    filters: {},
    sortBy: 'relevance',
    page: 0,
    pageSize: 10,
    isLoading: false,
    searchHistory: [],
    savedSearches: [],
  });

  /**
   * Performs semantic search on papers
   */
  const performSearch = useCallback(
    (
      query: string,
      papers: ResearchPaper[] = allMockPapers,
      filters: SearchFilters = {}
    ): ResearchPaper[] => {
      let filteredPapers = [...papers];

      // Apply filters first
      if (filters.yearRange) {
        filteredPapers = filteredPapers.filter(
          (paper) => paper.year >= filters.yearRange!.start && paper.year <= filters.yearRange!.end
        );
      }

      if (filters.journalTypes && filters.journalTypes.length > 0) {
        filteredPapers = filteredPapers.filter((paper) =>
          filters.journalTypes!.includes(paper.journal.type as JournalType)
        );
      }

      if (filters.researchFocus && filters.researchFocus.length > 0) {
        filteredPapers = filteredPapers.filter((paper) =>
          paper.researchFocus.some((focus) =>
            filters.researchFocus!.includes(focus as ResearchFocus)
          )
        );
      }

      if (filters.minCitations !== undefined) {
        filteredPapers = filteredPapers.filter(
          (paper) => paper.citation.citationCount >= filters.minCitations!
        );
      }

      if (filters.minConfidenceScore !== undefined) {
        filteredPapers = filteredPapers.filter(
          (paper) => (paper.aiConfidenceScore || 0) >= filters.minConfidenceScore!
        );
      }

      if (filters.minQualityScore !== undefined) {
        filteredPapers = filteredPapers.filter(
          (paper) => paper.qualityScore >= filters.minQualityScore!
        );
      }

      if (filters.hasPerformanceMetrics) {
        filteredPapers = filteredPapers.filter(
          (paper) =>
            paper.performanceMetrics &&
            (paper.performanceMetrics.maxPowerDensity ||
              paper.performanceMetrics.coulombicEfficiency ||
              paper.performanceMetrics.energyRecoveryEfficiency)
        );
      }

      if (filters.aiEnhancedOnly) {
        filteredPapers = filteredPapers.filter((paper) => paper.aiEnhanced);
      }

      if (filters.fullTextOnly) {
        filteredPapers = filteredPapers.filter((paper) => paper.fullTextAvailable);
      }

      // Perform semantic search if query exists
      if (query.trim()) {
        const searchTerms = query
          .toLowerCase()
          .split(' ')
          .filter((term) => term.length > 0);

        filteredPapers = filteredPapers
          .filter((paper) => {
            const searchableText = [
              paper.title,
              paper.abstract,
              ...paper.keywords,
              ...paper.authors.map((a) => a.name),
              paper.journal.name,
              ...paper.researchFocus,
              ...(paper.methodology || []),
            ]
              .join(' ')
              .toLowerCase();

            return searchTerms.some((term) => searchableText.includes(term));
          })
          .map((paper) => {
            // Calculate relevance score based on matches
            const searchableText = [
              paper.title,
              paper.abstract,
              ...paper.keywords,
              ...paper.authors.map((a) => a.name),
              paper.journal.name,
              ...paper.researchFocus,
            ]
              .join(' ')
              .toLowerCase();

            let relevanceScore = 0;
            searchTerms.forEach((term) => {
              // Title matches get higher score
              if (paper.title.toLowerCase().includes(term)) relevanceScore += 3;
              // Abstract matches get medium score
              if (paper.abstract.toLowerCase().includes(term)) relevanceScore += 2;
              // Other matches get base score
              if (searchableText.includes(term)) relevanceScore += 1;
            });

            return { ...paper, relevanceScore };
          });
      }

      return filteredPapers;
    },
    []
  );

  /**
   * Sorts papers based on the selected sort option
   */
  const sortPapers = useCallback((papers: ResearchPaper[], sortBy: SortOption): ResearchPaper[] => {
    const sortedPapers = [...papers];

    switch (sortBy) {
      case 'relevance':
        return sortedPapers.sort((a, b) => {
          const aScore = (a as any).relevanceScore || 0;
          const bScore = (b as any).relevanceScore || 0;
          if (aScore !== bScore) return bScore - aScore;
          // Fall back to citation count for equal relevance
          return b.citation.citationCount - a.citation.citationCount;
        });

      case 'year-desc':
        return sortedPapers.sort((a, b) => b.year - a.year);

      case 'year-asc':
        return sortedPapers.sort((a, b) => a.year - b.year);

      case 'citations-desc':
        return sortedPapers.sort((a, b) => b.citation.citationCount - a.citation.citationCount);

      case 'citations-asc':
        return sortedPapers.sort((a, b) => a.citation.citationCount - b.citation.citationCount);

      case 'quality-desc':
        return sortedPapers.sort((a, b) => b.qualityScore - a.qualityScore);

      case 'quality-asc':
        return sortedPapers.sort((a, b) => a.qualityScore - b.qualityScore);

      case 'confidence-desc':
        return sortedPapers.sort((a, b) => (b.aiConfidenceScore || 0) - (a.aiConfidenceScore || 0));

      case 'added-desc':
        return sortedPapers.sort(
          (a, b) => b.addedToDatabase.getTime() - a.addedToDatabase.getTime()
        );

      default:
        return sortedPapers;
    }
  }, []);

  /**
   * Paginates the sorted papers
   */
  const paginatePapers = useCallback(
    (
      papers: ResearchPaper[],
      page: number,
      pageSize: number
    ): { paginatedPapers: ResearchPaper[]; totalPages: number } => {
      const startIndex = page * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedPapers = papers.slice(startIndex, endIndex);
      const totalPages = Math.ceil(papers.length / pageSize);

      return { paginatedPapers, totalPages };
    },
    []
  );

  /**
   * Generates search suggestions based on the current query
   */
  const generateSuggestions = useCallback((query: string): string[] => {
    if (!query.trim()) return [];

    const suggestions: string[] = [];
    const lowerQuery = query.toLowerCase();

    // Common research terms
    const commonTerms = [
      'microbial fuel cell',
      'electrode design',
      'biofilm engineering',
      'power density',
      'coulombic efficiency',
      'energy recovery',
      'wastewater treatment',
      'hydrogen production',
      'performance optimization',
      'materials science',
    ];

    // Add matching common terms
    commonTerms.forEach((term) => {
      if (term.includes(lowerQuery) && !suggestions.includes(term)) {
        suggestions.push(term);
      }
    });

    // Add author suggestions
    const authors = allMockPapers.flatMap((paper) => paper.authors.map((a) => a.name));
    const uniqueAuthors = [...new Set(authors)];
    uniqueAuthors.forEach((author) => {
      if (author.toLowerCase().includes(lowerQuery) && !suggestions.includes(author)) {
        suggestions.push(author);
      }
    });

    // Add journal suggestions
    const journals = allMockPapers.map((paper) => paper.journal.name);
    const uniqueJournals = [...new Set(journals)];
    uniqueJournals.forEach((journal) => {
      if (journal.toLowerCase().includes(lowerQuery) && !suggestions.includes(journal)) {
        suggestions.push(journal);
      }
    });

    return suggestions.slice(0, 5); // Limit to 5 suggestions
  }, []);

  /**
   * Executes search with current state
   */
  const executeSearch = useCallback(() => {
    const startTime = Date.now();

    setSearchState((prev) => ({ ...prev, isLoading: true }));

    // Simulate async search delay
    setTimeout(() => {
      const filteredPapers = performSearch(searchState.query, allMockPapers, searchState.filters);
      const sortedPapers = sortPapers(filteredPapers, searchState.sortBy);
      const { paginatedPapers, totalPages } = paginatePapers(
        sortedPapers,
        searchState.page,
        searchState.pageSize
      );

      const searchTime = Date.now() - startTime;
      const suggestions = generateSuggestions(searchState.query);

      const results: SearchResults = {
        papers: paginatedPapers,
        totalCount: filteredPapers.length,
        page: searchState.page,
        pageSize: searchState.pageSize,
        totalPages,
        query: searchState.query,
        filters: searchState.filters,
        sortBy: searchState.sortBy,
        searchTime,
        suggestions,
      };

      setSearchState((prev) => ({
        ...prev,
        isLoading: false,
        results,
      }));
    }, 300); // Simulate network delay
  }, [
    searchState.query,
    searchState.filters,
    searchState.sortBy,
    searchState.page,
    searchState.pageSize,
    performSearch,
    sortPapers,
    paginatePapers,
    generateSuggestions,
  ]);

  /**
   * Updates search query
   */
  const setQuery = useCallback((query: string) => {
    setSearchState((prev) => ({
      ...prev,
      query,
      page: 0, // Reset to first page
      searchHistory:
        query.trim() && !prev.searchHistory.includes(query.trim())
          ? [query.trim(), ...prev.searchHistory.slice(0, 9)] // Keep last 10 searches
          : prev.searchHistory,
    }));
  }, []);

  /**
   * Updates search filters
   */
  const setFilters = useCallback((filters: SearchFilters) => {
    setSearchState((prev) => ({
      ...prev,
      filters,
      page: 0, // Reset to first page
    }));
  }, []);

  /**
   * Updates sort option
   */
  const setSortBy = useCallback((sortBy: SortOption) => {
    setSearchState((prev) => ({
      ...prev,
      sortBy,
      page: 0, // Reset to first page
    }));
  }, []);

  /**
   * Updates page
   */
  const setPage = useCallback((page: number) => {
    setSearchState((prev) => ({ ...prev, page }));
  }, []);

  /**
   * Updates page size
   */
  const setPageSize = useCallback((pageSize: number) => {
    setSearchState((prev) => ({
      ...prev,
      pageSize,
      page: 0, // Reset to first page
    }));
  }, []);

  /**
   * Clears all filters
   */
  const clearFilters = useCallback(() => {
    setSearchState((prev) => ({
      ...prev,
      filters: {},
      page: 0,
    }));
  }, []);

  /**
   * Saves current search
   */
  const saveSearch = useCallback(
    (name: string) => {
      const savedSearch = {
        id: Date.now().toString(),
        name,
        query: searchState.query,
        filters: searchState.filters,
        createdAt: new Date(),
      };

      setSearchState((prev) => ({
        ...prev,
        savedSearches: [savedSearch, ...prev.savedSearches],
      }));

      return savedSearch.id;
    },
    [searchState.query, searchState.filters]
  );

  /**
   * Loads a saved search
   */
  const loadSavedSearch = useCallback(
    (searchId: string) => {
      const savedSearch = searchState.savedSearches.find((s) => s.id === searchId);
      if (savedSearch) {
        setSearchState((prev) => ({
          ...prev,
          query: savedSearch.query,
          filters: savedSearch.filters,
          page: 0,
        }));
      }
    },
    [searchState.savedSearches]
  );

  // Execute search when dependencies change
  useEffect(() => {
    executeSearch();
  }, [
    searchState.query,
    searchState.filters,
    searchState.sortBy,
    searchState.page,
    searchState.pageSize,
  ]);

  return {
    // State
    query: searchState.query,
    filters: searchState.filters,
    sortBy: searchState.sortBy,
    page: searchState.page,
    pageSize: searchState.pageSize,
    isLoading: searchState.isLoading,
    results: searchState.results,
    error: searchState.error,
    searchHistory: searchState.searchHistory,
    savedSearches: searchState.savedSearches,

    // Actions
    setQuery,
    setFilters,
    setSortBy,
    setPage,
    setPageSize,
    clearFilters,
    saveSearch,
    loadSavedSearch,

    // Computed values
    hasActiveFilters: Object.keys(searchState.filters).length > 0,
    totalResults: searchState.results?.totalCount || 0,
    currentPageStart: searchState.page * searchState.pageSize + 1,
    currentPageEnd: Math.min(
      (searchState.page + 1) * searchState.pageSize,
      searchState.results?.totalCount || 0
    ),
  };
};
