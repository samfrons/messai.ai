# Data Exports - Sample Files

This directory contains sample data exports from the MESSAI parameter system in
various formats. These files demonstrate the structure and content of data that
can be exported from the system.

## 📁 File Overview

### `sample-parameters.json`

- **Format**: JSON
- **Size**: 25 parameters across 4 categories
- **Content**: Representative parameter definitions with complete metadata
- **Use Case**: Understanding parameter structure and data format
- **Categories Included**: Biological, Electrical, Environmental, Materials

### `sample-parameters.csv`

- **Format**: CSV (Comma-Separated Values)
- **Size**: Same 25 parameters as JSON version
- **Content**: Tabular format suitable for spreadsheet applications
- **Use Case**: Data analysis, import into Excel/Google Sheets
- **Columns**: ID, Name, Description, Unit, Type, Category, Subcategory, Min,
  Max, Typical, Default, Options, Tags

### `compatibility-examples.json`

- **Format**: JSON
- **Size**: 6 compatibility analysis results
- **Content**: Material compatibility scores and analysis
- **Use Case**: Understanding compatibility analysis output
- **Includes**: Scores, factors, warnings, recommendations, research references

### `fuel-cell-comparison.json`

- **Format**: JSON
- **Size**: 4 fuel cell system comparisons
- **Content**: Performance metrics, rankings, and optimization suggestions
- **Use Case**: Understanding fuel cell comparison output
- **Systems**: PEM, SOFC, PAFC, AFC configurations

### `validation-results.json`

- **Format**: JSON
- **Size**: 8 parameter validations plus cross-parameter analysis
- **Content**: Validation results with warnings, errors, and suggestions
- **Use Case**: Understanding validation framework output
- **Includes**: Individual parameter validation and system-level analysis

## 🔧 Usage Examples

### Loading JSON Data (JavaScript/TypeScript)

```javascript
import parameterData from './sample-parameters.json';

// Access parameter metadata
console.log(parameterData.metadata.totalParameters); // 25

// Find specific parameter
const powerDensity = parameterData.parameters.find(
  (p) => p.id === 'power_density'
);
console.log(powerDensity.range.typical); // 100

// Filter by category
const biologicalParams = parameterData.parameters.filter(
  (p) => p.category === 'biological'
);
```

### Loading CSV Data (Python)

```python
import pandas as pd

# Load CSV data
df = pd.read_csv('sample-parameters.csv')

# Basic statistics
print(f"Total parameters: {len(df)}")
print(f"Categories: {df['Category'].unique()}")

# Filter and analyze
electrical_params = df[df['Category'] == 'electrical']
print(f"Electrical parameters: {len(electrical_params)}")

# Export filtered data
biological_params = df[df['Category'] == 'biological']
biological_params.to_csv('biological-parameters.csv', index=False)
```

### Processing Compatibility Data

```javascript
import compatibilityData from './compatibility-examples.json';

// Calculate average compatibility score
const avgScore =
  compatibilityData.compatibilityAnalyses.reduce(
    (sum, analysis) => sum + analysis.result.score,
    0
  ) / compatibilityData.compatibilityAnalyses.length;

console.log(`Average compatibility score: ${avgScore.toFixed(1)}%`);

// Find best material combination
const bestCombo = compatibilityData.compatibilityAnalyses.reduce(
  (best, current) => (current.result.score > best.result.score ? current : best)
);

console.log(
  `Best combination: ${bestCombo.combination.anode} + ${bestCombo.combination.cathode}`
);
```

## 📊 Data Structure Reference

### Parameter Object Structure

```typescript
interface Parameter {
  id: string; // Unique identifier
  name: string; // Human-readable name
  description: string; // Detailed description
  unit: string; // Measurement unit
  type: 'number' | 'string' | 'boolean' | 'select';
  category: string; // Major category
  subcategory: string; // Specific subcategory
  range?: {
    min?: number; // Minimum value
    max?: number; // Maximum value
    typical?: number; // Typical value
  };
  default?: any; // Default value
  options?: string[]; // Select options
  tags?: string[]; // Search tags
}
```

### Compatibility Analysis Structure

```typescript
interface CompatibilityAnalysis {
  id: string;
  combination: {
    anode: string;
    cathode: string;
    organism: string;
    membrane?: string;
  };
  operatingConditions?: {
    temperature?: number;
    pH?: number;
    substrate?: string;
  };
  result: {
    score: number; // 0-100 compatibility score
    confidence: number; // 0-1 confidence level
    factors: {
      biocompatibility: number;
      conductivity: number;
      stability: number;
      cost: number;
      sustainability: number;
    };
    notes: string[];
    warnings?: string[];
    recommendations?: string[];
    references?: Array<{
      paperId: string;
      title: string;
      powerOutput?: number;
      efficiency?: number;
    }>;
  };
  timestamp: string;
}
```

### Validation Result Structure

```typescript
interface ValidationResult {
  isValid: boolean;
  warnings: string[];
  errors: string[];
  suggestions: string[];
}

interface ParameterValidation {
  parameter: string;
  value: number | string;
  unit?: string;
  result: ValidationResult;
  ranges: {
    valid: { min: number; max: number };
    typical: { min: number; max: number };
    optimal: number;
  };
  status: 'valid' | 'warning' | 'error';
}
```

## 🔄 Data Export Formats

### JSON Format

- **Advantages**: Preserves data types, nested structures, metadata
- **Use Cases**: API integration, web applications, data analysis
- **File Size**: Larger due to metadata and structure
- **Readability**: Good for developers, requires parsing for non-technical users

### CSV Format

- **Advantages**: Universal compatibility, simple structure
- **Use Cases**: Spreadsheet analysis, database import, reporting
- **File Size**: Compact, efficient for large datasets
- **Limitations**: Flat structure, limited data types

## 📈 Data Analysis Examples

### Parameter Distribution Analysis

```python
import pandas as pd
import matplotlib.pyplot as plt

# Load parameter data
df = pd.read_csv('sample-parameters.csv')

# Category distribution
category_counts = df['Category'].value_counts()
plt.figure(figsize=(10, 6))
category_counts.plot(kind='bar')
plt.title('Parameter Distribution by Category')
plt.xlabel('Category')
plt.ylabel('Number of Parameters')
plt.xticks(rotation=45)
plt.tight_layout()
plt.show()

# Type distribution
type_counts = df['Type'].value_counts()
print("Parameter Types:")
for param_type, count in type_counts.items():
    print(f"  {param_type}: {count}")
```

### Compatibility Score Analysis

```python
import json
import numpy as np

# Load compatibility data
with open('compatibility-examples.json', 'r') as f:
    data = json.load(f)

# Extract scores and factors
scores = [analysis['result']['score'] for analysis in data['compatibilityAnalyses']]
factors = [analysis['result']['factors'] for analysis in data['compatibilityAnalyses']]

# Calculate statistics
print(f"Compatibility Score Statistics:")
print(f"  Mean: {np.mean(scores):.1f}")
print(f"  Std Dev: {np.std(scores):.1f}")
print(f"  Min: {np.min(scores)}")
print(f"  Max: {np.max(scores)}")

# Factor analysis
factor_names = list(factors[0].keys())
for factor in factor_names:
    values = [f[factor] for f in factors]
    print(f"  {factor}: {np.mean(values):.1f} ± {np.std(values):.1f}")
```

## 🔍 Integration Examples

### React Component Integration

```jsx
import React, { useState, useEffect } from 'react';
import parameterData from './sample-parameters.json';

const ParameterExplorer = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [filteredParams, setFilteredParams] = useState(
    parameterData.parameters
  );

  useEffect(() => {
    const filtered =
      selectedCategory === 'all'
        ? parameterData.parameters
        : parameterData.parameters.filter(
            (p) => p.category === selectedCategory
          );
    setFilteredParams(filtered);
  }, [selectedCategory]);

  return (
    <div>
      <select
        value={selectedCategory}
        onChange={(e) => setSelectedCategory(e.target.value)}
      >
        <option value="all">All Categories</option>
        <option value="biological">Biological</option>
        <option value="electrical">Electrical</option>
        <option value="environmental">Environmental</option>
        <option value="materials">Materials</option>
      </select>

      <div className="parameter-grid">
        {filteredParams.map((param) => (
          <div key={param.id} className="parameter-card">
            <h3>{param.name}</h3>
            <p>{param.description}</p>
            <div className="parameter-meta">
              <span>Unit: {param.unit}</span>
              <span>Type: {param.type}</span>
              {param.range && (
                <span>
                  Range: {param.range.min} - {param.range.max}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
```

## 🎯 Best Practices

### Data Validation

- Always validate data structure before processing
- Check for required fields and data types
- Handle missing or null values gracefully
- Validate numerical ranges and constraints

### Performance Optimization

- Use appropriate data structures for your use case
- Implement pagination for large datasets
- Cache frequently accessed data
- Use efficient filtering and sorting algorithms

### Error Handling

- Implement comprehensive error handling
- Provide meaningful error messages
- Log errors for debugging
- Have fallback mechanisms for data loading failures

## 📋 Data Schema Validation

### JSON Schema Example

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "metadata": {
      "type": "object",
      "properties": {
        "exportDate": { "type": "string", "format": "date-time" },
        "version": { "type": "string" },
        "totalParameters": { "type": "number" }
      },
      "required": ["exportDate", "version", "totalParameters"]
    },
    "parameters": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "id": { "type": "string" },
          "name": { "type": "string" },
          "description": { "type": "string" },
          "unit": { "type": "string" },
          "type": { "enum": ["number", "string", "boolean", "select"] },
          "category": { "type": "string" },
          "subcategory": { "type": "string" }
        },
        "required": [
          "id",
          "name",
          "description",
          "unit",
          "type",
          "category",
          "subcategory"
        ]
      }
    }
  },
  "required": ["metadata", "parameters"]
}
```

---

**Data Version**: 3.1.0  
**Export Date**: July 17, 2025  
**Total Sample Parameters**: 25  
**Sample Analyses**: 16 (6 compatibility + 4 fuel cell + 1 validation + 5
cross-references)  
**Formats**: JSON, CSV  
**Use Cases**: Integration testing, data analysis, system validation
