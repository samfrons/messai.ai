import { useState, useCallback, useEffect } from 'react';
import { searchParameters } from '../utils/parameter-data';
import type { ParameterFilter, ParameterSortOption, Parameter } from '../../../types/parameters';

export function useParameterSearch() {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<ParameterFilter>({});
  const [sortBy, setSortBy] = useState<ParameterSortOption>('relevance');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(12);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<Parameter[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [facets, setFacets] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Perform search when query or filters change
  useEffect(() => {
    const performSearch = async () => {
      setIsLoading(true);
      setError(null); // Clear previous errors

      try {
        console.log('🔍 Starting parameter search with:', { query, filters, page, pageSize });

        const searchFilters = {
          ...filters,
          ...(query && { query }),
        };

        const searchResults = await searchParameters(searchFilters, page, pageSize);

        console.log('📊 Search results:', {
          parametersFound: searchResults.parameters.length,
          total: searchResults.total,
          hasFacets: !!searchResults.facets,
        });

        setResults(searchResults.parameters);
        setTotalResults(searchResults.total);
        setFacets(searchResults.facets);

        if (searchResults.total === 0 && !query && Object.keys(filters).length === 0) {
          setError('No default parameters could be loaded. Check console for data loading errors.');
        }
      } catch (error) {
        console.error('❌ Error searching parameters:', error);
        setError(error instanceof Error ? error.message : 'Failed to load parameters');
        setResults([]);
        setTotalResults(0);
        setFacets(null);
      } finally {
        setIsLoading(false);
      }
    };

    performSearch();
  }, [query, filters, page, pageSize]);

  const hasActiveFilters = Boolean(
    filters.category ||
      filters.subcategory ||
      filters.type ||
      filters.electrodeType ||
      filters.onlySystem ||
      filters.onlyCustom ||
      filters.hasValidationRules ||
      filters.hasTypicalRange ||
      (filters.properties && Object.keys(filters.properties).length > 0) ||
      (filters.compatibility &&
        Object.values(filters.compatibility).some((v) => Array.isArray(v) && v.length > 0))
  );

  const clearFilters = useCallback(() => {
    setFilters({});
    setPage(1);
  }, []);

  return {
    query,
    filters,
    sortBy,
    page,
    pageSize,
    isLoading,
    results,
    searchHistory: [], // Could implement search history
    hasActiveFilters,
    totalResults,
    facets,
    error,
    setQuery,
    setFilters,
    setSortBy,
    setPage,
    clearFilters,
  };
}
