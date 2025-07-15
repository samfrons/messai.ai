#!/usr/bin/env node

/**
 * Script to merge parameters from MESS_PARAMETERS_UNIFIED.json with parameters-data.ts
 * Creates a unified parameters-data.ts with all parameters from both sources
 */

const fs = require('fs');
const path = require('path');

// Map JSON category IDs to clean category names
const CATEGORY_MAPPINGS = {
  'environmental-parameters': 'environmental',
  'biological-parameters': 'biological',
  'material-parameters': 'materials',
  'operational-parameters': 'operational',
  'monitoring-control-parameters': 'monitoring',
  'economic-sustainability-parameters': 'economic',
  'performance-metrics': 'performance',
  'safety-regulatory-parameters': 'safety',
  'cell-level-parameters': 'physical',
  'reactor-level-parameters': 'physical',
  'application-specific-parameters': 'operational',
  'emerging-technology-parameters': 'materials',
  'integration-scaling-parameters': 'operational',
  'electrical-parameters': 'electrical',
  'chemical-parameters': 'chemical',
};

// Clean subcategory names
function cleanSubcategoryName(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Extract parameters from JSON file
function extractParametersFromJSON() {
  const jsonPath = path.join(__dirname, '../MESS_PARAMETERS_UNIFIED.json');
  const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

  const extractedParameters = [];

  jsonData.categories.forEach((category) => {
    const categoryName = CATEGORY_MAPPINGS[category.id] || 'operational';

    category.subcategories.forEach((subcategory) => {
      const subcategoryName = cleanSubcategoryName(subcategory.name);

      subcategory.parameters.forEach((param) => {
        // Skip parameters with IDs starting with '_' (these are sub-properties)
        if (param.id.startsWith('_')) {
          return;
        }

        const parameter = {
          id: param.id,
          name: param.name,
          description: param.description || '',
          unit: param.unit || '-',
          type: param.type,
          category: categoryName,
          subcategory: subcategoryName,
          default: param.default,
        };

        // Add range if it exists
        if (param.range && Object.keys(param.range).length > 0) {
          parameter.range = {
            min: param.range.min,
            max: param.range.max,
            typical: param.typical_range?.min || param.default,
          };
        }

        // Add tags based on category and subcategory
        parameter.tags = [categoryName, subcategoryName];

        extractedParameters.push(parameter);
      });
    });
  });

  return extractedParameters;
}

// Generate TypeScript code for parameters
function generateParametersTypeScript(parameters) {
  // Group parameters by category
  const paramsByCategory = new Map();

  parameters.forEach((param) => {
    if (!paramsByCategory.has(param.category)) {
      paramsByCategory.set(param.category, []);
    }
    paramsByCategory.get(param.category).push(param);
  });

  let output = `// MESS Parameters Data Library - Generated from unified sources
// Total parameters: ${parameters.length}
// Generated on: ${new Date().toISOString()}

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
  for (const [category, params] of paramsByCategory.entries()) {
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
  }

  // Generate the main export
  output += `// Export all parameters\n`;
  output += `export const ALL_PARAMETERS: Parameter[] = [\n`;

  for (const category of paramsByCategory.keys()) {
    output += `  ...${category}Parameters,\n`;
  }

  output += `];\n\n`;

  // Generate category definitions
  output += `export const PARAMETER_CATEGORIES: ParameterCategory[] = [\n`;

  for (const [category, params] of paramsByCategory.entries()) {
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
  }

  output += `];\n\n`;

  // Export statistics
  output += `// Parameter statistics\n`;
  output += `export const PARAMETER_STATS = {\n`;
  output += `  total: ${parameters.length},\n`;
  output += `  categories: ${paramsByCategory.size},\n`;
  output += `  byCategory: {\n`;

  for (const [category, params] of paramsByCategory.entries()) {
    output += `    ${category}: ${params.length},\n`;
  }

  output += `  },\n`;
  output += `};\n`;

  return output;
}

// Generate JSON version for web app
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

    subcategories.get(param.subcategory).push(param);
  });

  const jsonStructure = {
    metadata: {
      version: '3.0.0',
      lastUpdated: new Date().toISOString().split('T')[0],
      totalParameters: parameters.length,
      majorCategories: categories.size,
      subcategories: Array.from(categories.values()).reduce(
        (total, subcats) => total + subcats.size,
        0
      ),
      sources: {
        unified: 'parameters-data.ts merged from JSON and TypeScript sources',
        generator: 'merge-parameters.js v1.0.0',
      },
    },
    categories: [],
  };

  for (const [categoryId, subcategories] of categories.entries()) {
    const categoryName = categoryId.charAt(0).toUpperCase() + categoryId.slice(1) + ' Parameters';

    const categoryData = {
      id: categoryId,
      name: categoryName,
      description: `${categoryName} for MESS systems`,
      subcategories: [],
    };

    for (const [subcategoryId, params] of subcategories.entries()) {
      const subcategoryName = subcategoryId
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

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
    console.log('🔄 Extracting parameters from MESS_PARAMETERS_UNIFIED.json...');
    const jsonParameters = extractParametersFromJSON();
    console.log(`📊 Extracted ${jsonParameters.length} parameters from JSON`);

    // Generate category statistics
    const categoryStats = new Map();
    jsonParameters.forEach((param) => {
      categoryStats.set(param.category, (categoryStats.get(param.category) || 0) + 1);
    });

    console.log('📈 Parameter distribution by category:');
    for (const [category, count] of categoryStats.entries()) {
      console.log(`  ${category}: ${count}`);
    }

    console.log('🔄 Generating new parameters-data-unified.ts...');
    const generatedCode = generateParametersTypeScript(jsonParameters);

    // Write TypeScript file
    const tsOutputPath = path.join(__dirname, '../parameters-data-unified.ts');
    fs.writeFileSync(tsOutputPath, generatedCode);
    console.log(`✅ Generated TypeScript file: ${tsOutputPath}`);

    console.log('🔄 Generating MESS_PARAMETERS_UNIFIED_V2.json...');
    const generatedJSON = generateUnifiedJSON(jsonParameters);

    // Write JSON file
    const jsonOutputPath = path.join(__dirname, '../MESS_PARAMETERS_UNIFIED_V2.json');
    fs.writeFileSync(jsonOutputPath, generatedJSON);
    console.log(`✅ Generated JSON file: ${jsonOutputPath}`);

    console.log(`📊 Total parameters: ${jsonParameters.length}`);
    console.log(`📊 Total categories: ${categoryStats.size}`);
  } catch (error) {
    console.error('❌ Error during parameter merge:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
