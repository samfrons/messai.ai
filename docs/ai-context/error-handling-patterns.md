# Error Handling Patterns for MESSAI

## Overview

This document outlines established error handling patterns and best practices
for the MESSAI platform, particularly for complex features like 3D
visualization.

## React Error Boundaries

### Implementation Pattern

Use the `ErrorBoundary` component for any complex rendering that might fail:

```typescript
// apps/web/src/app/lab/components/ErrorBoundary.tsx
export default class ErrorBoundary extends Component<Props, State> {
  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Component Error:', error, errorInfo);
  }
}
```

### Usage Guidelines

1. **Wrap 3D Components**: Always wrap React Three Fiber components
2. **Provide Fallback UI**: Show meaningful error messages with retry options
3. **Log Errors**: Capture error details for debugging
4. **User-Friendly Messages**: Avoid technical jargon in error displays

## Mathematical Safety Patterns

### Division by Zero Protection

Always check for zero values before division:

```typescript
// ❌ Unsafe
const ratio = cost / (powerOutput * 1000);

// ✅ Safe
const ratio = powerOutput > 0 ? cost / (powerOutput * 1000) : 0;
```

### Null/Undefined Checks

Use optional chaining and nullish coalescing:

```typescript
// ❌ Unsafe
const value = object.property.value;

// ✅ Safe
const value = object?.property?.value ?? defaultValue;
```

## WebGL and 3D Rendering

### Compatibility Detection

Always check WebGL support before rendering:

```typescript
const checkWebGLSupport = () => {
  try {
    const canvas = document.createElement('canvas');
    const gl =
      canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    return !!gl;
  } catch (e) {
    return false;
  }
};
```

### Resource Management

Proper cleanup in useFrame hooks:

```typescript
useFrame((state, delta) => {
  // Animation logic
  if (groupRef.current && showAnimation) {
    groupRef.current.rotation.y += delta * 0.1;
  }
});

// Cleanup on unmount
useEffect(() => {
  return () => {
    // Dispose geometries, materials, textures
  };
}, []);
```

## Async Operation Handling

### Promise Error Catching

Always handle promise rejections:

```typescript
// ❌ Unhandled rejection risk
const data = await fetchData();

// ✅ Proper error handling
try {
  const data = await fetchData();
  // Handle success
} catch (error) {
  console.error('Fetch failed:', error);
  // Handle error state
}
```

### useEffect Cleanup

Prevent state updates on unmounted components:

```typescript
useEffect(() => {
  let isMounted = true;

  const fetchData = async () => {
    try {
      const result = await api.getData();
      if (isMounted) {
        setData(result);
      }
    } catch (error) {
      if (isMounted) {
        setError(error);
      }
    }
  };

  fetchData();

  return () => {
    isMounted = false;
  };
}, []);
```

## Component-Level Error Handling

### Input Validation

Validate props and user inputs:

```typescript
interface Props {
  value: number;
  min?: number;
  max?: number;
}

const ParameterControl = ({ value, min = 0, max = 100 }: Props) => {
  const validValue = Math.max(min, Math.min(max, value || 0));

  return <input value={validValue} />;
};
```

### Safe State Updates

Use functional updates for complex state:

```typescript
// ❌ Direct mutation risk
const updateParameter = (key: string, value: any) => {
  parameters[key] = value;
  setParameters(parameters);
};

// ✅ Safe functional update
const updateParameter = (
  key: keyof ModelParameters,
  value: string | number
) => {
  setParameters((prev) => ({ ...prev, [key]: value }));
};
```

## Performance Error Prevention

### Memory Leak Prevention

Proper interval and timeout cleanup:

```typescript
useEffect(() => {
  const interval = setInterval(updateMetrics, 1000);
  return () => clearInterval(interval);
}, []);
```

### Infinite Loop Prevention

Careful dependency arrays in useEffect:

```typescript
// ❌ Risk of infinite re-renders
useEffect(() => {
  updateData();
}, [complexObject]);

// ✅ Specific dependencies
useEffect(() => {
  updateData();
}, [complexObject.id, complexObject.status]);
```

## Error Reporting and Logging

### Structured Error Logging

Use consistent error logging format:

```typescript
const logError = (error: Error, context: string, metadata?: any) => {
  console.error(`[${context}] ${error.message}`, {
    error: error.stack,
    context,
    metadata,
    timestamp: new Date().toISOString(),
  });
};
```

### User Feedback

Provide actionable error messages:

```typescript
const getErrorMessage = (error: Error) => {
  if (error.message.includes('WebGL')) {
    return 'Your browser does not support 3D graphics. Please try a different browser.';
  }

  if (error.message.includes('network')) {
    return 'Network error. Please check your connection and try again.';
  }

  return 'An unexpected error occurred. Please refresh the page.';
};
```

## Testing Error Scenarios

### Unit Test Examples

```typescript
describe('ParameterControl', () => {
  it('handles division by zero safely', () => {
    const result = calculateRatio(100, 0);
    expect(result).toBe(0);
  });

  it('handles invalid input gracefully', () => {
    const component = render(<ParameterControl value={NaN} />);
    expect(component.getByRole('input')).toHaveValue('0');
  });
});
```

### Integration Test Patterns

```typescript
describe('3D Viewer', () => {
  it('shows error boundary when WebGL fails', async () => {
    // Mock WebGL failure
    jest.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);

    render(<MESSViewer3D />);

    await waitFor(() => {
      expect(screen.getByText(/WebGL is not supported/)).toBeInTheDocument();
    });
  });
});
```

## Common Anti-Patterns to Avoid

### ❌ Silent Failures

```typescript
// Don't ignore errors silently
try {
  riskyOperation();
} catch (e) {
  // Silent fail - bad!
}
```

### ❌ Generic Error Messages

```typescript
// Don't use generic error messages
throw new Error('Something went wrong');
```

### ❌ Blocking Operations

```typescript
// Don't block the main thread
const result = heavyComputation(); // Blocks UI
```

### ✅ Better Alternatives

```typescript
// Handle errors explicitly
try {
  riskyOperation();
} catch (error) {
  logError(error, 'riskyOperation');
  showUserFriendlyMessage(error);
}

// Use specific error messages
throw new Error('Failed to load 3D model: Invalid file format');

// Use async operations
const result = await Promise.resolve(heavyComputation());
```

---

**Last Updated**: 2025-01-14  
**Applies To**: All MESSAI components, especially 3D and real-time features
