# 3D Rendering Troubleshooting Guide

## Overview

This document captures key learnings and rules for troubleshooting 3D rendering
issues in the MESSAI.AI lab components, specifically with React Three Fiber and
Three.js Grid components.

## Common Issues and Solutions

### 1. Canvas Background Rendering Issues

**Problem**: Canvas showing black background instead of transparent/gradient
backgrounds.

**Root Cause**: Canvas `alpha` setting controls transparency capability.

**Solution**:

```typescript
// Incorrect - blocks transparency
<Canvas
  gl={{ alpha: false }}
>

// Correct - enables transparency
<Canvas
  gl={{ alpha: true }}
  onCreated={({ gl }) => {
    gl.setClearColor(0xf1f8ff, 0.7); // Set background color with alpha
  }}
>
```

**Key Rules**:

- Always set `alpha: true` for transparent backgrounds
- Use `gl.setClearColor(color, alpha)` to set background color with transparency
- Background styling should be applied to both Canvas and container div

### 2. Grid Line Color Issues

**Problem**: Grid lines appearing black instead of intended colors.

**Root Cause**: Three.js Grid component has specific color format requirements
and RGBA handling limitations.

**Solution**:

```typescript
// Incorrect - RGBA colors may not render properly
<Grid
  cellColor="rgba(74, 85, 104, 0.7)"
  sectionColor="rgba(60, 71, 88, 0.9)"
/>

// Correct - Use hex colors for consistent rendering
<Grid
  cellColor="#4a5568"     // Gray-blue for cell lines
  sectionColor="#1e3a8a"  // Darker blue for section lines
/>
```

**Key Rules**:

- Use hex color codes (#RRGGBB) instead of RGBA for Grid components
- Section colors should be darker/more opaque than cell colors
- Test grid colors across different lighting conditions

### 3. 3D Model Visibility Issues

**Problem**: 3D models not rendering or appearing with zero opacity.

**Root Cause**: Dynamic opacity calculations can result in zero values.

**Common Causes**:

- Environmental effect multipliers reducing opacity to 0
- Parameter-driven calculations with edge case values
- Animation frame effects interfering with material properties

**Solution**:

```typescript
// Problematic - can result in 0 opacity
const opacity = baseOpacity * environmentalEffects.tempIntensity; // Could be 0

// Better - ensure minimum opacity
const opacity = Math.max(0.3, baseOpacity * environmentalEffects.tempIntensity);

// Best - use fixed opacity for critical elements
<meshStandardMaterial
  opacity={0.8} // Fixed value for visibility
  transparent
/>;
```

**Key Rules**:

- Always ensure minimum opacity values for visible elements
- Add debug logging for opacity calculations during development
- Test parameter edge cases (min/max values)

### 4. Model Parameter Integration

**Problem**: Changes to parameters not reflected in 3D models.

**Root Cause**: Parameter prop passing or useMemo dependencies.

**Solution**:

```typescript
// Ensure parameters are passed down the component tree
<MESSViewer3D parameters={parameters} />
<MESSModel parameters={parameters} />
<StackedFuelCell parameters={parameters} />

// Proper useMemo dependencies
const stackConfig = useMemo(() => {
  // calculations
}, [parameters]); // Include parameters as dependency
```

**Key Rules**:

- Always pass parameters through entire component hierarchy
- Include parameters in useMemo dependencies
- Add console logging to verify parameter updates

## Development Workflow

### 1. Visual Testing Protocol

1. Test with default parameters
2. Test with minimum parameter values
3. Test with maximum parameter values
4. Test parameter changes in real-time
5. Verify across different models (microfluidic, stacked, benchtop)

### 2. Cross-Page Consistency

- Always apply fixes to both `/lab` and `/lab-io` pages
- Maintain identical 3D viewer configurations
- Use shared components where possible

### 3. User Feedback Integration

- When users provide visual references (screenshots), match exact colors
- Test changes against user-provided examples
- Document color specifications for consistency

## Color Specifications

### Grid System Colors

```typescript
// Standard grid configuration
<Grid
  cellColor="#4a5568" // Light gray-blue cells
  sectionColor="#1e3a8a" // Dark blue sections (70% opacity effect)
  // Alternative section color: "#1e40af"
/>
```

### Background Colors

```typescript
// Standard background
style={{ backgroundColor: 'rgba(241, 248, 255, 0.7)' }}

// Canvas clear color
gl.setClearColor(0xf1f8ff, 0.7); // Matches CSS background
```

## Debugging Checklist

### When 3D Models Don't Render:

1. Check Canvas alpha settings
2. Verify parameter prop passing
3. Check opacity calculations (add console.log)
4. Verify model type switching logic
5. Check for Three.js errors in console

### When Grid Lines Appear Wrong:

1. Verify hex color format (not RGBA)
2. Check if colors are being overridden by themes
3. Test in different lighting conditions
4. Verify fadeDistance and fadeStrength values

### When Background Issues Occur:

1. Check Canvas alpha and gl settings
2. Verify container background styling
3. Test with different background colors
4. Check for CSS conflicts

## Future Considerations

1. **Performance**: Grid components with large fadeDistance can impact
   performance
2. **Accessibility**: Ensure sufficient contrast for grid lines
3. **Mobile**: Test grid visibility on smaller screens
4. **Animation**: Grid animations should be subtle to avoid distraction
5. **Theme Integration**: Grid colors should integrate with overall design
   system

## Related Files

- `/apps/web/src/app/lab/components/MESSViewer3D.tsx`
- `/apps/web/src/app/lab-io/components/MESSViewer3D.tsx`
- `/apps/web/src/app/lab/components/models/StackedFuelCell.tsx`
- `/apps/web/src/app/lab/components/models/MicrofluidicCell.tsx`
