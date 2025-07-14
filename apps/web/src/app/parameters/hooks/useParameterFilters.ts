import { useMemo, useCallback } from 'react';
import { getSystemParameters } from '../utils/parameter-data';
import type { ParameterFilter, ParameterCategory, ParameterType } from '../../../types/parameters';

export function useParameterFilters(
  filters: ParameterFilter,
  setFilters: (filters: ParameterFilter) => void
) {
  const allParameters = useMemo(() => getSystemParameters(), []);

  // Get category options with counts
  const categoryOptions = useMemo(() => {
    const categoryCounts = new Map<ParameterCategory, number>();

    allParameters.forEach((param) => {
      categoryCounts.set(param.category, (categoryCounts.get(param.category) || 0) + 1);
    });

    return Array.from(categoryCounts.entries()).map(([value, count]) => ({
      value,
      label: value
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' '),
      count,
    }));
  }, [allParameters]);

  // Get subcategory options based on selected category
  const subcategoryOptions = useMemo(() => {
    if (!filters.category) return [];

    const subcategoryCounts = new Map<string, number>();

    allParameters
      .filter((param) => param.category === filters.category)
      .forEach((param) => {
        if (param.subcategory) {
          subcategoryCounts.set(
            param.subcategory,
            (subcategoryCounts.get(param.subcategory) || 0) + 1
          );
        }
      });

    return Array.from(subcategoryCounts.entries()).map(([value, count]) => ({
      value,
      label: value,
      count,
    }));
  }, [allParameters, filters.category]);

  // Get type options based on selected category
  const typeOptions = useMemo(() => {
    if (!filters.category) return [];

    const typeCounts = new Map<ParameterType, number>();

    allParameters
      .filter((param) => param.category === filters.category)
      .forEach((param) => {
        if (param.type) {
          typeCounts.set(param.type, (typeCounts.get(param.type) || 0) + 1);
        }
      });

    return Array.from(typeCounts.entries()).map(([value, count]) => ({
      value,
      label: value.charAt(0).toUpperCase() + value.slice(1),
      count,
    }));
  }, [allParameters, filters.category]);

  // Get property ranges
  const propertyRanges = useMemo(() => {
    const ranges: {
      conductivity?: { min: number; max: number };
      cost?: { min: number; max: number };
      temperature?: { min: number; max: number };
      ph?: { min: number; max: number };
    } = {};

    // Filter parameters based on current filters
    let params = [...allParameters];
    if (filters.category) {
      params = params.filter((p) => p.category === filters.category);
    }
    if (filters.type) {
      params = params.filter((p) => p.type === filters.type);
    }

    // Calculate ranges for each property
    const properties = ['conductivity', 'cost', 'temperature', 'ph'] as const;

    properties.forEach((prop) => {
      const values = params
        .map((p) => p.properties[prop])
        .filter((v) => v !== undefined && typeof v === 'number') as number[];

      if (values.length > 0) {
        ranges[prop] = {
          min: Math.min(...values),
          max: Math.max(...values),
        };
      }
    });

    return ranges;
  }, [allParameters, filters.category, filters.type]);

  const updateFilter = useCallback(
    (key: keyof ParameterFilter, value: any) => {
      const newFilters = { ...filters };

      if (value === null || value === undefined) {
        delete newFilters[key];
      } else {
        (newFilters as any)[key] = value;
      }

      // Clear type filter if category changes
      if (key === 'category' && value !== filters.category) {
        delete newFilters.type;
      }

      setFilters(newFilters);
    },
    [filters, setFilters]
  );

  const clearCategoryFilter = useCallback(() => {
    const newFilters = { ...filters };
    delete newFilters.category;
    delete newFilters.type; // Also clear type when clearing category
    setFilters(newFilters);
  }, [filters, setFilters]);

  return {
    categoryOptions,
    subcategoryOptions,
    typeOptions,
    propertyRanges,
    updateFilter,
    clearCategoryFilter,
  };
}
