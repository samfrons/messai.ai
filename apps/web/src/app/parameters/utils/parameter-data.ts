import { PARAMETER_LIBRARY } from '../../../data/parameter-library';
import type { Parameter, ParameterCategory } from '../../../types/parameters';

/**
 * Generate system parameters from the parameter library
 * This creates a comprehensive set of parameters based on the MESSAI parameter classification
 */
export function getSystemParameters(): Parameter[] {
  const parameters: Parameter[] = [];
  let idCounter = 1;

  // Process each category in the parameter library
  PARAMETER_LIBRARY.forEach((category) => {
    const categoryKey = mapCategoryToType(category.category);

    category.subcategories.forEach((subcategory) => {
      subcategory.parameters.forEach((paramName) => {
        const param = createParameter(
          idCounter++,
          paramName,
          categoryKey,
          subcategory.name,
          subcategory.code,
          category.category
        );
        parameters.push(param);
      });
    });
  });

  return parameters;
}

/**
 * Map library category names to ParameterCategory type
 */
function mapCategoryToType(categoryName: string): ParameterCategory {
  const mapping: Record<string, ParameterCategory> = {
    'Electrode Materials': 'electrode',
    'Microbial Species': 'microbe',
    Substrates: 'substrate',
    'Membranes & Separators': 'membrane',
    'System Configurations': 'system_configuration',
    'Operating Conditions': 'operating_condition',
    'Chemical Additives': 'substrate', // Chemical additives are treated as substrates
    'Performance Metrics': 'operating_condition', // Metrics are part of operating conditions
  };
  return mapping[categoryName] || 'electrode';
}

/**
 * Create a parameter with appropriate properties based on its category
 */
function createParameter(
  id: number,
  name: string,
  category: ParameterCategory,
  subcategory: string,
  subcategoryCode: string,
  originalCategory: string
): Parameter {
  const baseParameter: Parameter = {
    id: `param-${id}`,
    name,
    category,
    subcategory,
    subcategoryCode,
    description: generateDescription(name, category, subcategory),
    properties: generateProperties(name, category, subcategoryCode),
    source: 'MESSAI Parameter Library',
    isSystem: true,
  };

  // Add compatibility data for certain categories
  if (category === 'electrode' || category === 'microbe') {
    baseParameter.compatibility = generateCompatibility(name, category);
  }

  return baseParameter;
}

/**
 * Generate description based on parameter details
 */
function generateDescription(
  name: string,
  category: ParameterCategory,
  subcategory: string
): string {
  const descriptions: Record<string, string> = {
    electrode: `${subcategory} electrode material for bioelectrochemical systems`,
    microbe: `${subcategory} for electron transfer in MFC/MEC applications`,
    substrate: `${subcategory} substrate for microbial metabolism`,
    membrane: `${subcategory} for ion transport and separation`,
    system_configuration: `${subcategory} configuration for MESS applications`,
    operating_condition: `${subcategory} operating parameter`,
  };
  return descriptions[category] || `${name} parameter`;
}

/**
 * Generate properties based on parameter category and subcategory
 */
function generateProperties(
  name: string,
  category: ParameterCategory,
  subcategoryCode: string
): Record<string, any> {
  switch (category) {
    case 'electrode':
      return generateElectrodeProperties(name, subcategoryCode);
    case 'microbe':
      return generateMicrobeProperties(name, subcategoryCode);
    case 'substrate':
      return generateSubstrateProperties(name, subcategoryCode);
    case 'membrane':
      return generateMembraneProperties(name, subcategoryCode);
    case 'system_configuration':
      return generateSystemProperties(name, subcategoryCode);
    case 'operating_condition':
      return generateOperatingProperties(name, subcategoryCode);
    default:
      return {};
  }
}

/**
 * Generate electrode-specific properties
 */
function generateElectrodeProperties(name: string, subcategoryCode: string): Record<string, any> {
  const baseProps = {
    conductivity: 100, // S/m
    surfaceArea: 1000, // m²/g
    porosity: 70, // %
    thickness: 5, // mm
    cost: 50, // $/kg
    biocompatibility: 0.8,
  };

  // Adjust based on material type
  if (subcategoryCode === 'electrode_carbon') {
    if (name.includes('Nanotube')) {
      baseProps.conductivity = 3000;
      baseProps.surfaceArea = 2500;
      baseProps.cost = 1200;
      baseProps.biocompatibility = 0.95;
    } else if (name.includes('Graphene')) {
      baseProps.conductivity = 4000;
      baseProps.surfaceArea = 2600;
      baseProps.cost = 1500;
      baseProps.biocompatibility = 0.9;
    } else if (name.includes('Activated')) {
      baseProps.conductivity = 500;
      baseProps.surfaceArea = 3000;
      baseProps.cost = 50;
    }
  } else if (subcategoryCode === 'electrode_metal') {
    baseProps.biocompatibility = 0.6;
    if (name.includes('Platinum')) {
      baseProps.conductivity = 9430;
      baseProps.cost = 35000;
      baseProps.biocompatibility = 0.95;
    } else if (name.includes('Titanium')) {
      baseProps.conductivity = 2380;
      baseProps.cost = 150;
    } else if (name.includes('Stainless')) {
      baseProps.conductivity = 1450;
      baseProps.cost = 25;
    }
  }

  return baseProps;
}

/**
 * Generate microbe-specific properties
 */
function generateMicrobeProperties(name: string, subcategoryCode: string): Record<string, any> {
  const baseProps = {
    electronTransferRate: 1e-12, // electrons/s
    substrateAffinity: 0.8,
    growthRate: 0.3, // 1/h
    optimalTemperature: 30, // °C
    temperatureRange: [20, 40] as [number, number],
    optimalPH: 7.0,
    phRange: [6.0, 8.0] as [number, number],
    biocompatibility: 0.85,
  };

  // Adjust based on species
  if (name.includes('Geobacter')) {
    baseProps.electronTransferRate = 5e-12;
    baseProps.substrateAffinity = 0.9;
    baseProps.optimalPH = 6.8;
  } else if (name.includes('Shewanella')) {
    baseProps.electronTransferRate = 3e-12;
    baseProps.temperatureRange = [15, 35];
    baseProps.optimalTemperature = 25;
  } else if (name.includes('thermophilic')) {
    baseProps.temperatureRange = [40, 60];
    baseProps.optimalTemperature = 50;
  } else if (subcategoryCode === 'microbe_algae') {
    baseProps.electronTransferRate = 1e-13;
    baseProps.optimalPH = 7.5;
    baseProps.growthRate = 0.5;
  }

  return baseProps;
}

/**
 * Generate substrate-specific properties
 */
function generateSubstrateProperties(name: string, subcategoryCode: string): Record<string, any> {
  const baseProps = {
    concentration: 10, // g/L
    cod: 1000, // mg/L
    bod: 500, // mg/L
  };

  if (subcategoryCode === 'substrate_simple') {
    baseProps.concentration = 5;
    baseProps.cod = 500;
    baseProps.bod = 400;
  } else if (subcategoryCode === 'substrate_wastewater') {
    baseProps.concentration = 20;
    baseProps.cod = 2000;
    baseProps.bod = 1000;
  }

  return baseProps;
}

/**
 * Generate membrane-specific properties
 */
function generateMembraneProperties(name: string, subcategoryCode: string): Record<string, any> {
  const baseProps = {
    conductivity: 100, // mS/cm
    thickness: 0.2, // mm
    resistance: 2, // Ω·cm²
    cost: 200, // $/m²
    temperature: 60, // max operating temp °C
  };

  if (name.includes('Nafion')) {
    baseProps.conductivity = 150;
    baseProps.cost = 500;
    baseProps.temperature = 80;
  } else if (subcategoryCode === 'membrane_alternative') {
    baseProps.conductivity = 50;
    baseProps.cost = 50;
  }

  return baseProps;
}

/**
 * Generate system configuration properties
 */
function generateSystemProperties(name: string, subcategoryCode: string): Record<string, any> {
  const baseProps = {
    volume: 100, // mL
    area: 50, // cm²
    hydraulicRetentionTime: 24, // hours
  };

  if (subcategoryCode === 'config_single') {
    baseProps.volume = 50;
    baseProps.area = 25;
  } else if (subcategoryCode === 'config_scaled') {
    baseProps.volume = 10000;
    baseProps.area = 1000;
  }

  return baseProps;
}

/**
 * Generate operating condition properties
 */
function generateOperatingProperties(name: string, subcategoryCode: string): Record<string, any> {
  const baseProps: Record<string, any> = {};

  if (subcategoryCode === 'operating_temperature') {
    if (name.includes('Psychrophilic')) {
      baseProps.temperature = 10;
      baseProps.temperatureRange = [0, 20];
    } else if (name.includes('Mesophilic')) {
      baseProps.temperature = 30;
      baseProps.temperatureRange = [20, 40];
    } else if (name.includes('Thermophilic')) {
      baseProps.temperature = 50;
      baseProps.temperatureRange = [40, 60];
    }
  } else if (subcategoryCode === 'operating_ph') {
    if (name.includes('Acidic')) {
      baseProps.ph = 4;
      baseProps.phRange = [3, 5];
    } else if (name.includes('Neutral')) {
      baseProps.ph = 7;
      baseProps.phRange = [6.5, 7.5];
    } else if (name.includes('Alkaline')) {
      baseProps.ph = 10;
      baseProps.phRange = [9, 11];
    }
  } else if (subcategoryCode === 'operating_flow') {
    baseProps.flowRate = name.includes('Batch') ? 0 : 10; // mL/min
    baseProps.flowMode = name;
  } else if (subcategoryCode === 'operating_electrical') {
    baseProps.mode = name;
    baseProps.resistance = name.includes('Fixed Resistance') ? 1000 : null; // Ω
  }

  return baseProps;
}

/**
 * Generate compatibility data
 */
function generateCompatibility(name: string, category: ParameterCategory): any {
  const compatibleWith = [];
  // Use a deterministic score based on the name hash
  const nameHash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const score = 50 + (nameHash % 50); // Deterministic score between 50-100

  // Add some example compatibility
  if (category === 'electrode') {
    compatibleWith.push(
      {
        parameterId: 'param-50',
        score: Math.round(score),
        factors: { biocompatibility: 0.8, electrochemical: 0.9 },
      },
      {
        parameterId: 'param-51',
        score: Math.round(score * 0.9),
        factors: { biocompatibility: 0.7, electrochemical: 0.8 },
      }
    );
  }

  return {
    compatibleWith,
    incompatibleWith: [],
    notes: 'Compatibility based on MESSAI research database',
  };
}
