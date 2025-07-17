# Parameter Database Documentation

> **Complete catalog of MESSAI's 667 parameters across 11 categories**

## 📊 Database Overview

The MESSAI parameter database contains **667 parameters** organized across **11
major categories** and **85 subcategories**, providing comprehensive coverage of
bioelectrochemical system parameters.

### Database Statistics

- **Total Parameters**: 667
- **Major Categories**: 11
- **Subcategories**: 85
- **Last Updated**: July 2025
- **Version**: 3.1.0

## 🏗️ Parameter Structure

### Core Parameter Schema

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
    min?: number; // Minimum allowed value
    max?: number; // Maximum allowed value
    typical?: number; // Typical/recommended value
  };
  default?: any; // Default value
  options?: string[]; // Available options (for select type)
  tags?: string[]; // Searchable tags
}
```

### Parameter Categories

```typescript
interface ParameterCategory {
  id: string; // Category identifier
  name: string; // Display name
  description: string; // Category description
  icon: string; // UI icon reference
  color: string; // UI color scheme
  subcategories?: string[]; // List of subcategories
}
```

## 📋 Category Breakdown

### 1. Biological Parameters (120+ parameters)

**Subcategories**:

- Biofilm Parameters
- Microbial Community
- Growth Kinetics
- Metabolic Pathways
- Enzyme Activity
- Cell Viability
- Biofilm Formation
- Electron Transfer

**Key Parameters**:

```typescript
{
  id: 'biofilm_conductivity',
  name: 'Biofilm Conductivity',
  description: 'Electrical conductivity of biofilm layer',
  unit: 'S/m',
  type: 'number',
  category: 'biological',
  subcategory: 'biofilm-parameters',
  range: { min: 0.001, max: 1, typical: 0.01 },
  default: 0.01
}
```

### 2. Electrical Parameters (95+ parameters)

**Subcategories**:

- Voltage and Current
- Power Density
- Impedance
- Electrochemical Kinetics
- Charge Transfer
- Ohmic Resistance
- Polarization

**Key Parameters**:

```typescript
{
  id: 'power_density',
  name: 'Power Density',
  description: 'Power output per unit area',
  unit: 'mW/cm²',
  type: 'number',
  category: 'electrical',
  subcategory: 'power-density',
  range: { min: 0.1, max: 5000, typical: 100 },
  default: 100
}
```

### 3. Environmental Parameters (85+ parameters)

**Subcategories**:

- Temperature Control
- pH and Buffer Systems
- Atmospheric Conditions
- Humidity Control
- Pressure Systems
- Gas Composition
- Lighting Conditions

**Key Parameters**:

```typescript
{
  id: 'operating_temperature',
  name: 'Operating Temperature',
  description: 'Cell/reactor operating temperature',
  unit: '°C',
  type: 'number',
  category: 'environmental',
  subcategory: 'temperature-control',
  range: { min: 4, max: 80, typical: 30 },
  default: 30
}
```

### 4. Materials Parameters (70+ parameters)

**Subcategories**:

- Electrode Materials
- Membrane Properties
- Catalyst Specifications
- Substrate Materials
- Separator Materials
- Conductive Materials

**Key Parameters**:

```typescript
{
  id: 'electrode_material',
  name: 'Electrode Material',
  description: 'Primary electrode material composition',
  unit: 'categorical',
  type: 'select',
  category: 'materials',
  subcategory: 'electrode-materials',
  options: [
    'Carbon Felt',
    'Carbon Cloth',
    'Graphene Oxide',
    'Stainless Steel',
    'MXene',
    'Platinum',
    'Activated Carbon'
  ]
}
```

### 5. Hydraulic Parameters (65+ parameters)

**Subcategories**:

- Flow Rate Control
- Pressure Drop
- Mixing Dynamics
- Recirculation Systems
- Residence Time
- Velocity Profiles

### 6. Chemical Parameters (60+ parameters)

**Subcategories**:

- Substrate Concentration
- pH Buffering
- Ionic Strength
- Redox Potential
- Chemical Oxygen Demand
- Dissolved Oxygen

### 7. Mechanical Parameters (50+ parameters)

**Subcategories**:

- Structural Design
- Vibration Control
- Stress Analysis
- Thermal Expansion
- Material Fatigue

### 8. Thermal Parameters (45+ parameters)

**Subcategories**:

- Heat Transfer
- Thermal Conductivity
- Insulation Properties
- Cooling Systems
- Heat Recovery

### 9. Optical Parameters (35+ parameters)

**Subcategories**:

- Light Intensity
- Wavelength Control
- Photosynthetic Efficiency
- Optical Density
- Spectral Analysis

### 10. Control Parameters (30+ parameters)

**Subcategories**:

- Process Control
- Automation Systems
- Sensor Calibration
- Control Loops
- Safety Systems

### 11. Economic Parameters (25+ parameters)

**Subcategories**:

- Cost Analysis
- Economic Viability
- Investment Requirements
- Operating Costs
- Maintenance Costs

## 🔍 Parameter Examples by Type

### Number Parameters

```typescript
{
  id: 'current_density',
  name: 'Current Density',
  description: 'Current per unit electrode area',
  unit: 'mA/cm²',
  type: 'number',
  range: { min: 0.1, max: 10000, typical: 500 },
  default: 500
}
```

### String Parameters

```typescript
{
  id: 'microorganism_species',
  name: 'Microorganism Species',
  description: 'Primary microorganism species used',
  unit: 'taxonomic',
  type: 'string',
  default: 'Mixed Culture'
}
```

### Boolean Parameters

```typescript
{
  id: 'membrane_present',
  name: 'Membrane Present',
  description: 'Whether system includes membrane separator',
  unit: 'boolean',
  type: 'boolean',
  default: true
}
```

### Select Parameters

```typescript
{
  id: 'system_configuration',
  name: 'System Configuration',
  description: 'Basic system architecture type',
  unit: 'categorical',
  type: 'select',
  options: [
    'Single Chamber',
    'Dual Chamber',
    'Stacked',
    'Tubular',
    'Flat Plate'
  ],
  default: 'Dual Chamber'
}
```

## 📈 Parameter Validation Rules

### Range Validation

- **Min/Max Bounds**: Hard limits for parameter values
- **Typical Range**: Recommended operating ranges
- **Outlier Detection**: Statistical anomaly identification

### Type Validation

- **Number**: Numeric values with unit validation
- **String**: Text values with format validation
- **Boolean**: True/false values
- **Select**: Enumerated options validation

### Cross-Parameter Validation

- **Compatibility Rules**: Parameter interdependencies
- **Constraint Checking**: Multi-parameter constraints
- **Warning Generation**: Contextual warnings

## 🔧 Database Access Functions

### Core Functions

```typescript
// Get all parameters
const getAllParameters = (): Parameter[] => {
  /* implementation */
};

// Search parameters
const searchParameters = (query: string): Parameter[] => {
  /* implementation */
};

// Get parameters by category
const getParametersByCategory = (categoryId: string): Parameter[] => {
  /* implementation */
};

// Get specific parameter
const getParameterById = (id: string): Parameter | undefined => {
  /* implementation */
};

// Validate parameter value
const validateParameterValue = (parameter: Parameter, value: any): boolean => {
  /* implementation */
};
```

### Statistics Functions

```typescript
// Get database statistics
const getParameterStatistics = () => {
  return {
    totalParameters: 667,
    totalCategories: 11,
    totalSubcategories: 85,
    parametersByCategory: {
      biological: 120,
      electrical: 95,
      environmental: 85,
      materials: 70,
      hydraulic: 65,
      chemical: 60,
      mechanical: 50,
      thermal: 45,
      optical: 35,
      control: 30,
      economic: 25,
    },
  };
};
```

## 📊 Export Capabilities

### JSON Export

```typescript
const exportParametersAsJSON = (parameters?: Parameter[]): string => {
  const data = parameters || getAllParameters();
  return JSON.stringify(
    {
      metadata: {
        exportDate: new Date().toISOString(),
        parameterCount: data.length,
        version: '3.1.0',
      },
      parameters: data,
    },
    null,
    2
  );
};
```

### CSV Export

```typescript
const exportParametersAsCSV = (parameters?: Parameter[]): string => {
  const data = parameters || getAllParameters();
  const headers = [
    'ID',
    'Name',
    'Description',
    'Unit',
    'Type',
    'Category',
    'Subcategory',
    'Min',
    'Max',
    'Typical',
    'Default',
  ];

  const csvData = data.map((param) => [
    param.id,
    param.name,
    param.description,
    param.unit,
    param.type,
    param.category,
    param.subcategory,
    param.range?.min || '',
    param.range?.max || '',
    param.range?.typical || '',
    param.default || '',
  ]);

  return [headers, ...csvData]
    .map((row) => row.map((field) => `"${field}"`).join(','))
    .join('\n');
};
```

## 🎯 Integration Points

### Database Integration

```typescript
// Prisma schema integration
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
```

### API Integration

```typescript
// RESTful API endpoints
GET    /api/parameters           // Get all parameters
GET    /api/parameters/:id       // Get specific parameter
GET    /api/parameters/category/:categoryId  // Get by category
POST   /api/parameters/search    // Search parameters
POST   /api/parameters/validate  // Validate parameter value
GET    /api/parameters/export    // Export parameters
```

## 🚀 Performance Considerations

### Optimization Strategies

- **Indexing**: Category and subcategory indexes for fast filtering
- **Caching**: In-memory caching for frequently accessed parameters
- **Pagination**: Large result set pagination support
- **Compression**: Gzip compression for JSON exports

### Memory Usage

- **Base Memory**: ~2MB for full parameter set
- **Cached Searches**: ~500KB additional per unique query
- **Export Buffers**: ~1MB for JSON, ~500KB for CSV

## 📋 Data Quality Assurance

### Validation Checks

- **Required Fields**: All parameters have required fields
- **Range Consistency**: Min ≤ Typical ≤ Max validation
- **Unit Standardization**: Consistent unit formatting
- **Description Quality**: Meaningful descriptions for all parameters

### Regular Updates

- **Literature Review**: Quarterly parameter updates
- **Range Adjustments**: Based on new research findings
- **Category Expansion**: New subcategories as needed
- **Deprecation Handling**: Graceful parameter retirement

---

**Database Source**: `parameters/MESS_PARAMETERS_UNIFIED_FINAL.json`  
**Implementation**: `apps/web/src/lib/parameters-data.ts`  
**Last Updated**: July 2025  
**Version**: 3.1.0
