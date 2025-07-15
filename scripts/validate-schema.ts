#!/usr/bin/env node
/**
 * Schema validation script to ensure development and production schemas are compatible
 * This script helps prevent deployment failures due to schema mismatches
 */

import { readFileSync, existsSync } from 'fs';
import { execSync } from 'child_process';
import { resolve } from 'path';

interface SchemaModel {
  name: string;
  fields: { [key: string]: { type: string; attributes: string[] } };
}

interface SchemaValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
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

function validateSchemaCompatibility(
  devSchema: string,
  prodSchema: string
): SchemaValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    const devModels = parseSchema(devSchema);
    const prodModels = parseSchema(prodSchema);

    // Create lookup maps
    const devModelMap = new Map(devModels.map((m) => [m.name, m]));
    const prodModelMap = new Map(prodModels.map((m) => [m.name, m]));

    // Check for critical type mismatches
    for (const [modelName, prodModel] of prodModelMap) {
      const devModel = devModelMap.get(modelName);

      if (!devModel) {
        warnings.push(`Model ${modelName} exists in production but not in development`);
        continue;
      }

      // Check field type compatibility
      for (const [fieldName, prodField] of Object.entries(prodModel.fields)) {
        const devField = devModel.fields[fieldName];

        if (!devField) {
          warnings.push(
            `Field ${modelName}.${fieldName} exists in production but not in development`
          );
          continue;
        }

        // Check for critical type mismatches
        if (isTypeIncompatible(devField.type, prodField.type)) {
          errors.push(
            `CRITICAL: Field ${modelName}.${fieldName} type mismatch - ` +
              `development: ${devField.type}, production: ${prodField.type}`
          );
        }

        // Check for array vs non-array mismatches
        if (devField.type.includes('[]') !== prodField.type.includes('[]')) {
          errors.push(
            `CRITICAL: Field ${modelName}.${fieldName} array mismatch - ` +
              `development: ${devField.type}, production: ${prodField.type}`
          );
        }
      }
    }

    // Check for missing models in production
    for (const [modelName] of devModelMap) {
      if (!prodModelMap.has(modelName)) {
        warnings.push(`Model ${modelName} exists in development but not in production`);
      }
    }
  } catch (error) {
    errors.push(
      `Schema parsing error: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

function isTypeIncompatible(devType: string, prodType: string): boolean {
  // Remove array indicators and optional markers for base type comparison
  const devBaseType = devType.replace(/\[\]|\?/g, '');
  const prodBaseType = prodType.replace(/\[\]|\?/g, '');

  // Define type compatibility rules
  const compatibilityMap: { [key: string]: string[] } = {
    String: ['String', 'Json'], // JSON can store strings
    Json: ['String', 'Json'], // JSON is compatible with string for arrays
    Int: ['Int'],
    Float: ['Float'],
    Boolean: ['Boolean'],
    DateTime: ['DateTime'],
  };

  const compatibleTypes = compatibilityMap[devBaseType] || [devBaseType];
  return !compatibleTypes.includes(prodBaseType);
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

  console.log('🔍 Validating schema compatibility...');
  console.log(`📄 Development schema: ${devSchemaPath}`);
  console.log(`📄 Production schema: ${prodSchemaPath}`);

  try {
    const devSchema = readFileSync(devSchemaPath, 'utf8');
    const prodSchema = readFileSync(prodSchemaPath, 'utf8');

    const result = validateSchemaCompatibility(devSchema, prodSchema);

    // Report results
    if (result.warnings.length > 0) {
      console.log('\n⚠️  Warnings:');
      result.warnings.forEach((warning) => console.log(`   ${warning}`));
    }

    if (result.errors.length > 0) {
      console.log('\n❌ Critical Errors:');
      result.errors.forEach((error) => console.log(`   ${error}`));
      console.log('\n💡 These errors will cause deployment failures!');
      process.exit(1);
    }

    console.log('\n✅ Schema validation passed!');
    console.log('🚀 Safe to deploy');
  } catch (error) {
    console.error('❌ Schema validation failed:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

// Run the validation
if (require.main === module) {
  main();
}

export { validateSchemaCompatibility, parseSchema };
