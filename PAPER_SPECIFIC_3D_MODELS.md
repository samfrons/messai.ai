# Paper-Specific 3D Models - Agent Guidelines

## Overview

This document provides comprehensive guidelines for AI agents working with
paper-specific 3D models in the MESSAI platform. These models create
scientifically accurate visualizations based on detailed specifications from
research papers.

## 🎯 Core Principles

### 1. Scientific Accuracy First

- **NEVER compromise on accuracy** for visual appeal
- Always reference actual paper specifications
- Maintain dimensional accuracy within ±5% of paper specifications
- Use realistic material properties based on research data

### 2. Performance-Driven Design

- Limit nanowire count to 400 for optimal performance
- Use Level of Detail (LOD) system for complex structures
- Maintain >30fps on standard hardware
- Optimize geometry without sacrificing scientific accuracy

### 3. Consistent Architecture

- Follow existing MESSViewer3D patterns
- Use standard parameter interface
- Maintain cross-platform compatibility (lab + lab-io)
- Integrate seamlessly with existing infrastructure

## 📋 Implementation Rules

### Model Component Structure

```typescript
interface [ModelName]Props {
  scale?: number;
  showAnimation?: boolean;
  visualizationMode?: 'static' | 'biofilm' | 'flow';
  parameters?: {
    // Existing parameters (inherit from base)
    chamberLength?: number;
    chamberWidth?: number;
    chamberHeight?: number;
    // ... standard parameters

    // Paper-specific parameters
    [specificParameter]?: number;
    [specificMaterial]?: string;
    // ... paper-specific parameters
  };
}
```

### Required Components

1. **Component Creation**: Both `/lab/components/models/` and
   `/lab-io/components/models/`
2. **MESSViewer3D Updates**: Add model type to switch statement in both
   applications
3. **Model Catalog**: Update models array in lab page
4. **Parameter Mapping**: Create/update parameter mapper utility
5. **Paper Detail Modal**: Ensure correct model type mapping

### Dimensional Conversion Standards

```typescript
// Scene Unit Conversion Rules
const sceneUnits = {
  // Millimeter to scene units: 1mm = 0.1 scene units
  mm: (value: number) => value * 0.1,

  // Micrometer to scene units: 1μm = 0.0001 scene units
  μm: (value: number) => value * 0.0001,

  // Nanometer to scene units: 1nm = 0.0000001 scene units
  nm: (value: number) => value * 0.0000001,

  // For microfluidic chips, use direct mapping
  microfluidic: {
    length: (mm: number) => mm * 0.1, // 25mm → 2.5 scene units
    width: (mm: number) => mm * 0.1, // 12mm → 1.2 scene units
    height: (mm: number) => mm * 0.1, // 2mm → 0.2 scene units
  },
};
```

## 🔬 Nanowire MFC Model Reference

### Specifications (from paper)

- **Nanowire density**: 850 nanowires per mm²
- **Nanowire dimensions**: 50nm diameter, 2.5μm length
- **Substrate**: 1.5mm thick nickel foam (85% porosity)
- **Microfluidic chip**: 25mm × 12mm × 2mm
- **Electrode area**: 25 mm²
- **Flow channels**: 500μm × 200μm inlet/outlet

### Implementation Standards

```typescript
// Nanowire Array Rendering
const renderNanowireArray = () => {
  // Performance limit: 400 nanowires max
  const maxNanowires = Math.min(nanowireParams.count, 400);

  // Grid pattern with slight randomization
  const gridSize = Math.ceil(Math.sqrt(maxNanowires));
  const spacing = 0.08; // Realistic density spacing

  // Individual cylinder geometries
  return Array.from({ length: maxNanowires }, (_, i) => (
    <mesh key={i} position={[x, y, z]}>
      <cylinderGeometry args={[diameter, diameter, length]} />
      <meshStandardMaterial
        color={materialColors.anodeColor}
        metalness={0.95}
        roughness={0.02}
        emissive={materialColors.anodeColor}
        emissiveIntensity={0.1}
      />
    </mesh>
  ));
};
```

### Material Properties

```typescript
const scientificMaterials = {
  'nickel-silicide': {
    color: '#C0C0C0', // Metallic silver
    metalness: 0.95, // High metallic reflection
    roughness: 0.02, // Very smooth surface
    emissiveIntensity: 0.1, // Slight glow
    conductivity: 14.3, // S/cm (for reference)
  },
  'nickel-foam': {
    color: '#A0A0A0', // Darker metallic
    metalness: 0.8, // Metallic but rougher
    roughness: 0.7, // High surface roughness
    porosity: 0.85, // 85% porous
  },
  pdms: {
    color: '#E0F6FF', // Clear blue tint
    transparency: 0.8, // Highly transparent
    roughness: 0.1, // Smooth polymer
    metalness: 0.0, // Non-metallic
  },
};
```

## 🛠️ Development Workflow

### Phase 1: Foundation

1. **Research Analysis**: Extract exact specifications from paper
2. **Component Creation**: Create model component following patterns
3. **Parameter Mapping**: Implement paper-to-model parameter conversion
4. **Basic Visualization**: Render core structures with correct dimensions

### Phase 2: Accuracy Enhancement

1. **Material Implementation**: Apply realistic material properties
2. **Structural Details**: Add paper-specific features (pores, arrays, etc.)
3. **Performance Optimization**: Implement LOD system if needed
4. **Scientific Validation**: Verify accuracy against paper specifications

### Phase 3: Integration

1. **MESSViewer3D Updates**: Add model type to both applications
2. **Parameter Interface**: Extend lab page parameters if needed
3. **Navigation Setup**: Ensure paper detail modal routes correctly
4. **Testing**: Verify cross-platform compatibility

### Phase 4: Polish

1. **Animation Modes**: Implement biofilm and flow visualizations
2. **Environmental Effects**: Add pH, temperature, flow rate responses
3. **Performance Tuning**: Optimize for consistent 30+ fps
4. **Documentation**: Update technical documentation

## 🚫 Common Pitfalls to Avoid

### 1. Generic Visualizations

- **DON'T**: Use generic box/cylinder shapes
- **DO**: Implement paper-specific geometries and structures

### 2. Incorrect Scaling

- **DON'T**: Use arbitrary scene units
- **DO**: Convert real-world dimensions accurately

### 3. Performance Issues

- **DON'T**: Render thousands of individual geometries
- **DO**: Use performance limits and LOD systems

### 4. Material Inaccuracy

- **DON'T**: Use random colors or generic materials
- **DO**: Research actual material properties and appearance

### 5. Inconsistent Integration

- **DON'T**: Create standalone components
- **DO**: Follow existing architectural patterns

## 📊 Quality Validation Checklist

### Technical Validation

- [ ] Component renders in both lab and lab-io applications
- [ ] Parameters update model in real-time
- [ ] Performance maintains >30fps with full nanowire array
- [ ] Materials accurately represent paper specifications
- [ ] Dimensions match paper within ±5% tolerance

### Scientific Validation

- [ ] Nanowire count matches paper density specifications
- [ ] Substrate porosity visually represented
- [ ] Microfluidic channels have correct dimensions
- [ ] Material properties reflect research data
- [ ] Overall structure matches paper diagrams/descriptions

### Integration Validation

- [ ] MESSViewer3D includes new model type
- [ ] Lab page model catalog updated
- [ ] Paper detail modal routes correctly
- [ ] Parameter mapping utility handles conversion
- [ ] URL parameters work for direct navigation

## 🔮 Future Expansion Guidelines

### Adding New Paper Models

1. **Requirements Analysis**: Create detailed specification document
2. **Component Naming**: Use pattern `[PaperType]MFCModel.tsx`
3. **Parameter Extension**: Add paper-specific parameters to interface
4. **Material Research**: Investigate actual material properties
5. **Performance Testing**: Ensure optimal performance limits

### Model Type Mapping

```typescript
// Paper types to model types
const paperModelTypes = {
  'nanowire-mfc': 'nanowire-mfc', // Nanowire arrays
  'flow-mfc': 'flow-mfc', // Flow-based systems
  'stacked-mfc': 'stacked', // Multi-chamber systems
  'traditional-mfc': 'microfluidic', // Standard microfluidic
  'algae-mfc': 'algae', // Algae-based systems
};
```

### Performance Optimization Rules

- **Individual meshes**: Use for <100 complex elements
- **Instanced geometry**: Use for 100-1000 repeated elements
- **Texture representation**: Use for >1000 elements
- **LOD switching**: Implement based on camera distance
- **Selective rendering**: Only render visible elements

## 📝 Documentation Requirements

### For Each New Model

1. **Technical specification** with exact dimensions
2. **Material property definitions** with scientific basis
3. **Performance benchmarks** and optimization details
4. **Integration steps** and validation checklist
5. **Scientific accuracy verification** against source paper

### Code Documentation

- Inline comments for all scientific specifications
- Parameter documentation with units and ranges
- Performance limits and optimization rationale
- Material property sources and references

## 🎖️ Best Practices

### Code Quality

- Use TypeScript for type safety
- Implement proper error handling
- Follow existing naming conventions
- Maintain consistent code style

### Performance

- Profile rendering performance regularly
- Monitor memory usage with large arrays
- Implement progressive loading for complex models
- Use efficient Three.js primitives

### Maintainability

- Document all scientific assumptions
- Version control parameter changes
- Maintain backwards compatibility
- Create comprehensive test cases

---

## 🚀 Quick Start for New Models

1. **Extract specifications** from research paper
2. **Create component** in both lab directories
3. **Add to MESSViewer3D** switch statements
4. **Update lab page** model catalog
5. **Test scientific accuracy** against paper
6. **Optimize performance** for target hardware
7. **Document implementation** and validation

Remember: **Scientific accuracy is non-negotiable**. Always prioritize precise
representation of research specifications over visual appeal or development
convenience.
