/**
 * Parameter category mapping service
 * Maps unified JSON categories to display categories
 */

export type DisplayCategory =
  | 'environmental'
  | 'biological'
  | 'electrical'
  | 'materials'
  | 'chemical'
  | 'operational'
  | 'physical'
  | 'monitoring'
  | 'economic'
  | 'performance'
  | 'safety';

export const PARAMETER_CATEGORIES: Record<DisplayCategory, string> = {
  environmental: 'Environmental',
  biological: 'Biological',
  electrical: 'Electrical',
  materials: 'Materials',
  chemical: 'Chemical',
  operational: 'Operational',
  physical: 'Physical',
  monitoring: 'Monitoring',
  economic: 'Economic',
  performance: 'Performance',
  safety: 'Safety',
} as const;

export const CATEGORY_DESCRIPTIONS: Record<DisplayCategory, string> = {
  environmental: 'Temperature, pressure, humidity, and atmospheric conditions',
  biological: 'Microorganisms, biofilm properties, and metabolic parameters',
  electrical: 'Voltage, current, power, and electrochemical properties',
  materials: 'Electrodes, membranes, separators, and material properties',
  chemical: 'Chemical composition, concentrations, and reactions',
  operational: 'Operating conditions, flow rates, and process parameters',
  physical: 'Dimensions, geometry, surface area, and mechanical properties',
  monitoring: 'Sensors, control systems, and measurement parameters',
  economic: 'Cost analysis, ROI, and economic sustainability metrics',
  performance: 'Efficiency, optimization, and performance indicators',
  safety: 'Risk assessment, regulatory compliance, and safety parameters',
};

// Map unified JSON categories to display categories
export const UNIFIED_CATEGORY_MAPPINGS: Record<string, DisplayCategory> = {
  'environmental-parameters': 'environmental',
  'biological-parameters': 'biological',
  'material-parameters': 'materials',
  'operational-parameters': 'operational',
  'monitoring-control-parameters': 'monitoring',
  'economic-sustainability-parameters': 'economic',
  'performance-metrics': 'performance',
  'safety-regulatory-parameters': 'safety',
  'cell-level-parameters': 'physical',
  'reactor-level-parameters': 'physical',
  'application-specific-parameters': 'operational',
  'emerging-technology-parameters': 'materials',
  'integration-scaling-parameters': 'operational',
};

// Electrical parameter patterns
const ELECTRICAL_PATTERNS = [
  'voltage',
  'current',
  'power',
  'resistance',
  'conductivity',
  'capacitance',
  'impedance',
  'potential',
  'coulombic',
  'faradaic',
  'electrochemical',
  'overpotential',
  'polarization',
  'exchange_current',
  'tafel',
  'cyclic_voltammetry',
];

// Chemical parameter patterns
const CHEMICAL_PATTERNS = [
  'cod',
  'bod',
  'concentration',
  'ph',
  'alkalinity',
  'acidity',
  'salinity',
  'tds',
  'tss',
  'vfa',
  'acetate',
  'propionate',
  'butyrate',
  'glucose',
  'lactate',
  'ethanol',
  'methanol',
  'formate',
  'sulfate',
  'nitrate',
  'phosphate',
  'ammonia',
  'organic_acid',
  'substrate_concentration',
];

// Physical parameter patterns
const PHYSICAL_PATTERNS = [
  'area',
  'volume',
  'thickness',
  'diameter',
  'length',
  'width',
  'height',
  'porosity',
  'pore_size',
  'surface_area',
  'roughness',
  'density',
  'weight',
  'mass',
  'geometry',
  'dimension',
  'spacing',
  'distance',
  'angle',
  'curvature',
  'aspect_ratio',
];

// Performance parameter patterns
const PERFORMANCE_PATTERNS = [
  'efficiency',
  'yield',
  'recovery',
  'removal',
  'conversion',
  'selectivity',
  'productivity',
  'throughput',
  'capacity',
  'utilization',
  'optimization',
  'maximum',
  'minimum',
  'peak',
  'average',
  'stability',
  'durability',
];

// Economic parameter patterns
const ECONOMIC_PATTERNS = [
  'cost',
  'price',
  'economic',
  'financial',
  'investment',
  'roi',
  'payback',
  'opex',
  'capex',
  'maintenance',
  'replacement',
  'lifecycle',
  'market',
  'value',
  'benefit',
  'profit',
  'revenue',
  'expense',
];

// Safety parameter patterns
const SAFETY_PATTERNS = [
  'safety',
  'hazard',
  'risk',
  'toxic',
  'exposure',
  'threshold',
  'limit',
  'regulation',
  'compliance',
  'standard',
  'certification',
  'assessment',
  'protection',
  'emergency',
  'alarm',
  'warning',
  'critical',
];

// Monitoring parameter patterns
const MONITORING_PATTERNS = [
  'sensor',
  'measurement',
  'detection',
  'monitoring',
  'control',
  'feedback',
  'setpoint',
  'alarm',
  'signal',
  'data',
  'logging',
  'recording',
  'sampling',
  'frequency',
  'resolution',
  'accuracy',
  'precision',
  'calibration',
  'drift',
  'response_time',
];

/**
 * Determine the display category for a parameter
 */
export function getParameterCategory(parameter: any, unifiedCategoryId: string): DisplayCategory {
  const paramId = parameter.id.toLowerCase();
  const paramName = parameter.name.toLowerCase();
  const paramDescription = (parameter.description || '').toLowerCase();

  // Check for specific patterns in parameter ID, name, and description
  const searchText = `${paramId} ${paramName} ${paramDescription}`;

  // Check electrical patterns first (high priority)
  if (ELECTRICAL_PATTERNS.some((pattern) => searchText.includes(pattern))) {
    return 'electrical';
  }

  // Check chemical patterns
  if (CHEMICAL_PATTERNS.some((pattern) => searchText.includes(pattern))) {
    return 'chemical';
  }

  // Check physical patterns
  if (PHYSICAL_PATTERNS.some((pattern) => searchText.includes(pattern))) {
    return 'physical';
  }

  // Check performance patterns
  if (PERFORMANCE_PATTERNS.some((pattern) => searchText.includes(pattern))) {
    return 'performance';
  }

  // Check economic patterns
  if (ECONOMIC_PATTERNS.some((pattern) => searchText.includes(pattern))) {
    return 'economic';
  }

  // Check safety patterns
  if (SAFETY_PATTERNS.some((pattern) => searchText.includes(pattern))) {
    return 'safety';
  }

  // Check monitoring patterns
  if (MONITORING_PATTERNS.some((pattern) => searchText.includes(pattern))) {
    return 'monitoring';
  }

  // Fall back to unified category mapping
  return UNIFIED_CATEGORY_MAPPINGS[unifiedCategoryId] || 'operational';
}

/**
 * Get secondary categories for a parameter (multi-category support)
 */
export function getSecondaryCategories(
  parameter: any,
  primaryCategory: DisplayCategory
): DisplayCategory[] {
  const paramId = parameter.id.toLowerCase();
  const paramName = parameter.name.toLowerCase();
  const paramDescription = (parameter.description || '').toLowerCase();
  const searchText = `${paramId} ${paramName} ${paramDescription}`;

  const secondaryCategories: DisplayCategory[] = [];

  // Power density can be both electrical and performance
  if (primaryCategory === 'electrical' && searchText.includes('density')) {
    secondaryCategories.push('performance');
  }

  // Biofilm conductivity can be both biological and electrical
  if (primaryCategory === 'biological' && searchText.includes('conductivity')) {
    secondaryCategories.push('electrical');
  }

  // Cost-related parameters can be both their primary category and economic
  if (primaryCategory !== 'economic' && searchText.includes('cost')) {
    secondaryCategories.push('economic');
  }

  // Efficiency parameters can be both their primary category and performance
  if (primaryCategory !== 'performance' && searchText.includes('efficiency')) {
    secondaryCategories.push('performance');
  }

  // Safety-related parameters can be both their primary category and safety
  if (
    primaryCategory !== 'safety' &&
    (searchText.includes('safety') || searchText.includes('hazard'))
  ) {
    secondaryCategories.push('safety');
  }

  return secondaryCategories;
}

/**
 * Get all categories (primary + secondary) for a parameter
 */
export function getParameterCategories(
  parameter: any,
  unifiedCategoryId: string
): { primary: DisplayCategory; secondary: DisplayCategory[] } {
  const primary = getParameterCategory(parameter, unifiedCategoryId);
  const secondary = getSecondaryCategories(parameter, primary);

  return { primary, secondary };
}

/**
 * Get category statistics
 */
export function getCategoryStats(parameters: any[]): Record<DisplayCategory, number> {
  const stats: Record<DisplayCategory, number> = {
    environmental: 0,
    biological: 0,
    electrical: 0,
    materials: 0,
    chemical: 0,
    operational: 0,
    physical: 0,
    monitoring: 0,
    economic: 0,
    performance: 0,
    safety: 0,
  };

  parameters.forEach((param) => {
    const { primary, secondary } = getParameterCategories(param, param.categoryId);
    stats[primary]++;
    secondary.forEach((cat) => stats[cat]++);
  });

  return stats;
}

/**
 * Filter parameters by category
 */
export function filterParametersByCategory(parameters: any[], category: DisplayCategory): any[] {
  return parameters.filter((param) => {
    const { primary, secondary } = getParameterCategories(param, param.categoryId);
    return primary === category || secondary.includes(category);
  });
}

/**
 * Get all available categories with counts
 */
export function getAvailableCategories(parameters: any[]): Array<{
  key: DisplayCategory;
  label: string;
  count: number;
  description: string;
}> {
  const stats = getCategoryStats(parameters);

  return Object.entries(PARAMETER_CATEGORIES).map(([key, label]) => ({
    key: key as DisplayCategory,
    label,
    count: stats[key as DisplayCategory],
    description: CATEGORY_DESCRIPTIONS[key as DisplayCategory],
  }));
}
