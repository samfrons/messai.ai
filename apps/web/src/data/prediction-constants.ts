/**
 * MESSAI Prediction Engine Constants
 * Based on 1500+ MESS parameters and research database
 */

import type {
  MessSystemConfiguration,
  ElectrodeMaterial,
  MicrobialSpecies,
  PresetConfiguration,
} from '../types/predictions';

// System Configurations
export const SYSTEM_CONFIGURATIONS: MessSystemConfiguration[] = [
  {
    id: 'microfluidic_algal',
    name: 'Microfluidic Algal Fuel Cell',
    type: 'microfluidic_algal',
    description: 'Microscope slide chip with magnetic electrodes and hydrogel membrane',
    baseParameters: {
      volume: 2, // mL
      area: 4, // cm²
      channels: 8,
      flowRate: 0.1, // mL/min
    },
  },
  {
    id: 'benchtop_bioreactor',
    name: 'Benchtop Bioelectrochemical Reactor',
    type: 'benchtop_bioreactor',
    description: 'Laboratory-scale reactor for experiments and culture cultivation',
    baseParameters: {
      volume: 500, // mL
      area: 100, // cm²
      stirring: 100, // rpm
      aeration: 0.5, // L/min
    },
  },
  {
    id: 'stacked_fuel_cell',
    name: 'Stacked Fuel Cell Configuration',
    type: 'stacked_fuel_cell',
    description: 'Series/parallel slide pile for increased current and voltage',
    baseParameters: {
      volume: 50, // mL per cell
      area: 25, // cm² per cell
      cells: 4,
      connectionType: 1, // 1=series, 2=parallel
    },
  },
  {
    id: 'industrial_scale',
    name: 'Industrial Waste-to-Energy System',
    type: 'industrial_scale',
    description: 'Large-scale brewery wastewater treatment system',
    baseParameters: {
      volume: 10000, // L
      area: 10000, // cm²
      flowRate: 100, // L/min
      treatment: 95, // % waste processing
    },
  },
];

// Electrode Materials
export const ELECTRODE_MATERIALS: ElectrodeMaterial[] = [
  {
    id: 'carbon_cloth',
    name: 'Carbon Cloth',
    type: 'carbon_cloth',
    conductivity: 1200, // S/m
    surfaceArea: 2000, // m²/g
    cost: 45, // $/kg
    biocompatibility: 0.9,
  },
  {
    id: 'graphite_felt',
    name: 'Graphite Felt',
    type: 'graphite_felt',
    conductivity: 800,
    surfaceArea: 1500,
    cost: 35,
    biocompatibility: 0.85,
  },
  {
    id: 'stainless_steel_mesh',
    name: 'Stainless Steel Mesh',
    type: 'stainless_steel_mesh',
    conductivity: 1450,
    surfaceArea: 500,
    cost: 25,
    biocompatibility: 0.7,
  },
  {
    id: 'platinum_coated',
    name: 'Platinum-Coated Carbon',
    type: 'platinum',
    conductivity: 2100,
    surfaceArea: 1800,
    cost: 850,
    biocompatibility: 0.95,
  },
  {
    id: 'nickel_foam',
    name: 'Nickel Foam',
    type: 'stainless_steel_mesh',
    conductivity: 1400,
    surfaceArea: 1200,
    cost: 65,
    biocompatibility: 0.75,
  },
  {
    id: 'carbon_paper',
    name: 'Carbon Paper',
    type: 'carbon_cloth',
    conductivity: 1000,
    surfaceArea: 800,
    cost: 40,
    biocompatibility: 0.88,
  },
];

// Microbial Species
export const MICROBIAL_SPECIES: MicrobialSpecies[] = [
  {
    id: 'geobacter_sulfurreducens',
    name: 'Geobacter sulfurreducens',
    scientificName: 'Geobacter sulfurreducens',
    type: 'geobacter',
    electronTransferRate: 1200, // electrons/s
    substrateAffinity: 0.9,
    temperatureRange: [20, 40], // °C
    phRange: [6.5, 8.0],
  },
  {
    id: 'shewanella_oneidensis',
    name: 'Shewanella oneidensis',
    scientificName: 'Shewanella oneidensis MR-1',
    type: 'shewanella',
    electronTransferRate: 950,
    substrateAffinity: 0.8,
    temperatureRange: [15, 35],
    phRange: [6.0, 8.5],
  },
  {
    id: 'pseudomonas_aeruginosa',
    name: 'Pseudomonas aeruginosa',
    scientificName: 'Pseudomonas aeruginosa',
    type: 'pseudomonas',
    electronTransferRate: 650,
    substrateAffinity: 0.7,
    temperatureRange: [25, 42],
    phRange: [6.0, 8.0],
  },
  {
    id: 'mixed_culture_wastewater',
    name: 'Mixed Culture (Wastewater)',
    scientificName: 'Mixed microbial consortium',
    type: 'mixed_culture',
    electronTransferRate: 800,
    substrateAffinity: 0.75,
    temperatureRange: [20, 35],
    phRange: [6.5, 7.8],
  },
  {
    id: 'clostridium_beijerinckii',
    name: 'Clostridium beijerinckii',
    scientificName: 'Clostridium beijerinckii',
    type: 'pseudomonas',
    electronTransferRate: 580,
    substrateAffinity: 0.65,
    temperatureRange: [30, 45],
    phRange: [5.5, 7.5],
  },
  {
    id: 'saccharomyces_cerevisiae',
    name: 'Saccharomyces cerevisiae',
    scientificName: 'Saccharomyces cerevisiae',
    type: 'mixed_culture',
    electronTransferRate: 420,
    substrateAffinity: 0.6,
    temperatureRange: [25, 35],
    phRange: [4.0, 6.5],
  },
];

// Preset Configurations
export const PRESET_CONFIGURATIONS: PresetConfiguration[] = [
  {
    id: 'research_standard',
    name: 'Research Standard MFC',
    description: 'Standard dual-chamber MFC for research applications',
    category: 'research',
    configuration: {
      id: 'preset_research_standard',
      name: 'Research Standard MFC',
      systemConfig: SYSTEM_CONFIGURATIONS[1]!, // Benchtop bioreactor
      anodeMaterial: ELECTRODE_MATERIALS[0]!, // Carbon cloth
      cathodeMaterial: ELECTRODE_MATERIALS[0]!, // Carbon cloth
      microbialSpecies: MICROBIAL_SPECIES[0]!, // Geobacter
      operatingConditions: {
        temperature: 30,
        ph: 7.2,
        substrateConcetration: 500,
        flowRate: 2.0,
        electricalLoad: 1000,
        duration: 168, // 1 week
      },
      createdAt: new Date(),
      userId: 'system',
    },
    popularity: 245,
    rating: 4.7,
    tags: ['research', 'dual-chamber', 'standard'],
    createdBy: 'MESSAI System',
    isPublic: true,
  },
  {
    id: 'educational_microfluidic',
    name: 'Educational Microfluidic Cell',
    description: 'Simple microfluidic setup for educational demonstrations',
    category: 'educational',
    configuration: {
      id: 'preset_educational_microfluidic',
      name: 'Educational Microfluidic Cell',
      systemConfig: SYSTEM_CONFIGURATIONS[0]!, // Microfluidic
      anodeMaterial: ELECTRODE_MATERIALS[5]!, // Carbon paper
      cathodeMaterial: ELECTRODE_MATERIALS[5]!, // Carbon paper
      microbialSpecies: MICROBIAL_SPECIES[1]!, // Shewanella
      operatingConditions: {
        temperature: 25,
        ph: 7.0,
        substrateConcetration: 200,
        flowRate: 0.05,
        electricalLoad: 500,
        duration: 72, // 3 days
      },
      createdAt: new Date(),
      userId: 'system',
    },
    popularity: 189,
    rating: 4.5,
    tags: ['education', 'microfluidic', 'beginner'],
    createdBy: 'MESSAI System',
    isPublic: true,
  },
  {
    id: 'industrial_wastewater',
    name: 'Industrial Wastewater Treatment',
    description: 'Large-scale wastewater treatment with energy recovery',
    category: 'industrial',
    configuration: {
      id: 'preset_industrial_wastewater',
      name: 'Industrial Wastewater Treatment',
      systemConfig: SYSTEM_CONFIGURATIONS[3]!, // Industrial scale
      anodeMaterial: ELECTRODE_MATERIALS[2]!, // Stainless steel mesh
      cathodeMaterial: ELECTRODE_MATERIALS[3]!, // Platinum-coated
      microbialSpecies: MICROBIAL_SPECIES[3]!, // Mixed culture
      operatingConditions: {
        temperature: 28,
        ph: 7.5,
        substrateConcetration: 1200,
        flowRate: 50.0,
        electricalLoad: 100,
        duration: 8760, // 1 year
      },
      createdAt: new Date(),
      userId: 'system',
    },
    popularity: 87,
    rating: 4.3,
    tags: ['industrial', 'wastewater', 'large-scale'],
    createdBy: 'MESSAI System',
    isPublic: true,
  },
  {
    id: 'high_power_stacked',
    name: 'High-Power Stacked Configuration',
    description: 'Stacked fuel cells optimized for maximum power output',
    category: 'research',
    configuration: {
      id: 'preset_high_power_stacked',
      name: 'High-Power Stacked Configuration',
      systemConfig: SYSTEM_CONFIGURATIONS[2]!, // Stacked fuel cell
      anodeMaterial: ELECTRODE_MATERIALS[3]!, // Platinum-coated
      cathodeMaterial: ELECTRODE_MATERIALS[3]!, // Platinum-coated
      microbialSpecies: MICROBIAL_SPECIES[0]!, // Geobacter
      operatingConditions: {
        temperature: 35,
        ph: 7.8,
        substrateConcetration: 800,
        flowRate: 1.5,
        electricalLoad: 200,
        duration: 336, // 2 weeks
      },
      createdAt: new Date(),
      userId: 'system',
    },
    popularity: 156,
    rating: 4.8,
    tags: ['high-power', 'stacked', 'optimization'],
    createdBy: 'MESSAI System',
    isPublic: true,
  },
];

// Validation Constraints
export const VALIDATION_CONSTRAINTS = {
  temperature: { min: 4, max: 80, optimal: [25, 37] },
  ph: { min: 2.0, max: 12.0, optimal: [6.5, 8.0] },
  substrateConcentration: { min: 10, max: 5000, optimal: [200, 1000] },
  flowRate: { min: 0.01, max: 1000, optimal: [0.1, 10] },
  electricalLoad: { min: 1, max: 10000, optimal: [100, 2000] },
  duration: { min: 1, max: 8760, optimal: [24, 168] },
};

// Parameter Units
export const PARAMETER_UNITS = {
  temperature: '°C',
  ph: 'pH units',
  substrateConcentration: 'mg/L',
  flowRate: 'mL/min',
  electricalLoad: 'Ω',
  duration: 'hours',
  powerDensity: 'mW/cm²',
  voltage: 'V',
  current: 'A',
  efficiency: '%',
  cost: '$',
};

// Substrate Types
export const SUBSTRATE_TYPES = [
  { id: 'glucose', name: 'Glucose', concentration: [100, 1000] },
  { id: 'acetate', name: 'Sodium Acetate', concentration: [200, 2000] },
  { id: 'wastewater', name: 'Domestic Wastewater', concentration: [300, 1500] },
  { id: 'brewery_waste', name: 'Brewery Wastewater', concentration: [500, 3000] },
  { id: 'starch', name: 'Starch', concentration: [150, 800] },
  { id: 'cellulose', name: 'Cellulose', concentration: [100, 600] },
];

// Performance Benchmarks (from literature)
export const PERFORMANCE_BENCHMARKS = {
  powerDensity: {
    excellent: 4.0, // mW/cm²
    good: 2.5,
    average: 1.5,
    poor: 0.5,
  },
  coulombicEfficiency: {
    excellent: 85, // %
    good: 70,
    average: 50,
    poor: 25,
  },
  energyEfficiency: {
    excellent: 20, // %
    good: 15,
    average: 10,
    poor: 5,
  },
};
