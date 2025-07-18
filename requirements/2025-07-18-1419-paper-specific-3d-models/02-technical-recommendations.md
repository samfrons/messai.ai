# Technical Recommendations for Paper-Specific 3D Models

## Executive Summary

Based on the architectural analysis, we recommend creating a new
`NanowireMFCModel` component that follows existing patterns while adding
paper-specific nanowire visualization capabilities.

## Implementation Strategy

### 1. Model Creation Approach

**Recommendation: Create New Component**

- **Component**: `NanowireMFCModel.tsx`
- **Location**: Both `apps/web/src/app/lab/components/models/` and
  `apps/web/src/app/lab-io/components/models/`
- **Approach**: Follow existing patterns but add nanowire-specific features

**Rationale:**

- Maintains architectural consistency
- Allows for specialized nanowire visualization
- Doesn't break existing microfluidic model
- Enables paper-specific optimizations

### 2. Nanowire Array Visualization

**Performance-Driven Approach:**

```typescript
// Dynamic LOD based on nanowire count
const renderNanowires = (count: number) => {
  if (count <= 100) {
    return <IndividualNanowires />; // Individual meshes
  } else if (count <= 1000) {
    return <InstancedNanowires />; // Instanced geometry
  } else {
    return <TextureBasedNanowires />; // Texture representation
  }
};
```

**Implementation Levels:**

1. **Individual Nanowires** (≤100 count)

   - Individual cylinder geometries
   - Full material properties
   - Individual animations

2. **Instanced Geometry** (100-1000 count)

   - Single geometry, multiple instances
   - Shared materials
   - Performance optimized

3. **Texture-Based** (>1000 count)
   - Surface texture representation
   - Shader-based appearance
   - Maximum performance

### 3. Parameter System Extension

**New Nanowire Parameters:**

```typescript
interface NanowireMFCProps extends ModelProps {
  parameters?: {
    // Existing parameters +
    nanowireCount?: number;
    nanowireDiameter?: number; // 50nm (converted to scene units)
    nanowireLength?: number; // 2.5μm (converted to scene units)
    nanowireSpacing?: number; // Calculated from density
    nanowireDensity?: number; // 850 per mm²
    nanowireOrientation?: 'vertical' | 'random' | 'aligned';
    nanowireMaterial?: 'nickel-silicide' | 'nickel' | 'carbon';
    substrateType?: 'foam' | 'flat' | 'textured';
    surfaceRoughness?: number; // 0-1 scale

    // Substrate parameters
    substrateThickness?: number; // 1.5mm
    substrateMaterial?: string; // 'nickel-foam'

    // Microfluidic parameters
    flowChannelWidth?: number; // 500μm
    flowChannelHeight?: number; // 200μm
    mainChannelWidth?: number; // 12mm
    mainChannelHeight?: number; // 2mm
  };
}
```

### 4. Material System

**Nanowire Materials:**

```typescript
const nanowireMaterials = {
  'nickel-silicide': {
    color: '#C0C0C0',
    metalness: 0.9,
    roughness: 0.1,
    conductivity: 14.3, // S/cm
    emissive: '#1a1a1a',
  },
  nickel: {
    color: '#D4D4D4',
    metalness: 0.95,
    roughness: 0.05,
    conductivity: 14.6,
    emissive: '#000000',
  },
  carbon: {
    color: '#424242',
    metalness: 0.1,
    roughness: 0.8,
    conductivity: 100,
    emissive: '#000000',
  },
};
```

**Substrate Materials:**

```typescript
const substrateMaterials = {
  'nickel-foam': {
    color: '#D4D4D4',
    metalness: 0.8,
    roughness: 0.6,
    porosity: 0.85,
    surfaceArea: 120, // cm²/cm²
    texture: 'foam-pattern',
  },
  glass: {
    color: '#F0F0F0',
    metalness: 0.0,
    roughness: 0.05,
    transparency: 0.9,
    refractionIndex: 1.5,
  },
};
```

### 5. Performance Optimization Strategy

**Level of Detail (LOD) System:**

```typescript
const LODSystem = {
  High: {
    nanowireDetail: 'individual',
    textureResolution: 2048,
    animationFrameRate: 60,
    particleCount: 1000,
  },
  Medium: {
    nanowireDetail: 'instanced',
    textureResolution: 1024,
    animationFrameRate: 30,
    particleCount: 500,
  },
  Low: {
    nanowireDetail: 'texture',
    textureResolution: 512,
    animationFrameRate: 15,
    particleCount: 100,
  },
};
```

**Optimization Techniques:**

1. **Frustum Culling**: Only render visible nanowires
2. **Occlusion Culling**: Hide nanowires behind other objects
3. **Texture Atlasing**: Combine materials for fewer draw calls
4. **Geometry Instancing**: Reuse nanowire geometry
5. **Selective Animation**: Only animate visible elements

### 6. Integration Architecture

**Model Selection Update:**

```typescript
// In MESSViewer3D.tsx
const renderModel = () => {
  switch (type) {
    case 'microfluidic':
      return <MicrofluidicCell {...props} />;
    case 'nanowire-mfc':
      return <NanowireMFCModel {...props} />;
    case 'stacked':
      return <StackedFuelCell {...props} />;
    case 'benchtop':
      return <BenchtopReactor {...props} />;
    // ... other cases
  }
};
```

**Parameter Mapping Service:**

```typescript
// New utility: paperParameterMapper.ts
export const mapPaperToModelParameters = (paperData: any) => {
  const modelParams = paperData.modelParameters;

  return {
    // Map paper parameters to 3D model parameters
    chamberLength: modelParams.chamberLength,
    chamberWidth: modelParams.chamberWidth,
    chamberHeight: modelParams.chamberHeight,

    // Nanowire-specific mapping
    nanowireCount: modelParams.nanowireDensity * modelParams.electrodeArea,
    nanowireDiameter: modelParams.nanowireDiameter / 1000000, // nm to scene units
    nanowireLength: modelParams.nanowireLength / 1000000, // μm to scene units

    // Operating conditions
    temperature: modelParams.temperature,
    pH: modelParams.pH,
    flowRate: modelParams.flowRate,

    // Biological parameters
    microbialSpecies: modelParams.microbialSpecies,
    biofilmThickness: modelParams.biofilmThickness,
  };
};
```

### 7. Development Implementation Plan

**Phase 1: Foundation (Week 1)**

1. Create `NanowireMFCModel.tsx` component
2. Implement basic nanowire array visualization
3. Add nanowire-specific parameters
4. Create parameter mapping utility

**Phase 2: Optimization (Week 2)**

1. Implement LOD system
2. Add instanced geometry for performance
3. Create nanowire material system
4. Optimize rendering pipeline

**Phase 3: Integration (Week 3)**

1. Update MESSViewer3D model selection
2. Add paper parameter mapping
3. Create performance metrics overlay
4. Implement validation system

**Phase 4: Refinement (Week 4)**

1. Add biofilm visualization
2. Implement flow dynamics
3. Fine-tune performance
4. Add scientific accuracy validation

### 8. Quality Assurance

**Validation Criteria:**

- Dimensional accuracy within 5% of paper specifications
- Nanowire count matches paper density (850/mm²)
- Material properties reflect paper specifications
- Performance maintains >30fps on standard hardware
- Scientific accuracy validated by domain experts

**Testing Strategy:**

- Unit tests for parameter mapping
- Performance benchmarks for different LOD levels
- Visual regression tests for model accuracy
- Integration tests with paper data

This approach ensures we create scientifically accurate, high-performance 3D
models while maintaining the existing architectural patterns and performance
standards.
