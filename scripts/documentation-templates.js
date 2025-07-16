/**
 * Documentation Templates for Parameter Generation
 *
 * This module provides structured templates for generating high-quality
 * parameter documentation that matches existing comprehensive examples.
 */

const CATEGORY_TEMPLATES = {
  electrical: {
    requiredSections: [
      'Definition',
      'Typical Values',
      'Measurement Methods',
      'Affecting Factors',
      'Performance Impact',
      'Compatible Systems',
      'Validation Rules',
      'References',
      'Application Notes',
    ],

    optionalSections: ['Formula', 'Electrochemical Properties', 'Related Parameters'],

    sectionTemplates: {
      definition: `Define the parameter in the context of microbial electrochemical systems. Include:
- Physical/chemical meaning
- Mathematical relationship (if applicable)
- Units and measurement context
- Role in system performance`,

      typicalValues: `Provide comprehensive value ranges based on literature:
- Valid Range: [min] - [max] [unit]
- Typical Range: [typical_min] - [typical_max] [unit]
- Outlier Threshold: >[threshold] [unit]

Performance Categories:
- **Low Performance**: [range] ([description])
- **Moderate Performance**: [range] ([description])
- **High Performance**: [range] ([description])
- **Exceptional Performance**: [range] ([description])`,

      measurementMethods: `Detail measurement approaches:

### Direct Measurement
1. **Primary Method**:
   - Step-by-step procedure
   - Equipment requirements
   - Calculation methodology

2. **Alternative Method**:
   - When to use
   - Advantages/limitations
   - Specific considerations

### Calculation Considerations
- Important factors affecting accuracy
- Standard corrections or normalizations
- Common sources of error`,

      affectingFactors: `### Primary Factors
1. **[Factor 1]**:
   - Specific effects on parameter
   - Optimal ranges
   - Interaction mechanisms

2. **[Factor 2]**:
   - Impact description
   - Control strategies

### Secondary Factors
1. **[Secondary Factor]**:
   - Indirect effects
   - Monitoring considerations`,

      validationRules: `Validation criteria from scientific literature:

1. **Range validation**: [specific criteria]
2. **Unit consistency**: [requirements]
3. **Correlation checks**: [relationships to verify]
4. **Outlier detection**: [thresholds and flags]
5. **Physical plausibility**: [thermodynamic/kinetic limits]

### Additional Validation
- Cross-parameter consistency checks
- Temporal stability requirements
- Reproducibility standards`,

      references: `### Key Literature

1. **[Primary Reference]**. "[Title]". *Journal*, Volume(Issue), pages.
   - Key contribution or methodology

2. **[Secondary Reference]**. "[Title]". *Journal*, Volume(Issue), pages.
   - Supporting data or alternative approach

### Recent Advances
- Notable recent developments
- Emerging measurement techniques
- New material applications

### Standards and Protocols
- Relevant international standards
- Recommended measurement protocols
- Best practice guidelines`,
    },
  },

  biological: {
    requiredSections: [
      'Definition',
      'Typical Values',
      'Measurement Methods',
      'Affecting Factors',
      'Species Considerations',
      'Molecular Biology',
      'Compatible Systems',
      'Validation Rules',
      'References',
      'Application Notes',
    ],

    optionalSections: ['Transfer Mechanisms', 'Growth Kinetics', 'Metabolic Pathways'],

    sectionTemplates: {
      speciesConsiderations: `### [Species Name]
- **Mechanism**: [electron transfer mechanism]
- **Efficiency**: [typical efficiency range]
- **Proteins**: [key proteins involved]
- **Optimal Conditions**: [pH, temperature, nutrients]

### [Another Species]
- Similar format for additional species`,

      molecularBiology: `**Gene Expression**: [relevant genes]

**Proteins**:
- [Protein Name]: [function and role]
- [Another Protein]: [function and role]

**Metabolic Pathways**:
- Primary pathway description
- Alternative pathways
- Regulatory mechanisms`,

      transferMechanisms: `**[Mechanism Type]**: [percentage]% [description]
**[Another Mechanism]**: [percentage]% [description]

Distribution percentages should reflect current understanding from literature.`,
    },
  },

  materials: {
    requiredSections: [
      'Definition',
      'Composition & Structure',
      'Typical Values',
      'Electrochemical Properties',
      'Measurement Methods',
      'Affecting Factors',
      'Preparation Methods',
      'Alternative Systems',
      'Compatible Systems',
      'Limitations',
      'Cost Analysis',
      'Validation Rules',
      'References',
      'Application Notes',
    ],

    sectionTemplates: {
      compositionStructure: `**Chemical Formula**: [formula]

**Physical Properties**:
- **[Property 1]**: [value] [unit]
- **[Property 2]**: [value] [unit]
- **Surface Area**: [typical range] m²/g
- **Porosity**: [percentage range]%

**Structural Features**:
- Microscopic structure description
- Key structural parameters`,

      electrochemicalProperties: `**[Property Name]**: [value range] [unit]
**[Another Property]**: [value range] [unit]

Electrochemical performance characteristics relevant to MESS applications.`,

      preparationMethods: `1. **[Method Name]**:
   - [Step 1]
   - [Step 2] 
   - [Step 3]
   - Typical yield: [percentage]
   - Time required: [duration]

2. **[Alternative Method]**:
   - Brief description
   - Advantages/disadvantages`,

      alternativeSystems: `1. **[Alternative Material]**:
   - [Material component 1]
   - [Material component 2]
   - Performance comparison

2. **[Another Alternative]**:
   - Similar format`,

      limitations: `**Performance Limitations**:
- [Limitation 1 with impact description]
- [Limitation 2 with impact description]

**Practical Challenges**:
- [Challenge 1 with mitigation strategies]
- [Challenge 2 with workarounds]`,

      costAnalysis: `**Material Cost**: $[range] per [unit]
**Preparation Cost**: $[range] per [unit]
**Maintenance Cost**: $[range] per [period]

Cost estimates based on current market prices and typical preparation scales.`,
    },
  },

  environmental: {
    requiredSections: [
      'Definition',
      'Typical Values',
      'Measurement Methods',
      'Affecting Factors',
      'Performance Impact',
      'Compatible Systems',
      'Validation Rules',
      'References',
      'Application Notes',
    ],

    sectionTemplates: {
      performanceImpact: `**[Metric 1]**: [impact description]
**[Metric 2]**: [impact description]

**Stability**: [effect on long-term performance]

Quantitative relationships between parameter changes and system performance.`,
    },
  },
};

const QUALITY_CRITERIA = {
  minSections: 7, // Minimum number of main sections
  minLength: 1500, // Minimum character length
  requiredElements: ['Definition', 'Typical Values', 'Measurement Methods', 'References'],
  qualityIndicators: [
    'specific numeric ranges',
    'measurement procedures',
    'literature citations',
    'validation criteria',
    'practical applications',
  ],
};

const VALIDATION_PATTERNS = {
  formulas: /\*\*Formula:\*\*\s*(.+)/,
  ranges: /Range:\s*([0-9\-\.]+)\s*-\s*([0-9\-\.]+)/,
  citations: /\d+\.\s+\*\*[^*]+\*\*[^*]+\*[^*]+\*/,
  sections: /^##\s+(.+)$/gm,
  numericValues: /([0-9\-\.]+)\s*([A-Za-z\/³²%]+)/g,
};

function getCategoryTemplate(categoryId) {
  // Map category IDs to template categories
  const mapping = {
    'environmental-parameters': 'environmental',
    'material-parameters': 'materials',
    'biological-parameters': 'biological',
    'cell-level-parameters': 'electrical',
    'reactor-level-parameters': 'electrical',
    'performance-parameters': 'electrical',
    'membrane-parameters': 'materials',
    'substrate-parameters': 'biological',
  };

  const templateCategory = mapping[categoryId] || 'electrical';
  return CATEGORY_TEMPLATES[templateCategory];
}

function validateDocumentationQuality(content, categoryId) {
  const template = getCategoryTemplate(categoryId);
  const quality = {
    score: 0,
    issues: [],
    strengths: [],
  };

  // Check required sections
  const sections = (content.match(VALIDATION_PATTERNS.sections) || []).map((match) =>
    match.replace(/^##\s+/, '')
  );

  const requiredSections = template.requiredSections;
  const presentSections = requiredSections.filter((section) =>
    sections.some((s) => s.toLowerCase().includes(section.toLowerCase()))
  );

  quality.score += (presentSections.length / requiredSections.length) * 0.4;

  if (presentSections.length < requiredSections.length) {
    const missing = requiredSections.filter(
      (section) => !sections.some((s) => s.toLowerCase().includes(section.toLowerCase()))
    );
    quality.issues.push(`Missing sections: ${missing.join(', ')}`);
  } else {
    quality.strengths.push('All required sections present');
  }

  // Check content length
  if (content.length >= QUALITY_CRITERIA.minLength) {
    quality.score += 0.1;
    quality.strengths.push('Comprehensive content length');
  } else {
    quality.issues.push(`Content too short (${content.length} < ${QUALITY_CRITERIA.minLength})`);
  }

  // Check for numeric values and ranges
  const numericMatches = content.match(VALIDATION_PATTERNS.numericValues);
  if (numericMatches && numericMatches.length >= 5) {
    quality.score += 0.1;
    quality.strengths.push('Good numeric detail');
  } else {
    quality.issues.push('Insufficient numeric values/ranges');
  }

  // Check for references
  if (content.includes('## References')) {
    quality.score += 0.1;
    quality.strengths.push('References section included');
  } else {
    quality.issues.push('No references section');
  }

  // Check for formulas (bonus for electrical/materials)
  if (
    ['electrical', 'materials'].includes(getCategoryTemplate(categoryId)) &&
    VALIDATION_PATTERNS.formulas.test(content)
  ) {
    quality.score += 0.1;
    quality.strengths.push('Mathematical formulas included');
  }

  // Check for measurement methods detail
  if (content.includes('### Direct Measurement') || content.includes('### Measurement')) {
    quality.score += 0.1;
    quality.strengths.push('Detailed measurement methods');
  } else {
    quality.issues.push('Insufficient measurement method detail');
  }

  // Check for validation rules
  if (content.includes('## Validation Rules') && content.includes('1.')) {
    quality.score += 0.1;
    quality.strengths.push('Specific validation rules');
  } else {
    quality.issues.push('No specific validation rules');
  }

  // Check for application notes
  if (
    content.includes('## Application Notes') &&
    (content.includes('Laboratory') || content.includes('Commercial'))
  ) {
    quality.score += 0.1;
    quality.strengths.push('Practical application guidance');
  } else {
    quality.issues.push('Limited practical application guidance');
  }

  quality.score = Math.min(quality.score, 1.0);
  return quality;
}

function generatePromptForCategory(param, categoryId, examples) {
  const template = getCategoryTemplate(categoryId);
  const exampleContent = examples
    .map((ex) => `--- Example: ${ex.id} ---\n${ex.content.substring(0, 800)}\n---\n`)
    .join('\n');

  return `You are a technical documentation specialist for microbial electrochemical systems (MESS). Generate comprehensive, scientifically accurate documentation for the parameter "${
    param.name
  }".

PARAMETER DETAILS:
- ID: ${param.id}
- Name: ${param.name}
- Category: ${param.category} (${param.categoryId})
- Subcategory: ${param.subcategory}
- Description: ${param.description || 'Generate appropriate description'}
- Unit: ${param.unit || 'Determine appropriate unit'}
- Type: ${param.type || 'numeric'}
${param.range ? `- Known Range: ${param.range.min} - ${param.range.max}` : ''}

REQUIRED SECTIONS (in order):
${template.requiredSections.map((section) => `## ${section}`).join('\n')}

SECTION GUIDELINES:
${Object.entries(template.sectionTemplates || {})
  .map(([section, guide]) => `### ${section}:\n${guide}\n`)
  .join('\n')}

QUALITY REQUIREMENTS:
- Minimum 1500 characters
- Include specific numeric ranges and validation criteria
- Provide detailed measurement procedures
- Include realistic literature references
- Use technical but accessible language
- Structure with clear headings and bullet points

EXAMPLES FOR REFERENCE:
${exampleContent}

Generate complete documentation following this structure exactly. Be scientifically rigorous and include specific, realistic data ranges based on current MESS research literature. Start with the parameter name as the main heading.`;
}

module.exports = {
  CATEGORY_TEMPLATES,
  QUALITY_CRITERIA,
  VALIDATION_PATTERNS,
  getCategoryTemplate,
  validateDocumentationQuality,
  generatePromptForCategory,
};
