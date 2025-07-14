import { useState, useCallback, useEffect, useMemo } from 'react';
import { getSystemParameters } from '../utils/parameter-data';
import type { ParameterFilter, ParameterSortOption } from '../../../types/parameters';

export function useParameterSearch() {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<ParameterFilter>({});
  const [sortBy, setSortBy] = useState<ParameterSortOption>('relevance');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(12);
  const [isLoading, setIsLoading] = useState(false);

  // Get all system parameters
  const allParameters = useMemo(() => getSystemParameters(), []);

  // Filter and search parameters
  const filteredParameters = useMemo(() => {
    let filtered = [...allParameters];

    // Apply text search
    if (query) {
      const searchLower = query.toLowerCase();
      filtered = filtered.filter(
        (param) =>
          param.name.toLowerCase().includes(searchLower) ||
          param.description?.toLowerCase().includes(searchLower) ||
          param.category.toLowerCase().includes(searchLower) ||
          param.type?.toLowerCase().includes(searchLower)
      );
    }

    // Apply category filter
    if (filters.category) {
      filtered = filtered.filter((param) => param.category === filters.category);
    }

    // Apply subcategory filter
    if (filters.subcategory) {
      filtered = filtered.filter((param) => param.subcategory === filters.subcategory);
    }

    // Apply type filter
    if (filters.type) {
      filtered = filtered.filter((param) => param.type === filters.type);
    }

    // Apply property filters
    if (filters.properties) {
      Object.entries(filters.properties).forEach(([property, range]) => {
        if (range.min !== undefined || range.max !== undefined) {
          filtered = filtered.filter((param) => {
            const value = param.properties[property];
            if (value === undefined) return false;
            if (range.min !== undefined && value < range.min) return false;
            if (range.max !== undefined && value > range.max) return false;
            return true;
          });
        }
      });
    }

    // Apply source filters
    if (filters.onlySystem) {
      filtered = filtered.filter((param) => param.isSystem);
    }
    if (filters.onlyCustom) {
      filtered = filtered.filter((param) => !param.isSystem);
    }

    // Sort results
    switch (sortBy) {
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'category':
        filtered.sort((a, b) => a.category.localeCompare(b.category));
        break;
      case 'recent':
        // For now, reverse the order to simulate recent first
        filtered.reverse();
        break;
      case 'relevance':
      default:
        // Keep original order for relevance (already sorted by search match)
        break;
    }

    return filtered;
  }, [allParameters, query, filters, sortBy]);

  // Paginate results
  const results = useMemo(() => {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return filteredParameters.slice(start, end);
  }, [filteredParameters, page, pageSize]);

  const totalResults = filteredParameters.length;

  const hasActiveFilters = Boolean(
    filters.category ||
      filters.type ||
      filters.onlySystem ||
      filters.onlyCustom ||
      (filters.properties && Object.keys(filters.properties).length > 0)
  );

  const clearFilters = useCallback(() => {
    setFilters({});
    setPage(1);
  }, []);

  // Simulate loading state for realistic UX
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 300);
    return () => clearTimeout(timer);
  }, [query, filters, page]);

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
    setQuery,
    setFilters,
    setSortBy,
    setPage,
    clearFilters,
  };
}
