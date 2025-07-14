# Testing Guide for Developers

This guide provides practical instructions for writing and running tests in the
MESSAI.AI platform.

## Quick Start

### Running Tests

```bash
# Install dependencies
pnpm install

# Run all tests
pnpm test

# Run tests with coverage
pnpm test --coverage

# Run specific test file
pnpm test health.spec.ts

# Run tests in watch mode (development)
pnpm test --watch
```

### Writing Your First Test

1. **Create a test file** next to your source file:

   ```
   src/
   ├── components/
   │   ├── chart.tsx
   │   └── chart.spec.tsx  # Test file
   ```

2. **Import testing utilities**:

   ```typescript
   import { render, screen } from '@messai/testing';
   import { Chart } from './chart';
   ```

3. **Write descriptive tests**:
   ```typescript
   describe('Chart Component', () => {
     it('should display power density data correctly', () => {
       const data = { powerDensity: 1.5, label: 'Test MFC' };
       render(<Chart data={data} />);

       expect(screen.getByText('1.5 W/m²')).toBeInTheDocument();
     });
   });
   ```

## Test Types & When to Use Them

### Unit Tests (80% of tests)

**When**: Testing individual components, functions, or utilities **Focus**:
Isolated functionality with mocked dependencies

```typescript
// Component unit test
import { render, screen } from '@messai/testing';
import { PowerDisplay } from './power-display';

describe('PowerDisplay', () => {
  it('should format power density correctly', () => {
    render(<PowerDisplay value={1.234} />);
    expect(screen.getByText('1.23 W/m²')).toBeInTheDocument();
  });

  it('should handle zero values', () => {
    render(<PowerDisplay value={0} />);
    expect(screen.getByText('0.00 W/m²')).toBeInTheDocument();
  });
});

// Utility function test
import { calculateEfficiency } from './calculations';

describe('calculateEfficiency', () => {
  it('should calculate Coulombic efficiency correctly', () => {
    const result = calculateEfficiency(100, 85);
    expect(result).toBeCloseTo(0.85);
  });
});
```

### Integration Tests (15% of tests)

**When**: Testing component interactions, API endpoints, or data flows
**Focus**: How different parts work together

```typescript
// API integration test
import { createExperiment, getExperiment } from './api/experiments';
import { createTestExperiment } from '@messai/testing';

describe('Experiment API Integration', () => {
  it('should create and retrieve experiment', async () => {
    const experimentData = createTestExperiment();

    const created = await createExperiment(experimentData);
    const retrieved = await getExperiment(created.id);

    expect(retrieved).toHaveValidExperimentStructure();
    expect(retrieved.name).toBe(experimentData.name);
  });
});

// Component integration test
import { render, screen, fireEvent, waitFor } from '@messai/testing';
import { ExperimentForm } from './experiment-form';
import { mockFetch } from '@messai/testing';

describe('ExperimentForm Integration', () => {
  it('should save experiment and show success message', async () => {
    mockFetch({ success: true, id: 'exp-123' });

    render(<ExperimentForm />);

    fireEvent.change(screen.getByLabelText('Experiment Name'), {
      target: { value: 'Test Experiment' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(
        screen.getByText('Experiment saved successfully')
      ).toBeInTheDocument();
    });
  });
});
```

### E2E Tests (5% of tests)

**When**: Testing critical user journeys and cross-browser compatibility
**Focus**: Complete workflows from user perspective

```typescript
// E2E test example
import { test, expect } from '@playwright/test';

test('researcher workflow: create and monitor experiment', async ({ page }) => {
  // Navigate to experiments
  await page.goto('/experiments');

  // Create new experiment
  await page.click('[data-testid="create-experiment"]');
  await page.fill('[data-testid="experiment-name"]', 'MFC Performance Test');
  await page.selectOption('[data-testid="reactor-type"]', 'single-chamber');

  // Configure parameters
  await page.fill('[data-testid="temperature"]', '30');
  await page.fill('[data-testid="ph"]', '7.0');

  // Save and start
  await page.click('[data-testid="save-experiment"]');
  await page.click('[data-testid="start-experiment"]');

  // Verify experiment is running
  await expect(page.locator('[data-testid="experiment-status"]')).toContainText(
    'Running'
  );

  // Check data visualization
  await expect(page.locator('[data-testid="power-chart"]')).toBeVisible();
});
```

## Testing Patterns & Best Practices

### 1. Test Structure (Arrange-Act-Assert)

```typescript
describe('Component/Function', () => {
  it('should do something when condition is met', () => {
    // Arrange: Set up test data and conditions
    const testData = createTestExperiment();
    const mockCallback = jest.fn();

    // Act: Perform the action being tested
    render(<ExperimentCard data={testData} onSelect={mockCallback} />);
    fireEvent.click(screen.getByRole('button'));

    // Assert: Verify the expected outcome
    expect(mockCallback).toHaveBeenCalledWith(testData.id);
  });
});
```

### 2. User-Centric Testing

```typescript
// ✅ Good: Test what users see and do
test('should show error when invalid temperature is entered', () => {
  render(<TemperatureInput />);

  const input = screen.getByLabelText('Temperature (°C)');
  fireEvent.change(input, { target: { value: '-300' } });
  fireEvent.blur(input);

  expect(
    screen.getByText('Temperature must be above -273.15°C')
  ).toBeInTheDocument();
});

// ❌ Bad: Test implementation details
test('should set hasError state to true', () => {
  const wrapper = mount(<TemperatureInput />);
  wrapper.find('input').simulate('change', { target: { value: '-300' } });
  expect(wrapper.state('hasError')).toBe(true);
});
```

### 3. Effective Mocking

```typescript
// Mock external dependencies
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    pathname: '/experiments',
  }),
}));

// Use MSW for API mocking
import { setupServer } from 'msw/node';
import { rest } from 'msw';

const server = setupServer(
  rest.get('/api/experiments', (req, res, ctx) => {
    return res(ctx.json({ experiments: [] }));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

### 4. Testing Async Operations

```typescript
import { waitFor, findByText } from '@messai/testing';

test('should load experiment data asynchronously', async () => {
  mockFetch({ experiment: createTestExperiment() });

  render(<ExperimentDetails id="exp-123" />);

  // Wait for loading to complete
  expect(screen.getByText('Loading...')).toBeInTheDocument();

  // Use findBy* for async elements
  const experimentName = await screen.findByText('Test Experiment');
  expect(experimentName).toBeInTheDocument();

  // Or use waitFor for complex conditions
  await waitFor(() => {
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    expect(screen.getByTestId('experiment-chart')).toBeInTheDocument();
  });
});
```

## Using MESSAI Testing Utilities

### Custom Matchers

```typescript
import { setupCustomMatchers } from '@messai/testing';

// Setup in test file or setup
setupCustomMatchers();

// Use bioelectrochemical-specific matchers
test('should validate MFC performance data', () => {
  const data = {
    powerDensity: 1.5,
    currentDensity: 5.2,
    voltage: 0.65,
    efficiency: 0.85,
  };

  expect(data.powerDensity).toBeValidPowerDensity();
  expect(data.currentDensity).toBeValidCurrentDensity();
  expect(data.voltage).toBeValidVoltage();
  expect(data.efficiency).toBeValidEfficiency();
});
```

### Test Fixtures

```typescript
import {
  researchPaperFixtures,
  experimentFixtures,
  createTestPaper,
  createTestExperiment,
} from '@messai/testing';

test('should display research paper correctly', () => {
  // Use predefined fixtures
  const paper = researchPaperFixtures.mfcPaper;
  render(<PaperCard paper={paper} />);

  // Or create custom test data
  const customPaper = createTestPaper({
    title: 'My Custom Paper',
    powerDensity: 2.1,
  });
  render(<PaperCard paper={customPaper} />);
});
```

### Mock Data Generation

```typescript
import { testUtils } from '@messai/testing';

test('should handle large performance datasets', () => {
  // Generate realistic performance data
  const performanceData = testUtils.generateMockPerformanceData(100);

  render(<PerformanceChart data={performanceData} />);

  // Validate generated data
  performanceData.forEach((point) => {
    testUtils.expectValidBioelectrochemicalData(point);
  });
});
```

## Debugging Tests

### Common Issues & Solutions

1. **Tests fail in CI but pass locally**

   ```typescript
   // Use fake timers for consistency
   beforeEach(() => {
     jest.useFakeTimers();
   });

   afterEach(() => {
     jest.useRealTimers();
   });
   ```

2. **Async operations not completing**

   ```typescript
   // Increase timeout for slow operations
   test('should load large dataset', async () => {
     // ... test code
   }, 10000); // 10 second timeout

   // Or use waitFor with custom timeout
   await waitFor(
     () => {
       expect(screen.getByText('Data loaded')).toBeInTheDocument();
     },
     { timeout: 5000 }
   );
   ```

3. **Memory leaks in tests**
   ```typescript
   afterEach(() => {
     cleanup(); // React Testing Library cleanup
     jest.clearAllMocks();
   });
   ```

### Debug Commands

```bash
# Run single test with debug output
pnpm test --verbose health.spec.ts

# Debug with Node inspector
node --inspect-brk node_modules/.bin/jest --runInBand health.spec.ts

# Playwright debug mode
pnpm nx e2e web-e2e --debug
```

## Performance Testing

### Component Performance

```typescript
test('should render large lists efficiently', () => {
  const largeDataset = Array.from({ length: 1000 }, (_, i) =>
    createTestExperiment({ id: `exp-${i}` })
  );

  const start = performance.now();
  render(<ExperimentList experiments={largeDataset} />);
  const end = performance.now();

  expect(end - start).toBeLessThan(100); // Should render in <100ms
});
```

### API Performance

```typescript
test('should respond to experiment queries quickly', async () => {
  const start = performance.now();
  const response = await fetch('/api/experiments');
  const end = performance.now();

  expect(response.status).toBe(200);
  expect(end - start).toBeLessThan(200); // <200ms response time
});
```

## Coverage Goals & Monitoring

### Coverage Thresholds

- **Functions**: 80%
- **Lines**: 80%
- **Branches**: 70%
- **Statements**: 80%

### Checking Coverage

```bash
# Generate coverage report
pnpm test --coverage

# View HTML report
open coverage/index.html

# Check specific file coverage
pnpm test --coverage --collectCoverageFrom="src/components/chart.tsx"
```

### Improving Coverage

1. **Identify uncovered code**:

   ```bash
   pnpm test --coverage --verbose
   ```

2. **Add tests for uncovered branches**:

   ```typescript
   // Test both success and error cases
   test('should handle API success', async () => {
     /* ... */
   });
   test('should handle API error', async () => {
     /* ... */
   });

   // Test all conditional branches
   test('should show loading when pending', () => {
     /* ... */
   });
   test('should show data when loaded', () => {
     /* ... */
   });
   test('should show error when failed', () => {
     /* ... */
   });
   ```

## Team Workflow

### Before Committing

1. **Run tests locally**: `pnpm test`
2. **Check coverage**: `pnpm test --coverage`
3. **Fix any failures**: Address failing tests before push

### Code Review Checklist

- [ ] New code has corresponding tests
- [ ] Tests are descriptive and user-focused
- [ ] Mocks are realistic and minimal
- [ ] Coverage thresholds are maintained
- [ ] Tests follow established patterns

### CI/CD Integration

Our tests run automatically on:

- **Every push** to feature branches
- **Pull requests** to main/develop
- **Scheduled runs** for regression testing

---

## Quick Reference

### Essential Testing Commands

```bash
pnpm test                    # Run all tests
pnpm test --watch           # Watch mode for development
pnpm test --coverage        # Generate coverage report
pnpm test health.spec.ts    # Run specific test file
nx test web                 # Test specific app/library
pnpm affected:test          # Test only affected code
```

### Common Test Patterns

```typescript
// Component test
render(<Component />);
expect(screen.getByText('Hello')).toBeInTheDocument();

// User interaction
fireEvent.click(screen.getByRole('button'));
fireEvent.change(screen.getByLabelText('Input'), { target: { value: 'test' } });

// Async waiting
await screen.findByText('Loaded');
await waitFor(() => expect(element).toBeVisible());

// Custom matchers
expect(1.5).toBeValidPowerDensity();
expect(data).toHaveValidExperimentStructure();
```

For more detailed information, see the
[Testing Overview](../testing/overview.md).
