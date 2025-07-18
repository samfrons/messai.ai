# Requirements Specification: Paper-Specific 3D Models

## Executive Summary

This document specifies the requirements for implementing paper-specific 3D
models in the MESSAI platform. The feature will create scientifically accurate
3D visualizations based on detailed specifications from research papers,
starting with nanowire-based microbial fuel cells.

## 1. Project Scope

### 1.1 Primary Objective

Create a system that generates accurate 3D models of electrochemical systems
based on specifications extracted from research papers, enabling researchers to
visualize and interact with paper-specific designs.

### 1.2 Initial Implementation

- **Target Paper**: Nickel silicide nanowire anodes for microbial fuel cells
- **Model Type**: `nanowire-mfc`
- **Database ID**: `nickel-silicide-2025-insilico`

### 1.3 Success Criteria

- Dimensional accuracy within 5% of paper specifications
- Performance maintains >30fps on standard hardware
- Scientific accuracy validated by domain experts
- Seamless integration with existing 3D lab infrastructure

## 2. Technical Requirements

### 2.1 Component Architecture

#### 2.1.1 New Component: NanowireMFCModel

- **Location**: `apps/web/src/app/lab/components/models/NanowireMFCModel.tsx`
- **Dual Deployment**: Both lab and lab-io applications
- **Base Interface**: Extends existing `ModelProps` interface
- **Integration**: Plugs into existing `MESSViewer3D` switch statement

#### 2.1.2 Parameter System Extension

```typescript
interface NanowireMFCProps extends ModelProps {
  parameters?: {
    // Existing parameters +
    nanowireCount?: number;
    nanowireDiameter?: number; // 50nm → scene units
    nanowireLength?: number; // 2.5μm → scene units
    nanowireSpacing?: number; // Calculated from density
    nanowireDensity?: number; // 850 per mm²
    nanowireOrientation?: 'vertical' | 'random' | 'aligned';
    nanowireMaterial?: 'nickel-silicide' | 'nickel' | 'carbon';
    substrateType?: 'foam' | 'flat' | 'textured';
    substrateThickness?: number; // 1.5mm
    substrateMaterial?: string; // 'nickel-foam'
    flowChannelWidth?: number; // 500μm
    flowChannelHeight?: number; // 200μm
    mainChannelWidth?: number; // 12mm
    mainChannelHeight?: number; // 2mm
  };
}
```

### 2.2 Visualization Requirements

#### 2.2.1 Nanowire Array Visualization

- **Density**: 850 nanowires per mm²
- **Geometry**: Individual cylinder primitives for ≤100 nanowires
- **Instancing**: Use Three.js instanced geometry for 100-1000 nanowires
- **Texture-based**: Shader representation for >1000 nanowires
- **Dimensions**: 50nm diameter, 2.5μm length, 34.1μm spacing

#### 2.2.2 Substrate Representation

- **Type**: 3D foam structure with 85% porosity
- **Material**: Nickel foam with surface roughness
- **Thickness**: 1.5mm substrate layer
- **Surface Area**: 120x enhancement over geometric area

#### 2.2.3 Microfluidic System

- **Scale**: Lab-chip dimensions (25mm × 12mm × 2mm)
- **Channels**: Inlet (500μm × 200μm), main (12mm × 2mm), outlet (500μm × 200μm)
- **Flow**: 5 μL/min flow rate visualization
- **Transparency**: Clear channel walls for flow visibility

### 2.3 Performance Requirements

#### 2.3.1 Level of Detail (LOD) System

```typescript
const LODSystem = {
  High: {
    nanowireDetail: 'individual',
    textureResolution: 2048,
    animationFrameRate: 60,
    maxNanowires: 100,
  },
  Medium: {
    nanowireDetail: 'instanced',
    textureResolution: 1024,
    animationFrameRate: 30,
    maxNanowires: 1000,
  },
  Low: {
    nanowireDetail: 'texture',
    textureResolution: 512,
    animationFrameRate: 15,
    maxNanowires: 'unlimited',
  },
};
```

#### 2.3.2 Optimization Techniques

- **Frustum Culling**: Only render visible nanowires
- **Occlusion Culling**: Hide nanowires behind substrate
- **Texture Atlasing**: Combine materials for fewer draw calls
- **Memory Management**: Efficient geometry reuse

### 2.4 Material System

#### 2.4.1 Nanowire Materials

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
  },
};
```

#### 2.4.2 Substrate Materials

- **Nickel Foam**: Metallic appearance with high roughness
- **Glass Substrate**: Transparent with low roughness
- **PDMS**: Semi-transparent polymer appearance

## 3. Integration Requirements

### 3.1 Database Integration

- **API Enhancement**: Already implemented in `/api/papers/route.ts`
- **Parameter Mapping**: Extract modelParameters from paper data
- **Model Type Detection**: Use `modelType` field for component selection

### 3.2 Navigation Integration

- **Paper Detail Modal**: Already implemented with model type mapping
- **Lab Navigation**: Direct routing to lab with paper parameters
- **Parameter Persistence**: Maintain paper-specific settings

### 3.3 Parameter Mapping Service

```typescript
// New utility: paperParameterMapper.ts
export const mapPaperToModelParameters = (paperData: any) => {
  const modelParams = paperData.modelParameters;

  return {
    // Direct mappings
    chamberLength: modelParams.chamberLength,
    chamberWidth: modelParams.chamberWidth,
    chamberHeight: modelParams.chamberHeight,

    // Calculated mappings
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

## 4. Implementation Plan

### 4.1 Phase 1: Foundation (Week 1)

- [ ] Create `NanowireMFCModel.tsx` component
- [ ] Implement basic nanowire array visualization
- [ ] Add nanowire-specific parameters
- [ ] Create parameter mapping utility

### 4.2 Phase 2: Optimization (Week 2)

- [ ] Implement LOD system for performance
- [ ] Add instanced geometry for nanowire arrays
- [ ] Create nanowire material system
- [ ] Optimize rendering pipeline

### 4.3 Phase 3: Integration (Week 3)

- [ ] Update `MESSViewer3D` model selection
- [ ] Add paper parameter mapping
- [ ] Create performance metrics overlay
- [ ] Implement validation system

### 4.4 Phase 4: Refinement (Week 4)

- [ ] Add biofilm visualization layer
- [ ] Implement flow dynamics animation
- [ ] Fine-tune performance optimizations
- [ ] Add scientific accuracy validation

## 5. Validation and Testing

### 5.1 Accuracy Validation

- **Dimensional Accuracy**: ±5% tolerance on all measurements
- **Nanowire Count**: Exact match to 850/mm² density specification
- **Material Properties**: Accurate representation of nickel silicide
- **Performance Metrics**: Display target 323 mW/m² power density

### 5.2 Performance Testing

- **Frame Rate**: Maintain >30fps on standard hardware
- **Memory Usage**: Efficient geometry management
- **Loading Time**: Fast model initialization
- **Responsiveness**: Real-time parameter updates

### 5.3 Scientific Review

- **Domain Expert Validation**: Review by electrochemistry researchers
- **Paper Comparison**: Side-by-side validation with source paper
- **Educational Value**: Assess learning enhancement
- **Research Utility**: Evaluate for research applications

## 6. Quality Assurance

### 6.1 Testing Strategy

- **Unit Tests**: Parameter mapping functions
- **Integration Tests**: Model component rendering
- **Performance Tests**: Frame rate under various conditions
- **Visual Regression**: Model accuracy over time

### 6.2 Documentation Requirements

- **Technical Documentation**: Component API reference
- **User Guide**: How to use paper-specific models
- **Scientific Validation**: Accuracy verification report
- **Performance Benchmarks**: Optimization results

## 7. Future Expansion

### 7.1 Additional Papers

- **Flow MFC Paper**: High power density redox-mediated system
- **Traditional MFC**: Comparative baseline model
- **Stacked Systems**: Multi-chamber configurations

### 7.2 Enhanced Features

- **Interactive Parameters**: Real-time scientific simulation
- **Performance Prediction**: AI-driven optimization
- **Comparative Analysis**: Side-by-side paper models
- **Export Capabilities**: Research collaboration tools

## 8. Risk Assessment

### 8.1 Technical Risks

- **Performance Impact**: High nanowire count affecting frame rate
- **Memory Constraints**: Large geometry datasets
- **Browser Compatibility**: WebGL limitations
- **Accuracy Validation**: Scientific precision requirements

### 8.2 Mitigation Strategies

- **LOD System**: Automatic performance scaling
- **Progressive Loading**: Gradual model complexity
- **Fallback Rendering**: Simplified representations
- **Expert Review**: Continuous validation feedback

## 9. Conclusion

This requirements specification provides a comprehensive framework for
implementing paper-specific 3D models in the MESSAI platform. The approach
leverages existing architectural strengths while introducing specialized
capabilities for scientific visualization, ensuring both technical excellence
and research accuracy.

The implementation will establish a scalable foundation for expanding to
additional research papers, creating a unique value proposition for the MESSAI
platform in the scientific research community.
