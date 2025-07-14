# Lab Development Guide for AI Agents

## Overview

This guide provides AI agents with essential context for working on the MESSAI
3D Modeling Laboratory features.

## Current Implementation

### Architecture

The lab page uses a **three-column responsive layout**:

- **Left Column**: Model selection and view controls
- **Center Column**: 3D viewer with React Three Fiber
- **Right Column**: Parameter controls with accordion sections

### Key Components

#### MESSViewer3D (`/apps/web/src/app/lab/components/MESSViewer3D.tsx`)

- **Purpose**: Main 3D visualization component using React Three Fiber
- **Key Features**:
  - Dynamic model scaling based on type and view level
  - WebGL compatibility detection with fallbacks
  - Error boundary wrapper for graceful failure handling
  - Performance overlay integration

**Model Scaling Logic**:

```typescript
const modelBaseScale = {
  microfluidic: 1.2, // Larger due to detailed microscopic features
  stacked: 0.9, // Medium size for multiple layers
  benchtop: 0.8, // Laboratory equipment scale
  industrial: 0.7, // Large system, scaled down to fit
};
```

**Camera Configuration**:

- Position: `[10, 8, 10]` - Pulled back for full model visibility
- FOV: `40°` - Narrower field of view for better framing
- Controls: OrbitControls with min/max distance limits

#### ParameterControl (`/apps/web/src/app/lab/components/ParameterControl.tsx`)

- **Purpose**: Reusable input component for different parameter types
- **Supported Types**: `text`, `number`, `select`, `range`
- **Features**: Unit display, validation, consistent styling

#### ErrorBoundary (`/apps/web/src/app/lab/components/ErrorBoundary.tsx`)

- **Purpose**: Catch and display 3D rendering errors gracefully
- **Implementation**: Class component with componentDidCatch
- **Fallback UI**: User-friendly error message with retry option

### 3D Models Structure

Each model component follows this pattern:

```typescript
interface ModelProps {
  scale?: number;
  showAnimation?: boolean;
  visualizationMode?: 'static' | 'biofilm' | 'flow';
}
```

**Model Dimensions (approximate)**:

- **MicrofluidicCell**: 4 units wide, thin profile
- **StackedFuelCell**: 3 units wide, 2 units tall
- **BenchtopReactor**: 3 units wide, 2 units tall
- **Industrial**: 4 units wide, 3 units tall

### Parameter System

#### Parameter Categories

1. **Geometry & Structure**: Physical dimensions and chamber configuration
2. **Materials**: Electrode and membrane material selection
3. **Operating Conditions**: Temperature, pH, flow rates
4. **Biological Parameters**: Microbial species and biofilm properties
5. **Electrical Configuration**: Resistance, voltage, connection types
6. **Environmental Settings**: Ambient conditions and mixing

#### State Management

- Uses React useState for parameter state
- TypeScript interface `ModelParameters` defines all parameter types
- Update function:
  `updateParameter(key: keyof ModelParameters, value: string | number)`

## Common Issues & Solutions

### 3D Rendering Problems

**Symptoms**: Black screen, WebGL errors, model cutoff **Solutions**:

1. Check WebGL support with compatibility detection
2. Adjust camera position and FOV
3. Use ErrorBoundary to catch rendering failures
4. Implement fallback UI for unsupported browsers

### Performance Issues

**Symptoms**: Slow rendering, unresponsive controls **Solutions**:

1. Use dynamic scaling to reduce model complexity
2. Implement proper useFrame cleanup
3. Limit animation updates and calculations
4. Use React.memo for expensive parameter components

### State Management Issues

**Symptoms**: Parameter updates not reflecting, component re-renders
**Solutions**:

1. Ensure proper key types in updateParameter function
2. Use functional state updates for complex objects
3. Consider useCallback for event handlers
4. Implement proper TypeScript types

## Development Guidelines

### Adding New Models

1. Create model component in `/components/models/`
2. Follow existing interface pattern with scale, animation, and visualization
   mode
3. Add model to the switch statement in `MESSModel` component
4. Update model selection array in lab page
5. Add appropriate base scale in `getScaleForView` function

### Adding New Parameters

1. Update `ModelParameters` interface
2. Add to `initialParameters` object
3. Create ParameterControl component in appropriate accordion section
4. Ensure proper type handling in `updateParameter` function

### Error Handling Best Practices

1. Always wrap 3D components with ErrorBoundary
2. Add null checks for mathematical operations (division by zero)
3. Implement proper loading states with Suspense
4. Provide meaningful error messages to users

### Performance Best Practices

1. Use dynamic imports for heavy 3D models
2. Implement proper cleanup in useFrame hooks
3. Avoid creating objects in render loops
4. Use proper keys for list items in React

## Testing Considerations

### Unit Testing

- Test parameter validation logic
- Test utility functions (scaling, formatting)
- Test error boundary behavior
- Mock Three.js components for testing

### Integration Testing

- Test 3D model switching
- Test parameter updates affecting visualization
- Test responsive layout behavior
- Test WebGL fallback scenarios

### Visual Testing

- Test model rendering across different browsers
- Test responsive breakpoints
- Test animation performance
- Test accessibility features

## Future Development Notes

### Planned Enhancements

1. **Real Simulation Integration**: Connect parameters to actual physics
   calculations
2. **Model Export**: Allow users to export 3D models and configurations
3. **Collaborative Features**: Share model configurations between users
4. **Advanced Visualization**: Add more animation modes and visual effects

### Technical Debt

1. Consider implementing Zustand for complex state management
2. Add comprehensive TypeScript types for model-specific parameters
3. Implement proper testing suite for 3D components
4. Optimize bundle size with dynamic imports

---

**Last Updated**: 2025-01-14  
**For Questions**: Refer to component files for implementation details
