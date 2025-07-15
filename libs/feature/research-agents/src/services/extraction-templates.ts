/**
 * Structured Extraction Templates
 * Comprehensive templates for extracting performance metrics and research data
 */

export interface ExtractionSchema {
  field: string;
  type: 'string' | 'number' | 'array' | 'object' | 'boolean';
  required: boolean;
  description: string;
  unit?: string;
  validation?: {
    min?: number;
    max?: number;
    pattern?: RegExp;
    enum?: string[];
  };
  examples?: any[];
}

export interface ExtractionTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  schema: Record<string, ExtractionSchema>;
  prompt: string;
  examples?: Array<{
    input: string;
    output: Record<string, any>;
  }>;
  priority: 'high' | 'medium' | 'low';
  tags: string[];
}

export const EXTRACTION_TEMPLATES: Record<string, ExtractionTemplate> = {
  // Core Performance Metrics
  algae_performance_metrics: {
    id: 'algae_performance_metrics',
    name: 'Algae Fuel Cell Performance Metrics',
    description: 'Extract key performance metrics from algae fuel cell research',
    category: 'performance',
    schema: {
      powerDensity: {
        field: 'powerDensity',
        type: 'number',
        required: true,
        description: 'Power density output',
        unit: 'mW/m²',
        validation: { min: 0, max: 10000 },
        examples: [150, 300, 500],
      },
      currentDensity: {
        field: 'currentDensity',
        type: 'number',
        required: true,
        description: 'Current density output',
        unit: 'mA/m²',
        validation: { min: 0, max: 50000 },
        examples: [200, 500, 1000],
      },
      voltage: {
        field: 'voltage',
        type: 'number',
        required: true,
        description: 'Operating voltage',
        unit: 'V',
        validation: { min: 0, max: 5 },
        examples: [0.5, 0.8, 1.2],
      },
      efficiency: {
        field: 'efficiency',
        type: 'number',
        required: false,
        description: 'Overall system efficiency',
        unit: '%',
        validation: { min: 0, max: 100 },
        examples: [15, 25, 35],
      },
      coulombicEfficiency: {
        field: 'coulombicEfficiency',
        type: 'number',
        required: false,
        description: 'Coulombic efficiency',
        unit: '%',
        validation: { min: 0, max: 100 },
        examples: [60, 75, 90],
      },
      energyDensity: {
        field: 'energyDensity',
        type: 'number',
        required: false,
        description: 'Energy density',
        unit: 'Wh/m³',
        validation: { min: 0, max: 1000 },
        examples: [50, 100, 200],
      },
    },
    prompt: `Extract algae fuel cell performance metrics from this research text:

    Text: {input}

    Extract the following metrics (use null if not found):
    - powerDensity: Power density in mW/m²
    - currentDensity: Current density in mA/m²
    - voltage: Operating voltage in V
    - efficiency: Overall efficiency in %
    - coulombicEfficiency: Coulombic efficiency in %
    - energyDensity: Energy density in Wh/m³

    Return valid JSON only.`,
    priority: 'high',
    tags: ['performance', 'metrics', 'algae', 'fuel-cell'],
  },

  // System Configuration
  system_configuration: {
    id: 'system_configuration',
    name: 'System Configuration Details',
    description: 'Extract system design and configuration parameters',
    category: 'system',
    schema: {
      systemType: {
        field: 'systemType',
        type: 'string',
        required: true,
        description: 'Type of bioelectrochemical system',
        validation: {
          enum: ['MFC', 'MEC', 'MDC', 'photobioreactor', 'microfluidic', 'batch', 'continuous'],
        },
        examples: ['MFC', 'photobioreactor', 'microfluidic'],
      },
      reactorVolume: {
        field: 'reactorVolume',
        type: 'number',
        required: false,
        description: 'Reactor volume',
        unit: 'mL',
        validation: { min: 0, max: 10000 },
        examples: [50, 100, 500],
      },
      anodeArea: {
        field: 'anodeArea',
        type: 'number',
        required: false,
        description: 'Anode surface area',
        unit: 'cm²',
        validation: { min: 0, max: 1000 },
        examples: [1, 5, 10],
      },
      cathodeArea: {
        field: 'cathodeArea',
        type: 'number',
        required: false,
        description: 'Cathode surface area',
        unit: 'cm²',
        validation: { min: 0, max: 1000 },
        examples: [1, 5, 10],
      },
      membraneType: {
        field: 'membraneType',
        type: 'string',
        required: false,
        description: 'Membrane material/type',
        validation: {
          enum: ['Nafion', 'PEM', 'ceramic', 'glass', 'polycarbonate', 'none'],
        },
        examples: ['Nafion', 'PEM', 'ceramic'],
      },
      separatorDistance: {
        field: 'separatorDistance',
        type: 'number',
        required: false,
        description: 'Distance between electrodes',
        unit: 'cm',
        validation: { min: 0, max: 50 },
        examples: [2, 5, 10],
      },
    },
    prompt: `Extract system configuration details from this research text:

    Text: {input}

    Extract the following configuration parameters:
    - systemType: Type of system (MFC, MEC, MDC, photobioreactor, microfluidic, etc.)
    - reactorVolume: Reactor volume in mL
    - anodeArea: Anode surface area in cm²
    - cathodeArea: Cathode surface area in cm²
    - membraneType: Membrane type (Nafion, PEM, ceramic, glass, etc.)
    - separatorDistance: Distance between electrodes in cm

    Return valid JSON only.`,
    priority: 'high',
    tags: ['system', 'configuration', 'reactor', 'electrodes'],
  },

  // Algae Species and Cultivation
  algae_species_cultivation: {
    id: 'algae_species_cultivation',
    name: 'Algae Species and Cultivation',
    description: 'Extract algae species and cultivation parameters',
    category: 'biology',
    schema: {
      algaeSpecies: {
        field: 'algaeSpecies',
        type: 'array',
        required: true,
        description: 'Algae species studied',
        validation: {
          enum: [
            'Chlorella vulgaris',
            'Chlorella sorokiniana',
            'Scenedesmus obliquus',
            'Spirulina platensis',
            'Dunaliella salina',
            'Nannochloropsis',
            'Chlamydomonas reinhardtii',
            'Arthrospira maxima',
          ],
        },
        examples: [['Chlorella vulgaris'], ['Scenedesmus obliquus', 'Spirulina platensis']],
      },
      cultivationMode: {
        field: 'cultivationMode',
        type: 'string',
        required: false,
        description: 'Cultivation mode',
        validation: {
          enum: ['photoautotrophic', 'heterotrophic', 'mixotrophic', 'continuous', 'batch'],
        },
        examples: ['photoautotrophic', 'mixotrophic'],
      },
      biomassConcentration: {
        field: 'biomassConcentration',
        type: 'number',
        required: false,
        description: 'Biomass concentration',
        unit: 'g/L',
        validation: { min: 0, max: 100 },
        examples: [0.5, 1.0, 2.5],
      },
      cellDensity: {
        field: 'cellDensity',
        type: 'number',
        required: false,
        description: 'Cell density',
        unit: 'cells/mL',
        validation: { min: 0, max: 1e10 },
        examples: [1e6, 5e6, 1e7],
      },
      growthRate: {
        field: 'growthRate',
        type: 'number',
        required: false,
        description: 'Specific growth rate',
        unit: 'day⁻¹',
        validation: { min: 0, max: 5 },
        examples: [0.2, 0.5, 1.0],
      },
      cultivationTime: {
        field: 'cultivationTime',
        type: 'number',
        required: false,
        description: 'Cultivation time',
        unit: 'days',
        validation: { min: 0, max: 100 },
        examples: [3, 7, 14],
      },
    },
    prompt: `Extract algae species and cultivation information from this research text:

    Text: {input}

    Extract the following biological parameters:
    - algaeSpecies: List of algae species studied
    - cultivationMode: Cultivation mode (photoautotrophic, heterotrophic, mixotrophic, etc.)
    - biomassConcentration: Biomass concentration in g/L
    - cellDensity: Cell density in cells/mL
    - growthRate: Specific growth rate in day⁻¹
    - cultivationTime: Cultivation time in days

    Return valid JSON only.`,
    priority: 'high',
    tags: ['biology', 'algae', 'cultivation', 'growth'],
  },

  // Operating Conditions
  operating_conditions: {
    id: 'operating_conditions',
    name: 'Operating Conditions',
    description: 'Extract environmental and operating conditions',
    category: 'conditions',
    schema: {
      temperature: {
        field: 'temperature',
        type: 'number',
        required: false,
        description: 'Operating temperature',
        unit: '°C',
        validation: { min: -10, max: 100 },
        examples: [20, 25, 30],
      },
      pH: {
        field: 'pH',
        type: 'number',
        required: false,
        description: 'pH level',
        unit: 'pH',
        validation: { min: 0, max: 14 },
        examples: [6.5, 7.0, 8.5],
      },
      lightIntensity: {
        field: 'lightIntensity',
        type: 'number',
        required: false,
        description: 'Light intensity',
        unit: 'µmol/m²/s',
        validation: { min: 0, max: 5000 },
        examples: [100, 200, 400],
      },
      photoperiod: {
        field: 'photoperiod',
        type: 'string',
        required: false,
        description: 'Light-dark cycle',
        validation: {
          pattern: /^\d+:\d+$/,
        },
        examples: ['12:12', '16:8', '24:0'],
      },
      agitationSpeed: {
        field: 'agitationSpeed',
        type: 'number',
        required: false,
        description: 'Agitation speed',
        unit: 'rpm',
        validation: { min: 0, max: 1000 },
        examples: [100, 150, 200],
      },
      flowRate: {
        field: 'flowRate',
        type: 'number',
        required: false,
        description: 'Flow rate',
        unit: 'mL/min',
        validation: { min: 0, max: 1000 },
        examples: [1, 5, 10],
      },
      hydraulicRetentionTime: {
        field: 'hydraulicRetentionTime',
        type: 'number',
        required: false,
        description: 'Hydraulic retention time',
        unit: 'hours',
        validation: { min: 0, max: 1000 },
        examples: [2, 12, 24],
      },
    },
    prompt: `Extract operating conditions from this research text:

    Text: {input}

    Extract the following operating parameters:
    - temperature: Operating temperature in °C
    - pH: pH level
    - lightIntensity: Light intensity in µmol/m²/s
    - photoperiod: Light-dark cycle (e.g., "12:12")
    - agitationSpeed: Agitation speed in rpm
    - flowRate: Flow rate in mL/min
    - hydraulicRetentionTime: Hydraulic retention time in hours

    Return valid JSON only.`,
    priority: 'medium',
    tags: ['conditions', 'environment', 'operation'],
  },

  // Electrode Materials
  electrode_materials: {
    id: 'electrode_materials',
    name: 'Electrode Materials',
    description: 'Extract electrode material and treatment information',
    category: 'materials',
    schema: {
      anodeMaterial: {
        field: 'anodeMaterial',
        type: 'string',
        required: false,
        description: 'Anode material',
        validation: {
          enum: [
            'carbon cloth',
            'carbon felt',
            'carbon paper',
            'graphite',
            'stainless steel',
            'platinum',
            'gold',
            'ITO',
            'nickel foam',
          ],
        },
        examples: ['carbon cloth', 'graphite', 'stainless steel'],
      },
      cathodeMaterial: {
        field: 'cathodeMaterial',
        type: 'string',
        required: false,
        description: 'Cathode material',
        validation: {
          enum: [
            'carbon cloth',
            'carbon felt',
            'carbon paper',
            'graphite',
            'stainless steel',
            'platinum',
            'gold',
            'ITO',
            'nickel foam',
          ],
        },
        examples: ['carbon cloth', 'platinum', 'gold'],
      },
      anodeTreatment: {
        field: 'anodeTreatment',
        type: 'array',
        required: false,
        description: 'Anode surface treatments',
        validation: {
          enum: ['ammonia', 'nitric acid', 'heat treatment', 'plasma', 'coating', 'none'],
        },
        examples: [['ammonia'], ['heat treatment', 'coating']],
      },
      cathodeTreatment: {
        field: 'cathodeTreatment',
        type: 'array',
        required: false,
        description: 'Cathode surface treatments',
        validation: {
          enum: ['ammonia', 'nitric acid', 'heat treatment', 'plasma', 'coating', 'none'],
        },
        examples: [['platinum coating'], ['heat treatment']],
      },
      catalystType: {
        field: 'catalystType',
        type: 'string',
        required: false,
        description: 'Catalyst type',
        validation: {
          enum: ['platinum', 'palladium', 'nickel', 'iron', 'manganese', 'none'],
        },
        examples: ['platinum', 'nickel', 'none'],
      },
      catalystLoading: {
        field: 'catalystLoading',
        type: 'number',
        required: false,
        description: 'Catalyst loading',
        unit: 'mg/cm²',
        validation: { min: 0, max: 10 },
        examples: [0.1, 0.5, 1.0],
      },
    },
    prompt: `Extract electrode material information from this research text:

    Text: {input}

    Extract the following electrode parameters:
    - anodeMaterial: Anode material type
    - cathodeMaterial: Cathode material type
    - anodeTreatment: List of anode surface treatments
    - cathodeTreatment: List of cathode surface treatments
    - catalystType: Catalyst type used
    - catalystLoading: Catalyst loading in mg/cm²

    Return valid JSON only.`,
    priority: 'medium',
    tags: ['materials', 'electrodes', 'catalyst'],
  },

  // Substrate and Medium
  substrate_medium: {
    id: 'substrate_medium',
    name: 'Substrate and Medium',
    description: 'Extract substrate and growth medium information',
    category: 'medium',
    schema: {
      carbonSource: {
        field: 'carbonSource',
        type: 'string',
        required: false,
        description: 'Carbon source',
        validation: {
          enum: ['glucose', 'acetate', 'glycerol', 'CO2', 'bicarbonate', 'starch', 'cellulose'],
        },
        examples: ['glucose', 'acetate', 'CO2'],
      },
      carbonConcentration: {
        field: 'carbonConcentration',
        type: 'number',
        required: false,
        description: 'Carbon source concentration',
        unit: 'g/L',
        validation: { min: 0, max: 100 },
        examples: [1.0, 2.0, 5.0],
      },
      nitrogenSource: {
        field: 'nitrogenSource',
        type: 'string',
        required: false,
        description: 'Nitrogen source',
        validation: {
          enum: ['nitrate', 'ammonia', 'urea', 'peptone', 'yeast extract'],
        },
        examples: ['nitrate', 'ammonia', 'urea'],
      },
      nitrogenConcentration: {
        field: 'nitrogenConcentration',
        type: 'number',
        required: false,
        description: 'Nitrogen source concentration',
        unit: 'g/L',
        validation: { min: 0, max: 10 },
        examples: [0.1, 0.5, 1.0],
      },
      mediumType: {
        field: 'mediumType',
        type: 'string',
        required: false,
        description: 'Growth medium type',
        validation: {
          enum: ['BBM', 'BG-11', 'modified BG-11', 'TAP', 'artificial seawater', 'custom'],
        },
        examples: ['BBM', 'BG-11', 'custom'],
      },
      salinity: {
        field: 'salinity',
        type: 'number',
        required: false,
        description: 'Salinity level',
        unit: 'g/L',
        validation: { min: 0, max: 100 },
        examples: [0.5, 1.0, 35.0],
      },
    },
    prompt: `Extract substrate and medium information from this research text:

    Text: {input}

    Extract the following substrate and medium parameters:
    - carbonSource: Carbon source type
    - carbonConcentration: Carbon source concentration in g/L
    - nitrogenSource: Nitrogen source type
    - nitrogenConcentration: Nitrogen source concentration in g/L
    - mediumType: Growth medium type
    - salinity: Salinity level in g/L

    Return valid JSON only.`,
    priority: 'medium',
    tags: ['substrate', 'medium', 'nutrients'],
  },

  // Research Metadata
  research_metadata: {
    id: 'research_metadata',
    name: 'Research Metadata',
    description: 'Extract research paper metadata and bibliographic information',
    category: 'metadata',
    schema: {
      title: {
        field: 'title',
        type: 'string',
        required: true,
        description: 'Paper title',
        validation: { min: 10, max: 500 },
        examples: ['Algae-based microbial fuel cells for sustainable energy'],
      },
      authors: {
        field: 'authors',
        type: 'array',
        required: true,
        description: 'List of authors',
        examples: [['Smith, J.', 'Doe, A.', 'Johnson, M.']],
      },
      journal: {
        field: 'journal',
        type: 'string',
        required: false,
        description: 'Journal name',
        examples: ['Applied Energy', 'Bioresource Technology'],
      },
      year: {
        field: 'year',
        type: 'number',
        required: true,
        description: 'Publication year',
        validation: { min: 1900, max: 2030 },
        examples: [2020, 2021, 2022],
      },
      doi: {
        field: 'doi',
        type: 'string',
        required: false,
        description: 'DOI identifier',
        validation: { pattern: /^10\.\d{4,}\/.*$/ },
        examples: ['10.1016/j.apenergy.2021.117456'],
      },
      keywords: {
        field: 'keywords',
        type: 'array',
        required: false,
        description: 'Research keywords',
        examples: [['algae', 'fuel cell', 'bioelectricity', 'renewable energy']],
      },
    },
    prompt: `Extract research metadata from this research text:

    Text: {input}

    Extract the following metadata:
    - title: Paper title
    - authors: List of authors
    - journal: Journal name
    - year: Publication year
    - doi: DOI identifier
    - keywords: Research keywords

    Return valid JSON only.`,
    priority: 'high',
    tags: ['metadata', 'bibliographic', 'paper'],
  },
};

/**
 * Template utility functions
 */
export class ExtractionTemplateManager {
  private templates: Map<string, ExtractionTemplate> = new Map();

  constructor() {
    // Load default templates
    Object.entries(EXTRACTION_TEMPLATES).forEach(([id, template]) => {
      this.templates.set(id, template);
    });
  }

  /**
   * Get template by ID
   */
  getTemplate(id: string): ExtractionTemplate | undefined {
    return this.templates.get(id);
  }

  /**
   * Get templates by category
   */
  getTemplatesByCategory(category: string): ExtractionTemplate[] {
    return Array.from(this.templates.values()).filter((t) => t.category === category);
  }

  /**
   * Get templates by tag
   */
  getTemplatesByTag(tag: string): ExtractionTemplate[] {
    return Array.from(this.templates.values()).filter((t) => t.tags.includes(tag));
  }

  /**
   * Get high priority templates
   */
  getHighPriorityTemplates(): ExtractionTemplate[] {
    return Array.from(this.templates.values()).filter((t) => t.priority === 'high');
  }

  /**
   * Get all templates
   */
  getAllTemplates(): ExtractionTemplate[] {
    return Array.from(this.templates.values());
  }

  /**
   * Add custom template
   */
  addTemplate(template: ExtractionTemplate): void {
    this.templates.set(template.id, template);
  }

  /**
   * Remove template
   */
  removeTemplate(id: string): boolean {
    return this.templates.delete(id);
  }

  /**
   * Validate template schema
   */
  validateTemplate(template: ExtractionTemplate): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!template.id) errors.push('Template ID is required');
    if (!template.name) errors.push('Template name is required');
    if (!template.description) errors.push('Template description is required');
    if (!template.category) errors.push('Template category is required');
    if (!template.prompt) errors.push('Template prompt is required');
    if (!template.schema || Object.keys(template.schema).length === 0) {
      errors.push('Template schema is required');
    }

    return { valid: errors.length === 0, errors };
  }
}
