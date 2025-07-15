import { useMemo, useCallback, useState, useEffect } from 'react';
import { getParameterCategories, getSystemParameters } from '../utils/parameter-data';
import type {
  ParameterFilter,
  ParameterCategory,
  ParameterType,
  ParameterCategoryData,
} from '../../../types/parameters';

export function useParameterFilters(
  filters: ParameterFilter,
  setFilters: (filters: ParameterFilter) => void
) {
  const [allParameters, setAllParameters] = useState<any[]>([]);
  const [categories, setCategories] = useState<ParameterCategoryData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load parameters and categories
  useEffect(() => {
    const loadData = async () => {
      try {
        const [params, cats] = await Promise.all([getSystemParameters(), getParameterCategories()]);
        setAllParameters(params);
        setCategories(cats);
      } catch (error) {
        console.error('Error loading parameter data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

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
    if (!filters.category || categories.length === 0) return [];

    const selectedCategory = categories.find(
      (cat) =>
        cat.id === filters.category ||
        cat.name.toLowerCase().replace(/\s+/g, '_') === filters.category
    );

    if (!selectedCategory) return [];

    return selectedCategory.subcategories.map((sub) => ({
      value: sub.name,
      label: sub.name,
      count: sub.parameterCount || 0,
      electrodeType: sub.electrodeType,
    }));
  }, [categories, filters.category]);

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
    const ranges: Record<string, { min: number; max: number }> = {};

    if (allParameters.length === 0) return ranges;

    // Filter parameters based on current filters
    let params = [...allParameters];
    if (filters.category) {
      params = params.filter((p) => p.category === filters.category);
    }
    if (filters.type) {
      params = params.filter((p) => p.type === filters.type);
    }

    // Calculate ranges for all numeric properties
    const numericProperties = new Set<string>();
    params.forEach((param) => {
      Object.entries(param.properties || {}).forEach(([key, value]) => {
        if (typeof value === 'number') {
          numericProperties.add(key);
        }
      });

      // Also check unified schema properties
      if (param.range?.min !== undefined && param.range?.max !== undefined) {
        if (param.unit) {
          numericProperties.add('range');
        }
      }
    });

    numericProperties.forEach((prop) => {
      const values = params
        .map((p) => p.properties?.[prop])
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

  // Get compatibility options from all parameters
  const compatibilityOptions = useMemo(() => {
    if (allParameters.length === 0) return undefined;

    const materials = new Map<string, number>();
    const microbes = new Map<string, number>();
    const environments = new Map<string, number>();
    const systemTypes = new Map<string, number>();

    allParameters.forEach((param) => {
      if (param.compatibility) {
        param.compatibility.materials?.forEach((material: string) => {
          materials.set(material, (materials.get(material) || 0) + 1);
        });
        param.compatibility.microbes?.forEach((microbe: string) => {
          microbes.set(microbe, (microbes.get(microbe) || 0) + 1);
        });
        param.compatibility.environments?.forEach((env: string) => {
          environments.set(env, (environments.get(env) || 0) + 1);
        });
        param.compatibility.systemTypes?.forEach((system: string) => {
          systemTypes.set(system, (systemTypes.get(system) || 0) + 1);
        });
      }
    });

    return {
      materials: Array.from(materials.entries()).map(([value, count]) => ({ value, count })),
      microbes: Array.from(microbes.entries()).map(([value, count]) => ({ value, count })),
      environments: Array.from(environments.entries()).map(([value, count]) => ({ value, count })),
      systemTypes: Array.from(systemTypes.entries()).map(([value, count]) => ({ value, count })),
    };
  }, [allParameters]);

  const updateFilter = useCallback(
    (key: keyof ParameterFilter, value: any) => {
      const newFilters = { ...filters };

      if (value === null || value === undefined) {
        delete newFilters[key];
      } else {
        (newFilters as any)[key] = value;
      }

      // Clear dependent filters when parent filter changes
      if (key === 'category' && value !== filters.category) {
        delete newFilters.subcategory;
        delete newFilters.type;
        delete newFilters.electrodeType;
      }

      if (key === 'subcategory' && value !== filters.subcategory) {
        delete newFilters.electrodeType;
      }

      setFilters(newFilters);
    },
    [filters, setFilters]
  );

  const clearCategoryFilter = useCallback(() => {
    const newFilters = { ...filters };
    delete newFilters.category;
    delete newFilters.subcategory;
    delete newFilters.type;
    delete newFilters.electrodeType;
    setFilters(newFilters);
  }, [filters, setFilters]);

  return {
    categoryOptions,
    subcategoryOptions,
    typeOptions,
    propertyRanges,
    compatibilityOptions,
    categories,
    isLoading,
    updateFilter,
    clearCategoryFilter,
  };
}
