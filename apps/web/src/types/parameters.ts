/**
 * Parameter types for MESSAI platform
 * Extends existing prediction types with full parameter management
 */

// Parameter categories as defined in requirements
export type ParameterCategory =
  | 'electrode'
  | 'microbe'
  | 'substrate'
  | 'operating_condition'
  | 'system_configuration'
  | 'membrane'
  | 'separator'
  | 'proton_exchange'
  | 'cation_exchange';

// Parameter types within categories
export type ParameterType =
  | 'anode'
  | 'cathode'
  | 'reference'
  | 'bacteria'
  | 'algae'
  | 'yeast'
  | 'organic'
  | 'inorganic'
  | 'synthetic'
  | 'proton_exchange'
  | 'cation_exchange';

// Base parameter interface
export interface Parameter {
  id: string;
  name: string;
  category: ParameterCategory;
  subcategory?: string; // From parameter library classification
  subcategoryCode?: string; // Code for programmatic access
  type?: ParameterType;
  description?: string;
  properties: ParameterProperties;
  compatibility?: CompatibilityData;
  source?: string;
  isSystem: boolean;
  userId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Dynamic properties based on category
export interface ParameterProperties {
  // Electrode properties
  conductivity?: number; // S/m
  surfaceArea?: number; // m²/g
  porosity?: number; // %
  thickness?: number; // mm
  resistance?: number; // Ω

  // Material properties
  cost?: number; // $/kg
  density?: number; // g/cm³
  durability?: number; // months
  biocompatibility?: number; // 0-1 score

  // Microbial properties
  electronTransferRate?: number; // electrons/s
  substrateAffinity?: number; // mM
  growthRate?: number; // 1/h
  optimalTemperature?: number; // °C
  temperatureRange?: [number, number]; // [min, max] °C
  optimalPH?: number;
  phRange?: [number, number]; // [min, max]

  // Operating conditions
  temperature?: number; // °C
  ph?: number;
  flowRate?: number; // mL/min
  pressure?: number; // kPa
  voltage?: number; // V
  current?: number; // mA

  // Substrate properties
  concentration?: number; // g/L
  cod?: number; // mg/L
  bod?: number; // mg/L

  // Calculated properties
  powerDensity?: number; // W/m²
  energyEfficiency?: number; // %
  coulombicEfficiency?: number; // %

  // Generic properties for extensibility
  [key: string]: any;
}

// Compatibility scoring
export interface CompatibilityData {
  compatibleWith: CompatibilityScore[];
  incompatibleWith: string[]; // Parameter IDs
  notes?: string;
}

export interface CompatibilityScore {
  parameterId: string;
  score: number; // 0-100
  factors?: {
    biocompatibility?: number;
    electrochemical?: number;
    physical?: number;
    environmental?: number;
  };
  explanation?: string;
}

// Filter interface for search
export interface ParameterFilter {
  query?: string;
  category?: ParameterCategory | null;
  subcategory?: string | null;
  type?: ParameterType | null;
  properties?: {
    [key: string]: {
      min?: number;
      max?: number;
    };
  };
  compatibility?: {
    compatibleWith?: string[];
    minScore?: number;
  };
  onlyCustom?: boolean;
  onlySystem?: boolean;
}

// Search results
export interface ParameterSearchResults {
  parameters: Parameter[];
  total: number;
  page: number;
  pageSize: number;
  facets?: {
    categories: Array<{ value: string; count: number }>;
    types: Array<{ value: string; count: number }>;
    propertyRanges: {
      [key: string]: { min: number; max: number };
    };
  };
}

// Bulk import/export
export interface ParameterImport {
  name: string;
  category: ParameterCategory;
  type?: ParameterType;
  description?: string;
  properties: Record<string, any>;
  source?: string;
}

export interface ImportResult {
  success: number;
  failed: number;
  errors: Array<{
    row: number;
    parameter: string;
    errors: string[];
  }>;
}

// Property calculation inputs/outputs
export interface DerivedProperties {
  powerDensity?: number;
  energyEfficiency?: number;
  coulombicEfficiency?: number;
  costPerWatt?: number;
  theoreticalVoltage?: number;
}

export interface PropertyCalculationInput {
  category: ParameterCategory;
  baseProperties: Partial<ParameterProperties>;
}

// Extended parameter with calculations
export interface EnhancedParameter extends Parameter {
  derivedProperties?: DerivedProperties;
  performanceScore?: number;
  usageCount?: number;
  lastUsed?: Date;
}

// Parameter validation rules
export interface ValidationRule {
  property: string;
  min?: number;
  max?: number;
  required?: boolean;
  unit?: string;
  scientificConstraint?: string;
}

export interface ParameterValidation {
  [category: string]: {
    [property: string]: ValidationRule;
  };
}

// Parameter presets/templates
export interface ParameterPreset {
  id: string;
  name: string;
  description: string;
  category: ParameterCategory;
  properties: ParameterProperties;
  isDefault?: boolean;
}

// Sort options
export type ParameterSortOption =
  | 'relevance'
  | 'name'
  | 'category'
  | 'recent'
  | 'usage'
  | 'performance';

// API request/response types
export interface CreateParameterRequest {
  name: string;
  category: ParameterCategory;
  type?: ParameterType;
  description?: string;
  properties: ParameterProperties;
  source?: string;
}

export interface UpdateParameterRequest {
  name?: string;
  description?: string;
  properties?: Partial<ParameterProperties>;
  source?: string;
}

export interface ParameterListRequest {
  filters?: ParameterFilter;
  sort?: ParameterSortOption;
  page?: number;
  pageSize?: number;
}
