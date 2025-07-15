/**
 * Parameter types for MESSAI platform
 * Extends existing prediction types with full parameter management
 */

// Parameter categories as defined in the unified schema
export type ParameterCategory =
  | 'electrode'
  | 'microbe'
  | 'substrate'
  | 'operating_condition'
  | 'system_configuration'
  | 'membrane';

// New display categories for UI
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

// Unified parameter data types
export type UnifiedParameterType = 'number' | 'string' | 'boolean' | 'select' | 'array' | 'object';

// Electrode subcategory types
export type ElectrodeType = 'anode' | 'cathode' | 'both';

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

// Base parameter interface matching unified schema
export interface Parameter {
  id: string;
  name: string;
  category: ParameterCategory;
  displayCategory?: DisplayCategory; // New display category for UI
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
  // Unified schema properties
  unit?: string;
  range?: ParameterRange;
  default?: any;
  typicalRange?: ParameterRange;
  validationRules?: string[];
  dependencies?: string[];
  references?: string[];
  outlierThreshold?: number;
}

// Parameter range interface
export interface ParameterRange {
  min?: number;
  max?: number;
}

// Unified parameter from JSON schema
export interface UnifiedParameter {
  id: string;
  name: string;
  unit?: string;
  type: UnifiedParameterType;
  range?: ParameterRange;
  options?: string[];
  default?: any;
  description: string;
  dependencies?: string[];
  references?: string[];
  validation_rules?: string[];
  typical_range?: ParameterRange;
  outlier_threshold?: number;
  compatibility?: UnifiedCompatibility;
  properties?: Record<string, any>;
  pattern?: string;
}

// Unified compatibility structure
export interface UnifiedCompatibility {
  materials?: string[];
  microbes?: string[];
  environments?: string[];
  systemTypes?: string[];
}

// Category structure from unified data
export interface ParameterCategoryData {
  id: string;
  name: string;
  icon?: string;
  description: string;
  subcategories: SubcategoryData[];
}

// Subcategory structure
export interface SubcategoryData {
  id: string;
  name: string;
  description?: string;
  electrodeType?: ElectrodeType;
  parameters: UnifiedParameter[];
  parameterCount?: number;
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

// Enhanced compatibility with unified schema support
export interface CompatibilityData {
  compatibleWith: CompatibilityScore[];
  incompatibleWith: string[]; // Parameter IDs
  notes?: string;
  // From unified schema
  materials?: string[];
  microbes?: string[];
  environments?: string[];
  systemTypes?: string[];
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

// Enhanced filter interface with unified schema support
export interface ParameterFilter {
  query?: string;
  category?: DisplayCategory | null;
  subcategory?: string | null;
  subcategoryId?: string | null;
  type?: ParameterType | null;
  electrodeType?: ElectrodeType | null;
  properties?: {
    [key: string]: {
      min?: number;
      max?: number;
    };
  };
  compatibility?: {
    compatibleWith?: string[];
    minScore?: number;
    materials?: string[];
    microbes?: string[];
    environments?: string[];
    systemTypes?: string[];
  };
  onlyCustom?: boolean;
  onlySystem?: boolean;
  hasValidationRules?: boolean;
  hasTypicalRange?: boolean;
}

// Enhanced search results with unified schema facets
export interface ParameterSearchResults {
  parameters: Parameter[];
  total: number;
  page: number;
  pageSize: number;
  facets?: {
    categories: Array<{ value: string; count: number }>;
    subcategories: Array<{ value: string; count: number }>;
    types: Array<{ value: string; count: number }>;
    electrodeTypes: Array<{ value: string; count: number }>;
    unitsUsed: Array<{ value: string; count: number }>;
    propertyRanges: {
      [key: string]: { min: number; max: number };
    };
    compatibilityOptions: {
      materials: Array<{ value: string; count: number }>;
      microbes: Array<{ value: string; count: number }>;
      environments: Array<{ value: string; count: number }>;
      systemTypes: Array<{ value: string; count: number }>;
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
  message?: string;
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

// Enhanced sort options
export type ParameterSortOption =
  | 'relevance'
  | 'name'
  | 'category'
  | 'subcategory'
  | 'recent'
  | 'usage'
  | 'performance'
  | 'alphabetical'
  | 'unit'
  | 'rangeSize';

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

// Parameter detail page types
export interface ParameterDetail extends Parameter {
  categoryName?: string;
  subcategoryId?: string;
  electrodeType?: ElectrodeType;
  content?: ParameterSection[];
  // Core detail sections (all parameters)
  definition?: Definition;
  typicalValues?: TypicalValues;
  measurementMethods?: MeasurementMethod[];
  affectingFactors?: AffectingFactors;
  performanceImpact?: PerformanceImpact;
  compatibleSystems?: CompatibleSystems;
  limitations?: Limitations;
  detailValidationRules?: ValidationRules;
  detailReferences?: Reference[];
  performanceMetrics?: any; // Legacy property for backward compatibility
  // Category-specific sections
  compositionStructure?: CompositionStructure; // Materials
  electrochemicalProperties?: ElectrochemicalProperties; // Materials
  preparationMethods?: PreparationMethod[];
  alternativeSystems?: AlternativeSystem[]; // Materials
  costAnalysis?: CostAnalysis;
  speciesConsiderations?: SpeciesConsideration[]; // Biological
  transferMechanisms?: TransferMechanism[]; // Biological
  molecularBiology?: MolecularBiology; // Biological
  formula?: Formula; // Electrical
  relatedParameters?: RelatedParameter[];
  applicationNotes?: ApplicationNote[]; // Electrical
}

// Core section interfaces
export interface Definition {
  text: string;
  formula?: string;
  variables?: Array<{
    symbol: string;
    description: string;
    unit?: string;
  }>;
}

export interface TypicalValues {
  range?: ParameterRange;
  typical?: number | string;
  outlierThreshold?: number;
  categories?: Array<{
    name: string;
    range: string;
    description?: string;
  }>;
  distribution?: Array<{
    type: string;
    percentage: string;
    description?: string;
  }>;
}

export interface MeasurementMethod {
  name: string;
  type?: string;
  description: string;
  equipment?: string[];
  conditions?: string;
  accuracy?: string;
}

export interface AffectingFactors {
  primary: Factor[];
  secondary?: Factor[];
}

export interface Factor {
  name: string;
  description: string;
  impact?: string;
  optimalRange?: string;
}

export interface PerformanceImpact {
  metrics?: Array<{
    name: string;
    impact: string;
    correlation?: string;
  }>;
  efficiency?: Array<{
    type: string;
    range: string;
    conditions?: string;
  }>;
  stability?: string;
}

export interface CompatibleSystems {
  operatingConditions?: Array<{
    parameter: string;
    range: string;
    optimal?: string;
  }>;
  applications?: Array<{
    name: string;
    description?: string;
    suitability?: string;
  }>;
  environments?: string[];
}

export interface Limitations {
  performance?: string[];
  practical?: string[];
  safety?: string[];
  environmental?: string[];
}

export interface ValidationRules {
  parameters?: Array<{
    name: string;
    rule: string;
    reason?: string;
  }>;
  qualityControl?: Array<{
    test: string;
    method: string;
    criteria?: string;
  }>;
  standards?: string[];
}

// Materials-specific interfaces
export interface CompositionStructure {
  chemicalFormula?: string;
  structure?: string;
  physicalProperties?: Array<{
    property: string;
    value: string;
    unit?: string;
  }>;
  morphology?: string;
}

export interface ElectrochemicalProperties {
  properties?: Array<{
    name: string;
    value: string;
    conditions?: string;
  }>;
  advancedProperties?: Array<{
    name: string;
    value: string;
    significance?: string;
  }>;
}

export interface AlternativeSystem {
  name: string;
  type?: string;
  materials?: string[];
  advantages?: string[];
  limitations?: string[];
}

// Biological-specific interfaces
export interface SpeciesConsideration {
  species: string;
  mechanism?: string;
  efficiency?: string;
  characteristics?: Array<{
    property: string;
    value: string;
  }>;
  proteins?: string[];
}

export interface TransferMechanism {
  type: string;
  description: string;
  efficiency?: string;
  species?: string[];
}

export interface MolecularBiology {
  geneExpression?: string[];
  proteins?: Array<{
    name: string;
    function: string;
  }>;
  pathways?: string[];
}

// Electrical-specific interfaces
export interface Formula {
  equation: string;
  variables: Array<{
    symbol: string;
    description: string;
    unit: string;
  }>;
  derivation?: string;
}

export interface ApplicationNote {
  scale: string;
  typicalRange?: string;
  considerations?: string[];
  targets?: string[];
}

// Enhanced existing interfaces
export interface ParameterSection {
  title: string;
  level: number;
  content: string;
  parent?: string;
  type?: string; // To identify section type for rendering
}

export interface Reference {
  text: string;
  doi?: string;
  url?: string;
  year?: number;
  authors?: string[];
  category?: string; // e.g., "Key Literature", "Recent Advances"
}

export interface PreparationMethod {
  name: string;
  type?: string;
  steps: string[];
  conditions?: string;
  equipment?: string[];
  safety?: string[];
}

export interface PerformanceMetric {
  [key: string]: {
    min: number;
    max: number;
    unit: string;
  };
}

export interface CostAnalysis {
  summary?: string;
  breakdown?: Array<{
    item: string;
    cost: string;
    unit?: string;
    notes?: string;
  }>;
  factors?: string[];
  economicAdvantages?: string[];
  futureProjections?: string[];
}

export interface RelatedParameter {
  id: string;
  name: string;
  category?: string;
  relationship?: string; // e.g., "direct", "inverse", "dependent"
  description?: string;
}
