#!/usr/bin/env node
/**
 * Schema comparison script to show detailed differences between development and production schemas
 * This script helps developers understand what changes need to be made
 */

import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

interface SchemaModel {
  name: string;
  fields: { [key: string]: { type: string; attributes: string[] } };
}

interface SchemaDifference {
  type: 'model_added' | 'model_removed' | 'field_added' | 'field_removed' | 'field_changed';
  model: string;
  field?: string;
  devValue?: string;
  prodValue?: string;
  description: string;
}

function parseSchema(schemaContent: string): SchemaModel[] {
  const models: SchemaModel[] = [];
  const modelRegex = /model\s+(\w+)\s*\{([^}]+)\}/g;

  let match;
  while ((match = modelRegex.exec(schemaContent)) !== null) {
    const modelName = match[1];
    const modelContent = match[2];

    const fields: { [key: string]: { type: string; attributes: string[] } } = {};

    // Parse fields within the model
    const fieldRegex = /^\s*(\w+)\s+([^\s]+)([^\n]*)/gm;
    let fieldMatch;

    while ((fieldMatch = fieldRegex.exec(modelContent)) !== null) {
      const fieldName = fieldMatch[1];
      const fieldType = fieldMatch[2];
      const attributes = fieldMatch[3]
        .trim()
        .split(/\s+/)
        .filter((attr) => attr.length > 0);

      // Skip non-field lines (comments, relations, etc.)
      if (fieldName.startsWith('//') || fieldName.startsWith('@@') || fieldName === 'map') {
        continue;
      }

      fields[fieldName] = {
        type: fieldType,
        attributes: attributes,
      };
    }

    models.push({
      name: modelName,
      fields,
    });
  }

  return models;
}

function compareSchemas(devSchema: string, prodSchema: string): SchemaDifference[] {
  const differences: SchemaDifference[] = [];

  try {
    const devModels = parseSchema(devSchema);
    const prodModels = parseSchema(prodSchema);

    // Create lookup maps
    const devModelMap = new Map(devModels.map((m) => [m.name, m]));
    const prodModelMap = new Map(prodModels.map((m) => [m.name, m]));

    // Check for models in production but not in development
    for (const [modelName, prodModel] of prodModelMap) {
      const devModel = devModelMap.get(modelName);

      if (!devModel) {
        differences.push({
          type: 'model_added',
          model: modelName,
          description: `Model ${modelName} exists in production but not in development`,
        });
        continue;
      }

      // Compare fields within the model
      for (const [fieldName, prodField] of Object.entries(prodModel.fields)) {
        const devField = devModel.fields[fieldName];

        if (!devField) {
          differences.push({
            type: 'field_added',
            model: modelName,
            field: fieldName,
            prodValue: `${prodField.type} ${prodField.attributes.join(' ')}`,
            description: `Field ${modelName}.${fieldName} exists in production but not in development`,
          });
          continue;
        }

        // Check for type or attribute differences
        const devFullType = `${devField.type} ${devField.attributes.join(' ')}`.trim();
        const prodFullType = `${prodField.type} ${prodField.attributes.join(' ')}`.trim();

        if (devFullType !== prodFullType) {
          differences.push({
            type: 'field_changed',
            model: modelName,
            field: fieldName,
            devValue: devFullType,
            prodValue: prodFullType,
            description: `Field ${modelName}.${fieldName} differs between environments`,
          });
        }
      }

      // Check for fields in development but not in production
      for (const [fieldName, devField] of Object.entries(devModel.fields)) {
        if (!prodModel.fields[fieldName]) {
          differences.push({
            type: 'field_removed',
            model: modelName,
            field: fieldName,
            devValue: `${devField.type} ${devField.attributes.join(' ')}`,
            description: `Field ${modelName}.${fieldName} exists in development but not in production`,
          });
        }
      }
    }

    // Check for models in development but not in production
    for (const [modelName] of devModelMap) {
      if (!prodModelMap.has(modelName)) {
        differences.push({
          type: 'model_removed',
          model: modelName,
          description: `Model ${modelName} exists in development but not in production`,
        });
      }
    }
  } catch (error) {
    console.error('Error comparing schemas:', error instanceof Error ? error.message : error);
  }

  return differences;
}

function formatDifferences(differences: SchemaDifference[]): void {
  if (differences.length === 0) {
    console.log('✅ No differences found between development and production schemas');
    return;
  }

  console.log(`\n📊 Found ${differences.length} difference(s) between schemas:\n`);

  // Group by type
  const groupedDiffs = differences.reduce((acc, diff) => {
    if (!acc[diff.type]) acc[diff.type] = [];
    acc[diff.type].push(diff);
    return acc;
  }, {} as { [key: string]: SchemaDifference[] });

  // Display by category
  const typeLabels = {
    model_added: '🆕 Models Added in Production',
    model_removed: '🗑️  Models Removed in Production',
    field_added: '➕ Fields Added in Production',
    field_removed: '➖ Fields Removed in Production',
    field_changed: '🔄 Fields Changed Between Environments',
  };

  for (const [type, diffs] of Object.entries(groupedDiffs)) {
    console.log(`${typeLabels[type as keyof typeof typeLabels]}:`);

    diffs.forEach((diff) => {
      if (diff.field) {
        console.log(`  • ${diff.model}.${diff.field}`);
        if (diff.devValue) console.log(`    Development: ${diff.devValue}`);
        if (diff.prodValue) console.log(`    Production:  ${diff.prodValue}`);
      } else {
        console.log(`  • ${diff.model}`);
      }
    });

    console.log();
  }

  // Show critical differences
  const criticalDiffs = differences.filter(
    (diff) =>
      diff.type === 'field_changed' &&
      diff.devValue &&
      diff.prodValue &&
      (diff.devValue.includes('String') !== diff.prodValue.includes('String[]') ||
        diff.devValue.includes('Json') !== diff.prodValue.includes('String[]'))
  );

  if (criticalDiffs.length > 0) {
    console.log('⚠️  Critical differences that may cause deployment failures:');
    criticalDiffs.forEach((diff) => {
      console.log(`  • ${diff.model}.${diff.field}: ${diff.description}`);
    });
    console.log();
  }
}

function main() {
  const devSchemaPath = resolve(process.cwd(), 'prisma/schema.prisma');
  const prodSchemaPath = resolve(process.cwd(), 'prisma/schema.production.prisma');

  // Check if both schema files exist
  if (!existsSync(devSchemaPath)) {
    console.error('❌ Development schema not found:', devSchemaPath);
    process.exit(1);
  }

  if (!existsSync(prodSchemaPath)) {
    console.error('❌ Production schema not found:', prodSchemaPath);
    process.exit(1);
  }

  console.log('🔍 Comparing schema differences...');
  console.log(`📄 Development schema: ${devSchemaPath}`);
  console.log(`📄 Production schema: ${prodSchemaPath}`);

  try {
    const devSchema = readFileSync(devSchemaPath, 'utf8');
    const prodSchema = readFileSync(prodSchemaPath, 'utf8');

    const differences = compareSchemas(devSchema, prodSchema);
    formatDifferences(differences);
  } catch (error) {
    console.error('❌ Schema comparison failed:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

// Run the comparison
if (require.main === module) {
  main();
}

export { compareSchemas, SchemaDifference };
