'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import type {
  ResearchPaper,
  SearchFilters,
  SortOption,
  SearchResults,
  SearchState,
} from '../app/research/types';

/**
 * Custom hook for research paper search using the API
 *
 * Features:
 * - Real database queries via /api/papers
 * - Debounced search for performance
 * - Loading states and error handling
 * - Client-side caching
 * - URL parameter construction
 */
export const useResearchAPI = () => {
  const [searchState, setSearchState] = useState<SearchState>({
    query: '',
    filters: {},
    sortBy: 'relevance',
    page: 0,
    pageSize: 40,
    isLoading: false,
    searchHistory: [],
    savedSearches: [],
  });

  // Cache for API responses
  const cacheRef = useRef<Map<string, { data: SearchResults; timestamp: number }>>(new Map());
  const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  // Debounce timer
  const debounceTimerRef = useRef<NodeJS.Timeout>();

  /**
   * Builds URL search parameters from current state
   */
  const buildSearchParams = useCallback(
    (
      query: string,
      filters: SearchFilters,
      sortBy: SortOption,
      page: number,
      pageSize: number
    ): URLSearchParams => {
      const params = new URLSearchParams();

      // Basic parameters
      if (query.trim()) params.set('search', query.trim());
      params.set('sort', sortBy);
      params.set('page', page.toString());
      params.set('limit', pageSize.toString());

      // Filter parameters
      if (filters.yearRange) {
        if (filters.yearRange.start) params.set('yearStart', filters.yearRange.start.toString());
        if (filters.yearRange.end) params.set('yearEnd', filters.yearRange.end.toString());
      }

      if (filters.journalTypes && filters.journalTypes.length > 0) {
        params.set('journalTypes', filters.journalTypes.join(','));
      }

      if (filters.researchFocus && filters.researchFocus.length > 0) {
        params.set('researchFocus', filters.researchFocus.join(','));
      }

      if (filters.minCitations !== undefined) {
        params.set('minCitations', filters.minCitations.toString());
      }

      if (filters.minQualityScore !== undefined) {
        params.set('minQualityScore', filters.minQualityScore.toString());
      }

      if (filters.minConfidenceScore !== undefined) {
        params.set('minConfidenceScore', filters.minConfidenceScore.toString());
      }

      if (filters.hasPerformanceMetrics) {
        params.set('hasMetrics', 'true');
      }

      if (filters.aiEnhancedOnly) {
        params.set('verified', 'true');
      }

      if (filters.fullTextOnly) {
        params.set('fullTextOnly', 'true');
      }

      return params;
    },
    []
  );

  /**
   * Generates cache key from search parameters
   */
  const getCacheKey = useCallback((params: URLSearchParams): string => {
    return params.toString();
  }, []);

  /**
   * Checks if cached data is still valid
   */
  const isCacheValid = useCallback((timestamp: number): boolean => {
    return Date.now() - timestamp < CACHE_TTL;
  }, []);

  /**
   * Performs API call to fetch papers
   */
  const fetchPapers = useCallback(
    async (
      query: string,
      filters: SearchFilters,
      sortBy: SortOption,
      page: number,
      pageSize: number
    ): Promise<SearchResults> => {
      const params = buildSearchParams(query, filters, sortBy, page, pageSize);
      const cacheKey = getCacheKey(params);

      // Check cache first
      const cached = cacheRef.current.get(cacheKey);
      if (cached && isCacheValid(cached.timestamp)) {
        return cached.data;
      }

      // Make API call
      const response = await fetch(`/api/papers?${params.toString()}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to fetch papers');
      }

      const apiResponse = await response.json();

      // Transform API response to SearchResults format
      const results: SearchResults = {
        papers: apiResponse.data.papers,
        totalCount: apiResponse.data.pagination.total,
        page: apiResponse.data.pagination.page,
        pageSize: apiResponse.data.pagination.limit,
        totalPages: apiResponse.data.pagination.pages,
        query,
        filters,
        sortBy,
        searchTime: apiResponse.data.searchTime || 0,
        suggestions: apiResponse.data.suggestions,
      };

      // Cache the results
      cacheRef.current.set(cacheKey, {
        data: results,
        timestamp: Date.now(),
      });

      // Clean up old cache entries (keep cache size reasonable)
      if (cacheRef.current.size > 50) {
        const now = Date.now();
        for (const [key, entry] of cacheRef.current.entries()) {
          if (!isCacheValid(entry.timestamp)) {
            cacheRef.current.delete(key);
          }
        }
      }

      return results;
    },
    [buildSearchParams, getCacheKey, isCacheValid]
  );

  /**
   * Executes search with current state
   */
  const executeSearch = useCallback(async () => {
    try {
      setSearchState((prev) => ({ ...prev, isLoading: true, error: undefined }));

      const results = await fetchPapers(
        searchState.query,
        searchState.filters,
        searchState.sortBy,
        searchState.page,
        searchState.pageSize
      );

      setSearchState((prev) => ({
        ...prev,
        isLoading: false,
        results,
      }));
    } catch (error) {
      console.error('Search error:', error);
      setSearchState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Search failed',
      }));
    }
  }, [
    searchState.query,
    searchState.filters,
    searchState.sortBy,
    searchState.page,
    searchState.pageSize,
    fetchPapers,
  ]);

  /**
   * Debounced search execution
   */
  const debouncedExecuteSearch = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      executeSearch();
    }, 300); // 300ms debounce
  }, [executeSearch]);

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
   * Clears cache manually
   */
  const clearCache = useCallback(() => {
    cacheRef.current.clear();
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

  // Execute initial search on mount
  useEffect(() => {
    executeSearch();
  }, []); // Run once on mount

  // Execute search when dependencies change (debounced)
  useEffect(() => {
    debouncedExecuteSearch();

    // Cleanup debounce timer
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [
    searchState.query,
    searchState.filters,
    searchState.sortBy,
    searchState.page,
    searchState.pageSize,
  ]);

  // Execute immediate search for page changes (no debounce)
  useEffect(() => {
    executeSearch();
  }, [searchState.page]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

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
    clearCache,
    saveSearch,
    loadSavedSearch,
    refetch: executeSearch,

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
