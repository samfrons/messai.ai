# Testing Overview - MESSAI.AI

This document provides a comprehensive overview of the testing strategy and
infrastructure for the MESSAI.AI platform.

## Testing Philosophy

Our testing approach is designed to ensure the reliability, performance, and
security of the bioelectrochemical systems research platform. We follow the
testing pyramid principle:

- **80% Unit Tests**: Fast, isolated tests for individual components and
  functions
- **15% Integration Tests**: Testing interactions between components and APIs
- **5% E2E Tests**: Critical user journeys and cross-browser compatibility

## Testing Stack

### Core Testing Tools

- **Jest**: JavaScript testing framework with coverage reporting
- **React Testing Library**: Component testing with user-centric approach
- **Playwright**: End-to-end testing across multiple browsers
- **MSW (Mock Service Worker)**: API mocking for consistent test environments

### Custom Testing Library

We've created `@messai/testing` - a shared testing utilities library that
provides:

- Custom render functions with providers
- Bioelectrochemical-specific matchers
- Mock data fixtures for research papers, experiments, and materials
- Common testing utilities and helpers

## Test Categories

### 1. Unit Tests

**Purpose**: Test individual components, functions, and modules in isolation.

**Location**: Co-located with source files (`*.spec.ts`, `*.spec.tsx`)

**Examples**:

```typescript
// Component testing
import { render, screen } from '@messai/testing';
import { PerformanceChart } from './performance-chart';

test('should display power density correctly', () => {
  const data = { powerDensity: 1.5, currentDensity: 5.2 };
  render(<PerformanceChart data={data} />);

  expect(screen.getByText('1.5 W/m²')).toBeInTheDocument();
});

// API route testing
import { GET } from './api/experiments/route';

test('should return experiments list', async () => {
  const response = await GET();
  const data = await response.json();

  expect(response.status).toBe(200);
  expect(data).toHaveProperty('experiments');
});
```

### 2. Integration Tests

**Purpose**: Test interactions between multiple components, API endpoints, and
external services.

**Location**: `src/__tests__/integration/`

**Examples**:

```typescript
// API integration
test('should create and retrieve experiment', async () => {
  const experiment = await createExperiment(mockExperimentData);
  const retrieved = await getExperiment(experiment.id);

  expect(retrieved).toHaveValidExperimentStructure();
  expect(retrieved.id).toBe(experiment.id);
});

// Component integration
test('should update chart when experiment data changes', async () => {
  const { rerender } = render(<ExperimentDashboard experiment={experiment1} />);

  rerender(<ExperimentDashboard experiment={experiment2} />);

  await waitFor(() => {
    expect(screen.getByTestId('power-chart')).toHaveAttribute(
      'data-updated',
      'true'
    );
  });
});
```

### 3. End-to-End Tests

**Purpose**: Test complete user workflows and critical paths.

**Location**: `apps/web-e2e/src/`

**Examples**:

```typescript
// User journey testing
test('researcher can create and run experiment', async ({ page }) => {
  await page.goto('/experiments');
  await page.click('[data-testid="create-experiment"]');

  await page.fill('[data-testid="experiment-name"]', 'Test MFC');
  await page.selectOption('[data-testid="reactor-type"]', 'single-chamber');

  await page.click('[data-testid="save-experiment"]');

  await expect(page.locator('[data-testid="experiment-status"]')).toContainText(
    'Created'
  );
});
```

## Custom Matchers

We've developed bioelectrochemical-specific Jest matchers for domain validation:

```typescript
// Bioelectrochemical validation
expect(1.5).toBeValidPowerDensity(); // 0-100 W/m²
expect(5.2).toBeValidCurrentDensity(); // 0-1000 A/m²
expect(0.65).toBeValidVoltage(); // 0-2.0 V
expect(0.85).toBeValidEfficiency(); // 0-1.0
expect(7.0).toBeValidPH(); // 0-14
expect(25).toBeValidTemperature(); // -273.15-100 °C

// API response validation
expect(response).toHaveValidApiResponse();
expect(experiment).toHaveValidExperimentStructure();
```

## Test Data & Fixtures

### Research Paper Fixtures

```typescript
import { researchPaperFixtures, createTestPaper } from '@messai/testing';

// Use predefined fixtures
const mfcPaper = researchPaperFixtures.mfcPaper;

// Create custom test data
const customPaper = createTestPaper({
  title: 'Custom MFC Study',
  powerDensity: 2.1,
});
```

### Experiment Fixtures

```typescript
import { experimentFixtures, createTestExperiment } from '@messai/testing';

const baselineExperiment = experimentFixtures.mfcExperiment;
const customExperiment = createTestExperiment({
  status: 'running',
  configuration: { temperature: 30 },
});
```

## Coverage Requirements

### Coverage Thresholds

- **Lines**: 80% minimum
- **Functions**: 80% minimum
- **Branches**: 70% minimum
- **Statements**: 80% minimum

### Coverage Reports

- **HTML Report**: `coverage/index.html` (local development)
- **LCOV**: `coverage/lcov.info` (CI integration)
- **JSON**: `coverage/coverage-final.json` (programmatic access)

## Running Tests

### Development Commands

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage

# Run specific test file
pnpm test health.spec.ts

# Run tests for specific app/library
nx test web
nx test testing

# Run affected tests only
pnpm affected:test
```

### CI/CD Commands

```bash
# Full test suite (CI)
pnpm test --coverage --watchAll=false

# E2E tests
pnpm nx e2e web-e2e

# Security tests
pnpm audit
```

## Test Environment Configuration

### Jest Configuration

- **Setup Files**: Global test setup and mocks
- **Test Environment**: jsdom for React components, node for API tests
- **Transform**: SWC for fast TypeScript compilation
- **Module Mapping**: Path aliases for clean imports

### Environment Variables

```bash
# Test environment
NODE_ENV=test
CI=true

# Mock external services
MOCK_API=true
DISABLE_ANALYTICS=true
```

## Best Practices

### Writing Tests

1. **Arrange, Act, Assert**: Clear test structure
2. **User-Centric**: Test behavior, not implementation
3. **Isolated**: Each test should be independent
4. **Descriptive**: Test names should describe expected behavior
5. **Fast**: Unit tests should run in milliseconds

### Component Testing

```typescript
// ✅ Good: Test user behavior
test('should display error when invalid data is entered', () => {
  render(<ExperimentForm />);
  fireEvent.change(screen.getByLabelText('Temperature'), {
    target: { value: '-300' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Save' }));

  expect(
    screen.getByText('Temperature must be above -273.15°C')
  ).toBeInTheDocument();
});

// ❌ Bad: Test implementation details
test('should call setError when validation fails', () => {
  const setError = jest.fn();
  render(<ExperimentForm setError={setError} />);
  // ... implementation-focused test
});
```

### API Testing

```typescript
// ✅ Good: Test complete request/response cycle
test('should create experiment with valid data', async () => {
  const experimentData = createTestExperiment();

  const response = await POST(
    new Request('http://localhost/api/experiments', {
      method: 'POST',
      body: JSON.stringify(experimentData),
    })
  );

  expect(response.status).toBe(201);
  const data = await response.json();
  expect(data).toHaveValidExperimentStructure();
});
```

### Mock Guidelines

1. **Mock External Dependencies**: APIs, third-party libraries
2. **Don't Mock What You're Testing**: Keep mocks minimal
3. **Use Realistic Data**: Leverage fixtures for consistency
4. **Reset Mocks**: Clean state between tests

## Debugging Tests

### Common Issues

1. **Async Operations**: Use `waitFor`, `findBy*` queries
2. **Timer Issues**: Mock timers with `jest.useFakeTimers()`
3. **Network Requests**: Use MSW for API mocking
4. **Component State**: Test user interactions, not internal state

### Debug Commands

```bash
# Run single test in debug mode
node --inspect-brk node_modules/.bin/jest --runInBand health.spec.ts

# Visual debugging with Playwright
pnpm nx e2e web-e2e --debug

# Coverage debugging
pnpm test:coverage --verbose
```

## Performance Testing

### Metrics to Monitor

- **Component Render Time**: < 16ms for 60fps
- **API Response Time**: < 200ms for user-facing endpoints
- **Bundle Size**: Monitor JavaScript bundle growth
- **Memory Usage**: Detect memory leaks in long-running tests

### Performance Tests

```typescript
// Performance testing example
test('should render large dataset efficiently', async () => {
  const largeDataset = generateMockPerformanceData(1000);

  const start = performance.now();
  render(<PerformanceChart data={largeDataset} />);
  const end = performance.now();

  expect(end - start).toBeLessThan(100); // 100ms threshold
});
```

## Integration with CI/CD

Our GitHub Actions workflow automatically:

1. **Runs all tests** on every pull request
2. **Generates coverage reports** and uploads to Codecov
3. **Runs E2E tests** against built applications
4. **Performs security scans** on dependencies
5. **Validates test quality** with coverage thresholds

## Continuous Improvement

### Metrics Tracking

- **Test Coverage**: Aim for >80% across all categories
- **Test Performance**: Monitor test execution time
- **Flaky Tests**: Identify and fix unreliable tests
- **Test Maintenance**: Regular review and refactoring

### Regular Reviews

- **Monthly**: Test coverage and performance review
- **Quarterly**: Testing strategy and tool evaluation
- **Per Feature**: Test completeness for new functionality

---

For specific testing guides, see:

- [Unit Testing Guide](./unit-testing.md)
- [Integration Testing Guide](./integration-testing.md)
- [E2E Testing Guide](./e2e-testing.md)
- [Coverage Reports](./coverage-reports.md)
