# Integration Examples

> **Practical code examples and patterns for integrating MESSAI parameter system
> into messai-ai**

## 🚀 Quick Start Integration

### 1. Environment Setup

```bash
# Install required dependencies
npm install zod prisma @prisma/client next-auth
npm install --save-dev @types/node

# Environment variables
echo "DATABASE_URL=postgresql://user:password@localhost:5432/messai" >> .env
echo "NEXTAUTH_SECRET=your-secret-key" >> .env
echo "NEXTAUTH_URL=http://localhost:3000" >> .env
```

### 2. Database Schema Setup

```prisma
// prisma/schema.prisma
model Parameter {
  id          String   @id
  name        String
  description String
  unit        String
  type        String
  category    String
  subcategory String
  minValue    Float?
  maxValue    Float?
  typical     Float?
  defaultValue Json?
  options     String[]
  tags        String[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model ResearchPaper {
  id              String   @id @default(cuid())
  title           String
  authors         String[]
  journal         String?
  year            Int?
  doi             String?
  anodeMaterials  String?
  cathodeMaterials String?
  organismTypes   String?
  powerOutput     Float?
  efficiency      Float?
  currentDensity  Float?
  voltage         Float?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

model CompatibilityAnalysis {
  id          String   @id @default(cuid())
  anode       String
  cathode     String
  organism    String
  score       Float
  confidence  Float
  factors     Json
  notes       String[]
  warnings    String[]
  suggestions String[]
  userId      String?
  createdAt   DateTime @default(now())
}
```

### 3. Core Types and Interfaces

```typescript
// types/parameter-system.ts
export interface Parameter {
  id: string;
  name: string;
  description: string;
  unit: string;
  type: 'number' | 'string' | 'boolean' | 'select';
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

export interface CompatibilityScore {
  score: number;
  confidence: number;
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
}

export interface ValidationResult {
  isValid: boolean;
  warnings: string[];
  errors: string[];
  suggestions: string[];
}
```

## 🔧 Core Integration Patterns

### 1. Parameter Management Service

```typescript
// services/parameter-service.ts
import { PrismaClient } from '@prisma/client';
import { Parameter, ValidationResult } from '../types/parameter-system';

export class ParameterService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async getAllParameters(): Promise<Parameter[]> {
    return await this.prisma.parameter.findMany({
      orderBy: [{ category: 'asc' }, { subcategory: 'asc' }, { name: 'asc' }],
    });
  }

  async getParametersByCategory(category: string): Promise<Parameter[]> {
    return await this.prisma.parameter.findMany({
      where: { category },
      orderBy: [{ subcategory: 'asc' }, { name: 'asc' }],
    });
  }

  async searchParameters(query: string): Promise<Parameter[]> {
    return await this.prisma.parameter.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { tags: { hasSome: [query] } },
        ],
      },
      orderBy: { name: 'asc' },
    });
  }

  async validateParameter(
    parameterId: string,
    value: any
  ): Promise<ValidationResult> {
    const parameter = await this.prisma.parameter.findUnique({
      where: { id: parameterId },
    });

    if (!parameter) {
      return {
        isValid: false,
        warnings: [],
        errors: ['Parameter not found'],
        suggestions: [],
      };
    }

    return this.validateParameterValue(parameter, value);
  }

  private validateParameterValue(
    parameter: Parameter,
    value: any
  ): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      warnings: [],
      errors: [],
      suggestions: [],
    };

    if (parameter.type === 'number' && typeof value === 'number') {
      // Range validation
      if (parameter.range) {
        if (parameter.range.min !== undefined && value < parameter.range.min) {
          result.isValid = false;
          result.errors.push(
            `Value ${value} is below minimum ${parameter.range.min}`
          );
        }

        if (parameter.range.max !== undefined && value > parameter.range.max) {
          result.isValid = false;
          result.errors.push(
            `Value ${value} is above maximum ${parameter.range.max}`
          );
        }

        if (parameter.range.typical !== undefined) {
          const deviation =
            Math.abs(value - parameter.range.typical) / parameter.range.typical;
          if (deviation > 0.5) {
            result.warnings.push(
              `Value ${value} deviates significantly from typical ${parameter.range.typical}`
            );
          }
        }
      }
    }

    if (parameter.type === 'select' && parameter.options) {
      if (!parameter.options.includes(value)) {
        result.isValid = false;
        result.errors.push(
          `Value "${value}" is not in allowed options: ${parameter.options.join(
            ', '
          )}`
        );
      }
    }

    return result;
  }
}
```

### 2. Compatibility Analysis Service

```typescript
// services/compatibility-service.ts
import { CompatibilityScore } from '../types/parameter-system';

export class CompatibilityService {
  private materialProperties = {
    anode: {
      'Carbon Felt': {
        conductivity: 95,
        biocompatibility: 90,
        stability: 85,
        cost: 70,
        sustainability: 80,
      },
      'Carbon Cloth': {
        conductivity: 90,
        biocompatibility: 85,
        stability: 88,
        cost: 65,
        sustainability: 75,
      },
      'Graphene Oxide': {
        conductivity: 98,
        biocompatibility: 75,
        stability: 80,
        cost: 30,
        sustainability: 70,
      },
    },
    cathode: {
      Platinum: {
        catalyticActivity: 95,
        stability: 90,
        cost: 10,
        sustainability: 40,
      },
      'Activated Carbon': {
        catalyticActivity: 75,
        stability: 80,
        cost: 80,
        sustainability: 80,
      },
    },
    organism: {
      'Geobacter sulfurreducens': {
        electronTransfer: 95,
        growthRate: 70,
        robustness: 85,
        powerDensity: 90,
      },
      'Mixed Culture': {
        electronTransfer: 75,
        growthRate: 85,
        robustness: 95,
        powerDensity: 70,
      },
    },
  };

  async calculateCompatibility(
    anode: string,
    cathode: string,
    organism: string
  ): Promise<CompatibilityScore> {
    const anodeProps = this.materialProperties.anode[anode];
    const cathodeProps = this.materialProperties.cathode[cathode];
    const organismProps = this.materialProperties.organism[organism];

    if (!anodeProps || !cathodeProps || !organismProps) {
      return {
        score: 0,
        confidence: 0,
        factors: {
          biocompatibility: 0,
          conductivity: 0,
          stability: 0,
          cost: 0,
          sustainability: 0,
        },
        notes: [],
        warnings: ['Unknown material or organism combination'],
      };
    }

    const factors = {
      biocompatibility:
        (anodeProps.biocompatibility * organismProps.electronTransfer) / 100,
      conductivity:
        (anodeProps.conductivity + cathodeProps.catalyticActivity) / 2,
      stability: (anodeProps.stability + cathodeProps.stability) / 2,
      cost: (anodeProps.cost + cathodeProps.cost) / 2,
      sustainability:
        (anodeProps.sustainability + cathodeProps.sustainability) / 2,
    };

    const weights = {
      biocompatibility: 0.3,
      conductivity: 0.25,
      stability: 0.2,
      cost: 0.15,
      sustainability: 0.1,
    };

    const score = Math.round(
      Object.entries(factors).reduce((sum, [key, value]) => {
        return sum + value * weights[key as keyof typeof weights];
      }, 0)
    );

    const notes = [];
    const warnings = [];
    const recommendations = [];

    if (factors.biocompatibility > 80) {
      notes.push('Excellent biocompatibility between materials and organism');
    } else if (factors.biocompatibility < 60) {
      warnings.push('Low biocompatibility may limit performance');
      recommendations.push(
        'Consider surface modification or alternative materials'
      );
    }

    if (factors.cost < 50) {
      warnings.push('High material costs may limit commercial viability');
      recommendations.push('Consider cost-effective alternatives');
    }

    return {
      score,
      confidence: 0.85,
      factors,
      notes,
      warnings: warnings.length > 0 ? warnings : undefined,
      recommendations: recommendations.length > 0 ? recommendations : undefined,
    };
  }
}
```

### 3. React Hooks for Parameter Management

```typescript
// hooks/useParameters.ts
import { useState, useEffect } from 'react';
import { Parameter } from '../types/parameter-system';

export function useParameters(category?: string) {
  const [parameters, setParameters] = useState<Parameter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchParameters = async () => {
      try {
        setLoading(true);
        const url = category
          ? `/api/parameters/category/${category}`
          : '/api/parameters';

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Failed to fetch parameters');
        }

        const data = await response.json();
        setParameters(data.success ? data.data.parameters : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchParameters();
  }, [category]);

  return { parameters, loading, error };
}

// hooks/useCompatibility.ts
export function useCompatibility() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculateCompatibility = async (
    anode: string,
    cathode: string,
    organism: string
  ) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/parameters/compatibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ anode, cathode, organism }),
      });

      if (!response.ok) {
        throw new Error('Failed to calculate compatibility');
      }

      const data = await response.json();
      return data.compatibility;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { calculateCompatibility, loading, error };
}

// hooks/useValidation.ts
export function useValidation() {
  const [validationResults, setValidationResults] = useState<
    Record<string, ValidationResult>
  >({});

  const validateParameter = async (parameterId: string, value: any) => {
    try {
      const response = await fetch('/api/parameters/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parameters: [{ name: parameterId, value }],
        }),
      });

      if (!response.ok) {
        throw new Error('Validation failed');
      }

      const data = await response.json();
      const result = data.data.validations[0]?.result;

      setValidationResults((prev) => ({
        ...prev,
        [parameterId]: result,
      }));

      return result;
    } catch (err) {
      console.error('Validation error:', err);
      return {
        isValid: false,
        warnings: [],
        errors: ['Validation service unavailable'],
        suggestions: [],
      };
    }
  };

  return { validateParameter, validationResults };
}
```

### 4. React Components

```typescript
// components/ParameterInput.tsx
import React, { useState, useEffect } from 'react';
import { Parameter, ValidationResult } from '../types/parameter-system';
import { useValidation } from '../hooks/useValidation';

interface ParameterInputProps {
  parameter: Parameter;
  value: any;
  onChange: (value: any) => void;
  showValidation?: boolean;
}

export const ParameterInput: React.FC<ParameterInputProps> = ({
  parameter,
  value,
  onChange,
  showValidation = true,
}) => {
  const { validateParameter, validationResults } = useValidation();
  const [localValue, setLocalValue] = useState(value);
  const validation = validationResults[parameter.id];

  useEffect(() => {
    if (showValidation && localValue !== undefined) {
      validateParameter(parameter.id, localValue);
    }
  }, [localValue, parameter.id, showValidation]);

  const handleChange = (newValue: any) => {
    setLocalValue(newValue);
    onChange(newValue);
  };

  const renderInput = () => {
    switch (parameter.type) {
      case 'number':
        return (
          <input
            type="number"
            value={localValue || ''}
            onChange={(e) => handleChange(Number(e.target.value))}
            min={parameter.range?.min}
            max={parameter.range?.max}
            step={parameter.unit === '%' ? 0.1 : 1}
            className={`input ${
              validation && !validation.isValid ? 'error' : ''
            }`}
          />
        );

      case 'select':
        return (
          <select
            value={localValue || ''}
            onChange={(e) => handleChange(e.target.value)}
            className={`select ${
              validation && !validation.isValid ? 'error' : ''
            }`}
          >
            <option value="">Select {parameter.name}</option>
            {parameter.options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      case 'boolean':
        return (
          <input
            type="checkbox"
            checked={localValue || false}
            onChange={(e) => handleChange(e.target.checked)}
            className="checkbox"
          />
        );

      default:
        return (
          <input
            type="text"
            value={localValue || ''}
            onChange={(e) => handleChange(e.target.value)}
            className={`input ${
              validation && !validation.isValid ? 'error' : ''
            }`}
          />
        );
    }
  };

  return (
    <div className="parameter-input">
      <label className="label">
        {parameter.name}
        {parameter.unit && <span className="unit">({parameter.unit})</span>}
      </label>

      {renderInput()}

      {parameter.description && (
        <p className="description">{parameter.description}</p>
      )}

      {parameter.range && (
        <div className="range-info">
          Range: {parameter.range.min} - {parameter.range.max}
          {parameter.range.typical && (
            <span className="typical">
              {' '}
              (typical: {parameter.range.typical})
            </span>
          )}
        </div>
      )}

      {showValidation && validation && (
        <div className="validation">
          {validation.errors.map((error, i) => (
            <div key={i} className="error">
              {error}
            </div>
          ))}
          {validation.warnings.map((warning, i) => (
            <div key={i} className="warning">
              {warning}
            </div>
          ))}
          {validation.suggestions.map((suggestion, i) => (
            <div key={i} className="suggestion">
              {suggestion}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
```

```typescript
// components/CompatibilityAnalyzer.tsx
import React, { useState } from 'react';
import { CompatibilityScore } from '../types/parameter-system';
import { useCompatibility } from '../hooks/useCompatibility';

export const CompatibilityAnalyzer: React.FC = () => {
  const [anode, setAnode] = useState('');
  const [cathode, setCathode] = useState('');
  const [organism, setOrganism] = useState('');
  const [result, setResult] = useState<CompatibilityScore | null>(null);

  const { calculateCompatibility, loading, error } = useCompatibility();

  const handleAnalyze = async () => {
    if (!anode || !cathode || !organism) return;

    try {
      const compatibility = await calculateCompatibility(
        anode,
        cathode,
        organism
      );
      setResult(compatibility);
    } catch (err) {
      console.error('Analysis failed:', err);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'green';
    if (score >= 60) return 'yellow';
    return 'red';
  };

  return (
    <div className="compatibility-analyzer">
      <h3>Material Compatibility Analysis</h3>

      <div className="inputs">
        <select value={anode} onChange={(e) => setAnode(e.target.value)}>
          <option value="">Select Anode</option>
          <option value="Carbon Felt">Carbon Felt</option>
          <option value="Carbon Cloth">Carbon Cloth</option>
          <option value="Graphene Oxide">Graphene Oxide</option>
        </select>

        <select value={cathode} onChange={(e) => setCathode(e.target.value)}>
          <option value="">Select Cathode</option>
          <option value="Platinum">Platinum</option>
          <option value="Activated Carbon">Activated Carbon</option>
        </select>

        <select value={organism} onChange={(e) => setOrganism(e.target.value)}>
          <option value="">Select Organism</option>
          <option value="Geobacter sulfurreducens">
            Geobacter sulfurreducens
          </option>
          <option value="Mixed Culture">Mixed Culture</option>
        </select>

        <button
          onClick={handleAnalyze}
          disabled={loading || !anode || !cathode || !organism}
        >
          {loading ? 'Analyzing...' : 'Analyze Compatibility'}
        </button>
      </div>

      {error && <div className="error">Error: {error}</div>}

      {result && (
        <div className="results">
          <div className="score-card">
            <div className={`score ${getScoreColor(result.score)}`}>
              {result.score}%
            </div>
            <div className="confidence">
              Confidence: {Math.round(result.confidence * 100)}%
            </div>
          </div>

          <div className="factors">
            <h4>Factor Analysis</h4>
            {Object.entries(result.factors).map(([factor, value]) => (
              <div key={factor} className="factor">
                <span className="factor-name">{factor}:</span>
                <div className="factor-bar">
                  <div className="factor-fill" style={{ width: `${value}%` }} />
                </div>
                <span className="factor-value">{Math.round(value)}%</span>
              </div>
            ))}
          </div>

          {result.notes.length > 0 && (
            <div className="notes">
              <h4>Notes</h4>
              <ul>
                {result.notes.map((note, i) => (
                  <li key={i}>{note}</li>
                ))}
              </ul>
            </div>
          )}

          {result.warnings && result.warnings.length > 0 && (
            <div className="warnings">
              <h4>Warnings</h4>
              <ul>
                {result.warnings.map((warning, i) => (
                  <li key={i}>{warning}</li>
                ))}
              </ul>
            </div>
          )}

          {result.recommendations && result.recommendations.length > 0 && (
            <div className="recommendations">
              <h4>Recommendations</h4>
              <ul>
                {result.recommendations.map((rec, i) => (
                  <li key={i}>{rec}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
```

### 5. Parameter Configuration Form

```typescript
// components/ParameterConfigForm.tsx
import React, { useState } from 'react';
import { Parameter, ValidationResult } from '../types/parameter-system';
import { useParameters } from '../hooks/useParameters';
import { ParameterInput } from './ParameterInput';

interface ParameterConfigFormProps {
  category?: string;
  onConfigChange: (config: Record<string, any>) => void;
}

export const ParameterConfigForm: React.FC<ParameterConfigFormProps> = ({
  category,
  onConfigChange,
}) => {
  const { parameters, loading, error } = useParameters(category);
  const [config, setConfig] = useState<Record<string, any>>({});
  const [validationSummary, setValidationSummary] = useState<ValidationResult>({
    isValid: true,
    warnings: [],
    errors: [],
    suggestions: [],
  });

  const handleParameterChange = (parameterId: string, value: any) => {
    const newConfig = { ...config, [parameterId]: value };
    setConfig(newConfig);
    onConfigChange(newConfig);
  };

  const validateConfiguration = async () => {
    const response = await fetch('/api/parameters/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        parameters: Object.entries(config).map(([id, value]) => ({
          name: id,
          value,
        })),
      }),
    });

    if (response.ok) {
      const data = await response.json();
      setValidationSummary(data.data.summary);
    }
  };

  if (loading) return <div>Loading parameters...</div>;
  if (error) return <div>Error: {error}</div>;

  // Group parameters by subcategory
  const groupedParameters = parameters.reduce((groups, param) => {
    const key = param.subcategory;
    if (!groups[key]) groups[key] = [];
    groups[key].push(param);
    return groups;
  }, {} as Record<string, Parameter[]>);

  return (
    <div className="parameter-config-form">
      <div className="form-header">
        <h3>Parameter Configuration</h3>
        <button onClick={validateConfiguration}>Validate Configuration</button>
      </div>

      {Object.entries(groupedParameters).map(([subcategory, params]) => (
        <div key={subcategory} className="subcategory-section">
          <h4>{subcategory.replace('-', ' ').toUpperCase()}</h4>

          <div className="parameters-grid">
            {params.map((parameter) => (
              <ParameterInput
                key={parameter.id}
                parameter={parameter}
                value={config[parameter.id]}
                onChange={(value) => handleParameterChange(parameter.id, value)}
              />
            ))}
          </div>
        </div>
      ))}

      {validationSummary && (
        <div className="validation-summary">
          <h4>Configuration Validation</h4>
          <div
            className={`status ${
              validationSummary.isValid ? 'valid' : 'invalid'
            }`}
          >
            {validationSummary.isValid
              ? 'Configuration is valid'
              : 'Configuration has errors'}
          </div>

          {validationSummary.errors.length > 0 && (
            <div className="errors">
              <h5>Errors:</h5>
              <ul>
                {validationSummary.errors.map((error, i) => (
                  <li key={i}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          {validationSummary.warnings.length > 0 && (
            <div className="warnings">
              <h5>Warnings:</h5>
              <ul>
                {validationSummary.warnings.map((warning, i) => (
                  <li key={i}>{warning}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
```

## 📱 Mobile Integration Example

```typescript
// mobile/ParameterMobileApp.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { CompatibilityAnalyzer } from './components/CompatibilityAnalyzer';
import { ParameterSearch } from './components/ParameterSearch';

export const ParameterMobileApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'search' | 'compatibility'>(
    'search'
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>MESSAI Parameter System</Text>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'search' && styles.activeTab]}
          onPress={() => setActiveTab('search')}
        >
          <Text style={styles.tabText}>Search</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'compatibility' && styles.activeTab,
          ]}
          onPress={() => setActiveTab('compatibility')}
        >
          <Text style={styles.tabText}>Compatibility</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {activeTab === 'search' ? (
          <ParameterSearch />
        ) : (
          <CompatibilityAnalyzer />
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#2196F3',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    padding: 15,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#2196F3',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    padding: 20,
  },
});
```

## 🌐 Web Integration Example

```typescript
// pages/parameters/index.tsx
import React, { useState } from 'react';
import { NextPage } from 'next';
import { ParameterConfigForm } from '../../components/ParameterConfigForm';
import { CompatibilityAnalyzer } from '../../components/CompatibilityAnalyzer';

const ParametersPage: NextPage = () => {
  const [selectedCategory, setSelectedCategory] =
    useState<string>('biological');
  const [configuration, setConfiguration] = useState<Record<string, any>>({});

  const categories = [
    { id: 'biological', name: 'Biological' },
    { id: 'electrical', name: 'Electrical' },
    { id: 'environmental', name: 'Environmental' },
    { id: 'materials', name: 'Materials' },
  ];

  const handleExportConfiguration = () => {
    const dataStr = JSON.stringify(configuration, null, 2);
    const dataUri =
      'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

    const exportFileDefaultName = 'messai-configuration.json';
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <div className="parameters-page">
      <div className="page-header">
        <h1>Parameter Management</h1>
        <div className="actions">
          <button onClick={handleExportConfiguration}>
            Export Configuration
          </button>
        </div>
      </div>

      <div className="content-grid">
        <div className="sidebar">
          <h3>Categories</h3>
          <ul className="category-list">
            {categories.map((category) => (
              <li
                key={category.id}
                className={selectedCategory === category.id ? 'active' : ''}
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.name}
              </li>
            ))}
          </ul>
        </div>

        <div className="main-content">
          <ParameterConfigForm
            category={selectedCategory}
            onConfigChange={setConfiguration}
          />
        </div>

        <div className="analysis-panel">
          <CompatibilityAnalyzer />
        </div>
      </div>
    </div>
  );
};

export default ParametersPage;
```

## 🔧 Configuration & Deployment

### Next.js Configuration

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true,
  },
  env: {
    MESSAI_API_URL: process.env.MESSAI_API_URL,
  },
  async rewrites() {
    return [
      {
        source: '/api/parameters/:path*',
        destination: `${process.env.MESSAI_API_URL}/api/parameters/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
```

### Docker Configuration

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  messai-app:
    build: .
    ports:
      - '3000:3000'
    environment:
      - DATABASE_URL=postgresql://postgres:password@postgres:5432/messai
      - NEXTAUTH_SECRET=your-secret-key
      - NEXTAUTH_URL=http://localhost:3000
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:15
    environment:
      - POSTGRES_DB=messai
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - '6379:6379'

volumes:
  postgres_data:
```

## 🚀 Performance Optimization

### Caching Strategy

```typescript
// lib/cache.ts
import Redis from 'ioredis';

class CacheService {
  private redis: Redis;

  constructor() {
    this.redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
  }

  async getParameters(category?: string): Promise<Parameter[] | null> {
    const key = `parameters:${category || 'all'}`;
    const cached = await this.redis.get(key);

    if (cached) {
      return JSON.parse(cached);
    }

    return null;
  }

  async setParameters(
    parameters: Parameter[],
    category?: string
  ): Promise<void> {
    const key = `parameters:${category || 'all'}`;
    await this.redis.setex(key, 3600, JSON.stringify(parameters)); // 1 hour cache
  }

  async getCompatibility(
    anode: string,
    cathode: string,
    organism: string
  ): Promise<CompatibilityScore | null> {
    const key = `compatibility:${anode}:${cathode}:${organism}`;
    const cached = await this.redis.get(key);

    if (cached) {
      return JSON.parse(cached);
    }

    return null;
  }

  async setCompatibility(
    anode: string,
    cathode: string,
    organism: string,
    result: CompatibilityScore
  ): Promise<void> {
    const key = `compatibility:${anode}:${cathode}:${organism}`;
    await this.redis.setex(key, 1800, JSON.stringify(result)); // 30 minutes cache
  }
}

export const cacheService = new CacheService();
```

### Database Optimization

```sql
-- Database indexes for performance
CREATE INDEX idx_parameters_category ON parameters(category);
CREATE INDEX idx_parameters_subcategory ON parameters(subcategory);
CREATE INDEX idx_parameters_type ON parameters(type);
CREATE INDEX idx_parameters_name ON parameters(name);
CREATE INDEX idx_parameters_search ON parameters USING GIN(to_tsvector('english', name || ' ' || description));

CREATE INDEX idx_research_papers_materials ON research_papers USING GIN(anode_materials, cathode_materials, organism_types);
CREATE INDEX idx_research_papers_performance ON research_papers(power_output, efficiency);

CREATE INDEX idx_compatibility_combination ON compatibility_analysis(anode, cathode, organism);
CREATE INDEX idx_compatibility_user ON compatibility_analysis(user_id);
```

## 📊 Monitoring & Analytics

```typescript
// lib/analytics.ts
export class AnalyticsService {
  async trackParameterAccess(parameterId: string, userId?: string) {
    // Track parameter usage
    await fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'parameter_access',
        parameterId,
        userId,
        timestamp: new Date().toISOString(),
      }),
    });
  }

  async trackCompatibilityAnalysis(
    anode: string,
    cathode: string,
    organism: string,
    score: number,
    userId?: string
  ) {
    await fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'compatibility_analysis',
        materials: { anode, cathode, organism },
        score,
        userId,
        timestamp: new Date().toISOString(),
      }),
    });
  }

  async trackValidation(
    parameterId: string,
    isValid: boolean,
    userId?: string
  ) {
    await fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'parameter_validation',
        parameterId,
        isValid,
        userId,
        timestamp: new Date().toISOString(),
      }),
    });
  }
}

export const analytics = new AnalyticsService();
```

---

**Integration Guide Version**: 1.0.0  
**Compatible with**: Next.js 14+, React 18+, Node.js 18+  
**Database**: PostgreSQL with Prisma ORM  
**Caching**: Redis recommended for production  
**Testing**: Jest + React Testing Library examples available
