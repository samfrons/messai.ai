/**
 * Paper Parameter Mapper
 *
 * Maps research paper data to 3D model parameters for accurate visualization
 */

interface PaperModelParameters {
  // Geometry parameters
  chamberLength?: number;
  chamberWidth?: number;
  chamberHeight?: number;
  electrodeArea?: number;

  // Nanowire parameters
  nanowireDensity?: number;
  nanowireLength?: number;
  nanowireDiameter?: number;
  nanowireSpacing?: number;
  nanowireOrientation?: string;

  // Substrate parameters
  substrateThickness?: number;
  substrateMaterial?: string;
  substrateType?: string;

  // Flow parameters
  flowChannelWidth?: number;
  flowChannelHeight?: number;
  mainChannelWidth?: number;
  mainChannelHeight?: number;

  // Operating conditions
  temperature?: number;
  pH?: number;
  flowRate?: number;

  // Biological parameters
  microbialSpecies?: string;
  inoculumConcentration?: number;
  biofilmThickness?: number;

  // Materials
  anodeMaterial?: string;
  cathodeMaterial?: string;
  membraneType?: string;

  // Performance metrics
  powerDensity?: number;
  currentDensity?: number;
  openCircuitVoltage?: number;
  coulombicEfficiency?: number;
}

interface ModelParameters {
  // Existing parameters
  chamberLength?: number;
  chamberWidth?: number;
  chamberHeight?: number;
  electrodeSpacing?: number;
  membraneThickness?: number;
  anodeMaterial?: string;
  cathodeMaterial?: string;
  membraneType?: string;
  temperature?: number;
  ph?: number;
  flowRate?: number;
  biofilmThickness?: number;
  microbialSpecies?: string;

  // Nanowire-specific parameters
  nanowireCount?: number;
  nanowireDiameter?: number;
  nanowireLength?: number;
  nanowireSpacing?: number;
  nanowireDensity?: number;
  nanowireOrientation?: 'vertical' | 'random' | 'aligned';
  nanowireMaterial?: 'nickel-silicide' | 'nickel' | 'carbon';
  substrateType?: 'foam' | 'flat' | 'textured';
  substrateThickness?: number;
  substrateMaterial?: string;

  // Microfluidic parameters
  flowChannelWidth?: number;
  flowChannelHeight?: number;
  mainChannelWidth?: number;
  mainChannelHeight?: number;
}

/**
 * Maps paper data to 3D model parameters
 */
export const mapPaperToModelParameters = (paperData: any): ModelParameters => {
  const modelParams: PaperModelParameters = paperData.modelParameters || {};

  // Calculate nanowire count from density and electrode area
  const nanowireCount =
    modelParams.nanowireDensity && modelParams.electrodeArea
      ? Math.floor(modelParams.nanowireDensity * modelParams.electrodeArea)
      : 850 * 25; // Default: 850/mm² × 25 mm²

  // Calculate nanowire spacing from density (assuming square grid)
  const nanowireSpacing = modelParams.nanowireDensity
    ? Math.sqrt(1 / modelParams.nanowireDensity) * 1000 // Convert mm to μm
    : 34.1; // Default spacing in μm

  return {
    // Direct mappings
    chamberLength: modelParams.chamberLength || 25, // mm
    chamberWidth: modelParams.chamberWidth || 12, // mm
    chamberHeight: modelParams.chamberHeight || 2, // mm

    // Calculated electrode spacing (half of chamber width)
    electrodeSpacing: modelParams.chamberWidth ? modelParams.chamberWidth / 2 : 6, // mm

    // Membrane thickness (standard for microfluidic)
    membraneThickness: 0.2, // mm

    // Material mappings
    anodeMaterial: mapAnodeMaterial(modelParams.anodeMaterial),
    cathodeMaterial: mapCathodeMaterial(modelParams.cathodeMaterial),
    membraneType: 'nafion', // Default membrane type

    // Operating conditions
    temperature: modelParams.temperature || 25, // °C
    ph: modelParams.pH || 7.0,
    flowRate: modelParams.flowRate || 5, // μL/min

    // Biological parameters
    microbialSpecies: mapMicrobialSpecies(modelParams.microbialSpecies),
    biofilmThickness: modelParams.biofilmThickness || 10, // μm

    // Nanowire-specific parameters
    nanowireCount: nanowireCount,
    nanowireDiameter: modelParams.nanowireDiameter || 50, // nm
    nanowireLength: modelParams.nanowireLength || 2.5, // μm
    nanowireSpacing: nanowireSpacing,
    nanowireDensity: modelParams.nanowireDensity || 850, // per mm²
    nanowireOrientation: mapNanowireOrientation(modelParams.nanowireOrientation),
    nanowireMaterial: mapNanowireMaterial(modelParams.anodeMaterial),

    // Substrate parameters
    substrateType: mapSubstrateType(modelParams.substrateType),
    substrateThickness: modelParams.substrateThickness || 1.5, // mm
    substrateMaterial: modelParams.substrateMaterial || 'nickel-foam',

    // Microfluidic parameters
    flowChannelWidth: modelParams.flowChannelWidth || 500, // μm
    flowChannelHeight: modelParams.flowChannelHeight || 200, // μm
    mainChannelWidth: modelParams.mainChannelWidth || 12000, // μm (12 mm)
    mainChannelHeight: modelParams.mainChannelHeight || 2000, // μm (2 mm)
  };
};

/**
 * Maps paper-specific anode materials to model materials
 */
function mapAnodeMaterial(material?: string): string {
  if (!material) return 'carbon-cloth';

  const materialMap: { [key: string]: string } = {
    'nickel-silicide': 'carbon-cloth', // Map to closest available
    nickel: 'carbon-cloth',
    carbon: 'carbon-cloth',
    graphite: 'graphite',
    'carbon-felt': 'carbon-felt',
    'carbon-paper': 'carbon-paper',
  };

  return materialMap[material.toLowerCase()] || 'carbon-cloth';
}

/**
 * Maps paper-specific cathode materials to model materials
 */
function mapCathodeMaterial(material?: string): string {
  if (!material) return 'platinum';

  const materialMap: { [key: string]: string } = {
    platinum: 'platinum',
    'platinum-black': 'platinum',
    carbon: 'carbon',
    mno2: 'mno2',
    'carbon-pt': 'carbon-pt',
  };

  return materialMap[material.toLowerCase()] || 'platinum';
}

/**
 * Maps paper-specific microbial species to model species
 */
function mapMicrobialSpecies(species?: string): string {
  if (!species) return 'e-coli';

  const speciesMap: { [key: string]: string } = {
    'e-coli': 'e-coli',
    'e.coli': 'e-coli',
    'escherichia-coli': 'e-coli',
    shewanella: 'shewanella',
    geobacter: 'geobacter',
    'mixed-culture': 'mixed-culture',
  };

  return speciesMap[species.toLowerCase()] || 'e-coli';
}

/**
 * Maps paper-specific nanowire orientations to model orientations
 */
function mapNanowireOrientation(orientation?: string): 'vertical' | 'random' | 'aligned' {
  if (!orientation) return 'vertical';

  const orientationMap: { [key: string]: 'vertical' | 'random' | 'aligned' } = {
    vertical: 'vertical',
    perpendicular: 'vertical',
    random: 'random',
    aligned: 'aligned',
    horizontal: 'aligned',
  };

  return orientationMap[orientation.toLowerCase()] || 'vertical';
}

/**
 * Maps paper-specific nanowire materials to model materials
 */
function mapNanowireMaterial(material?: string): 'nickel-silicide' | 'nickel' | 'carbon' {
  if (!material) return 'nickel-silicide';

  const materialMap: { [key: string]: 'nickel-silicide' | 'nickel' | 'carbon' } = {
    'nickel-silicide': 'nickel-silicide',
    ni2si: 'nickel-silicide',
    nickel: 'nickel',
    ni: 'nickel',
    carbon: 'carbon',
    'carbon-nanotube': 'carbon',
    cnt: 'carbon',
  };

  return materialMap[material.toLowerCase()] || 'nickel-silicide';
}

/**
 * Maps paper-specific substrate types to model types
 */
function mapSubstrateType(type?: string): 'foam' | 'flat' | 'textured' {
  if (!type) return 'foam';

  const typeMap: { [key: string]: 'foam' | 'flat' | 'textured' } = {
    foam: 'foam',
    '3d-foam': 'foam',
    porous: 'foam',
    flat: 'flat',
    smooth: 'flat',
    textured: 'textured',
    roughened: 'textured',
  };

  return typeMap[type.toLowerCase()] || 'foam';
}

/**
 * Gets default parameters for a specific model type
 */
export const getDefaultParameters = (modelType: string): ModelParameters => {
  switch (modelType) {
    case 'nanowire-mfc':
      return {
        chamberLength: 25, // mm
        chamberWidth: 12, // mm
        chamberHeight: 2, // mm
        electrodeSpacing: 6, // mm
        membraneThickness: 0.2, // mm
        anodeMaterial: 'carbon-cloth',
        cathodeMaterial: 'platinum',
        membraneType: 'nafion',
        temperature: 25, // °C
        ph: 7.0,
        flowRate: 5, // μL/min
        biofilmThickness: 10, // μm
        microbialSpecies: 'e-coli',

        // Nanowire-specific defaults
        nanowireCount: 21250, // 850 * 25
        nanowireDiameter: 50, // nm
        nanowireLength: 2.5, // μm
        nanowireSpacing: 34.1, // μm
        nanowireDensity: 850, // per mm²
        nanowireOrientation: 'vertical',
        nanowireMaterial: 'nickel-silicide',
        substrateType: 'foam',
        substrateThickness: 1.5, // mm
        substrateMaterial: 'nickel-foam',

        // Microfluidic defaults
        flowChannelWidth: 500, // μm
        flowChannelHeight: 200, // μm
        mainChannelWidth: 12000, // μm
        mainChannelHeight: 2000, // μm
      };

    default:
      return {};
  }
};

/**
 * Validates parameter values and applies constraints
 */
export const validateParameters = (parameters: ModelParameters): ModelParameters => {
  const validated = { ...parameters };

  // Apply realistic constraints
  if (validated.nanowireCount && validated.nanowireCount > 50000) {
    validated.nanowireCount = 50000; // Limit for performance
  }

  if (validated.nanowireDiameter && validated.nanowireDiameter < 10) {
    validated.nanowireDiameter = 10; // Minimum diameter in nm
  }

  if (validated.nanowireLength && validated.nanowireLength > 10) {
    validated.nanowireLength = 10; // Maximum length in μm
  }

  if (validated.temperature && (validated.temperature < 0 || validated.temperature > 100)) {
    validated.temperature = 25; // Default temperature
  }

  if (validated.ph && (validated.ph < 0 || validated.ph > 14)) {
    validated.ph = 7.0; // Default pH
  }

  if (validated.flowRate && validated.flowRate < 0) {
    validated.flowRate = 5; // Default flow rate
  }

  return validated;
};
