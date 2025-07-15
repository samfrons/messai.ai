# MESSAI Parameter System Guide

## Overview

The MESSAI platform distinguishes between **Parameters** (measurable properties)
and **Variables** (categorical selections) in its data architecture. This guide
provides comprehensive documentation for AI agents working with the parameter
system.

## Core Concepts

### Parameters vs Variables Distinction

#### Parameters

**Parameters** are measurable, quantifiable properties with scientific units:

- **Numeric values** with physical units (e.g., temperature: 25°C, voltage:
  1.2V)
- **Defined ranges** with minimum and maximum values
- **Continuous or discrete** numeric measurements
- **Default values** for system initialization
- **Validation rules** for data integrity

**Examples of Parameters:**

- `voltage_stability` (mV) - electrical stability measurement
- `temperature` (°C) - environmental temperature
- `conductivity` (S/m) - electrical conductivity
- `current_density` (A/m²) - electrical current per unit area
- `biofilm_thickness` (μm) - biological layer thickness
- `growth_rate` (1/h) - microbial growth rate
- `bacterial_concentration` (cells/mL) - measurable microbial density
- `substrate_concentration` (g/L) - measurable substrate density
- `microbial_community_composition` (%) - measurable community structure

#### Variables

**Variables** are categorical selections without measurable units:

- **Dropdown/select options** for system configuration
- **String values** without physical units
- **Categorical choices** for materials, species, methods
- **Enumerated options** for system setup

**Examples of Variables:**

- `microbial_species` - species selection (e.g., "Escherichia coli",
  "Pseudomonas aeruginosa")
- `electrode_type` - material type (e.g., "carbon_cloth", "platinum")
- `system_configuration` - setup type (e.g., "single_chamber", "dual_chamber")
- `membrane_type` - membrane selection (e.g., "proton_exchange",
  "cation_exchange")

## Implementation Details

### Data Source

The system uses a single source of truth:

- **File**: `MESS_PARAMETERS_UNIFIED_FINAL.json`
- **Location**: `/public/parameters/`
- **Content**: 667 total entries (573 parameters + 94 variables)

### Filtering Logic

The system implements categorical variable filtering in two key files:

#### Core Filtering Function

```typescript
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
```

#### Implementation Files

**1. Parameter Data Service** (`parameter-data.ts`)

- Loads unified parameter data
- Filters out categorical variables in `getSystemParameters()`
- Transforms unified format to application format
- Provides parameter search and statistics

**2. Parameter Detail Service** (`parameter-detail-service.ts`)

- Handles individual parameter detail retrieval
- Filters out categorical variables in detail view
- Provides parameter documentation and metadata
- Manages parameter validation and error handling

### Current Statistics

After filtering implementation:

- **Total entries**: 667
- **Parameters (measurable)**: 573 (85.9%)
- **Variables (categorical)**: 94 (14.1%)

### Categories Affected

The refined filtering now focuses on truly categorical selections:

- **Species Selection Variables**: Only dropdown selections like
  `microbial_species` filtered
- **Material Type Variables**: Only selection dropdowns like `material_type`
  filtered
- **System Configuration Variables**: Only setup type selections filtered
- **Preserved Measurements**: Parameters with units are always included
  regardless of name patterns

### Key Refinements Made

1. **Unit-Based Inclusion**: Parameters with units are never filtered out
2. **Removed Overly Broad Patterns**: No longer filter based on 'species',
   'bacteria', 'microbe', 'organism' patterns
3. **Precise Pattern Matching**: Only filter specific categorical patterns like
   'material_type', 'electrode_type'
4. **Biological Measurements Preserved**: Parameters like
   `bacterial_concentration` (cells/mL) now correctly included

## Usage Guidelines

### For AI Agents

#### DO:

- ✅ Use `MESS_PARAMETERS_UNIFIED_FINAL.json` as single source of truth
- ✅ Filter categorical variables using `isCategoricalVariable()`
- ✅ Validate parameter existence before displaying detail pages
- ✅ Distinguish between parameters and variables in UI design
- ✅ Handle parameter ranges and units properly
- ✅ Maintain consistent filtering logic across services

#### DON'T:

- ❌ Treat species selection as a measurable parameter
- ❌ Create mock parameter data - use unified library
- ❌ Include categorical variables in parameter statistics
- ❌ Mix parameter and variable concepts in UI
- ❌ Ignore parameter validation and error handling

### Code Examples

#### Correct Parameter Loading

```typescript
// Load and filter parameters
export async function getSystemParameters(): Promise<Parameter[]> {
  const data = await loadUnifiedData();
  const parameters: Parameter[] = [];

  data.categories.forEach((category: any) => {
    category.subcategories.forEach((subcategory: any) => {
      subcategory.parameters.forEach((param: any) => {
        // Skip categorical variables - we only want measurable parameters
        if (isCategoricalVariable(param)) {
          console.log(
            `Filtering out categorical variable: ${param.name} (${param.id})`
          );
          return;
        }

        const transformedParam = transformUnifiedParameter(
          param,
          category,
          subcategory
        );
        parameters.push(transformedParam);
      });
    });
  });

  return parameters;
}
```

#### Correct Parameter Detail Retrieval

```typescript
export async function getParameterDetail(
  id: string
): Promise<ParameterDetail | null> {
  const data = await loadUnifiedData();

  // Find parameter in unified data
  const parameter = findParameterById(data, id);

  if (!parameter) {
    console.warn(`Parameter ${id} not found in unified data`);
    return null;
  }

  // Filter out categorical variables
  if (isCategoricalVariable(parameter)) {
    console.log(
      `Filtering out categorical variable in detail view: ${parameter.name} (${parameter.id})`
    );
    return null;
  }

  return transformToParameterDetail(parameter);
}
```

## Error Handling

### Common Issues and Solutions

#### 1. Parameter Not Found

```typescript
// Problem: Parameter ID doesn't exist
// Solution: Validate parameter existence
if (!parameter) {
  console.warn(`Parameter ${id} not found`);
  return null;
}
```

#### 2. Categorical Variable Displayed

```typescript
// Problem: Species selection shown as parameter
// Solution: Apply filtering before display
const parameters = allParams.filter((param) => !isCategoricalVariable(param));
```

#### 3. Inconsistent Data Sources

```typescript
// Problem: Different files using different data sources
// Solution: Use unified data source consistently
const response = await fetch('/parameters/MESS_PARAMETERS_UNIFIED_FINAL.json');
```

## Data Structure

### Unified Parameter Format

```typescript
interface UnifiedParameter {
  id: string; // Unique identifier
  name: string; // Human-readable name
  type: 'number' | 'string' | 'select' | 'boolean';
  unit?: string; // Physical unit (parameters only)
  range?: {
    // Value constraints
    min?: number;
    max?: number;
  };
  default?: any; // Default value
  description: string; // Parameter description
  typical_range?: {
    // Typical operating range
    min?: number;
    max?: number;
  };
  validation_rules?: string[]; // Validation constraints
  dependencies?: string[]; // Related parameters
  references?: string[]; // Scientific references
  compatibility?: {
    // System compatibility
    materials?: string[];
    microbes?: string[];
    environments?: string[];
  };
}
```

### Application Parameter Format

```typescript
interface Parameter {
  id: string;
  name: string;
  category: ParameterCategory;
  displayCategory?: DisplayCategory;
  subcategory?: string;
  type?: ParameterType;
  description?: string;
  properties: ParameterProperties;
  compatibility?: CompatibilityData;
  source?: string;
  isSystem: boolean;
  // Unified schema properties
  unit?: string;
  range?: ParameterRange;
  default?: any;
  typicalRange?: ParameterRange;
  validationRules?: string[];
  dependencies?: string[];
  references?: string[];
}
```

## Testing and Validation

### Parameter Validation

```typescript
export function validateParameterValue(parameter: any, value: any): boolean {
  if (!parameter || value === null || value === undefined) return false;

  switch (parameter.type) {
    case 'number':
      const numValue = Number(value);
      if (isNaN(numValue)) return false;
      if (parameter.range?.min !== undefined && numValue < parameter.range.min)
        return false;
      if (parameter.range?.max !== undefined && numValue > parameter.range.max)
        return false;
      return true;
    case 'select':
      return parameter.options ? parameter.options.includes(value) : false;
    case 'boolean':
      return typeof value === 'boolean';
    case 'string':
      return typeof value === 'string' && value.length > 0;
    default:
      return false;
  }
}
```

### Test Cases

- ✅ Parameter filtering correctly excludes categorical variables
- ✅ Parameter detail pages handle missing parameters gracefully
- ✅ Parameter validation works for all data types
- ✅ Unified data loading handles network errors
- ✅ Parameter statistics reflect filtered data

## Migration Notes

### From Previous System

- **Old system**: Mixed parameters and variables
- **New system**: Clear separation with filtering
- **Impact**: Reduced parameter count from 667 to 573
- **Benefit**: Cleaner UI and better user experience

### Breaking Changes

- Species selection no longer appears in parameter lists
- Biological category excludes categorical variables
- Parameter detail pages may return null for variables
- Statistics reflect filtered parameter counts

## Troubleshooting

### Common Problems

#### "Parameter not found" Errors

**Cause**: Parameter ID refers to a categorical variable **Solution**: Check if
the ID is in the excluded list

#### Inconsistent Parameter Counts

**Cause**: Different services using different filtering logic **Solution**:
Ensure both services use the same `isCategoricalVariable()` function

#### Missing Parameter Details

**Cause**: Parameter may be a filtered categorical variable **Solution**: Verify
parameter is not in the categorical exclusion list

### Debugging Tools

```typescript
// Check if parameter is categorical
console.log('Is categorical:', isCategoricalVariable(parameter));

// View parameter statistics
const stats = getParameterStatistics(parameters);
console.log('Parameter stats:', stats);

// Validate parameter structure
const isValid = validateParameterValue(parameter, value);
console.log('Parameter valid:', isValid);
```

## Future Enhancements

### Planned Features

- Enhanced parameter validation rules
- Dynamic parameter compatibility checking
- Advanced parameter search and filtering
- Parameter dependency visualization
- Real-time parameter monitoring

### Technical Improvements

- TypeScript strict typing for all parameter interfaces
- Comprehensive test coverage for parameter system
- Performance optimization for large parameter sets
- Caching strategy for parameter data
- Error recovery mechanisms

---

**Last Updated**: 2025-01-15 **Version**: 1.0.0 **Contact**: Development Team

This guide ensures consistent understanding and implementation of the MESSAI
parameter system across all AI agents and development workflows.
