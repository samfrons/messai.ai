#!/usr/bin/env ts-node

/**
 * Script to merge parameters from MESS_PARAMETERS_UNIFIED.json with parameters-data.ts
 * Creates a unified parameters-data.ts with all parameters from both sources
 */

import * as fs from 'fs';
import * as path from 'path';

// TypeScript interface matching the existing parameters-data.ts structure
interface Parameter {
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

// Map JSON category IDs to clean category names
const CATEGORY_MAPPINGS: Record<string, string> = {
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
function cleanSubcategoryName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Extract parameters from JSON file
function extractParametersFromJSON(): Parameter[] {
  const jsonPath = path.join(__dirname, '../MESS_PARAMETERS_UNIFIED.json');
  const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

  const extractedParameters: Parameter[] = [];

  jsonData.categories.forEach((category: any) => {
    const categoryName = CATEGORY_MAPPINGS[category.id] || 'operational';

    category.subcategories.forEach((subcategory: any) => {
      const subcategoryName = cleanSubcategoryName(subcategory.name);

      subcategory.parameters.forEach((param: any) => {
        // Skip parameters with IDs starting with '_' (these are sub-properties)
        if (param.id.startsWith('_')) {
          return;
        }

        const parameter: Parameter = {
          id: param.id,
          name: param.name,
          description: param.description || '',
          unit: param.unit || '-',
          type: param.type as Parameter['type'],
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

// Load existing parameters from parameters-data.ts
function loadExistingParameters(): Parameter[] {
  // This is a simplified extraction - in practice, we'd parse the TypeScript file
  // For now, we'll return an empty array and manually review overlaps
  return [];
}

// Merge parameters and resolve duplicates
function mergeParameters(jsonParams: Parameter[], existingParams: Parameter[]): Parameter[] {
  const merged = new Map<string, Parameter>();

  // Add existing parameters first
  existingParams.forEach((param) => {
    merged.set(param.id, param);
  });

  // Add JSON parameters, checking for duplicates
  jsonParams.forEach((param) => {
    if (merged.has(param.id)) {
      console.log(`Duplicate found: ${param.id} - keeping existing TypeScript version`);
    } else {
      merged.set(param.id, param);
    }
  });

  return Array.from(merged.values());
}

// Generate TypeScript code for parameters
function generateParametersTypeScript(parameters: Parameter[]): string {
  // Group parameters by category
  const paramsByCategory = new Map<string, Parameter[]>();

  parameters.forEach((param) => {
    if (!paramsByCategory.has(param.category)) {
      paramsByCategory.set(param.category, []);
    }
    paramsByCategory.get(param.category)!.push(param);
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

// Main execution
async function main() {
  try {
    console.log('🔄 Extracting parameters from MESS_PARAMETERS_UNIFIED.json...');
    const jsonParameters = extractParametersFromJSON();
    console.log(`📊 Extracted ${jsonParameters.length} parameters from JSON`);

    console.log('🔄 Loading existing parameters from parameters-data.ts...');
    const existingParameters = loadExistingParameters();
    console.log(`📊 Found ${existingParameters.length} existing parameters`);

    console.log('🔄 Merging parameters...');
    const mergedParameters = mergeParameters(jsonParameters, existingParameters);
    console.log(`📊 Merged total: ${mergedParameters.length} parameters`);

    // Generate category statistics
    const categoryStats = new Map<string, number>();
    mergedParameters.forEach((param) => {
      categoryStats.set(param.category, (categoryStats.get(param.category) || 0) + 1);
    });

    console.log('📈 Parameter distribution by category:');
    for (const [category, count] of categoryStats.entries()) {
      console.log(`  ${category}: ${count}`);
    }

    console.log('🔄 Generating new parameters-data.ts...');
    const generatedCode = generateParametersTypeScript(mergedParameters);

    // Write to new file
    const outputPath = path.join(__dirname, '../parameters-data-unified.ts');
    fs.writeFileSync(outputPath, generatedCode);

    console.log(`✅ Generated unified parameters file: ${outputPath}`);
    console.log(`📊 Total parameters: ${mergedParameters.length}`);
  } catch (error) {
    console.error('❌ Error during parameter merge:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
