import type { ParameterDetail, ParameterCategory } from '../../../types/parameters';

// Cache for parameter details
const detailCache = new Map<string, ParameterDetail>();

// Mapping of parameter IDs to markdown file paths
// Based on actual files in /parameters/parameters-v1/ directory
const MARKDOWN_MAPPINGS: Record<string, string> = {
  // Anode materials (2 files available)
  carbon_cloth: '/parameters/parameters-v1/materials/anodes/carbon-cloth-anode.md',
  // MXene materials - using generic mxene file for all MXene variants
  ti3c2tx_mxene: '/parameters/parameters-v1/materials/anodes/mxene-anode.md',
  nb2ctx_mxene: '/parameters/parameters-v1/materials/anodes/mxene-anode.md',
  v2ctx_mxene: '/parameters/parameters-v1/materials/anodes/mxene-anode.md',

  // Cathode materials (2 files available)
  air_cathode: '/parameters/parameters-v1/materials/cathodes/air-cathode.md',
  platinum_cathode: '/parameters/parameters-v1/materials/cathodes/platinum-cathode.md',

  // Membranes (1 file available)
  proton_exchange_membrane: '/parameters/parameters-v1/materials/membranes/proton-exchange.md',

  // Electrical parameters (5 files available)
  power_density: '/parameters/parameters-v1/electrical/power-density.md',
  current_density: '/parameters/parameters-v1/electrical/current-density.md',
  voltage_output: '/parameters/parameters-v1/electrical/voltage.md',
  coulombic_efficiency: '/parameters/parameters-v1/electrical/coulombic-efficiency.md',
  internal_resistance: '/parameters/parameters-v1/electrical/resistance.md',

  // Biological parameters (5 files available)
  biofilm_thickness: '/parameters/parameters-v1/biological/biofilm-properties.md',
  electron_transfer_rate: '/parameters/parameters-v1/biological/electron-transfer.md',
  growth_rate: '/parameters/parameters-v1/biological/growth-kinetics.md',
  microbial_diversity: '/parameters/parameters-v1/biological/microbial-communities.md',
  substrate_utilization: '/parameters/parameters-v1/biological/substrate-utilization.md',
};

/**
 * Fetch parameter details by ID
 */
export async function getParameterById(id: string): Promise<ParameterDetail | null> {
  // Check cache first
  if (detailCache.has(id)) {
    return detailCache.get(id)!;
  }

  try {
    // Load unified parameter data
    const response = await fetch('/parameters/MESS_PARAMETERS_UNIFIED.json');
    if (!response.ok) {
      throw new Error(`Failed to load unified parameters: ${response.status}`);
    }

    const unifiedData = await response.json();

    // Find the parameter in the unified data
    let parameter: any = null;
    let categoryData: any = null;
    let subcategoryData: any = null;

    for (const category of unifiedData.categories) {
      for (const subcategory of category.subcategories) {
        const found = subcategory.parameters.find((p: any) => p.id === id);
        if (found) {
          parameter = found;
          categoryData = category;
          subcategoryData = subcategory;
          break;
        }
      }
      if (parameter) break;
    }

    if (!parameter) {
      return null;
    }

    // Build the detail object
    const detail: ParameterDetail = {
      id: parameter.id,
      name: parameter.name,
      category: mapCategoryId(categoryData.id) as ParameterCategory,
      categoryName: categoryData.name,
      subcategory: subcategoryData.name,
      subcategoryId: subcategoryData.id,
      description: parameter.description,
      unit: parameter.unit || '-',
      type: parameter.type,
      range: parameter.range,
      default: parameter.default,
      properties: extractProperties(parameter, categoryData.id),
      validationRules: extractValidationRules(parameter),
      typicalRange: parameter.typical_range,
      compatibility: parameter.compatibility,
      electrodeType: subcategoryData.electrodeType,
      isSystem: true,
      source: 'MESSAI Unified Parameter Library',
    };

    // Load markdown content if available
    const markdownPath = MARKDOWN_MAPPINGS[id];
    if (markdownPath) {
      try {
        const markdownResponse = await fetch(markdownPath);
        if (markdownResponse.ok) {
          const markdownContent = await markdownResponse.text();
          const parsedContent = parseMarkdownContent(markdownContent);

          // Merge markdown content into detail object
          detail.content = parsedContent.sections;
          detail.references = parsedContent.references;
          detail.performanceMetrics = parsedContent.performanceMetrics;
          detail.preparationMethods = parsedContent.preparationMethods;
          detail.costAnalysis = parsedContent.costAnalysis;
          detail.limitations = parsedContent.limitations;
        }
      } catch (error) {
        console.warn(`Failed to load markdown for ${id}:`, error);
      }
    }

    // Add related parameters
    detail.relatedParameters = getRelatedParameters(id, categoryData.id, subcategoryData.id);

    // Cache the result
    detailCache.set(id, detail);

    return detail;
  } catch (error) {
    console.error('Error loading parameter detail:', error);
    return null;
  }
}

/**
 * Parse markdown content into structured sections
 */
function parseMarkdownContent(markdown: string): {
  sections: any[];
  references: any[];
  performanceMetrics: any;
  preparationMethods: any[];
  costAnalysis: any;
  limitations: any;
} {
  const sections: any[] = [];
  const references: any[] = [];
  let performanceMetrics: any = null;
  const preparationMethods: any[] = [];
  let costAnalysis: any = null;
  let limitations: any = null;

  // Split markdown into sections by headers
  const lines = markdown.split('\n');
  let currentSection: any = null;
  let currentContent: string[] = [];

  for (const line of lines) {
    // Check for headers
    const h2Match = line.match(/^## (.+)$/);
    const h3Match = line.match(/^### (.+)$/);

    if (h2Match) {
      // Save previous section
      if (currentSection) {
        currentSection.content = currentContent.join('\n').trim();
        sections.push(currentSection);
      }

      // Start new section
      currentSection = {
        title: h2Match[1],
        level: 2,
        content: '',
      };
      currentContent = [];

      // Handle special sections
      if (h2Match[1] === 'References') {
        // Parse references section separately
        currentSection = null;
      }
    } else if (h3Match && currentSection) {
      // Add subsection
      if (currentContent.length > 0) {
        currentSection.content = currentContent.join('\n').trim();
        sections.push(currentSection);
      }

      currentSection = {
        title: h3Match[1],
        level: 3,
        content: '',
        parent: currentSection.title,
      };
      currentContent = [];
    } else if (currentSection) {
      currentContent.push(line);
    }

    // Extract references
    if (line) {
      const refMatch = line.match(/^\d+\.\s+(.+)$/);
      if (refMatch && currentSection === null) {
        references.push({ text: refMatch[1] });
      }
    }
  }

  // Save last section
  if (currentSection) {
    currentSection.content = currentContent.join('\n').trim();
    sections.push(currentSection);
  }

  // Extract specific data from sections
  for (const section of sections) {
    if (
      section.title === 'Electrochemical Properties' ||
      section.title === 'Performance Characteristics'
    ) {
      performanceMetrics = extractPerformanceMetrics(section.content);
    } else if (section.title === 'Preparation Methods') {
      preparationMethods.push(...extractPreparationMethods(section.content));
    } else if (section.title === 'Cost Analysis') {
      costAnalysis = extractCostAnalysis(section.content);
    } else if (section.title === 'Limitations') {
      limitations = extractLimitations(section.content);
    }
  }

  return {
    sections,
    references,
    performanceMetrics,
    preparationMethods,
    costAnalysis,
    limitations,
  };
}

/**
 * Extract performance metrics from content
 */
function extractPerformanceMetrics(content: string): any {
  const metrics: any = {};

  // Look for metric patterns like "Power Density: 5-100 W/m³"
  const metricPatterns = [
    /Power Density[:\s]+([0-9\-\.]+)\s*-?\s*([0-9\-\.]+)?\s*([A-Za-z\/³²]+)/i,
    /Current Density[:\s]+([0-9\-\.]+)\s*-?\s*([0-9\-\.]+)?\s*([A-Za-z\/³²]+)/i,
    /Voltage Output[:\s]+([0-9\-\.]+)\s*-?\s*([0-9\-\.]+)?\s*(V)/i,
    /Coulombic Efficiency[:\s]+([0-9\-\.]+)\s*-?\s*([0-9\-\.]+)?\s*(%)/i,
  ];

  for (const pattern of metricPatterns) {
    const match = content.match(pattern);
    if (match) {
      const key = pattern.source.split('[')[0].trim();
      metrics[key.toLowerCase().replace(/\s+/g, '_')] = {
        min: parseFloat(match[1]),
        max: match[2] ? parseFloat(match[2]) : parseFloat(match[1]),
        unit: match[3] || match[2],
      };
    }
  }

  return Object.keys(metrics).length > 0 ? metrics : null;
}

/**
 * Extract preparation methods
 */
function extractPreparationMethods(content: string): any[] {
  const methods: any[] = [];

  // Simple extraction - look for numbered lists or bullet points
  const lines = content.split('\n');
  let currentMethod: any = null;

  for (const line of lines) {
    const methodMatch = line?.match(/^\d+\.\s+\*\*(.+?)\*\*:?$/);
    if (methodMatch && methodMatch[1]) {
      if (currentMethod) {
        methods.push(currentMethod);
      }
      currentMethod = {
        name: methodMatch[1],
        steps: [],
      };
    } else if (currentMethod && line && line.trim().startsWith('-')) {
      currentMethod.steps.push(line.trim().substring(1).trim());
    }
  }

  if (currentMethod) {
    methods.push(currentMethod);
  }

  return methods;
}

/**
 * Extract cost analysis
 */
function extractCostAnalysis(content: string): any {
  const costs: any = {};

  // Look for cost patterns like "Material Cost: $10-50 per m²"
  const costPattern = /(.+?):\s*\$?([0-9\-\.]+)\s*-?\s*([0-9\-\.]+)?\s*(.+)/g;
  let match;

  while ((match = costPattern.exec(content)) !== null) {
    const key = match[1].toLowerCase().replace(/[^a-z0-9]/g, '_');
    costs[key] = {
      min: parseFloat(match[2]),
      max: match[3] ? parseFloat(match[3]) : parseFloat(match[2]),
      unit: match[4].trim(),
    };
  }

  return Object.keys(costs).length > 0 ? costs : null;
}

/**
 * Extract limitations
 */
function extractLimitations(content: string): any {
  const limitations = {
    performance: [],
    practical: [],
  };

  const lines = content.split('\n');
  let currentCategory = '';

  for (const line of lines) {
    if (line.includes('Performance Limitations')) {
      currentCategory = 'performance';
    } else if (line.includes('Practical Challenges')) {
      currentCategory = 'practical';
    } else if (line.trim().startsWith('-') && currentCategory) {
      const limitation = line.trim().substring(1).trim();
      if (currentCategory === 'performance') {
        limitations.performance.push(limitation);
      } else if (currentCategory === 'practical') {
        limitations.practical.push(limitation);
      }
    }
  }

  return limitations;
}

/**
 * Map category ID to our enum
 */
function mapCategoryId(categoryId: string): ParameterCategory {
  const mapping: Record<string, ParameterCategory> = {
    'environmental-parameters': 'operating_condition',
    'material-parameters': 'electrode',
    'biological-parameters': 'microbe',
    'substrate-parameters': 'substrate',
    'membrane-parameters': 'membrane',
    'cell-level-parameters': 'system_configuration',
    'reactor-level-parameters': 'system_configuration',
    'cost-parameters': 'operating_condition',
    'performance-parameters': 'operating_condition',
    'analytical-parameters': 'operating_condition',
    'quality-control-parameters': 'operating_condition',
    'safety-parameters': 'operating_condition',
    'standardization-parameters': 'operating_condition',
  };
  return (mapping[categoryId] || 'operating_condition') as ParameterCategory;
}

/**
 * Extract properties from parameter
 */
function extractProperties(parameter: any, categoryId: string): Record<string, any> {
  const properties: Record<string, any> = {};

  if (parameter.unit) properties.unit = parameter.unit;
  if (parameter.range) {
    properties.min = parameter.range.min;
    properties.max = parameter.range.max;
  }
  if (parameter.default !== undefined) properties.default = parameter.default;
  if (parameter.typical_range) {
    properties.typicalMin = parameter.typical_range.min;
    properties.typicalMax = parameter.typical_range.max;
  }

  return properties;
}

/**
 * Extract validation rules
 */
function extractValidationRules(parameter: any): any[] {
  const rules = [];

  if (parameter.range) {
    rules.push({
      type: 'range',
      min: parameter.range.min,
      max: parameter.range.max,
      message: `Value must be between ${parameter.range.min} and ${parameter.range.max}`,
    });
  }

  if (parameter.validation_rule) {
    rules.push({
      type: 'custom',
      rule: parameter.validation_rule,
      message: parameter.validation_message,
    });
  }

  return rules;
}

/**
 * Get related parameters
 */
function getRelatedParameters(id: string, categoryId: string, subcategoryId: string): any[] {
  const related = [];

  // Add some hardcoded related parameters based on category
  if (subcategoryId === 'anode-materials') {
    related.push(
      { id: 'graphite_felt', name: 'Graphite Felt' },
      { id: 'carbon_brush', name: 'Carbon Brush' },
      { id: 'mxene_anode', name: 'MXene Anode' }
    );
  } else if (subcategoryId === 'cathode-materials') {
    related.push(
      { id: 'air_cathode', name: 'Air Cathode' },
      { id: 'platinum_cathode', name: 'Platinum Cathode' }
    );
  }

  // Filter out the current parameter
  return related.filter((p) => p.id !== id).slice(0, 5);
}
