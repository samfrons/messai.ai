import type { Parameter } from '../../../types/parameters';

/**
 * Microfluidic Channel Design Parameters
 * These parameters are specific to microfluidic MESS systems
 */
export const MICROFLUIDIC_PARAMETERS: Parameter[] = [
  // Channel Geometry Parameters
  {
    id: 'channel_width',
    name: 'Channel Width',
    category: 'system_configuration',
    displayCategory: 'physical',
    subcategory: 'Microfluidic Design',
    description: 'Width of the microfluidic channel for fluid flow',
    unit: 'μm',
    range: { min: 10, max: 1000 },
    default: 100,
    typicalRange: { min: 50, max: 500 },
    properties: {
      unit: 'μm',
      min: 10,
      max: 1000,
      default: 100,
      typicalMin: 50,
      typicalMax: 500,
      precision: 1,
      tolerance: 5,
    },
    compatibility: {
      materials: ['PDMS', 'Glass', 'Silicon', 'Polymers'],
      microbes: ['E. coli', 'Shewanella', 'Geobacter'],
      environments: ['Aqueous', 'Low ionic strength'],
      systemTypes: ['Microfluidic MFC', 'Lab-on-chip', 'Microscale BES'],
      compatibleWith: [],
      incompatibleWith: [],
    },
    validationRules: ['Must be greater than 10 μm', 'Must be less than 1000 μm'],
    source: 'MESSAI Microfluidic Design Library',
    isSystem: true,
  },
  {
    id: 'channel_height',
    name: 'Channel Height',
    category: 'system_configuration',
    displayCategory: 'physical',
    subcategory: 'Microfluidic Design',
    description: 'Height of the microfluidic channel for fluid flow',
    unit: 'μm',
    range: { min: 5, max: 500 },
    default: 50,
    typicalRange: { min: 20, max: 200 },
    properties: {
      unit: 'μm',
      min: 5,
      max: 500,
      default: 50,
      typicalMin: 20,
      typicalMax: 200,
      precision: 1,
      tolerance: 2,
    },
    compatibility: {
      materials: ['PDMS', 'Glass', 'Silicon', 'Polymers'],
      microbes: ['E. coli', 'Shewanella', 'Geobacter'],
      environments: ['Aqueous', 'Low ionic strength'],
      systemTypes: ['Microfluidic MFC', 'Lab-on-chip', 'Microscale BES'],
      compatibleWith: [],
      incompatibleWith: [],
    },
    validationRules: ['Must be greater than 5 μm', 'Must be less than 500 μm'],
    source: 'MESSAI Microfluidic Design Library',
    isSystem: true,
  },
  {
    id: 'channel_length',
    name: 'Channel Length',
    category: 'system_configuration',
    displayCategory: 'physical',
    subcategory: 'Microfluidic Design',
    description: 'Total length of the microfluidic channel',
    unit: 'mm',
    range: { min: 1, max: 100 },
    default: 20,
    typicalRange: { min: 5, max: 50 },
    properties: {
      unit: 'mm',
      min: 1,
      max: 100,
      default: 20,
      typicalMin: 5,
      typicalMax: 50,
      precision: 0.1,
      tolerance: 0.5,
    },
    compatibility: {
      materials: ['PDMS', 'Glass', 'Silicon', 'Polymers'],
      microbes: ['E. coli', 'Shewanella', 'Geobacter'],
      environments: ['Aqueous', 'Low ionic strength'],
      systemTypes: ['Microfluidic MFC', 'Lab-on-chip', 'Microscale BES'],
      compatibleWith: [],
      incompatibleWith: [],
    },
    validationRules: ['Must be greater than 1 mm', 'Must be less than 100 mm'],
    source: 'MESSAI Microfluidic Design Library',
    isSystem: true,
  },
  {
    id: 'hydraulic_diameter',
    name: 'Hydraulic Diameter',
    category: 'system_configuration',
    displayCategory: 'physical',
    subcategory: 'Microfluidic Design',
    description: 'Hydraulic diameter of the microfluidic channel (4A/P)',
    unit: 'μm',
    range: { min: 10, max: 400 },
    default: 67,
    typicalRange: { min: 30, max: 200 },
    properties: {
      unit: 'μm',
      min: 10,
      max: 400,
      default: 67,
      typicalMin: 30,
      typicalMax: 200,
      precision: 1,
      calculated: true,
    },
    compatibility: {
      materials: ['PDMS', 'Glass', 'Silicon', 'Polymers'],
      microbes: ['E. coli', 'Shewanella', 'Geobacter'],
      environments: ['Aqueous', 'Low ionic strength'],
      systemTypes: ['Microfluidic MFC', 'Lab-on-chip', 'Microscale BES'],
      compatibleWith: [],
      incompatibleWith: [],
    },
    validationRules: ['Calculated from channel dimensions'],
    source: 'MESSAI Microfluidic Design Library',
    isSystem: true,
  },

  // Flow Parameters
  {
    id: 'flow_rate_microfluidic',
    name: 'Microfluidic Flow Rate',
    category: 'operating_condition',
    displayCategory: 'operational',
    subcategory: 'Microfluidic Flow',
    description: 'Volumetric flow rate through microfluidic channels',
    unit: 'μL/min',
    range: { min: 0.1, max: 1000 },
    default: 10,
    typicalRange: { min: 1, max: 100 },
    properties: {
      unit: 'μL/min',
      min: 0.1,
      max: 1000,
      default: 10,
      typicalMin: 1,
      typicalMax: 100,
      precision: 0.1,
      controlPrecision: 0.05,
    },
    compatibility: {
      materials: ['PDMS', 'Glass', 'Silicon'],
      microbes: ['E. coli', 'Shewanella', 'Geobacter'],
      environments: ['Aqueous', 'Buffered'],
      systemTypes: ['Microfluidic MFC', 'Lab-on-chip', 'Microscale BES'],
      compatibleWith: [],
      incompatibleWith: [],
    },
    validationRules: ['Must be greater than 0.1 μL/min', 'Must maintain laminar flow'],
    source: 'MESSAI Microfluidic Design Library',
    isSystem: true,
  },
  {
    id: 'reynolds_number_micro',
    name: 'Reynolds Number (Microfluidic)',
    category: 'operating_condition',
    displayCategory: 'operational',
    subcategory: 'Microfluidic Flow',
    description: 'Reynolds number for microfluidic channel flow',
    unit: '-',
    range: { min: 0.001, max: 10 },
    default: 0.1,
    typicalRange: { min: 0.01, max: 1 },
    properties: {
      unit: '-',
      min: 0.001,
      max: 10,
      default: 0.1,
      typicalMin: 0.01,
      typicalMax: 1,
      precision: 0.001,
      calculated: true,
    },
    compatibility: {
      materials: ['PDMS', 'Glass', 'Silicon'],
      microbes: ['E. coli', 'Shewanella', 'Geobacter'],
      environments: ['Aqueous', 'Buffered'],
      systemTypes: ['Microfluidic MFC', 'Lab-on-chip', 'Microscale BES'],
      compatibleWith: [],
      incompatibleWith: [],
    },
    validationRules: ['Must be less than 2000 for laminar flow'],
    source: 'MESSAI Microfluidic Design Library',
    isSystem: true,
  },
  {
    id: 'residence_time_micro',
    name: 'Residence Time (Microfluidic)',
    category: 'operating_condition',
    displayCategory: 'operational',
    subcategory: 'Microfluidic Flow',
    description: 'Average residence time of fluid in microfluidic channel',
    unit: 'min',
    range: { min: 0.1, max: 60 },
    default: 2,
    typicalRange: { min: 0.5, max: 10 },
    properties: {
      unit: 'min',
      min: 0.1,
      max: 60,
      default: 2,
      typicalMin: 0.5,
      typicalMax: 10,
      precision: 0.1,
      calculated: true,
    },
    compatibility: {
      materials: ['PDMS', 'Glass', 'Silicon'],
      microbes: ['E. coli', 'Shewanella', 'Geobacter'],
      environments: ['Aqueous', 'Buffered'],
      systemTypes: ['Microfluidic MFC', 'Lab-on-chip', 'Microscale BES'],
      compatibleWith: [],
      incompatibleWith: [],
    },
    validationRules: ['Must allow adequate mixing time'],
    source: 'MESSAI Microfluidic Design Library',
    isSystem: true,
  },

  // Electrode Configuration
  {
    id: 'electrode_spacing_micro',
    name: 'Electrode Spacing (Microfluidic)',
    category: 'system_configuration',
    displayCategory: 'physical',
    subcategory: 'Microfluidic Electrodes',
    description: 'Distance between anode and cathode in microfluidic channel',
    unit: 'μm',
    range: { min: 10, max: 1000 },
    default: 100,
    typicalRange: { min: 50, max: 500 },
    properties: {
      unit: 'μm',
      min: 10,
      max: 1000,
      default: 100,
      typicalMin: 50,
      typicalMax: 500,
      precision: 1,
      tolerance: 5,
    },
    compatibility: {
      materials: ['Gold', 'Platinum', 'Carbon', 'ITO'],
      microbes: ['E. coli', 'Shewanella', 'Geobacter'],
      environments: ['Aqueous', 'Buffered'],
      systemTypes: ['Microfluidic MFC', 'Lab-on-chip', 'Microscale BES'],
      compatibleWith: [],
      incompatibleWith: [],
    },
    validationRules: ['Must be greater than 10 μm', 'Must fit within channel width'],
    source: 'MESSAI Microfluidic Design Library',
    isSystem: true,
  },
  {
    id: 'electrode_width_micro',
    name: 'Electrode Width (Microfluidic)',
    category: 'system_configuration',
    displayCategory: 'physical',
    subcategory: 'Microfluidic Electrodes',
    description: 'Width of microelectrodes in microfluidic channel',
    unit: 'μm',
    range: { min: 5, max: 500 },
    default: 50,
    typicalRange: { min: 20, max: 200 },
    properties: {
      unit: 'μm',
      min: 5,
      max: 500,
      default: 50,
      typicalMin: 20,
      typicalMax: 200,
      precision: 1,
      tolerance: 2,
    },
    compatibility: {
      materials: ['Gold', 'Platinum', 'Carbon', 'ITO'],
      microbes: ['E. coli', 'Shewanella', 'Geobacter'],
      environments: ['Aqueous', 'Buffered'],
      systemTypes: ['Microfluidic MFC', 'Lab-on-chip', 'Microscale BES'],
      compatibleWith: [],
      incompatibleWith: [],
    },
    validationRules: ['Must be greater than 5 μm', 'Must be less than channel width'],
    source: 'MESSAI Microfluidic Design Library',
    isSystem: true,
  },
  {
    id: 'electrode_thickness_micro',
    name: 'Electrode Thickness (Microfluidic)',
    category: 'system_configuration',
    displayCategory: 'physical',
    subcategory: 'Microfluidic Electrodes',
    description: 'Thickness of deposited electrodes in microfluidic device',
    unit: 'nm',
    range: { min: 50, max: 5000 },
    default: 200,
    typicalRange: { min: 100, max: 1000 },
    properties: {
      unit: 'nm',
      min: 50,
      max: 5000,
      default: 200,
      typicalMin: 100,
      typicalMax: 1000,
      precision: 1,
      tolerance: 10,
    },
    compatibility: {
      materials: ['Gold', 'Platinum', 'Carbon', 'ITO'],
      microbes: ['E. coli', 'Shewanella', 'Geobacter'],
      environments: ['Aqueous', 'Buffered'],
      systemTypes: ['Microfluidic MFC', 'Lab-on-chip', 'Microscale BES'],
      compatibleWith: [],
      incompatibleWith: [],
    },
    validationRules: ['Must be greater than 50 nm', 'Must provide adequate conductivity'],
    source: 'MESSAI Microfluidic Design Library',
    isSystem: true,
  },

  // Fabrication Parameters
  {
    id: 'pdms_thickness',
    name: 'PDMS Layer Thickness',
    category: 'system_configuration',
    displayCategory: 'physical',
    subcategory: 'Microfluidic Fabrication',
    description: 'Thickness of PDMS layer in microfluidic device',
    unit: 'mm',
    range: { min: 0.5, max: 10 },
    default: 2,
    typicalRange: { min: 1, max: 5 },
    properties: {
      unit: 'mm',
      min: 0.5,
      max: 10,
      default: 2,
      typicalMin: 1,
      typicalMax: 5,
      precision: 0.1,
      tolerance: 0.1,
    },
    compatibility: {
      materials: ['PDMS', 'Glass substrate'],
      microbes: ['E. coli', 'Shewanella', 'Geobacter'],
      environments: ['Aqueous', 'Buffered'],
      systemTypes: ['Microfluidic MFC', 'Lab-on-chip', 'Microscale BES'],
      compatibleWith: [],
      incompatibleWith: [],
    },
    validationRules: ['Must be greater than 0.5 mm for structural integrity'],
    source: 'MESSAI Microfluidic Design Library',
    isSystem: true,
  },
  {
    id: 'surface_treatment',
    name: 'Surface Treatment',
    category: 'system_configuration',
    displayCategory: 'chemical',
    subcategory: 'Microfluidic Fabrication',
    description: 'Surface treatment method for microfluidic channels',
    unit: '-',
    properties: {
      options: [
        'Plasma treatment',
        'Silanization',
        'Hydrophilic coating',
        'Hydrophobic coating',
        'Biocompatible coating',
        'None',
      ],
      default: 'Plasma treatment',
    },
    compatibility: {
      materials: ['PDMS', 'Glass', 'Silicon', 'Polymers'],
      microbes: ['E. coli', 'Shewanella', 'Geobacter'],
      environments: ['Aqueous', 'Buffered'],
      systemTypes: ['Microfluidic MFC', 'Lab-on-chip', 'Microscale BES'],
      compatibleWith: [],
      incompatibleWith: [],
    },
    validationRules: ['Must be compatible with biological systems'],
    source: 'MESSAI Microfluidic Design Library',
    isSystem: true,
  },
  {
    id: 'bonding_method',
    name: 'Bonding Method',
    category: 'system_configuration',
    displayCategory: 'operational',
    subcategory: 'Microfluidic Fabrication',
    description: 'Method used to bond microfluidic layers',
    unit: '-',
    properties: {
      options: [
        'Plasma bonding',
        'Thermal bonding',
        'Adhesive bonding',
        'UV bonding',
        'Anodic bonding',
        'Solvent bonding',
      ],
      default: 'Plasma bonding',
    },
    compatibility: {
      materials: ['PDMS', 'Glass', 'Silicon', 'Polymers'],
      microbes: ['E. coli', 'Shewanella', 'Geobacter'],
      environments: ['Aqueous', 'Buffered'],
      systemTypes: ['Microfluidic MFC', 'Lab-on-chip', 'Microscale BES'],
      compatibleWith: [],
      incompatibleWith: [],
    },
    validationRules: ['Must provide leak-proof seal'],
    source: 'MESSAI Microfluidic Design Library',
    isSystem: true,
  },

  // Performance Parameters
  {
    id: 'power_density_micro',
    name: 'Power Density (Microfluidic)',
    category: 'operating_condition',
    displayCategory: 'performance',
    subcategory: 'Microfluidic Performance',
    description: 'Power output per unit electrode area in microfluidic MFC',
    unit: 'μW/cm²',
    range: { min: 0.1, max: 100 },
    default: 5,
    typicalRange: { min: 1, max: 20 },
    properties: {
      unit: 'μW/cm²',
      min: 0.1,
      max: 100,
      default: 5,
      typicalMin: 1,
      typicalMax: 20,
      precision: 0.1,
      calculated: true,
    },
    compatibility: {
      materials: ['Gold', 'Platinum', 'Carbon', 'ITO'],
      microbes: ['E. coli', 'Shewanella', 'Geobacter'],
      environments: ['Aqueous', 'Buffered'],
      systemTypes: ['Microfluidic MFC', 'Lab-on-chip', 'Microscale BES'],
      compatibleWith: [],
      incompatibleWith: [],
    },
    validationRules: ['Must be measurable above noise level'],
    source: 'MESSAI Microfluidic Design Library',
    isSystem: true,
  },
  {
    id: 'mixing_efficiency',
    name: 'Mixing Efficiency',
    category: 'operating_condition',
    displayCategory: 'performance',
    subcategory: 'Microfluidic Performance',
    description: 'Efficiency of mixing in microfluidic channel',
    unit: '%',
    range: { min: 10, max: 100 },
    default: 70,
    typicalRange: { min: 50, max: 90 },
    properties: {
      unit: '%',
      min: 10,
      max: 100,
      default: 70,
      typicalMin: 50,
      typicalMax: 90,
      precision: 1,
      calculated: true,
    },
    compatibility: {
      materials: ['PDMS', 'Glass', 'Silicon'],
      microbes: ['E. coli', 'Shewanella', 'Geobacter'],
      environments: ['Aqueous', 'Buffered'],
      systemTypes: ['Microfluidic MFC', 'Lab-on-chip', 'Microscale BES'],
      compatibleWith: [],
      incompatibleWith: [],
    },
    validationRules: ['Must be sufficient for biological activity'],
    source: 'MESSAI Microfluidic Design Library',
    isSystem: true,
  },
];

/**
 * Get microfluidic parameters by category
 */
export function getMicrofluidicParametersByCategory(category: string): Parameter[] {
  return MICROFLUIDIC_PARAMETERS.filter(
    (param) => param.subcategory?.includes(category) || param.displayCategory === category
  );
}

/**
 * Get microfluidic parameter by ID
 */
export function getMicrofluidicParameterById(id: string): Parameter | undefined {
  return MICROFLUIDIC_PARAMETERS.find((param) => param.id === id);
}

/**
 * Get all microfluidic subcategories
 */
export function getMicrofluidicSubcategories(): string[] {
  const subcategories = new Set<string>();
  MICROFLUIDIC_PARAMETERS.forEach((param) => {
    if (param.subcategory) {
      subcategories.add(param.subcategory);
    }
  });
  return Array.from(subcategories);
}

/**
 * Validate microfluidic channel dimensions
 */
export function validateChannelDimensions(
  width: number,
  height: number,
  length: number
): {
  valid: boolean;
  warnings: string[];
  errors: string[];
} {
  const warnings: string[] = [];
  const errors: string[] = [];

  // Check minimum dimensions
  if (width < 10) errors.push('Channel width must be at least 10 μm');
  if (height < 5) errors.push('Channel height must be at least 5 μm');
  if (length < 1) errors.push('Channel length must be at least 1 mm');

  // Check aspect ratio
  const aspectRatio = width / height;
  if (aspectRatio > 10) warnings.push('High aspect ratio may cause fabrication issues');
  if (aspectRatio < 0.5) warnings.push('Low aspect ratio may cause flow issues');

  // Check for reasonable dimensions
  if (width > 500) warnings.push('Large channel width may reduce mixing efficiency');
  if (height > 200) warnings.push('Large channel height may reduce surface area to volume ratio');

  return {
    valid: errors.length === 0,
    warnings,
    errors,
  };
}

/**
 * Calculate hydraulic diameter
 */
export function calculateHydraulicDiameter(width: number, height: number): number {
  // Hydraulic diameter = 4 * Area / Perimeter
  const area = width * height;
  const perimeter = 2 * (width + height);
  return (4 * area) / perimeter;
}

/**
 * Calculate Reynolds number for microfluidic flow
 */
export function calculateReynoldsNumber(
  flowRate: number, // μL/min
  hydraulicDiameter: number, // μm
  viscosity: number = 0.001 // Pa·s (water at 20°C)
): number {
  // Convert units
  const flowRateM3s = (flowRate * 1e-9) / 60; // μL/min to m³/s
  const diameterM = hydraulicDiameter * 1e-6; // μm to m
  const density = 1000; // kg/m³ (water)

  // Calculate velocity
  const area = Math.PI * Math.pow(diameterM / 2, 2);
  const velocity = flowRateM3s / area;

  // Reynolds number = (density * velocity * diameter) / viscosity
  return (density * velocity * diameterM) / viscosity;
}

/**
 * Calculate residence time
 */
export function calculateResidenceTime(
  channelVolume: number, // μL
  flowRate: number // μL/min
): number {
  return channelVolume / flowRate; // minutes
}
