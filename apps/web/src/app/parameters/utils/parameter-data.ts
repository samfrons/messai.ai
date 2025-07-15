import type {
  Parameter,
  ParameterCategory,
  ParameterFilter,
  ParameterSearchResults,
  DisplayCategory,
} from '../../../types/parameters';
import { getParameterCategory, getParameterCategories } from './parameter-categories';

// Import the unified parameter data
let unifiedData: any = null;

/**
 * Load unified parameter data from the parameters directory
 */
async function loadUnifiedData() {
  if (!unifiedData) {
    try {
      console.log(
        '🔄 Fetching unified parameter data from /parameters/MESS_PARAMETERS_UNIFIED.json...'
      );
      const response = await fetch('/parameters/MESS_PARAMETERS_UNIFIED.json');

      console.log('📡 Fetch response:', {
        ok: response.ok,
        status: response.status,
        statusText: response.statusText,
        url: response.url,
        headers: Object.fromEntries(response.headers.entries()),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
      }

      const responseText = await response.text();
      console.log('📄 Response text length:', responseText.length);

      unifiedData = JSON.parse(responseText);
      console.log('✅ Successfully loaded unified data:', {
        totalParams: unifiedData.metadata?.totalParameters,
        categories: unifiedData.categories?.length,
        metadata: unifiedData.metadata,
      });

      if (!unifiedData.categories || unifiedData.categories.length === 0) {
        console.warn('⚠️ No categories found in loaded data!');
      }
    } catch (error) {
      console.error('❌ Failed to load unified parameter data:', error);
      console.error('Error details:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });

      // Fallback to empty structure
      unifiedData = {
        metadata: { totalParameters: 0, majorCategories: 0, subcategories: 0 },
        categories: [],
      };
      console.log('🔄 Using fallback empty data structure');
    }
  }
  return unifiedData;
}

/**
 * Get all system parameters from the unified data
 */
export async function getSystemParameters(): Promise<Parameter[]> {
  const data = await loadUnifiedData();
  const parameters: Parameter[] = [];

  // Process each category in the unified data
  data.categories.forEach((category: any) => {
    category.subcategories.forEach((subcategory: any) => {
      subcategory.parameters.forEach((param: any) => {
        const transformedParam = transformUnifiedParameter(param, category, subcategory);

        // Add display category using our new categorization logic
        const { primary } = getParameterCategories(param, category.id);
        transformedParam.displayCategory = primary;

        parameters.push(transformedParam);
      });
    });
  });

  return parameters;
}

/**
 * Get categories from unified data
 */
export async function getParameterCategories() {
  const data = await loadUnifiedData();
  return data.categories.map((cat: any) => ({
    id: cat.id,
    name: cat.name,
    description: cat.description,
    subcategories: cat.subcategories.map((sub: any) => ({
      id: sub.id,
      name: sub.name,
      electrodeType: sub.electrodeType,
      parameterCount: sub.parameters.length,
    })),
  }));
}

/**
 * Search parameters with filters
 */
export async function searchParameters(
  filters: ParameterFilter,
  page = 1,
  pageSize = 20
): Promise<ParameterSearchResults> {
  const allParameters = await getSystemParameters();
  let filteredParameters = allParameters;

  // Apply query filter
  if (filters.query) {
    const query = filters.query.toLowerCase();
    filteredParameters = filteredParameters.filter(
      (param) =>
        param.name.toLowerCase().includes(query) ||
        param.description?.toLowerCase().includes(query) ||
        param.subcategory?.toLowerCase().includes(query)
    );
  }

  // Apply category filter - check both original category and display category
  if (filters.category) {
    filteredParameters = filteredParameters.filter(
      (param) => param.category === filters.category || param.displayCategory === filters.category
    );
  }

  // Apply subcategory filter
  if (filters.subcategory) {
    filteredParameters = filteredParameters.filter(
      (param) => param.subcategory === filters.subcategory
    );
  }

  // Apply property range filters
  if (filters.properties) {
    Object.entries(filters.properties).forEach(([property, range]) => {
      filteredParameters = filteredParameters.filter((param) => {
        const value = param.properties[property];
        if (typeof value !== 'number') return true;

        if (range.min !== undefined && value < range.min) return false;
        if (range.max !== undefined && value > range.max) return false;
        return true;
      });
    });
  }

  // Pagination
  const total = filteredParameters.length;
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedParameters = filteredParameters.slice(startIndex, endIndex);

  return {
    parameters: paginatedParameters,
    total,
    page,
    pageSize,
    facets: generateFacets(allParameters),
  };
}

/**
 * Transform unified parameter format to our Parameter interface
 */
function transformUnifiedParameter(unifiedParam: any, category: any, subcategory: any): Parameter {
  const mappedCategory = mapUnifiedCategoryToParameterCategory(category.id);

  return {
    id: unifiedParam.id,
    name: unifiedParam.name,
    category: mappedCategory,
    subcategory: subcategory.name,
    subcategoryCode: subcategory.id,
    description: unifiedParam.description,
    properties: transformUnifiedProperties(unifiedParam, mappedCategory),
    compatibility: transformUnifiedCompatibility(unifiedParam.compatibility),
    source: 'MESSAI Unified Parameter Library',
    isSystem: true,
  };
}

/**
 * Map unified category IDs to our ParameterCategory enum
 */
function mapUnifiedCategoryToParameterCategory(categoryId: string): ParameterCategory {
  const mapping: Record<string, ParameterCategory> = {
    'environmental-parameters': 'operating_condition',
    'cell-level-parameters': 'system_configuration',
    'reactor-level-parameters': 'system_configuration',
    'biological-parameters': 'microbe',
    'material-parameters': 'electrode',
    'substrate-parameters': 'substrate',
    'membrane-parameters': 'membrane',
    'cost-parameters': 'operating_condition',
    'performance-parameters': 'operating_condition',
    'analytical-parameters': 'operating_condition',
    'quality-control-parameters': 'operating_condition',
    'safety-parameters': 'operating_condition',
    'standardization-parameters': 'operating_condition',
  };
  return mapping[categoryId] || 'electrode';
}

/**
 * Transform unified parameter properties to our format
 */
function transformUnifiedProperties(
  unifiedParam: any,
  category: ParameterCategory
): Record<string, any> {
  const properties: Record<string, any> = {};

  // Add basic properties from unified format
  if (unifiedParam.unit) properties['unit'] = unifiedParam.unit;
  if (unifiedParam.range) {
    properties['min'] = unifiedParam.range.min;
    properties['max'] = unifiedParam.range.max;
  }
  if (unifiedParam.default !== undefined) properties['default'] = unifiedParam.default;
  if (unifiedParam.typical_range) {
    properties['typicalMin'] = unifiedParam.typical_range.min;
    properties['typicalMax'] = unifiedParam.typical_range.max;
  }

  // Add category-specific properties based on parameter name and type
  if (category === 'electrode') {
    properties['conductivity'] = extractNumericProperty(unifiedParam, 'conductivity', 1000);
    properties['surfaceArea'] = extractNumericProperty(unifiedParam, 'surface_area', 1000);
    properties['cost'] = extractNumericProperty(unifiedParam, 'cost', 50);
  } else if (category === 'microbe') {
    properties['growthRate'] = extractNumericProperty(unifiedParam, 'growth_rate', 0.3);
    properties['optimalTemperature'] = extractNumericProperty(unifiedParam, 'temperature', 30);
  }

  return properties;
}

/**
 * Transform unified compatibility format to our format
 */
function transformUnifiedCompatibility(unifiedCompatibility: any): any {
  if (!unifiedCompatibility) return undefined;

  return {
    compatibleWith: [],
    incompatibleWith: [],
    materials: unifiedCompatibility.materials || [],
    microbes: unifiedCompatibility.microbes || [],
    environments: unifiedCompatibility.environments || [],
    systemTypes: unifiedCompatibility.systemTypes || [],
    notes: 'Compatibility from MESSAI unified parameter system',
  };
}

/**
 * Extract numeric property with fallback
 */
function extractNumericProperty(param: any, propertyName: string, fallback: number): number {
  if (param[propertyName] !== undefined) {
    return typeof param[propertyName] === 'number' ? param[propertyName] : fallback;
  }
  return fallback;
}

/**
 * Generate search facets from all parameters
 */
function generateFacets(parameters: Parameter[]) {
  const categories = new Map<string, number>();
  const subcategories = new Map<string, number>();
  const propertyRanges: Record<string, { min: number; max: number }> = {};

  parameters.forEach((param) => {
    // Count display categories (preferred) or fall back to original category
    const categoryToCount = param.displayCategory || param.category;
    categories.set(categoryToCount, (categories.get(categoryToCount) || 0) + 1);

    // Count subcategories
    if (param.subcategory) {
      subcategories.set(param.subcategory, (subcategories.get(param.subcategory) || 0) + 1);
    }

    // Calculate property ranges
    Object.entries(param.properties).forEach(([key, value]) => {
      if (typeof value === 'number') {
        if (!propertyRanges[key]) {
          propertyRanges[key] = { min: value, max: value };
        } else {
          propertyRanges[key].min = Math.min(propertyRanges[key].min, value);
          propertyRanges[key].max = Math.max(propertyRanges[key].max, value);
        }
      }
    });
  });

  return {
    categories: Array.from(categories.entries()).map(([value, count]) => ({ value, count })),
    subcategories: Array.from(subcategories.entries()).map(([value, count]) => ({ value, count })),
    types: [],
    electrodeTypes: [],
    unitsUsed: [],
    propertyRanges,
    compatibilityOptions: {
      materials: [],
      microbes: [],
      environments: [],
      systemTypes: [],
    },
  };
}

// Legacy functions - kept for backward compatibility
// These are now replaced by the unified data functions above
