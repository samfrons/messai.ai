# API Reference Documentation

> **Complete API specification for MESSAI parameter system integration**

## 🔗 Base URL & Authentication

### Base URL

```
https://your-messai-domain.com/api
```

### Authentication

```typescript
// NextAuth.js session-based authentication
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/auth-options';

const session = await getServerSession(authOptions);
```

## 📊 Parameter Management APIs

### Get All Parameters

```http
GET /api/parameters
```

**Response:**

```typescript
{
  success: true,
  data: {
    parameters: Parameter[],
    metadata: {
      totalCount: number,
      categories: string[],
      lastUpdated: string
    }
  }
}
```

### Get Parameter by ID

```http
GET /api/parameters/{id}
```

**Response:**

```typescript
{
  success: true,
  data: {
    parameter: Parameter,
    relatedParameters: Parameter[]
  }
}
```

### Search Parameters

```http
POST /api/parameters/search
```

**Request Body:**

```typescript
{
  query: string,
  category?: string,
  subcategory?: string,
  filters?: {
    type?: 'number' | 'string' | 'boolean' | 'select',
    unit?: string,
    hasRange?: boolean
  },
  pagination?: {
    page: number,
    limit: number
  }
}
```

**Response:**

```typescript
{
  success: true,
  data: {
    parameters: Parameter[],
    pagination: {
      page: number,
      limit: number,
      totalCount: number,
      totalPages: number
    },
    facets: {
      categories: Array<{ id: string, count: number }>,
      types: Array<{ type: string, count: number }>,
      units: Array<{ unit: string, count: number }>
    }
  }
}
```

### Get Parameters by Category

```http
GET /api/parameters/category/{categoryId}
```

**Query Parameters:**

- `subcategory` (optional): Filter by subcategory
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 50)

**Response:**

```typescript
{
  success: true,
  data: {
    category: ParameterCategory,
    parameters: Parameter[],
    subcategories: string[],
    pagination: PaginationInfo
  }
}
```

### Export Parameters

```http
GET /api/parameters/export
```

**Query Parameters:**

- `format`: `json` | `csv`
- `category` (optional): Filter by category
- `subcategory` (optional): Filter by subcategory

**Response:**

```typescript
// For JSON format
{
  success: true,
  data: {
    downloadUrl: string,
    filename: string,
    format: 'json',
    parameterCount: number
  }
}

// For CSV format
Content-Type: text/csv
Content-Disposition: attachment; filename="parameters.csv"
```

## 🧪 Compatibility Analysis APIs

### Calculate Compatibility

```http
POST /api/parameters/compatibility
```

**Request Body:**

```typescript
{
  anode: string,
  cathode: string,
  organism: string,
  membrane?: string,
  operatingConditions?: {
    temperature?: number,
    pH?: number,
    substrate?: string
  }
}
```

**Response:**

```typescript
{
  compatibility: {
    score: number,           // 0-100
    confidence: number,      // 0-1
    factors: {
      biocompatibility: number,
      conductivity: number,
      stability: number,
      cost: number,
      sustainability: number
    },
    notes: string[],
    warnings?: string[],
    recommendations?: string[],
    references?: Array<{
      paperId: string,
      title: string,
      powerOutput?: number,
      efficiency?: number
    }>
  },
  combination: {
    anode: string,
    cathode: string,
    organism: string,
    membrane?: string
  },
  timestamp: string
}
```

### Get Compatibility Suggestions

```http
GET /api/parameters/compatibility/suggestions
```

**Query Parameters:**

- `type`: `anode` | `cathode` | `organism` | `membrane`
- `anode` (optional): Current anode selection
- `cathode` (optional): Current cathode selection
- `organism` (optional): Current organism selection

**Response:**

```typescript
{
  type: string,
  options: string[],
  currentSelection: {
    anode?: string,
    cathode?: string,
    organism?: string
  },
  recommendations?: Array<{
    option: string,
    compatibilityScore: number,
    reason: string
  }>
}
```

## ⚡ Fuel Cell Comparison APIs

### Compare Fuel Cell Systems

```http
POST /api/fuel-cell/comparison
```

**Request Body:**

```typescript
{
  systems: Array<{
    id: string,
    name: string,
    fuelCellType: 'PEM' | 'SOFC' | 'PAFC' | 'MCFC' | 'AFC',
    cellCount: number,
    activeArea: number,
    operatingTemperature: number,
    operatingPressure: number,
    humidity: number,
    fuelFlowRate: number,
    airFlowRate: number,
    anodeCatalyst?: string,
    cathodeCatalyst?: string,
    membraneType?: string
  }>,
  modelFidelity: 'BASIC' | 'INTERMEDIATE' | 'ADVANCED',
  includeOptimization?: boolean,
  includeSensitivity?: boolean
}
```

**Response:**

```typescript
{
  success: true,
  data: {
    results: Array<{
      systemId: string,
      systemName: string,
      prediction: PredictionResult,
      metrics: {
        power: number,
        efficiency: number,
        powerDensity: number,
        voltage: number,
        current: number,
        fuelUtilization: number,
        cost: number,
        durability: number,
        co2Emissions: number,
        waterProduction: number
      },
      rank: {
        power: number,
        efficiency: number,
        cost: number,
        durability: number,
        overall: number
      },
      optimization?: {
        potentialImprovement: number,
        optimizedPower: number,
        optimizedEfficiency: number
      }
    }>,
    summary: {
      bestPower: ComparisonResult,
      bestEfficiency: ComparisonResult,
      bestCost: ComparisonResult,
      bestOverall: ComparisonResult
    },
    metadata: {
      comparisonId: string,
      timestamp: string,
      systemCount: number,
      modelFidelity: string,
      processingTime: number
    }
  }
}
```

### Get Comparison Capabilities

```http
GET /api/fuel-cell/comparison
```

**Response:**

```typescript
{
  success: true,
  data: {
    supportedFuelCellTypes: string[],
    supportedMetrics: Array<{
      id: string,
      label: string,
      unit: string,
      description: string
    }>,
    modelFidelityOptions: Array<{
      id: string,
      label: string,
      description: string
    }>,
    limits: {
      minSystems: number,
      maxSystems: number,
      maxCellCount: number,
      maxActiveArea: number
    }
  }
}
```

## 🔍 Prediction APIs

### Get Fuel Cell Predictions

```http
POST /api/fuel-cell/predictions
```

**Request Body:**

```typescript
{
  fuelCellType: 'PEM' | 'SOFC' | 'PAFC' | 'MCFC' | 'AFC',
  cellCount: number,
  activeArea: number,
  operatingTemperature: number,
  operatingPressure: number,
  humidity: number,
  fuelFlowRate: number,
  airFlowRate: number,
  currentDensity?: number,
  voltage?: number,
  modelFidelity?: 'BASIC' | 'INTERMEDIATE' | 'ADVANCED'
}
```

**Response:**

```typescript
{
  success: true,
  data: {
    prediction: {
      powerOutput: number,
      efficiency: number,
      voltage: number,
      current: number,
      fuelUtilization: number,
      confidence: number,
      warnings: string[],
      recommendations: string[]
    },
    metadata: {
      predictionId: string,
      timestamp: string,
      modelFidelity: string,
      processingTime: number
    }
  }
}
```

### Get System Predictions

```http
POST /api/predictions
```

**Request Body:**

```typescript
{
  systemType: 'MFC' | 'MEC' | 'MDC' | 'MES',
  parameters: {
    [key: string]: number | string
  },
  modelComplexity?: 'simple' | 'intermediate' | 'advanced'
}
```

**Response:**

```typescript
{
  success: true,
  data: {
    predictions: {
      powerDensity: number,
      efficiency: number,
      voltage: number,
      currentDensity: number
    },
    confidence: number,
    warnings: string[],
    recommendations: string[]
  }
}
```

## 🎛️ Control System APIs

### Run Control System Simulation

```http
POST /api/fuel-cell/control-simulation
```

**Request Body:**

```typescript
{
  systemConfiguration: FuelCellConfiguration,
  controlParameters: {
    type: 'PID' | 'MPC' | 'fuzzy' | 'adaptive',
    setpoints: {
      voltage?: number,
      power?: number,
      temperature?: number,
      pressure?: number
    },
    tuning: {
      kp?: number,
      ki?: number,
      kd?: number,
      sampleTime?: number
    }
  },
  simulationParameters: {
    duration: number,
    timeStep: number,
    disturbances?: Array<{
      type: string,
      time: number,
      value: number
    }>
  }
}
```

**Response:**

```typescript
{
  success: true,
  data: {
    simulation: {
      timeData: number[],
      voltageData: number[],
      currentData: number[],
      powerData: number[],
      temperatureData: number[],
      pressureData: number[],
      efficiencyData: number[],
      controlSignals: {
        time: number[],
        fuelFlow: number[],
        airFlow: number[],
        coolingRate: number[]
      }
    },
    performance: {
      averagePower: number,
      averageEfficiency: number,
      stabilityIndex: number,
      responseTime: number
    },
    metadata: {
      simulationId: string,
      timestamp: string,
      duration: number,
      controllerType: string
    }
  }
}
```

## 🔧 Optimization APIs

### Optimize Fuel Cell Configuration

```http
POST /api/fuel-cell/optimization
```

**Request Body:**

```typescript
{
  baseConfiguration: FuelCellConfiguration,
  objective: {
    type: 'maximize_power' | 'maximize_efficiency' | 'minimize_cost' | 'custom',
    weights?: {
      power?: number,
      efficiency?: number,
      cost?: number,
      durability?: number
    }
  },
  constraints: {
    minPower?: number,
    maxTemperature?: number,
    maxPressure?: number,
    maxCost?: number
  },
  algorithm: 'genetic' | 'particle_swarm' | 'gradient_descent' | 'simulated_annealing',
  iterations?: number
}
```

**Response:**

```typescript
{
  success: true,
  data: {
    optimization: {
      originalConfiguration: FuelCellConfiguration,
      optimizedConfiguration: FuelCellConfiguration,
      originalPerformance: FuelCellPerformanceMetrics,
      optimizedPerformance: FuelCellPerformanceMetrics,
      improvementMetrics: {
        powerImprovement: number,
        efficiencyImprovement: number,
        costChange: number
      },
      optimizationSteps: Array<{
        iteration: number,
        parameters: Partial<FuelCellConfiguration>,
        performance: FuelCellPerformanceMetrics,
        objectiveValue: number,
        improvement: number
      }>,
      convergenceData: {
        iterations: number,
        finalObjectiveValue: number,
        convergenceThreshold: number,
        executionTime: number,
        algorithm: string
      }
    },
    metadata: {
      optimizationId: string,
      timestamp: string,
      algorithm: string,
      iterations: number,
      executionTime: number
    }
  }
}
```

## ✅ Validation APIs

### Validate Parameters

```http
POST /api/parameters/validate
```

**Request Body:**

```typescript
{
  parameters: Array<{
    name: string;
    value: number | string;
    unit?: string;
    confidence?: number;
  }>;
}
```

**Response:**

```typescript
{
  success: true,
  data: {
    validations: Array<{
      parameter: string,
      result: {
        isValid: boolean,
        warnings: string[],
        errors: string[],
        suggestions: string[]
      }
    }>,
    summary: {
      totalParameters: number,
      validParameters: number,
      parametersWithWarnings: number,
      parametersWithErrors: number,
      overallScore: number
    },
    timestamp: string
  }
}
```

### Validate Configuration

```http
POST /api/parameters/validate/configuration
```

**Request Body:**

```typescript
{
  systemType: 'MFC' | 'MEC' | 'MDC' | 'MES',
  configuration: {
    anodeMaterial: string,
    cathodeMaterial: string,
    microorganism?: string,
    temperature?: number,
    ph?: number,
    substrateConcentration?: number,
    powerDensity?: number,
    currentDensity?: number,
    voltage?: number
  }
}
```

**Response:**

```typescript
{
  success: true,
  data: {
    validation: {
      isValid: boolean,
      warnings: string[],
      errors: string[],
      suggestions: string[]
    },
    parameterValidations: Array<{
      parameter: string,
      status: 'valid' | 'warning' | 'error',
      message?: string
    }>,
    compatibilityAnalysis: {
      materialCompatibility: number,
      operatingConditionSuitability: number,
      overallCompatibility: number
    }
  }
}
```

## 📚 Research & Documentation APIs

### Get Research Papers

```http
GET /api/research/papers
```

**Query Parameters:**

- `anodeMaterial` (optional): Filter by anode material
- `cathodeMaterial` (optional): Filter by cathode material
- `organism` (optional): Filter by organism
- `powerMin` (optional): Minimum power output
- `powerMax` (optional): Maximum power output
- `page` (optional): Page number
- `limit` (optional): Items per page

**Response:**

```typescript
{
  success: true,
  data: {
    papers: Array<{
      id: string,
      title: string,
      authors: string[],
      journal: string,
      year: number,
      doi?: string,
      anodeMaterials: string[],
      cathodeMaterials: string[],
      organisms: string[],
      powerOutput?: number,
      efficiency?: number,
      currentDensity?: number,
      voltage?: number
    }>,
    pagination: PaginationInfo,
    facets: {
      anodeMaterials: Array<{ material: string, count: number }>,
      cathodeMaterials: Array<{ material: string, count: number }>,
      organisms: Array<{ organism: string, count: number }>
    }
  }
}
```

### Get Knowledge Graph

```http
GET /api/research/knowledge-graph
```

**Query Parameters:**

- `entity` (optional): Focus entity
- `depth` (optional): Relationship depth (default: 2)
- `type` (optional): Entity type filter

**Response:**

```typescript
{
  success: true,
  data: {
    nodes: Array<{
      id: string,
      label: string,
      type: string,
      properties: Record<string, any>
    }>,
    edges: Array<{
      source: string,
      target: string,
      relationship: string,
      weight: number
    }>,
    statistics: {
      nodeCount: number,
      edgeCount: number,
      entityTypes: string[],
      relationshipTypes: string[]
    }
  }
}
```

## 🔧 Reference Data APIs

### Get Materials Database

```http
GET /api/reference/materials
```

**Query Parameters:**

- `type` (optional): `anode` | `cathode` | `membrane` | `catalyst`
- `category` (optional): Material category
- `includeProperties` (optional): Include material properties

**Response:**

```typescript
{
  success: true,
  data: {
    materials: Array<{
      id: string,
      name: string,
      type: string,
      category: string,
      properties: {
        conductivity?: number,
        biocompatibility?: number,
        stability?: number,
        cost?: number,
        sustainability?: number,
        [key: string]: any
      },
      applications: string[],
      references: string[]
    }>,
    categories: string[],
    types: string[]
  }
}
```

### Get Reference Documentation

```http
GET /api/reference/documentation
```

**Query Parameters:**

- `topic` (optional): Documentation topic
- `format` (optional): Response format

**Response:**

```typescript
{
  success: true,
  data: {
    documentation: Array<{
      id: string,
      title: string,
      topic: string,
      content: string,
      lastUpdated: string,
      tags: string[]
    }>,
    topics: string[],
    metadata: {
      totalDocuments: number,
      lastUpdated: string
    }
  }
}
```

## 🎯 Health & Status APIs

### System Health Check

```http
GET /api/health
```

**Response:**

```typescript
{
  status: 'healthy' | 'degraded' | 'unhealthy',
  timestamp: string,
  services: {
    database: 'healthy' | 'degraded' | 'unhealthy',
    cache: 'healthy' | 'degraded' | 'unhealthy',
    predictions: 'healthy' | 'degraded' | 'unhealthy',
    validation: 'healthy' | 'degraded' | 'unhealthy'
  },
  performance: {
    averageResponseTime: number,
    requestsPerSecond: number,
    errorRate: number
  },
  version: string
}
```

### API Statistics

```http
GET /api/stats
```

**Response:**

```typescript
{
  success: true,
  data: {
    usage: {
      totalRequests: number,
      requestsToday: number,
      averageResponseTime: number,
      errorRate: number
    },
    popular: {
      endpoints: Array<{ endpoint: string, count: number }>,
      parameters: Array<{ parameter: string, count: number }>,
      materials: Array<{ material: string, count: number }>
    },
    system: {
      uptime: number,
      version: string,
      lastDeployment: string
    }
  }
}
```

## 📝 Error Handling

### Standard Error Response

```typescript
{
  success: false,
  error: string,
  message: string,
  details?: any,
  timestamp: string,
  requestId?: string
}
```

### Common Error Codes

- `400` - Bad Request (validation errors)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource doesn't exist)
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error (server error)

### Rate Limiting

```typescript
{
  success: false,
  error: 'Rate limit exceeded',
  message: 'Too many requests. Please try again later.',
  retryAfter: number, // seconds
  limit: number,
  remaining: number,
  resetTime: string
}
```

## 🔐 Authentication & Authorization

### API Key Authentication

```http
Authorization: Bearer your-api-key
```

### Session-based Authentication

```http
Cookie: next-auth.session-token=your-session-token
```

### Required Permissions

- `read:parameters` - Read parameter data
- `write:parameters` - Create/update parameters
- `read:research` - Access research data
- `write:research` - Create/update research data
- `admin:system` - System administration

## 📊 Response Headers

### Standard Headers

```http
Content-Type: application/json
X-API-Version: 1.0.0
X-Request-ID: uuid
X-Response-Time: 150ms
X-Rate-Limit-Remaining: 99
X-Rate-Limit-Reset: 1640995200
```

### Cache Headers

```http
Cache-Control: public, max-age=300
ETag: "33a64df551425fcc55e4d42a148795d9f25f89d4"
Last-Modified: Wed, 21 Oct 2015 07:28:00 GMT
```

---

**API Version**: 1.0.0  
**OpenAPI Specification**: Available at `/api/docs`  
**Rate Limits**: 1000 requests/hour (authenticated), 100 requests/hour
(anonymous)  
**Support**: Contact support@messai.com for API issues
