import type {
  Parameter,
  ParameterCategory,
  ParameterFilter,
  ParameterSearchResults,
} from '../../../types/parameters';
import { getParameterCategories as categorizeParameter } from './parameter-categories';
import { MICROFLUIDIC_PARAMETERS } from '../data/microfluidic-parameters';

// Import the unified parameter data
let unifiedData: any = null;

/**
 * Load unified parameter data from the parameters directory
 */
async function loadUnifiedData() {
  if (!unifiedData) {
    try {
      console.log(
        '🔄 Fetching unified parameter data from /parameters/MESS_PARAMETERS_UNIFIED_FINAL.json...'
      );
      const response = await fetch('/parameters/MESS_PARAMETERS_UNIFIED_FINAL.json');

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

      // Validate data structure
      if (!unifiedData || typeof unifiedData !== 'object') {
        throw new Error('Invalid JSON structure: data is not an object');
      }

      if (!unifiedData.categories || !Array.isArray(unifiedData.categories)) {
        throw new Error('Invalid data structure: missing or invalid categories array');
      }

      console.log('✅ Successfully loaded unified data:', {
        totalParams: unifiedData.metadata?.totalParameters,
        categories: unifiedData.categories?.length,
        metadata: unifiedData.metadata,
      });

      if (unifiedData.categories.length === 0) {
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
    if (!category.subcategories || !Array.isArray(category.subcategories)) {
      console.warn(`Category ${category.id} has no subcategories or invalid subcategories`);
      return;
    }

    category.subcategories.forEach((subcategory: any) => {
      if (!subcategory.parameters || !Array.isArray(subcategory.parameters)) {
        console.warn(`Subcategory ${subcategory.id} has no parameters or invalid parameters`);
        return;
      }

      subcategory.parameters.forEach((param: any) => {
        // Validate parameter structure
        if (!param.id || !param.name) {
          console.warn(`Parameter missing id or name:`, param);
          return;
        }

        // Skip categorical variables - we only want measurable parameters
        if (isCategoricalVariable(param)) {
          console.log(`Filtering out categorical variable: ${param.name} (${param.id})`);
          return;
        }

        try {
          const transformedParam = transformUnifiedParameter(param, category, subcategory);

          // Add display category using our new categorization logic
          const { primary } = categorizeParameter(param, category.id);
          transformedParam.displayCategory = primary;

          parameters.push(transformedParam);
        } catch (error) {
          console.error(`Error transforming parameter ${param.id}:`, error);
        }
      });
    });
  });

  // Merge with microfluidic parameters
  const allParameters = [...parameters, ...MICROFLUIDIC_PARAMETERS];

  return allParameters;
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

  // Apply category filter - use display category for UI filtering
  if (filters.category) {
    filteredParameters = filteredParameters.filter(
      (param) => param.displayCategory === filters.category
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

  // Apply compatibility filters
  if (filters.compatibility) {
    filteredParameters = filteredParameters.filter((param) => {
      const paramCompatibility = param.compatibility;
      if (!paramCompatibility) return true;

      // Filter by compatible materials
      if (filters.compatibility?.materials && filters.compatibility.materials.length > 0) {
        const hasCompatibleMaterial = filters.compatibility.materials.some((material) =>
          paramCompatibility.materials?.includes(material)
        );
        if (!hasCompatibleMaterial) return false;
      }

      // Filter by compatible microbes
      if (filters.compatibility?.microbes && filters.compatibility.microbes.length > 0) {
        const hasCompatibleMicrobe = filters.compatibility.microbes.some((microbe) =>
          paramCompatibility.microbes?.includes(microbe)
        );
        if (!hasCompatibleMicrobe) return false;
      }

      // Filter by compatible environments
      if (filters.compatibility?.environments && filters.compatibility.environments.length > 0) {
        const hasCompatibleEnvironment = filters.compatibility.environments.some((env) =>
          paramCompatibility.environments?.includes(env)
        );
        if (!hasCompatibleEnvironment) return false;
      }

      // Filter by compatible system types
      if (filters.compatibility?.systemTypes && filters.compatibility.systemTypes.length > 0) {
        const hasCompatibleSystem = filters.compatibility.systemTypes.some((system) =>
          paramCompatibility.systemTypes?.includes(system)
        );
        if (!hasCompatibleSystem) return false;
      }

      // Filter by minimum compatibility score
      if (filters.compatibility?.minScore !== undefined) {
        const compatScore = calculateCompatibilityScore(param);
        if (compatScore < filters.compatibility.minScore) return false;
      }

      return true;
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
 * Calculate compatibility score for a parameter
 */
function calculateCompatibilityScore(parameter: Parameter): number {
  const compatibility = parameter.compatibility;
  if (!compatibility) return 0;

  let score = 0;
  score += (compatibility.materials?.length || 0) * 2;
  score += (compatibility.microbes?.length || 0) * 3;
  score += (compatibility.environments?.length || 0) * 1;
  score += (compatibility.systemTypes?.length || 0) * 2;

  return score;
}

/**
 * Check if a parameter is a categorical variable (should be filtered out)
 */
function isCategoricalVariable(unifiedParam: any): boolean {
  const paramName = unifiedParam.name?.toLowerCase() || '';
  const paramId = unifiedParam.id?.toLowerCase() || '';

  // Check if it's a select type (categorical)
  if (unifiedParam.type === 'select') {
    return true;
  }

  // Check if it's a string type without unit (likely categorical)
  if (unifiedParam.type === 'string' && !unifiedParam.unit) {
    return true;
  }

  // If parameter has a unit, it's likely measurable regardless of name patterns
  if (unifiedParam.unit) {
    return false;
  }

  // Specific biological categorical variables to exclude (known dropdown selections)
  const biologicalCategoricalIds = [
    'microbial_species',
    'dominant_species',
    'species_selection',
    'organism_type',
    'bacterial_strain',
    'microbe_selection',
  ];

  if (biologicalCategoricalIds.includes(paramId)) {
    return true;
  }

  // Refined categorical patterns - focus on truly categorical selections
  const categoricalPatterns = [
    'material_type',
    'membrane_type',
    'electrode_type',
    'system_type',
    'configuration_type',
    'method_type',
    'technique_type',
    'source_type',
    'brand_name',
    'model_name',
    'vendor_name',
    'supplier_name',
    'manufacturer_name',
    'selection',
    'choice',
    'option',
  ];

  // Check for categorical patterns in name or ID
  return categoricalPatterns.some(
    (pattern) => paramName.includes(pattern) || paramId.includes(pattern)
  );
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
 * Enhanced parameter validation function
 */
export function validateParameterValue(parameter: any, value: any): boolean {
  if (!parameter || value === null || value === undefined) return false;

  switch (parameter.type) {
    case 'number':
      const numValue = Number(value);
      if (isNaN(numValue)) return false;
      if (parameter.range?.min !== undefined && numValue < parameter.range.min) return false;
      if (parameter.range?.max !== undefined && numValue > parameter.range.max) return false;
      return true;
    case 'select':
      return parameter.options ? parameter.options.includes(value) : false;
    case 'boolean':
      return typeof value === 'boolean';
    case 'string':
      return typeof value === 'string' && value.length > 0;
    case 'array':
      return Array.isArray(value);
    case 'object':
      return typeof value === 'object' && value !== null;
    default:
      return false;
  }
}

/**
 * Enhanced parameter search function
 */
export function searchParametersAdvanced(
  parameters: Parameter[],
  query: string,
  options: {
    includeDescription?: boolean;
    includeUnit?: boolean;
    includeCategory?: boolean;
    includeSubcategory?: boolean;
    caseSensitive?: boolean;
  } = {}
): Parameter[] {
  const {
    includeDescription = true,
    includeUnit = true,
    includeCategory = true,
    includeSubcategory = true,
    caseSensitive = false,
  } = options;

  const searchQuery = caseSensitive ? query : query.toLowerCase();

  return parameters.filter((param) => {
    const paramName = caseSensitive ? param.name : param.name.toLowerCase();
    const paramDescription = caseSensitive
      ? param.description || ''
      : (param.description || '').toLowerCase();
    const paramUnit = caseSensitive ? param.unit || '' : (param.unit || '').toLowerCase();
    const paramCategory = caseSensitive ? param.category : param.category.toLowerCase();
    const paramSubcategory = caseSensitive
      ? param.subcategory || ''
      : (param.subcategory || '').toLowerCase();

    return (
      paramName.includes(searchQuery) ||
      (includeDescription && paramDescription.includes(searchQuery)) ||
      (includeUnit && paramUnit.includes(searchQuery)) ||
      (includeCategory && paramCategory.includes(searchQuery)) ||
      (includeSubcategory && paramSubcategory.includes(searchQuery))
    );
  });
}

/**
 * Get parameter statistics for the dashboard
 */
export function getParameterStatistics(parameters: Parameter[]) {
  const stats = {
    total: parameters.length,
    withUnits: parameters.filter((p) => p.unit && p.unit !== '').length,
    withRanges: parameters.filter(
      (p) => p.range && (p.range.min !== undefined || p.range.max !== undefined)
    ).length,
    withDefaults: parameters.filter((p) => p.default !== undefined).length,
    withTypicalRanges: parameters.filter((p) => p.typicalRange).length,
    byCategory: {} as Record<string, number>,
    byType: {} as Record<string, number>,
    bySubcategory: {} as Record<string, number>,
  };

  // Count by category
  parameters.forEach((param) => {
    const category = param.displayCategory || param.category;
    stats.byCategory[category] = (stats.byCategory[category] || 0) + 1;
  });

  // Count by type
  parameters.forEach((param) => {
    if (param.type) {
      stats.byType[param.type] = (stats.byType[param.type] || 0) + 1;
    }
  });

  // Count by subcategory
  parameters.forEach((param) => {
    if (param.subcategory) {
      stats.bySubcategory[param.subcategory] = (stats.bySubcategory[param.subcategory] || 0) + 1;
    }
  });

  return stats;
}

/**
 * Export parameters in various formats
 */
export function exportParametersAsJSON(parameters: Parameter[]): string {
  return JSON.stringify(parameters, null, 2);
}

export function exportParametersAsCSV(parameters: Parameter[]): string {
  const headers = [
    'ID',
    'Name',
    'Category',
    'Display Category',
    'Subcategory',
    'Description',
    'Unit',
    'Type',
    'Min',
    'Max',
    'Default',
    'Typical Min',
    'Typical Max',
  ];

  const rows = parameters.map((param) => [
    param.id,
    param.name,
    param.category,
    param.displayCategory || '',
    param.subcategory || '',
    param.description || '',
    param.unit || '',
    param.type || '',
    param.range?.min?.toString() || '',
    param.range?.max?.toString() || '',
    param.default?.toString() || '',
    param.typicalRange?.min?.toString() || '',
    param.typicalRange?.max?.toString() || '',
  ]);

  return [headers, ...rows]
    .map((row) => row.map((cell) => `"${cell.toString().replace(/"/g, '""')}"`).join(','))
    .join('\n');
}

/**
 * Get parameter recommendations based on category and current selection
 */
export function getRelatedParameterRecommendations(
  parameter: Parameter,
  allParameters: Parameter[],
  limit: number = 5
): Parameter[] {
  const related = allParameters.filter(
    (p) =>
      p.id !== parameter.id &&
      (p.category === parameter.category ||
        p.subcategory === parameter.subcategory ||
        p.displayCategory === parameter.displayCategory)
  );

  // Sort by relevance (same subcategory first, then category, then display category)
  related.sort((a, b) => {
    if (a.subcategory === parameter.subcategory && b.subcategory !== parameter.subcategory)
      return -1;
    if (b.subcategory === parameter.subcategory && a.subcategory !== parameter.subcategory)
      return 1;
    if (a.category === parameter.category && b.category !== parameter.category) return -1;
    if (b.category === parameter.category && a.category !== parameter.category) return 1;
    return 0;
  });

  return related.slice(0, limit);
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
