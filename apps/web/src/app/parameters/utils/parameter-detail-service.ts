import type {
  ParameterDetail,
  ParameterCategory,
  Definition,
  TypicalValues,
  MeasurementMethod,
  AffectingFactors,
  PerformanceImpact,
  CompatibleSystems,
  Limitations,
  ValidationRules as ValidationRulesType,
  Reference,
  CompositionStructure,
  ElectrochemicalProperties,
  AlternativeSystem,
  SpeciesConsideration,
  TransferMechanism,
  MolecularBiology,
  Formula,
  ApplicationNote,
  CostAnalysis,
  PreparationMethod,
} from '../../../types/parameters';
import { getParameterCategory } from './parameter-categories';
import { getRelatedParameterRecommendations, getSystemParameters } from './parameter-data';

// Cache for parameter details
const detailCache = new Map<string, ParameterDetail>();

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

  // Biological parameters (original 5 files)
  biofilm_thickness: '/parameters/parameters-v1/biological/biofilm-properties.md',
  microbial_diversity: '/parameters/parameters-v1/biological/microbial-communities.md',
  substrate_utilization: '/parameters/parameters-v1/biological/substrate-utilization.md',

  // Newly generated biological parameters (January 2025)
  biofilm_conductivity: '/parameters/parameters-v1/biological/biofilm-conductivity.md',
  biofilm_coverage: '/parameters/parameters-v1/biological/biofilm-coverage.md',
  biofilm_density: '/parameters/parameters-v1/biological/biofilm-density.md',
  biofilm_porosity: '/parameters/parameters-v1/biological/biofilm-porosity.md',
  biofilm_roughness: '/parameters/parameters-v1/biological/biofilm-roughness.md',
  biofilm_adhesion_strength: '/parameters/parameters-v1/biological/biofilm-adhesion-strength.md',
  metabolic_activity: '/parameters/parameters-v1/biological/metabolic-activity.md',
  substrate_utilization_rate: '/parameters/parameters-v1/biological/substrate-utilization-rate.md',
  mediator_concentration: '/parameters/parameters-v1/biological/mediator-concentration.md',
  doubling_time: '/parameters/parameters-v1/biological/doubling-time.md',
  atp_concentration: '/parameters/parameters-v1/biological/atp-concentration.md',
  enzyme_activity: '/parameters/parameters-v1/biological/enzyme-activity.md',
  metabolic_rate: '/parameters/parameters-v1/biological/metabolic-rate.md',
  respiration_rate: '/parameters/parameters-v1/biological/respiration-rate.md',
  half_saturation_constant: '/parameters/parameters-v1/biological/half-saturation-constant.md',

  // Newly generated electrical parameters (January 2025)
  faradaic_efficiency: '/parameters/parameters-v1/electrical/faradaic-efficiency.md',
  exchange_current_density: '/parameters/parameters-v1/electrical/exchange-current-density.md',
  overpotential: '/parameters/parameters-v1/electrical/overpotential.md',
  tafel_slope: '/parameters/parameters-v1/electrical/tafel-slope.md',

  // Additional biological parameters (January 2025)
  decay_rate: '/parameters/parameters-v1/biological/decay-rate.md',
  maximum_growth_rate: '/parameters/parameters-v1/biological/maximum-growth-rate.md',
  yield_coefficient: '/parameters/parameters-v1/biological/yield-coefficient.md',
  inhibition_constant: '/parameters/parameters-v1/biological/inhibition-constant.md',
  maintenance_coefficient: '/parameters/parameters-v1/biological/maintenance-coefficient.md',
  substrate_affinity: '/parameters/parameters-v1/biological/substrate-affinity.md',
  substrate_uptake_rate: '/parameters/parameters-v1/biological/substrate-uptake-rate.md',
  dominant_species_fraction: '/parameters/parameters-v1/biological/dominant-species-fraction.md',

  // Additional electrical parameters (January 2025)
  limiting_current: '/parameters/parameters-v1/electrical/limiting-current.md',
  double_layer_capacitance: '/parameters/parameters-v1/electrical/double-layer-capacitance.md',
  charge_transfer_resistance: '/parameters/parameters-v1/electrical/charge-transfer-resistance.md',
  power_efficiency: '/parameters/parameters-v1/electrical/power-efficiency.md',

  // Newly generated materials parameters (January 2025)
  conductivity_printed: '/parameters/parameters-v1/materials/conductivity-printed.md',
  material_viscosity: '/parameters/parameters-v1/materials/material-viscosity.md',
  layer_resolution: '/parameters/parameters-v1/materials/layer-resolution.md',
  shrinkage_rate: '/parameters/parameters-v1/materials/shrinkage-rate.md',
  printing_speed: '/parameters/parameters-v1/materials/printing-speed.md',
  nozzle_temperature: '/parameters/parameters-v1/materials/nozzle-temperature.md',
  bed_temperature: '/parameters/parameters-v1/materials/bed-temperature.md',

  // Latest biological parameters (January 2025)
  extracellular_polymeric_substances:
    '/parameters/parameters-v1/biological/extracellular-polymeric-substances.md',
  cell_viability: '/parameters/parameters-v1/biological/cell-viability.md',
  biofilm_age: '/parameters/parameters-v1/biological/biofilm-age.md',
  biofilm_resistance: '/parameters/parameters-v1/biological/biofilm-resistance.md',

  // Latest electrical parameters (January 2025)
  redox_potential: '/parameters/parameters-v1/electrical/redox-potential.md',

  // Latest physical parameters (January 2025)
  electrode_spacing_cell: '/parameters/parameters-v1/physical/electrode-spacing-cell.md',
  cell_volume: '/parameters/parameters-v1/physical/cell-volume.md',

  // More biological parameters (January 2025)
  // extracellular_polymeric_substances already defined above

  // Newly generated chemical parameters (January 2025)
  chemical_stability: '/parameters/parameters-v1/chemical/chemical-stability.md',
  ionic_strength: '/parameters/parameters-v1/chemical/ionic-strength.md',
  buffer_concentration: '/parameters/parameters-v1/chemical/buffer-concentration.md',

  // Newly generated operational parameters (January 2025)
  calibration_frequency: '/parameters/parameters-v1/operational/calibration-frequency.md',
  detection_limit: '/parameters/parameters-v1/operational/detection-limit.md',

  // Newly generated performance parameters (January 2025)
  conversion_efficiency: '/parameters/parameters-v1/performance/conversion-efficiency.md',
  h2_production_rate: '/parameters/parameters-v1/performance/h2-production-rate.md',

  // Newly generated environmental parameters (January 2025)
  ambient_temperature: '/parameters/parameters-v1/environmental/ambient-temperature.md',
  atmospheric_pressure: '/parameters/parameters-v1/environmental/atmospheric-pressure.md',
  relative_humidity: '/parameters/parameters-v1/environmental/relative-humidity.md',
  co2_concentration: '/parameters/parameters-v1/environmental/co2-concentration.md',

  // Latest batch - Chemical parameters (January 2025)
  c_n_ratio: '/parameters/parameters-v1/chemical/c-n-ratio.md',
  surface_tension: '/parameters/parameters-v1/chemical/surface-tension.md',
  corrosivity: '/parameters/parameters-v1/chemical/corrosivity.md',

  // Latest batch - Biological parameters (January 2025)
  bod_concentration: '/parameters/parameters-v1/biological/bod-concentration.md',

  // Latest batch - Electrical parameters (January 2025)
  electrode_potential: '/parameters/parameters-v1/electrical/electrode-potential.md',
  cell_potential: '/parameters/parameters-v1/electrical/cell-potential.md',
  current_efficiency: '/parameters/parameters-v1/electrical/current-efficiency.md',
  resistance: '/parameters/parameters-v1/electrical/system-resistance.md',

  // Latest batch - Environmental parameters (January 2025)
  air_flow_rate: '/parameters/parameters-v1/environmental/air-flow-rate.md',
  ambient_oxygen_concentration:
    '/parameters/parameters-v1/environmental/ambient-oxygen-concentration.md',

  // Latest batch - Performance parameters (January 2025)
  biogas_yield: '/parameters/parameters-v1/performance/biogas-yield.md',
  ch4_content_biogas: '/parameters/parameters-v1/performance/methane-content.md',
  ch4_production_rate: '/parameters/parameters-v1/performance/methane-production-rate.md',

  // New batch - Biological parameters (January 2025)
  // biofilm_thickness: '/parameters/parameters-v1/biological/biofilm-thickness.md', // DUPLICATE: Removed - already defined on line 117
  bacterial_concentration: '/parameters/parameters-v1/biological/bacterial-concentration.md',

  // New batch - Materials parameters (January 2025)
  surface_roughness: '/parameters/parameters-v1/materials/surface-roughness.md',
  porosity: '/parameters/parameters-v1/materials/porosity.md',
  catalyst_loading: '/parameters/parameters-v1/materials/catalyst-loading.md',
  membrane_thickness: '/parameters/parameters-v1/materials/membrane-thickness.md',

  // New batch - Safety parameters (January 2025)
  compliance_audits: '/parameters/parameters-v1/safety/compliance-audits.md',
  emission_standard_co2: '/parameters/parameters-v1/safety/emission-standard-co2.md',

  // New batch - Monitoring parameters (January 2025)
  sampling_rate: '/parameters/parameters-v1/monitoring/sampling-rate.md',
  model_accuracy: '/parameters/parameters-v1/monitoring/model-accuracy.md',
  alarm_threshold_temperature:
    '/parameters/parameters-v1/monitoring/alarm-threshold-temperature.md',

  // New batch - Economic parameters (January 2025)
  carbon_footprint: '/parameters/parameters-v1/economic/carbon-footprint.md',
  payback_period: '/parameters/parameters-v1/economic/payback-period.md',

  // Current batch - Biological parameters (January 2025)
  initial_substrate_conc: '/parameters/parameters-v1/biological/initial-substrate-concentration.md',
  substrate_loading_rate: '/parameters/parameters-v1/biological/substrate-loading-rate.md',
  inoculum_concentration: '/parameters/parameters-v1/biological/inoculum-concentration.md',

  // Current batch - Physical parameters (January 2025)
  electrode_surface_area: '/parameters/parameters-v1/physical/electrode-surface-area.md',
  contact_resistance: '/parameters/parameters-v1/physical/contact-resistance.md',
  reactor_geometry: '/parameters/parameters-v1/physical/reactor-geometry.md',

  // Current batch - Operational parameters (January 2025)
  hydraulic_retention_time: '/parameters/parameters-v1/operational/hydraulic-retention-time.md',
  flow_rate: '/parameters/parameters-v1/operational/flow-rate.md',
  operating_temperature: '/parameters/parameters-v1/operational/operating-temperature.md',

  // Current batch - Chemical parameters (January 2025)
  dissolved_oxygen: '/parameters/parameters-v1/chemical/dissolved-oxygen.md',
  conductivity: '/parameters/parameters-v1/chemical/electrolyte-conductivity.md',
  ph_level: '/parameters/parameters-v1/chemical/ph-level.md',

  // Current batch - Materials parameters (January 2025)
  specific_surface_area: '/parameters/parameters-v1/materials/specific-surface-area.md',

  // Current batch - Environmental parameters (January 2025)
  // atmospheric_pressure: '/parameters/parameters-v1/environmental/atmospheric-pressure-env.md', // DUPLICATE: Removed - already defined on line 203

  // Latest batch - Core parameters (January 2025)
  cod_concentration: '/parameters/parameters-v1/biological/cod-concentration.md',
  substrate_concentration: '/parameters/parameters-v1/biological/substrate-concentration.md',
  biofilm_permeability: '/parameters/parameters-v1/biological/biofilm-permeability.md',
  microbial_activity: '/parameters/parameters-v1/biological/microbial-activity.md',
  voltage_stability: '/parameters/parameters-v1/electrical/voltage-stability.md',
  energy_density: '/parameters/parameters-v1/electrical/energy-density.md',
  diffusion_resistance: '/parameters/parameters-v1/electrical/diffusion-resistance.md',
  electrode_thickness: '/parameters/parameters-v1/materials/electrode-thickness.md',
  membrane_permeability: '/parameters/parameters-v1/materials/membrane-permeability.md',
  porosity_electrode: '/parameters/parameters-v1/materials/porosity-electrode.md',
  mass_transfer_coefficient: '/parameters/parameters-v1/physical/mass-transfer-coefficient.md',
  hydraulic_permeability: '/parameters/parameters-v1/physical/hydraulic-permeability.md',
  ionic_conductivity: '/parameters/parameters-v1/chemical/ionic-conductivity.md',
  ohmic_resistance: '/parameters/parameters-v1/operational/ohmic-resistance.md',

  // Batch 6 - High-priority parameters (January 2025)
  electron_transfer_rate: '/parameters/parameters-v1/biological/electron-transfer-rate.md',
  growth_rate: '/parameters/parameters-v1/biological/growth-rate.md',
  oxidation_reduction_potential:
    '/parameters/parameters-v1/chemical/oxidation-reduction-potential.md',
  salt_concentration: '/parameters/parameters-v1/chemical/salt-concentration.md',
  capacitance: '/parameters/parameters-v1/electrical/capacitance.md',
  cell_voltage: '/parameters/parameters-v1/electrical/cell-voltage.md',
  maximum_power_density: '/parameters/parameters-v1/electrical/maximum-power-density.md',
  // conductivity: already defined as electrolyte-conductivity on line 270
  viscosity: '/parameters/parameters-v1/chemical/viscosity.md',
  total_dissolved_solids: '/parameters/parameters-v1/chemical/total-dissolved-solids.md',
  cell_diameter: '/parameters/parameters-v1/physical/cell-diameter.md',
  cell_height: '/parameters/parameters-v1/physical/cell-height.md',
  energy_efficiency: '/parameters/parameters-v1/performance/energy-efficiency.md',
  h2_purity: '/parameters/parameters-v1/performance/h2-purity.md',

  // Placeholder mappings for parameters not yet generated
  microbial_growth_rate: '/parameters/parameters-v1/biological/growth-rate.md',
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
    const response = await fetch('/parameters/MESS_PARAMETERS_UNIFIED_FINAL.json');
    if (!response.ok) {
      throw new Error(`Failed to load unified parameters: ${response.status}`);
    }

    const unifiedData = await response.json();

    // Validate data structure
    if (!unifiedData || !unifiedData.categories || !Array.isArray(unifiedData.categories)) {
      throw new Error('Invalid unified data structure: missing categories');
    }

    // Find the parameter in the unified data
    let parameter: any = null;
    let categoryData: any = null;
    let subcategoryData: any = null;

    for (const category of unifiedData.categories) {
      if (!category.subcategories || !Array.isArray(category.subcategories)) {
        continue;
      }

      for (const subcategory of category.subcategories) {
        if (!subcategory.parameters || !Array.isArray(subcategory.parameters)) {
          continue;
        }

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
      console.log(`Parameter not found: ${id}`);
      return null;
    }

    // Validate parameter structure
    if (!parameter.name || !parameter.id) {
      console.log(`Invalid parameter structure for ${id}: missing name or id`);
      return null;
    }

    // Check if this is a categorical variable - if so, don't show it as a parameter
    if (isCategoricalVariable(parameter)) {
      console.log(
        `Filtering out categorical variable in detail view: ${parameter.name} (${parameter.id})`
      );
      return null;
    }

    // Build the detail object
    const detail: ParameterDetail = {
      id: parameter.id || '',
      name: parameter.name || '',
      category: mapCategoryId(categoryData?.id || '') as ParameterCategory,
      displayCategory: getParameterCategory(parameter, categoryData?.id || ''),
      categoryName: categoryData?.name || '',
      subcategory: subcategoryData?.name || '',
      subcategoryId: subcategoryData?.id || '',
      description: parameter.description || '',
      unit: parameter.unit || '-',
      type: parameter.type || 'string',
      range: parameter.range,
      default: parameter.default,
      properties: extractProperties(parameter, categoryData?.id || ''),
      validationRules: extractValidationRules(parameter) as any,
      typicalRange: parameter.typical_range,
      compatibility: parameter.compatibility,
      electrodeType: subcategoryData?.electrodeType,
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
          detail.detailReferences = parsedContent.references;
          detail.performanceMetrics = parsedContent.performanceMetrics;
          detail.preparationMethods = parsedContent.preparationMethods;
          if (parsedContent.costAnalysis) detail.costAnalysis = parsedContent.costAnalysis;
          if (parsedContent.limitations) detail.limitations = parsedContent.limitations;

          // Add new detail sections
          if (parsedContent.definition) detail.definition = parsedContent.definition;
          if (parsedContent.typicalValues) detail.typicalValues = parsedContent.typicalValues;
          if (parsedContent.measurementMethods)
            detail.measurementMethods = parsedContent.measurementMethods;
          if (parsedContent.affectingFactors)
            detail.affectingFactors = parsedContent.affectingFactors;
          if (parsedContent.performanceImpact)
            detail.performanceImpact = parsedContent.performanceImpact;
          if (parsedContent.compatibleSystems)
            detail.compatibleSystems = parsedContent.compatibleSystems;
          if (parsedContent.validationRulesSection)
            detail.detailValidationRules = parsedContent.validationRulesSection;

          // Category-specific sections
          if (parsedContent.compositionStructure)
            detail.compositionStructure = parsedContent.compositionStructure;
          if (parsedContent.electrochemicalProperties)
            detail.electrochemicalProperties = parsedContent.electrochemicalProperties;
          if (parsedContent.alternativeSystems)
            detail.alternativeSystems = parsedContent.alternativeSystems;
          if (parsedContent.speciesConsiderations)
            detail.speciesConsiderations = parsedContent.speciesConsiderations;
          if (parsedContent.transferMechanisms)
            detail.transferMechanisms = parsedContent.transferMechanisms;
          if (parsedContent.molecularBiology)
            detail.molecularBiology = parsedContent.molecularBiology;
          if (parsedContent.formula) detail.formula = parsedContent.formula;
          if (parsedContent.applicationNotes)
            detail.applicationNotes = parsedContent.applicationNotes;
        }
      } catch (error) {
        console.warn(`Failed to load markdown for ${id}:`, error);
      }
    }

    // Add related parameters using the enhanced recommendation system
    const allParameters = await getSystemParameters();
    // Create a basic Parameter object for the recommendation system
    const parameterForRecommendation = {
      id: detail.id,
      name: detail.name,
      category: detail.category,
      displayCategory: detail.displayCategory || 'materials',
      subcategory: detail.subcategory,
      description: detail.description,
      properties: detail.properties || {},
      isSystem: detail.isSystem,
      unit: detail.unit,
      range: detail.range,
      default: detail.default,
      typicalRange: detail.typicalRange,
      validationRules: Array.isArray(detail.validationRules)
        ? detail.validationRules.map((r) => (typeof r === 'string' ? r : (r as any).message || ''))
        : [],
    } as any;
    const relatedParams = getRelatedParameterRecommendations(
      parameterForRecommendation,
      allParameters,
      5
    );
    detail.relatedParameters = relatedParams.map((p) => ({
      id: p.id,
      name: p.name,
      category: p.displayCategory || p.category,
    }));

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
  references: Reference[];
  performanceMetrics: any;
  preparationMethods: PreparationMethod[];
  costAnalysis: CostAnalysis | null;
  limitations: Limitations | null;
  definition: Definition | null;
  typicalValues: TypicalValues | null;
  measurementMethods: MeasurementMethod[];
  affectingFactors: AffectingFactors | null;
  performanceImpact: PerformanceImpact | null;
  compatibleSystems: CompatibleSystems | null;
  validationRulesSection: ValidationRulesType | null;
  compositionStructure: CompositionStructure | null;
  electrochemicalProperties: ElectrochemicalProperties | null;
  alternativeSystems: AlternativeSystem[];
  speciesConsiderations: SpeciesConsideration[];
  transferMechanisms: TransferMechanism[];
  molecularBiology: MolecularBiology | null;
  formula: Formula | null;
  applicationNotes: ApplicationNote[];
} {
  const sections: any[] = [];
  const references: Reference[] = [];
  let performanceMetrics: any = null;
  const preparationMethods: PreparationMethod[] = [];
  let costAnalysis: CostAnalysis | null = null;
  let limitations: Limitations | null = null;

  // New detail sections
  let definition: Definition | null = null;
  let typicalValues: TypicalValues | null = null;
  const measurementMethods: MeasurementMethod[] = [];
  let affectingFactors: AffectingFactors | null = null;
  let performanceImpact: PerformanceImpact | null = null;
  let compatibleSystems: CompatibleSystems | null = null;
  let validationRulesSection: ValidationRulesType | null = null;

  // Category-specific sections
  let compositionStructure: CompositionStructure | null = null;
  let electrochemicalProperties: ElectrochemicalProperties | null = null;
  const alternativeSystems: AlternativeSystem[] = [];
  const speciesConsiderations: SpeciesConsideration[] = [];
  const transferMechanisms: TransferMechanism[] = [];
  let molecularBiology: MolecularBiology | null = null;
  let formula: Formula | null = null;
  const applicationNotes: ApplicationNote[] = [];

  // Split markdown into sections by headers
  const lines = markdown.split('\n');
  let currentSection: any = null;
  let currentContent: string[] = [];

  for (const line of lines) {
    // Check for headers
    const h2Match = line.match(/^## (.+)$/);
    const h3Match = line.match(/^### (.+)$/);

    if (h2Match && h2Match[1]) {
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
    } else if (h3Match && h3Match[1] && currentSection) {
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
      if (refMatch && refMatch[1] && currentSection === null) {
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
    const title = section.title.toLowerCase();

    // Core sections
    if (title === 'definition') {
      definition = extractDefinition(section.content);
    } else if (title === 'typical values') {
      typicalValues = extractTypicalValues(section.content);
    } else if (title === 'measurement methods') {
      measurementMethods.push(...extractMeasurementMethods(section.content));
    } else if (title === 'affecting factors') {
      affectingFactors = extractAffectingFactors(section.content);
    } else if (title === 'performance impact' || title === 'performance characteristics') {
      performanceImpact = extractPerformanceImpact(section.content);
      performanceMetrics = extractPerformanceMetrics(section.content);
    } else if (title === 'compatible systems') {
      compatibleSystems = extractCompatibleSystems(section.content);
    } else if (title === 'validation rules') {
      validationRulesSection = extractValidationRulesSection(section.content);
    } else if (title === 'limitations') {
      limitations = extractLimitations(section.content);
    } else if (title === 'preparation methods') {
      preparationMethods.push(...extractPreparationMethods(section.content));
    } else if (title === 'cost analysis') {
      costAnalysis = extractCostAnalysis(section.content);
    }

    // Category-specific sections
    else if (title === 'composition & structure' || title === 'composition and structure') {
      compositionStructure = extractCompositionStructure(section.content);
    } else if (title === 'electrochemical properties') {
      electrochemicalProperties = extractElectrochemicalProperties(section.content);
      performanceMetrics = extractPerformanceMetrics(section.content);
    } else if (title === 'alternative catalyst systems' || title === 'alternative systems') {
      alternativeSystems.push(...extractAlternativeSystems(section.content));
    } else if (title === 'species considerations') {
      speciesConsiderations.push(...extractSpeciesConsiderations(section.content));
    } else if (title === 'transfer mechanisms' || title === 'transfer mechanism distribution') {
      transferMechanisms.push(...extractTransferMechanisms(section.content));
    } else if (title === 'molecular biology') {
      molecularBiology = extractMolecularBiology(section.content);
    } else if (title === 'formula') {
      formula = extractFormula(section.content);
    } else if (title === 'application notes') {
      applicationNotes.push(...extractApplicationNotes(section.content));
    }
  }

  return {
    sections,
    references,
    performanceMetrics,
    preparationMethods,
    costAnalysis,
    limitations,
    definition,
    typicalValues,
    measurementMethods,
    affectingFactors,
    performanceImpact,
    compatibleSystems,
    validationRulesSection,
    compositionStructure,
    electrochemicalProperties,
    alternativeSystems,
    speciesConsiderations,
    transferMechanisms,
    molecularBiology,
    formula,
    applicationNotes,
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
    if (match && match[1]) {
      const key = pattern.source?.split('[')[0]?.trim() || 'unknown';
      metrics[key.toLowerCase().replace(/\s+/g, '_')] = {
        min: parseFloat(match[1] || '0'),
        max: match[2] ? parseFloat(match[2]) : parseFloat(match[1] || '0'),
        unit: match[3] || match[2] || '',
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
    if (match && match[1] && match[2]) {
      const key = (match[1] || 'cost').toLowerCase().replace(/[^a-z0-9]/g, '_');
      costs[key] = {
        min: parseFloat(match[2] || '0'),
        max: match[3] ? parseFloat(match[3]) : parseFloat(match[2] || '0'),
        unit: (match[4] || '').trim(),
      };
    }
  }

  return Object.keys(costs).length > 0 ? costs : null;
}

/**
 * Extract limitations
 */
function extractLimitations(content: string): any {
  const limitations = {
    performance: [] as string[],
    practical: [] as string[],
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
function extractProperties(parameter: any, _categoryId: string): Record<string, any> {
  const properties: Record<string, any> = {};

  if (parameter?.unit) properties['unit'] = parameter.unit;
  if (parameter?.range) {
    properties['min'] = parameter.range.min;
    properties['max'] = parameter.range.max;
  }
  if (parameter?.default !== undefined) properties['default'] = parameter.default;
  if (parameter?.typical_range) {
    properties['typicalMin'] = parameter.typical_range.min;
    properties['typicalMax'] = parameter.typical_range.max;
  }

  return properties;
}

/**
 * Extract validation rules
 */
function extractValidationRules(parameter: any): any[] {
  const rules = [];

  if (parameter?.range) {
    rules.push({
      type: 'range',
      min: parameter.range.min,
      max: parameter.range.max,
      message: `Value must be between ${parameter.range.min} and ${parameter.range.max}`,
    });
  }

  if (parameter?.validation_rule) {
    rules.push({
      type: 'custom',
      rule: parameter.validation_rule,
      message: parameter.validation_message,
    });
  }

  return rules;
}

/**
 * Extract definition from content
 */
function extractDefinition(content: string): Definition | null {
  if (!content) return null;

  const lines = content.split('\n');
  const text = lines[0] || '';

  // Look for formula pattern
  const formulaMatch = content.match(/\*\*Formula:\*\*\s*(.+)/);
  const formula = formulaMatch && formulaMatch[1] ? formulaMatch[1] : undefined;

  // Look for variable definitions
  const variables: Definition['variables'] = [];
  const varPattern = /^-?\s*([A-Za-z]+)\s*=\s*(.+?)\s*\(([^)]+)\)/gm;
  let match;
  while ((match = varPattern.exec(content)) !== null) {
    if (match[1] && match[2] && match[3]) {
      variables.push({
        symbol: match[1],
        description: match[2],
        unit: match[3],
      });
    }
  }

  return {
    text,
    ...(formula && { formula }),
    ...(variables.length > 0 && { variables }),
  };
}

/**
 * Extract typical values from content
 */
function extractTypicalValues(content: string): TypicalValues | null {
  if (!content) return null;

  const typicalValues: TypicalValues = {};

  // Extract range
  const rangeMatch = content.match(/Range:\s*([0-9\-\.]+)\s*-\s*([0-9\-\.]+)/);
  if (rangeMatch && rangeMatch[1] && rangeMatch[2]) {
    typicalValues.range = {
      min: parseFloat(rangeMatch[1]),
      max: parseFloat(rangeMatch[2]),
    };
  }

  // Extract typical value
  const typicalMatch = content.match(/Typical:\s*([0-9\-\.]+)/);
  if (typicalMatch && typicalMatch[1]) {
    typicalValues.typical = parseFloat(typicalMatch[1]);
  }

  // Extract outlier threshold
  const outlierMatch = content.match(/Outlier\s*[Tt]hreshold:\s*>?\s*([0-9\-\.]+)/);
  if (outlierMatch && outlierMatch[1]) {
    typicalValues.outlierThreshold = parseFloat(outlierMatch[1]);
  }

  // Extract performance categories
  const categories: TypicalValues['categories'] = [];
  const categoryPattern = /\*\*([^*]+)\*\*:\s*([0-9\-\.]+\s*-\s*[0-9\-\.]+[^(]*)\s*\(([^)]+)\)/g;
  let catMatch;
  while ((catMatch = categoryPattern.exec(content)) !== null) {
    if (catMatch && catMatch[1] && catMatch[2] && catMatch[3]) {
      categories.push({
        name: catMatch[1],
        range: catMatch[2].trim(),
        description: catMatch[3],
      });
    }
  }
  if (categories.length > 0) {
    typicalValues.categories = categories;
  }

  return Object.keys(typicalValues).length > 0 ? typicalValues : null;
}

/**
 * Extract measurement methods from content
 */
function extractMeasurementMethods(content: string): MeasurementMethod[] {
  const methods: MeasurementMethod[] = [];
  const lines = content.split('\n');

  let currentMethod: Partial<MeasurementMethod> | null = null;
  let currentType = '';

  for (const line of lines) {
    // Check for method type headers
    const typeMatch = line.match(/^### (.+)$/);
    if (typeMatch && typeMatch[1]) {
      currentType = typeMatch[1];
      continue;
    }

    // Check for method names
    const methodMatch = line.match(/^-?\s*\*\*(.+?)\*\*:\s*(.+)$/);
    if (methodMatch && methodMatch[1] && methodMatch[2]) {
      if (currentMethod && currentMethod.name) {
        methods.push(currentMethod as MeasurementMethod);
      }
      currentMethod = {
        name: methodMatch[1],
        description: methodMatch[2],
        ...(currentType && { type: currentType }),
      };
    }
  }

  if (currentMethod && currentMethod.name) {
    methods.push(currentMethod as MeasurementMethod);
  }

  return methods;
}

/**
 * Extract affecting factors from content
 */
function extractAffectingFactors(content: string): AffectingFactors | null {
  const factors: AffectingFactors = {
    primary: [],
    secondary: [],
  };

  const lines = content.split('\n');
  let currentSection = '';

  for (const line of lines) {
    if (line.includes('Primary Factors')) {
      currentSection = 'primary';
    } else if (line.includes('Secondary Factors')) {
      currentSection = 'secondary';
    } else if (line.match(/^-?\s*\*\*(.+?)\*\*:\s*(.+)$/)) {
      const match = line.match(/^-?\s*\*\*(.+?)\*\*:\s*(.+)$/);
      if (match && match[1] && match[2] && currentSection) {
        const factor = {
          name: match[1],
          description: match[2],
        };

        if (currentSection === 'primary') {
          factors.primary.push(factor);
        } else if (currentSection === 'secondary') {
          factors.secondary!.push(factor);
        }
      }
    }
  }

  return factors.primary.length > 0 ? factors : null;
}

/**
 * Extract performance impact from content
 */
function extractPerformanceImpact(content: string): PerformanceImpact | null {
  const impact: PerformanceImpact = {};

  // Extract metrics
  const metricsPattern = /\*\*(.+?)\*\*:\s*(.+?)(?:\n|$)/g;
  const metrics: PerformanceImpact['metrics'] = [];
  let match;
  while ((match = metricsPattern.exec(content)) !== null) {
    if (match && match[1] && match[2]) {
      metrics.push({
        name: match[1],
        impact: match[2],
      });
    }
  }
  if (metrics.length > 0) {
    impact.metrics = metrics;
  }

  // Look for stability mentions
  const stabilityMatch = content.match(/[Ss]tability[:\s]+(.+?)(?:\n|$)/);
  if (stabilityMatch && stabilityMatch[1]) {
    impact.stability = stabilityMatch[1];
  }

  return Object.keys(impact).length > 0 ? impact : null;
}

/**
 * Extract compatible systems from content
 */
function extractCompatibleSystems(content: string): CompatibleSystems | null {
  const systems: CompatibleSystems = {};

  // Extract operating conditions
  const conditionsPattern = /\*\*(.+?)\*\*:\s*([0-9\-\.]+\s*-\s*[0-9\-\.]+[^(]*)/g;
  const conditions: CompatibleSystems['operatingConditions'] = [];
  let match;
  while ((match = conditionsPattern.exec(content)) !== null) {
    if (match && match[1] && match[2]) {
      conditions.push({
        parameter: match[1],
        range: match[2].trim(),
      });
    }
  }
  if (conditions.length > 0) {
    systems.operatingConditions = conditions;
  }

  // Extract applications
  const appPattern = /\*\*(.+?)\*\*:\s*([^*\n]+)/g;
  const applications: CompatibleSystems['applications'] = [];
  while ((match = appPattern.exec(content)) !== null) {
    if (
      match &&
      match[1] &&
      match[2] &&
      !match[1].includes('Range') &&
      !match[1].includes('Temperature')
    ) {
      applications.push({
        name: match[1],
        description: match[2].trim(),
      });
    }
  }
  if (applications.length > 0) {
    systems.applications = applications;
  }

  return Object.keys(systems).length > 0 ? systems : null;
}

/**
 * Extract validation rules section from content
 */
function extractValidationRulesSection(content: string): ValidationRulesType | null {
  const rules: ValidationRulesType = {};

  // Extract parameter validation rules
  const paramPattern = /^-?\s*(.+?):\s*(.+)$/gm;
  const parameters: ValidationRulesType['parameters'] = [];
  let match;
  while ((match = paramPattern.exec(content)) !== null) {
    if (match && match[1] && match[2]) {
      parameters.push({
        name: match[1],
        rule: match[2],
      });
    }
  }
  if (parameters.length > 0) {
    rules.parameters = parameters;
  }

  return Object.keys(rules).length > 0 ? rules : null;
}

/**
 * Extract composition structure from content
 */
function extractCompositionStructure(content: string): CompositionStructure | null {
  const structure: CompositionStructure = {};

  // Extract chemical formula
  const formulaMatch = content.match(/Chemical formula:\s*(.+)/i);
  if (formulaMatch && formulaMatch[1]) {
    structure.chemicalFormula = formulaMatch[1];
  }

  // Extract physical properties
  const properties: CompositionStructure['physicalProperties'] = [];
  const propPattern = /\*\*(.+?)\*\*:\s*([0-9\-\.]+)\s*([A-Za-z\/²³]+)?/g;
  let match;
  while ((match = propPattern.exec(content)) !== null) {
    if (match && match[1] && match[2]) {
      properties.push({
        property: match[1],
        value: match[2],
        ...(match[3] && { unit: match[3] }),
      });
    }
  }
  if (properties.length > 0) {
    structure.physicalProperties = properties;
  }

  return Object.keys(structure).length > 0 ? structure : null;
}

/**
 * Extract electrochemical properties from content
 */
function extractElectrochemicalProperties(content: string): ElectrochemicalProperties | null {
  const props: ElectrochemicalProperties = {};

  // Extract standard properties
  const properties: ElectrochemicalProperties['properties'] = [];
  const propPattern = /\*\*(.+?)\*\*:\s*([0-9\-\.]+\s*-?\s*[0-9\-\.]*\s*[A-Za-z\/³²]*)/g;
  let match;
  while ((match = propPattern.exec(content)) !== null) {
    if (match && match[1] && match[2]) {
      properties.push({
        name: match[1],
        value: match[2].trim(),
      });
    }
  }
  if (properties.length > 0) {
    props.properties = properties;
  }

  return Object.keys(props).length > 0 ? props : null;
}

/**
 * Extract alternative systems from content
 */
function extractAlternativeSystems(content: string): AlternativeSystem[] {
  const systems: AlternativeSystem[] = [];
  const lines = content.split('\n');

  let currentSystem: Partial<AlternativeSystem> | null = null;

  for (const line of lines) {
    const systemMatch = line.match(/^\d+\.\s*\*\*(.+?)\*\*:?$/);
    if (systemMatch && systemMatch[1]) {
      if (currentSystem && currentSystem.name) {
        systems.push(currentSystem as AlternativeSystem);
      }
      currentSystem = {
        name: systemMatch[1],
        materials: [],
      };
    } else if (currentSystem && line.includes('-') && !line.includes('**')) {
      const material = line.replace(/^-\s*/, '').trim();
      if (material) {
        currentSystem.materials!.push(material);
      }
    }
  }

  if (currentSystem && currentSystem.name) {
    systems.push(currentSystem as AlternativeSystem);
  }

  return systems;
}

/**
 * Extract species considerations from content
 */
function extractSpeciesConsiderations(content: string): SpeciesConsideration[] {
  const species: SpeciesConsideration[] = [];
  const sections = content.split(/### /);

  for (const section of sections) {
    if (section.trim()) {
      const lines = section.split('\n');
      const speciesName = lines[0]?.trim();
      if (speciesName && !speciesName.includes('Species')) {
        const consideration: SpeciesConsideration = {
          species: speciesName,
          characteristics: [],
        };

        // Extract mechanism
        const mechanismMatch = section.match(/Mechanism:\s*(.+)/);
        if (mechanismMatch && mechanismMatch[1]) {
          consideration.mechanism = mechanismMatch[1];
        }

        // Extract efficiency
        const efficiencyMatch = section.match(/Efficiency:\s*(.+)/);
        if (efficiencyMatch && efficiencyMatch[1]) {
          consideration.efficiency = efficiencyMatch[1];
        }

        // Extract proteins
        const proteinMatch = section.match(/Proteins:\s*(.+)/);
        if (proteinMatch && proteinMatch[1]) {
          consideration.proteins = proteinMatch[1].split(',').map((p) => p.trim());
        }

        species.push(consideration);
      }
    }
  }

  return species;
}

/**
 * Extract transfer mechanisms from content
 */
function extractTransferMechanisms(content: string): TransferMechanism[] {
  const mechanisms: TransferMechanism[] = [];
  const lines = content.split('\n');

  for (const line of lines) {
    const mechMatch = line.match(/\*\*(.+?)\*\*:\s*([0-9\-]+%)\s*(.+)/);
    if (mechMatch && mechMatch[1] && mechMatch[2] && mechMatch[3]) {
      mechanisms.push({
        type: mechMatch[1],
        efficiency: mechMatch[2],
        description: mechMatch[3],
      });
    }
  }

  return mechanisms;
}

/**
 * Extract molecular biology from content
 */
function extractMolecularBiology(content: string): MolecularBiology | null {
  const biology: MolecularBiology = {};

  // Extract gene expression
  const geneMatch = content.match(/Gene expression:\s*(.+)/i);
  if (geneMatch && geneMatch[1]) {
    biology.geneExpression = geneMatch[1].split(',').map((g) => g.trim());
  }

  // Extract proteins
  const proteinSection = content.match(/Proteins?:\s*([\s\S]+?)(?=\n\n|\n[A-Z]|$)/);
  if (proteinSection && proteinSection[1]) {
    const proteins: MolecularBiology['proteins'] = [];
    const proteinLines = proteinSection[1].split('\n');
    for (const line of proteinLines) {
      const match = line.match(/(.+?):\s*(.+)/);
      if (match && match[1] && match[2]) {
        proteins.push({
          name: match[1].trim(),
          function: match[2].trim(),
        });
      }
    }
    if (proteins.length > 0) {
      biology.proteins = proteins;
    }
  }

  return Object.keys(biology).length > 0 ? biology : null;
}

/**
 * Extract formula from content
 */
function extractFormula(content: string): Formula | null {
  const formulaMatch = content.match(/(.+?)\s*=\s*(.+)/);
  if (!formulaMatch || !formulaMatch[0]) return null;

  const formula: Formula = {
    equation: formulaMatch[0],
    variables: [],
  };

  // Extract variable definitions
  const varPattern = /^-?\s*([A-Za-z]+)\s*=\s*(.+?)\s*\(([^)]+)\)/gm;
  let match;
  while ((match = varPattern.exec(content)) !== null) {
    if (match && match[1] && match[2] && match[3]) {
      formula.variables.push({
        symbol: match[1],
        description: match[2],
        unit: match[3],
      });
    }
  }

  return formula.variables.length > 0 ? formula : null;
}

/**
 * Extract application notes from content
 */
function extractApplicationNotes(content: string): ApplicationNote[] {
  const notes: ApplicationNote[] = [];
  const sections = content.split(/### /);

  for (const section of sections) {
    if (section.includes('Systems')) {
      const lines = section.split('\n');
      const scaleMatch = lines[0]?.match(/(.+?)\s+Systems/);
      if (scaleMatch && scaleMatch[1]) {
        const note: ApplicationNote = {
          scale: scaleMatch[1],
        };

        // Extract typical range
        const rangeMatch = section.match(/Typical range:\s*(.+)/);
        if (rangeMatch && rangeMatch[1]) {
          note.typicalRange = rangeMatch[1];
        }

        // Extract targets
        const targetMatch = section.match(/Target:\s*(.+)/);
        if (targetMatch && targetMatch[1]) {
          note.targets = [targetMatch[1]];
        }

        notes.push(note);
      }
    }
  }

  return notes;
}
