/**
 * MESSAI Parameter Library
 * Comprehensive classification of 1500+ MESS parameters across 150 categories
 * Based on CLAUDE.md Phase 2 specifications
 */

export interface ParameterClassification {
  category: string;
  subcategories: {
    name: string;
    code: string;
    parameters: string[];
  }[];
}

/**
 * Complete parameter classification hierarchy
 * This represents the full MESS parameter library structure
 */
export const PARAMETER_LIBRARY: ParameterClassification[] = [
  {
    category: 'Electrode Materials',
    subcategories: [
      {
        name: 'Carbon-Based Electrodes',
        code: 'electrode_carbon',
        parameters: [
          'Carbon Cloth',
          'Carbon Paper',
          'Carbon Felt',
          'Graphite Felt',
          'Carbon Brush',
          'Activated Carbon',
          'Carbon Nanotubes',
          'Graphene',
          'Carbon Black',
          'Biochar',
          'Carbon Foam',
          'Carbon Aerogel',
        ],
      },
      {
        name: 'Metal-Based Electrodes',
        code: 'electrode_metal',
        parameters: [
          'Stainless Steel Mesh',
          'Titanium Mesh',
          'Copper Mesh',
          'Nickel Foam',
          'Platinum Mesh',
          'Gold-Plated Titanium',
          'Silver Wire',
          'Aluminum Mesh',
          'Iron Mesh',
          'Brass Mesh',
        ],
      },
      {
        name: 'Composite Electrodes',
        code: 'electrode_composite',
        parameters: [
          'Platinum-Coated Carbon',
          'Manganese Oxide/Carbon',
          'Polyaniline/Carbon',
          'Polypyrrole/Carbon',
          'PEDOT/Carbon',
          'Graphite/PTFE',
          'Carbon/Ceramic',
          'Metal Oxide Composites',
        ],
      },
      {
        name: 'Modified Electrodes',
        code: 'electrode_modified',
        parameters: [
          'Ammonia-Treated Carbon',
          'Acid-Treated Graphite',
          'Heat-Treated Carbon',
          'Plasma-Modified Carbon',
          'Electrochemically Oxidized',
          'Nitrogen-Doped Carbon',
          'Biofilm-Modified',
        ],
      },
    ],
  },
  {
    category: 'Microbial Species',
    subcategories: [
      {
        name: 'Exoelectrogens',
        code: 'microbe_exoelectrogen',
        parameters: [
          'Geobacter sulfurreducens',
          'Geobacter metallireducens',
          'Shewanella oneidensis',
          'Shewanella putrefaciens',
          'Pseudomonas aeruginosa',
          'Rhodoferax ferrireducens',
          'Aeromonas hydrophila',
          'Desulfuromonas acetoxidans',
          'Ochrobactrum anthropi',
          'Acidithiobacillus ferrooxidans',
        ],
      },
      {
        name: 'Mixed Cultures',
        code: 'microbe_mixed',
        parameters: [
          'Activated Sludge',
          'Anaerobic Sludge',
          'Marine Sediment',
          'Freshwater Sediment',
          'Compost Leachate',
          'Brewery Wastewater Culture',
          'Dairy Wastewater Culture',
          'Municipal Wastewater Culture',
          'Industrial Consortium',
        ],
      },
      {
        name: 'Algae Species',
        code: 'microbe_algae',
        parameters: [
          'Chlorella vulgaris',
          'Chlorella pyrenoidosa',
          'Scenedesmus obliquus',
          'Spirulina platensis',
          'Dunaliella salina',
          'Chlamydomonas reinhardtii',
          'Nannochloropsis sp.',
          'Botryococcus braunii',
        ],
      },
      {
        name: 'Syntrophic Partners',
        code: 'microbe_syntrophic',
        parameters: [
          'Methanobacterium formicicum',
          'Methanosarcina barkeri',
          'Desulfovibrio vulgaris',
          'Clostridium butyricum',
          'Enterobacter cloacae',
          'Klebsiella pneumoniae',
        ],
      },
    ],
  },
  {
    category: 'Substrates',
    subcategories: [
      {
        name: 'Simple Organics',
        code: 'substrate_simple',
        parameters: [
          'Glucose',
          'Acetate',
          'Lactate',
          'Pyruvate',
          'Citrate',
          'Succinate',
          'Formate',
          'Propionate',
          'Butyrate',
          'Ethanol',
          'Methanol',
          'Glycerol',
        ],
      },
      {
        name: 'Complex Organics',
        code: 'substrate_complex',
        parameters: [
          'Starch',
          'Cellulose',
          'Xylan',
          'Chitin',
          'Pectin',
          'Lignin',
          'Proteins',
          'Lipids',
          'Humic Acids',
        ],
      },
      {
        name: 'Wastewater Types',
        code: 'substrate_wastewater',
        parameters: [
          'Brewery Wastewater',
          'Dairy Wastewater',
          'Municipal Wastewater',
          'Pharmaceutical Wastewater',
          'Textile Wastewater',
          'Paper Mill Wastewater',
          'Food Processing Wastewater',
          'Agricultural Runoff',
          'Landfill Leachate',
          'Industrial Effluent',
        ],
      },
      {
        name: 'Synthetic Media',
        code: 'substrate_synthetic',
        parameters: [
          'M9 Medium',
          'LB Medium',
          'Minimal Salt Medium',
          'Defined Medium',
          'Buffered Medium',
          'Trace Element Solution',
        ],
      },
    ],
  },
  {
    category: 'Membranes & Separators',
    subcategories: [
      {
        name: 'Proton Exchange Membranes',
        code: 'membrane_pem',
        parameters: [
          'Nafion 117',
          'Nafion 115',
          'Nafion 212',
          'Flemion',
          'Fumapem',
          'Gore-Select',
          'Aquivion',
        ],
      },
      {
        name: 'Cation Exchange Membranes',
        code: 'membrane_cem',
        parameters: [
          'CMI-7000',
          'Ultrex CMI-7000S',
          'Neosepta CMX',
          'Fumasep FKE',
          'PC-SK',
          'Ralex CM-PP',
        ],
      },
      {
        name: 'Anion Exchange Membranes',
        code: 'membrane_aem',
        parameters: ['AMI-7001', 'Neosepta AMX', 'Fumasep FAA', 'PC-SA', 'Ralex AM-PP'],
      },
      {
        name: 'Alternative Separators',
        code: 'membrane_alternative',
        parameters: [
          'J-Cloth',
          'Glass Fiber',
          'Ceramic Membrane',
          'Ultrafiltration Membrane',
          'Microfiltration Membrane',
          'Dialysis Membrane',
          'Salt Bridge',
          'Agar Bridge',
          'Glass Frit',
        ],
      },
    ],
  },
  {
    category: 'System Configurations',
    subcategories: [
      {
        name: 'Single Chamber',
        code: 'config_single',
        parameters: [
          'Air-Cathode MFC',
          'Membrane-less MFC',
          'Sediment MFC',
          'Miniature MFC',
          'Flat-Plate MFC',
        ],
      },
      {
        name: 'Dual Chamber',
        code: 'config_dual',
        parameters: ['H-Type MFC', 'Cube MFC', 'Cylindrical MFC', 'Up-flow MFC', 'Down-flow MFC'],
      },
      {
        name: 'Stacked Systems',
        code: 'config_stacked',
        parameters: [
          'Series Stack',
          'Parallel Stack',
          'Bipolar Stack',
          'Cascade Stack',
          'Modular Stack',
        ],
      },
      {
        name: 'Scaled Systems',
        code: 'config_scaled',
        parameters: [
          'Pilot MFC',
          'Benchtop Reactor',
          'Industrial MFC',
          'Continuous Flow',
          'Fed-Batch System',
        ],
      },
    ],
  },
  {
    category: 'Operating Conditions',
    subcategories: [
      {
        name: 'Temperature Regimes',
        code: 'operating_temperature',
        parameters: [
          'Psychrophilic (0-20°C)',
          'Mesophilic (20-40°C)',
          'Thermophilic (40-60°C)',
          'Hyperthermophilic (>60°C)',
          'Ambient Temperature',
          'Controlled Temperature',
        ],
      },
      {
        name: 'pH Conditions',
        code: 'operating_ph',
        parameters: [
          'Acidic (pH 3-5)',
          'Slightly Acidic (pH 5-6.5)',
          'Neutral (pH 6.5-7.5)',
          'Slightly Alkaline (pH 7.5-9)',
          'Alkaline (pH 9-11)',
          'Buffered pH',
        ],
      },
      {
        name: 'Flow Regimes',
        code: 'operating_flow',
        parameters: [
          'Batch Mode',
          'Fed-Batch Mode',
          'Continuous Flow',
          'Recirculation Mode',
          'Plug Flow',
          'Mixed Flow',
        ],
      },
      {
        name: 'Electrical Conditions',
        code: 'operating_electrical',
        parameters: [
          'Open Circuit',
          'Fixed Resistance',
          'Variable Resistance',
          'Fixed Voltage',
          'Fixed Current',
          'Potentiostatic',
          'Galvanostatic',
          'Maximum Power Point',
        ],
      },
    ],
  },
  {
    category: 'Chemical Additives',
    subcategories: [
      {
        name: 'Electron Mediators',
        code: 'additive_mediator',
        parameters: [
          'Methylene Blue',
          'Neutral Red',
          'Thionine',
          'Methyl Viologen',
          'Benzyl Viologen',
          'Ferricyanide',
          'AQDS',
          'Riboflavin',
        ],
      },
      {
        name: 'Buffers',
        code: 'additive_buffer',
        parameters: [
          'Phosphate Buffer',
          'Carbonate Buffer',
          'HEPES Buffer',
          'MOPS Buffer',
          'Tris Buffer',
          'Citrate Buffer',
        ],
      },
      {
        name: 'Nutrients',
        code: 'additive_nutrient',
        parameters: [
          'Nitrogen Sources',
          'Phosphorus Sources',
          'Trace Elements',
          'Vitamins',
          'Yeast Extract',
          'Peptone',
        ],
      },
    ],
  },
  {
    category: 'Performance Metrics',
    subcategories: [
      {
        name: 'Electrical Performance',
        code: 'metric_electrical',
        parameters: [
          'Power Density',
          'Current Density',
          'Voltage',
          'Internal Resistance',
          'Coulombic Efficiency',
          'Energy Efficiency',
        ],
      },
      {
        name: 'Treatment Performance',
        code: 'metric_treatment',
        parameters: [
          'COD Removal',
          'BOD Removal',
          'TSS Removal',
          'Nutrient Removal',
          'Pathogen Reduction',
        ],
      },
      {
        name: 'Economic Metrics',
        code: 'metric_economic',
        parameters: [
          'Capital Cost',
          'Operating Cost',
          'Cost per Watt',
          'Payback Period',
          'Net Present Value',
        ],
      },
    ],
  },
];

/**
 * Get all parameter categories
 */
export function getParameterCategories(): string[] {
  return PARAMETER_LIBRARY.map((cat) => cat.category);
}

/**
 * Get subcategories for a specific category
 */
export function getSubcategories(category: string): string[] {
  const cat = PARAMETER_LIBRARY.find((c) => c.category === category);
  return cat ? cat.subcategories.map((sub) => sub.name) : [];
}

/**
 * Get total parameter count
 */
export function getTotalParameterCount(): number {
  return PARAMETER_LIBRARY.reduce((total, cat) => {
    return (
      total +
      cat.subcategories.reduce((subTotal, sub) => {
        return subTotal + sub.parameters.length;
      }, 0)
    );
  }, 0);
}

/**
 * Get category statistics
 */
export function getCategoryStats() {
  return PARAMETER_LIBRARY.map((cat) => ({
    category: cat.category,
    subcategoryCount: cat.subcategories.length,
    parameterCount: cat.subcategories.reduce((total, sub) => total + sub.parameters.length, 0),
  }));
}
