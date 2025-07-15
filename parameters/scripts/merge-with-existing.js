#!/usr/bin/env node

/**
 * Script to merge the extracted JSON parameters with existing parameters-data.ts
 * Handles duplicates by preferring the more complete definition
 */

const fs = require('fs');
const path = require('path');

// Load the extracted parameters from the generated file
function loadExtractedParameters() {
  const jsonPath = path.join(__dirname, '../MESS_PARAMETERS_UNIFIED_V2.json');
  const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

  const parameters = [];

  jsonData.categories.forEach((category) => {
    category.subcategories.forEach((subcategory) => {
      subcategory.parameters.forEach((param) => {
        parameters.push(param);
      });
    });
  });

  return parameters;
}

// Extract parameters from the existing TypeScript file
function loadExistingParameters() {
  const tsPath = path.join(__dirname, '../parameters-data.ts');
  const tsContent = fs.readFileSync(tsPath, 'utf8');

  // Parse the TypeScript file to extract parameter objects
  const parameters = [];

  // Extract parameter definitions using regex
  const paramRegex =
    /{\s*id:\s*'([^']+)',\s*name:\s*'([^']+)',\s*description:\s*'([^']*)',\s*unit:\s*'([^']*)',\s*type:\s*'([^']+)',\s*category:\s*'([^']+)',\s*subcategory:\s*'([^']+)',\s*(.*?)\s*},/gs;

  let match;
  while ((match = paramRegex.exec(tsContent)) !== null) {
    const [, id, name, description, unit, type, category, subcategory, rest] = match;

    const param = {
      id,
      name,
      description,
      unit,
      type,
      category,
      subcategory,
      tags: [category, subcategory],
    };

    // Parse additional properties from the 'rest' part
    if (rest.includes('range:')) {
      const rangeMatch = rest.match(
        /range:\s*\{\s*min:\s*([^,\s}]+),?\s*max:\s*([^,\s}]+),?\s*(?:typical:\s*([^,\s}]+))?\s*\}/
      );
      if (rangeMatch) {
        param.range = {
          min: parseFloat(rangeMatch[1]),
          max: parseFloat(rangeMatch[2]),
        };
        if (rangeMatch[3]) {
          param.range.typical = parseFloat(rangeMatch[3]);
        }
      }
    }

    if (rest.includes('default:')) {
      const defaultMatch = rest.match(/default:\s*([^,\n}]+)/);
      if (defaultMatch) {
        let defaultValue = defaultMatch[1].trim();
        if (defaultValue.startsWith("'") && defaultValue.endsWith("'")) {
          param.default = defaultValue.slice(1, -1);
        } else if (!isNaN(defaultValue)) {
          param.default = parseFloat(defaultValue);
        } else {
          param.default = defaultValue;
        }
      }
    }

    parameters.push(param);
  }

  return parameters;
}

// Merge parameters, preferring the most complete definition
function mergeParameters(extractedParams, existingParams) {
  const merged = new Map();
  const conflicts = [];

  // Add extracted parameters first
  extractedParams.forEach((param) => {
    merged.set(param.id, { ...param, source: 'json' });
  });

  // Process existing parameters, handling conflicts
  existingParams.forEach((param) => {
    if (merged.has(param.id)) {
      const existing = merged.get(param.id);

      // Determine which parameter is more complete
      const existingScore = scoreParameter(existing);
      const currentScore = scoreParameter(param);

      conflicts.push({
        id: param.id,
        jsonScore: existingScore,
        tsScore: currentScore,
        chosen: currentScore > existingScore ? 'typescript' : 'json',
      });

      if (currentScore > existingScore) {
        merged.set(param.id, { ...param, source: 'typescript' });
      }
    } else {
      merged.set(param.id, { ...param, source: 'typescript' });
    }
  });

  return { parameters: Array.from(merged.values()), conflicts };
}

// Score a parameter based on completeness
function scoreParameter(param) {
  let score = 0;

  if (param.description && param.description.length > 10) score += 2;
  if (param.unit && param.unit !== '-') score += 1;
  if (param.range) score += 2;
  if (param.default !== undefined) score += 1;
  if (param.tags && param.tags.length > 0) score += 1;
  if (param.type && param.type !== 'object') score += 1;

  return score;
}

// Generate the final unified TypeScript file
function generateUnifiedTypeScript(parameters) {
  // Group parameters by category
  const paramsByCategory = new Map();

  parameters.forEach((param) => {
    if (!paramsByCategory.has(param.category)) {
      paramsByCategory.set(param.category, []);
    }
    paramsByCategory.get(param.category).push(param);
  });

  // Sort categories and parameters
  const sortedCategories = Array.from(paramsByCategory.keys()).sort();
  sortedCategories.forEach((category) => {
    paramsByCategory.get(category).sort((a, b) => a.id.localeCompare(b.id));
  });

  let output = `// MESS Parameters Data Library - Unified from all sources
// Total parameters: ${parameters.length}
// Generated on: ${new Date().toISOString()}
// Sources: JSON extraction (${
    parameters.filter((p) => p.source === 'json').length
  }) + TypeScript existing (${parameters.filter((p) => p.source === 'typescript').length})

export interface ParameterCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  subcategories?: string[];
}

export interface Parameter {
  id: string;
  name: string;
  description: string;
  unit: string;
  type: 'number' | 'string' | 'boolean' | 'select' | 'object';
  category: string;
  subcategory: string;
  range?: {
    min?: number;
    max?: number;
    typical?: number;
  };
  default?: any;
  options?: string[];
  tags?: string[];
}

`;

  // Generate parameter arrays for each category
  sortedCategories.forEach((category) => {
    const params = paramsByCategory.get(category);
    const categoryName = category.charAt(0).toUpperCase() + category.slice(1);

    output += `// ${categoryName} Parameters (${params.length})\n`;
    output += `const ${category}Parameters: Parameter[] = [\n`;

    params.forEach((param) => {
      output += `  {\n`;
      output += `    id: '${param.id}',\n`;
      output += `    name: '${param.name}',\n`;
      output += `    description: '${param.description.replace(/'/g, "\\'")}',\n`;
      output += `    unit: '${param.unit}',\n`;
      output += `    type: '${param.type}',\n`;
      output += `    category: '${param.category}',\n`;
      output += `    subcategory: '${param.subcategory}',\n`;

      if (param.range) {
        output += `    range: { min: ${param.range.min}, max: ${param.range.max}`;
        if (param.range.typical !== undefined) {
          output += `, typical: ${param.range.typical}`;
        }
        output += ` },\n`;
      }

      if (param.default !== undefined) {
        if (typeof param.default === 'string') {
          output += `    default: '${param.default}',\n`;
        } else {
          output += `    default: ${param.default},\n`;
        }
      }

      if (param.tags && param.tags.length > 0) {
        output += `    tags: ['${param.tags.join("', '")}'],\n`;
      }

      output += `  },\n`;
    });

    output += `];\n\n`;
  });

  // Generate the main export
  output += `// Export all parameters\n`;
  output += `export const ALL_PARAMETERS: Parameter[] = [\n`;

  sortedCategories.forEach((category) => {
    output += `  ...${category}Parameters,\n`;
  });

  output += `];\n\n`;

  // Generate category definitions
  output += `export const PARAMETER_CATEGORIES: ParameterCategory[] = [\n`;

  sortedCategories.forEach((category) => {
    const params = paramsByCategory.get(category);
    const categoryName = category.charAt(0).toUpperCase() + category.slice(1);
    const subcategories = [...new Set(params.map((p) => p.subcategory))];

    output += `  {\n`;
    output += `    id: '${category}',\n`;
    output += `    name: '${categoryName}',\n`;
    output += `    description: '${categoryName} parameters for MESS systems',\n`;
    output += `    icon: '📊',\n`;
    output += `    color: '#6366f1',\n`;
    output += `    subcategories: ['${subcategories.join("', '")}'],\n`;
    output += `  },\n`;
  });

  output += `];\n\n`;

  // Export statistics
  output += `// Parameter statistics\n`;
  output += `export const PARAMETER_STATS = {\n`;
  output += `  total: ${parameters.length},\n`;
  output += `  categories: ${paramsByCategory.size},\n`;
  output += `  byCategory: {\n`;

  sortedCategories.forEach((category) => {
    const count = paramsByCategory.get(category).length;
    output += `    ${category}: ${count},\n`;
  });

  output += `  },\n`;
  output += `};\n`;

  return output;
}

// Generate updated JSON for web app
function generateUnifiedJSON(parameters) {
  // Group parameters by category and subcategory
  const categories = new Map();

  parameters.forEach((param) => {
    if (!categories.has(param.category)) {
      categories.set(param.category, new Map());
    }

    const subcategories = categories.get(param.category);
    if (!subcategories.has(param.subcategory)) {
      subcategories.set(param.subcategory, []);
    }

    // Remove the source property for JSON output
    const cleanParam = { ...param };
    delete cleanParam.source;

    subcategories.get(param.subcategory).push(cleanParam);
  });

  const jsonStructure = {
    metadata: {
      version: '3.1.0',
      lastUpdated: new Date().toISOString().split('T')[0],
      totalParameters: parameters.length,
      majorCategories: categories.size,
      subcategories: Array.from(categories.values()).reduce(
        (total, subcats) => total + subcats.size,
        0
      ),
      sources: {
        unified: 'Merged from JSON extraction and TypeScript parameters',
        generator: 'merge-with-existing.js v1.0.0',
      },
    },
    categories: [],
  };

  // Sort categories
  const sortedCategoryEntries = Array.from(categories.entries()).sort(([a], [b]) =>
    a.localeCompare(b)
  );

  for (const [categoryId, subcategories] of sortedCategoryEntries) {
    const categoryName = categoryId.charAt(0).toUpperCase() + categoryId.slice(1) + ' Parameters';

    const categoryData = {
      id: categoryId,
      name: categoryName,
      description: `${categoryName} for MESS systems`,
      subcategories: [],
    };

    // Sort subcategories
    const sortedSubcategoryEntries = Array.from(subcategories.entries()).sort(([a], [b]) =>
      a.localeCompare(b)
    );

    for (const [subcategoryId, params] of sortedSubcategoryEntries) {
      const subcategoryName = subcategoryId
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      // Sort parameters within subcategory
      params.sort((a, b) => a.id.localeCompare(b.id));

      categoryData.subcategories.push({
        id: subcategoryId,
        name: subcategoryName,
        parameters: params,
      });
    }

    jsonStructure.categories.push(categoryData);
  }

  return JSON.stringify(jsonStructure, null, 2);
}

// Main execution
async function main() {
  try {
    console.log('🔄 Loading extracted parameters...');
    const extractedParams = loadExtractedParameters();
    console.log(`📊 Loaded ${extractedParams.length} extracted parameters`);

    console.log('🔄 Loading existing parameters from TypeScript...');
    const existingParams = loadExistingParameters();
    console.log(`📊 Loaded ${existingParams.length} existing parameters`);

    console.log('🔄 Merging parameters...');
    const { parameters, conflicts } = mergeParameters(extractedParams, existingParams);
    console.log(`📊 Merged total: ${parameters.length} parameters`);
    console.log(`⚖️  Conflicts resolved: ${conflicts.length}`);

    // Show conflict resolution details
    console.log('🔍 Conflict resolution details:');
    conflicts.forEach((conflict) => {
      console.log(
        `  ${conflict.id}: JSON(${conflict.jsonScore}) vs TS(${conflict.tsScore}) → ${conflict.chosen}`
      );
    });

    // Generate category statistics
    const categoryStats = new Map();
    parameters.forEach((param) => {
      categoryStats.set(param.category, (categoryStats.get(param.category) || 0) + 1);
    });

    console.log('📈 Final parameter distribution by category:');
    for (const [category, count] of Array.from(categoryStats.entries()).sort()) {
      console.log(`  ${category}: ${count}`);
    }

    console.log('🔄 Generating unified parameters-data.ts...');
    const unifiedTS = generateUnifiedTypeScript(parameters);

    // Write unified TypeScript file
    const tsOutputPath = path.join(__dirname, '../parameters-data-final.ts');
    fs.writeFileSync(tsOutputPath, unifiedTS);
    console.log(`✅ Generated unified TypeScript: ${tsOutputPath}`);

    console.log('🔄 Generating final unified JSON...');
    const unifiedJSON = generateUnifiedJSON(parameters);

    // Write final JSON file
    const jsonOutputPath = path.join(__dirname, '../MESS_PARAMETERS_UNIFIED_FINAL.json');
    fs.writeFileSync(jsonOutputPath, unifiedJSON);
    console.log(`✅ Generated final JSON: ${jsonOutputPath}`);

    console.log('✅ Merge complete!');
    console.log(`📊 Total parameters: ${parameters.length}`);
    console.log(`📊 Categories: ${categoryStats.size}`);
    console.log(`📊 From JSON: ${parameters.filter((p) => p.source === 'json').length}`);
    console.log(
      `📊 From TypeScript: ${parameters.filter((p) => p.source === 'typescript').length}`
    );
  } catch (error) {
    console.error('❌ Error during merge:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
